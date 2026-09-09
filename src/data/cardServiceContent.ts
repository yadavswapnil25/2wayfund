/** Copy for the Card Services page, sourced from the institution's published
 * cards & digital-payment profile. The source material names a real,
 * specific third-party card network as a program partner — that's dropped
 * in favour of a generic "premium card network arrangement" description,
 * since naming a real company would assert a licensing relationship that
 * doesn't exist (the same reasoning as the Clients page). */

export const CARD_TYPES = ["2 Way Debit Card", "2 Way Credit Card", "2 Way Recharge Card"];

export const CARD_TYPES_INTRO =
  "2 Way Fund International provides eligible customers with a range of card-based and digital payment solutions designed to make everyday payments, international transactions, bill payments, and access to funds more convenient. Depending on the customer's account category, eligibility, verification status, applicable card program, and issuing arrangements, customers may be provided with cards in digital and/or physical form. Each card is designed for a different purpose and operates according to its applicable terms, limits, network rules, and regulatory requirements.";

export const DEBIT_FORMS: [string, string][] = [
  ["Digital Form", "A digital card may be made available through an eligible digital account or supported application, subject to the applicable security and verification requirements."],
  ["Physical Form", "Eligible customers may also receive a physical debit card that can be used through supported ATM and card-payment networks."],
];

export const ATM_WITHDRAWAL_INTRO =
  "Subject to account eligibility, available balance, applicable laws, ATM availability, card-network rules, and applicable limits, customers may use their 2 Way Debit Card to withdraw cash from supported ATMs internationally. The stated maximum withdrawal facility for eligible customers may be up to USD 20,000, subject to:";

export const ATM_WITHDRAWAL_FACTORS = [
  "Daily withdrawal limits",
  "Per-transaction ATM limits",
  "Available account balance",
  "ATM operator restrictions",
  "Card-network restrictions",
  "Country-specific regulations",
  "Security and risk controls",
  "Applicable verification requirements",
];

export const ATM_WITHDRAWAL_CLOSING =
  "The availability of a USD 20,000 withdrawal should not be interpreted as a guarantee that every ATM will dispense this amount in a single transaction. An ATM operator or local financial institution may impose a lower limit.";

export const INTERNATIONAL_ATM_CHAIN = ["Card Network", "ATM Network", "Country", "Local Regulations", "Account Limits"];

export const CARD_PURCHASE_CATEGORIES = [
  "Retail purchases",
  "Online purchases",
  "International purchases",
  "Travel-related payments",
  "Hotel payments",
  "Service payments",
  "Business expenses",
];

export const CREDIT_DESCRIPTION =
  "2 Way Fund International may provide eligible customers with a credit-card facility under the applicable card program. The credit-card service is intended for customers who meet the relevant eligibility, verification, credit, compliance, and account requirements.";

export const PREMIUM_NETWORK_NOTE =
  "Where a premium card program is provided through an authorized third-party network arrangement, the applicable network's terms, conditions, operating rules, eligibility requirements, transaction limits, fees, and security procedures will apply. Any stated maximum transaction value should be understood as subject to the applicable card agreement, issuer approval, available credit, merchant restrictions, and ATM restrictions.";

export const HIGH_VALUE_INTRO =
  "For eligible premium customers, the applicable card program may support high-value payment transactions. A stated transaction capability of up to ₹10 Crore may be available only where specifically approved under the relevant card/account program and subject to:";

export const HIGH_VALUE_FACTORS = [
  "Available credit or account balance",
  "Merchant acceptance",
  "Card authorization",
  "Risk controls",
  "Transaction verification",
  "Issuer approval",
  "Applicable law and regulations",
];

export const HIGH_VALUE_CLOSING =
  "A high transaction limit does not mean that every merchant or terminal will accept a transaction of that value. Merchants and payment networks may impose their own transaction restrictions.";

export const RECHARGE_DESCRIPTION =
  "The 2 Way Recharge Card is designed as a convenient payment solution through which eligible customers can add/recharge value and use the available balance for supported payment and bill-payment services. The objective of the Recharge Card is to provide customers with a simple digital payment mechanism for eligible bills and services across supported payment corridors.";

export const BILL_CATEGORIES = [
  "Electricity bills",
  "Water bills",
  "Gas bills",
  "Telecommunications bills",
  "Internet bills",
  "Mobile services",
  "Television services",
  "Subscription services",
  "Utility payments",
  "Government or public-service payments where supported",
];

export const RECHARGE_CHARGE_NOTE =
  "Where the applicable 2 Way Recharge Card program specifically provides a zero-service-charge recharge facility, customers may recharge the card without an additional recharge service charge. However, customers should distinguish between the 2 Way Recharge Service Charge and any third-party, biller, bank, or network charges — a fee imposed by a third-party bank, payment network, merchant, biller, foreign-exchange provider, or tax authority may remain applicable where permitted by the relevant terms.";

export const CARD_FORMATS: { title: string; desc: string; supports: string[] }[] = [
  {
    title: "Digital Card",
    desc: "A digital card may be accessed through an authorized digital platform or application.",
    supports: ["Online purchases", "Digital subscriptions", "Merchant payments", "International transactions", "Other permitted online services"],
  },
  {
    title: "Physical Card",
    desc: "A physical card may be issued and delivered to eligible customers according to the applicable card program.",
    supports: ["ATM withdrawals", "Point-of-sale transactions", "Contactless payments where supported", "International purchases", "Other eligible card transactions"],
  },
];

export const SECURITY_PROTECT_LIST = ["Card number", "PIN", "CVV/CVC", "OTP", "Digital-card credentials", "Passwords", "Authentication information"];

