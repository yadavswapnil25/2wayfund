import type { Store } from "../types/data";

/**
 * Seed data for the prototype. Shaped so a later port to a real API is a
 * change of source, not a change of views. All figures are fictional.
 */
export function createSeedStore(): Store {
  return {
    user: {
      id: "u_0001",
      name: "Aditi Sharma",
      accountTier: "Master Account",
      segment: "Platinum",
      reference: "2WFMP04817",
      pan: "ABCDE1234F",
      // One account number carries every transaction on the relationship.
      // Shown in full — this account belongs to the customer viewing it.
      accountNumber: "410079004817",
      country: "India",
      ifsc: "TWFD0004409",
      micr: "110022099",
      branch: "Central Electronic Hub",
      panelCode: "PNL-IN-4817",
      dailyDomesticLimit: 1000000,
      // Never displayed anywhere in the UI — only its presence/status is
      // shown — and changed in place by the 9-Digit PIN & Security page.
      pin: "418200773",
      pinStatus: "Active",
      kycStatus: "Verified",
      lastLogin: "07 Sep 2026, 21:24:40 IST",
    },

    rates: {
      USD: 1,
      EUR: 0.92,
      INR: 83.1,
      GBP: 0.78,
      CAD: 1.36,
      JPY: 149.2,
      AUD: 1.52,
      SGD: 1.34,
      CHF: 0.88,
    },

    balances: [
      { currency: "USD", amount: 128450.0, note: "Primary settlement ledger" },
      { currency: "EUR", amount: 64220.0, note: "European corridor" },
      { currency: "INR", amount: 4210000.0, note: "Domestic corridor" },
      { currency: "GBP", amount: 18900.0, note: "Reserve ledger" },
    ],

    transactions: [
      {
        date: "28 Aug 2026", time: "09:41", ref: "2WF-TX-88214", corridor: "International",
        route: "SWIFT NRTHGB2L", counterparty: "United Kingdom", valueIso: "2026-08-28", reversed: false,
        channel: "Correspondent wire", description: "Inbound wire — Northvale Systems Ltd",
        sub: "Corridor GB → FR · ref 2WF-TX-88214", status: "Completed", currency: "USD",
        amount: 42000.0, direction: "credit",
      },
      {
        date: "26 Aug 2026", time: "14:08", ref: "2WF-TX-88213", corridor: "International",
        route: "Internal FX", counterparty: "France", valueIso: "2026-08-26", reversed: false,
        channel: "Currency exchange", description: "Currency conversion USD → EUR",
        sub: "Gross 18,400.00 less 2% commission", status: "Completed", currency: "EUR",
        amount: 18032.0, direction: "credit",
      },
      {
        date: "24 Aug 2026", time: "11:22", ref: "2WF-TX-88212", corridor: "International",
        route: "On-platform", counterparty: "India", valueIso: "2026-08-24", reversed: false,
        channel: "Internal transfer", description: "Internal transfer — 2WF account 04412",
        sub: "Internal transfer · no charge applied", status: "Completed", currency: "USD",
        amount: 7500.0, direction: "debit",
      },
      {
        date: "21 Aug 2026", time: "18:55", ref: "2WF-TX-88211", corridor: "International",
        route: "Card network", counterparty: "France", valueIso: "2026-08-21", reversed: false,
        channel: "Debit card ••4417", description: "Card settlement — point of sale, Paris",
        sub: "Debit card ••4417", status: "Completed", currency: "EUR", amount: 1240.5, direction: "debit",
      },
      {
        date: "19 Aug 2026", time: "10:03", ref: "2WF-TX-88210", utr: "UTR506739928210",
        corridor: "Domestic", route: "IFSC VNTR0004512", counterparty: "India", valueIso: "2026-08-19",
        reversed: false, channel: "Beneficiary payout", description: "Beneficiary payout — Vantara Airways",
        beneficiary: "Vantara Airways Pvt Ltd", beneficiaryAccount: "XXXXXXXX5510", beneficiaryBank: "2 Way Fund International",
        routing: "VNTR0004512", sub: "Held for compliance screening", status: "Under review", currency: "INR",
        amount: 980000.0, direction: "debit",
      },
      {
        date: "17 Aug 2026", time: "12:14", ref: "2WF-TX-88209B", utr: "UTR506739917532",
        corridor: "Domestic", route: "IFSC", counterparty: "India", valueIso: "2026-08-17",
        reversed: false, channel: "Inward clearing", description: "Inward clearing — monthly consulting retainer",
        sub: "Received via IMPS · IFSC-routed", status: "Completed", currency: "INR",
        amount: 150000.0, direction: "credit",
      },
      {
        date: "16 Aug 2026", time: "07:36", ref: "2WF-TX-88209", corridor: "Domestic",
        route: "Biller network", counterparty: "India", valueIso: "2026-08-16", reversed: false,
        channel: "Recharge card ••3390", description: "Utility recharge — electricity biller",
        sub: "Recharge card ••3390 · zero service charge", status: "Completed", currency: "INR",
        amount: 4300.0, direction: "debit",
      },
      {
        date: "14 Aug 2026", time: "16:19", ref: "2WF-TX-88208", corridor: "International",
        route: "SWIFT CRVDFRPP", counterparty: "France", valueIso: "2026-08-14", reversed: false,
        channel: "Correspondent wire", description: "Inbound wire — Corvid Cloud SAS",
        sub: "Awaiting correspondent confirmation", status: "Processing", currency: "EUR",
        amount: 26000.0, direction: "credit",
      },
      {
        date: "11 Aug 2026", time: "09:47", ref: "2WF-TX-88207", corridor: "International",
        route: "Charge", counterparty: "France", valueIso: "2026-08-11", reversed: false,
        channel: "Commission", description: "Commission — standard transaction 2%",
        sub: "Applied to inbound wire 2WF-TX-88214", status: "Completed", currency: "USD",
        amount: 840.0, direction: "debit",
      },
    ],

    tiers: [
      { name: "Corporate Account", segment: "Diamond", openingAmt: 10000000, currency: "INR", description: "Institutional and business accounts with the full international payment service set." },
      { name: "3D Account", segment: "Gold", openingAmt: 20000, currency: "USD", description: "Highest individual tier; priority handling on cross-border settlement." },
      { name: "Master Account", segment: "Platinum", openingAmt: 18000, currency: "USD", description: "Multi-currency ledgers with full card issuance and exchange access." },
      { name: "Classic Account", segment: "Silver", openingAmt: 15000, currency: "USD", description: "Standard international account with debit and recharge card eligibility." },
      { name: "General Account", segment: "Advantage", openingAmt: 13000, currency: "USD", description: "Entry tier covering core transfer, conversion and recharge services." },
    ],

    cards: [
      { type: "Debit", last4: "4417", expiry: "09/29", forms: ["Digital", "Physical"], capability: "ATM cash withdrawal, point-of-sale purchase and online payment against available balance.", funding: "ledger", currency: "USD", capPerTxn: 25000, capNote: "Point-of-sale daily cap" },
      { type: "Credit", last4: "8206", expiry: "09/29", forms: ["Digital", "Physical"], capability: "High-value swipe and transaction capability over supported international payment networks.", funding: "credit", currency: "USD", creditLimit: 50000, outstanding: 12400 },
    ],

    cardLimits: [
      { card: "Debit", capability: "ATM cash withdrawal", limit: "USD 20,000", sample: false },
      { card: "Debit", capability: "Point-of-sale daily cap", limit: "USD 25,000", sample: true },
      { card: "Credit", capability: "High-value transaction ceiling", limit: "₹10,00,00,000", sample: false },
      { card: "Credit", capability: "Statement cycle", limit: "30 days", sample: true },
    ],

    feeRules: [
      { transactionType: "2 Way Fund → 2 Way Fund internal transfer", charge: "0%", notes: "No charge applied between two accounts held on the platform." },
      { transactionType: "Eligible standard transaction", charge: "2%", notes: "Standard commission deducted at settlement." },
      { transactionType: "Currency exchange", charge: "Per policy", notes: "Determined by the applicable exchange policy for the corridor." },
      { transactionType: "Card services", charge: "Per terms", notes: "Governed by the applicable card and service terms." },
      { transactionType: "Other 2 Way services", charge: "Per service", notes: "Charge determined according to the service requested." },
      { transactionType: "Third-party charges", charge: "As applicable", notes: "Correspondent and intermediary charges passed through at cost." },
      { transactionType: "Taxes & government charges", charge: "As applicable", notes: "Levied where legally required in the relevant jurisdiction." },
    ],

    feeExamples: [
      { label: "Standard transaction", gross: 10000, rate: 0.02 },
      { label: "Standard transaction, high value", gross: 50000, rate: 0.02 },
    ],

    openingSteps: ["Account selection", "Application", "Identity & business verification", "Financial requirement", "Compliance review", "Account approval", "International payment services"],

    serviceChargeFlow: ["Customer requests service", "Service type identified", "Applicable fee determined", "Customer informed", "Customer authorisation", "Service processed"],

    fxFlow: ["Received amount", "Applicable exchange rate", "Gross converted amount", "Less commission & charges", "Net converted amount", "Settlement to beneficiary"],

    exchangeProcess: ["Funds received", "Currency identified", "Exchange rate determined", "Exchange commission calculated", "Customer confirms conversion", "Currency converted", "Converted funds settled or transferred"],

    chain: ["2 Way account", "Digital / physical card", "Debit · Credit", "Pay · Withdraw · Convert", "Supported international payment networks", "Merchant / ATM / beneficiary"],

    corridor: ["Country A", "International payment", "Currency conversion", "Country B", "Beneficiary bank account"],

    conversionProcess: ["Identify originating currency", "Identify destination currency", "Verify customer and transaction", "Apply exchange rate and charges", "Convert through payment infrastructure", "Settle to the designated channel"],

    paymentModel: ["Payment initiation", "Customer & transaction verification", "International payment processing", "Currency conversion", "Settlement", "Beneficiary receives funds"],

    securityLayers: [
      { name: "Login credentials", desc: "Account access authenticated before any session is established." },
      { name: "OTP / additional auth", desc: "Second factor issued to a registered channel for session and transaction confirmation." },
      { name: "Transaction password", desc: "Distinct from the login credential; required to authorise value movement." },
      { name: "Beneficiary verification", desc: "Beneficiary details validated and cooled off before first settlement." },
      { name: "Transaction monitoring", desc: "Continuous screening of value, corridor, velocity and counterparty." },
      { name: "Risk & fraud detection", desc: "Scored against behavioural and corridor risk models; anomalies escalate." },
      { name: "KYC / video KYC", desc: "Identity assurance at onboarding and on re-verification triggers." },
      { name: "Manual & compliance review", desc: "Human adjudication for held, high-value or escalated transactions." },
    ],

    txFlow: ["Login", "Identity authentication", "Select beneficiary", "Enter transaction", "Verify amount & currency", "Transaction password / OTP", "Risk & security check", "Authorization", "Processing", "Transaction confirmation", "Reference number"],

    restrictFlow: ["3 consecutive incorrect transaction-password attempts", "Transaction facility temporarily restricted, up to 7 days", "Video KYC — live face, liveness check, approved ID document", "Security & compliance review", "Eligibility confirmed — facility may be restored", "Normal transaction access resumes"],

    videoKycSteps: ["Enable the camera", "Show your face clearly", "Complete a liveness check", "Blink or perform another instructed movement", "Show the ID document provided at account opening", "Complete any further verification requested"],

    annualKycCycle: ["Account active", "Annual KYC due", "Customer notification", "Video KYC", "Identity & document verification", "KYC updated", "Account continues under applicable terms"],

    beneficiaries: [
      { id: "b1", name: "2 Way Fund account 04412", detail: "R. Sharma — on-platform account", account: "XXXXXXXX4412", country: "India", currency: "INR", internal: true, status: "Verified" },
      { id: "b2", name: "Northvale Systems Ltd", detail: "Correspondent: GB corridor", swift: "NRTHGB2L", account: "XXXXXXXX7741", country: "United Kingdom", currency: "GBP", internal: false, status: "Verified" },
      { id: "b3", name: "Corvid Cloud SAS", detail: "Correspondent: FR corridor", swift: "CRVDFRPP", account: "XXXXXXXX2298", country: "France", currency: "EUR", internal: false, status: "Verified" },
      { id: "b4", name: "Vantara Airways Pvt Ltd", detail: "Correspondent: IN corridor", ifsc: "VNTR0004512", account: "XXXXXXXX5510", country: "India", currency: "INR", internal: false, status: "Verified" },
      { id: "b5", name: "Meridian Trading LLC", detail: "Registered 01 Sep 2026 — cooling-off period", swift: "MRDNAEAD", account: "XXXXXXXX8834", country: "United Arab Emirates", currency: "USD", internal: false, status: "Pending verification" },
    ],

    nominees: [
      {
        id: "nom1", name: "Rohan Sharma", relationship: "Spouse", dob: "1989-11-02",
        address: "14 Sample Street, Andheri East, Mumbai 400069, India",
        guardianName: "", guardianRelationship: "", guardianAddress: "", registered: "12 Aug 2026 10:20",
      },
    ],

    nomineeRelationships: ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"],

    nomineeAudit: [{ at: "12 Aug 2026 10:20", action: "Nominee registered — Rohan Sharma (Spouse)" }],

    usdt: {
      balance: 8450.0,
      network: "TRC20",
      addresses: {
        TRC20: "TDemoOnlyNotARealAddress9xK4mQ2vR7",
        ERC20: "0xDemoOnlyNotARealAddress4b91Ac77De20",
      },
      rateToUsd: 0.9985,
      movements: [
        { date: "30 Aug 2026", time: "12:04", ref: "2WF-UT-4401", kind: "Deposit", detail: "Received on TRC20 network", amount: 5000.0, direction: "credit" },
        { date: "22 Aug 2026", time: "09:31", ref: "2WF-UT-4400", kind: "Conversion", detail: "Converted to USD ledger", amount: 2200.0, direction: "debit" },
      ],
    },

    receivingAccounts: [
      { currency: "USD", swift: "TWFDUS33XXX", gatewayId: "GW-USD-4817-7X2", correspondent: "Northbridge Clearing NA, New York", status: "Active" },
      { currency: "EUR", swift: "TWFDFRPPXXX", gatewayId: "GW-EUR-4817-K9Q", correspondent: "Banque Corvid SA, Paris", status: "Active" },
      { currency: "GBP", swift: "TWFDGB2LXXX", gatewayId: "GW-GBP-4817-M4T", correspondent: "Thameside Settlement Ltd, London", status: "Active" },
    ],

    inbound: [
      {
        id: "in1", received: "03 Sep 2026 11:24", remitter: "Harbourline Logistics Ltd",
        remitterCountry: "United Kingdom", currency: "GBP", amount: 12400.0, quoted: "",
        status: "Unallocated", note: "No gateway reference quoted on the incoming message.",
      },
    ],

    messages: [
      {
        id: "m1", to: "all", category: "Service notice", priority: "Normal",
        subject: "Scheduled maintenance — 07 Sep 2026, 02:00–04:00 IST",
        body: "International payment processing will be unavailable for approximately two hours while settlement systems are upgraded.\n\nBalances and statements remain viewable throughout. Transfers submitted during the window will queue and release automatically once processing resumes.\n\nNo action is required from you.",
        sentAt: "01 Sep 2026 09:00", sentBy: "Operations", read: true,
      },
      {
        id: "m2", to: "u_0001", category: "Statement available", priority: "Normal",
        subject: "Your August 2026 statement is ready",
        body: "Your consolidated statement for August 2026 is available under Statements & Receipts.\n\nIt covers all four currency ledgers and can be downloaded as CSV or printed.",
        sentAt: "01 Sep 2026 06:15", sentBy: "Operations", read: false,
      },
      {
        id: "m3", to: "u_0001", category: "Security alert", priority: "High",
        subject: "A transaction has been held for compliance review",
        body: "Reference 2WF-TX-88210 (INR 9,80,000.00 to Vantara Airways Pvt Ltd) has been held for compliance screening before settlement.\n\nThis is a routine value-band check. A reviewer will adjudicate it and the outcome will appear on your ledger.\n\nNo action is required from you, and no payment or verification is needed to release it. Anyone telling you otherwise is not from this institution.",
        sentAt: "19 Aug 2026 10:07", sentBy: "Compliance officer", read: false,
      },
    ],

    messageCategories: ["Service notice", "Account update", "Statement available", "Security alert", "KYC update"],

    adjustments: [],
    maintenance: [],
    ledgerEvents: [],

    maintenanceReasons: [
      "Data entry error at onboarding",
      "Document correction supplied by customer",
      "Duplicate identifier resolved",
      "Regulatory reissue",
      "Merger or migration of records",
    ],

    adjustmentReasons: [
      "Data entry error",
      "Duplicate posting",
      "Correspondent recall",
      "Value-date correction",
      "Compliance instruction",
      "Customer dispute upheld",
    ],

    countries: ["India", "France", "United Kingdom", "Germany", "Singapore", "United Arab Emirates", "Sweden", "Canada"],

    purposes: ["Personal remittance", "Business receipts", "Payroll disbursement", "Treasury & liquidity", "Supplier settlement"],

    applications: [
      // The signed-in customer's own account-opening record. Already
      // approved and KYC-verified, matching the Verified badge and active
      // account shown elsewhere — this is what the eKYC page shows a
      // customer, scoped by customerId rather than the open prospect queue
      // below (which belongs to the Compliance Console, not to any customer).
      {
        ref: "2WF-APP-10199", customerId: "u_0001", name: "Aditi Sharma", email: "a.sharma@example.invalid", country: "India",
        tier: "Master Account", purpose: "Personal remittance", referral: "2WF-STAFF7",
        referrer: "Internal staff referral", termsAcceptedAt: "18 Dec 2025 11:02",
        submitted: "18 Dec 2025", status: "Approved",
        kyc: {
          status: "Verified",
          videoSlot: "20 Dec 2025 11:30",
          documents: [
            { id: "photo", name: "Photograph", icon: "photo", note: "Recent passport-style photograph of the applicant.", status: "Verified", filename: "photo_2WF-APP-10199.jpg", size: "398 KB", received: "18 Dec 2025 11:05 (seeded)" },
            { id: "signature", name: "Specimen signature", icon: "signature", note: "Signature as it will appear on instructions. Draw it here or upload a scan on plain white paper.", status: "Verified", filename: "signature_2WF-APP-10199.png", size: "41 KB", received: "18 Dec 2025 11:06 (seeded)" },
            { id: "aadhaar", name: "Aadhaar card", icon: "aadhaar", note: "Proof of identity and address. A production system captures this through a UIDAI-authorised channel and stores only a masked reference, never the full number.", status: "Verified", filename: "aadhaar_2WF-APP-10199.pdf", size: "251 KB", received: "18 Dec 2025 11:07 (seeded)" },
            { id: "pan", name: "PAN card", icon: "pan", note: "Tax identification, required for accounts above the reporting threshold.", status: "Verified", filename: "pan_2WF-APP-10199.pdf", size: "183 KB", received: "18 Dec 2025 11:08 (seeded)" },
          ],
        },
        audit: [
          { at: "18 Dec 2025 11:02", actor: "Applicant", action: "Application submitted" },
          { at: "18 Dec 2025 11:08", actor: "Applicant", action: "eKYC documents submitted for verification" },
          { at: "19 Dec 2025 09:30", actor: "Compliance officer", action: "Moved to review" },
          { at: "19 Dec 2025 14:15", actor: "Compliance officer", action: "eKYC verified" },
          { at: "22 Dec 2025 10:00", actor: "Compliance officer", action: "Approved — account provisioning queued" },
        ],
      },
      // Prospects still in the onboarding queue — none has an account yet,
      // so none carries a customerId. Visible to the Compliance Console only.
      {
        ref: "2WF-APP-10229", name: "Nadia Rahman", email: "n.rahman@example.invalid", country: "United Arab Emirates",
        tier: "Corporate Account", purpose: "Treasury & liquidity", referral: "2WF-PART22",
        referrer: "Northvale Systems Ltd — channel partner", termsAcceptedAt: "24 Aug 2026 09:12",
        submitted: "24 Aug 2026", status: "Rejected",
        audit: [
          { at: "24 Aug 2026 09:12", actor: "Applicant", action: "Application submitted" },
          { at: "25 Aug 2026 11:40", actor: "Compliance officer", action: "Moved to review" },
          { at: "27 Aug 2026 15:02", actor: "Compliance officer", action: "Rejected — corporate documentation incomplete" },
        ],
      },
      {
        ref: "2WF-APP-10231", name: "Rohan Mehta", email: "r.mehta@example.invalid", country: "India",
        tier: "Classic Account", purpose: "Personal remittance", referral: "2WF-DEMO01",
        referrer: "Demonstration partner", termsAcceptedAt: "29 Aug 2026 14:26",
        submitted: "29 Aug 2026", status: "Submitted",
        audit: [{ at: "29 Aug 2026 14:26", actor: "Applicant", action: "Application submitted" }],
      },
      {
        ref: "2WF-APP-10232", name: "Claire Dubois", email: "c.dubois@example.invalid", country: "France",
        tier: "3D Account", purpose: "Business receipts", referral: "2WF-PART22",
        referrer: "Northvale Systems Ltd — channel partner", termsAcceptedAt: "30 Aug 2026 10:05",
        submitted: "30 Aug 2026", status: "Under review",
        audit: [
          { at: "30 Aug 2026 10:05", actor: "Applicant", action: "Application submitted" },
          { at: "31 Aug 2026 09:18", actor: "Compliance officer", action: "Moved to review" },
        ],
      },
      {
        ref: "2WF-APP-10233", name: "Tomas Berg", email: "t.berg@example.invalid", country: "Sweden",
        tier: "General Account", purpose: "Supplier settlement", referral: "2WF-STAFF7",
        referrer: "Internal staff referral", termsAcceptedAt: "31 Aug 2026 16:44",
        submitted: "31 Aug 2026", status: "Approved",
        audit: [
          { at: "31 Aug 2026 16:44", actor: "Applicant", action: "Application submitted" },
          { at: "01 Sep 2026 08:30", actor: "Compliance officer", action: "Moved to review" },
          { at: "01 Sep 2026 12:15", actor: "Compliance officer", action: "Approved — account provisioning queued" },
        ],
      },
    ],
  };
}
