export type AccessLevel = "public" | "anon" | "customer" | "admin";

export interface RouteDef {
  path: string;
  tab: string | null;
  crumb: string;
  group?: string;
  access: AccessLevel;
}

export const ROUTES: RouteDef[] = [
  { path: "/login", tab: null, crumb: "Customer Login", access: "public" },
  { path: "/admin-login", tab: null, crumb: "Staff Login", access: "public" },
  { path: "/set-password", tab: null, crumb: "Set Your Password", access: "public" },
  { path: "/denied", tab: null, crumb: "Access Denied", access: "public" },
  { path: "/", tab: "Account & Passbook", crumb: "Accounts › Account & Passbook", group: "Accounts", access: "customer" },
  { path: "/transfer", tab: "Transfer Funds", crumb: "Transfers › Transfer Funds", group: "Transfers", access: "customer" },
  { path: "/beneficiaries", tab: "Beneficiaries", crumb: "Transfers › Manage Beneficiaries", group: "Transfers", access: "customer" },
  { path: "/nominees", tab: "Nominees", crumb: "Transfers › Nomination", group: "Transfers", access: "customer" },
  { path: "/receive", tab: null, crumb: "Transfers › Receive International Payment", group: "Transfers", access: "customer" },
  { path: "/domestic", tab: "Domestic (INR)", crumb: "Accounts › Domestic Transactions", group: "Accounts", access: "customer" },
  { path: "/international", tab: "Foreign Currency", crumb: "Accounts › International Transactions", group: "Accounts", access: "customer" },
  { path: "/statements", tab: "Statements", crumb: "Accounts › Statements & Receipts", group: "Accounts", access: "customer" },
  { path: "/pin-security", tab: "9-Digit PIN & Security", crumb: "Accounts › 9-Digit PIN & Security", group: "Accounts", access: "customer" },
  // { path: "/exchange", tab: "Forex", crumb: "Transfers › Currency Exchange", group: "Transfers", access: "customer" },
  // { path: "/usdt", tab: "USDT Wallet", crumb: "Transfers › USDT Wallet", group: "Transfers", access: "customer" },
  { path: "/cards", tab: "Cards", crumb: "Cards › Card Services", group: "Cards", access: "customer" },
  { path: "/console", tab: "Console Home", crumb: "Operations › Console Home", group: "Administration", access: "admin" },
  { path: "/admin", tab: "Compliance Console", crumb: "Administration › Compliance Console", group: "Administration", access: "admin" },
  { path: "/messages", tab: "Customer Messaging", crumb: "Administration › Customer Messaging", group: "Administration", access: "admin" },
  { path: "/adjustments", tab: "Ledger Adjustments", crumb: "Administration › Ledger Adjustments", group: "Administration", access: "admin" },
  { path: "/customer-data", tab: "Customer Data", crumb: "Administration › Customer Data Maintenance", group: "Administration", access: "admin" },
  { path: "/home", tab: null, crumb: "Home", access: "public" },
  { path: "/clients", tab: null, crumb: "Clients & Sectors", access: "public" },
  { path: "/more", tab: null, crumb: "More", access: "public" },
  { path: "/e-security", tab: "e-Security", crumb: "Services › e-Security", group: "Services", access: "public" },
  { path: "/accounts", tab: "Account Types", crumb: "Accounts › Account Types", group: "Services", access: "public" },
  { path: "/account-services", tab: "Account Services", crumb: "Services › Account Services", group: "Services", access: "public" },
  { path: "/card-services", tab: "Card Services", crumb: "Services › Card Services", group: "Services", access: "public" },
  { path: "/exchange-services", tab: "Exchange Services", crumb: "Services › Exchange Services", group: "Services", access: "public" },
  { path: "/fee-policy", tab: "Fee Policy", crumb: "Services › Fee Policy", group: "Services", access: "public" },
  { path: "/transaction-security", tab: "Transaction Security", crumb: "Services › Transaction Security", group: "Services", access: "public" },
  { path: "/privacy-policy", tab: "Privacy Policy", crumb: "Services › Privacy Policy", group: "Services", access: "public" },
  { path: "/open-account", tab: "Open an Account", crumb: "Services › Open an Account", group: "Services", access: "anon" },
  { path: "/ekyc", tab: "eKYC", crumb: "Services › eKYC Verification", group: "Services", access: "public" },
  { path: "/fees", tab: "Charges", crumb: "Services › Fees & Charges", group: "Services", access: "public" },
  { path: "/security", tab: "Security", crumb: "Security › Security & KYC", group: "Services", access: "public" },
  { path: "/company", tab: "About", crumb: "About › Company Profile", group: "Services", access: "public" },
];

export const NAV_GROUPS = ["Accounts", "Transfers", "Cards", "Services", "Administration"];

export interface PublicNavItem {
  label: string;
  path: string;
}

export interface PublicNavGroup {
  label: string;
  items: PublicNavItem[];
}

