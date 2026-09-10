import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Banknote,
  Building2,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  PenLine,
  ShieldCheck,
  Ticket,
  UserPlus,
} from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Stepper, WizActions } from "../../components/ui/Stepper";
import { Field, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, DetailGrid } from "../../components/ui/Misc";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../state/AppContext";
import { REFERRAL_FORMAT, validPhone } from "../../lib/validators";
import { validateDob } from "../../lib/dates";
import { freshKyc } from "../../lib/kyc";
import { formatCode } from "../../lib/format";
import { ApiError } from "../../services/apiClient";
import {
  submitApplication,
  uploadApplicationBusinessCertificate,
  uploadApplicationSignature,
} from "../../services/applicationService";
import { verifyReferral } from "../../services/referralService";
import {
  CAR_STATUS_OPTIONS,
  CROSS_BORDER_REASONS,
  EDUCATION_LEVELS,
  HOME_STATUS_OPTIONS,
  INCOME_BANDS,
  OCCUPATIONS,
  OPENING_STEPS,
  TURNOVER_BANDS,
  stageForStatus,
} from "../../data/openAccountOptions";
import type { Application } from "../../types/data";

type WizardStage = 1 | 2 | 3 | 4 | 5;

/** Maps the backend's snake_case validation field names onto this form's
 * local per-field error keys. Fields with no dedicated error slot
 * (country, tier, purpose, referral, education, and every select with a
 * fixed default) fall back to the general submit-error banner — their
 * values are always populated from store data or a select default, so a
 * server-side rejection there is an edge case, not a normal-path
 * per-field validation failure. */
const FIELD_ERROR_MAP: Record<string, string> = {
  name: "f-name",
  father_name: "f-father",
  dob: "f-dob",
  address_communication: "f-addr-comm",
  address_permanent: "f-addr-perm",
  mobile_personal: "f-mob-personal",
  mobile_official: "f-mob-official",
  landline: "f-landline",
  email: "f-email",
  organisation: "f-org",
  cross_border_detail: "f-xb-detail",
  terms_accepted: "f-terms",
};

/** Which stage each of those fields is actually edited on. Every field
 * error surfaces at submit time — stage 5 — but its input only exists on
 * an earlier stage, so a rejection (e.g. "email already taken") is
 * invisible unless the wizard jumps back to where the field lives. */
const FIELD_STAGE_MAP: Record<string, WizardStage> = {
  name: 2,
  father_name: 2,
  dob: 2,
  address_communication: 2,
  address_permanent: 2,
  mobile_personal: 2,
  mobile_official: 2,
  landline: 2,
  email: 2,
  organisation: 3,
  cross_border_detail: 4,
  terms_accepted: 5,
};

const STEPPER_STEPS = OPENING_STEPS.map((label, i) => ({ label, sub: `Stage ${i + 1} of ${OPENING_STEPS.length}` }));

