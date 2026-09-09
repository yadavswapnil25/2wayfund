/** Copy for the Transaction Security page, sourced from the institution's
 * published Fund Transaction Security Policy. store.txFlow already matches
 * this policy's 11-step Security Flow (section 26) exactly, so it's reused
 * rather than duplicated here. */

export const INTRO_PARAGRAPHS = [
  "At 2 Way Fund International, the security of customer funds and transactions is a fundamental priority.",
  "Every eligible fund transaction may be subject to multiple layers of authentication, verification, monitoring, and security controls designed to reduce the risk of unauthorized access, fraud, identity theft, account takeover, and suspicious financial activity.",
  "Our transaction-security framework is designed to ensure that funds are transferred only through authorized channels and in accordance with the applicable customer account terms, security procedures, and legal requirements.",
];

export const PASSWORD_RULES = [
  "Keep the transaction password confidential",
  "Never share it with another person",
  "Avoid writing it in publicly accessible locations",
  "Avoid using easily predictable passwords",
  "Change the password when required",
  "Immediately report suspected compromise",
];

export const OTP_METHODS = ["One-Time Password (OTP)", "SMS verification", "Email verification", "Authentication application", "Device verification", "Biometric verification", "Video verification"];

export const OTP_NOTE = "Additional authentication may be required particularly for high-value, unusual, international, or high-risk transactions.";

export const BENEFICIARY_ITEMS = ["Beneficiary name", "Account number", "Bank information", "Country", "Currency", "Payment details", "Verification code"];

export const BENEFICIARY_NOTE = "A beneficiary may be subject to a verification or security waiting period before transactions are permitted.";

export const CONFIRMATION_ITEMS = ["Beneficiary Name", "Account / Payment Details", "Destination Country", "Currency", "Transaction Amount", "Exchange Rate, where applicable", "Commission / Charges", "Final Amount"];

export const HIGH_VALUE_ITEMS = ["Additional authentication", "Identity verification", "Transaction confirmation", "Source-of-funds information", "Supporting documentation", "Beneficiary verification", "Compliance review", "Additional authorization"];

export const HIGH_VALUE_NOTE = "The purpose of enhanced verification is to protect both the customer and the financial system from unauthorized or suspicious activity.";

export const MONITORING_FACTORS = ["Transaction amount", "Transaction frequency", "Customer transaction history", "Destination country", "Beneficiary information", "Device information", "Login patterns", "Unusual account activity"];

export const MONITORING_NOTE = "Monitoring does not necessarily mean that a customer has done anything wrong. It is a standard security and risk-management measure.";

export const REVIEW_STEPS = ["The transaction may be delayed", "Additional verification may be requested", "The customer may be contacted through an authorized channel", "Supporting documentation may be requested", "The transaction may be approved, rejected, or restricted according to the outcome"];

export const FREEZE_TRIGGERS = ["Multiple incorrect transaction-password attempts", "Suspicious login activity", "Unusual transaction patterns", "Suspected account takeover", "Compromised credentials", "Suspicious beneficiary activity", "Fraud indicators", "Regulatory or compliance requirements"];

export const FREEZE_NOTE = "Where the restriction results from repeated incorrect transaction-password attempts, the applicable account-security procedure may provide for a temporary restriction and additional identity verification before transaction access is restored.";

export const IDENTITY_VERIFICATION_METHODS = ["KYC verification", "Document verification", "Video KYC", "Liveness verification", "Face verification", "Previously submitted identification", "Additional security questions"];

export const VIDEO_KYC_STEPS_SHORT = ["Enable the device camera", "Show their face clearly", "Perform a liveness action such as blinking", "Present an accepted identification document", "Follow on-screen or authorized verification instructions"];

export const DEVICE_SECURITY_CONTROLS = ["Device recognition", "Login alerts", "Session monitoring", "IP/location risk assessment", "Suspicious-login detection", "Multiple-login detection", "Account-session controls"];

export const INTERNATIONAL_CHECKS = ["Security checks", "Currency verification", "Beneficiary verification", "Sanctions screening", "AML/CTF controls", "Payment-network requirements", "Regulatory checks"];

export const CURRENCY_CONVERSION_ITEMS = ["Original Currency", "Original Amount", "Exchange Rate", "Exchange Commission", "Other Applicable Charges", "Converted Currency", "Final Settlement Amount"];

