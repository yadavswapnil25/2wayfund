import { apiFetch } from "./apiClient";
import type { Card, CurrencyCode } from "../types/data";

/** A card is provisioned and maintained by the institution — there is no
 * self-service "add a card" flow here, only the real-time read of
 * whatever the Compliance Console's card management panel has issued.
 * Shared with the admin panel's own mapping (adminAccountService.ts). */

export interface CardDto {
  id: number;
  type: "Debit" | "Credit";
  card_number: string;
  last4: string;
  expiry: string;
  cvv: string;
  forms: string[];
  capability: string;
  funding: "ledger" | "credit" | "prepaid";
  currency: CurrencyCode;
  cap_per_txn: string | number | null;
  cap_note: string | null;
  credit_limit: string | number | null;
  outstanding: string | number | null;
  prepaid: string | number | null;
}

export function mapCard(dto: CardDto): Card {
  return {
    id: String(dto.id),
    type: dto.type,
    cardNumber: dto.card_number,
    last4: dto.last4,
    expiry: dto.expiry,
    cvv: dto.cvv,
    forms: dto.forms,
    capability: dto.capability,
    funding: dto.funding,
    currency: dto.currency,
    capPerTxn: dto.cap_per_txn != null ? Number(dto.cap_per_txn) : undefined,
    capNote: dto.cap_note ?? undefined,
    creditLimit: dto.credit_limit != null ? Number(dto.credit_limit) : undefined,
    outstanding: dto.outstanding != null ? Number(dto.outstanding) : undefined,
    prepaid: dto.prepaid != null ? Number(dto.prepaid) : undefined,
  };
}

export async function listCards(token: string, signal?: AbortSignal): Promise<Card[]> {
  const dtos = await apiFetch<CardDto[]>("/cards", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return dtos.map(mapCard);
}
