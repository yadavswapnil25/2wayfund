import type { Beneficiary, Store, User } from "../types/data";
import { TRANSFER_CHANNELS, REVIEW_THRESHOLD_USD } from "../data/constants";

const NETBANKING_DISABLED_MESSAGE = "Netbanking transactions are not enabled on this account. Contact support to activate netbanking.";

/** Whether netbanking being switched off, or a freeze, actually stops a
 * transfer to this beneficiary — mirrors the backend's own checks
 * (TransferService::assertNetbankingEnabled / assertTransfersNotBlocked)
 * so the UI never shows "blocked" for a transfer that would actually go
 * through, or vice versa. netbankingEnabled is checked first, exactly as
 * the backend does. A null beneficiary (none picked yet) is treated as
 * blocked whenever the account is frozen at all, since which scope
 * applies isn't knowable until a payee is chosen. Every freeze scope
 * stops a transfer; "external_only" is just the one exception that lets
 * an internal beneficiary through. */
export function isTransferBlockedFor(user: User, beneficiary: Beneficiary | null): boolean {
  if (!user.netbankingEnabled) return true;
  if (!user.transfersBlocked) return false;
  if (user.transfersBlockScope === "external_only" && beneficiary?.internal) return false;
  return true;
}

/** The exact user-facing reason a transfer is blocked, or null if it
 * isn't — for the banner/error text callers show, so it names the real
 * cause (netbanking off vs. a freeze, with its reason) instead of a
 * generic message. */
export function transferBlockMessage(user: User, beneficiary: Beneficiary | null): string | null {
  if (!user.netbankingEnabled) return NETBANKING_DISABLED_MESSAGE;
  if (!isTransferBlockedFor(user, beneficiary)) return null;
  return user.transfersBlockedReason
    ? `Transfers are currently blocked on this account: ${user.transfersBlockedReason}. Contact support for assistance.`
    : "Transfers are currently blocked on this account. Contact support for assistance.";
}

/** Whether netbanking being switched off, or a freeze, stops Currency
 * Exchange — mirrors the backend's own checks
 * (CurrencyExchangeService::assertNetbankingEnabled / assertNotFrozen).
 * Unlike transfers, only the broadest "everything" freeze scope reaches
 * exchange; "external_only" and "all" are scoped to Transfer Funds. */
export function isExchangeBlockedFor(user: User): boolean {
  return !user.netbankingEnabled || (user.transfersBlocked && user.transfersBlockScope === "everything");
}

/** The exact user-facing reason Currency Exchange is blocked, or null if
 * it isn't — same idea as transferBlockMessage. */
export function exchangeBlockMessage(user: User): string | null {
  if (!user.netbankingEnabled) return NETBANKING_DISABLED_MESSAGE;
  if (!isExchangeBlockedFor(user)) return null;
  return user.transfersBlockedReason
    ? `Transactions are currently blocked on this account: ${user.transfersBlockedReason}. Contact support for assistance.`
    : "Transactions are currently blocked on this account. Contact support for assistance.";
}

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