export const INTERNAL_TRANSFER_CONTROLS = ["Account authentication", "Transaction authorization", "Security monitoring", "Fraud prevention", "KYC requirements", "Compliance controls"];

export const NOTIFICATION_TYPES = ["Successful transaction", "Failed transaction", "Pending transaction", "Beneficiary addition", "Beneficiary modification", "Login from a new device", "Security restriction", "Card transaction", "Withdrawal"];

export const UNAUTHORIZED_INFO_ITEMS = ["Account information", "Transaction reference", "Date and time", "Transaction amount", "Relevant supporting information", "Identity verification"];

export const REFERENCE_USES = ["Tracking", "Customer support", "Dispute resolution", "Transaction verification", "Record keeping"];

export const REFERENCE_WARNING = "Customers should not share confidential authentication information merely because someone claims to require the transaction reference.";

export interface StatusDef {
  label: string;
  variant: string;
  desc: string;
}

export const PROCESSING_STATUSES: StatusDef[] = [
  { label: "Pending", variant: "pending", desc: "The transaction is undergoing processing or verification." },
  { label: "Processing", variant: "processing", desc: "The transaction has entered the payment-processing stage." },
  { label: "Completed", variant: "completed", desc: "The transaction has been successfully processed." },
  { label: "Failed", variant: "failed", desc: "The transaction could not be completed." },
  { label: "Rejected", variant: "rejected", desc: "The transaction was not approved or could not proceed." },
  { label: "Under review", variant: "review", desc: "Additional security, compliance, or verification procedures may be in progress." },
];

export const RESPONSIBILITY_ITEMS = ["Keep passwords confidential", "Protect OTPs and authentication codes", "Use strong passwords", "Avoid suspicious links", "Verify beneficiary details", "Check transaction amounts carefully", "Keep devices updated", "Avoid using unsecured public devices", "Report suspicious activity immediately"];

export const RESPONSIBILITY_CLOSING = "Customers should never authorize a transaction simply because another person instructs them to do so.";

export const NEVER_SHARE_ITEMS = ["Transaction Password", "Account Password", "OTP", "Card PIN", "CVV/CVC", "Authentication Code"];

export const FRAUD_WARNING =
  "2 Way Fund International will not ask customers to disclose confidential authentication information through unauthorized channels. If a person claiming to represent 2 Way Fund International requests such information through an unauthorized communication channel, customers should stop the interaction and contact the Company through its official support channel.";

export const BUSINESS_CONTROLS = ["Authorized-user management", "Multiple-level authorization", "Transaction limits", "Beneficiary controls", "Corporate verification", "Supporting documentation", "Enhanced monitoring"];

export const HOLD_REASONS = ["Unusual transaction behavior", "Identity verification requirements", "Regulatory screening", "Sanctions screening", "Fraud investigation", "Beneficiary verification", "Source-of-funds verification", "Technical security concerns"];

export const HOLD_NOTE = "A temporary hold does not necessarily indicate misconduct.";

export const FINAL_CHECK_QUESTIONS = ["Who am I paying?", "How much am I sending?", "Which currency am I sending?", "Which country is receiving the funds?", "What exchange rate applies?", "What commission or charges apply?", "What amount will the beneficiary receive?"];

export interface Principle {
  name: string;
  desc: string;
}

export const SECURITY_PRINCIPLES: Principle[] = [
  { name: "Authentication", desc: "Confirming the identity of the person initiating the transaction." },
  { name: "Authorization", desc: "Confirming that the transaction is permitted." },
  { name: "Verification", desc: "Checking transaction and beneficiary information." },
  { name: "Monitoring", desc: "Identifying unusual or suspicious activity." },
  { name: "Protection", desc: "Restricting potentially unauthorized activity." },
  { name: "Compliance", desc: "Following applicable legal and regulatory requirements." },
  { name: "Customer Awareness", desc: "Providing customers with transaction information and security guidance." },
];

export const FINAL_DISCLAIMER_PARAGRAPHS = [
  "Security procedures may vary according to the customer's account, transaction amount, country, payment method, card program, beneficiary, risk profile, applicable financial institution, and regulatory requirements.",
  "2 Way Fund International may introduce additional security measures where necessary to protect customers, prevent fraud, comply with applicable laws, or maintain the integrity of its payment services.",
  "No security system can guarantee the complete elimination of fraud or unauthorized activity. Customers must therefore maintain the confidentiality of their account and authentication credentials and report suspected unauthorized activity promptly.",
];
