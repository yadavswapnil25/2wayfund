import { apiFetch } from "./apiClient";
import type { Beneficiary, CurrencyCode } from "../types/data";

/** Registering a beneficiary is two-step, OTP-gated, like every other
 * sensitive change in this app — initiate() masks and stages the new
 * payee and emails a one-time code; confirm() only adds it (into a real
 * cooling-off period) once that code comes back. */

interface BeneficiaryDto {
  id: number;
  name: string;
  detail: string | null;
  account: string;
  country: string;
  currency: CurrencyCode;
  ifsc: string | null;
  swift: string | null;
  bank_name: string | null;
  acct_type: string | null;
  panel_code: string | null;
  cif: string | null;
  internal: boolean;
  status: "Awaiting OTP" | "Pending verification" | "Verified";
}

function mapBeneficiary(dto: BeneficiaryDto): Beneficiary {
  return {
    id: String(dto.id),
    name: dto.name,
    detail: dto.detail ?? "",
    account: dto.account,
    country: dto.country,
    currency: dto.currency,
    internal: dto.internal,
    status: dto.status === "Verified" ? "Verified" : "Pending verification",
    ifsc: dto.ifsc ?? undefined,
    swift: dto.swift ?? undefined,
    bankName: dto.bank_name ?? undefined,
    acctType: dto.acct_type ?? undefined,
    panelCode: dto.panel_code ?? undefined,
    cif: dto.cif ?? undefined,
  };
}

export async function listBeneficiaries(token: string, signal?: AbortSignal): Promise<Beneficiary[]> {
  const dtos = await apiFetch<BeneficiaryDto[]>("/beneficiaries", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map(mapBeneficiary);
}

export interface InitiateExternalPayload {
  name: string;
  bankName: string;
  account: string;
  accountConfirmation: string;
  ifsc: string;
  acctType?: string;
}

export async function initiateExternalBeneficiary(payload: InitiateExternalPayload, token: string): Promise<Beneficiary> {
  const dto = await apiFetch<BeneficiaryDto>("/beneficiaries/external/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: payload.name,
      bank_name: payload.bankName,
      account: payload.account,
      account_confirmation: payload.accountConfirmation,
      ifsc: payload.ifsc,
      acct_type: payload.acctType,
    }),
  });
  return mapBeneficiary(dto);
}

export interface InitiateInternalPayload {
  account: string;
  panelCode: string;
  cif: string;
}

export async function initiateInternalBeneficiary(payload: InitiateInternalPayload, token: string): Promise<Beneficiary> {
  const dto = await apiFetch<BeneficiaryDto>("/beneficiaries/internal/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ account: payload.account, panel_code: payload.panelCode, cif: payload.cif }),
  });
  return mapBeneficiary(dto);
}

export async function confirmBeneficiary(id: string, otp: string, token: string): Promise<Beneficiary> {
  const dto = await apiFetch<BeneficiaryDto>(`/beneficiaries/${id}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ otp }),
  });
  return mapBeneficiary(dto);
}

export async function completeBeneficiaryCheck(id: string, token: string): Promise<Beneficiary> {
  const dto = await apiFetch<BeneficiaryDto>(`/beneficiaries/${id}/complete-check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapBeneficiary(dto);
}

export async function deleteBeneficiary(id: string, token: string): Promise<void> {
  await apiFetch<null>(`/beneficiaries/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
