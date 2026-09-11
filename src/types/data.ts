export type CurrencyCode = "USD" | "EUR" | "INR" | "GBP" | "CAD" | "JPY" | "AUD" | "SGD" | "CHF";

export type TransactionStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Rejected"
  | "Under review";

export interface User {
  id: string;
  name: string;
  accountTier: string;
  segment: string;
  reference: string;
  /** The one referral code this account owns. Unique across accounts —
   * a code identifies exactly one customer, and this customer holds
   * exactly one code. Issued by the backend at account provisioning. */
  referralCode: string;
  pan: string;
  accountNumber: string;
  country: string;
  ifsc: string;
  micr: string;
  branch: string;
  panelCode: string;
  dailyDomesticLimit: number;
  pin: string;
  pinStatus: string;
  kycStatus: string;
  lastLogin: string;
  hasPhoto: boolean;
}

export interface Balance {
  currency: CurrencyCode;
  amount: number;
  note: string;
}

export interface Transaction {
  date: string;
  time: string;
  ref: string;
  utr?: string;
  corridor: "Domestic" | "International";
  route: string;
  counterparty: string;
  valueIso: string;
  reversed: boolean;
  amended?: boolean;
  isAdjustment?: boolean;
  adjRef?: string;
  previousValueIso?: string;
  channel: string;
  beneficiary?: string;
  beneficiaryAccount?: string;
  beneficiaryBank?: string;
  routing?: string;
  commission?: number;
  commissionCurrency?: CurrencyCode;
  receives?: number;
  receivesCurrency?: CurrencyCode;
  description: string;
  sub: string;
  status: TransactionStatus;
  currency: CurrencyCode;
  amount: number;
  direction: "credit" | "debit";
}

export interface Tier {
  name: string;
  segment: string;
  openingAmt: number;
  currency: CurrencyCode;
  description: string;
}

export interface Card {
  type: "Debit" | "Credit";
  last4: string;
  expiry: string;
  forms: string[];
  capability: string;
  funding: "ledger" | "credit" | "prepaid";
  currency: CurrencyCode;
  capPerTxn?: number;
  capNote?: string;
  creditLimit?: number;
  outstanding?: number;
  prepaid?: number;
}

export interface CardLimit {
  card: string;
  capability: string;
  limit: string;
  sample: boolean;
}

export interface FeeRule {
  transactionType: string;
  charge: string;
  notes: string;
}

export interface FeeExample {
  label: string;
  gross: number;
  rate: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  detail: string;
  account: string;
  country: string;
  currency: CurrencyCode;
  internal: boolean;
  status: "Verified" | "Pending verification";
  swift?: string;
  ifsc?: string;
  bankName?: string;
  acctType?: string;
  panelCode?: string;
  cif?: string;
}

export interface Nominee {
  id: string;
  name: string;
  relationship: string;
  dob: string;
  address: string;
  guardianName: string;
  guardianRelationship: string;
  guardianAddress: string;
  registered: string;
}

export interface NomineeAuditEntry {
  at: string;
  action: string;
}

export interface UsdtMovement {
  date: string;
  time: string;
  ref: string;
  kind: string;
  detail: string;
  amount: number;
  direction: "credit" | "debit";
}

export interface Usdt {
  balance: number;
  network: "TRC20" | "ERC20";
  addresses: Record<"TRC20" | "ERC20", string>;
  rateToUsd: number;
  movements: UsdtMovement[];
}

export interface ReceivingAccount {
  currency: CurrencyCode;
  swift: string;
  gatewayId: string;
  correspondent: string;
  status: string;
}

export interface InboundCredit {
  id: string;
  received: string;
  remitter: string;
  remitterCountry: string;
  currency: CurrencyCode;
  amount: number;
  quoted: string;
  status: string;
  note: string;
}

export interface Message {
  id: string;
  to: string;
  category: string;
  priority: "Normal" | "High";
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
  read: boolean;
}

