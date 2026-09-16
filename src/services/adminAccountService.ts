import { apiFetch } from "./apiClient";
import { mapCard, type CardDto } from "./cardService";
import type { Card, CurrencyCode } from "../types/data";

/** Everything the Compliance Console's "Open Account" tool collects to
 * provision a customer directly — no application, no self-service eKYC.
 * reference/accountNumber/panelCode/secureCode are optional: left blank,
 * the backend generates each the same way the normal approval flow would. */
export interface CreateCustomerAccountPayload {
  reference: string;
  accountNumber: string;
  panelCode: string;
  secureCode: string;
  pin: string;
  name: string;
  fatherName: string;
  dob: string;
  accountTier: string;
  aadhaar: string;
  pan: string;
  email: string;
  mobile: string;
  country: string;
  openingDeposit: string;
  currency: CurrencyCode;
  residentAddress: string;
  officeAddress: string;
}

export interface CreatedAccountUserDto {
  id: number;
  name: string;
  email: string;
  reference: string;
  account_number: string;
  panel_code: string;
  account_tier: string;
  segment: string;
  kyc_status: string;
  pin_status: string;
}

export interface CreateAccountResult {
  user: CreatedAccountUserDto;
  /** Shown once — the database only ever keeps the hash. Relay it to the
   * customer through another channel if the email doesn't land. */
  secure_code: string;
}

export interface CustomerAccountDto {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  reference: string;
  account_number: string;
  panel_code: string;
  account_tier: string;
  segment: string;
  pan: string | null;
  aadhaar: string | null;
  kyc_status: string;
  pin_status: string;
  transfers_blocked: boolean;
  transfers_blocked_reason: string | null;
  transfers_block_scope: TransferBlockScope | null;
  netbanking_enabled: boolean;
  daily_domestic_limit: string | number;
  last_login_at: string | null;
  created_at: string | null;
}

export interface AccountListMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface AccountListResult {
  items: CustomerAccountDto[];
  meta: AccountListMeta;
}

