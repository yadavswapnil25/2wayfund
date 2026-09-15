import { apiFetch, ApiError } from "./apiClient";

interface ReferralDto {
  code: string;
  referrer: string;
}

export interface VerifiedReferral {
  code: string;
  /** How the referring party is described to the applicant. A referral
   * code belonging to a customer account resolves to a generic label —
   * the backend never discloses the referring customer's name here. */
  referrer: string;
}

export type ReferralLookupFailureReason = "invalid" | "expired" | "used" | "unknown";

/** ApiError carries only status/message/fieldErrors, so the specific
 * reason a code didn't verify is recovered from the HTTP status the
 * backend deliberately chose for each case (App\Http\Controllers\Api\
 * ReferralController::show). */
export function referralLookupFailureReason(err: unknown): ReferralLookupFailureReason {
  if (!(err instanceof ApiError)) return "unknown";
  if (err.status === 404) return "invalid";
  if (err.status === 410) return "expired";
  if (err.status === 409) return "used";
  return "unknown";
}

/** Verifies a referral code against the backend, which owns the single
 * authoritative mapping of code to referring party (partner arrangement
 * or customer account) and its current status. Read-only — never marks
 * a code used, so retyping or refreshing can't burn someone else's
 * single-use code. Throws ApiError on anything other than an active,
 * usable code — see referralLookupFailureReason() to tell why. */
export async function verifyReferral(code: string): Promise<VerifiedReferral> {
  const dto = await apiFetch<ReferralDto>(`/referrals/${encodeURIComponent(code)}`);

  return { code: dto.code, referrer: dto.referrer };
}

export type ReferralCodeStatus = "active" | "expired" | "used";

export interface ReferralCode {
  id: number;
  code: string;
  status: ReferralCodeStatus;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

interface ReferralCodeDto {
  id: number;
  code: string;
  status: ReferralCodeStatus;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

function mapReferralCode(dto: ReferralCodeDto): ReferralCode {
  return { id: dto.id, code: dto.code, status: dto.status, createdAt: dto.created_at, expiresAt: dto.expires_at, usedAt: dto.used_at };
}

export interface ReferralCodeHistory {
  items: ReferralCode[];
  successfulReferrals: number;
}

/** Generates a new referral code for the signed-in account — customer or
 * staff, the program isn't role-restricted. Each call issues a fresh
 * code; any earlier one the account holds is untouched (still valid
 * until it expires or is redeemed, still visible in history). */
export async function generateReferralCode(token: string): Promise<ReferralCode> {
  const dto = await apiFetch<ReferralCodeDto>("/me/referral-codes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapReferralCode(dto);
}

/** The signed-in account's own referral code history, newest first, plus
 * how many resulted in an approved account ("successful referrals") —
 * a used-but-not-yet-approved code doesn't count. */
export async function listMyReferralCodes(token: string, signal?: AbortSignal): Promise<ReferralCodeHistory> {
  const dto = await apiFetch<{ items: ReferralCodeDto[]; successful_referrals: number }>("/me/referral-codes", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return { items: dto.items.map(mapReferralCode), successfulReferrals: dto.successful_referrals };
}
