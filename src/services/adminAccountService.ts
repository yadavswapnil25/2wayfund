import { apiFetch } from "./apiClient";
import type { CurrencyCode } from "../types/data";

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
  payload: { currency: CurrencyCode; amount: number; note?: string },
  token: string
): Promise<CreditAccountResult> {
  const dto = await apiFetch<CreditAccountDto>(`/admin/accounts/${userId}/credit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currency: payload.currency, amount: payload.amount, note: payload.note }),
  });

  return { currency: dto.balance.currency, newBalance: Number(dto.balance.amount) };
}
