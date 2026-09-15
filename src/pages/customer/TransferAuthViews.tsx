import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, EyeOff, Grid3x3, KeyRound, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import type { TransferSession, TransferStage } from "../../services/transferService";

const RESEND_COOLDOWN_S = 30;

const AUTH_STEPS: { stage: TransferStage; label: string; icon: typeof KeyRound }[] = [
  { stage: "pin", label: "Transaction PIN", icon: KeyRound },
  { stage: "email_otp", label: "Email code", icon: Mail },
  { stage: "grid", label: "Recognise your PIN", icon: Grid3x3 },
  { stage: "identity_otp", label: "Identity code", icon: ShieldCheck },
];

/** The four authorisation sub-steps, with the current one highlighted. */
export function AuthProgress({ stage }: { stage: TransferStage }) {
  const currentIndex = AUTH_STEPS.findIndex((s) => s.stage === stage);
  return (
    <ol className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4.5">
      {AUTH_STEPS.map((s, i) => {
        const done = currentIndex > i || stage === "completed";
        const active = currentIndex === i;
        const Icon = s.icon;
        return (
          <li
            key={s.stage}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11.5px] font-semibold ${
              active ? "border-navy-lt bg-[#EAF1F9] text-navy" : done ? "border-[#A8D4BB] bg-[#EFF8F2] text-pos" : "border-border-lt bg-white text-ink-2"
            }`}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/70 flex-none">
              {done ? <Check size={12} /> : <Icon size={12} />}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

interface StepProps {
  session: TransferSession;
  busy: boolean;
  error: string | null;
}

export function TransferPinStep({ session, busy, error, onSubmit }: StepProps & { onSubmit: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [visible, setVisible] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (pin.length === 9 && !busy) onSubmit(pin);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 py-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-[13.5px] font-bold text-navy m-0 flex items-center gap-1.5">
          <KeyRound size={15} className="text-amber" /> Step 1 — Enter your 9-digit transaction PIN
        </h3>
        <button type="button" onClick={() => setVisible((v) => !v)} className="text-navy-lt text-xs font-semibold hover:underline flex items-center gap-1">
          {visible ? <EyeOff size={13} /> : <Eye size={13} />} {visible ? "Hide PIN" : "Show PIN"}
        </button>
      </div>
      <input
        type={visible ? "text" : "password"}
        inputMode="numeric"
        maxLength={9}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
        placeholder="Enter your 9 numeric digits"
        aria-label="Transaction PIN"
        className="w-full mt-2.5 text-[13px] px-2.5 py-2 border border-border rounded-lg bg-white focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap mt-1.5">
        <span className="text-[11px] text-ink-2">
          Digits entered: {pin.length} / 9 · {session.attemptsRemaining.pin} {session.attemptsRemaining.pin === 1 ? "attempt" : "attempts"} left
        </span>
        <Link to="/pin-security" className="text-[11.5px]">
          Set or Change 9-Digit PIN →
        </Link>
      </div>
      {error ? <div className="text-neg text-xs font-semibold mt-2">{error}</div> : null}
      <Btn type="submit" variant="approve" className="mt-3" disabled={pin.length !== 9 || busy}>
        {busy ? "Checking…" : "Verify PIN"}
      </Btn>
    </form>
  );
}

export function TransferOtpStep({
  session,
  busy,
  error,
  purpose,
  onSubmit,
  onResend,
}: StepProps & { purpose: "email" | "identity"; onSubmit: (otp: string) => void; onResend: () => void }) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const isIdentity = purpose === "identity";
  const remaining = isIdentity ? session.attemptsRemaining.identityOtp : session.attemptsRemaining.emailOtp;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (otp.length === 6 && !busy) onSubmit(otp);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border-lt bg-[#EAF1F9] px-4.5 py-4">
      <h3 className="text-[13.5px] font-bold text-navy m-0 flex items-center gap-1.5">
        {isIdentity ? <ShieldCheck size={15} className="text-navy-lt" /> : <Mail size={15} className="text-navy-lt" />}
        {isIdentity ? "Step 4 — Final identity confirmation" : "Step 2 — Verify the code we emailed you"}
      </h3>
      <p className="m-0 mt-1 text-[12px] text-ink">
        {isIdentity
          ? "A second, final code has been sent to your registered email. Enter it to confirm your identity and complete the transfer."
          : "A 6-digit code has been sent to your registered email address. It expires in 5 minutes."}
      </p>
      <input
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
        placeholder="6-digit code"
        aria-label={isIdentity ? "Identity confirmation code" : "Email verification code"}
        className="w-full sm:w-56 mt-2.5 text-[15px] tracking-[0.3em] font-num px-2.5 py-2 border border-border rounded-lg bg-white focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap mt-1.5">
        <span className="text-[11px] text-ink-2">
          {remaining} {remaining === 1 ? "attempt" : "attempts"} left
        </span>
        <button
          type="button"
          onClick={() => {
            setCooldown(RESEND_COOLDOWN_S);
            onResend();
          }}
          disabled={cooldown > 0 || busy}
          className="text-[11.5px] font-semibold text-navy-lt hover:underline disabled:text-ink-2 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
      {error ? <div className="text-neg text-xs font-semibold mt-2">{error}</div> : null}
      <Btn type="submit" variant="approve" className="mt-3" disabled={otp.length !== 6 || busy}>
        {busy ? "Verifying…" : isIdentity ? "Confirm & Transfer" : "Verify Code"}
      </Btn>
    </form>
  );
}

export function TransferPinGridStep({ session, busy, error, onSelect }: StepProps & { onSelect: (index: number) => void }) {
  const grid = session.grid ?? [];
  return (
    <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 py-4">
      <h3 className="text-[13.5px] font-bold text-navy m-0 flex items-center gap-1.5">
        <Grid3x3 size={15} className="text-amber" /> Step 3 — Select your transaction PIN
      </h3>
      <p className="m-0 mt-1 text-[12px] text-ink">
        One of these five numbers is your real 9-digit PIN. Tap it. A wrong choice reshuffles the numbers;{" "}
        <strong className="text-neg">three wrong choices freeze transfers on this account</strong> pending a security review.
      </p>
      <div className="grid gap-2 sm:grid-cols-5 mt-3">
        {grid.map((option, i) => (
          <button
            key={`${i}-${option}`}
            type="button"
            disabled={busy}
            onClick={() => onSelect(i)}
            className="font-num tabular-nums tracking-[0.12em] text-[13.5px] font-bold text-navy rounded-xl border border-border bg-white px-2 py-3 hover:border-navy-lt hover:bg-[#EAF1F9] disabled:opacity-50 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
        <span className="text-[11px] text-ink-2">
          {session.attemptsRemaining.grid} {session.attemptsRemaining.grid === 1 ? "attempt" : "attempts"} left
        </span>
        {busy ? <span className="text-[11px] text-ink-2">Checking…</span> : null}
      </div>
      {error ? <div className="text-neg text-xs font-semibold mt-2">{error}</div> : null}
    </div>
  );
}

/** Cancelled, frozen or expired — nothing further can happen on this session. */
export function TransferTerminalNotice({ session, onRestart }: { session: TransferSession; onRestart: () => void }) {
  const frozen = session.stage === "frozen";
  return (
    <div className="px-4.5 sm:px-5 py-6">
      <Note danger>
        <span className="inline-flex items-center gap-1.5 font-bold">
          <ShieldAlert size={14} /> {frozen ? "Transfers frozen" : session.stage === "cancelled" ? "Transfer cancelled" : "Transfer expired"}
        </span>
        <span className="block mt-1">
          {frozen
            ? "The PIN was selected incorrectly three times. For your security, transfers on this account have been frozen and flagged for review. Contact support to restore them — you may be asked to re-verify your identity."
            : session.stage === "cancelled"
              ? "Too many failed attempts. No money has moved. You can start a new transfer whenever you're ready."
              : "This transfer session timed out before it was completed. No money has moved."}
        </span>
      </Note>
      {!frozen ? (
        <Btn variant="primary" className="mt-4" onClick={onRestart}>
          Start a new transfer
        </Btn>
      ) : null}
    </div>
  );
}
