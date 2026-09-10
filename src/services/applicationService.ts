import { formatStamp } from "../lib/dates";
import type { Application, ApplicationAudit } from "../types/data";
import { apiFetch } from "./apiClient";

/** Everything the Open an Account wizard collects across its five
 * interactive stages (2wayfund-react src/pages/public/OpenAccountPage.tsx),
 * plus the referral and terms carried from the gate and the final review. */
export interface OpenAccountPayload {
  // Stage 1 — Account selection
  country: string;
  tier: string;
  purpose: string;
  // Stage 2 — Application
  name: string;
  fatherName: string;
  dob: string;
  education: string;
  addressCommunication: string;
  addressPermanent: string;
  addressOffice: string;
  mobilePersonal: string;
  mobileOfficial: string;
  landline: string;
  email: string;
  // Stage 3 — Identity & business verification
  organisation: string;
  annualTurnover: string;
  occupation: string;
  annualIncome: string;
  homeStatus: string;
  carStatus: string;
  // Stage 4 — Financial requirement
  crossBorderReason: string;
  crossBorderDetail: string;
  // Referral gate + stage 5 (compliance review) acceptance
  referral: string;
  termsAccepted: boolean;
}

interface ApplicationDto {
  ref: string;
  customer_id: number | null;
  name: string;
  father_name: string | null;
  dob: string | null;
  education: string | null;
  address_communication: string | null;
  address_permanent: string | null;
  address_office: string | null;
  mobile_personal: string | null;
  mobile_official: string | null;
  landline: string | null;
  email: string;
  country: string;
  tier: string;
  purpose: string;
  organisation: string | null;
  annual_turnover: string | null;
  occupation: string | null;
  annual_income: string | null;
  home_status: string | null;
  car_status: string | null;
  cross_border_reason: string | null;
  cross_border_detail: string | null;
  referral: string;
  referrer: string;
  terms_accepted_at: string;
  status: Application["status"];
  kyc_status: string;
  has_photo: boolean;
  has_signature: boolean;
  has_business_certificate: boolean;
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
    dob: dto.dob ?? undefined,
    education: dto.education ?? undefined,
    addressCommunication: dto.address_communication ?? undefined,
    addressPermanent: dto.address_permanent ?? undefined,
    addressOffice: dto.address_office ?? undefined,
    mobilePersonal: dto.mobile_personal ?? undefined,
    mobileOfficial: dto.mobile_official ?? undefined,
    landline: dto.landline ?? undefined,
    email: dto.email,
    country: dto.country,
    tier: dto.tier,
    purpose: dto.purpose,
    organisation: dto.organisation ?? undefined,
    annualTurnover: dto.annual_turnover ?? undefined,
    occupation: dto.occupation ?? undefined,
    annualIncome: dto.annual_income ?? undefined,
    homeStatus: dto.home_status ?? undefined,
    carStatus: dto.car_status ?? undefined,
    crossBorderReason: dto.cross_border_reason ?? undefined,
    crossBorderDetail: dto.cross_border_detail ?? undefined,
    referral: dto.referral,
    referrer: dto.referrer,
    termsAcceptedAt: formatStamp(new Date(dto.terms_accepted_at)),
    submitted: formatStamp(new Date(dto.submitted_at)).slice(0, 11),
    status: dto.status,
    hasPhoto: dto.has_photo,
    hasSignature: dto.has_signature,
    hasBusinessCertificate: dto.has_business_certificate,
    audit: dto.audit,
  };
}

/** Fetches an application fresh from the backend — needed whenever the
 * eKYC page is reached other than by an immediate client-side navigation
 * from Open an Account (a reload, a bookmarked link, a fresh tab), since
 * the application otherwise only exists in that one browser session's
 * in-memory store. */
export async function getApplication(ref: string): Promise<Omit<Application, "kyc">> {
  const dto = await apiFetch<ApplicationDto>(`/applications/${encodeURIComponent(ref)}`);

  return toApplication(dto);
}

export async function submitApplication(payload: OpenAccountPayload): Promise<Omit<Application, "kyc">> {
  const dto = await apiFetch<ApplicationDto>("/applications", {
    method: "POST",
    body: JSON.stringify({
      country: payload.country,
      tier: payload.tier,
      purpose: payload.purpose,
      name: payload.name,
      father_name: payload.fatherName || null,
      dob: payload.dob,
      education: payload.education || null,
      address_communication: payload.addressCommunication,
      address_permanent: payload.addressPermanent,
      address_office: payload.addressOffice || null,
      mobile_personal: payload.mobilePersonal,
      mobile_official: payload.mobileOfficial || null,
      landline: payload.landline || null,
      email: payload.email,
      organisation: payload.organisation,
      annual_turnover: payload.annualTurnover || null,
      occupation: payload.occupation || null,
      annual_income: payload.annualIncome || null,
      home_status: payload.homeStatus || null,
      car_status: payload.carStatus || null,
      cross_border_reason: payload.crossBorderReason || null,
      cross_border_detail: payload.crossBorderDetail,
      referral: payload.referral,
      terms_accepted: payload.termsAccepted,
    }),
  });

  return toApplication(dto);
}

/** Shared upload for every per-application document (photo, signature,
 * business certificate) — one multipart POST to the matching endpoint,
 * with the field name the backend's FormRequest expects. */
async function uploadApplicationDocument(
  ref: string,
  endpoint: "photo" | "signature" | "business-certificate",
  fieldName: string,
  file: Blob,
  filename: string
): Promise<Omit<Application, "kyc">> {
  const formData = new FormData();
  formData.append(fieldName, file, filename);

  const dto = await apiFetch<ApplicationDto>(`/applications/${encodeURIComponent(ref)}/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  return toApplication(dto);
}

/** Persists the applicant's KYC photograph against their application on
 * the real backend. The eKYC page's own local document checklist stays
 * the source of truth for what's shown on screen — this just makes the
 * "photo" item durable instead of living only as a browser object URL. */
export async function uploadApplicationPhoto(ref: string, photo: Blob, filename: string): Promise<Omit<Application, "kyc">> {
  return uploadApplicationDocument(ref, "photo", "photo", photo, filename);
}

/** Persists the applicant's signature — required for every application,
 * regardless of tier. Uploaded from the Open an Account wizard itself,
 * right after submission produces a ref (2wayfund-react
 * src/pages/public/OpenAccountPage.tsx), not deferred to eKYC. */
export async function uploadApplicationSignature(ref: string, signature: Blob, filename: string): Promise<Omit<Application, "kyc">> {
  return uploadApplicationDocument(ref, "signature", "signature", signature, filename);
}

/** Persists the applicant's business certificate. The backend rejects
 * this for a non-corporate tier (App\Services\ApplicationService
 * ::attachBusinessCertificate), so only call it when the selected tier
 * is in the Corporate Account family. */
export async function uploadApplicationBusinessCertificate(
  ref: string,
  certificate: Blob,
  filename: string
): Promise<Omit<Application, "kyc">> {
  return uploadApplicationDocument(ref, "business-certificate", "business_certificate", certificate, filename);
}
