import { apiFetch, apiFetchBlob } from "./apiClient";
import { formatStamp } from "../lib/dates";

/** Staff-side view of the nominee approval queues — a customer's edit or
 * removal request against an already-Active nominee lands here instead
 * of taking effect immediately (see NomineeService's own docblock on the
 * backend). */

interface NomineeApprovalCustomerDto {
  reference: string;
  name: string;
  account_number: string;
}

interface NomineeApprovalReplacesDto {
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
}

interface NomineeApprovalDto {
  id: number;
  customer: NomineeApprovalCustomerDto;
  name: string;
  relationship: string;
  dob: string;
  address: string;
  has_id_proof: boolean;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
  status: "Pending Approval" | "Active";
  removal_requested_at: string | null;
  submitted_at: string | null;
  replaces?: NomineeApprovalReplacesDto | null;
}

export interface NomineeApprovalCustomer {
  reference: string;
  name: string;
  accountNumber: string;
}

export interface NomineeApprovalSnapshot {
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardianName: string;
  guardianRelationship: string;
  guardianAddress: string;
}

export interface NomineeChangeRequest {
  id: string;
  customer: NomineeApprovalCustomer;
  proposed: NomineeApprovalSnapshot;
  hasIdProof: boolean;
  replaces: NomineeApprovalSnapshot | null;
  submitted: string;
}

export interface NomineeRemovalRequest {
  id: string;
  customer: NomineeApprovalCustomer;
  nominee: NomineeApprovalSnapshot;
  hasIdProof: boolean;
  requested: string;
}

function toSnapshot(dto: {
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
}): NomineeApprovalSnapshot {
  return {
    name: dto.name,
    relationship: dto.relationship,
    dob: dto.dob,
    address: dto.address,
    guardianName: dto.guardian_name ?? "",
    guardianRelationship: dto.guardian_relationship ?? "",
    guardianAddress: dto.guardian_address ?? "",
  };
}

function toCustomer(dto: NomineeApprovalCustomerDto): NomineeApprovalCustomer {
  return { reference: dto.reference, name: dto.name, accountNumber: dto.account_number };
}

export async function listPendingNomineeChanges(token: string, signal?: AbortSignal): Promise<NomineeChangeRequest[]> {
  const dtos = await apiFetch<NomineeApprovalDto[]>("/admin/nominees/changes", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map((dto) => ({
    id: String(dto.id),
    customer: toCustomer(dto.customer),
    proposed: toSnapshot(dto),
    hasIdProof: dto.has_id_proof,
    replaces: dto.replaces ? toSnapshot(dto.replaces) : null,
    submitted: dto.submitted_at ? formatStamp(new Date(dto.submitted_at)) : "",
  }));
}

export async function listPendingNomineeRemovals(token: string, signal?: AbortSignal): Promise<NomineeRemovalRequest[]> {
  const dtos = await apiFetch<NomineeApprovalDto[]>("/admin/nominees/removals", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map((dto) => ({
    id: String(dto.id),
    customer: toCustomer(dto.customer),
    nominee: toSnapshot(dto),
    hasIdProof: dto.has_id_proof,
    requested: dto.removal_requested_at ? formatStamp(new Date(dto.removal_requested_at)) : "",
  }));
}

export async function approveNomineeChange(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/admin/nominees/changes/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function rejectNomineeChange(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/admin/nominees/changes/${id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function approveNomineeRemoval(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/admin/nominees/removals/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export async function rejectNomineeRemoval(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/admin/nominees/removals/${id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
}

export interface NomineeIdProofView {
  url: string;
  isImage: boolean;
}

/** Caller must URL.revokeObjectURL(result.url) when done with it. */
export async function getNomineeIdProofForReview(id: string, token: string, signal?: AbortSignal): Promise<NomineeIdProofView | null> {
  const blob = await apiFetchBlob(`/admin/nominees/${id}/id-proof`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!blob) return null;
  return { url: URL.createObjectURL(blob), isImage: blob.type.startsWith("image/") };
}
