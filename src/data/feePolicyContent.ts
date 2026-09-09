/** Copy for the Fee Policy and Fees & Charges pages, sourced from the
 * institution's published fees, commission & service charges policy. The
 * fee schedule and worked examples themselves live on the Store
 * (store.feeRules, store.feeExamples) since they're figures, not prose. */

export const POLICY_INTRO =
  "2 Way Fund International maintains a transparent fee and commission structure for its payment, transaction, currency-conversion, account, card, and other financial services. The applicable charges depend on the type of transaction or service requested by the customer. Our fee structure is designed to distinguish between internal 2 Way Fund International transactions, external transactions, and other chargeable services.";

export const STANDARD_COMMISSION_NOTE =
  "A standard commission of 2% may be applicable to eligible transactions processed through 2 Way Fund International. The actual treatment of the commission may depend on whether the charge is deducted from the sending amount, added separately, or handled according to the applicable transaction agreement.";

export const INTERNAL_TRANSFER_NOTE =
  "Where funds are transferred internally between eligible 2 Way Fund International accounts, no standard transaction charge is applied. This facility is intended for transfers that remain within the eligible internal account system.";

export const INTERNAL_EXCLUSIONS = [
  "External bank transfers",
  "International bank transfers",
  "Currency conversion",
  "Third-party payment transfers",
  "Cash withdrawals",
  "Card transactions",
  "Merchant payments",
  "Other separately chargeable services",
];

export const INTERNAL_EXCLUSIONS_CLOSING =
  "If an internal transfer requires currency conversion, third-party processing, regulatory intervention, or another separately chargeable service, the applicable charges may apply to that additional service.";

export const SERVICE_CHARGE_FACTORS = [
  "Type of service",
  "Transaction amount",
  "Currency",
  "Customer account category",
  "Processing requirements",
  "Service complexity",
  "Third-party costs",
  "Regulatory requirements",
  "Applicable taxes",
  "Currency conversion",
];

export const SERVICE_CHARGE_CLOSING =
  "Not every service provided by 2 Way Fund International necessarily has the same fee. A separate charge may be determined at the time the customer requests or initiates a particular service, and the customer will be informed of the relevant charge before authorization or completion of the service.";

export const EXCHANGE_COMMISSION_FACTORS = ["Currency pair", "Transaction amount", "Exchange rate", "Market conditions", "Customer account", "Processing method", "Applicable service arrangement"];

export const EXCHANGE_COMMISSION_CLOSING =
  "The standard 2% transaction commission should not automatically be interpreted as the currency-exchange commission. Where both transaction processing and currency conversion are applicable, the customer will be informed of the relevant charges according to the applicable transaction terms.";

export const CARD_CHARGE_NOTE =
  "Debit cards, credit cards, recharge cards, ATM transactions, card replacement, cash withdrawal, foreign transactions, and other card-related services may be subject to separate terms and charges, determined according to the relevant card program and applicable cardholder agreement. Third-party ATM operators, banks, payment networks, or card issuers may also impose separate charges where applicable.";

export const ACCOUNT_SERVICE_CHARGES = [
  "Account-related service requests",
  "Special transaction processing",
  "Additional verification services",
  "Physical card services",
  "Replacement services",
  "Premium account services",
  "Special payment arrangements",
  "Documentation or administrative services",
];

export const THIRD_PARTY_NOTE =
  "Some transactions may involve third-party financial institutions, banks, payment networks, correspondent banks, card networks, currency providers, or other service providers. Third-party charges may be outside the direct control of 2 Way Fund International and, where applicable, may be passed on to the customer or deducted from the transaction.";

export const TAX_NOTE =
  "Applicable taxes, duties, levies, government charges, regulatory fees, or other legally required amounts may apply separately to a transaction or service, payable in addition to the Company's service commission.";

export const CONFIRMATION_CHECKLIST = ["Transaction amount", "Commission", "Service charge", "Exchange rate", "Exchange commission", "Third-party charges", "Taxes", "Final payable or receivable amount"];

export const FEE_CHANGE_REASONS = [
  "Changes in operating costs",
  "Payment-network charges",
  "Banking costs",
  "Regulatory requirements",
  "Currency-market conditions",
  "Changes in third-party costs",
  "Changes to services",
];

export const FEE_CHANGE_CLOSING = "Updated fees may be published through the applicable fee schedule or communicated through the relevant service channel.";

export const NO_HIDDEN_CHARGES_NOTE =
  "2 Way Fund International aims to provide customers with clear information regarding applicable charges. Where a charge is applicable and required to be disclosed, customers should be informed of the relevant charge before authorization, subject to applicable law and the terms of the relevant service.";

export const CLARIFICATION_NOTE =
  "The 0% internal transaction charge applies only to eligible transfers that occur entirely within the 2 Way Fund International internal account environment. The absence of an internal transaction charge does not mean that every subsequent activity associated with the transferred funds will be free of charge.";

export const SUBSEQUENT_SERVICES = ["Currency Conversion", "External Bank Transfer", "Cash Withdrawal", "Card Service"];

export const ACKNOWLEDGEMENT_NOTE =
  "By initiating a chargeable transaction or requesting a chargeable service, the customer acknowledges that applicable commissions and service charges may apply. The customer is responsible for reviewing the applicable transaction information before providing authorization.";

export const COMMITMENT_NOTE =
  "2 Way Fund International believes that a transparent fee structure is an important part of customer trust. Our objective is to clearly distinguish between internal transfers, standard transactions, currency exchange, card services, and other chargeable services so that customers can understand the costs associated with their chosen service.";
