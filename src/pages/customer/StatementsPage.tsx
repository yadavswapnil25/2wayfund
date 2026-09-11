import { ArrowDownRight, ArrowUpRight, Download, Mail, Printer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHead } from "../../components/ui/Flow";
import { Field, Select, TextInput } from "../../components/ui/Field";
import { Note } from "../../components/ui/Misc";
import { StatusTag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import { isoToDisplay } from "../../lib/dates";
import { getBalances, getTransactions } from "../../services/meService";
import { downloadStatement, emailStatement } from "../../services/statementService";
import { ApiError } from "../../services/apiClient";
import type { Balance, Transaction } from "../../types/data";

export function StatementsPage() {
  const { store, session } = useApp();
  const [balances, setBalances] = useState<Balance[]>(store.balances);
  const [transactions, setTransactions] = useState<Transaction[]>(store.transactions);
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState("");
  const [corridor, setCorridor] = useState("");
  const [direction, setDirection] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statementBusy, setStatementBusy] = useState<"download" | "email" | null>(null);
  const [statementNotice, setStatementNotice] = useState<string | null>(null);
  const [statementError, setStatementError] = useState<string | null>(null);

  // Seed data renders immediately, then is quietly replaced by the real
  // balances and transaction history once the backend responds — same
  // pattern as Domestic (INR) and Foreign Currency.
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) return;
      const token = session.token;
      try {
        const [realBalances, realTransactions] = await Promise.all([getBalances(token, signal), getTransactions(token, signal)]);
        setBalances(realBalances);
        setTransactions(realTransactions);
      } catch {
        if (signal?.aborted) return;
        // Best-effort — seed/last-known data stays displayed.
      }
    },
    [session.token]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => !currency || t.currency === currency)
      .filter((t) => !status || t.status === status)
      .filter((t) => !corridor || t.corridor === corridor)
      .filter((t) => !direction || t.direction === direction)
      .filter((t) => !fromDate || t.valueIso >= fromDate)
      .filter((t) => !toDate || t.valueIso <= toDate)
      .slice()
      .sort((a, b) => (a.valueIso === b.valueIso ? 0 : a.valueIso < b.valueIso ? 1 : -1));
  }, [transactions, currency, status, corridor, direction, fromDate, toDate]);

  const totals = useMemo(() => {
    const toInr = (t: (typeof filtered)[number]) => (t.amount / store.rates[t.currency]) * store.rates.INR;
    const credits = filtered.filter((t) => t.direction === "credit" && !t.reversed).reduce((s, t) => s + toInr(t), 0);
    const debits = filtered.filter((t) => t.direction === "debit" && !t.reversed).reduce((s, t) => s + toInr(t), 0);
    return { count: filtered.length, credits, debits };
  }, [filtered, store.rates]);

  const statementFilters = { currency, status, corridor, direction, from: fromDate, to: toDate };

  async function handleDownload() {
    if (statementBusy || !session.token) return;
    setStatementError(null);
    setStatementNotice(null);
    setStatementBusy("download");
    try {
      await downloadStatement(statementFilters, session.token);
    } catch (err) {
      setStatementError(err instanceof ApiError ? err.message : "Could not download the statement. Please try again.");
    } finally {
      setStatementBusy(null);
    }
  }

  async function handleEmail() {
    if (statementBusy || !session.token) return;
    setStatementError(null);
    setStatementNotice(null);
    setStatementBusy("email");
    try {
      const message = await emailStatement(statementFilters, session.token);
      setStatementNotice(message);
    } catch (err) {
      setStatementError(err instanceof ApiError ? err.message : "Could not email the statement. Please try again.");
    } finally {
      setStatementBusy(null);
    }
  }

  return (
    <>
      <PageHead
        title="Statements & Receipts"
        lede="Full payment history across every ledger, with a downloadable statement and a dated receipt for each entry."
      />

      {/* Filters + actions */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm px-4.5 sm:px-5 py-4 mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          <Field label="Ledger" className="min-w-[140px]">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="">All ledgers</option>
              {balances.map((b) => (
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
          <Field label="From" className="min-w-[140px]">
            <TextInput type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
          </Field>
          <Field label="To" className="min-w-[140px]">
            <TextInput type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
          </Field>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={statementBusy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={13} /> {statementBusy === "download" ? "Preparing…" : "Download Statement"}
          </button>
          <button
            type="button"
            onClick={() => void handleEmail()}
            disabled={statementBusy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail size={13} /> {statementBusy === "email" ? "Sending…" : "Email Statement"}
          </button>
        </div>

        {statementNotice ? (
          <p className="m-0 mt-3 text-[12px] font-semibold text-pos">{statementNotice}</p>
        ) : null}
        {statementError ? <p className="m-0 mt-3 text-[12px] font-semibold text-neg">{statementError}</p> : null}
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
        Download Statement generates a real PDF from your account's own ledger and saves it straight to your device. Email Statement sends the
        same PDF to the email address on file for your account — never anywhere else.
      </Note>
    </>
  );
}
