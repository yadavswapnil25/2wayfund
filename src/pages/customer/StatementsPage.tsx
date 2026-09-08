import { useMemo, useState } from "react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, Select } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { StatusTag } from "../../components/ui/Tag";
import { TableWrap, Th, Td, CellStrong, CellSub, EmptyRow } from "../../components/ui/Table";
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
    const credits = filtered.filter((t) => t.direction === "credit" && !t.reversed).reduce((s, t) => s + t.amount / store.rates[t.currency] * store.rates.INR, 0);
    const debits = filtered.filter((t) => t.direction === "debit" && !t.reversed).reduce((s, t) => s + t.amount / store.rates[t.currency] * store.rates.INR, 0);
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
      <PageHead title="Statements & Receipts" lede="Full payment history across every ledger, with a downloadable statement and a dated receipt for each entry." />

      <Panel>
        <PanelHead title="Account Statement" note={new Date().toLocaleString()} />
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(175px,1fr))" }}>
          <div className="px-3.5 py-2.5 border-b border-r border-border-lt">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Holder</span>
            <p className="m-0 text-[13px] font-semibold">{store.user.name}</p>
          </div>
          <div className="px-3.5 py-2.5 border-b border-r border-border-lt">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Account number</span>
            <p className="m-0 text-[13px] font-semibold">{store.user.accountNumber}</p>
          </div>
          <div className="px-3.5 py-2.5 border-b border-border-lt">
            <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Domicile</span>
            <p className="m-0 text-[13px] font-semibold">{store.user.country}</p>
          </div>
        </div>
        <PanelHead title="Ledgers Covered" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={90}>Currency</Th>
                  <Th>Ledger</Th>
                  <Th width={180} right>
                    Available balance
                  </Th>
                </tr>
              </thead>
              <tbody>
                {store.balances.map((b) => (
                  <tr key={b.currency}>
                    <Td>
                      <CellStrong>{b.currency}</CellStrong>
                    </Td>
                    <Td>{b.note}</Td>
                    <Td right className="font-num tabular-nums">
                      {displayMoney(b.amount, b.currency, balancesHidden)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Payment Summary" note={`${totals.count} entries`} />
        <div className="flex gap-3 flex-wrap items-end px-4.5 py-3.5 border-b border-border-lt">
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
          <Btn variant="primary" onClick={downloadCsv}>
            Download CSV
          </Btn>
          <Btn onClick={() => window.print()}>Print / Save as PDF</Btn>
        </div>

        <div className="grid p-4.5 gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))" }}>
          <div className="border border-border rounded-lg bg-tint px-3.5 py-3">
            <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Entries</span>
            <div className="text-[21px] text-navy">{totals.count}</div>
          </div>
          <div className="border border-border rounded-lg bg-tint px-3.5 py-3">
            <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Credits (INR eq.)</span>
            <div className="text-[21px] text-navy">{formatCode(totals.credits, "INR")}</div>
          </div>
          <div className="border border-border rounded-lg bg-tint px-3.5 py-3">
            <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Debits (INR eq.)</span>
            <div className="text-[21px] text-navy">{formatCode(totals.debits, "INR")}</div>
          </div>
        </div>

        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={100}>Value date</Th>
                  <Th width={140}>Reference</Th>
                  <Th>Particulars</Th>
                  <Th width={110}>Corridor</Th>
                  <Th width={120}>Status</Th>
                  <Th width={160} right>
                    Amount
                  </Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <EmptyRow colSpan={6}>No entries match the current filters.</EmptyRow>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.ref} className={t.reversed ? "opacity-50 line-through" : ""}>
                      <Td className="font-num">{isoToDisplay(t.valueIso)}</Td>
                      <Td className="font-num">{t.ref}</Td>
                      <Td>
                        <CellStrong>{t.description}</CellStrong>
                        <CellSub>{t.sub}</CellSub>
                      </Td>
                      <Td>{t.corridor}</Td>
                      <Td>
                        <StatusTag status={t.status} />
                      </Td>
                      <Td right className={`font-num tabular-nums font-semibold ${t.direction === "credit" ? "text-pos" : "text-neg"}`}>
                        {t.direction === "credit" ? "+ " : "− "}
                        {formatCode(t.amount, t.currency)}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
        <PanelBody>
          <Note>
            Downloads are generated in your browser from the in-memory ledger and saved straight to your device — nothing is requested from or
            sent to a server.
          </Note>
        </PanelBody>
      </Panel>
    </>
  );
}