export function OpenAccountPage() {
  const { store, setStore } = useApp();

  // Referral gate
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [verifiedReferrer, setVerifiedReferrer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [stage, setStage] = useState<WizardStage>(1);

  // Stage 1 — Account selection. Defaults to an individual tier, not
  // simply store.tiers[0] — the corporate family sits first in that list,
  // and silently starting most applicants on the corporate path would
  // mean requiring a business certificate they never chose to provide.
  const [country, setCountry] = useState(store.countries[0] ?? "");
  const [tier, setTier] = useState(
    store.tiers.find((t) => !t.name.startsWith("Corporate Account"))?.name ?? store.tiers[0]?.name ?? ""
  );
  const [purpose, setPurpose] = useState(store.purposes[0] ?? "");

  // Stage 2 — Application
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [education, setEducation] = useState(EDUCATION_LEVELS[0]);
  const [addressComm, setAddressComm] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [addressPerm, setAddressPerm] = useState("");
  const [addressOff, setAddressOff] = useState("");
  const [mobilePersonal, setMobilePersonal] = useState("");
  const [mobileOfficial, setMobileOfficial] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");

  // Stage 3 — Identity & business verification
  const [organisation, setOrganisation] = useState("");
  const [occupation, setOccupation] = useState(OCCUPATIONS[0]);
  const [turnover, setTurnover] = useState(TURNOVER_BANDS[0]);
  const [income, setIncome] = useState(INCOME_BANDS[0]);
  const [homeStatus, setHomeStatus] = useState(HOME_STATUS_OPTIONS[0]);
  const [carStatus, setCarStatus] = useState(CAR_STATUS_OPTIONS[0]);
  // A business certificate is only asked for on a Corporate Account tier
  // (backend re-checks this — App\Services\ApplicationService
  // ::attachBusinessCertificate rejects it for any other tier).
  const [businessCertificateFile, setBusinessCertificateFile] = useState<File | null>(null);

  // Stage 4 — Financial requirement
  const [crossBorderReason, setCrossBorderReason] = useState(CROSS_BORDER_REASONS[0]);
  const [crossBorderDetail, setCrossBorderDetail] = useState("");

  // Stage 5 — Compliance review
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitted, setSubmitted] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);

  const selectedTier = store.tiers.find((t) => t.name === tier) ?? null;
  const isCorporateTier = tier.startsWith("Corporate Account");

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function goToStage(n: WizardStage) {
    setStage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Format is checked locally to spare an obviously-doomed round trip;
   * whether the code has actually been issued is only ever decided by the
   * backend, which owns the one mapping of code to referring party. */
  async function verifyCode() {
    if (verifying) return;

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

    setVerifying(true);
    try {
      const verified = await verifyReferral(c);
      setCodeError(null);
      setVerifiedReferrer(verified.referrer);
      setVerifiedCode(verified.code);
      setStage(1);
    } catch (err) {
      setCodeError(
        err instanceof ApiError && err.status === 404
          ? "That referral code is not recognised. Check it with whoever referred you."
          : "Could not verify that referral code right now. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  }

  function changeCode() {
    setVerifiedCode(null);
    setVerifiedReferrer(null);
    setCode("");
    setCodeError(null);
  }

  function validateStage2(): boolean {
    let ok = true;
    if (!name.trim()) {
      setErr("f-name", "Enter the applicant’s full name.");
      ok = false;
    } else setErr("f-name", null);

    if (!fatherName.trim()) {
      setErr("f-father", "Enter the father’s or husband’s name.");
      ok = false;
    } else setErr("f-father", null);

    const dobErr = validateDob(dob);
    if (dobErr) {
      setErr("f-dob", dobErr);
      ok = false;
    } else setErr("f-dob", null);

    if (!addressComm.trim()) {
      setErr("f-addr-comm", "Enter the communication address.");
      ok = false;
    } else setErr("f-addr-comm", null);

    if (!sameAddress && !addressPerm.trim()) {
      setErr("f-addr-perm", "Enter the permanent address, or tick the box above.");
      ok = false;
    } else setErr("f-addr-perm", null);

    const mp = mobilePersonal.trim();
    if (!mp) {
      setErr("f-mob-personal", "Enter a personal mobile number.");
      ok = false;
    } else if (!validPhone(mp)) {
      setErr("f-mob-personal", "Use 7–15 digits, with an optional leading +.");
      ok = false;
    } else setErr("f-mob-personal", null);

    if (mobileOfficial.trim() && !validPhone(mobileOfficial)) {
      setErr("f-mob-official", "Use 7–15 digits, with an optional leading +.");
      ok = false;
    } else setErr("f-mob-official", null);

    if (landline.trim() && !validPhone(landline)) {
      setErr("f-landline", "Use 7–15 digits, with an optional leading +.");
      ok = false;
    } else setErr("f-landline", null);

    const em = email.trim();
    if (!em) {
      setErr("f-email", "Enter a contact email.");
      ok = false;
    } else if (em.indexOf("@") < 1 || em.indexOf(".") < 0) {
      setErr("f-email", "Enter an email in a valid format.");
      ok = false;
    } else setErr("f-email", null);

    return ok;
  }

  function validateStage3(): boolean {
    let ok = true;

    if (!organisation.trim()) {
      setErr("f-org", isCorporateTier ? "Enter the business name." : "Enter the organisation or company name.");
      ok = false;
    } else setErr("f-org", null);

    if (isCorporateTier && !businessCertificateFile) {
      setErr("f-business-cert", "Upload a business certificate to continue.");
      ok = false;
    } else setErr("f-business-cert", null);

    return ok;
  }

  function validateStage4(): boolean {
    if (crossBorderDetail.trim().length < 20) {
      setErr("f-xb-detail", "Give at least 20 characters explaining the connection to that country.");
      return false;
    }
    setErr("f-xb-detail", null);
    return true;
  }

  function validateStage5(): boolean {
    let ok = true;

    if (!signatureFile) {
      setErr("f-signature", "Upload your signature to continue.");
      ok = false;
    } else setErr("f-signature", null);

    if (!termsAccepted) {
      setErr("f-terms", "You must accept the terms and conditions to continue.");
      ok = false;
    } else setErr("f-terms", null);

    return ok;
  }

  async function submit() {
    if (!verifiedCode || !validateStage5() || submitting) return;

    const permanent = sameAddress ? addressComm.trim() : addressPerm.trim();

    setSubmitError(null);
    setUploadWarnings([]);
    setSubmitting(true);
    try {
      const result = await submitApplication({
        country,
        tier,
        purpose,
        name: name.trim(),
        fatherName: fatherName.trim(),
        dob,
        education,
        addressCommunication: addressComm.trim(),
        addressPermanent: permanent,
        addressOffice: addressOff.trim(),
        mobilePersonal: mobilePersonal.trim(),
        mobileOfficial: mobileOfficial.trim(),
        landline: landline.trim(),
        email: email.trim(),
        organisation: organisation.trim(),
        annualTurnover: turnover,
        occupation,
        annualIncome: income,
        homeStatus,
        carStatus,
        crossBorderReason,
        crossBorderDetail: crossBorderDetail.trim(),
        referral: verifiedCode,
        termsAccepted,
      });

      let application: Application = { ...result, kyc: freshKyc() };
      const warnings: string[] = [];

      // The application record now exists (it has a ref), so the two
      // document uploads run right after — still part of "opening an
      // account" from the applicant's side, even though each is its own
      // request against the real backend. A failed upload here does not
      // undo the application itself; it's surfaced as a warning instead.
      if (signatureFile) {
        try {
          const withSignature = await uploadApplicationSignature(application.ref, signatureFile, signatureFile.name);
          application = { ...application, hasSignature: withSignature.hasSignature };
        } catch {
          warnings.push("Your signature could not be uploaded. Contact support with your reference number to complete it.");
        }
      }

      if (isCorporateTier && businessCertificateFile) {
        try {
          const withCertificate = await uploadApplicationBusinessCertificate(
            application.ref,
            businessCertificateFile,
            businessCertificateFile.name
          );
          application = { ...application, hasBusinessCertificate: withCertificate.hasBusinessCertificate };
        } catch {
          warnings.push("Your business certificate could not be uploaded. Contact support with your reference number to complete it.");
        }
      }

      setStore((s) => ({ ...s, applications: [application, ...s.applications] }));
      setUploadWarnings(warnings);
      setSubmitted(application);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        let earliestStage: WizardStage | null = null;
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          const localKey = FIELD_ERROR_MAP[field];
          if (localKey) setErr(localKey, messages[0]);

          const fieldStage = FIELD_STAGE_MAP[field];
          if (fieldStage && (earliestStage === null || fieldStage < earliestStage)) earliestStage = fieldStage;
        }
        // A rejected field only has somewhere to display its message on
        // the stage that actually renders it — jump there so the
        // specific reason (e.g. "email already taken") is visible
        // instead of just the generic banner below.
        if (earliestStage !== null && earliestStage < 5) goToStage(earliestStage);
      }
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepperCurrent = submitted ? stageForStatus(submitted.status) : verifiedCode ? stage : 0;

  return (
    <>
      <PageHead
        title="Open an Account"
        lede="All seven stages of account opening, walked through in order — from referral verification to the live account."
      />

      {/* Referral gate */}
      {!verifiedCode ? (
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5 px-4.5 sm:px-5 py-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
              <Ticket size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Referral Code</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">A referral code is required to start an application</p>
            </div>
          </div>

          <Field label="Referral code" htmlFor="oa-referral" required error={codeError} className="max-w-xs">
            <TextInput
              id="oa-referral"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void verifyCode()}
              placeholder="2WF-XXXXXX"
              hasError={!!codeError}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>

          <div className="flex items-center gap-3 flex-wrap mt-3.5">
            <Btn variant="primary" onClick={() => void verifyCode()} disabled={verifying}>
              {verifying ? "Verifying…" : "Verify Referral Code"}
            </Btn>
          </div>
        </div>
      ) : (
        <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-2xl px-4.5 py-3.5 sm:px-5 mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <BadgeCheck size={17} className="text-pos flex-none" />
            <p className="m-0 text-[12.5px] text-ink">
              Referral code <strong className="font-num">{verifiedCode}</strong> accepted — referred by {verifiedReferrer}.
            </p>
          </div>
          {!submitted ? (
            <button type="button" onClick={changeCode} className="text-[11.5px] font-semibold text-navy-lt whitespace-nowrap">
              Use a different code
            </button>
          ) : null}
        </div>
      )}

      {/* Wizard */}
      {verifiedCode ? (
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
          <Stepper steps={STEPPER_STEPS} current={stepperCurrent} />

          {!submitted && stage === 1 ? (
            <div className="px-4.5 sm:px-5 py-5">
              <StageHeader icon={<Landmark size={17} />} title="Stage 1 — Account Selection" sub="Choose the account class, domicile and declared purpose." />
              <FormGrid>
                <Field label="Country of residence" htmlFor="oa-country">
                  <Select id="oa-country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    {store.countries.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Purpose of account" htmlFor="oa-purpose">
                  <Select id="oa-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    {store.purposes.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Account tier" htmlFor="oa-tier" wide>
                  <Select
                    id="oa-tier"
                    value={tier}
                    onChange={(e) => {
                      setTier(e.target.value);
                      if (!e.target.value.startsWith("Corporate Account")) {
                        setBusinessCertificateFile(null);
                        setErr("f-business-cert", null);
                      }
                    }}
                  >
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
              </FormGrid>
              <WizActions>
                <Btn variant="primary" onClick={() => goToStage(2)}>
                  Continue to Application →
                </Btn>
              </WizActions>
            </div>
          ) : null}

          {!submitted && stage === 2 ? (
            <div className="px-4.5 sm:px-5 py-5">
              <StageHeader icon={<UserPlus size={17} />} title="Stage 2 — Application" sub="Personal identity and contact details for the applicant." />
              <FormGrid>
                <Field label="Full name" htmlFor="oa-name" required error={errors["f-name"]}>
                  <TextInput id="oa-name" value={name} onChange={(e) => setName(e.target.value)} hasError={!!errors["f-name"]} autoComplete="off" />
                </Field>
                <Field label="Father's / husband's name" htmlFor="oa-father" required error={errors["f-father"]}>
                  <TextInput
                    id="oa-father"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    hasError={!!errors["f-father"]}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Date of birth" htmlFor="oa-dob" required error={errors["f-dob"]} hint="Applicant must be 18 or over.">
                  <TextInput id="oa-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} hasError={!!errors["f-dob"]} />
                </Field>
                <Field label="Education" htmlFor="oa-education">
                  <Select id="oa-education" value={education} onChange={(e) => setEducation(e.target.value)}>
                    {EDUCATION_LEVELS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Communication address" htmlFor="oa-addr-comm" required wide error={errors["f-addr-comm"]}>
                  <TextArea
                    id="oa-addr-comm"
                    value={addressComm}
                    onChange={(e) => {
                      setAddressComm(e.target.value);
                      if (sameAddress) setErr("f-addr-perm", null);
                    }}
                    hasError={!!errors["f-addr-comm"]}
                    className="min-h-[60px]"
                  />
                </Field>
                <Field wide>
                  <label className="flex items-center gap-2 text-[12px] text-ink cursor-pointer">
                    <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} />
                    Permanent address same as communication address
                  </label>
                </Field>
                <Field label="Permanent address" htmlFor="oa-addr-perm" required wide error={errors["f-addr-perm"]}>
                  <TextArea
                    id="oa-addr-perm"
                    value={sameAddress ? addressComm : addressPerm}
                    onChange={(e) => setAddressPerm(e.target.value)}
                    readOnly={sameAddress}
                    hasError={!!errors["f-addr-perm"]}
                    className={`min-h-[60px] ${sameAddress ? "bg-tint" : ""}`}
                  />
                </Field>
                <Field label="Office address" htmlFor="oa-addr-off" wide>
                  <TextArea id="oa-addr-off" value={addressOff} onChange={(e) => setAddressOff(e.target.value)} className="min-h-[60px]" />
                </Field>
                <Field label="Personal mobile" htmlFor="oa-mob-personal" required error={errors["f-mob-personal"]}>
                  <TextInput
                    id="oa-mob-personal"
                    value={mobilePersonal}
                    onChange={(e) => setMobilePersonal(e.target.value)}
                    hasError={!!errors["f-mob-personal"]}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Official mobile" htmlFor="oa-mob-official" error={errors["f-mob-official"]}>
                  <TextInput
                    id="oa-mob-official"
                    value={mobileOfficial}
                    onChange={(e) => setMobileOfficial(e.target.value)}
                    hasError={!!errors["f-mob-official"]}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Landline" htmlFor="oa-landline" error={errors["f-landline"]}>
                  <TextInput
                    id="oa-landline"
                    value={landline}
                    onChange={(e) => setLandline(e.target.value)}
                    hasError={!!errors["f-landline"]}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Email" htmlFor="oa-email" required error={errors["f-email"]}>
                  <TextInput
                    id="oa-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hasError={!!errors["f-email"]}
                    autoComplete="off"
                  />
                </Field>
              </FormGrid>
              <WizActions>
                <Btn onClick={() => goToStage(1)}>← Back</Btn>
                <Btn variant="primary" onClick={() => validateStage2() && goToStage(3)}>
                  Continue to Verification →
                </Btn>
              </WizActions>
            </div>
          ) : null}

          {!submitted && stage === 3 ? (
            <div className="px-4.5 sm:px-5 py-5">
              <StageHeader
                icon={<ShieldCheck size={17} />}
                title="Stage 3 — Identity & Business Verification"
                sub="Occupation and business details a reviewer uses to assess the application. Identity documents are collected separately, through eKYC, once this application is submitted."
              />
              <FormGrid>
                <Field label={isCorporateTier ? "Business name" : "Organisation / company"} htmlFor="oa-org" required error={errors["f-org"]}>
                  <TextInput
                    id="oa-org"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    hasError={!!errors["f-org"]}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Occupation" htmlFor="oa-occupation">
                  <Select id="oa-occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                    {OCCUPATIONS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Annual turnover" htmlFor="oa-turnover">
                  <Select id="oa-turnover" value={turnover} onChange={(e) => setTurnover(e.target.value)}>
                    {TURNOVER_BANDS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Annual income" htmlFor="oa-income">
                  <Select id="oa-income" value={income} onChange={(e) => setIncome(e.target.value)}>
                    {INCOME_BANDS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Home status" htmlFor="oa-home">
                  <Select id="oa-home" value={homeStatus} onChange={(e) => setHomeStatus(e.target.value)}>
                    {HOME_STATUS_OPTIONS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Car status" htmlFor="oa-car">
                  <Select id="oa-car" value={carStatus} onChange={(e) => setCarStatus(e.target.value)}>
                    {CAR_STATUS_OPTIONS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                {isCorporateTier ? (
                  <FileField
                    id="oa-business-cert"
                    icon={<Building2 size={15} />}
                    label="Business certificate"
                    hint="Certificate of Incorporation or equivalent business registration document (PDF, JPEG, PNG or WebP, up to 5 MB)."
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    file={businessCertificateFile}
                    onChange={(f) => {
                      setBusinessCertificateFile(f);
                      if (f) setErr("f-business-cert", null);
                    }}
                    error={errors["f-business-cert"]}
                  />
                ) : null}
              </FormGrid>
              <WizActions>
                <Btn onClick={() => goToStage(2)}>← Back</Btn>
                <Btn variant="primary" onClick={() => validateStage3() && goToStage(4)}>
                  Continue to Financial Requirement →
                </Btn>
              </WizActions>
            </div>
          ) : null}

          {!submitted && stage === 4 ? (
            <div className="px-4.5 sm:px-5 py-5">
              <StageHeader
                icon={<Banknote size={17} />}
                title="Stage 4 — Financial Requirement"
                sub="The stated minimum opening requirement for the selected tier, and why this application crosses a border."
              />
              {selectedTier ? (
                <Callout title={`Minimum opening requirement — ${selectedTier.name}`} className="mb-4">
                  <p>
                    {formatCode(selectedTier.openingAmt, selectedTier.currency)} — {selectedTier.description}
                  </p>
                </Callout>
              ) : null}
              <FormGrid>
                <Field label="Cross-border reason" htmlFor="oa-xb-reason">
                  <Select id="oa-xb-reason" value={crossBorderReason} onChange={(e) => setCrossBorderReason(e.target.value)}>
                    {CROSS_BORDER_REASONS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cross-border detail" htmlFor="oa-xb-detail" required wide error={errors["f-xb-detail"]}>
                  <TextArea
                    id="oa-xb-detail"
                    value={crossBorderDetail}
                    onChange={(e) => setCrossBorderDetail(e.target.value)}
                    hasError={!!errors["f-xb-detail"]}
                    className="min-h-[60px]"
                  />
                </Field>
              </FormGrid>
              <WizActions>
                <Btn onClick={() => goToStage(3)}>← Back</Btn>
                <Btn variant="primary" onClick={() => validateStage4() && goToStage(5)}>
                  Continue to Compliance Review →
                </Btn>
              </WizActions>
            </div>
          ) : null}

          {!submitted && stage === 5 ? (
            <div className="px-4.5 sm:px-5 py-5">
              <StageHeader
                icon={<ClipboardCheck size={17} />}
                title="Stage 5 — Compliance Review"
                sub="Review everything entered, then accept the terms to submit. Stages 6 and 7 — account approval and live international payment services — follow once a compliance officer reviews this application."
              />

              <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-2 mb-1">Stage 1 — Account selection</p>
              <DetailGrid
                items={[
                  ["Country", country],
                  ["Account tier", tier],
                  ["Purpose of account", purpose],
                  ["Referral code", `${verifiedCode} (${verifiedReferrer})`],
                ]}
              />

              <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-2 mb-1">Stage 2 — Application</p>
              <DetailGrid
                items={[
                  ["Full name", name],
                  ["Father's / husband's name", fatherName],
                  ["Date of birth", dob],
                  ["Communication address", addressComm],
                  ["Personal mobile", mobilePersonal],
                  ["Email", email],
                ]}
              />

              <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-2 mb-1">Stage 3 — Identity &amp; business verification</p>
              <DetailGrid
                items={[
                  ["Organisation", organisation],
                  ["Occupation", occupation],
                  ["Annual turnover", turnover],
                  ["Annual income", income],
                ]}
              />

              <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-2 mb-1">Stage 4 — Financial requirement</p>
              <DetailGrid items={[["Cross-border reason", crossBorderReason], ["Cross-border detail", crossBorderDetail]]} />

              <FormGrid className="mt-2">
                <FileField
                  id="oa-signature"
                  icon={<PenLine size={15} />}
                  label="Signature"
                  hint="Required for every application, regardless of tier (JPEG, PNG or WebP, up to 5 MB)."
                  accept="image/png,image/jpeg,image/webp"
                  file={signatureFile}
                  onChange={(f) => {
                    setSignatureFile(f);
                    if (f) setErr("f-signature", null);
                  }}
                  error={errors["f-signature"]}
                />

                <Field wide error={errors["f-terms"]}>
                  <label className="flex items-start gap-2 text-[12px] text-ink cursor-pointer">
                    <input
                      id="oa-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5"
                    />
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

                {submitError ? (
                  <div className="col-span-full">
                    <Callout title="Submission failed" variant="warn">
                      <p>{submitError}</p>
                    </Callout>
                  </div>
                ) : null}
              </FormGrid>

              <WizActions>
                <Btn onClick={() => goToStage(4)}>← Back</Btn>
                <Btn variant="primary" onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </Btn>
              </WizActions>
            </div>
          ) : null}

          {/* Confirmation — stages 6–7 happen off this page */}
          {submitted ? (
            <div className="px-4.5 sm:px-5 py-5">
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
                No account has been opened and no funds have been collected.
              </p>
              <p className="text-[12.5px] text-ink mb-2">
                Signature: {submitted.hasSignature ? "uploaded" : "not uploaded"}.
                {isCorporateTier ? ` Business certificate: ${submitted.hasBusinessCertificate ? "uploaded" : "not uploaded"}.` : ""}
              </p>
              {uploadWarnings.length > 0 ? (
                <Callout title="One or more documents did not upload" variant="warn">
                  {uploadWarnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </Callout>
              ) : null}
              <p className="text-[12.5px] text-ink mb-4">
                Next step: complete eKYC verification (stage 3 continues there). Stage 6 — account approval — follows once a compliance officer
                reviews this application; stage 7 is the live account.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to={`/ekyc?ref=${encodeURIComponent(submitted.ref)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white no-underline hover:brightness-110"
                >
                  Continue to eKYC →
                </Link>
              </div>
            </div>
          ) : null}
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

function StageHeader({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">{icon}</span>
      <div>
        <h3 className="m-0 text-[14.5px] font-bold text-navy">{title}</h3>
        <p className="m-0 mt-0.5 text-[11px] text-ink-2">{sub}</p>
      </div>
    </div>
  );
}

function FileField({
  id,
  icon,
  label,
  hint,
  accept,
  file,
  onChange,
  error,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
}) {
  return (
    <Field label={label} htmlFor={id} required wide error={error} hint={hint}>
      <label
        htmlFor={id}
        className={`flex items-center gap-2.5 rounded-[5px] border px-2.5 py-2 cursor-pointer ${
          error ? "border-neg bg-[#FEF8F7]" : "border-border bg-white hover:bg-tint"
        }`}
      >
        <span className="flex-none text-ink-2">{icon}</span>
        <span className={`text-[12.5px] truncate ${file ? "text-ink font-semibold" : "text-ink-2"}`}>
          {file ? file.name : "Choose a file…"}
        </span>
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
    </Field>
  );
}