export interface AdjustmentEntry {
  ref: string;
  type: "reversal" | "correction" | "valuedate";
  targetRef: string;
  valueIso: string;
  amount: number;
  narrative: string;
  reason: string;
  note: string;
  status: "Pending authorisation" | "Posted" | "Rejected";
  maker: string;
  raisedAt: string;
  checker: string | null;
  decidedAt: string | null;
  bookedAt?: string | null;
}

export interface MaintenanceEntry {
  ref: string;
  key: string;
  label: string;
  before: string;
  after: string;
  reason: string;
  note: string;
  status: "Pending authorisation" | "Posted" | "Rejected";
  maker: string;
  raisedAt: string;
  checker: string | null;
  decidedAt: string | null;
}

export interface LedgerEvent {
  ref: string;
  currency: CurrencyCode;
  note: string;
  officer: string;
  at: string;
}

export interface KycDocument {
  id: string;
  name: string;
  icon: string;
  note: string;
  status: "Not provided" | "Received" | "Verified" | "Rejected";
  filename: string | null;
  size: string | null;
  received: string | null;
}

export interface Kyc {
  status: "Not started" | "Documents provided" | "Under verification" | "Video KYC" | "Verified" | "Rejected";
  videoSlot: string | null;
  documents: KycDocument[];
}

export interface ApplicationAudit {
  at: string;
  actor: string;
  action: string;
}

export interface Application {
  ref: string;
  /** Links this record to the customer it belongs to, once they have an
   * active account — set only once an application is provisioned. A
   * prospect still under review has no account yet, so no customerId. */
  customerId?: string;
  name: string;
  fatherName?: string;
  dob?: string;
  education?: string;
  addressCommunication?: string;
  addressPermanent?: string;
  addressOffice?: string;
  mobilePersonal?: string;
  mobileOfficial?: string;
  landline?: string;
  email: string;
  country: string;
  tier: string;
  purpose: string;
  organisation?: string;
  annualTurnover?: string;
  occupation?: string;
  annualIncome?: string;
  homeStatus?: string;
  carStatus?: string;
  crossBorderReason?: string;
  crossBorderDetail?: string;
  referral: string;
  referrer: string;
  termsAcceptedAt: string;
  submitted: string;
  status: "Submitted" | "Under review" | "Approved" | "Rejected";
  /** Whether each document has actually been persisted on the backend —
   * distinct from the eKYC page's own local document checklist (kyc
   * below), which tracks the full identity-document set client-side.
   * Signature is required for every application; business certificate
   * only for a Corporate Account tier. */
  hasPhoto?: boolean;
  hasSignature?: boolean;
  hasBusinessCertificate?: boolean;
  kyc?: Kyc;
  audit: ApplicationAudit[];
}

export interface Sector {
  name: string;
  members: string[];
}

export interface Store {
  user: User;
  rates: Record<CurrencyCode, number>;
  balances: Balance[];
  transactions: Transaction[];
  tiers: Tier[];
  cards: Card[];
  cardLimits: CardLimit[];
  feeRules: FeeRule[];
  feeExamples: FeeExample[];
  openingSteps: string[];
  serviceChargeFlow: string[];
  fxFlow: string[];
  exchangeProcess: string[];
  chain: string[];
  corridor: string[];
  conversionProcess: string[];
  paymentModel: string[];
  securityLayers: { name: string; desc: string }[];
  txFlow: string[];
  restrictFlow: string[];
  videoKycSteps: string[];
  annualKycCycle: string[];
  beneficiaries: Beneficiary[];
  nominees: Nominee[];
  nomineeRelationships: string[];
  nomineeAudit: NomineeAuditEntry[];
  usdt: Usdt;
  receivingAccounts: ReceivingAccount[];
  inbound: InboundCredit[];
  messages: Message[];
  messageCategories: string[];
  adjustments: AdjustmentEntry[];
  maintenance: MaintenanceEntry[];
  ledgerEvents: LedgerEvent[];
  maintenanceReasons: string[];
  adjustmentReasons: string[];
  countries: string[];
  purposes: string[];
  applications: Application[];
}
