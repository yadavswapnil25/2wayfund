import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Chip, Note, TypeTab } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import type { Beneficiary } from "../../types/data";
import { BANK_PRESETS } from "../../data/constants";
import { IFSC_FORMAT, PANEL_CODE_FORMAT, CIF_FORMATS } from "../../lib/validators";
import {
  confirmBeneficiary,
  initiateExternalBeneficiary,
  initiateInternalBeneficiary,
  type InitiateExternalPayload,
  type InitiateInternalPayload,
} from "../../services/beneficiaryService";
import { ApiError } from "../../services/apiClient";

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches PinSecurityPage,
 * ExchangePage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

/** A backend field-validation error lands under its own snake_case field
 * name — this maps that back onto the id this page's own error state
 * already keys errors by. */
function applyFieldErrors(err: unknown, setErr: (id: string, msg: string | null) => void, map: Record<string, string>) {
  if (!(err instanceof ApiError) || !err.fieldErrors) return false;
  let applied = false;
  for (const [field, id] of Object.entries(map)) {
    const message = err.fieldErrors[field]?.[0];
    if (message) {
      setErr(id, message);
      applied = true;
    }
  }
  return applied;
}

type Tab = "external" | "internal";

export function BeneficiariesPage() {
  const { session } = useApp();
  const [tab, setTab] = useState<Tab>("internal");
  const [pending, setPending] = useState<Beneficiary | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  // external fields
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [account, setAccount] = useState("");
  const [accountConfirm, setAccountConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [acctType, setAcctType] = useState("Savings Account");

  // internal fields
  const [intAccount, setIntAccount] = useState("");
  const [panelCode, setPanelCode] = useState("");
  const [cif, setCif] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function clearAll() {
    setName("");
    setBankName("");
    setAccount("");
    setAccountConfirm("");
    setIfsc("");
    setAcctType("Savings Account");
    setIntAccount("");
    setPanelCode("");
    setCif("");
    setVerifyResult(null);
    setErrors({});
    setFormError(null);
    setPending(null);
    setOtpInput("");
    setOtpError(null);
    setTab("internal");
  }

  async function submitExternal() {
    if (submitting) return;
    let ok = true;
    if (!name.trim()) {
      setErr("bf-name", "Enter the beneficiary’s account holder name.");
      ok = false;
    } else setErr("bf-name", null);
    if (!bankName.trim()) {
      setErr("bf-bankname", "Enter the beneficiary’s bank name.");
      ok = false;
    } else setErr("bf-bankname", null);

    const cleanAcct = account.replace(/[^A-Za-z0-9]/g, "");
    if (!account) {
      setErr("bf-acct", "Enter an account number.");
      ok = false;
    } else if (cleanAcct.length < 4 || cleanAcct.length > 18) {
      setErr("bf-acct", "Account number must be 4–18 letters or digits.");
      ok = false;
    } else setErr("bf-acct", null);

    if (!accountConfirm) {
      setErr("bf-acct-confirm", "Re-enter the account number.");
      ok = false;
    } else if (accountConfirm !== account) {
      setErr("bf-acct-confirm", "Account numbers do not match.");
      ok = false;
    } else setErr("bf-acct-confirm", null);

    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!cleanIfsc) {
      setErr("bf-ifsc", "An IFSC code is required for an Indian beneficiary.");
      ok = false;
    } else if (!IFSC_FORMAT.test(cleanIfsc)) {
      setErr("bf-ifsc", "IFSC codes are 11 characters: four letters, then 0, then a six-character branch code.");
      ok = false;
    } else setErr("bf-ifsc", null);
    setIfsc(cleanIfsc);

    if (!ok || !session.token) return;

    const payload: InitiateExternalPayload = { name: name.trim(), bankName: bankName.trim(), account, accountConfirmation: accountConfirm, ifsc: cleanIfsc, acctType };
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await initiateExternalBeneficiary(payload, session.token);
      setPending(result);
      setOtpInput("");
      setOtpError(null);
    } catch (err) {
      if (!applyFieldErrors(err, setErr, { account: "bf-acct", ifsc: "bf-ifsc", name: "bf-name", bank_name: "bf-bankname" })) {
        setFormError(firstErrorMessage(err, "Could not add this beneficiary. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function validateInternal(): boolean {
    let ok = true;
    const cleanAcct = intAccount.replace(/[^A-Za-z0-9]/g, "");
    if (!intAccount) {
      setErr("bf-internal-acct", "Enter the 2 Way Fund account number.");
      ok = false;
    } else if (cleanAcct.length < 4 || cleanAcct.length > 18) {
      setErr("bf-internal-acct", "Account number must be 4–18 letters or digits.");
      ok = false;
    } else setErr("bf-internal-acct", null);

    const p = panelCode.trim().toUpperCase();
    if (!p) {
      setErr("bf-panelcode", "Enter the assigned panel number.");
      ok = false;
    } else if (!PANEL_CODE_FORMAT.test(p)) {
      setErr("bf-panelcode", "Panel numbers follow the form PNL-XX-0000.");
      ok = false;
    } else setErr("bf-panelcode", null);
    setPanelCode(p);

    const c = cif.trim().toUpperCase();
    if (!c) {
      setErr("bf-cif", "Enter the customer’s ID (CIF).");
      ok = false;
    } else if (!CIF_FORMATS.reference.re.test(c)) {
      setErr("bf-cif", CIF_FORMATS.reference.hint);
      ok = false;
    } else setErr("bf-cif", null);
    setCif(c);

    return ok;
  }

  function verifyInternal() {
    setVerifyResult(null);
    if (!validateInternal()) return;
    setVerifyResult("ok");
  }

  async function submitInternal() {
    if (submitting || !validateInternal() || !session.token) return;

    const payload: InitiateInternalPayload = { account: intAccount, panelCode, cif };
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await initiateInternalBeneficiary(payload, session.token);
      setPending(result);
      setOtpInput("");
      setOtpError(null);
    } catch (err) {
      if (!applyFieldErrors(err, setErr, { account: "bf-internal-acct", panel_code: "bf-panelcode", cif: "bf-cif" })) {
        setFormError(firstErrorMessage(err, "Could not add this beneficiary. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOtp() {
    if (submitting || !pending || !session.token) return;
    if (!/^\d{6}$/.test(otpInput)) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setOtpError(null);
    setSubmitting(true);
    try {
      const result = await confirmBeneficiary(pending.id, otpInput, session.token);
      setConfirmMsg(`${result.name} registered and placed in the cooling-off period.`);
      clearAll();
    } catch (err) {
      setOtpError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Add a Beneficiary"
        lede="Register payees from Indian commercial banks or your internal 2 Way Fund accounts. A newly added beneficiary enters a cooling-off period before it can receive its first settlement."
      />

      <div className="max-w-[560px]">
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserPlus size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Add a Beneficiary</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Confirmation required</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            <p className="mt-0 text-xs text-ink-2 mb-3">
              Register payees from Indian commercial banks (SBI, HDFC, ICICI, PNB, etc.) or your internal 2 Way Fund accounts. External
              beneficiaries must be based in India — this account cannot add a beneficiary in another country.
            </p>

            {formError ? <Note danger>{formError}</Note> : null}
            {confirmMsg ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Beneficiary added</h3>
                <p className="m-0 text-xs mb-2.5">{confirmMsg}</p>
                <Link to="/beneficiaries-directory" className="text-xs font-semibold text-navy underline">
                  View in Beneficiaries Directory →
                </Link>
              </div>
            ) : null}

            {!pending ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 mb-1.5">
                  <TypeTab active={tab === "external"} onClick={() => setTab("external")}>
                    Indian Commercial Bank
                  </TypeTab>
                  <TypeTab active={tab === "internal"} onClick={() => setTab("internal")}>
                    2 Way Fund (Internal)
                  </TypeTab>
                </div>

                {tab === "external" ? (
                  <div>
                    <p className="text-[10.5px] uppercase text-ink-2 font-semibold mt-3.5 mb-2">Quick bank presets</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {BANK_PRESETS.map((bp) => (
                        <Chip key={bp.short} onClick={() => setBankName(bp.full)}>
                          {bp.short}
                        </Chip>
                      ))}
                    </div>
                    <FormGrid>
                      <Field label="Beneficiary account holder name" required wide error={errors["bf-name"]}>
                        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar Sharma" hasError={!!errors["bf-name"]} />
                      </Field>
                      <Field label="Beneficiary bank name" required wide error={errors["bf-bankname"]}>
                        <TextInput value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. State Bank of India" hasError={!!errors["bf-bankname"]} />
                      </Field>
                      <Field label="Account number" required error={errors["bf-acct"]}>
                        <TextInput value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account number" hasError={!!errors["bf-acct"]} />
                      </Field>
                      <Field label="Confirm account number" required error={errors["bf-acct-confirm"]}>
                        <TextInput value={accountConfirm} onChange={(e) => setAccountConfirm(e.target.value)} placeholder="Re-enter account number" hasError={!!errors["bf-acct-confirm"]} />
                      </Field>
                      <Field label="11-digit IFSC code" required error={errors["bf-ifsc"]} hint="Eleven characters — four-letter bank code, then 0, then a six-character branch code.">
                        <TextInput value={ifsc} onChange={(e) => setIfsc(e.target.value)} maxLength={11} placeholder="e.g. SBIN0001234" hasError={!!errors["bf-ifsc"]} />
                      </Field>
                      <Field label="Account type">
                        <Select value={acctType} onChange={(e) => setAcctType(e.target.value)}>
                          <option>Savings Account</option>
                          <option>Current Account</option>
                        </Select>
                      </Field>
                      <FormActions className="flex-col items-stretch">
                        <Btn variant="block" onClick={() => void submitExternal()} disabled={submitting}>
                          {submitting ? "Sending code…" : "Add Indian Bank Beneficiary"}
                        </Btn>
                      </FormActions>
                    </FormGrid>
                  </div>
                ) : (
                  <div>
                    <FormGrid>
                      <Field label="2 Way Fund account number" required wide error={errors["bf-internal-acct"]}>
                        <TextInput value={intAccount} onChange={(e) => setIntAccount(e.target.value)} placeholder="e.g. 902200118855" hasError={!!errors["bf-internal-acct"]} />
                      </Field>
                      <Field label="Assigned panel number" required error={errors["bf-panelcode"]}>
                        <TextInput value={panelCode} onChange={(e) => setPanelCode(e.target.value)} placeholder="e.g. PNL-IN-4402" hasError={!!errors["bf-panelcode"]} />
                      </Field>
                      <Field label="Customer ID (CIF)" required error={errors["bf-cif"]}>
                        <TextInput value={cif} onChange={(e) => setCif(e.target.value)} placeholder="e.g. 2WFMP04817" hasError={!!errors["bf-cif"]} />
                      </Field>
                    </FormGrid>
                    {verifyResult ? (
                      <div className="rounded-2xl border border-border-lt bg-[#EAF1F9] px-4.5 py-4 mt-3">
                        <h3 className="m-0 text-[13px] font-bold text-navy">Account details verified</h3>
                        <p className="m-0 mt-1.5 text-[12.5px] text-ink">
                          Account number, panel number and customer ID are all correctly formatted. This is a format check only — no external
                          directory is queried. Select Save Internal Payee to register it.
                        </p>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-3.5 mt-3.5">
                      <Btn onClick={verifyInternal} disabled={submitting}>
                        Verify Account
                      </Btn>
                      <Btn variant="primary" onClick={() => void submitInternal()} disabled={submitting}>
                        {submitting ? "Sending code…" : "Save Internal Payee"}
                      </Btn>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-3.5 mt-3.5">
                  <Btn onClick={clearAll}>Clear</Btn>
                  <Note className="!m-0">Account numbers are masked before they're ever saved — only the last four characters are retained.</Note>
                </div>
              </>
            ) : (
              <div className="bg-tint border border-border-lt rounded-xl p-4 text-[12.5px]">
                <span className="block font-bold text-navy mb-2">Enter the one-time code we emailed you</span>
                <div>
                  Adding {pending.name} ({pending.account}) is a protected action — check the email on file for this account. The code expires 10
                  minutes after it's sent, and can only be used once.
                </div>
                <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
                  <input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && void confirmOtp()}
                    inputMode="numeric"
                    autoComplete="off"
                    className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-lg"
                    aria-label="One-time code"
                  />
                  <Btn variant="approve" onClick={() => void confirmOtp()} disabled={submitting}>
                    {submitting ? "Confirming…" : "Confirm"}
                  </Btn>
                  <Btn onClick={clearAll} disabled={submitting}>
                    Cancel
                  </Btn>
                </div>
                {otpError ? <div className="text-neg text-xs font-semibold mt-2.5">{otpError}</div> : null}
              </div>
            )}
          </div>
        </div>

        <p className="mt-3.5 mb-0 text-[12px] text-ink-2">
          <Link to="/beneficiaries-directory" className="font-semibold text-navy">
            View your saved beneficiaries →
          </Link>
        </p>
      </div>
    </>
  );
}
