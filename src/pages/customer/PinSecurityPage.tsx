import { useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { CREDENTIALS, useApp } from "../../state/AppContext";

export function PinSecurityPage() {
  const { store, setStore } = useApp();

  const [pinAuth, setPinAuth] = useState("");
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinErrors, setPinErrors] = useState<Record<string, string | null>>({});
  const [pinFormError, setPinFormError] = useState<string | null>(null);
  const [pinPending, setPinPending] = useState<string | null>(null);
  const [pinOtp, setPinOtp] = useState("");
  const [pinOtpInput, setPinOtpInput] = useState("");
  const [pinOtpError, setPinOtpError] = useState<string | null>(null);
  const [pinDone, setPinDone] = useState(false);

  const [pwAuth, setPwAuth] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string | null>>({});
  const [pwFormError, setPwFormError] = useState<string | null>(null);
  const [pwPending, setPwPending] = useState<string | null>(null);
  const [pwOtp, setPwOtp] = useState("");
  const [pwOtpInput, setPwOtpInput] = useState("");
  const [pwOtpError, setPwOtpError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);
  const [demoPass, setDemoPass] = useState(CREDENTIALS.customer.pass);

  function checkAuth(v: string) {
    return v === demoPass || v === CREDENTIALS.customer.secureCode;
  }

  function submitPin() {
    let ok = true;
    if (!checkAuth(pinAuth)) {
      setPinErrors((e) => ({ ...e, auth: "That password or secure code doesn't match. Demo password demo1234, or the 8-digit secure code shown on this page." }));
      ok = false;
    } else setPinErrors((e) => ({ ...e, auth: null }));

    if (!/^\d{9}$/.test(pinNew)) {
      setPinErrors((e) => ({ ...e, new: "Enter exactly 9 numeric digits." }));
      ok = false;
    } else setPinErrors((e) => ({ ...e, new: null }));

    if (!pinConfirm) {
      setPinErrors((e) => ({ ...e, confirm: "Re-enter the 9-digit PIN." }));
      ok = false;
    } else if (pinConfirm !== pinNew) {
      setPinErrors((e) => ({ ...e, confirm: "PINs do not match." }));
      ok = false;
    } else setPinErrors((e) => ({ ...e, confirm: null }));

    if (!ok) return;
    setPinFormError(null);
    setPinPending(pinNew);
    setPinOtp(String(Math.floor(100000 + Math.random() * 900000)));
    setPinOtpInput("");
    setPinOtpError(null);
  }

  function confirmPinOtp() {
    if (pinOtpInput.trim() !== pinOtp) {
      setPinOtpError("Incorrect one-time password. The code is shown above.");
      return;
    }
    if (!pinPending) return;
    setStore((s) => ({ ...s, user: { ...s.user, pin: pinPending, pinStatus: "Active" } }));
    setPinDone(true);
    setPinAuth(""); setPinNew(""); setPinConfirm(""); setPinPending(null); setPinOtp("");
  }

  function submitPw() {
    let ok = true;
    if (!checkAuth(pwAuth)) {
      setPwErrors((e) => ({ ...e, auth: "That password or secure code doesn't match. Demo password demo1234, or the 8-digit secure code shown below." }));
      ok = false;
    } else setPwErrors((e) => ({ ...e, auth: null }));

    if (pwNew.length < 6) {
      setPwErrors((e) => ({ ...e, new: "Password must be at least 6 characters." }));
      ok = false;
    } else setPwErrors((e) => ({ ...e, new: null }));

    if (!pwConfirm) {
      setPwErrors((e) => ({ ...e, confirm: "Re-enter the new password." }));
      ok = false;
    } else if (pwConfirm !== pwNew) {
      setPwErrors((e) => ({ ...e, confirm: "Passwords do not match." }));
      ok = false;
    } else setPwErrors((e) => ({ ...e, confirm: null }));

    if (!ok) return;
    setPwFormError(null);
    setPwPending(pwNew);
    setPwOtp(String(Math.floor(100000 + Math.random() * 900000)));
    setPwOtpInput("");
    setPwOtpError(null);
  }

  function confirmPwOtp() {
    if (pwOtpInput.trim() !== pwOtp) {
      setPwOtpError("Incorrect one-time password. The code is shown above.");
      return;
    }
    if (!pwPending) return;
    setDemoPass(pwPending);
    CREDENTIALS.customer.pass = pwPending;
    setPwDone(true);
    setPwAuth(""); setPwNew(""); setPwConfirm(""); setPwPending(null); setPwOtp("");
  }

  const active = store.user.pinStatus === "Active";

  return (
    <>
      <PageHead
        title="9-Digit PIN & Security"
        lede="Set or update the transaction PIN required before any interbank or internal fund transfer, and change the password used to sign in to NetBanking."
      />

      <div className="grid gap-5 mb-5 items-start min-[1001px]:grid-cols-2">
        {/* PIN setup */}
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
              <KeyRound size={18} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">9-Digit Transaction PIN Setup</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Required before any interbank or internal transfer</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-3 mb-4">
              <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Transaction PIN status</span>
              <div className="flex items-center justify-between mt-1">
                <strong className="text-sm text-navy">{active ? "Active & Configured" : "Not configured"}</strong>
                <Tag variant={active ? "completed" : "review"}>{active ? "Enabled" : "Disabled"}</Tag>
              </div>
            </div>

            {pinFormError ? <Note danger>{pinFormError}</Note> : null}
            {pinDone ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Transaction PIN set</h3>
                <p className="m-0 text-xs">
                  Your 9-digit transaction PIN has been set and activated. Use it wherever the transfer flow calls for a transaction password.
                </p>
              </div>
            ) : null}

            <FormGrid>
              <Field label="Current password or 8-digit secure code" required wide error={pinErrors.auth}>
                <TextInput type="password" value={pinAuth} onChange={(e) => setPinAuth(e.target.value)} hasError={!!pinErrors.auth} />
              </Field>
              <Field
                label="New 9-digit transaction PIN"
                required
                wide
                error={pinErrors.new}
                hint={!pinErrors.new ? `Must be exactly 9 numeric digits. Digits: ${pinNew.length}/9` : undefined}
              >
                <TextInput
                  type="password"
                  inputMode="numeric"
                  maxLength={9}
                  value={pinNew}
                  onChange={(e) => setPinNew(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                  placeholder="9 numeric digits (e.g. 984018274)"
                  hasError={!!pinErrors.new}
                />
              </Field>
              <Field label="Confirm new 9-digit PIN" required wide error={pinErrors.confirm}>
                <TextInput
                  type="password"
                  inputMode="numeric"
                  maxLength={9}
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                  placeholder="Re-enter 9 numeric digits"
                  hasError={!!pinErrors.confirm}
                />
              </Field>
              <FormActions className="flex-col items-stretch">
                <Btn variant="block" onClick={submitPin}>
                  Set &amp; Activate 9-Digit Transaction PIN
                </Btn>
                <Note className="!m-0">Nothing entered here leaves your browser.</Note>
              </FormActions>
            </FormGrid>

            {pinPending ? (
              <OtpBox
                otp={pinOtp}
                otpInput={pinOtpInput}
                setOtpInput={setPinOtpInput}
                error={pinOtpError}
                onConfirm={confirmPinOtp}
                onCancel={() => { setPinPending(null); setPinOtp(""); }}
              />
            ) : null}
          </div>
        </div>

        {/* Password change */}
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
              <Lock size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Change NetBanking Password</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Used to sign in to your account</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            {pwFormError ? <Note danger>{pwFormError}</Note> : null}
            {pwDone ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Password updated</h3>
                <p className="m-0 text-xs">
                  Your NetBanking password has been changed. Use the new password next time you sign in — it applies for the rest of this browser
                  session only.
                </p>
              </div>
            ) : null}

            <FormGrid>
              <Field
                label="Current password or 8-digit secure code"
                required
                wide
                error={pwErrors.auth}
                hint={!pwErrors.auth ? "Forgot password? Use your official 8-digit bank secure code — shown below for this demo." : undefined}
              >
                <TextInput type="password" value={pwAuth} onChange={(e) => setPwAuth(e.target.value)} hasError={!!pwErrors.auth} />
              </Field>
              <Field label="New password" required wide error={pwErrors.new} hint={!pwErrors.new ? "Minimum 6 characters" : undefined}>
                <TextInput type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} hasError={!!pwErrors.new} />
              </Field>
              <Field label="Confirm new password" required wide error={pwErrors.confirm}>
                <TextInput type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} hasError={!!pwErrors.confirm} />
              </Field>
              <FormActions className="flex-col items-stretch">
                <Btn variant="block" onClick={submitPw}>
                  Update NetBanking Password
                </Btn>
                <Note className="!m-0">
                  Demo current password: <code>{demoPass}</code> — or 8-digit secure code: <code>{CREDENTIALS.customer.secureCode}</code>. Nothing
                  entered here leaves your browser.
                </Note>
              </FormActions>
            </FormGrid>

            {pwPending ? (
              <OtpBox
                otp={pwOtp}
                otpInput={pwOtpInput}
                setOtpInput={setPwOtpInput}
                error={pwOtpError}
                onConfirm={confirmPwOtp}
                onCancel={() => { setPwPending(null); setPwOtp(""); }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Security advisory */}
      <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 sm:px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={15} className="text-amber" />
          <h3 className="m-0 text-[13px] font-bold text-navy">On the 8-Digit Secure Code</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed m-0 text-ink">
          The institution will never ask you to disclose your password, transaction PIN, secure code or a one-time code — by telephone, email,
          message or any other channel — and will never ask you to make a payment to reset or unlock either credential. A request of that kind is
          a fraud attempt however convincing it looks.
        </p>
      </div>
    </>
  );
}

function OtpBox({
  otp,
  otpInput,
  setOtpInput,
  error,
  onConfirm,
  onCancel,
}: {
  otp: string;
  otpInput: string;
  setOtpInput: (v: string) => void;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-tint border border-border-lt rounded-xl p-4 mt-4 text-[12.5px]">
      <span className="block font-bold text-navy mb-2">Confirm with one-time password — displayed, never sent</span>
      <div className="inline-block font-num text-[26px] font-bold tracking-widest text-navy bg-white border border-border rounded-lg px-4 py-2 my-1.5">
        {otp}
      </div>
      <div>Generated in this browser and shown here so the step can be demonstrated. Nothing is transmitted.</div>
      <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
        <input
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-lg"
          aria-label="One-time password"
        />
        <Btn variant="approve" onClick={onConfirm}>
          Confirm
        </Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
      {error ? <div className="text-neg text-xs font-semibold mt-2.5">{error}</div> : null}
    </div>
  );
}
