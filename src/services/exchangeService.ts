import { apiFetch } from "./apiClient";
import type { CurrencyCode } from "../types/data";

/** Converting one of the customer's own currency balances into another —
 * e.g. a foreign-currency credit into their INR "main" balance. Two-step,
 * like self-service registration: initiate() quotes the conversion and
 * emails a one-time code; confirm() only moves money once that code
 * comes back. */
export interface ExchangeQuote {
  ref: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  fromAmount: number;
  rate: number;
  commission: number;
  toAmount: number;
  status: string;
}

interface ExchangeDto {
  ref: string;
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  from_amount: string | number;
  rate: string | number;
  commission: string | number;
  to_amount: string | number;
  status: string;
}

function mapExchange(dto: ExchangeDto): ExchangeQuote {
  return {
    ref: dto.ref,
    fromCurrency: dto.from_currency,
    toCurrency: dto.to_currency,
    fromAmount: Number(dto.from_amount),
    rate: Number(dto.rate),
    commission: Number(dto.commission),
    toAmount: Number(dto.to_amount),
    status: dto.status,
  };
}

export async function initiateExchange(
  payload: { fromCurrency: CurrencyCode; toCurrency: CurrencyCode; amount: number },
  token: string
): Promise<ExchangeQuote> {
  const dto = await apiFetch<ExchangeDto>("/exchange/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ from_currency: payload.fromCurrency, to_currency: payload.toCurrency, amount: payload.amount }),
  });
  return mapExchange(dto);
}

export interface ExchangeConfirmation {
  exchange: ExchangeQuote;
  fromBalance: { currency: CurrencyCode; amount: number };
  toBalance: { currency: CurrencyCode; amount: number };
}

interface ExchangeConfirmDto {
  exchange: ExchangeDto;
  from_balance: { currency: CurrencyCode; amount: string | number };
  to_balance: { currency: CurrencyCode; amount: string | number };
}

export async function confirmExchange(payload: { ref: string; otp: string }, token: string): Promise<ExchangeConfirmation> {
  const dto = await apiFetch<ExchangeConfirmDto>("/exchange/confirm", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ref: payload.ref, otp: payload.otp }),
  });

  return {
    exchange: mapExchange(dto.exchange),
    fromBalance: { currency: dto.from_balance.currency, amount: Number(dto.from_balance.amount) },
    toBalance: { currency: dto.to_balance.currency, amount: Number(dto.to_balance.amount) },
  };
}
