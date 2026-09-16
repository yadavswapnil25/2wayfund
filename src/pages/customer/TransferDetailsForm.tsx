import { Link } from "react-router-dom";
import { ArrowRight, Building2, Landmark, Zap } from "lucide-react";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note, ReviewLine } from "../../components/ui/Misc";
import { WizActions } from "../../components/ui/Stepper";
import { Tag } from "../../components/ui/Tag";
import { TRANSFER_CHANNELS } from "../../data/constants";
import { beneCodeLabel, isAllowedBeneficiary } from "../../lib/transfer";
import { displayMoney } from "../../lib/format";
import type { TransferChannel } from "../../services/transferService";
import type { Beneficiary } from "../../types/data";

const CHANNEL_ICONS: Record<string, typeof Zap> = { IMPS: Zap, NEFT: Landmark, RTGS: Building2 };

export interface TransferDetailsFormProps {
  beneficiaries: Beneficiary[];
  beneficiary: Beneficiary | null;
  beneId: string;
  channelId: TransferChannel;
  amountRaw: string;
  remarks: string;
  amountError: string | null;
  accountNumber: string;
  availableInr: number;
  balancesHidden: boolean;
  blockMessage: string | null;
  onBeneChange: (id: string) => void;
  onChannelChange: (id: TransferChannel) => void;
  onAmountChange: (raw: string) => void;
  onRemarksChange: (v: string) => void;
  onProceed: () => void;
}

/** Stage 1 of Transfer Funds — pick the payee, channel and amount. Pure
 * presentation; validation lives in TransferFundsPage.goToReview. */
export function TransferDetailsForm(p: TransferDetailsFormProps) {
  return (
    <div className="p-4.5 sm:p-5">
      {p.blockMessage ? (
        <Note danger className="mb-4.5">
          {p.blockMessage}
        </Note>
      ) : null}

      <div className="flex items-center justify-between gap-3.5 flex-wrap rounded-2xl border border-border-lt bg-tint px-4.5 py-4 mb-4.5">
        <div>
          <span className="text-[10.5px] uppercase text-ink-2 font-semibold">From account (debit)</span>
          <strong className="block mt-0.5 text-sm text-navy">Saving Account · {p.accountNumber}</strong>
        </div>
        <div className="text-right">
          <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Available funds</span>
          <div className="font-num tabular-nums text-[17px] font-bold text-navy mt-0.5">{displayMoney(p.availableInr, "INR", p.balancesHidden)}</div>
        </div>
      </div>

      <Field
        label={
          <span className="flex items-center justify-between w-full">
            Select Beneficiary Payee{" "}
            <Link to="/beneficiaries" className="text-xs font-normal">
              + Add New Indian Bank Payee
            </Link>
          </span>
        }
        required
        wide
      >
        <select
          value={p.beneId}
          onChange={(e) => p.onBeneChange(e.target.value)}
          className="w-full text-[13px] px-2.5 py-2 border border-border bg-white rounded-lg focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
        >
          <option value="">Select a beneficiary…</option>
          {p.beneficiaries.map((b) => {
            const notAllowed = !isAllowedBeneficiary(b);
            return (
              <option key={b.id} value={b.id} disabled={notAllowed}>
                {b.name} — {b.internal ? "2 Way Fund internal, no charge" : `${b.country}, ${b.currency} · 2% commission`}
                {b.status !== "Verified" ? " (pending verification)" : ""}
                {notAllowed ? " (restricted from INR)" : ""}
              </option>
            );
          })}
        </select>
      </Field>

      {p.beneficiary ? (
        <div className="rounded-2xl border border-border-lt bg-tint px-4.5 py-3.5 mt-3 text-[12.5px]">
          <ReviewLine k="Account" v={p.beneficiary.account} />
          <ReviewLine k="Routing" v={beneCodeLabel(p.beneficiary)} />
          <ReviewLine k="Country / currency" v={`${p.beneficiary.country} · ${p.beneficiary.currency}`} />
          <ReviewLine k="Transfer type" v={p.beneficiary.internal ? "Internal — no charge" : "External — 2% commission"} />
          <div className="flex items-center justify-between py-2 text-[12.5px]">
            <span>Status</span>
            <Tag variant={p.beneficiary.status === "Verified" ? "approved" : "review"}>{p.beneficiary.status}</Tag>
          </div>
        </div>
      ) : null}

      <Field label="Transfer Payment Mode" required wide className="mt-4.5">
        <div className="grid grid-cols-3 gap-2.5 max-[560px]:grid-cols-1 mt-1.5">
          {TRANSFER_CHANNELS.map((c) => {
            const Icon = CHANNEL_ICONS[c.id];
            const active = p.channelId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => p.onChannelChange(c.id)}
                className={`px-3.5 py-3.5 text-left rounded-2xl border cursor-pointer transition-colors ${
                  active ? "border-navy-lt bg-[#EAF1F9] shadow-[inset_0_0_0_1px_var(--color-navy-lt)]" : "border-border-lt bg-white hover:border-navy-lt/50"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-2 ${active ? "bg-white text-navy" : "bg-tint text-ink-2"}`}>
                  <Icon size={16} />
                </span>
                <strong className={`block text-[13px] font-bold ${active ? "text-navy" : "text-ink"}`}>{c.label}</strong>
                <span className="block mt-0.5 text-[10.5px] text-ink-2">{c.sub}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 mt-4.5 max-[560px]:grid-cols-1">
        <Field label="Transfer Amount (INR)" required error={p.amountError}>
          <TextInput inputMode="decimal" value={p.amountRaw} onChange={(e) => p.onAmountChange(e.target.value)} placeholder="₹ 0.00" hasError={!!p.amountError} />
        </Field>
        <Field label="Transaction Remarks / Purpose" wide>
          <TextInput value={p.remarks} onChange={(e) => p.onRemarksChange(e.target.value)} placeholder="e.g. Vendor payment, Medical, Monthly bills" />
        </Field>
      </div>

      <WizActions>
        <Btn variant="block" onClick={p.onProceed} disabled={!!p.blockMessage}>
          <span className="inline-flex items-center justify-center gap-1.5">
            Proceed to Review &amp; Authorization <ArrowRight size={13} />
          </span>
        </Btn>
      </WizActions>
    </div>
  );
}
