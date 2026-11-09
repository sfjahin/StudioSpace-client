export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const SERVICE_FEE_RATE = 0.1;

export const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
  "Dance Studio",
  "Art & Making",
  "Other",
];

export type StudioInput = {
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  address: string;
  imageUrl: string;
  amenities: string[];
  overview: string;
  /** Set once, on create. The server never lets an update change the owner. */
  ownerName?: string;
  ownerEmail?: string;
};

export type Studio = StudioInput & {
  id: string;
  createdAt: string;
};

/** Field-level validation errors keyed by studio field name. */
export type FieldErrors = Partial<Record<keyof StudioInput, string>>;

/* -------------------------------- Bookings -------------------------------- */

export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingInput = {
  studioId: string;
  userName: string;
  userEmail: string;
  /** YYYY-MM-DD */
  date: string;
  /** e.g. "10:00 AM" */
  startTime: string;
  endTime: string;
  crewSize: number;
  note?: string;
};

export type Booking = {
  id: string;
  studioId: string;
  /** Snapshot of the studio at booking time, so the booking still reads well if the listing changes. */
  studioTitle: string;
  studioImage: string;
  studioAddress: string;
  studioCategory: string;
  ownerEmail: string;
  userName: string;
  userEmail: string;
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
  status: BookingStatus;
  createdAt: string;
};

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type ErrorBody = { message?: string; fields?: Record<string, string> };

/** Mutations under /api/* live in this Next app; everything else is the Express API. */
function isLocalApiPath(path: string) {
  return path.startsWith("/api/");
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  let res: Response;

  try {
    res = await fetch(isLocalApiPath(path) ? path : `${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
      credentials: isLocalApiPath(path) ? "same-origin" : "omit",
    });
  } catch {
    throw new ApiError(
      "We couldn't reach the StudioSpace server. Make sure it's running and try again.",
      0
    );
  }

  // A page reload or OAuth redirect can briefly leave the session cookie without
  // the JWT. Exchange it once, then retry the protected mutation.
  if (res.status === 401 && isLocalApiPath(path) && !retried) {
    const synced = await fetch("/api/auth/jwt", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((sync) => sync.ok)
      .catch(() => false);

    if (synced) return request<T>(path, init, true);
  }

  // Read as text first so a non-JSON error page (an old/misconfigured API
  // server, a proxy, Express's default 404, …) still yields a useful message
  // instead of the generic "Something went wrong".
  const raw = await res.text().catch(() => "");
  let body: (T & ErrorBody) | null = null;
  try {
    body = raw ? (JSON.parse(raw) as T & ErrorBody) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const fallback =
      res.status === 404
        ? `The API server did not recognise ${path}. Make sure the latest StudioSpace API server is running.`
        : "Something went wrong. Please try again.";
    throw new ApiError(body?.message ?? fallback, res.status, body?.fields ?? {});
  }

  return body as T;
}

export function createStudio(input: StudioInput): Promise<Studio> {
  return request<Studio>("/api/studios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** List studios. Pass `ownerEmail` to get only that owner's listings. */
export async function listStudios(
  opts: { ownerEmail?: string; limit?: number; category?: string } = {}
): Promise<Studio[]> {
  const qs = new URLSearchParams();
  if (opts.ownerEmail) qs.set("ownerEmail", opts.ownerEmail);
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.category) qs.set("category", opts.category);
  const query = qs.size ? `?${qs}` : "";
  const data = await request<{ studios: Studio[] }>(`/api/studios${query}`);
  return data.studios ?? [];
}

export function getStudio(id: string): Promise<Studio> {
  return request<Studio>(`/api/studios/${encodeURIComponent(id)}`);
}

/** Replace an existing listing's editable fields (host info stays untouched). */
export function updateStudio(id: string, input: StudioInput): Promise<Studio> {
  return request<Studio>(`/api/studios/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

/** Permanently delete a listing (owner only, JWT-protected). */
export function deleteStudio(id: string): Promise<{ id: string; deleted: boolean }> {
  return request<{ id: string; deleted: boolean }>(
    `/api/studios/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

/** Create a booking (JWT-protected). The server prices it and starts it as "Pending". */
export function createBooking(input: BookingInput): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Every booking made by this user, newest first. */
export async function listMyBookings(email: string): Promise<Booking[]> {
  const data = await request<{ bookings: Booking[] }>(
    `/api/bookings?email=${encodeURIComponent(email)}`
  );
  return data.bookings ?? [];
}

/** Cancel one of the user's own bookings (only allowed while it is Pending). */
export function cancelBooking(id: string, userEmail: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ userEmail }),
  });
}

/** Bookings other people made for this host's studios. */
export async function listHostBookings(ownerEmail: string): Promise<Booking[]> {
  const data = await request<{ bookings: Booking[] }>(
    `/api/bookings?ownerEmail=${encodeURIComponent(ownerEmail)}`
  );
  return data.bookings ?? [];
}

/** Host moves a booking along: Pending -> Confirmed -> Completed, or Cancelled. */
export function updateBookingStatus(
  id: string,
  ownerEmail: string,
  status: BookingStatus
): Promise<Booking> {
  return request<Booking>(`/api/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ ownerEmail, status }),
  });
}

export function priceBreakdown(hourlyRate: number, hours = 4) {
  const subtotal = hourlyRate * hours;
  const fee = subtotal * SERVICE_FEE_RATE;
  return { hours, subtotal, fee, total: subtotal + fee };
}

export function formatMoney(n: number) {
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}

/** "2026-11-09" -> "Mon, Nov 9, 2026" (parsed as a local date so it never shifts a day). */
export function formatBookingDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