/** Top-level links shown directly in the public navbar. */
export const PUBLIC_NAV_PRIMARY: PublicNavItem[] = [
  { label: "Home", path: "/home" },
  { label: "About Us", path: "/company" },
  { label: "Clients", path: "/clients" },
];

/** Remaining public pages, grouped under a dropdown so the navbar stays
 * scannable as the site grows — eleven flat tabs stopped fitting on one row. */
export const PUBLIC_NAV_GROUPS: PublicNavGroup[] = [
  {
    label: "Services",
    items: [
      { label: "Account Services", path: "/account-services" },
      { label: "Card Services", path: "/card-services" },
      { label: "Exchange Services", path: "/exchange-services" },
      { label: "Fee Policy", path: "/fee-policy" },
    ],
  },
  {
    label: "Security & Legal",
    items: [
      { label: "About KYC", path: "/security" },
      { label: "Transaction Security", path: "/transaction-security" },
      { label: "e-Security", path: "/e-security" },
      { label: "Privacy Policy", path: "/privacy-policy" },
    ],
  },
];

/** Two demo credentials for this account, printed on-screen exactly as a
 * real institution never would — nothing here is a real secret. */
export const CREDENTIALS = {
  customer: { user: "aditi.sharma", pass: "demo1234", secureCode: "20260817" },
  admin: { user: "compliance.officer", pass: "admin1234" },
};

export interface TransferChannel {
  id: "IMPS" | "NEFT" | "RTGS";
  label: string;
  sub: string;
  clearing: string;
  minAmount: number;
}

export const TRANSFER_CHANNELS: TransferChannel[] = [
  { id: "IMPS", label: "IMPS", sub: "Instant (24x7)", clearing: "Real-time Clearing", minAmount: 0 },
  { id: "NEFT", label: "NEFT", sub: "National Clearing", clearing: "Batched Clearing", minAmount: 0 },
  { id: "RTGS", label: "RTGS", sub: "High Value (> 2 Lakh)", clearing: "High-Value Real-Time Clearing", minAmount: 200000 },
];

export const REVIEW_THRESHOLD_USD = 25000;

export const BANK_PRESETS: { short: string; full: string }[] = [
  { short: "State", full: "State Bank of India" },
  { short: "HDFC", full: "HDFC Bank" },
  { short: "ICICI", full: "ICICI Bank" },
  { short: "Punjab", full: "Punjab National Bank" },
  { short: "Axis", full: "Axis Bank" },
  { short: "Bank", full: "Bank of Baroda" },
];

export interface Sector {
  name: string;
  members: string[];
}

export const SECTORS: Sector[] = [
  { name: "Technology", members: ["Northvale Systems Ltd", "Corvid Cloud SAS", "Meridian Data Works"] },
  { name: "E-commerce", members: ["Marketa Group", "Harbourline Retail", "Blue Anchor Trading"] },
  { name: "Aviation", members: ["Vantara Airways Pvt Ltd", "Skyfarer Cargo", "Aeris Charter"] },
  { name: "Telecom", members: ["Loopwave Communications", "Tessera Networks"] },
  { name: "Manufacturing", members: ["Ironmoor Industries", "Castlewick Components", "Salter & Vane Ltd"] },
  { name: "Professional services", members: ["Ashcroft Advisory", "Pelham Legal LLP", "Rowan Audit Partners"] },
];

export const REFERRERS: Record<string, string> = {
  "2WF-DEMO01": "Demonstration partner",
  "2WF-PART22": "Northvale Systems Ltd — channel partner",
  "2WF-STAFF7": "Internal staff referral",
};

export const MSG_TEMPLATES = [
  { label: "— blank —", category: null as string | null, subject: "", body: "" },
  {
    label: "Scheduled maintenance", category: "Service notice",
    subject: "Scheduled maintenance — [date], [window]",
    body: "International payment processing will be unavailable for approximately [duration] while settlement systems are upgraded.\n\nBalances and statements remain viewable throughout. Transfers submitted during the window will queue and release automatically once processing resumes.\n\nNo action is required from you.",
  },
  {
    label: "Statement ready", category: "Statement available",
    subject: "Your [month] statement is ready",
    body: "Your consolidated statement for [month] is available under Statements & Receipts.\n\nIt covers all currency ledgers and can be downloaded as CSV or printed.",
  },
  {
    label: "Transaction held for review", category: "Security alert",
    subject: "A transaction has been held for compliance review",
    body: "Reference [ref] has been held for compliance screening before settlement.\n\nThis is a routine check. A reviewer will adjudicate it and the outcome will appear on your ledger.\n\nNo action is required from you, and no payment or verification is needed to release it. Anyone telling you otherwise is not from this institution.",
  },
  {
    label: "eKYC re-submission required", category: "KYC update",
    subject: "A document needs to be re-submitted",
    body: "One of the documents provided for identity verification could not be read clearly.\n\nPlease replace it under eKYC Verification. Verification completes on our own schedule once the document is legible — there is never a fee to complete or accelerate it.",
  },
];

export const ACCOUNT_OPENED_ISO = "2026-01-01";
