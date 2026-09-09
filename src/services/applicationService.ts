import { formatStamp } from "../lib/dates";
import type { Application, ApplicationAudit } from "../types/data";
import { apiFetch } from "./apiClient";

export interface OpenAccountPayload {
  name: string;
  fatherName: string;
  email: string;
  country: string;
  tier: string;
  purpose: string;
  referral: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
}

interface ApplicationDto {
  ref: string;
  customer_id: number | null;
  name: string;
  father_name: string | null;
  email: string;
  country: string;
  tier: string;
  purpose: string;
  referral: string;
  referrer: string;
  terms_accepted_at: string;
  status: Application["status"];
  kyc_status: string;
  audit: ApplicationAudit[];
  submitted_at: string;
}

/** The backend owns the core application record (submission, referral
 * validation, status, audit trail); the nested KYC document checklist is a
 * separate, purely client-side concern owned by the eKYC page — see
 * src/lib/kyc.ts's freshKyc(). This mapper bridges the two. */
function toApplication(dto: ApplicationDto): Omit<Application, "kyc"> {
  return {
    ref: dto.ref,
    customerId: dto.customer_id != null ? String(dto.customer_id) : undefined,
    name: dto.name,
    fatherName: dto.father_name ?? undefined,
    email: dto.email,
    country: dto.country,
    tier: dto.tier,
    purpose: dto.purpose,
    referral: dto.referral,
    referrer: dto.referrer,
    termsAcceptedAt: formatStamp(new Date(dto.terms_accepted_at)),
    submitted: formatStamp(new Date(dto.submitted_at)).slice(0, 11),
    status: dto.status,
    audit: dto.audit,
  };
}

export async function submitApplication(payload: OpenAccountPayload): Promise<Omit<Application, "kyc">> {
  const dto = await apiFetch<ApplicationDto>("/applications", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      father_name: payload.fatherName || null,
      email: payload.email,
      country: payload.country,
      tier: payload.tier,
      purpose: payload.purpose,
      referral: payload.referral,
      age_confirmed: payload.ageConfirmed,
      terms_accepted: payload.termsAccepted,
    }),
  });

  return toApplication(dto);
}
