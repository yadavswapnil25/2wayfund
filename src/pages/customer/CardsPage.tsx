import { ShieldCheck, Wifi } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import type { Card } from "../../types/data";

function fundingLabel(c: Card): string {
  if (c.funding === "credit") return "Revolving credit";
  if (c.funding === "prepaid") return "Prepaid";
  return `Linked to ${c.currency} ledger`;
}

function CardVisual({ c, holder }: { c: Card; holder: string }) {
  const isCredit = c.type === "Credit";
  return (
    <div
      className={`relative overflow-hidden rounded-xl aspect-[1.586] max-w-[280px] mx-auto p-3.5 text-white shadow-lg ${
        isCredit ? "bg-gradient-to-br from-[#20242F] via-[#171A22] to-[#0C0E13]" : "bg-gradient-to-br from-navy-dk via-navy to-navy-lt"
      }`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl ${isCredit ? "bg-gold/25" : "bg-white/10"}`} />

      <div className="relative flex items-start justify-between">
        <div className="text-[10.5px] font-bold tracking-wide">
          2 WAY FUND <span className="font-normal text-white/70">International</span>
        </div>
        <Wifi size={14} className="rotate-90 text-white/70" />
      </div>

      <div className="relative mt-2.5 flex items-center gap-2">
        <span className="inline-block w-6.5 h-5 rounded bg-gradient-to-br from-[#E8D6A8] to-gold" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">{c.type}</span>
      </div>

      <div className="relative mt-2.5 font-num tabular-nums text-[13px] tracking-[0.1em]">
        •••• •••• •••• {c.last4}
      </div>

      <div className="relative mt-2.5 flex items-end justify-between">
        <div>
          <span className="block text-[8px] uppercase tracking-wide text-white/55">Cardholder</span>
          <span className="block text-[10.5px] font-semibold tracking-wide">{holder.toUpperCase()}</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] uppercase tracking-wide text-white/55">Valid thru</span>
          <span className="block text-[10.5px] font-semibold font-num">{c.expiry}</span>
        </div>
      </div>
    </div>
  );
}

export function CardsPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead title="Cards & Digital Payments" lede="Digital and physical cards issued against this account." />

      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        {store.cards.map((c) => (
          <div key={c.last4} className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4.5 sm:p-5">
              <CardVisual c={c} holder={store.user.name} />
            </div>
            <div className="px-4.5 sm:px-5 pb-4.5 sm:pb-5">
              <p className="m-0 text-[12px] text-ink-2 leading-relaxed">{c.capability}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.forms.map((f) => (
                  <span key={f} className="text-[10.5px] font-semibold text-ink-2 bg-tint border border-border-lt rounded-full px-2.5 py-1">
                    {f}
                  </span>
                ))}
                <span className="text-[10.5px] font-semibold text-navy bg-[#EAF1F9] border border-border rounded-full px-2.5 py-1">
                  {fundingLabel(c)}
                </span>
              </div>

              {c.funding === "credit" && c.creditLimit != null && c.outstanding != null ? (
                <div className="mt-4 pt-4 border-t border-border-lt">
                  <div className="flex items-center justify-between text-[11px] text-ink-2 mb-1.5">
                    <span>Outstanding {formatCode(c.outstanding, c.currency)}</span>
                    <span>Limit {formatCode(c.creditLimit, c.currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-tint overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-navy-lt to-navy"
                      style={{ width: `${Math.min(100, (c.outstanding / c.creditLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="m-0 mt-1.5 text-[11px] text-pos font-semibold">
                    {formatCode(c.creditLimit - c.outstanding, c.currency)} available
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EFF8F2] text-pos flex items-center justify-center">
            <ShieldCheck size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Limits &amp; Capabilities</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">Published per-card capability and limit schedule</p>
          </div>
        </div>

        <div className="divide-y divide-border-lt">
          {store.cardLimits.map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4.5 sm:px-5 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Tag variant={l.card === "Debit" ? "processing" : "completed"}>{l.card}</Tag>
                <div className="min-w-0">
                  <p className="m-0 text-[12.5px] text-ink truncate">{l.capability}</p>
                  {l.sample ? <p className="m-0 text-[10.5px] text-ink-2">Sample value — not stated in source policy</p> : null}
                </div>
              </div>
              <span className="font-num tabular-nums font-bold text-[13px] text-navy flex-none">{l.limit}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
