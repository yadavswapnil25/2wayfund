import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, ChevronRight, Download, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Note } from "../../components/ui/Misc";
import { StatusTag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import { isoToDisplay, today } from "../../lib/dates";
import { getTransactions } from "../../services/meService";
import { ApiError } from "../../services/apiClient";
import type { Transaction } from "../../types/data";

export function InternationalPage() {
  const { store, session } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>(store.transactions);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Seed data renders immediately, then is quietly replaced by the real
  // transaction history once the backend responds — same pattern as the
  // Account & Passbook page's Recent Activity and Domestic (INR).
  useEffect(() => {
    if (!session.token) return;
    const controller = new AbortController();
    const token = session.token;

    (async () => {
      try {
        const txs = await getTransactions(token, controller.signal);
        setTransactions(txs);
        setLoadError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your live transaction history — showing the last known data.");
      }
    })();

    return () => controller.abort();
  }, [session.token]);

  const rows = useMemo(() => {
    return transactions
      .filter((t) => t.corridor === "International")
      .slice()
      .sort((a, b) => (a.valueIso === b.valueIso ? 0 : a.valueIso < b.valueIso ? 1 : -1));
  }, [transactions]);

  const totals = useMemo(() => {
    const live = rows.filter((t) => !t.reversed);
    const toInr = (t: (typeof rows)[number]) => (t.amount / store.rates[t.currency]) * store.rates.INR;
    const credits = live.filter((t) => t.direction === "credit").reduce((s, t) => s + toInr(t), 0);
    const debits = live.filter((t) => t.direction === "debit").reduce((s, t) => s + toInr(t), 0);
    const held = rows.filter((t) => t.status === "Under review").length;
    return { count: rows.length, credits, debits, held };
  }, [rows, store.rates]);

  function downloadCsv() {
    const header = ["Value date", "Reference", "Particulars", "Counterparty", "Routing", "Status", "Currency", "Amount", "Direction"];
    const csvRows = rows.map((t) => [
      isoToDisplay(t.valueIso), t.ref, t.description, t.counterparty, t.route, t.status, t.currency, t.amount.toFixed(2), t.direction,
    ]);
    const csv = [header, ...csvRows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2WF-international-" + today().replace(/ /g, "-") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {loadError ? (
        <Note danger className="mb-3.5">
          {loadError}
        </Note>
      ) : null}

      <PageHead
        title="International Transactions"
        lede="Cross-border settlement routed by SWIFT, with currency conversion and the standard commission applied per the published schedule."
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 shadow-sm">
          <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">Entries</span>
          <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-navy">{totals.count}</div>
          <span className="text-[11px] text-ink-2">Cross-border corridors</span>
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
        <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 py-4 shadow-sm">
          <span className="block text-[10.5px] uppercase text-amber font-semibold">Under review</span>
          <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-amber">{totals.held}</div>
          <span className="text-[11px] text-amber">Held for compliance screening</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
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
        <Link
          to="/exchange"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink no-underline hover:bg-tint"
        >
          <ArrowLeftRight size={13} /> Currency Exchange
        </Link>
        <Link
          to="/statements"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink no-underline hover:bg-tint"
        >
          All Corridors <ChevronRight size={13} />
        </Link>
      </div>

      {/* Transactions */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Cross-Border Entries</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {totals.count} {totals.count === 1 ? "entry" : "entries"} · SWIFT-routed settlement across currencies
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No cross-border transactions yet.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {rows.map((t) => (
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
                      {t.route}
                    </span>
                  </div>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                    {t.counterparty} · {isoToDisplay(t.valueIso)} · Ref {t.ref}
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
        Amounts are shown in the currency of the debit ledger. Conversion detail and commission for any entry appear on its receipt. A transfer
        counts as international the moment it crosses a border or converts currency — everything that stays in India and settles in rupees
        appears under <Link to="/domestic">Domestic (INR)</Link>.
      </Note>
    </>
  );
}
