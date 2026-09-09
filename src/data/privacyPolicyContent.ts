/** Copy for the Privacy Policy page, sourced from the institution's
 * published privacy policy. Section 20 (Contact Us — head office address,
 * placeholder website/email) is deliberately omitted: it's administrative
 * boilerplate, not policy content, and this prototype has no real contact
 * channel to point to. Everything here describes what a production
 * institution's stated policy would be — this specific prototype collects
 * nothing, per the callout at the top of the page. */

export const POLICY_INTRO = [
  "2 Way Fund International (\"2 Way Fund International\", \"Company\", \"we\", \"us\" or \"our\") respects the privacy of individuals who use our website, digital platforms, payment-related services, and communication channels.",
  "This Privacy Policy explains how we collect, use, store, protect, and disclose personal information when you interact with our services.",
  "Because we operate in the international payment environment, certain information may be necessary to process transactions, comply with financial regulations, prevent fraud, and meet legal and regulatory obligations.",
];

export const COMMITMENT_GOALS = ["Protect customer information", "Process personal information responsibly", "Maintain appropriate security controls", "Be transparent about data usage", "Respect applicable privacy rights", "Prevent unauthorized access and misuse"];

export interface InfoCategory {
  letter: string;
  title: string;
  items: string[];
  note?: string;
}

export const INFO_CATEGORIES: InfoCategory[] = [
  { letter: "A", title: "Identity Information", items: ["Full name", "Date of birth", "Nationality, where legally required", "Government-issued identification information", "Tax identification information", "Verification information", "Photograph or identification document information where required"] },
  { letter: "B", title: "Contact Information", items: ["Email address", "Telephone/mobile number", "Residential address", "Business address", "Postal address", "Other contact information supplied by you"] },
  { letter: "C", title: "Financial and Payment Information", items: ["Bank account details", "IBAN", "SWIFT/BIC", "Payment information", "Transaction amounts", "Currency information", "Beneficiary details", "Sender information", "Payment reference", "Transaction history", "Source-of-funds information where required"], note: "We do not collect financial information merely for advertising purposes." },
  { letter: "D", title: "Business Information", items: ["Business name", "Registration information", "Business address", "Authorized representative information", "Corporate documentation", "Ownership or control information where required", "Business transaction information"] },
  { letter: "E", title: "Technical Information", items: ["IP address", "Browser type", "Device type", "Operating system", "Language preference", "Login information", "Date and time of access", "Website activity", "Security logs", "Device identifiers where applicable"] },
];

export const COLLECTION_METHODS = ["Directly from you", "When you create an account", "When you request a payment", "When you submit a transaction", "When you contact customer support", "During identity verification", "Through authorized service providers", "Through financial institutions or payment partners where legally permitted", "Automatically through website technologies", "From public or legally accessible sources where appropriate"];

export interface Purpose {
  title: string;
  desc: string;
}

export const USE_PURPOSES: Purpose[] = [
  { title: "Service Delivery", desc: "To provide, administer, and improve our payment-related services." },
  { title: "Transaction Processing", desc: "To initiate, verify, process, monitor, and settle eligible transactions." },
  { title: "Identity Verification", desc: "To verify the identity of customers and authorized users." },
  { title: "Fraud Prevention", desc: "To detect and prevent fraud, account abuse, unauthorized transactions, and other security threats." },
  { title: "AML and Compliance", desc: "To comply with applicable anti-money laundering, sanctions, counter-terrorist financing, tax, financial-services, and other legal requirements." },
  { title: "Customer Support", desc: "To respond to questions, complaints, service requests, and transaction-related inquiries." },
  { title: "Security", desc: "To protect our website, systems, customers, employees, partners, and financial infrastructure." },
  { title: "Legal Obligations", desc: "To comply with legal orders, regulatory requests, court proceedings, and lawful government requests." },
];

export const LEGAL_BASES = ["Performance of a contract", "Compliance with a legal obligation", "Legitimate interests", "Consent", "Protection of vital interests where applicable", "Other lawful bases recognized by applicable law"];

export const LEGAL_BASIS_NOTE = "Where applicable under relevant privacy legislation, including the EU General Data Protection Regulation (\"GDPR\"), the applicable legal basis may differ depending on the type of information and purpose of processing.";

export const PAYMENT_DATA_USES = ["Processing payments", "Currency conversion", "Transaction verification", "Fraud prevention", "Compliance", "Record keeping", "Customer support", "Dispute resolution"];

export const PAYMENT_DATA_NOTE = "Payment information requires particular care. We do not sell customer financial information to advertisers.";

