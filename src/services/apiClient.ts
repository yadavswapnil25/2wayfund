/** Shared fetch wrapper for the 2wayfund-API Laravel backend.
 * Every response follows the `{ status, message, data, errors }` envelope
 * documented in docs/react-standards.md §4; this is the one place that
 * unwraps it, so callers only ever see `data` or a thrown ApiError. */

interface ApiEnvelope<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]> | null;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const API_URL = import.meta.env.VITE_API_URL;
const CLIENT_KEY = import.meta.env.VITE_CLIENT_API_KEY;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Client-Key": CLIENT_KEY,
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, null);
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON response (e.g. a raw 500 page) — fall through to the generic error below.
  }

  if (!response.ok || !body || body.status === "error") {
    throw new ApiError(body?.message ?? "Something went wrong. Please try again.", response.status, body?.errors ?? null);
  }

  return body.data as T;
}