export const SECURITY_CLOSING =
  "Customers should never share confidential card information with unknown individuals. 2 Way Fund International may use appropriate security measures including transaction monitoring, authentication, fraud detection, risk assessment, and transaction verification.";

export const FX_CHAIN_EXAMPLES: string[][] = [
  ["USD Account", "EUR Purchase"],
  ["EUR Account", "INR Payment"],
];

export const FX_PARAGRAPH =
  "When a customer uses a card in a country where the transaction currency differs from the account's base currency, currency conversion may be required. The applicable conversion rate, fees, and settlement amount will depend on the relevant card/payment program and applicable terms. Currency conversion may also be affected by the merchant, acquiring institution, card network, or other payment intermediary.";

export const DECLINE_REASONS = [
  "Insufficient available funds",
  "Insufficient available credit",
  "Incorrect PIN",
  "Incorrect card details",
  "Expired card",
  "Merchant restrictions",
  "ATM restrictions",
  "Geographic restrictions",
  "Fraud-prevention controls",
  "Transaction-risk controls",
  "Regulatory restrictions",
  "Network interruption",
];

export const DECLINE_CLOSING = "A declined transaction does not necessarily indicate that the customer's account is defective.";

export const CARD_LIMIT_FACTORS = [
  "Account category",
  "Customer profile",
  "Card type",
  "Available balance",
  "Available credit",
  "Verification status",
  "Country",
  "Payment network",
  "Risk assessment",
  "Applicable regulatory requirements",
];

export const CARD_LIMIT_CLOSING = "Limits published on this page should always be read together with the customer's individual card agreement.";

export const ATM_CONDITIONS = [
  "Local banks",
  "ATM operators",
  "Card networks",
  "Local laws",
  "Daily ATM limits",
  "Security controls",
];

export const ATM_CONDITIONS_CLOSING =
  "Not every ATM supports every card or every withdrawal amount. The actual amount available for withdrawal may be lower than the customer's overall card limit because of the restrictions above, and additional ATM or foreign-exchange charges may also apply.";

export const CASH_ADVANCE_ITEMS = ["Cash-advance limits", "Interest", "Fees", "ATM charges", "Foreign-exchange charges", "Network restrictions", "Issuer conditions"];

export const CARD_AVAILABILITY_CHECKS = [
  "Account-opening process",
  "Identity verification",
  "KYC procedures",
  "AML/compliance checks",
  "Card eligibility requirements",
  "Security verification",
];

export const CARD_AVAILABILITY_CLOSING = "Card issuance is not automatic merely because a customer holds an account.";

export const PROHIBITED_CARD_USES = [
  "Fraud",
  "Money laundering",
  "Sanctions evasion",
  "Unauthorized transactions",
  "Prohibited purchases",
  "Illegal activities",
  "Identity fraud",
  "Transactions prohibited by applicable law",
];

export const PROHIBITED_CARD_CLOSING =
  "Suspicious or unauthorized activity may result in temporary or permanent card restrictions in accordance with applicable procedures and law.";

export const LOST_CARD_PARAGRAPHS = [
  "If a physical card is lost, stolen, or suspected to have been compromised, the customer should immediately report the incident through the official customer-support channel.",
  "The card may be blocked or replaced according to the applicable card program. Customers should also report any unauthorized transaction as soon as possible.",
];

export const REPLACEMENT_REASONS = ["Loss", "Theft", "Expiry", "Damage", "Security compromise", "Name or account changes"];

export const REPLACEMENT_CLOSING = "Applicable replacement fees, delivery charges, or verification requirements may apply.";

export const NETWORK_RULES_NOTE =
  "All card services operate subject to the applicable card-network and issuer rules. Where a card is issued through a third-party card network or issuer, the applicable terms of that network or issuer will also apply.";

export const NO_GUARANTEE_LIST = [
  "Every ATM will accept the card",
  "Every merchant will accept the card",
  "Every country will support every service",
  "Every transaction will be approved",
  "Every biller will be available",
  "Every currency will be supported",
  "A particular transaction limit will apply to every customer",
];

export interface Pillar {
  title: string;
  desc: string;
}

export const PHILOSOPHY_PILLARS: Pillar[] = [
  { title: "Debit", desc: "Access eligible available funds through supported card-payment and ATM channels." },
  { title: "Credit", desc: "Access an eligible credit-card facility according to the applicable card program." },
  { title: "Recharge", desc: "Use the 2 Way Recharge Card for supported recharge and bill-payment services." },
  { title: "Digital", desc: "Access card services through supported digital channels." },
  { title: "Physical", desc: "Use a physical card at supported merchants and ATM networks." },
];

export const ECOSYSTEM_CHAIN = ["2 Way Account", "Digital / Physical Card", "Debit · Credit · Recharge", "Pay · Recharge · Withdraw · Convert", "Supported International Payment Networks", "Merchant / Biller / ATM / Beneficiary"];

export const DISCLOSURE_PARAGRAPHS = [
  "All card facilities, limits, charges, exchange rates, withdrawal facilities, credit facilities, bill-payment services, and international transaction capabilities are subject to the applicable account agreement, cardholder agreement, network rules, issuer conditions, availability, verification requirements, and applicable laws and regulations.",
  "Specific card limits such as the USD 20,000 ATM withdrawal or ₹10 Crore transaction/swipe capability are only advertised where those limits are actually approved and supported by the relevant card issuer/network for the particular customer and card program.",
  "Similarly, a \"zero recharge charge\" statement is only published where the applicable card program genuinely provides such a facility.",
];
