import { apiFetch } from "./apiClient";
import { formatStamp } from "../lib/dates";
import type { Nominee, NomineeAuditEntry } from "../types/data";

/** Registering or replacing the account's nominee is two-step, OTP-gated,
 * like every other sensitive change in this app — initiate() stages the
 * nominee and emails a one-time code; confirm() only makes it the
 * account's nominee once that code comes back, replacing whichever
 * nominee was previously active. Removal is immediate — it doesn't grant
 * anyone anything, so it isn't OTP-gated, matching a beneficiary's
 * removal. */

interface NomineeDto {
  id: number;
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
  status: "Awaiting OTP" | "Active";
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

export async function deleteNominee(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/nominees/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
