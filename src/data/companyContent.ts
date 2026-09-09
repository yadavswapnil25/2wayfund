/** Copy for the About Us / Company page, sourced from the institution's
 * published company profile. Kept separate from the page component so the
 * view stays focused on layout, not prose. */

export const COMPANY_TAGLINE = "Connecting Global Payments. Simplifying International Finance.";

export const COMPANY_INTRO =
  "2 Way Fund International is an international payment service provider established with a clear vision: to make cross-border payments faster, simpler, more transparent, and more accessible for individuals, businesses, and organizations operating across international borders.";

export const COMPANY_FACTS: [string, string][] = [
  ["Headquarters", "86 Rue Croix des Petits Champs, 75008 Paris, France"],
  ["Founded", "2013, by John Huke"],
  ["Industry", "International Payment Services & Digital Financial Technology"],
];

export const COMPANY_HISTORY =
  "The company was established at a time when international financial transactions could often involve multiple intermediaries, complicated procedures, currency conversion challenges, and extended processing times. Our founding vision was to build a modern financial-services platform through which international funds could move more efficiently between countries while maintaining appropriate security, transparency, and regulatory standards.";

export const VISION_LEAD = "Our vision is to contribute to a world where international payments are not limited by geographical boundaries.";

export const VISION_BODY =
  "Whether a customer needs to receive funds from another country, convert one international currency into another, or transfer converted funds to a bank account in their home country, the objective of 2 Way Fund International is to provide an efficient digital pathway for legitimate cross-border transactions.";

export const VISION_VALUES = ["Fast", "Secure", "Transparent", "Accessible", "Technology-driven", "Easy to understand"];

export const VISION_CLOSING =
  "Our long-term vision is to help create a connected international payment environment in which businesses and customers can manage legitimate cross-border financial transactions with greater convenience and confidence.";

export const PURPOSE_LEAD = "The purpose of 2 Way Fund International is to serve as a bridge between international payment corridors and local banking systems.";

export const PURPOSE_PARAGRAPHS = [
  "International payments frequently involve different currencies, banking systems, settlement mechanisms, and financial institutions. A customer may, for example, need to receive funds denominated in USD or EUR while ultimately requiring the funds in the currency used by their local banking system.",
  "2 Way Fund International is designed to facilitate this process through an international payment and currency-exchange framework.",
  "In a typical transaction, funds may originate in one country and be intended for a beneficiary located in another country. Where currency conversion is required, the applicable foreign exchange process can be performed before the converted amount is transferred through the appropriate banking or payment channel to the beneficiary's bank account.",
];

export const PURPOSE_CLOSING = "This makes 2 Way Fund International a digital bridge between international funds, currency conversion, and local settlement.";

export const PAYMENT_SERVICES_INTRO =
  "At the heart of our business is international payment processing. Our platform is designed to support legitimate cross-border payment requirements where funds need to move between different countries and currencies. For example, a customer may have a legitimate payment requirement involving the following structure:";

export const PAYMENT_CORRIDOR = ["Country A", "International Payment", "Currency Conversion", "Country B", "Beneficiary Bank Account"];

export const PAYMENT_SERVICES_CLOSING =
  "Depending on the transaction, the originating currency may be USD, EUR, or another supported currency, while the beneficiary may require settlement in their local currency. Our role is to facilitate the applicable payment and currency-conversion process through the appropriate financial infrastructure and service partners.";

export const CURRENCY_CONVERSION_INTRO = [
  "International commerce frequently requires the exchange of one currency into another.",
  "A business or individual may receive or hold funds in a major international currency such as USD or EUR, while their final financial requirement may be in a different local currency.",
  "2 Way Fund International seeks to simplify this process by providing a digital framework for eligible currency conversion associated with international payments.",
];

export const CURRENCY_CONVERSION_STEPS = [
  "Identification of the originating currency.",
  "Identification of the destination currency.",
  "Verification of the customer and transaction.",
  "Application of the applicable exchange rate and charges.",
  "Currency conversion through the appropriate payment or financial infrastructure.",
  "Settlement of the converted funds through the designated payment channel.",
];

