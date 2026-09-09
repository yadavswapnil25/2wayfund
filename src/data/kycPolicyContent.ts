/** Copy for the About KYC & Security page, sourced from the institution's
 * published KYC, Transaction Security & Video KYC policy. The three flows
 * (restrictFlow, videoKycSteps, annualKycCycle) already live on the Store —
 * they were seeded directly from this same policy — so only the
 * surrounding narrative content lives here. */

export const KYC_INTRO =
  "2 Way Fund International places strong emphasis on customer identification, transaction security, fraud prevention, and protection of customer accounts. To help protect customers against unauthorized transactions, identity theft, credential misuse, and fraudulent activity, the Company may apply additional security verification when unusual or potentially unauthorized activity is detected.";

export const KYC_DEFINITION =
  "KYC means Know Your Customer — the process through which 2 Way Fund International verifies the identity and relevant information of its customers before providing applicable account or financial services.";

export const KYC_DOCUMENTS = [
  "Full legal name",
  "Date of birth",
  "Residential address",
  "Mobile number",
  "Email address",
  "Government-issued identification",
  "Tax identification information, where applicable",
  "Address verification",
  "Source-of-funds information, where required",
];

export const PASSWORD_SECURITY_NOTE =
  "Customers may be required to use a separate Transaction Password / Transaction PIN / Authentication Credential to authorize certain transactions. Customers must keep their transaction credentials confidential and must not share them with any other person. 2 Way Fund International will never encourage customers to disclose their confidential transaction password to unauthorized persons.";

export const THREE_ATTEMPTS_NOTE =
  "If a customer enters an incorrect transaction password three consecutive times, transaction functionality may be automatically restricted. The relevant account or transaction facility may be placed under a temporary 7-day security freeze, subject to the applicable account terms and security procedures.";

export const RESTRICTION_EFFECTS = ["New transactions may be disabled", "Certain payment functions may be unavailable", "Transaction authorization may be suspended", "Additional identity verification may be required"];

export const RESTRICTION_CLOSING = "The restriction is intended as a protective security measure and does not, by itself, indicate that the customer has committed any wrongdoing.";

export const SECURITY_WARNING =
  "2 Way Fund International will not require customers to provide confidential passwords, OTPs, card PINs, or other authentication credentials to an unauthorized individual claiming to conduct Video KYC. Customers should complete Video KYC only through the Company's authorized verification channel. If a person claiming to represent the Company asks a customer to send their password, OTP, card PIN, or other confidential authentication information, the customer should stop the interaction and contact the Company's official support channel.";

export interface VideoKycStep {
  title: string;
  desc: string;
}

export const VIDEO_KYC_PROCESS: VideoKycStep[] = [
  { title: "Enable Camera", desc: "Allow the authorized verification system to access the device camera." },
  { title: "Face Verification", desc: "Position their face clearly in front of the camera. The process may use a live-person check to help confirm the person completing verification is physically present." },
  { title: "Blink / Liveness Verification", desc: "The customer may be instructed to blink or perform another simple facial movement, to help distinguish a live person from a photograph, screenshot, or other static image." },
  { title: "Show an Existing ID", desc: "The customer may be required to show one valid identification document previously submitted during account opening, held clearly in front of the camera when instructed." },
  { title: "Verification", desc: "The verification system or an authorized verification officer may compare the customer's live appearance and submitted identification information." },
  { title: "Completion", desc: "Once the required verification has been successfully completed, the request may be forwarded for the applicable security/compliance review." },
];

export const ACCEPTABLE_ID_NOTE =
  "For Video KYC, the customer may be required to present an identification document that was previously provided during account opening. Depending on the applicable jurisdiction and account requirements, this may include an appropriate government-issued identification document. Customers should present the original and valid document where the verification process requires it.";

export const LIVENESS_ACTIONS = ["Look directly at the camera", "Blink", "Turn their head", "Follow an on-screen instruction", "Move naturally", "Complete another simple verification action"];

export const LIVENESS_CLOSING =
  "These actions are designed to help confirm that the verification is being performed by a live person rather than through a photograph, recorded video, or other fraudulent method.";

export const RESTORATION_CHECKS = ["Security checks", "Transaction review", "Compliance review", "Identity verification", "Fraud screening", "Risk assessment"];

export const RESTORATION_NOTE =
  "Successful Video KYC does not automatically guarantee immediate restoration in every case. Where all applicable requirements are satisfied, the relevant transaction facility may be restored and the customer may resume eligible transactions.";

export const ANNUAL_PURPOSE_ITEMS = [
  "Customer identity information remains current",
  "Identification documents remain valid",
  "Customer information has not materially changed without notification",
  "The account continues to be associated with the legitimate customer",
  "Security and compliance requirements remain satisfied",
];

export const FAILURE_CONSEQUENCES = ["Transactions", "Withdrawals", "Transfers", "Card services", "Currency conversion", "Other financial services"];

export const FAILURE_NOTE =
  "If a customer does not complete a required KYC update within the applicable period, 2 Way Fund International may restrict certain account functions until the required verification is completed.";

export const INFO_CHANGE_ITEMS = ["Name", "Residential address", "Mobile number", "Email address", "Identification document", "Tax information"];

export const INFO_CHANGE_NOTE = "Customers should promptly notify 2 Way Fund International if important account information changes. The Company may request additional documentation or verification following a material change.";

export const PRIVACY_NOTE =
  "Information collected during KYC and Video KYC may include personal information, identification information, images, video, and verification data. Such information should be collected, processed, stored, retained, and protected in accordance with the Company's applicable Privacy Policy and relevant data-protection laws. Where permitted or required, Video KYC sessions may be recorded or retained for verification, security, audit, compliance, and legal purposes.";

export const RESPONSIBILITY_ITEMS = [
  "Keeping transaction passwords confidential",
  "Using only their own account",
  "Providing genuine information",
  "Presenting valid identification",
  "Completing required KYC updates",
  "Following Video KYC instructions",
  "Reporting suspected unauthorized activity promptly",
];

export const RESPONSIBILITY_CLOSING = "Customers must not attempt to bypass KYC or security controls.";

export const COMMITMENT_TAGLINE = "Secure Identity. Secure Transactions. Trusted Financial Services.";
