import { Eye, EyeOff, Copy, Check, Gift, KeyRound, Send, UserPlus, FileText, ChevronRight, Printer, ArrowUpRight, ArrowDownRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatusTag } from "../../components/ui/Tag";
import { LoadingBlock, Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { displayMoney, formatCode, groupInFours } from "../../lib/format";
import { getBalances, getMe, getTransactions } from "../../services/meService";
import { ApiError } from "../../services/apiClient";
import { ProfilePhotoAvatar } from "./ProfilePhotoAvatar";
import type { Transaction } from "../../types/data";

interface CopyableDetailProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  bold?: boolean;
}

/** One account-identifier tile in the hero card: a label, the value, and
 * a copy control. Shown in full — every value here belongs to the
 * customer already looking at it. */
function CopyableDetail({ label, value, copied, onCopy, bold = false }: CopyableDetailProps) {
  return (
    <div className="rounded-lg border border-gold/25 bg-[#FFFBF2] px-3 py-2">
      <span className="block mb-0.5 text-[10px] uppercase text-ink-2 font-semibold">{label}</span>
      <p className={`m-0 flex items-center gap-1.5 text-[12px] text-navy ${bold ? "font-bold" : ""}`}>
        <span>{value}</span>
        <button type="button" onClick={onCopy} className="text-ink-2 hover:text-gold-dk" title={`Copy ${label}`}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </p>
    </div>
  );
}

