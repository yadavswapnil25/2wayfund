import { apiFetch } from "./apiClient";

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

/** Verifies a referral code against the backend, which owns the single
 * authoritative mapping of code to referring party (partner arrangement
 * or customer account). Throws ApiError with a 404 status when the code
 * has never been issued. */
export async function verifyReferral(code: string): Promise<VerifiedReferral> {
  const dto = await apiFetch<ReferralDto>(`/referrals/${encodeURIComponent(code)}`);

  return { code: dto.code, referrer: dto.referrer };
}
