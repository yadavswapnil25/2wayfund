import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, FileCheck2, Ticket, UserPlus } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Stepper } from "../../components/ui/Stepper";
import { Field, FormActions, FormGrid, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../state/AppContext";
import { REFERRERS } from "../../data/constants";
import { REFERRAL_FORMAT } from "../../lib/validators";
import { stamp, today } from "../../lib/dates";
import { freshKyc } from "../../lib/kyc";
import { formatCode } from "../../lib/format";
import type { Application } from "../../types/data";

const STEPS = [
  { label: "Referral code", sub: "Verify eligibility" },
  { label: "Applicant details", sub: "Submit application" },
];

const SAMPLE = {
  name: "Sample Applicant",
  fatherName: "Sample Parent Name",
  email: "sample.applicant@example.invalid",
};

export function OpenAccountPage() {
  const { store, setStore } = useApp();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(store.countries[0] ?? "");
  const [tier, setTier] = useState(store.tiers[0]?.name ?? "");
  const [purpose, setPurpose] = useState(store.purposes[0] ?? "");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [submitted, setSubmitted] = useState<Application | null>(null);

  const selectedTier = store.tiers.find((t) => t.name === tier) ?? null;

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function verifyCode() {
    const c = code.trim().toUpperCase();
    setCode(c);
    if (!c) {
      setCodeError("A referral code is required to apply.");
      return;
    }
    if (!REFERRAL_FORMAT.test(c)) {
      setCodeError("Referral codes are formatted 2WF- followed by six letters or digits.");
      return;
    }
    if (!REFERRERS[c]) {
      setCodeError("That referral code is not recognised. Check it with whoever referred you.");
      return;
    }
    setCodeError(null);
    setVerifiedCode(c);
  }

  function changeCode() {
    setVerifiedCode(null);
    setCode("");
    setCodeError(null);
  }

  function validate(): boolean {
    let ok = true;

    if (!name.trim()) {
      setErr("f-name", "Enter the applicant’s full name.");
      ok = false;
    } else setErr("f-name", null);

    if (!fatherName.trim()) {
      setErr("f-father", "Enter the father’s or husband’s name.");
      ok = false;
    } else setErr("f-father", null);

    const em = email.trim();
    if (!em) {
      setErr("f-email", "Enter a contact email.");
      ok = false;
    } else if (em.indexOf("@") < 1 || em.indexOf(".") < 0) {
      setErr("f-email", "Enter an email in a valid format.");
      ok = false;
    } else setErr("f-email", null);

    if (!ageConfirmed) {
      setErr("f-age", "Confirm the applicant is 18 or over — this institution cannot open an account for a minor.");
      ok = false;
    } else setErr("f-age", null);

    if (!termsAccepted) {
      setErr("f-terms", "You must accept the terms and conditions to continue.");
      ok = false;
    } else setErr("f-terms", null);

    return ok;
  }

  function nextRef(): string {
    return "2WF-APP-" + (10233 + store.applications.length + 1 + Math.floor(Math.random() * 90));
  }

  function submit() {
    if (!verifiedCode || !validate()) return;

    const submittedAt = stamp();
    const application: Application = {
      ref: nextRef(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      email: email.trim(),
      country,
      tier,
      purpose,
      referral: verifiedCode,
      referrer: REFERRERS[verifiedCode],
      termsAcceptedAt: submittedAt,
      submitted: today(),
      status: "Submitted",
      kyc: freshKyc(),
      audit: [
        { at: submittedAt, actor: "Applicant", action: `Referral code ${verifiedCode} verified` },
        { at: submittedAt, actor: "Applicant", action: "Terms & conditions accepted" },
        { at: submittedAt, actor: "Applicant", action: "Application submitted" },
      ],
    };

    setStore((s) => ({ ...s, applications: [application, ...s.applications] }));
    setSubmitted(application);
  }

  function startNew() {
    setSubmitted(null);
    setVerifiedCode(null);
    setCode("");
    setCodeError(null);
    setName("");
    setFatherName("");
    setEmail("");
    setCountry(store.countries[0] ?? "");
    setTier(store.tiers[0]?.name ?? "");
    setPurpose(store.purposes[0] ?? "");
    setAgeConfirmed(false);
    setTermsAccepted(false);
    setErrors({});
  }

  function fillSample() {
    setName(SAMPLE.name);
    setFatherName(SAMPLE.fatherName);
    setEmail(SAMPLE.email);
    setErr("f-name", null);
    setErr("f-father", null);
    setErr("f-email", null);
  }

  const stepperCurrent = submitted ? 3 : verifiedCode ? 2 : 1;

  return (
    <>
      <PageHead
        title="Open an Account"
        lede="Apply with a referral code. Identity verification follows through eKYC before approval. Demo only — no real account is opened."
      />

      {/* Referral gate */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <Stepper steps={STEPS} current={stepperCurrent} />

        {!verifiedCode ? (
          <div className="px-4.5 sm:px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
                <Ticket size={17} />
              </span>
              <div>
                <h3 className="m-0 text-[14.5px] font-bold text-navy">Step 1 — Referral Code</h3>
                <p className="m-0 mt-0.5 text-[11px] text-ink-2">A referral code is required to start an application</p>
              </div>
            </div>

            <Field label="Referral code" required error={codeError} className="max-w-xs">
              <TextInput
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                placeholder="2WF-XXXXXX"
                hasError={!!codeError}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <div className="flex items-center gap-3 flex-wrap mt-3.5">
              <Btn variant="primary" onClick={verifyCode}>
                Verify Referral Code
              </Btn>
              <Note className="!m-0">
                Try <code className="px-1 py-0.5 bg-tint border border-border-lt rounded text-[11px]">2WF-DEMO01</code>,{" "}
                <code className="px-1 py-0.5 bg-tint border border-border-lt rounded text-[11px]">2WF-PART22</code> or{" "}
                <code className="px-1 py-0.5 bg-tint border border-border-lt rounded text-[11px]">2WF-STAFF7</code>.
              </Note>
            </div>
          </div>
        ) : (
          <div className="px-4.5 py-3.5 sm:px-5 bg-[#F0F8F3] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <BadgeCheck size={17} className="text-pos flex-none" />
              <p className="m-0 text-[12.5px] text-ink">
                Referral code <strong className="font-num">{verifiedCode}</strong> accepted — referred by {REFERRERS[verifiedCode]}.
              </p>
            </div>
            {!submitted ? (
              <button type="button" onClick={changeCode} className="text-[11.5px] font-semibold text-navy-lt whitespace-nowrap">
                Use a different code
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Applicant details */}
      {verifiedCode && !submitted ? (
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
              <UserPlus size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Applicant Details</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Everything here stays in this browser tab</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            <FormGrid>
              <Field label="Full name" required error={errors["f-name"]}>
                <TextInput value={name} onChange={(e) => setName(e.target.value)} hasError={!!errors["f-name"]} autoComplete="off" />
              </Field>
              <Field label="Father's / husband's name" required error={errors["f-father"]}>
                <TextInput value={fatherName} onChange={(e) => setFatherName(e.target.value)} hasError={!!errors["f-father"]} autoComplete="off" />
              </Field>
              <Field label="Email" required wide error={errors["f-email"]}>
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} hasError={!!errors["f-email"]} autoComplete="off" />
              </Field>
              <Field label="Country of residence">
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {store.countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Purpose of account">
                <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                  {store.purposes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Account tier" wide>
                <Select value={tier} onChange={(e) => setTier(e.target.value)}>
                  {store.tiers.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.segment}
                    </option>
                  ))}
                </Select>
                {selectedTier ? (
                  <span className="block mt-1.5 text-[11px] text-ink-2">
                    {selectedTier.description} Stated minimum opening requirement:{" "}
                    <strong className="text-ink">{formatCode(selectedTier.openingAmt, selectedTier.currency)}</strong>.
                  </span>
                ) : null}
              </Field>

              <Field wide error={errors["f-age"]}>
                <label className="flex items-start gap-2 text-[12px] text-ink cursor-pointer">
                  <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
                  <span>I confirm the applicant is 18 years of age or over.</span>
                </label>
              </Field>

              <Field wide error={errors["f-terms"]}>
                <label className="flex items-start gap-2 text-[12px] text-ink cursor-pointer">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
                  <span>
                    I accept the{" "}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-navy-lt font-semibold underline underline-offset-2">
                      Terms &amp; Conditions
                    </button>{" "}
                    and have read the{" "}
                    <Link to="/privacy-policy" target="_blank" className="text-navy-lt font-semibold underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </Field>

              <FormActions>
                <Btn variant="primary" onClick={submit}>
                  Submit Application
                </Btn>
                <Btn onClick={fillSample}>Fill sample values</Btn>
              </FormActions>
            </FormGrid>
          </div>
        </div>
      ) : null}

      {/* Confirmation */}
      {submitted ? (
        <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-2xl px-4.5 sm:px-5 py-5 mb-5">
          <h3 className="text-pos font-bold mb-3 text-[15px] flex items-center gap-2">
            <FileCheck2 size={17} /> Application received
          </h3>
          <p className="m-0 mb-1 text-[10.5px] uppercase tracking-wide text-ink-2 font-semibold">Your reference number</p>
          <p className="m-0 mb-3 font-num text-[19px] font-bold text-navy">{submitted.ref}</p>
          <p className="text-[12.5px] text-ink mb-2">
            {submitted.name} — {submitted.tier} ({submitted.country}). Status: Submitted. It now appears at the top of the reviewer queue
            awaiting a compliance decision.
          </p>
          <p className="text-[12.5px] text-ink mb-2">
            Referral code {submitted.referral} ({submitted.referrer}). Terms and conditions accepted at {submitted.termsAcceptedAt}.
          </p>
          <p className="text-[12.5px] font-semibold text-neg mb-3">
            No account has been opened, no funds have been collected and no identity documents were requested or stored. This record exists
            only in this browser tab and is discarded on reload.
          </p>
          <p className="text-[12.5px] text-ink mb-3">
            Next step: complete eKYC verification. Identity documents are reviewed before the application is approved.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/ekyc"
              className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white no-underline hover:brightness-110"
            >
              Continue to eKYC →
            </Link>
            <Btn onClick={startNew}>Start a new application</Btn>
          </div>
        </div>
      ) : null}

      {showTerms ? (
        <Modal title="Terms & Conditions — summary" onClose={() => setShowTerms(false)}>
          <p>This is a fictional summary presented inside a design prototype. It is not a legal document and creates no rights or obligations for anyone.</p>
          <p>
            <strong>1. Eligibility.</strong> An application does not create an account. Acceptance is at the institution's discretion following
            identity, business and compliance review.
          </p>
          <p>
            <strong>2. Charges.</strong> Eligible transactions attract commission per the published Fee Policy. Internal transfers between two 2
            Way Fund accounts attract no charge.
          </p>
          <p>
            <strong>3. Security.</strong> You are responsible for keeping your credentials confidential. The institution will never ask for your
            password, transaction password or one-time code, and will never require a payment to unlock, verify or release funds already shown as
            available.
          </p>
          <p>
            <strong>4. Beneficiaries.</strong> A newly registered beneficiary is held for a cooling-off period before its first settlement,
            cleared on the institution's own schedule.
          </p>
          <p>
            <strong>5. Prototype notice.</strong> No account is opened, no funds are collected and no document is retained anywhere in this
            demonstration.
          </p>
        </Modal>
      ) : null}
    </>
  );
}