interface AccountListDto {
  items: CustomerAccountDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

/** Every customer account, however it was provisioned (application
 * approval or the "Open Account" tool) — staff-only, hence the token. */
export async function listCustomerAccounts(
  token: string,
  filters: { email?: string; page?: number } = {},
  signal?: AbortSignal
): Promise<AccountListResult> {
  const params = new URLSearchParams();
  if (filters.email) params.set("email", filters.email);
  if (filters.page) params.set("page", String(filters.page));
  const query = params.toString();

  const result = await apiFetch<AccountListDto>(`/admin/accounts${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  return {
    items: result.items,
    meta: {
      currentPage: result.meta.current_page,
      perPage: result.meta.per_page,
      total: result.meta.total,
      lastPage: result.meta.last_page,
    },
  };
}

/** Permanently removes a customer account — staff only, irreversible.
 * The backend cascades every record the customer actually owns
 * (balances, transactions, cards, beneficiaries, etc.); any application
 * they were provisioned from survives, just unlinked. */
export async function deleteCustomerAccount(userId: number, token: string): Promise<void> {
  await apiFetch<null>(`/admin/accounts/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createCustomerAccount(
  payload: CreateCustomerAccountPayload,
  photo: File | null,
  token: string
): Promise<CreateAccountResult> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("account_tier", payload.accountTier);
  formData.append("pin", payload.pin);
  formData.append("country", payload.country);
  formData.append("opening_deposit", payload.openingDeposit);
  formData.append("currency", payload.currency);
  if (payload.reference) formData.append("reference", payload.reference);
  if (payload.accountNumber) formData.append("account_number", payload.accountNumber);
  if (payload.panelCode) formData.append("panel_code", payload.panelCode);
  if (payload.secureCode) formData.append("secure_code", payload.secureCode);
  if (payload.fatherName) formData.append("father_name", payload.fatherName);
  if (payload.dob) formData.append("dob", payload.dob);
  if (payload.aadhaar) formData.append("aadhaar", payload.aadhaar);
  if (payload.pan) formData.append("pan", payload.pan);
  if (payload.mobile) formData.append("mobile", payload.mobile);
  if (payload.residentAddress) formData.append("resident_address", payload.residentAddress);
  if (payload.officeAddress) formData.append("office_address", payload.officeAddress);
  if (photo) formData.append("photo", photo);

  return apiFetch<CreateAccountResult>("/admin/accounts", {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
  });
}

interface BalanceDto {
  id: number;
  currency: CurrencyCode;
  amount: string | number;
  note: string | null;
}

export interface CustomerBalance {
  currency: CurrencyCode;
  amount: number;
}

/** A customer's current balances, by currency — so staff can see what a
 * customer already holds before crediting more, instead of guessing a
 * currency independently of what the account was actually opened in
 * (the bug this exists to prevent: Open Account defaults its opening
 * deposit to USD, Add Funds used to default to INR — crediting the
 * "wrong" one silently created a second, unrelated balance). */
export async function listCustomerBalances(userId: number, token: string, signal?: AbortSignal): Promise<CustomerBalance[]> {
  const dtos = await apiFetch<BalanceDto[]>(`/admin/accounts/${userId}/balances`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  return dtos.map((d) => ({ currency: d.currency, amount: Number(d.amount) }));
}

interface CreditAccountDto {
  balance: { id: number; currency: CurrencyCode; amount: string | number; note: string | null };
  transaction: { ref: string; description: string };
}

export interface CreditAccountResult {
  currency: CurrencyCode;
  newBalance: number;
}

/** The Compliance Console's "Add Funds" action — credits one customer's
 * balance in a given currency, creating that currency's ledger row if
 * this is its first credit. Staff only, hence the token. */
export async function creditCustomerAccount(
  userId: number,
  payload: { currency: CurrencyCode; amount: number; note?: string; valueDate?: string },
  token: string
): Promise<CreditAccountResult> {
  const dto = await apiFetch<CreditAccountDto>(`/admin/accounts/${userId}/credit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currency: payload.currency, amount: payload.amount, note: payload.note, value_date: payload.valueDate || undefined }),
  });

  return { currency: dto.balance.currency, newBalance: Number(dto.balance.amount) };
}

/** The Compliance Console's "Debit Funds" action — the reverse of
 * creditCustomerAccount, subtracting from one customer's balance in a
 * given currency. The backend rejects an amount exceeding what's
 * actually available (including a currency the customer holds nothing
 * in), so there's nothing to pre-check client-side beyond "amount > 0". */
export async function debitCustomerAccount(
  userId: number,
  payload: { currency: CurrencyCode; amount: number; note?: string; valueDate?: string },
  token: string
): Promise<CreditAccountResult> {
  const dto = await apiFetch<CreditAccountDto>(`/admin/accounts/${userId}/debit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currency: payload.currency, amount: payload.amount, note: payload.note, value_date: payload.valueDate || undefined }),
  });

  return { currency: dto.balance.currency, newBalance: Number(dto.balance.amount) };
}

/** "external_only" leaves internal-to-internal transfers open
 * (Beneficiary.internal); "all" stops every transfer but leaves Currency
 * Exchange untouched; "everything" additionally stops Currency Exchange
 * — the broadest freeze. Only meaningful while blocked is true. */
export type TransferBlockScope = "external_only" | "all" | "everything";

interface TransferBlockDto {
  transfers_blocked: boolean;
  transfers_blocked_reason: string | null;
  transfers_block_scope: TransferBlockScope | null;
}

export interface TransferBlockStatus {
  blocked: boolean;
  reason: string | null;
  scope: TransferBlockScope | null;
}

/** The Compliance Console's "Freeze Account" control — instantly freezes
 * or unfreezes a customer's ability to send a fund transfer, at one of
 * two scopes. Scoped to Transfer Funds only; every other customer action
 * is unaffected. Staff only, hence the token. */
