import { apiFetch, apiFetchBlob } from "./apiClient";
import { formatStamp } from "../lib/dates";
import type { Nominee, NomineeAuditEntry } from "../types/data";

/** Registering a first nominee is two-step, OTP-gated, like every other
 * sensitive change in this app — initiate() stages it and emails a
 * one-time code; confirm() only activates it once that code comes back.
 *
 * Editing or removing an already-Active nominee isn't self-service any
 * more — it needs staff approval. Editing still goes through the same
 * initiate()/confirm() pair, but confirm() lands the result in "Pending
 * Approval" instead of making it Active; the previous nominee stays
 * Active, untouched, until a staff member decides. Removing follows the
 * same shape: requestNomineeRemoval() only marks the Active nominee for
 * removal, which only actually happens once staff approve it. */

interface NomineeDto {
  id: number;
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
  has_id_proof: boolean;
  status: "Awaiting OTP" | "Pending Approval" | "Active";
  removal_requested_at: string | null;
  registered_at: string | null;
}

function mapNominee(dto: NomineeDto): Nominee {
  return {
    id: String(dto.id),
    name: dto.name,
    relationship: dto.relationship,
    dob: dto.dob,
    address: dto.address,
    guardianName: dto.guardian_name ?? "",
    guardianRelationship: dto.guardian_relationship ?? "",
    guardianAddress: dto.guardian_address ?? "",
    hasIdProof: dto.has_id_proof,
    status: dto.status,
    removalRequested: dto.removal_requested_at !== null,
    registered: dto.registered_at ? formatStamp(new Date(dto.registered_at)) : "",
  };
}

export async function listNominees(token: string, signal?: AbortSignal): Promise<Nominee[]> {
  const dtos = await apiFetch<NomineeDto[]>("/nominees", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map(mapNominee);
}

interface NomineeAuditDto {
  action: string;
  created_at: string | null;
}

export async function listNomineeAudit(token: string, signal?: AbortSignal): Promise<NomineeAuditEntry[]> {
  const dtos = await apiFetch<NomineeAuditDto[]>("/nominees/audit", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map((d) => ({ at: d.created_at ? formatStamp(new Date(d.created_at)) : "", action: d.action }));
}

export interface InitiateNomineePayload {
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianAddress?: string;
}

export async function initiateNominee(payload: InitiateNomineePayload, token: string): Promise<Nominee> {
  const dto = await apiFetch<NomineeDto>("/nominees/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: payload.name,
      relationship: payload.relationship,
      dob: payload.dob,
      address: payload.address,
      guardian_name: payload.guardianName || undefined,
      guardian_relationship: payload.guardianRelationship || undefined,
      guardian_address: payload.guardianAddress || undefined,
    }),
  });
  return mapNominee(dto);
}

export async function confirmNominee(id: string, otp: string, token: string): Promise<Nominee> {
  const dto = await apiFetch<NomineeDto>(`/nominees/${id}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ otp }),
  });
  return mapNominee(dto);
}

/** Withdraws the account's own outstanding change request (a "Pending
 * Approval" row) before staff act on it — the Active nominee it would
 * have replaced is never touched. */
export async function cancelNomineeChangeRequest(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/nominees/${id}/change-request`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Requests removal of the account's Active nominee — takes effect only
 * once a staff member approves it. */
export async function requestNomineeRemoval(id: string, token: string): Promise<Nominee> {
  const dto = await apiFetch<NomineeDto>(`/nominees/${id}/request-removal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapNominee(dto);
}

/** Withdraws the account's own outstanding removal request before staff
 * act on it. */
export async function cancelNomineeRemoval(id: string, token: string): Promise<Nominee> {
  const dto = await apiFetch<NomineeDto>(`/nominees/${id}/removal-request`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapNominee(dto);
}

/** Attaches the nominee's ID proof document — only while the nominee is
 * still "Awaiting OTP" (i.e. right after initiateNominee(), before
 * confirmNominee()). confirmNominee() refuses to activate a nominee with
 * no document attached, so this must succeed before the OTP step. */
export async function uploadNomineeIdProof(id: string, file: Blob, filename: string, token: string): Promise<Nominee> {
  const formData = new FormData();
  formData.append("id_proof", file, filename);

  const dto = await apiFetch<NomineeDto>(`/nominees/${id}/id-proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return mapNominee(dto);
}

export interface NomineeIdProof {
  url: string;
  /** The proof can be a scanned PDF instead of a photo (backend:
   * UploadNomineeIdProofRequest allows mimes:pdf,jpeg,png,webp) — the
   * caller needs this to know whether an <img> can render it or it needs
   * a "download/open" link. */
  isImage: boolean;
}

/** Caller must URL.revokeObjectURL(result.url) when done with it. */
export async function getNomineeIdProof(id: string, token: string, signal?: AbortSignal): Promise<NomineeIdProof | null> {
  const blob = await apiFetchBlob(`/nominees/${id}/id-proof`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!blob) return null;
  return { url: URL.createObjectURL(blob), isImage: blob.type.startsWith("image/") };
}
