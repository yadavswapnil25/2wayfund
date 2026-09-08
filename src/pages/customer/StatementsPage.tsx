import { ArrowDownRight, ArrowUpRight, Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHead } from "../../components/ui/Flow";
import { Field, Select } from "../../components/ui/Field";
import { Note } from "../../components/ui/Misc";
import { StatusTag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { displayMoney, formatCode } from "../../lib/format";
import { isoToDisplay } from "../../lib/dates";

export function StatementsPage() {
  const { store, balancesHidden } = useApp();
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState("");
  const [corridor, setCorridor] = useState("");
  const [direction, setDirection] = useState("");

  const filtered = useMemo(() => {
    return store.transactions
      .filter((t) => !currency || t.currency === currency)
      .filter((t) => !status || t.status === status)
      .filter((t) => !corridor || t.corridor === corridor)
      .filter((t) => !direction || t.direction === direction)
      .slice()
      .sort((a, b) => (a.valueIso === b.valueIso ? 0 : a.valueIso < b.valueIso ? 1 : -1));
  }, [store.transactions, currency, status, corridor, direction]);

  const totals = useMemo(() => {
    const toInr = (t: (typeof filtered)[number]) => (t.amount / store.rates[t.currency]) * store.rates.INR;
    const credits = filtered.filter((t) => t.direction === "credit" && !t.reversed).reduce((s, t) => s + toInr(t), 0);
    const debits = filtered.filter((t) => t.direction === "debit" && !t.reversed).reduce((s, t) => s + toInr(t), 0);
    return { count: filtered.length, credits, debits };
  }, [filtered, store.rates]);

  function downloadCsv() {
    const header = ["Value date", "Reference", "Particulars", "Corridor", "Status", "Currency", "Amount", "Direction"];
    const rows = filtered.map((t) => [t.valueIso, t.ref, t.description, t.corridor, t.status, t.currency, t.amount.toFixed(2), t.direction]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2WF-statement.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHead
        title="Statements & Receipts"
        lede="Full payment history across every ledger, with a downloadable statement and a dated receipt for each entry."
      />

      {/* Statement header + ledgers */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Account Statement</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">Generated {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-2.5">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Holder</span>
            <p className="m-0 text-[13px] font-semibold text-ink">{store.user.name}</p>
          </div>
          <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-2.5">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Account number</span>
            <p className="m-0 text-[13px] font-semibold text-ink font-num">{store.user.accountNumber}</p>
          </div>
          <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-2.5">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Domicile</span>
            <p className="m-0 text-[13px] font-semibold text-ink">{store.user.country}</p>
          </div>
        </div>

        <div className="px-4.5 sm:px-5 py-3 border-b border-border-lt">
          <h4 className="m-0 text-[12.5px] font-bold text-navy">Ledgers Covered</h4>
        </div>
        <div className="divide-y divide-border-lt">
          {store.balances.map((b) => (
            <div key={b.currency} className="flex items-center justify-between gap-3 px-4.5 sm:px-5 py-3">
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

      {/* Filters + actions */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm px-4.5 sm:px-5 py-4 mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          <Field label="Ledger" className="min-w-[140px]">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="">All ledgers</option>
              {store.balances.map((b) => (
                <option key={b.currency} value={b.currency}>
                  {b.currency} ledger
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" className="min-w-[140px]">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {["Completed", "Processing", "Pending", "Under review", "Failed", "Rejected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Corridor" className="min-w-[140px]">
            <Select value={corridor} onChange={(e) => setCorridor(e.target.value)}>
              <option value="">All corridors</option>
              <option value="Domestic">Domestic (INR)</option>
              <option value="International">International</option>
            </Select>
          </Field>
          <Field label="Direction" className="min-w-[140px]">
            <Select value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">All</option>
              <option value="credit">Credits only</option>
              <option value="debit">Debits only</option>
            </Select>
          </Field>
          <span className="flex-1" />
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
          >
            <Download size={13} /> Download CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-tint"
          >
            <Printer size={13} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 shadow-sm">
          <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">Entries</span>
          <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-navy">{totals.count}</div>
          <span className="text-[11px] text-ink-2">Matching current filters</span>
        </div>
        <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 shadow-sm">
          <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">Credits</span>
          <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-pos">{formatCode(totals.credits, "INR")}</div>
          <span className="text-[11px] text-ink-2">INR equivalent, excluding reversed</span>
        </div>
        <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 shadow-sm">
          <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">Debits</span>
          <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-neg">{formatCode(totals.debits, "INR")}</div>
          <span className="text-[11px] text-ink-2">INR equivalent, excluding reversed</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Payment Summary</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {totals.count} {totals.count === 1 ? "entry" : "entries"} · all ledgers, filtered above
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No entries match the current filters.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {filtered.map((t) => (
              <div
                key={t.ref}
                className={`group flex items-center gap-3 px-4.5 sm:px-5 py-3.5 hover:bg-tint/70 transition-colors ${t.reversed ? "opacity-50" : ""}`}
              >
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
                      {t.corridor}
                    </span>
                  </div>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                    {t.sub} · {isoToDisplay(t.valueIso)} · Ref {t.ref}
                  </p>
                </div>
                <div className="flex-none flex items-center gap-3">
                  <div className="hidden sm:block">
                    <StatusTag status={t.status} />
                  </div>
                  <div className={`font-num tabular-nums font-bold text-[13.5px] text-right ${t.direction === "credit" ? "text-pos" : "text-neg"}`}>
                    {t.direction === "credit" ? "+ " : "− "}
                    {formatCode(t.amount, t.currency)}
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

      <Note>
        Downloads are generated in your browser from the in-memory ledger and saved straight to your device — nothing is requested from or sent
        to a server.
      </Note>
    </>
  );
}