export async function updateCustomerTransferBlock(
  userId: number,
  payload: { blocked: boolean; reason?: string; scope?: TransferBlockScope },
  token: string
): Promise<TransferBlockStatus> {
  const dto = await apiFetch<TransferBlockDto>(`/admin/accounts/${userId}/transfer-block`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ blocked: payload.blocked, reason: payload.reason, scope: payload.scope }),
  });

  return { blocked: dto.transfers_blocked, reason: dto.transfers_blocked_reason, scope: dto.transfers_block_scope };
}

/** The Compliance Console's "Netbanking Access" control — switches
 * Transfer Funds / Currency Exchange on or off for a customer's account
 * entirely. Independent of the Freeze Account controls above; login and
 * every other account action are unaffected either way. Staff only,
 * hence the token. */
export async function updateNetbankingAccess(userId: number, enabled: boolean, token: string): Promise<boolean> {
  const dto = await apiFetch<{ netbanking_enabled: boolean }>(`/admin/accounts/${userId}/netbanking`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });

  return dto.netbanking_enabled;
}

/** The Compliance Console's "Transaction Limit" control — sets a
 * customer's daily domestic transfer cap directly, overriding whatever
 * their account tier assigned at provisioning. Actually enforced by the
 * backend (TransferService::assertWithinDailyLimit) against the day's
 * completed-or-held transfers, not just a displayed figure. Staff only,
 * hence the token. */
export async function updateAccountLimit(userId: number, dailyDomesticLimit: number, token: string): Promise<number> {
  const dto = await apiFetch<{ daily_domestic_limit: string | number }>(`/admin/accounts/${userId}/limit`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ daily_domestic_limit: dailyDomesticLimit }),
  });

  return Number(dto.daily_domestic_limit);
}

/** A card is provisioned and maintained by the institution — the
 * Compliance Console's card management panel is the only place one is
 * ever created, edited, or removed. Staff only, hence the token. */
export interface AdminCardPayload {
  type: "Debit" | "Credit";
  cardNumber: string;
  expiry: string;
  cvv: string;
  forms: string[];
  capability: string;
  funding: "ledger" | "credit" | "prepaid";
  currency: CurrencyCode;
  capPerTxn?: number;
  capNote?: string;
  creditLimit?: number;
  outstanding?: number;
  prepaid?: number;
}

function cardPayloadBody(payload: AdminCardPayload) {
  return JSON.stringify({
    type: payload.type,
    card_number: payload.cardNumber,
    expiry: payload.expiry,
    cvv: payload.cvv,
    forms: payload.forms,
    capability: payload.capability,
    funding: payload.funding,
    currency: payload.currency,
    cap_per_txn: payload.capPerTxn ?? null,
    cap_note: payload.capNote || null,
    credit_limit: payload.creditLimit ?? null,
    outstanding: payload.outstanding ?? null,
    prepaid: payload.prepaid ?? null,
  });
}

export async function listCustomerCards(userId: number, token: string, signal?: AbortSignal): Promise<Card[]> {
  const dtos = await apiFetch<CardDto[]>(`/admin/accounts/${userId}/cards`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map(mapCard);
}

export async function createCustomerCard(userId: number, payload: AdminCardPayload, token: string): Promise<Card> {
  const dto = await apiFetch<CardDto>(`/admin/accounts/${userId}/cards`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: cardPayloadBody(payload),
  });
  return mapCard(dto);
}

export async function updateCustomerCard(userId: number, cardId: string, payload: AdminCardPayload, token: string): Promise<Card> {
  const dto = await apiFetch<CardDto>(`/admin/accounts/${userId}/cards/${cardId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: cardPayloadBody(payload),
  });
  return mapCard(dto);
}

export async function deleteCustomerCard(userId: number, cardId: string, token: string): Promise<void> {
  await apiFetch<null>(`/admin/accounts/${userId}/cards/${cardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