export const CURRENCY_CONVERSION_NOTE =
  "Exchange rates, processing times, fees, and settlement conditions may vary depending on the currencies, transaction type, payment corridor, financial institutions involved, regulatory requirements, and other applicable factors.";

export const CROSS_BORDER_PARAGRAPHS = [
  "International payments are often more complex than domestic transfers because they can involve different banking networks, jurisdictions, currencies, compliance requirements, and settlement systems.",
  "Our objective is to make the digital experience easier for customers by bringing the relevant stages of an international payment process together within a structured service environment.",
  "Where a transaction is eligible and successfully processed, the converted or transferred funds may be routed through the applicable banking or payment network to the beneficiary's designated bank account.",
];

export const SETTLEMENT_FACTORS = [
  "Originating and destination countries",
  "Currency involved",
  "Banking hours",
  "Payment networks",
  "Correspondent or partner institutions",
  "Compliance verification",
  "Transaction screening",
  "Local banking regulations",
  "Weekends and public holidays",
  "Additional information or documentation requirements",
];

export const SETTLEMENT_DISCLAIMER =
  "Accordingly, any stated processing time should be understood as a target or estimated processing period rather than an unconditional guarantee.";

export const DIGITAL_APPROACH_PARAGRAPHS = [
  "2 Way Fund International was founded on the belief that technology can significantly improve the international payment experience.",
  "Traditional cross-border transactions may require customers to interact with multiple parties and financial institutions. Digital payment infrastructure can help streamline information exchange, transaction initiation, verification, currency conversion, and payment tracking.",
  "Our approach is therefore centered around digital processes that can help customers manage their international payment requirements in a more organized and transparent manner.",
  "Technology is not merely a convenience for us — it is an essential component of our vision for the future of international payments.",
];

export const SECURITY_INTRO =
  "International financial transactions require a high level of attention to security and transaction integrity. 2 Way Fund International is committed to implementing appropriate security, verification, transaction-monitoring, and risk-management measures applicable to its services and operating jurisdictions. Depending on the nature of a transaction, customers may be required to provide information or documentation necessary for:";

export const SECURITY_REQUIREMENTS = [
  "Customer identification and verification",
  "Transaction verification",
  "Anti-money laundering requirements",
  "Sanctions and restricted-party screening",
  "Fraud prevention",
  "Source-of-funds or source-of-payment checks",
  "Regulatory compliance",
  "Payment-risk assessment",
];

export const SECURITY_CLOSING =
  "A transaction may be delayed, reviewed, rejected, or subject to additional requirements where applicable laws, regulations, compliance policies, payment-network rules, or risk controls require such action. Our commitment is to maintain a responsible payment environment while protecting the integrity of the international financial system.";

export const TRANSPARENCY_PARAGRAPHS = [
  "We believe that trust is built through transparency.",
  "Customers should be able to understand the important aspects of an international transaction before proceeding, including the applicable exchange rate, fees or charges, expected processing conditions, transaction requirements, and relevant limitations.",
  "2 Way Fund International aims to provide customers with clear information regarding their transactions and the applicable service conditions.",
  "We also recognize that international transactions can be affected by circumstances beyond the direct control of a payment service provider, including banking delays, regulatory requirements, intermediary institutions, payment-network availability, and compliance reviews.",
];

export const TRANSPARENCY_CLOSING = "For this reason, our service philosophy emphasizes clear communication rather than unrealistic promises.";

export const GLOBAL_BASE_PARAGRAPHS = [
  "International payments are increasingly important in a connected global economy.",
  "Businesses may purchase goods and services from overseas suppliers. Professionals may receive legitimate international payments. Organizations may operate across multiple jurisdictions. Customers may have financial obligations or payment requirements involving another country.",
  "Each of these situations can require an efficient mechanism for moving funds across borders.",
  "2 Way Fund International seeks to support this global financial connectivity by providing payment services designed around international transactions and currency requirements.",
];

export const GLOBAL_BASE_CLOSING = "Our objective is not simply to move money from one location to another. Our objective is to help make the international payment journey simpler, more structured, and more transparent.";

export interface Pillar {
  name: string;
  desc: string;
}

