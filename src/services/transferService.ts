import { apiFetch } from "./apiClient";
import type { CurrencyCode, TransactionStatus } from "../types/data";

/** Electronic Fund Transfer — authorised by the 9-digit transaction PIN
 * alone (no OTP step), matching this feature's existing design. A single
 * request both authorises and settles the transfer; a transaction at or
 * above the review threshold still debits, it just posts as "Under
 * review" instead of "Completed" — reflected in the response's `held`
 * flag and the transaction's own status. */

export interface TransferPayload {
  beneficiaryId: string;
  channel: "IMPS" | "NEFT" | "RTGS";
  amount: number;
  remarks?: string;
  pin: string;
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

interface TransferTransactionDto {
  ref: string;
  utr: string | null;
  beneficiary: string | null;
  beneficiary_account: string | null;
  beneficiary_bank: string | null;
  routing: string | null;
  commission: string | number | null;
  status: TransactionStatus;
  amount: string | number;
}

interface TransferResponseDto {
  transaction: TransferTransactionDto;
  balance: { currency: CurrencyCode; amount: string | number };
  held: boolean;
}

export async function createTransfer(payload: TransferPayload, token: string): Promise<TransferReceipt> {
  const dto = await apiFetch<TransferResponseDto>("/transfers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      beneficiary_id: payload.beneficiaryId,
      channel: payload.channel,
      amount: payload.amount,
      remarks: payload.remarks || undefined,
      pin: payload.pin,
    }),
  });

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