export function AccountSummaryPage() {
  const { store, setStore, session, balancesHidden, setBalancesHidden } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Never renders the seed customer — nobody sees "Aditi Sharma" (or any
  // other real customer's last-known data) for even a moment while
  // whoever actually logged in is still loading. `loaded` only flips
  // true once the real name, balances and transactions have all landed.
  const [loaded, setLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();
  const { user } = store;
  const kycVerified = user.kycStatus === "Verified";

  useEffect(() => {
    if (!session.token) {
      setLoadError("Your session has no API token — sign out and sign back in.");
      return;
    }
    const controller = new AbortController();
    const token = session.token;

    (async () => {
      try {
        const [me, balances, txs] = await Promise.all([
          getMe(token, controller.signal),
          getBalances(token, controller.signal),
          getTransactions(token, controller.signal),
        ]);
        setStore((s) => ({ ...s, user: { ...s.user, ...me }, balances }));
        setTransactions(txs);
        setLoadError(null);
        setLoaded(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your account. Please try again.");
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  async function copy(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* clipboard unavailable — nothing else to do in this demo */
      }
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1200);
  }

  const inrLedger = store.balances.find((b) => b.currency === "INR") ?? store.balances[0];

  const inrLedgerTx = (() => {
    const list = transactions
      .filter((t) => t.currency === "INR")
      .slice()
      .sort((a, b) => (a.valueIso === b.valueIso ? (a.time < b.time ? 1 : -1) : a.valueIso < b.valueIso ? 1 : -1));
    let bal = inrLedger.amount;
    return list.map((t) => {
      const balanceAfter = bal;
      if (!t.reversed) bal = t.direction === "credit" ? bal - t.amount : bal + t.amount;
      return { t, balanceAfter };
    });
  })();

  return (
    <>
      {loadError ? (
        <Note danger className="mb-3.5">
          {loadError}
        </Note>
      ) : null}
      {photoError ? (
        <Note danger className="mb-3.5">
          {photoError}
        </Note>
      ) : null}

      {!loaded ? (
        loadError ? null : <LoadingBlock label="Loading your account…" />
      ) : (
        <>
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gold/25 text-ink shadow-lg mb-4">
        <div className="pointer-events-none absolute -top-20 -right-14 w-56 h-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 w-52 h-52 rounded-full bg-[#F6E7BC]/50 blur-3xl" />

        <div className="relative px-4 sm:px-5 pt-4 pb-3.5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <ProfilePhotoAvatar name={user.name} onError={setPhotoError} />
              <div className="min-w-0">
                <p className="m-0 text-[11px] text-ink-2">Welcome back</p>
                <p className="m-0 text-[19px] font-bold text-navy truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide border px-1.75 py-0.5 rounded-full ${
                      kycVerified ? "bg-[#EFF8F2] text-pos border-[#A8D4BB]" : "bg-gold/15 text-gold-dk border-gold/30"
                    }`}
                  >
                    {kycVerified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />} {kycVerified ? "KYC Verified" : "KYC Pending"}
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wide bg-gold/12 text-gold-dk border border-gold/30 px-1.75 py-0.5 rounded-full">
                    {user.accountTier}
                  </span>
                </div>
              </div>
            </div>
          
          </div>

          <div className="mt-4">
            <span className="text-[10.5px] uppercase tracking-wide text-ink-2 font-semibold">Available operative balance</span>
            <div className="flex items-end gap-2.5 flex-wrap mt-1">
              <span className="font-num tabular-nums text-[19px] sm:text-[22px] font-extrabold leading-none text-ink">
                {displayMoney(inrLedger.amount, inrLedger.currency, balancesHidden)}
              </span>
              <button
                type="button"
                onClick={() => setBalancesHidden((v) => !v)}
                className="text-ink-2 hover:text-gold-dk"
                title={balancesHidden ? "Show balances" : "Hide balances"}
                aria-label={balancesHidden ? "Show balances" : "Hide balances"}
              >
                {balancesHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-3.5">
            <div className="rounded-lg border border-gold/25 bg-[#FFFBF2] px-3 py-2">
              <span className="block mb-0.5 text-[10px] uppercase text-ink-2 font-semibold">Account number</span>
              <p className="m-0 flex items-center gap-1.5 font-num text-[12px] text-navy font-bold">
                <span>{groupInFours(user.accountNumber)}</span>
                <button type="button" onClick={() => copy(user.accountNumber, "acct")} className="text-ink-2 hover:text-gold-dk" title="Copy">
                  {copiedField === "acct" ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </p>
            </div>
            <CopyableDetail
              label="Customer ID (CIF)"
              value={user.reference}
              copied={copiedField === "cif"}
              onCopy={() => copy(user.reference, "cif")}
              bold
            />
            <CopyableDetail
              label="Panel code"
              value={user.panelCode}
              copied={copiedField === "panel"}
              onCopy={() => copy(user.panelCode, "panel")}
            />
            <Link
              to="/referrals"
              className="rounded-lg border border-gold/25 bg-[#FFFBF2] px-3 py-2 no-underline text-inherit hover:bg-gold/10 transition-colors"
            >
              <span className="block mb-0.5 text-[10px] uppercase text-ink-2 font-semibold">Refer &amp; earn</span>
              <p className="m-0 flex items-center gap-1.5 font-num text-[12px] text-navy font-bold">
                <Gift size={13} className="text-gold-dk" />
                Generate a code
              </p>
            </Link>
          </div>
          <p className="m-0 mt-2 text-[10.5px] text-ink-2">
            Generate a referral code and share it with anyone applying to open an account — each code is valid for 24 hours and can be used once.
          </p>
        </div>

        <div className="relative border-t border-gold/20 bg-[#FFFBF2] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap text-[11px] text-ink-2">
          <span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pos mr-1.5" />
            Electronic clearing enabled: IMPS, NEFT, RTGS, 2WF Direct
          </span>
          <span>
            Daily transfer limit: <strong className="text-navy">{formatCode(user.dailyDomesticLimit, "INR")}</strong>
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-2.5">
        <Link
          to="/transfer"
          className="group relative overflow-hidden rounded-2xl border border-border-lt bg-white px-4 py-4 no-underline text-inherit shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Send size={17} />
          </span>
          <strong className="block text-[13.5px] text-navy">Transfer Funds</strong>
          <span className="block text-[11px] text-ink-2 mt-0.5">IMPS &middot; NEFT &middot; 2WF</span>
          <ChevronRight size={14} className="absolute right-3.5 top-4 text-border group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link
          to="/beneficiaries"
          className="group relative overflow-hidden rounded-2xl border border-border-lt bg-white px-4 py-4 no-underline text-inherit shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600 mb-3">
            <UserPlus size={17} />
          </span>
          <strong className="block text-[13.5px] text-navy">Add Payee</strong>
          <span className="block text-[11px] text-ink-2 mt-0.5">Indian Bank &middot; 2WF</span>
          <ChevronRight size={14} className="absolute right-3.5 top-4 text-border group-hover:text-purple-500 transition-colors" />
        </Link>

        <button
          type="button"
          onClick={() => navigate("/pin-security")}
          className="group relative overflow-hidden text-left rounded-2xl border border-border-lt bg-white px-4 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber mb-3">
            <KeyRound size={17} />
          </span>
          <strong className="block text-[13.5px] text-navy">9-Digit PIN</strong>
          <span className="block text-[11px] text-ink-2 mt-0.5">{user.pinStatus}</span>
          <ChevronRight size={14} className="absolute right-3.5 top-4 text-border group-hover:text-amber transition-colors" />
        </button>

        <Link
          to="/statements"
          className="group relative overflow-hidden rounded-2xl border border-border-lt bg-white px-4 py-4 no-underline text-inherit shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#EFF8F2] text-pos mb-3">
            <FileText size={17} />
          </span>
          <strong className="block text-[13.5px] text-navy">e-Passbook</strong>
          <span className="block text-[11px] text-ink-2 mt-0.5">Full ledger statement</span>
          <ChevronRight size={14} className="absolute right-3.5 top-4 text-border group-hover:text-pos transition-colors" />
        </Link>
      </div>
      <p className="text-[11px] text-ink-2 mb-5">
        Your 9-digit PIN is <strong className="text-ink font-semibold">{user.pinStatus.toLowerCase()}</strong> — required before authorising fund
        transfers and beneficiary payouts.
      </p>

      {/* Activity + sidebar */}
      <div className="grid gap-5 items-start lg:grid-cols-[1fr_320px]">
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Recent Activity</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Live verified entries from 2 Way Fund core clearing ledger</p>
            </div>
            <Link to="/statements" className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy-lt no-underline hover:underline">
              View Full Passbook <ChevronRight size={14} />
            </Link>
          </div>

          {inrLedgerTx.length === 0 ? (
            <p className="text-center py-10 text-ink-2 text-[12.5px]">No domestic ledger entries yet.</p>
          ) : (
            <div className="divide-y divide-border-lt">
              {inrLedgerTx.slice(0, 6).map(({ t, balanceAfter }) => (
                <div key={t.ref} className={`group flex items-center gap-3 px-4.5 sm:px-5 py-3.5 hover:bg-tint/70 transition-colors ${t.reversed ? "opacity-50" : ""}`}>
                  <span
                    className={`flex-none w-9 h-9 rounded-full flex items-center justify-center ${
                      t.direction === "credit" ? "bg-[#EFF8F2] text-pos" : "bg-[#FBEAE8] text-neg"
                    }`}
                  >
                    {t.direction === "credit" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`m-0 font-semibold text-[13px] text-ink truncate ${t.reversed ? "line-through" : ""}`}>{t.description}</p>
                      <span className="text-[9.5px] uppercase font-bold tracking-wide text-ink-2 bg-tint border border-border-lt rounded px-1.5 py-0.5">
                        {t.channel}
                      </span>
                    </div>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                      {t.direction === "debit" && t.beneficiary
                        ? `To: ${t.beneficiary}${t.beneficiaryBank ? ` (${t.beneficiaryBank})` : ""}`
                        : t.direction === "credit"
                          ? `From: ${t.counterparty}`
                          : t.sub}
                      {" · "}
                      {t.date} {t.time} · UTR {t.utr || t.ref}
                    </p>
                  </div>
                  <div className="flex-none flex items-center gap-3">
                    <div className="hidden sm:block">
                      <StatusTag status={t.status} />
                    </div>
                    <div className="text-right">
                      <div className={`font-num tabular-nums font-bold text-[13.5px] ${t.direction === "credit" ? "text-pos" : "text-neg"}`}>
                        {t.direction === "credit" ? "+ " : "− "}
                        {formatCode(t.amount, "INR")}
                      </div>
                      <div className="text-[10.5px] text-ink-2 font-num tabular-nums mt-0.5">
                        Bal {displayMoney(balanceAfter, "INR", balancesHidden)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-2 hover:text-navy"
                      title="Receipt"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4.5 py-3.5 border-b border-border-lt">
              <h3 className="m-0 text-[13px] font-bold text-navy">Currency Ledgers</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">{store.balances.length} ledgers linked to {user.accountNumber}</p>
            </div>
            <div className="divide-y divide-border-lt">
              {store.balances.map((b) => (
                <div key={b.currency} className="flex items-center justify-between gap-3 px-4.5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-none w-8 h-8 rounded-full bg-[#EAF1F9] text-navy text-[10.5px] font-bold flex items-center justify-center">
                      {b.currency}
                    </span>
                    <span className="text-[12px] text-ink-2 truncate">{b.note}</span>
                  </div>
                  <span className="font-num tabular-nums font-bold text-[12.5px] text-navy flex-none">
                    {displayMoney(b.amount, b.currency, balancesHidden)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
        </>
      )}
    </>
  );
}