export const COMMITMENT_PILLARS: Pillar[] = [
  { name: "Speed", desc: "Reducing unnecessary complexity and enabling eligible transactions to move efficiently through the appropriate payment infrastructure." },
  { name: "Security", desc: "Protecting customer information and transaction processes through appropriate technical and operational safeguards." },
  { name: "Transparency", desc: "Providing clear information regarding transaction requirements, applicable charges, exchange rates, and processing conditions." },
  { name: "Compliance", desc: "Operating responsibly within the laws, regulations, licensing requirements, and financial-system rules applicable to the services and jurisdictions in which we operate." },
  { name: "Innovation", desc: "Continuously exploring technology-driven approaches that can improve the international payment experience." },
  { name: "Customer Experience", desc: "Building services that are understandable and practical for customers dealing with international payment requirements." },
];

export interface Milestone {
  title: string;
  desc: string;
}

export const JOURNEY_MILESTONES: Milestone[] = [
  { title: "2013 — The Beginning", desc: "2 Way Fund International was founded by John Huke in 2013 with a vision to contribute to the digital transformation of international payments." },
  { title: "Building a Digital Payment Vision", desc: "The company's founding concept was based on a simple but ambitious idea: international payments should become easier to initiate, process, convert, and settle through modern digital infrastructure." },
  { title: "International Connectivity", desc: "Over time, the vision has remained focused on connecting international payment requirements with appropriate currency-conversion and banking settlement channels." },
  { title: "Looking Ahead", desc: "The future of international finance will increasingly depend on secure digital infrastructure, efficient payment networks, transparent processes, and responsible financial technology. 2 Way Fund International intends to continue developing in line with these principles." },
];

export interface ModelStep {
  title: string;
  desc: string;
}

export const PAYMENT_MODEL_STEPS: ModelStep[] = [
  { title: "Payment Initiation", desc: "The customer initiates an eligible international payment through the available service channel." },
  { title: "Customer & Transaction Verification", desc: "Required customer and transaction information is reviewed in accordance with applicable compliance and security procedures." },
  { title: "International Payment Processing", desc: "The payment is processed through the relevant payment infrastructure or financial partners." },
  { title: "Currency Conversion", desc: "Where required, the originating currency may be converted into the beneficiary's requested or applicable destination currency." },
  { title: "Settlement", desc: "Following successful processing and applicable checks, the funds are routed through the relevant payment or banking channel." },
  { title: "Beneficiary Receives Funds", desc: "The converted funds may ultimately be credited to the beneficiary's designated bank account, subject to the applicable banking and settlement conditions." },
];

export const PAYMENT_MODEL_CLOSING =
  "This process may differ depending on the countries, currencies, transaction type, financial institutions, and regulatory requirements involved.";

export const PHILOSOPHY_PARAGRAPHS = [
  "We believe international financial connectivity should be built on trust, technology, responsibility, and transparency.",
  "A truly modern payment service is not defined only by how quickly a transaction can be initiated. It is also defined by how securely the transaction is processed, how clearly customers are informed, how effectively risks are managed, and how responsibly the service operates within the financial system.",
  "For 2 Way Fund International, innovation and responsibility must move together.",
];

export const FUTURE_PARAGRAPHS = [
  "The international payment industry continues to evolve rapidly.",
  "Digital currencies, real-time payment networks, automated compliance systems, advanced fraud detection, API-based banking infrastructure, and modern financial technologies are changing the way money moves around the world.",
  "2 Way Fund International believes that the future belongs to payment systems that combine:",
];

export const FUTURE_FORMULA = ["Global Connectivity", "Digital Technology", "Security", "Compliance", "Transparency"];

export const FUTURE_CLOSING =
  "Our goal is to continue working toward a more efficient international payment environment where legitimate cross-border transactions can be managed with greater speed, clarity, and confidence.";

export const PROMISE_PARAGRAPHS = [
  "At 2 Way Fund International, we understand that every international payment represents more than a transaction.",
  "It may represent a business relationship, an international purchase, a professional service, an organizational requirement, or an important financial obligation.",
  "That is why we strive to treat every eligible transaction with professionalism, security, transparency, and responsibility.",
];

export const CLOSING_STATEMENT = "From one country to another, from one currency to another, our purpose is to help make international payments simpler.";
