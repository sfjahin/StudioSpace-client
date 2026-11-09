import { ObjectId } from "mongodb";
import { io } from "next/cache";
import {
  BOOKING_STATUSES,
  SERVICE_FEE_RATE,
  type Booking,
  type BookingStatus,
  type Studio,
} from "@/lib/api";
import { bookingsCollection, studiosCollection } from "@/lib/server/db";
import { OBJECT_ID, toStudio, type MutationResult } from "@/lib/server/studios";

const MIN_HOURS = 2;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^(0[1-9]|1[0-2]):[0-5]\d (AM|PM)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const round2 = (n: number) => Math.round(n * 100) / 100;

function toMinutes(time: string) {
  const [hm, period] = time.split(" ");
  const [h, m] = hm.split(":").map(Number);
  const hour24 = period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h;
  return hour24 * 60 + m;
}

type BookingValidation = {
  fields: Record<string, string>;
  value: {
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    crewSize: number;
    note: string;
    hourlyRate: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  };
};

function validateBookingInput(body: Record<string, unknown>, studio: Studio): BookingValidation {
  const fields: Record<string, string> = {};
  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const date = str(body.date);
  const startTime = str(body.startTime);
  const endTime = str(body.endTime);
  const note = str(body.note);
  const crewSize = Number(body.crewSize);

  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    fields.date = "Pick a date for your session.";
  }

  let hours = 0;
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    fields.startTime = "Choose a start and end time.";
  } else {
    const raw = (toMinutes(endTime) - toMinutes(startTime)) / 60;
    if (raw <= 0) fields.endTime = "End time must be after the start time.";
    hours = Math.max(raw, MIN_HOURS);
  }

  if (!Number.isInteger(crewSize) || crewSize < 1 || crewSize > studio.maxCapacity) {
    fields.crewSize = `Crew size must be between 1 and ${studio.maxCapacity}.`;
  }

  if (note.length > 500) fields.note = "Keep the note under 500 characters.";

  const subtotal = round2(studio.hourlyRate * hours);
  const serviceFee = round2(subtotal * SERVICE_FEE_RATE);

  return {
    fields,
    value: {
      date,
      startTime,
      endTime,
      hours,
      crewSize,
      note,
      hourlyRate: studio.hourlyRate,
      subtotal,
      serviceFee,
      total: round2(subtotal + serviceFee),
    },
  };
}

type BookingDocument = Record<string, unknown> & { _id: ObjectId };

function toBooking(doc: BookingDocument): Booking {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest } as Booking;
}

function slotTakenMessage(booking: Record<string, unknown>) {
  return `This studio is already booked from ${String(booking.startTime)} to ${String(
    booking.endTime
  )} on that date. Please pick a different time.`;
}

/**
 * Confirmed-only overlap check. Two ranges overlap when each starts before the
 * other ends: [start, end) against [existing.start, existing.end).
 */