export const SHARING_RECIPIENTS = ["Banks", "Payment institutions", "Correspondent financial institutions", "Currency-exchange providers", "Identity-verification providers", "Fraud-prevention providers", "Technology and infrastructure providers", "Cloud-service providers", "Professional advisers", "Auditors", "Regulators", "Law-enforcement authorities", "Courts or government authorities where legally required"];

export const SHARING_NOTE = "We may share information with appropriate third parties where necessary and legally permitted. Third parties receiving information may be subject to contractual, legal, regulatory, confidentiality, or security obligations.";

export const INTERNATIONAL_TRANSFER_NOTE = "Because our services may involve international transactions, personal information may sometimes need to be processed or transferred across national borders. Where applicable, we will seek to use appropriate legal safeguards — recognized adequacy mechanisms, contractual safeguards, or other legally permitted transfer mechanisms.";

export const SECURITY_THREATS = ["Unauthorized access", "Unauthorized disclosure", "Loss", "Destruction", "Alteration", "Misuse", "Fraud", "Security threats"];

export const SECURITY_NOTE = "Security measures may include access controls, authentication mechanisms, encryption where appropriate, monitoring, logging, and security procedures. However, no internet-based system can be guaranteed to be completely secure.";

export const RETENTION_REASONS = ["AML requirements", "Tax obligations", "Financial regulations", "Accounting requirements", "Legal claims", "Regulatory investigations", "Fraud prevention"];

export const RETENTION_NOTE = "We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, unless a longer retention period is required or permitted by law. After the applicable retention period, information will be securely deleted, anonymized, or otherwise handled in accordance with applicable law.";

export const COOKIE_USES = ["Website functionality", "Authentication", "Security", "User preferences", "Performance analysis", "Website improvement", "Analytics, where permitted"];

export const COOKIE_NOTE = "Where legally required, we will request appropriate consent before using non-essential cookies or similar technologies. Users may be able to control cookies through their browser or available cookie-management settings.";

export const MARKETING_PARAGRAPHS = [
  "Where permitted by applicable law, we may send service-related communications necessary for account administration or transactions.",
  "Marketing communications will be handled according to applicable consent and opt-out requirements. You may be able to unsubscribe from promotional communications by following the instructions provided in the communication. Service-critical communications may continue where necessary.",
];

export const PRIVACY_RIGHTS = ["Access your personal information", "Request correction of inaccurate information", "Request deletion where legally available", "Restrict certain processing", "Object to certain processing", "Request data portability", "Withdraw consent where processing is based on consent", "Lodge a complaint with a competent data-protection authority"];

export const RIGHTS_NOTE = "These rights are not absolute and may be subject to legal exceptions. For example, we may be required to retain certain financial or transaction information even if a customer requests deletion.";

export const RECORDS_NOTE = "Where financial regulations require customer verification or transaction records to be retained, we may be legally unable to immediately delete certain information. In such circumstances, information will be retained only for the period and purposes required by applicable law.";

export const CHILDRENS_PRIVACY_PARAGRAPHS = [
  "Our financial services are not intended for children who are below the minimum legal age required to enter into financial or contractual arrangements. We do not knowingly provide financial services to individuals who are legally ineligible to use them.",
  "If we become aware that information has been collected from an individual who is not legally eligible, we may take appropriate steps in accordance with applicable law.",
];

export const THIRD_PARTY_SITES_NOTE = "Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of independent third parties. Customers should review the privacy policy of any third-party website before providing personal information.";

export const FRAUD_MONITORING_NOTE = "To protect customers and the financial system, transactions and account activity may be monitored for security, fraud prevention, compliance, and risk-management purposes. Automated systems may be used as part of these processes. Where applicable law provides rights relating to automated decision-making or profiling, those rights will be respected subject to relevant legal exceptions.";

export const BREACH_NOTE = "If we become aware of a personal-data security incident, we will assess and respond to it in accordance with applicable law. Where notification to customers or regulators is legally required, we will provide the appropriate notification within the applicable legal timeframe.";

export const POLICY_CHANGE_REASONS = ["Changes in our services", "Changes in technology", "Changes in applicable laws", "Regulatory requirements", "Changes in data-processing practices"];

export const POLICY_CHANGE_NOTE = "The latest version will be made available through our official website. The \"Last Updated\" date at the beginning of this document will indicate when the policy was most recently revised.";

export const DPA_NOTE = "Where applicable, individuals may have the right to lodge a complaint with the relevant data-protection supervisory authority in their country or jurisdiction. For individuals protected by EU data-protection law, this may include the competent supervisory authority in the country where the individual lives, works, or where an alleged infringement occurred.";

export const ACKNOWLEDGEMENT_NOTE = "By using our website or services, you acknowledge that you have read and understood this Privacy Policy. We are committed to handling personal information responsibly and to maintaining appropriate standards of privacy, security, transparency, and regulatory compliance.";
