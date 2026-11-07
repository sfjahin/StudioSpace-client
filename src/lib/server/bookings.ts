import { ObjectId } from "mongodb";
import { SERVICE_FEE_RATE, type Booking, type Studio } from "@/lib/api";
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
