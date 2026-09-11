import { apiFetch, apiFetchBlob } from "./apiClient";
import { formatStamp } from "../lib/dates";
import type { Balance, CurrencyCode, Transaction, TransactionStatus, User } from "../types/data";

interface MeDto {
  id: number;
  name: string;
  account_tier: string;
  segment: string;
  reference: string;
  referral_code: string;
  pan: string | null;
  account_number: string;
  country: string;
  ifsc: string;
  micr: string;
  branch: string;
  panel_code: string;
  daily_domestic_limit: string | number;
  pin_status: string;
  kyc_status: string;
  has_photo: boolean;
}

/** The real logged-in customer's own profile — fetched fresh on the
 * Account & Passbook page (the post-login landing page) so what's shown
 * there is whoever actually signed in, not always the seeded demo
 * customer. Only the fields the backend actually returns are included;
 * the caller merges this over the existing seed user rather than
 * replacing it outright, so fields the API doesn't expose (like the
 * client-side-only demo transaction PIN) are left alone. */
export async function getMe(token: string, signal?: AbortSignal): Promise<Partial<User>> {
  const dto = await apiFetch<MeDto>("/me", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  return {
    id: String(dto.id),
    name: dto.name,
    accountTier: dto.account_tier,
    segment: dto.segment,
    reference: dto.reference,
    referralCode: dto.referral_code,
    pan: dto.pan ?? "",
    accountNumber: dto.account_number,
    country: dto.country,
    ifsc: dto.ifsc,
    micr: dto.micr,
    branch: dto.branch,
    panelCode: dto.panel_code,
    dailyDomesticLimit: Number(dto.daily_domestic_limit),
    pinStatus: dto.pin_status,
    kycStatus: dto.kyc_status,
    hasPhoto: dto.has_photo,
  };
}

/** The real logged-in customer's own KYC photo, as a local object URL —
 * or null if they don't have one (admin never uploaded a photo for their
 * account) or it couldn't be loaded. Caller is responsible for revoking
 * the returned URL (URL.revokeObjectURL) once it's no longer displayed. */
export async function getMyPhotoUrl(token: string, signal?: AbortSignal): Promise<string | null> {
  const blob = await apiFetchBlob("/me/photo", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return blob ? URL.createObjectURL(blob) : null;
}

/** Uploads a new (or replacement) photo for the logged-in user's own
 * account — self-service, so any authenticated customer can change their
 * own photo without staff involvement. Returns the updated `hasPhoto`
 * flag; the caller still has to re-fetch the image itself via
 * getMyPhotoUrl to display it. */
export async function updateMyPhoto(file: File, token: string): Promise<boolean> {
  const formData = new FormData();
  formData.append("photo", file);
  const dto = await apiFetch<{ has_photo: boolean }>("/me/photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return dto.has_photo;
}

interface BalanceDto {
  id: number;
  currency: CurrencyCode;
  amount: string | number;
  note: string | null;
}

export async function getBalances(token: string, signal?: AbortSignal): Promise<Balance[]> {
  const dtos = await apiFetch<BalanceDto[]>("/balances", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  return dtos.map((d) => ({ currency: d.currency, amount: Number(d.amount), note: d.note ?? "" }));
}

interface TransactionDto {
  id: number;
  ref: string;
  utr: string | null;
  corridor: "Domestic" | "International";
  route: string;
  counterparty: string;
  value_date: string;
  reversed: boolean;
  amended: boolean;
  is_adjustment: boolean;
  adj_ref: string | null;
  previous_value_date: string | null;
  channel: string;
  beneficiary: string | null;
  beneficiary_account: string | null;
  beneficiary_bank: string | null;
  routing: string | null;
  commission: string | number | null;
  commission_currency: CurrencyCode | null;
  receives: string | number | null;
  receives_currency: CurrencyCode | null;
  description: string;
  sub: string | null;
  status: TransactionStatus;
  currency: CurrencyCode;
  amount: string | number;
  direction: "credit" | "debit";
  created_at: string | null;
}

function mapTransaction(dto: TransactionDto): Transaction {
  const stamp = formatStamp(new Date(dto.created_at ?? dto.value_date));

  return {
    date: stamp.slice(0, 11),
    time: stamp.slice(12),
    ref: dto.ref,
    utr: dto.utr ?? undefined,
    corridor: dto.corridor,
    route: dto.route,
    counterparty: dto.counterparty,
    valueIso: dto.value_date,
    reversed: dto.reversed,
    amended: dto.amended,
    isAdjustment: dto.is_adjustment,
    adjRef: dto.adj_ref ?? undefined,
    previousValueIso: dto.previous_value_date ?? undefined,
    channel: dto.channel,
    beneficiary: dto.beneficiary ?? undefined,
    beneficiaryAccount: dto.beneficiary_account ?? undefined,
    beneficiaryBank: dto.beneficiary_bank ?? undefined,
    routing: dto.routing ?? undefined,
    commission: dto.commission != null ? Number(dto.commission) : undefined,
    commissionCurrency: dto.commission_currency ?? undefined,
    receives: dto.receives != null ? Number(dto.receives) : undefined,
    receivesCurrency: dto.receives_currency ?? undefined,
    description: dto.description,
    sub: dto.sub ?? "",
    status: dto.status,
    currency: dto.currency,
    amount: Number(dto.amount),
    direction: dto.direction,
  };
}

/** The real logged-in customer's own transaction history — newest first,
 * same shape and up to the same 20-per-page the backend paginates at
 * (2wayfund-API TransactionRepository::forUser). Callers that only need a
 * short "recent activity" list can just slice the result. */
export async function getTransactions(token: string, signal?: AbortSignal): Promise<Transaction[]> {
  const result = await apiFetch<{ items: TransactionDto[] }>("/transactions", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  return result.items.map(mapTransaction);
}
