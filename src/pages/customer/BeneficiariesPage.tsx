import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, FormActions, FormGrid, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, Chip, Note, TypeTab } from "../../components/ui/Misc";
import { DirectoryCard, DirectoryEmpty, DirectoryList } from "../../components/ui/DirectoryCard";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import type { Beneficiary } from "../../types/data";
import { maskAccount } from "../../lib/format";
import { BANK_PRESETS } from "../../data/constants";
import { IFSC_FORMAT, PANEL_CODE_FORMAT, CIF_FORMATS } from "../../lib/validators";
import { today } from "../../lib/dates";

function beneCodeLabel(b: Beneficiary): string {
  if (b.ifsc && b.swift) return `IFSC ${b.ifsc} · SWIFT ${b.swift}`;
  if (b.ifsc) return `IFSC ${b.ifsc}`;
  if (b.swift) return `SWIFT ${b.swift}`;
  return b.internal ? "Internal — no routing code" : "No routing code on file";
}

function beneBadge(b: Beneficiary): { label: string; variant: string } {
  if (b.internal) return { label: "2WF Internal", variant: "processing" };
  if (b.country === "India") return { label: "Indian Bank", variant: "completed" };
  return { label: "International", variant: "review" };
}

type Tab = "external" | "internal";

export function BeneficiariesPage() {
  const { store, setStore } = useApp();
  const [tab, setTab] = useState<Tab>("internal");
  const [pending, setPending] = useState<Beneficiary | null>(null);
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

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
    setName(""); setBankName(""); setAccount(""); setAccountConfirm(""); setIfsc(""); setAcctType("Savings Account");
    setIntAccount(""); setPanelCode(""); setCif(""); setVerifyResult(null);
    setErrors({});
    setFormError(null);
    setPending(null);
    setOtp("");
    setOtpInput("");
    setOtpError(null);
    setTab("internal");
  }

  function duplicateCheck(masked: string, checkName: string): boolean {
    const dup = store.beneficiaries.some((b) => b.account === masked && b.name.toLowerCase() === checkName.toLowerCase());
    setFormError(dup ? "That beneficiary is already registered." : null);
    return !dup;
  }

  function stageForOtp(rec: Beneficiary) {
    setPending(rec);
    setOtp(String(Math.floor(100000 + Math.random() * 900000)));
    setOtpInput("");
    setOtpError(null);
  }

  function submitExternal() {
    let ok = true;
    if (!name.trim()) { setErr("bf-name", "Enter the beneficiary’s account holder name."); ok = false; } else setErr("bf-name", null);
    if (!bankName.trim()) { setErr("bf-bankname", "Enter the beneficiary’s bank name."); ok = false; } else setErr("bf-bankname", null);

    const cleanAcct = account.replace(/[^A-Za-z0-9]/g, "");
    if (!account) { setErr("bf-acct", "Enter an account number."); ok = false; }
    else if (cleanAcct.length < 4 || cleanAcct.length > 18) { setErr("bf-acct", "Account number must be 4–18 letters or digits."); ok = false; }
    else setErr("bf-acct", null);

    if (!accountConfirm) { setErr("bf-acct-confirm", "Re-enter the account number."); ok = false; }
    else if (accountConfirm !== account) { setErr("bf-acct-confirm", "Account numbers do not match."); ok = false; }
    else setErr("bf-acct-confirm", null);

    const cleanIfsc = ifsc.trim().toUpperCase();
    if (!cleanIfsc) { setErr("bf-ifsc", "An IFSC code is required for an Indian beneficiary."); ok = false; }
    else if (!IFSC_FORMAT.test(cleanIfsc)) { setErr("bf-ifsc", "IFSC codes are 11 characters: four letters, then 0, then a six-character branch code."); ok = false; }
    else setErr("bf-ifsc", null);
    setIfsc(cleanIfsc);

    if (!ok) return;
    const masked = maskAccount(account);
    if (!duplicateCheck(masked, name)) return;

    stageForOtp({
      id: "b" + (store.beneficiaries.length + 1 + Math.floor(Math.random() * 1000)),
      name: name.trim(),
      detail: `Registered ${today()} — cooling-off period`,
      account: masked,
      country: store.user.country,
      currency: "INR",
      ifsc: cleanIfsc,
      bankName: bankName.trim(),
      acctType,
      internal: false,
      status: "Pending verification",
    });
  }

  function validateInternal(): boolean {
    let ok = true;
    const cleanAcct = intAccount.replace(/[^A-Za-z0-9]/g, "");
    if (!intAccount) { setErr("bf-internal-acct", "Enter the 2 Way Fund account number."); ok = false; }
    else if (cleanAcct.length < 4 || cleanAcct.length > 18) { setErr("bf-internal-acct", "Account number must be 4–18 letters or digits."); ok = false; }
    else setErr("bf-internal-acct", null);

    const p = panelCode.trim().toUpperCase();
    if (!p) { setErr("bf-panelcode", "Enter the assigned panel number."); ok = false; }
    else if (!PANEL_CODE_FORMAT.test(p)) { setErr("bf-panelcode", "Panel numbers follow the form PNL-XX-0000."); ok = false; }
    else setErr("bf-panelcode", null);
    setPanelCode(p);

    const c = cif.trim().toUpperCase();
    if (!c) { setErr("bf-cif", "Enter the customer’s ID (CIF)."); ok = false; }
    else if (!CIF_FORMATS.reference.re.test(c)) { setErr("bf-cif", CIF_FORMATS.reference.hint); ok = false; }
    else setErr("bf-cif", null);
    setCif(c);

    return ok;
  }

  function verifyInternal() {
    setVerifyResult(null);
    if (!validateInternal()) return;
    setVerifyResult("ok");
  }

  function submitInternal() {
    if (!validateInternal()) return;
    const masked = maskAccount(intAccount);
    const displayName = "2 Way Fund account " + intAccount.slice(-4);
    if (!duplicateCheck(masked, displayName)) return;

    stageForOtp({
      id: "b" + (store.beneficiaries.length + 1 + Math.floor(Math.random() * 1000)),
      name: displayName,
      detail: `Panel ${panelCode} · CIF ${cif}`,
      account: masked,
      country: store.user.country,
      currency: "INR",
      panelCode,
      cif,
      internal: true,
      status: "Pending verification",
    });
  }

  function confirmOtp() {
    if (otpInput.trim() !== otp) {
      setOtpError("Incorrect one-time password. The code is shown above.");
      return;
    }
    if (!pending) return;
    setStore((s) => ({ ...s, beneficiaries: [...s.beneficiaries, pending] }));
    setConfirmMsg(`${pending.name} registered and placed in the cooling-off period.`);
    clearAll();
  }

  function completeCheck(id: string) {
    setStore((s) => ({
      ...s,
      beneficiaries: s.beneficiaries.map((b) =>
        b.id === id ? { ...b, status: "Verified" as const, detail: "Verification completed — cleared for settlement" } : b
      ),
    }));
  }

  function removeBene(id: string) {
    setStore((s) => ({ ...s, beneficiaries: s.beneficiaries.filter((b) => b.id !== id) }));
  }

  return (
    <>
      <PageHead
        title="Manage Beneficiaries"
        lede="Register, review and remove the accounts you can transfer to. A newly added beneficiary enters a cooling-off period before it can receive its first settlement."
      />

      <div className="grid gap-4.5 mb-4 items-stretch min-[1001px]:grid-cols-2">
        <Panel className="mb-0 flex flex-col">
          <PanelHead title="Add a Beneficiary" note="Confirmation required" />
          <PanelBody>
            <p className="mt-0 text-xs text-ink-2 mb-3">
              Register payees from Indian commercial banks (SBI, HDFC, ICICI, PNB, etc.) or your internal 2 Way Fund accounts. External
              beneficiaries must be based in India — this account cannot add a beneficiary in another country.
            </p>

            {formError ? <Note danger>{formError}</Note> : null}
            {confirmMsg ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-lg p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Beneficiary added</h3>
                <p className="m-0 text-xs">{confirmMsg}</p>
              </div>
            ) : null}

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
                    <Btn variant="block" onClick={submitExternal}>
                      Add Indian Bank Beneficiary
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
                  <Callout title="Account details verified" className="mt-3">
                    <p>
                      Account number, panel number and customer ID are all correctly formatted. This is a format check only — no external
                      directory is queried, since this file makes no network call. Select Save Internal Payee to register it.
                    </p>
                  </Callout>
                ) : null}
                <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-3.5 mt-3.5">
                  <Btn onClick={verifyInternal}>Verify Account</Btn>
                  <Btn variant="primary" onClick={submitInternal}>
                    Save Internal Payee
                  </Btn>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-3.5 mt-3.5">
              <Btn onClick={clearAll}>Clear</Btn>
              <Note className="!m-0">Account numbers are masked on save — only the last four characters are retained for display. Nothing entered here leaves your browser.</Note>
            </div>

            {pending ? (
              <div className="bg-tint border border-border-lt rounded-lg p-4 mt-4 text-[12.5px]">
                <span className="block font-bold text-navy mb-2">Confirm with one-time password — displayed, never sent</span>
                <div>
                  Adding a payee is a protected action. Confirm {pending.name} ({pending.account}) to register it.
                </div>
                <div className="inline-block font-num text-[26px] font-bold tracking-widest text-navy bg-white border border-border rounded-md px-4 py-2 my-1.5">
                  {otp}
                </div>
                <div>Generated in this browser and shown here so the step can be demonstrated. Nothing is transmitted.</div>
                <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
                  <input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmOtp()}
                    className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-[5px]"
                    aria-label="One-time password"
                  />
                  <Btn variant="approve" onClick={confirmOtp}>
                    Confirm
                  </Btn>
                  <Btn onClick={() => { setPending(null); setOtp(""); }}>Cancel</Btn>
                </div>
                {otpError ? <div className="text-neg text-xs font-semibold mt-2.5">{otpError}</div> : null}
              </div>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel className="mb-0 flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-wrap px-3.5 py-2.5 bg-gradient-to-b from-[#F2F6FA] to-panel-head border-b border-border">
            <div>
              <h2 className="text-[13px] font-bold text-navy">Saved Beneficiaries Directory</h2>
              <p className="mt-0.5 text-[11px] text-ink-2">Payees authorised on your NetBanking profile</p>
            </div>
            <Tag variant="completed">
              {store.beneficiaries.length} {store.beneficiaries.length === 1 ? "Payee" : "Payees"}
            </Tag>
          </div>
          <PanelBody>
            <DirectoryList>
              {store.beneficiaries.length === 0 ? (
                <DirectoryEmpty>No beneficiaries registered. Add one using the form.</DirectoryEmpty>
              ) : (
                store.beneficiaries.map((b) => {
                  const badge = beneBadge(b);
                  const pendingStatus = b.status !== "Verified";
                  return (
                    <DirectoryCard
                      key={b.id}
                      name={b.name}
                      badge={<Tag variant={badge.variant}>{badge.label}</Tag>}
                      meta={[
                        `Acc: ${b.account} · ${beneCodeLabel(b)}`,
                        ...(pendingStatus ? [`Status: ${b.status}`] : []),
                      ]}
                      sub={`Bank: ${b.bankName || b.detail}`}
                      actions={
                        <>
                          {pendingStatus ? (
                            <Btn onClick={() => completeCheck(b.id)} title="Demo control — stands in for the cooling-off period elapsing">
                              Complete check
                            </Btn>
                          ) : (
                            <Link to="/transfer" className="inline-block border rounded-[5px] px-4 py-2 text-xs font-semibold bg-gradient-to-b from-navy-lt to-navy border-navy-dk text-white no-underline">
                              Transfer
                            </Link>
                          )}
                          <Btn onClick={() => removeBene(b.id)}>Delete</Btn>
                        </>
                      }
                    />
                  );
                })
              )}
            </DirectoryList>
          </PanelBody>
          <PanelBody>
            <Note>
              Only beneficiaries marked <strong>Verified</strong> can be selected on <Link to="/transfer">Transfer Funds</Link>. This is control
              layer 4 of the security model — holding a newly registered payee before its first settlement limits what a compromised session can
              do.
            </Note>
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Why New Beneficiaries Are Held" />
        <PanelBody>
          <Callout title="Verification is never accelerated by a payment" variant="warn">
            <p>
              A newly registered beneficiary is held before its first settlement so that an attacker who gains access to a session cannot
              immediately add their own account and drain the balance. The hold clears on the institution's own schedule, through its own checks.
            </p>
            <p>
              No legitimate institution will offer to lift that hold in exchange for a fee, a transfer, or a "verification payment", and none will
              ask you for your password or one-time code to release it. A request of that kind is a fraud attempt regardless of who appears to be
              making it.
            </p>
          </Callout>
        </PanelBody>
      </Panel>
    </>
  );
}
