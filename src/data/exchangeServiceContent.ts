/** Copy for the Exchange Services page, sourced from the institution's
 * published currency-exchange & conversion profile. */

export const EXCHANGE_INTRO =
  "2 Way Fund International provides currency-exchange and conversion facilities for eligible customers, subject to the availability of the relevant currency, applicable account category, transaction requirements, compliance procedures, and applicable laws and regulations. Customers may receive funds in one currency and, where the applicable service supports it, request conversion into another currency before settlement or transfer to an eligible beneficiary account.";

export const EXAMPLE_PAIRS = ["USD → EUR", "EUR → USD", "USD → INR", "EUR → INR"];

export const USDT_NOTE =
  "Where supported and legally permitted, certain digital assets or stablecoins, such as USDT, may be subject to separate conversion arrangements and additional regulatory, compliance, and transaction requirements. USDT should not be treated as equivalent to a sovereign fiat currency.";

export const RATE_FACTORS = ["Market conditions", "Liquidity", "Currency pair", "Transaction size", "Timing", "Payment corridor"];

export const RATE_CLOSING =
  "Foreign-exchange rates may change frequently. The exchange rate applicable at the time a customer initiates a transaction may differ from the rate applicable at the time the transaction is finally processed or settled. Where applicable, the customer will be provided with the relevant exchange information before confirming the conversion.";

export const COMMISSION_FACTORS = [
  "Currency pair",
  "Amount being exchanged",
  "Transaction type",
  "Customer account category",
  "Payment corridor",
  "Market conditions",
  "Liquidity",
  "Processing method",
  "Applicable service agreement",
  "Regulatory or third-party costs",
];

export const COMMISSION_CLOSING =
  "The applicable commission is not necessarily a fixed percentage for every currency or every transaction. The percentage or amount of exchange commission applicable to a particular transaction will be determined according to the applicable Exchange Policy and Fee Schedule in effect at the time of the transaction.";

export const NO_FIXED_COMMISSION_NOTE =
  "2 Way Fund International does not represent that one fixed exchange commission will apply to every currency conversion — the commission applicable to EUR → USD may differ from USD → INR, and may also differ according to the amount, account category, transaction corridor, and market conditions.";

export const CALCULATION_FORMULA = ["Received Amount", "Applicable Exchange Rate", "Exchange Commission", "Applicable Third-Party Charges", "Net Converted Amount"];

export const CALCULATION_NOTE =
  "For illustration only: suppose a customer receives €100,000 and requests conversion into another supported currency. The actual amount payable depends on the received amount, the applicable exchange rate, less the exchange commission, less applicable third-party charges. Actual rates, commissions, and charges are determined at the time of the relevant transaction.";

export const TRANSPARENCY_CHECKLIST = [
  "Original currency",
  "Original amount",
  "Destination currency",
  "Applicable exchange rate",
  "Exchange commission",
  "Other applicable charges",
  "Converted amount",
  "Net settlement amount",
  "Applicable transaction conditions",
];

export interface Scenario {
  label: string;
  desc: string;
  chain: string[];
}

export const SCENARIOS: Scenario[] = [
  { label: "Scenario 1", desc: "A customer receives funds in EUR but requires settlement in INR.", chain: ["EUR", "Currency Conversion", "INR", "Eligible Bank Settlement"] },
  { label: "Scenario 2", desc: "A customer receives funds in USD but requires settlement in EUR.", chain: ["USD", "Currency Conversion", "EUR", "Eligible Beneficiary"] },
  { label: "Scenario 3", desc: "Where legally supported, a customer may have a transaction involving a digital asset such as USDT, which may require a separate digital-asset conversion process before settlement into a supported fiat currency. Such transactions may be subject to additional verification, risk controls, legal requirements, and service restrictions.", chain: [] },
];

export const FLUCTUATION_LIST = [
  "Exchange rates may increase or decrease",
  "The final converted amount may change",
  "A previously displayed indicative rate may no longer be available",
  "Additional confirmation may be required before conversion",
];

export const FLUCTUATION_CLOSING =
  "2 Way Fund International does not guarantee a particular exchange rate unless a specific rate has been expressly confirmed under an applicable transaction agreement.";

export const CONFIRMATION_CHAIN = ["Amount", "Currency", "Exchange Rate", "Commission", "Final Amount"];

export const CONFIRMATION_CLOSING =
  "Once a conversion has been executed, reversal or cancellation may be subject to the applicable transaction terms and may not always be possible.";

export const THIRD_PARTY_NOTE =
  "A currency conversion may involve third-party financial institutions, payment networks, correspondent banks, liquidity providers, or other service providers. Such parties may impose charges or deductions where permitted. Any applicable third-party costs will be handled according to the relevant transaction conditions and available disclosures.";

export const COMPLIANCE_CHECKLIST = [
  "Customer identification",
  "KYC verification",
  "AML/CTF requirements",
  "Sanctions screening",
  "Fraud prevention",
  "Source-of-funds verification",
  "Transaction monitoring",
  "Regulatory requirements",
];

export const COMPLIANCE_CLOSING =
  "2 Way Fund International may request additional information or documentation before processing a currency conversion. A transaction may be delayed, restricted, rejected, or cancelled where required by applicable law, regulation, compliance procedures, payment-network requirements, or risk controls.";

export const DIGITAL_ASSET_NOTE =
  "USDT (Tether) is a digital asset/stablecoin and is not a sovereign fiat currency such as EUR, USD, GBP, or JPY. Any USDT-related conversion or transaction may therefore be subject to additional digital-asset verification, wallet/address verification, transaction monitoring, blockchain-network requirements, compliance screening, applicable fees, and regulatory restrictions. Customers should not assume that every digital asset or blockchain network is supported — only digital assets and networks expressly supported by the applicable service may be used.";

export const AVAILABILITY_FACTORS = [
  "Market liquidity",
  "Payment infrastructure",
  "Banking relationships",
  "Regulatory restrictions",
  "Country restrictions",
  "Sanctions",
  "Currency controls",
  "Technical availability",
];

export const AVAILABILITY_CLOSING =
  "Not every currency is necessarily available at all times. 2 Way Fund International may modify, add, or discontinue supported currencies where required by operational, regulatory, financial, or security considerations.";

export const COMMITMENT_ITEMS = [
  "What currency is being received",
  "What currency is being requested",
  "What exchange rate applies",
  "What commission applies",
  "What other charges may apply",
  "What amount is expected after conversion",
  "How the converted funds will be settled",
];

export const FINAL_DISCLOSURE_PARAGRAPHS = [
  "Currency exchange is subject to market conditions and applicable service terms. The exchange rate and exchange commission may vary from transaction to transaction.",
  "The applicable rate and commission will be determined according to the Exchange Policy, Fee Schedule, customer account terms, transaction conditions, and applicable regulatory requirements in effect at the relevant time.",
  "No customer should rely on a historical, indicative, or previously displayed exchange rate as a guaranteed future rate unless expressly confirmed under the applicable transaction agreement.",
];
