import { apiFetch } from "./apiClient";
import type { CurrencyCode, TransactionStatus } from "../types/data";

/** Electronic Fund Transfer — a server-side session walked through four
 * authorisation steps in order before the money moves: the 9-digit PIN,
 * an emailed OTP, recognising the real PIN in a grid of five, then a
 * final emailed identity OTP. Every step is verified against the
 * session on the backend (2wayfund-API TransferAuthorizationService), so
 * the client can't skip ahead. A transaction at or above the review
 * threshold still debits, it just posts as "Under review" instead of
 * "Completed" — reflected in the receipt's `held` flag. */

export type TransferChannel = "IMPS" | "NEFT" | "RTGS";

export type TransferStage = "pin" | "email_otp" | "grid" | "identity_otp" | "completed" | "cancelled" | "frozen";

export interface InitiateTransferPayload {
  beneficiaryId: string;
  channel: TransferChannel;
  amount: number;
  remarks?: string;
}

export interface TransferSession {
  id: number;
  stage: TransferStage;
  active: boolean;
  channel: TransferChannel;
  amount: number;
  beneficiaryName: string;
  /** Only present while the PIN-grid step is live. */
  grid: string[] | null;
  attemptsRemaining: { pin: number; emailOtp: number; grid: number; identityOtp: number };
  emailOtpExpiresAt: string | null;
  identityOtpExpiresAt: string | null;
  expiresAt: string;
}

export interface TransferReceipt {
  reference: string;
  utr: string;
  held: boolean;
  status: TransactionStatus;
  amount: number;
  commission: number;
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryBank: string;
  routing: string;
  balance: number;
}

interface TransferSessionDto {
  id: number;
  stage: TransferStage;
  active: boolean;
  channel: TransferChannel;
  amount: string | number;
  beneficiary: { id: number; name: string };
  grid: string[] | null;
  attempts_remaining: { pin: number; email_otp: number; grid: number; identity_otp: number };
  email_otp_expires_at: string | null;
  identity_otp_expires_at: string | null;
  expires_at: string;
}

interface TransferResponseDto {
  transaction: {
    ref: string;
    utr: string | null;
    beneficiary: string | null;
    beneficiary_account: string | null;
    beneficiary_bank: string | null;
    routing: string | null;
    commission: string | number | null;
    status: TransactionStatus;
    amount: string | number;
  };
  balance: { currency: CurrencyCode; amount: string | number };
  held: boolean;
}

function mapSession(dto: TransferSessionDto): TransferSession {
  return {
    id: dto.id,
    stage: dto.stage,
    active: dto.active,
    channel: dto.channel,
    amount: Number(dto.amount),
    beneficiaryName: dto.beneficiary.name,
    grid: dto.grid,
    attemptsRemaining: {
      pin: dto.attempts_remaining.pin,
      emailOtp: dto.attempts_remaining.email_otp,
      grid: dto.attempts_remaining.grid,
      identityOtp: dto.attempts_remaining.identity_otp,
    },
    emailOtpExpiresAt: dto.email_otp_expires_at,
    identityOtpExpiresAt: dto.identity_otp_expires_at,
    expiresAt: dto.expires_at,
  };
}

function mapReceipt(dto: TransferResponseDto): TransferReceipt {
  return {
    reference: dto.transaction.ref,
    utr: dto.transaction.utr ?? "",
    held: dto.held,
    status: dto.transaction.status,
    amount: Number(dto.transaction.amount),
    commission: Number(dto.transaction.commission ?? 0),
    beneficiaryName: dto.transaction.beneficiary ?? "",
    beneficiaryAccount: dto.transaction.beneficiary_account ?? "",
    beneficiaryBank: dto.transaction.beneficiary_bank ?? "",
    routing: dto.transaction.routing ?? "",
    balance: Number(dto.balance.amount),
  };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function postStep(path: string, body: Record<string, unknown> | null, token: string): Promise<TransferSession> {
  const dto = await apiFetch<TransferSessionDto>(path, {
    method: "POST",
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  return mapSession(dto);
}

export async function initiateTransfer(payload: InitiateTransferPayload, token: string): Promise<TransferSession> {
  return postStep(
    "/transfers",
    { beneficiary_id: payload.beneficiaryId, channel: payload.channel, amount: payload.amount, remarks: payload.remarks || undefined },
    token
  );
}

export async function getTransferSession(sessionId: number, token: string): Promise<TransferSession> {
  const dto = await apiFetch<TransferSessionDto>(`/transfers/${sessionId}`, { headers: authHeaders(token) });
  return mapSession(dto);
}

export function verifyTransferPin(sessionId: number, pin: string, token: string): Promise<TransferSession> {
  return postStep(`/transfers/${sessionId}/pin`, { pin }, token);
}

export function verifyTransferEmailOtp(sessionId: number, otp: string, token: string): Promise<TransferSession> {
  return postStep(`/transfers/${sessionId}/email-otp`, { otp }, token);
}

export function resendTransferEmailOtp(sessionId: number, token: string): Promise<TransferSession> {
  return postStep(`/transfers/${sessionId}/email-otp/resend`, null, token);
}

export function selectTransferPin(sessionId: number, index: number, token: string): Promise<TransferSession> {
  return postStep(`/transfers/${sessionId}/pin-grid`, { index }, token);
}

export function resendTransferIdentityOtp(sessionId: number, token: string): Promise<TransferSession> {
  return postStep(`/transfers/${sessionId}/identity-otp/resend`, null, token);
}

/** The final step — the one that actually moves the money. */
export async function verifyTransferIdentityOtp(sessionId: number, otp: string, token: string): Promise<TransferReceipt> {
  const dto = await apiFetch<TransferResponseDto>(`/transfers/${sessionId}/identity-otp`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ otp }),
  });
  return mapReceipt(dto);
}
