import { ObjectId } from "mongodb";
import { io } from "next/cache";
import {
  CATEGORIES,
  type FieldErrors,
  type Studio,
  type StudioInput,
} from "@/lib/api";
import { studiosCollection } from "@/lib/server/db";

export const OBJECT_ID = /^[0-9a-f]{24}$/i;

export type MutationFailure = {
  ok: false;
  status: number;
  message: string;
  fields?: Record<string, string | undefined>;
};

export type MutationSuccess<T> = { ok: true; data: T };

export type MutationResult<T> = MutationSuccess<T> | MutationFailure;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number.parseFloat(String(value));
}

export function validateStudioInput(body: unknown) {
  const input = (body ?? {}) as Record<string, unknown>;
  const fields: FieldErrors = {};

  const title = asString(input.title);
  const category = asString(input.category);
  const address = asString(input.address);
  const imageUrl = asString(input.imageUrl);
  const overview = asString(input.overview);
  const hourlyRate = asNumber(input.hourlyRate);
  const securityDeposit = asNumber(input.securityDeposit);
  const maxCapacity = asNumber(input.maxCapacity);
  const amenities = Array.isArray(input.amenities)
    ? input.amenities
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!title) fields.title = "Give your studio a name.";
  else if (title.length > 60) fields.title = "Keep the name under 60 characters.";

  if (!category) fields.category = "Choose a category.";
  else if (!CATEGORIES.includes(category)) fields.category = "Choose a valid category.";

  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
    fields.hourlyRate = "Enter an hourly rate above $0.";
  }

  if (!Number.isFinite(securityDeposit) || securityDeposit < 0) {
    fields.securityDeposit = "Enter a deposit (use 0 for none).";
  }

  if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
    fields.maxCapacity = "Enter how many people fit.";
  }

  if (!address) fields.address = "Add the studio's address.";

  if (!/^https?:\/\/.+/i.test(imageUrl)) {
    fields.imageUrl = "Paste a full image link starting with http:// or https://.";
  }

  if (overview.length < 40) {
    fields.overview = "Write at least 40 characters about the light, layout and equipment.";
  }

  const value: StudioInput = {
    title,
    category,
    hourlyRate,
    securityDeposit,
    maxCapacity,
    address,
    imageUrl,
    amenities,
    overview,
  };

  return { fields, value };
}

type StudioDocument = Record<string, unknown> & {
  _id: ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  hostName?: string;
  hostEmail?: string;
};

export function toStudio(doc: StudioDocument): Studio {
  const { _id, hostName, hostEmail, ...rest } = doc;
  const out = { id: _id.toString(), ...rest } as Studio & {
    ownerName?: string;
    ownerEmail?: string;
  };

  // Listings created before the rename stored the owner as hostName / hostEmail.
  if (!out.ownerName && typeof hostName === "string") out.ownerName = hostName;
  if (!out.ownerEmail && typeof hostEmail === "string") out.ownerEmail = hostEmail;

  return out;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** List studios for the Explore page and home page (optionally filtered). */
export async function listStudiosForApi(
  opts: { ownerEmail?: string; limit?: number; category?: string } = {}
): Promise<Studio[]> {
  // Keep MongoDB reads out of the static shell (the driver calls `new Date()`
  // internally, which Next.js flags during prerendering).
  await io();

  const filter: Record<string, unknown> = {};

  if (opts.ownerEmail) {
    filter.ownerEmail = { $regex: `^${escapeRegex(opts.ownerEmail)}$`, $options: "i" };
  }
  if (opts.category) {
    filter.category = opts.category;
  }

  let cursor = studiosCollection().find(filter).sort({ createdAt: -1 });
  if (opts.limit && Number.isFinite(opts.limit) && opts.limit > 0) {
    cursor = cursor.limit(Math.trunc(opts.limit));
  }

  const docs = await cursor.toArray();
  return docs.map((doc) => toStudio(doc as StudioDocument));
}

/** Load one studio by its Mongo id, or null when it doesn't exist. */
export async function getStudioForApi(id: string): Promise<Studio | null> {
  if (!OBJECT_ID.test(id)) return null;
  await io();
  const doc = await studiosCollection().findOne({ _id: new ObjectId(id) });
  return doc ? toStudio(doc as StudioDocument) : null;
}

export async function createStudioForUser(
  body: unknown,
  owner: { name: string; email: string }
): Promise<MutationResult<Studio>> {
  const { fields, value } = validateStudioInput(body);
  if (Object.keys(fields).length > 0) {
    return { ok: false, status: 400, message: "Some fields need attention.", fields };
  }

  try {
    const doc = {
      ...value,
      // Always trust the signed-in identity, never owner fields from the client.
      ownerName: owner.name,
      ownerEmail: owner.email,
      createdAt: new Date(),
    };
    const result = await studiosCollection().insertOne(doc);
    return { ok: true, data: toStudio({ _id: result.insertedId, ...doc }) };
  } catch (err) {
    console.error("Failed to insert studio:", err);
    return { ok: false, status: 500, message: "We couldn't save your studio. Please try again." };
  }
}

export async function updateStudioForUser(
  id: string,
  body: unknown,
  owner: { name: string; email: string }
): Promise<MutationResult<Studio>> {
  if (!OBJECT_ID.test(id)) {
    return { ok: false, status: 404, message: "Studio not found." };
  }

  const { fields, value } = validateStudioInput(body);
  if (Object.keys(fields).length > 0) {
    return { ok: false, status: 400, message: "Some fields need attention.", fields };
  }

  try {
    const doc = (await studiosCollection().findOne({
      _id: new ObjectId(id),
    })) as StudioDocument | null;

    if (!doc) {
      return { ok: false, status: 404, message: "Studio not found." };
    }

    const ownerEmail = String(doc.ownerEmail ?? doc.hostEmail ?? "");
    if (!ownerEmail || ownerEmail.toLowerCase() !== owner.email.toLowerCase()) {
      return {
        ok: false,
        status: 403,
        message: "Only the host who created this listing can edit it.",
      };
    }

    const updatedAt = new Date();
    await studiosCollection().updateOne({ _id: doc._id }, { $set: { ...value, updatedAt } });

    return {
      ok: true,
      data: toStudio({ ...doc, ...value, updatedAt }),
    };
  } catch (err) {
    console.error("Failed to update studio:", err);
    return { ok: false, status: 500, message: "We couldn't update your studio. Please try again." };
  }
}

export async function deleteStudioForUser(
  id: string,
  email: string
): Promise<MutationResult<{ id: string; deleted: true }>> {
  if (!OBJECT_ID.test(id)) {
    return { ok: false, status: 404, message: "Studio not found." };
  }

  try {
    const doc = (await studiosCollection().findOne({
      _id: new ObjectId(id),
    })) as StudioDocument | null;

    if (!doc) {
      return { ok: false, status: 404, message: "Studio not found." };
    }

    const ownerEmail = String(doc.ownerEmail ?? doc.hostEmail ?? "");
    if (!ownerEmail || ownerEmail.toLowerCase() !== email.toLowerCase()) {
      return {
        ok: false,
        status: 403,
        message: "Only the host who created this listing can delete it.",
      };
    }

    const result = await studiosCollection().deleteOne({ _id: doc._id });
    if (result.deletedCount === 0) {
      return { ok: false, status: 404, message: "Studio not found." };
    }

    return { ok: true, data: { id, deleted: true } };
  } catch (err) {
    console.error("Failed to delete studio:", err);
    return { ok: false, status: 500, message: "We couldn't delete that studio. Please try again." };
  }
}
