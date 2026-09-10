/** Copy for the Account Types and Account Services pages, sourced from the
 * institution's published account-services profile. */

export const CORPORATE_DESCRIPTION =
  "The Corporate Account is designed for eligible companies, organizations, corporate entities, and businesses requiring international payment and financial transaction capabilities. Corporate customers may use the account for eligible business-related activities such as international payments, receipt of business funds, currency conversion, cross-border settlement, and other services made available by 2 Way Fund International.";

export const CORPORATE_APPROVAL_NOTE =
  "Opening a Corporate Account is subject to successful verification and acceptance by 2 Way Fund International and does not automatically guarantee approval.";

export const CORPORATE_DOCUMENTS = [
  "Certificate of Incorporation",
  "Business registration documents",
  "Corporate identification documents",
  "Registered office information",
  "Directors' or authorized representatives' information",
  "Beneficial ownership information",
  "Tax-related documentation",
  "Bank details",
  "Source-of-funds information",
  "Nature and purpose of business",
];

export interface ProcessStep {
  title: string;
  desc: string;
}

export const OPENING_PROCESS: ProcessStep[] = [
  { title: "Account Selection", desc: "The customer selects the appropriate account category based on their intended use and eligibility." },
  { title: "Application", desc: "The customer submits the required account-opening application and supporting information." },
  { title: "Identity / Business Verification", desc: "The information and documentation submitted by the customer are reviewed according to applicable KYC, AML, security, and regulatory procedures." },
  { title: "Financial Requirement", desc: "The customer fulfills the applicable account-opening financial requirement through the designated and authorized payment method." },
  { title: "Compliance Review", desc: "The application and transaction may undergo additional verification or risk assessment where required." },
  { title: "Account Approval", desc: "Following successful verification and approval, the account may be activated in accordance with the applicable account terms." },
  { title: "International Payment Services", desc: "Once activated, the customer may use the services available under the selected account category." },
];

export interface ServiceItem {
  title: string;
  desc: string;
}

export const ACCOUNT_SERVICES: ServiceItem[] = [
  { title: "International Fund Receipt", desc: "Eligible customers may receive international payments through supported payment channels, subject to transaction verification and applicable requirements." },
  { title: "Currency Conversion", desc: "Where supported, funds may be converted from one currency into another according to the applicable exchange rate and transaction conditions — for example USD → EUR, EUR → USD, or international currency → local currency." },
  { title: "Cross-Border Transfer", desc: "After applicable verification and processing, eligible funds may be transferred through the appropriate payment or banking channel toward a designated beneficiary account." },
  { title: "Transaction Tracking", desc: "Where supported by the service, customers may receive transaction information or status updates regarding their payment." },
  { title: "International Payment Support", desc: "Account holders may receive customer-support assistance concerning account services, payment instructions, transaction information, and applicable documentation requirements." },
];

export const CORPORATE_VS_INDIVIDUAL_INTRO = "The primary distinction between the two account structures is the intended customer category.";

export const CORPORATE_AUDIENCE = ["Companies", "Corporate entities", "Organizations", "Business customers", "Other eligible legal entities"];

export const CORPORATE_COMPLIANCE_NOTE =
  "Corporate customers may be subject to enhanced corporate KYC, beneficial-owner verification, source-of-funds checks, business-purpose verification, and other applicable compliance requirements.";

export const MONITORING_LIST = ["Fraud", "Money laundering", "Sanctions violations", "Unauthorized transactions", "Suspicious activity", "Other prohibited financial activity"];

export const MONITORING_CLOSING = "Where legally required, a transaction may be delayed, restricted, rejected, or reported to the appropriate authority.";

export const PROHIBITED_USES = [
  "Fraudulent transactions",
  "Money laundering",
  "Terrorist financing",
  "Sanctions evasion",
  "Unauthorized financial activity",
  "Identity fraud",
  "Proceeds of crime",
  "False payment information",
  "Any activity prohibited by applicable law",
];

export const PROHIBITED_CLOSING =
  "2 Way Fund International reserves the right to suspend or restrict an account where required or permitted by law or where serious compliance or security concerns arise.";

export const FX_PARAGRAPHS = [
  "Every account-opening amount, corporate and individual alike, is stated in USD.",
  "Where a customer pays or deposits an equivalent amount in another currency, the applicable exchange rate and conversion conditions will determine the corresponding amount.",
  "Foreign exchange rates can change and therefore the equivalent local-currency amount may vary.",
];

export const FX_CHARGE_TYPES = ["Exchange-rate difference", "Currency-conversion charge", "Banking fee", "Payment-processing fee", "Tax", "Third-party charge"];

export const PROCESSING_TIME_FACTORS = [
  "Origin country",
  "Destination country",
  "Currency",
  "Payment network",
  "Receiving bank",
  "Compliance verification",
  "Transaction amount",
  "Banking hours",
  "Weekends and public holidays",
  "Additional documentation",
  "Regulatory requirements",
];

export const PROCESSING_TIME_CLOSING =
  "An account category does not automatically guarantee that every payment will be completed within a particular period.";

export const PHILOSOPHY_LEAD =
  "2 Way Fund International has developed its account structure around the concept of providing customers with different levels of international payment services according to their requirements.";

export const PHILOSOPHY_BODY =
  "From the Advantage Account Segment through Silver, Platinum, Gold, and Diamond Corporate categories, our objective is to create a structured international payment environment capable of serving both individual and corporate customers.";

export const PHILOSOPHY_PILLARS = ["Security", "Transparency", "Compliance", "Technology", "International Connectivity"];

export const ACCOUNT_CONDITIONS = [
  "Customer eligibility",
  "Identity verification",
  "KYC requirements",
  "AML/CTF requirements",
  "Sanctions screening",
  "Transaction-risk assessment",
  "Applicable laws and regulations",
  "Availability of the relevant service",
  "Completion of required documentation",
  "Acceptance of the applicable account terms",
];

export const FINAL_NOTE_PARAGRAPHS = [
  "Account-opening amounts, account categories, benefits, transaction limits, fees, eligibility criteria, and available services may be amended by 2 Way Fund International from time to time.",
  "The information on this page should always be read together with the applicable Terms & Conditions, Privacy Policy, AML/KYC Policy, Fee Schedule, Risk Disclosure, Refund/Cancellation Policy, and Account Agreement.",
  "Nothing on this page should be interpreted as a guarantee of account approval, guaranteed returns, guaranteed exchange rates, or guaranteed transaction-processing time.",
];
