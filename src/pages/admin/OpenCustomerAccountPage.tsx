import { useState } from "react";
import { CheckCircle2, KeyRound, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { DatePicker } from "../../components/ui/DatePicker";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { isoYearsAgo } from "../../lib/dates";
import { createCustomerAccount, type CreateAccountResult } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import type { CurrencyCode } from "../../types/data";
import { PhotoUploadPanel } from "./PhotoUploadPanel";
import {
  GeneratedField,
  generateAccountNumber,
  generatePanelCode,
  generatePin,
  generateReference,
  generateSecureCode,
} from "./generatedIdentifiers";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP", "CAD", "JPY", "AUD", "SGD", "CHF"];

export function OpenCustomerAccountPage() {
  const { store, session } = useApp();

  const [reference, setReference] = useState(generateReference());
  const [accountNumber, setAccountNumber] = useState(generateAccountNumber());
  const [country, setCountry] = useState(store.countries[0] ?? "India");
  const [panelCode, setPanelCode] = useState(() => generatePanelCode(store.countries[0] ?? "India"));
  const [pin, setPin] = useState(generatePin());
  const [secureCode, setSecureCode] = useState(generateSecureCode());

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [accountTier, setAccountTier] = useState(store.tiers[0]?.name ?? "");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [openingDeposit, setOpeningDeposit] = useState("50000");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [residentAddress, setResidentAddress] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateAccountResult | null>(null);

  function handlePhoto(file: File | null) {
    setPhoto(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function resetForm() {
    setReference(generateReference());
    setAccountNumber(generateAccountNumber());
    setPanelCode(generatePanelCode(country));
    setPin(generatePin());
    setSecureCode(generateSecureCode());
    handlePhoto(null);
    setName("");
    setFatherName("");
    setDob("");
    setAccountTier(store.tiers[0]?.name ?? "");
    setAadhaar("");
    setPan("");
    setEmail("");
    setMobile("");
    setOpeningDeposit("50000");
    setCurrency("USD");
    setResidentAddress("");
    setOfficeAddress("");
    setErrors({});
    setSubmitError(null);
    setCreated(null);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter the customer's full name.";
    if (!email.trim()) next.email = "Enter a contact email.";
    if (!/^\d{9}$/.test(pin)) next.pin = "The transaction PIN must be exactly 9 digits.";
    if (!/^\d{8}$/.test(secureCode)) next.secure_code = "The secure code must be exactly 8 digits.";
    if (!accountTier) next.accountTier = "Select an account scheme.";
    if (!openingDeposit || Number(openingDeposit) < 0) next.openingDeposit = "Enter a valid opening deposit.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (submitting) return;
    if (!validate()) return;
    if (!session.token) {
      setSubmitError("Your session has no API token — sign out and sign back in.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createCustomerAccount(
        {
          reference,
          accountNumber,
          panelCode,
          secureCode,
          pin,
          name,
          fatherName,
          dob,
          accountTier,
          aadhaar,
          pan,
          email,
          mobile,
          country,
          openingDeposit,
          currency,
          residentAddress,
          officeAddress,
        },
        photo,
        session.token
      );
      setCreated(result);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          const key = field === "account_tier" ? "accountTier" : field === "opening_deposit" ? "openingDeposit" : field;
          mapped[key] = messages[0];
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setSubmitError(err instanceof ApiError ? err.message : "Could not create this account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <>
        <PageHead title="Open & Register Customer Account" lede="Admin can manually set or customize identifiers, upload a photo, and register a customer directly." />
        <Panel>
          <PanelBody>
            <div className="flex items-start gap-3 mb-3.5">
              <span className="flex-none w-10 h-10 rounded-full bg-[#E9F6EE] text-pos flex items-center justify-center">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <h3 className="m-0 text-[15px] font-bold text-pos">Account created</h3>
                <p className="m-0 mt-0.5 text-[12.5px] text-ink-2">
                  An activation email has been sent to <strong className="text-ink">{created.user.email}</strong> with a link to set
                  their password, or to self-register via <strong className="text-ink">Register for Netbanking</strong> in the navbar using the
                  identifiers below.
                </p>
              </div>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
              {(
                [
                  ["Customer ID", created.user.reference],
                  ["Account number", created.user.account_number],
                  ["Panel number", created.user.panel_code],
                  ["Account tier", created.user.account_tier],
                  ["Segment", created.user.segment],
                  ["KYC status", created.user.kyc_status],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{k}</span>
                  <p className="m-0 text-[13px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
            <Callout title="8-digit secure code — shown once" variant="warn" className="mb-4">
              <p>
                <strong className="font-num text-[15px] text-navy">{created.secure_code}</strong> — the customer needs this, along with
                their Customer ID, Aadhaar/PAN and account number, to self-register via Register for Netbanking. It's already in the activation
                email; this is the only other place it's shown.
              </p>
            </Callout>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Btn variant="primary" onClick={resetForm}>
                Open another account
              </Btn>
              <Link
                to="/customer-accounts"
                className="inline-flex items-center rounded-full border border-navy-dk bg-white px-4 py-2 text-xs font-semibold text-navy no-underline hover:bg-tint"
              >
                View in Customer Accounts →
              </Link>
            </div>
          </PanelBody>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Open & Register Customer Account"
        lede="Admin can manually set or customize the Customer ID, Account Number, Panel Number, and Secure Code, upload a customer photo, and assign a 9-digit transaction PIN."
      />

      <Panel>
        <PanelHead
          title={
            <span className="flex items-center gap-1.5">
              <KeyRound size={14} className="text-navy" /> Admin Assigned Bank Identifiers &amp; Security Codes
            </span>
          }
        />
        <PanelBody>
          <FormGrid>
            <GeneratedField
              label="Customer ID / User ID"
              htmlFor="oca-reference"
              value={reference}
              onChange={setReference}
              onGenerate={() => setReference(generateReference())}
              required
              error={errors.reference}
            />
            <GeneratedField
              label="Bank Account Number"
              htmlFor="oca-account-number"
              value={accountNumber}
              onChange={setAccountNumber}
              onGenerate={() => setAccountNumber(generateAccountNumber())}
              required
              error={errors.account_number}
            />
            <GeneratedField
              label="Panel Number"
              htmlFor="oca-panel-code"
              value={panelCode}
              onChange={setPanelCode}
              onGenerate={() => setPanelCode(generatePanelCode(country))}
              required
              error={errors.panel_code}
            />
            <GeneratedField
              label="9-Digit Initial Transaction PIN"
              htmlFor="oca-pin"
              value={pin}
              onChange={setPin}
              onGenerate={() => setPin(generatePin())}
              required
              hint="Mandatory security PIN for the customer's transfers & payments."
              error={errors.pin}
            />
            <GeneratedField
              label="8-Digit Secure Code"
              htmlFor="oca-secure-code"
              value={secureCode}
              onChange={(v) => setSecureCode(v.replace(/\D/g, "").slice(0, 8))}
              onGenerate={() => setSecureCode(generateSecureCode())}
              required
              hint="Given to the customer to self-register via Register for Netbanking, alongside their Customer ID, Aadhaar/PAN and account number."
              error={errors.secure_code}
            />
          </FormGrid>
        </PanelBody>
      </Panel>

      <PhotoUploadPanel photo={photo} photoPreview={photoPreview} onChange={handlePhoto} />

      <Panel>
        <PanelHead
          title={
            <span className="flex items-center gap-1.5">
              <UserPlus size={14} className="text-navy" /> Customer Profile
            </span>
          }
        />
        <PanelBody>
          <FormGrid>
            <Field label="Customer Full Name" htmlFor="oca-name" required error={errors.name}>
              <TextInput id="oca-name" value={name} onChange={(e) => setName(e.target.value)} hasError={!!errors.name} placeholder="e.g. Sumanth Varma" autoComplete="off" />
            </Field>
            <Field label="Father / Husband Name" htmlFor="oca-father">
              <TextInput id="oca-father" value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="e.g. R. K. Varma" autoComplete="off" />
            </Field>

            <Field label="Date of Birth" htmlFor="oca-dob">
              <DatePicker id="oca-dob" value={dob} onChange={setDob} min={isoYearsAgo(100)} max={isoYearsAgo(18)} placeholder="Select date of birth" />
            </Field>
            <Field label="Account Scheme Type" htmlFor="oca-tier" required error={errors.accountTier}>
              <Select id="oca-tier" value={accountTier} onChange={(e) => setAccountTier(e.target.value)} hasError={!!errors.accountTier}>
                {store.tiers.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Aadhaar Card Number" htmlFor="oca-aadhaar">
              <TextInput id="oca-aadhaar" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="4820-1920-3344" autoComplete="off" />
            </Field>
            <Field label="PAN Card Number" htmlFor="oca-pan" error={errors.pan}>
              <TextInput id="oca-pan" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} hasError={!!errors.pan} placeholder="ABCDE1234F" autoComplete="off" />
            </Field>

            <Field label="Email Address" htmlFor="oca-email" required error={errors.email}>
              <TextInput id="oca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hasError={!!errors.email} placeholder="customer@example.com" autoComplete="off" />
            </Field>
            <Field label="Mobile Contact" htmlFor="oca-mobile">
              <TextInput id="oca-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98000 00000" autoComplete="off" />
            </Field>

            <Field label="Country" htmlFor="oca-country">
              <Select
                id="oca-country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPanelCode(generatePanelCode(e.target.value));
                }}
              >
                {store.countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Initial Opening Deposit" htmlFor="oca-deposit" required error={errors.openingDeposit}>
              <div className="flex gap-1.5">
                {/* Each control keeps its own base w-full — sizing comes from
                 * the wrapper, not a second width utility competing with it
                 * on the same element (Tailwind doesn't guarantee source-order
                 * wins between same-specificity classes). */}
                <div className="flex-1 min-w-0">
                  <TextInput
                    id="oca-deposit"
                    value={openingDeposit}
                    onChange={(e) => setOpeningDeposit(e.target.value.replace(/[^0-9.]/g, ""))}
                    hasError={!!errors.openingDeposit}
                  />
                </div>
                <div className="w-[92px] flex-none">
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </Field>

            <Field label="Resident Address" htmlFor="oca-resident" wide>
              <TextArea id="oca-resident" value={residentAddress} onChange={(e) => setResidentAddress(e.target.value)} placeholder="House, Street, City, State, PIN" className="min-h-[52px]" />
            </Field>
            <Field label="Official / Office Address" htmlFor="oca-office" wide>
              <TextArea id="oca-office" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} placeholder="Office / Business address" className="min-h-[52px]" />
            </Field>
          </FormGrid>

          {submitError ? (
            <Callout title="Couldn't create this account" variant="warn" className="mt-3.5">
              <p>{submitError}</p>
            </Callout>
          ) : null}

          <Btn variant="primary" className="mt-3.5 w-full text-center" onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account & Send Activation Email"}
          </Btn>
        </PanelBody>
      </Panel>
    </>
  );
}