export async function findConfirmedOverlap(args: {
  studioId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const start = toMinutes(args.startTime);
  const end = toMinutes(args.endTime);

  const sameDay = await bookingsCollection()
    .find({ studioId: args.studioId, date: args.date, status: "Confirmed" })
    .toArray();

  return (
    sameDay.find(
      (booking) =>
        start < toMinutes(String(booking.endTime)) &&
        toMinutes(String(booking.startTime)) < end
    ) ?? null
  );
}

export async function createBookingForUser(
  body: unknown,
  user: { id: string; name: string; email: string }
): Promise<MutationResult<Booking>> {
  const input = (body ?? {}) as Record<string, unknown>;
  const studioId = typeof input.studioId === "string" ? input.studioId.trim() : "";

  if (!OBJECT_ID.test(studioId)) {
    return { ok: false, status: 404, message: "Studio not found." };
  }

  try {
    const studioDoc = await studiosCollection().findOne({ _id: new ObjectId(studioId) });
    if (!studioDoc) {
      return { ok: false, status: 404, message: "Studio not found." };
    }

    const studio = toStudio(studioDoc as Parameters<typeof toStudio>[0]);
    const { fields, value } = validateBookingInput(input, studio);

    if (!EMAIL_RE.test(user.email)) {
      fields.userEmail = "Your account email is not valid. Please sign in again.";
    }
    if (!user.name.trim()) {
      fields.userName = "Tell the host who is booking.";
    }

    if (Object.keys(fields).length > 0) {
      return { ok: false, status: 400, message: "Some fields need attention.", fields };
    }

    const clash = await findConfirmedOverlap({ studioId, ...value });
    if (clash) {
      return {
        ok: false,
        status: 409,
        message: slotTakenMessage(clash),
        fields: { startTime: "That time slot is taken." },
      };
    }

    const doc = {
      studioId,
      studioTitle: studio.title,
      studioImage: studio.imageUrl,
      studioAddress: studio.address,
      studioCategory: studio.category,
      ownerEmail: studio.ownerEmail ?? "",
      // Identity comes from the JWT, not from the request body.
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      ...value,
      status: "Pending" as const,
      createdAt: new Date(),
    };

    const result = await bookingsCollection().insertOne(doc);
    return { ok: true, data: toBooking({ _id: result.insertedId, ...doc }) };
  } catch (err) {
    console.error("Failed to create booking:", err);
    return { ok: false, status: 500, message: "We couldn't save your booking. Please try again." };
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bookings made by a guest (`userEmail`) or for a host's studios (`ownerEmail`), newest first. */
export async function listBookingsForApi(
  opts: { userEmail?: string; ownerEmail?: string } = {}
): Promise<Booking[]> {
  // Keep MongoDB reads out of the static shell, see listStudiosForApi.
  await io();

  const filter: Record<string, unknown> = {};

  if (opts.userEmail) {
    filter.userEmail = { $regex: `^${escapeRegex(opts.userEmail)}$`, $options: "i" };
  }
  if (opts.ownerEmail) {
    filter.ownerEmail = { $regex: `^${escapeRegex(opts.ownerEmail)}$`, $options: "i" };
  }

  const docs = await bookingsCollection().find(filter).sort({ createdAt: -1 }).toArray();
  return docs.map((doc) => toBooking(doc as BookingDocument));
}

/** A guest may cancel their own booking while it is still pending. */
export async function cancelBookingForUser(
  id: string,
  userEmail: string
): Promise<MutationResult<Booking>> {
  if (!OBJECT_ID.test(id)) {
    return { ok: false, status: 404, message: "Booking not found." };
  }

  try {
    const doc = (await bookingsCollection().findOne({
      _id: new ObjectId(id),
    })) as BookingDocument | null;

    if (!doc) {
      return { ok: false, status: 404, message: "Booking not found." };
    }

    if (String(doc.userEmail ?? "").toLowerCase() !== userEmail.toLowerCase()) {
      return {
        ok: false,
        status: 403,
        message: "Only the guest who made this booking can cancel it.",
      };
    }

    if (doc.status !== "Pending") {
      return {
        ok: false,
        status: 409,
        message: "Only pending bookings can be cancelled. Contact the host instead.",
      };
    }

    const updatedAt = new Date();
    await bookingsCollection().updateOne(
      { _id: doc._id },
      { $set: { status: "Cancelled", updatedAt } }
    );

    return { ok: true, data: toBooking({ ...doc, status: "Cancelled", updatedAt }) };
  } catch (err) {
    console.error("Failed to cancel booking:", err);
    return { ok: false, status: 500, message: "We couldn't cancel that booking. Please try again." };
  }
}

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

/** A host moves a booking along its lifecycle; identity comes from the JWT. */
export async function updateBookingStatusForUser(
  id: string,
  ownerEmail: string,
  status: string
): Promise<MutationResult<Booking>> {
  if (!OBJECT_ID.test(id)) {
    return { ok: false, status: 404, message: "Booking not found." };
  }
  if (!BOOKING_STATUSES.includes(status as BookingStatus)) {
    return { ok: false, status: 400, message: "Unknown booking status." };
  }
  const next = status as BookingStatus;

  try {
    const doc = (await bookingsCollection().findOne({
      _id: new ObjectId(id),
    })) as BookingDocument | null;

    if (!doc) {
      return { ok: false, status: 404, message: "Booking not found." };
    }

    const docOwner = String(doc.ownerEmail ?? "");
    if (!docOwner || docOwner.toLowerCase() !== ownerEmail.toLowerCase()) {
      return {
        ok: false,
        status: 403,
        message: "Only the host for this studio can update its bookings.",
      };
    }

    const current = doc.status as BookingStatus;
    if (!STATUS_TRANSITIONS[current]?.includes(next)) {
      return {
        ok: false,
        status: 409,
        message: `A ${String(current).toLowerCase()} booking can't be marked ${next.toLowerCase()}.`,
      };
    }

    if (next === "Confirmed") {
      const clash = await findConfirmedOverlap({
        studioId: String(doc.studioId),
        date: String(doc.date),
        startTime: String(doc.startTime),
        endTime: String(doc.endTime),
      });
      if (clash) {
        return { ok: false, status: 409, message: slotTakenMessage(clash) };
      }
    }

    const updatedAt = new Date();
    await bookingsCollection().updateOne(
      { _id: doc._id },
      { $set: { status: next, updatedAt } }
    );

    return { ok: true, data: toBooking({ ...doc, status: next, updatedAt }) };
  } catch (err) {
    console.error("Failed to update booking status:", err);
    return {
      ok: false,
      status: 500,
      message: "We couldn't update that booking. Please try again.",
    };
  }
}

