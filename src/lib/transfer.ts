import type { Beneficiary, Store } from "../types/data";
import { TRANSFER_CHANNELS, REVIEW_THRESHOLD_USD } from "../data/constants";

/** An Indian rupee ledger can only transfer to internal 2 Way accounts and
 * other Indian beneficiaries routed by IFSC. Cross-border transfers from
 * INR are not supported in this product. Since Transfer Funds is
 * domestic/internal only, this is effectively always true here — kept as
 * a real check because legacy foreign beneficiaries still exist on file. */
export function isAllowedBeneficiary(beneficiary: Beneficiary): boolean {
  if (beneficiary.internal) return true;
  return beneficiary.country === "India";
}

export function beneficiaryRestrictionReason(beneficiary: Beneficiary): string | null {
  if (isAllowedBeneficiary(beneficiary)) return null;
  return `The INR ledger can only transfer to internal 2 Way accounts or Indian beneficiaries. ${beneficiary.name} is a ${beneficiary.country} account and cannot be used as a destination.`;
}

export function beneCodeLabel(b: Beneficiary): string {
  if (b.ifsc && b.swift) return `IFSC ${b.ifsc} · SWIFT ${b.swift}`;
  if (b.ifsc) return `IFSC ${b.ifsc}`;
  if (b.swift) return `SWIFT ${b.swift}`;
  return b.internal ? "Internal — no routing code" : "No routing code on file";
}

export function transferChannel(id: string) {
  return TRANSFER_CHANNELS.find((c) => c.id === id) ?? TRANSFER_CHANNELS[0];
}

export interface TxQuote {
  commissionRate: number;
  commission: number;
  receives: number;
  debit: number;
  debitUsd: number;
}

export function txQuote(store: Store, amount: number, beneficiary: Beneficiary): TxQuote {
  const commissionRate = beneficiary.internal ? 0 : 0.02;
  const commission = amount * commissionRate;
  const debit = amount + commission;
  const debitUsd = debit / store.rates.INR;
  return { commissionRate, commission, receives: amount, debit, debitUsd };
}

export function isHeld(quote: TxQuote): boolean {
  return quote.debitUsd >= REVIEW_THRESHOLD_USD;
}

export function corridorFor(beneficiaryCountry: string): "Domestic" | "International" {
  return beneficiaryCountry === "India" ? "Domestic" : "International";
}
