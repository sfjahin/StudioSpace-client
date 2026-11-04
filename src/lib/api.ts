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
  hostName?: string;
  hostEmail?: string;
};

export type Studio = StudioInput & {
  id: string;
  createdAt: string;
};

/** Field-level validation errors keyed by studio field name. */
export type FieldErrors = Partial<Record<keyof StudioInput, string>>;

export class ApiError extends Error {
  status: number;
  fields: FieldErrors;

  constructor(message: string, status: number, fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type ErrorBody = { message?: string; fields?: FieldErrors };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "We couldn't reach the StudioSpace server. Make sure it's running and try again.",
      0
    );
  }

  const body = (await res.json().catch(() => null)) as (T & ErrorBody) | null;

  if (!res.ok) {
    throw new ApiError(
      body?.message ?? "Something went wrong. Please try again.",
      res.status,
      body?.fields ?? {}
    );
  }

  return body as T;
}

export function createStudio(input: StudioInput): Promise<Studio> {
  return request<Studio>("/add-studio", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listStudios(): Promise<Studio[]> {
  const data = await request<{ studios: Studio[] }>("/studios");
  return data.studios ?? [];
}

export function getStudio(id: string): Promise<Studio> {
  return request<Studio>(`/studios/${encodeURIComponent(id)}`);
}

/** Replace an existing listing's editable fields (host info stays untouched). */
export function updateStudio(id: string, input: StudioInput): Promise<Studio> {
  return request<Studio>(`/studios/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
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
