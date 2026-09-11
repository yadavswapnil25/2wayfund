import { API_URL, apiFetchBlob, ApiError, CLIENT_KEY } from "./apiClient";

export interface StatementFilters {
  currency?: string;
  status?: string;
  corridor?: string;
  direction?: string;
  from?: string;
  to?: string;
}

function filterQuery(filters: StatementFilters): string {
  const params = new URLSearchParams();
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.status) params.set("status", filters.status);
  if (filters.corridor) params.set("corridor", filters.corridor);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** A real, server-rendered PDF of the customer's own statement (whatever
 * Ledger/Status/Corridor/Direction filters are currently applied) — not
 * a browser print of the page. Triggers a normal browser file download;
 * the object URL is revoked once the click has been dispatched. */
export async function downloadStatement(filters: StatementFilters, token: string): Promise<void> {
  const blob = await apiFetchBlob(`/statements/download${filterQuery(filters)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "2WF-statement.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Emails the same PDF to the address on file for the account — the
 * backend never accepts an address from the request, so this can only
 * ever reach the account holder's own inbox. Returns the backend's own
 * confirmation message (it names the actual address the statement went
 * to), rather than a generic client-side string. */
export async function emailStatement(filters: StatementFilters, token: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/statements/email${filterQuery(filters)}`, {
      method: "POST",
      headers: { Accept: "application/json", "X-Client-Key": CLIENT_KEY, Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, null);
  }

  const body = (await response.json().catch(() => null)) as { status: string; message: string; errors: Record<string, string[]> | null } | null;

  if (!response.ok || !body || body.status === "error") {
    throw new ApiError(body?.message ?? "Something went wrong. Please try again.", response.status, body?.errors ?? null);
  }

  return body.message;
}
