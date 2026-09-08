import { Eye, EyeOff, Copy, Check, KeyRound, Send, UserPlus, FileText, ChevronRight, Printer } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Tag, StatusTag } from "../../components/ui/Tag";
import { Note } from "../../components/ui/Misc";
import { TableWrap, Th, Td, CellStrong, CellSub, EmptyRow } from "../../components/ui/Table";
import { useApp } from "../../state/AppContext";
import { displayMoney, formatCode, groupInFours, monogram, MASK } from "../../lib/format";

export function AccountSummaryPage() {
  const { store, balancesHidden, logout } = useApp();
  const [acctRevealed, setAcctRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const { user } = store;

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
  const last4 = user.accountNumber.slice(-4);

  const inrLedgerTx = (() => {
    const list = store.transactions
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
      <PageHead
        title="Account & Passbook"
        lede="Consolidated position across your multi-currency ledgers, with the most recent settlement activity. Figures are illustrative and do not represent any real holding."
      />

      {/* Welcome strip */}
      <Panel>
        <div className="flex items-center justify-between gap-4 flex-wrap px-4.5 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="relative flex-none w-11 h-11 rounded-full border-2 border-navy-lt overflow-hidden">
              {!avatarError ? (
                <img
                  src="/user.jpg"
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="w-full h-full bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[15px] font-bold flex items-center justify-center">
                  {monogram(user.name)}
                </span>
              )}
              <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-pos border-2 border-white" />
            </span>
            <div>
              <p className="m-0 text-sm flex items-center gap-2 flex-wrap">
                Welcome, <strong className="text-[15px] text-navy">{user.name}</strong>
                <Tag variant="completed">KYC Verified</Tag>
              </p>
              <p className="mt-1 text-[11.5px] text-ink-2">
                User ID: <strong className="text-ink font-semibold">{user.reference}</strong> · Branch IFSC:{" "}
                <strong className="text-ink font-semibold">{user.ifsc}</strong> · Last login:{" "}
                <strong className="text-ink font-semibold">{user.lastLogin}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="text-right">
              <span className="block text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Customer scheme</span>
              <strong className="block mt-0.5 text-[13px] text-navy">{user.accountTier}</strong>
            </div>
            <button type="button" onClick={() => navigate("/pin-security")} className="border rounded-[5px] px-4 py-2 text-xs font-semibold bg-white border-border">
              <KeyRound size={13} className="inline -mt-0.5 mr-1" /> 9-Digit PIN
            </button>
            <button type="button" onClick={logout} className="border rounded-[5px] px-4 py-2 text-xs font-semibold bg-white border-border">
              Log Out
            </button>
          </div>
        </div>
      </Panel>

      {/* Account card + quick actions */}
      <div className="grid gap-4.5 mb-4 items-stretch min-[1001px]:grid-cols-[1.7fr_1fr]">
        <Panel className="mb-0 flex flex-col">
          <div className="flex items-center justify-between gap-2.5 flex-wrap px-4.5 py-3.5 border-b border-border-lt">
            <div>
              <span className="inline-block text-[10px] font-bold tracking-wide uppercase text-navy bg-[#EAF1F9] border border-border px-2.5 py-0.5 rounded mr-2">
                Savings Account
              </span>
              <strong>2 Way Fund International</strong>
            </div>
            <div className="text-right">
              <span className="block text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Panel code</span>
              <strong className="inline-block mt-0.5 font-num text-[12px] text-navy border border-gold-dk bg-[#FBF6E9] px-2.5 py-0.5 rounded">
                {user.panelCode}
              </strong>
            </div>
          </div>

          <div className="px-4.5 py-4 border-b border-border-lt">
            <span className="text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Available operative balance</span>
            <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
              <span className="font-num tabular-nums text-[25px] font-bold text-navy">{displayMoney(inrLedger.amount, "INR", balancesHidden)}</span>
              <Tag variant="completed">Cleared funds</Tag>
            </div>
          </div>

          <div className="grid gap-3 px-4.5 py-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(175px,1fr))" }}>
            <div className="border border-border-lt rounded-lg bg-tint px-3.5 py-2.5">
              <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Account number</span>
              <p className="m-0 flex items-center gap-1.5">
                <span>{acctRevealed ? groupInFours(user.accountNumber) : `${MASK} ${MASK} ${last4}`}</span>
                <button type="button" onClick={() => setAcctRevealed((v) => !v)} className="text-ink-2 hover:text-navy" title="Show / hide">
                  {acctRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button type="button" onClick={() => copy(user.accountNumber, "acct")} className="text-ink-2 hover:text-navy" title="Copy">
                  {copiedField === "acct" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </p>
            </div>
            <div className="border border-border-lt rounded-lg bg-tint px-3.5 py-2.5">
              <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Customer ID (CIF)</span>
              <p className="m-0 flex items-center gap-1.5">
                <span>{user.reference}</span>
                <button type="button" onClick={() => copy(user.reference, "cif")} className="text-ink-2 hover:text-navy" title="Copy">
                  {copiedField === "cif" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </p>
            </div>
            <div className="border border-border-lt rounded-lg bg-tint px-3.5 py-2.5">
              <span className="block mb-1 text-[10.5px] uppercase text-ink-2 font-semibold">Branch &amp; IFSC code</span>
              <p className="m-0">{user.ifsc}</p>
              <span className="text-[11px] text-ink-2">{user.branch}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap px-4.5 py-3 text-xs text-ink-2 mt-auto">
            <span>
              <span className="inline-block w-1.75 h-1.75 rounded-full bg-pos mr-1.5" />
              Electronic clearing enabled: IMPS, NEFT, RTGS, 2WF Direct
            </span>
            <span>
              Daily transfer limit: <strong>{formatCode(user.dailyDomesticLimit, "INR")}</strong>
            </span>
          </div>
        </Panel>

        <Panel className="mb-0 flex flex-col">
          <PanelHead title="Quick Banking Actions" />
          <p className="px-4.5 mt-2 text-[11px] text-ink-2">Frequently executed Indian banking operations</p>
          <div className="grid grid-cols-2 gap-3 px-4.5 py-3.5 max-[620px]:grid-cols-1">
            <Link to="/transfer" className="border border-border-lt rounded-lg px-3.5 py-3 no-underline text-inherit hover:border-gold-dk">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mb-2">
                <Send size={15} />
              </span>
              <strong className="block text-[13px] text-navy">Transfer Funds</strong>
              <span className="block text-[11px] text-blue-600 font-semibold mt-0.5">IMPS / NEFT / 2WF</span>
            </Link>
            <Link to="/beneficiaries" className="border border-border-lt rounded-lg px-3.5 py-3 no-underline text-inherit hover:border-gold-dk">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-600 mb-2">
                <UserPlus size={15} />
              </span>
              <strong className="block text-[13px] text-navy">Add Payee</strong>
              <span className="block text-[11px] text-purple-600 font-semibold mt-0.5">Indian Bank / 2WF</span>
            </Link>
            <button
              type="button"
              onClick={() => navigate("/pin-security")}
              className="text-left border rounded-lg px-3.5 py-3 border-[#DDC98B] bg-[#FBF4E1]"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber mb-2">
                <KeyRound size={15} />
              </span>
              <strong className="block text-[13px] text-navy">9-Digit PIN</strong>
              <span className="block text-[11px] text-amber font-semibold mt-0.5">Set / Reset PIN</span>
            </button>
            <Link to="/statements" className="border rounded-lg px-3.5 py-3 no-underline text-inherit border-[#A8D4BB] bg-[#EFF8F2]">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-pos mb-2">
                <FileText size={15} />
              </span>
              <strong className="block text-[13px] text-navy">e-Passbook</strong>
              <span className="block text-[11px] text-pos font-semibold mt-0.5">Ledger Statement</span>
            </Link>
          </div>
          <div className="flex items-center justify-between gap-2.5 px-4.5 py-3 border-t border-border-lt text-xs">
            <span>9-digit security PIN status</span>
            <Tag variant="completed">{user.pinStatus}</Tag>
          </div>
          <p className="px-4.5 pb-3.5 text-xs text-ink-2">Required before authorising fund transfers and beneficiary payouts.</p>
        </Panel>
      </div>

      {/* Recent domestic ledger activity */}
      <Panel>
        <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 py-3.5 border-b border-border-lt">
          <div>
            <h3 className="m-0 text-[13.5px] font-bold text-navy">Recent Account Transactions &amp; UTR Postings</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">Live verified entries from 2 Way Fund core clearing ledger</p>
          </div>
          <Link to="/statements" className="text-[12px] font-semibold text-navy-lt flex items-center gap-1 no-underline hover:underline">
            View Full Passbook &amp; Statements <ChevronRight size={14} />
          </Link>
        </div>
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={110}>Date &amp; Time</Th>
                  <Th width={160}>UTR / Ref No</Th>
                  <Th>Description &amp; Beneficiary</Th>
                  <Th width={110}>Status</Th>
                  <Th width={140} right>
                    Amount (INR)
                  </Th>
                  <Th width={140} right>
                    Balance After
                  </Th>
                  <Th width={90} right>
                    Receipt
                  </Th>
                </tr>
              </thead>
              <tbody>
                {inrLedgerTx.length === 0 ? (
                  <EmptyRow colSpan={7}>No domestic ledger entries yet.</EmptyRow>
                ) : (
                  inrLedgerTx.slice(0, 6).map(({ t, balanceAfter }) => (
                    <tr key={t.ref} className={t.reversed ? "opacity-50 line-through" : ""}>
                      <Td className="font-num">
                        <CellStrong>{t.date}</CellStrong>
                        <CellSub>{t.time}</CellSub>
                      </Td>
                      <Td className="font-num">
                        <CellStrong>{t.utr || t.ref}</CellStrong>
                        {t.utr ? <CellSub>Ref: {t.ref}</CellSub> : null}
                      </Td>
                      <Td>
                        <CellStrong>{t.description}</CellStrong>
                        <CellSub>
                          {t.direction === "debit" && t.beneficiary
                            ? `To: ${t.beneficiary}${t.beneficiaryBank ? ` (${t.beneficiaryBank})` : ""}`
                            : t.direction === "credit"
                              ? `From: ${t.counterparty}`
                              : t.sub}
                        </CellSub>
                        <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-ink-2 bg-tint border border-border-lt rounded px-1.5 py-0.5">
                          {t.channel}
                        </span>
                      </Td>
                      <Td>
                        <StatusTag status={t.status} />
                      </Td>
                      <Td right className={`font-num tabular-nums font-semibold ${t.direction === "credit" ? "text-pos" : "text-neg"}`}>
                        {t.direction === "credit" ? "+ " : "− "}
                        {formatCode(t.amount, "INR")}
                      </Td>
                      <Td right className="font-num tabular-nums">
                        {displayMoney(balanceAfter, "INR", balancesHidden)}
                      </Td>
                      <Td right>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="text-navy-lt text-xs font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Printer size={12} /> Receipt
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      {/* Currency ledgers */}
      <Panel>
        <PanelHead title="Currency Ledgers" note={`Account ${user.accountNumber} · ${store.balances.length} currency ledgers`} />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th>Ledger</Th>
                  <Th width={90}>Currency</Th>
                  <Th width={180} right>
                    Available balance
                  </Th>
                </tr>
              </thead>
              <tbody>
                {store.balances.map((b) => (
                  <tr key={b.currency}>
                    <Td>{b.note}</Td>
                    <Td>
                      <CellStrong>{b.currency}</CellStrong>
                    </Td>
                    <Td right className="font-num tabular-nums">
                      <CellStrong>{displayMoney(b.amount, b.currency, balancesHidden)}</CellStrong>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      {/* Rates + advisory */}
      <div className="grid gap-4.5 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}>
        <Panel className="mb-0">
          <PanelHead title="Indicative Rates" />
          <PanelBody>
            <ul className="list-none m-0 p-0">
              {(["EUR", "INR", "GBP"] as const).map((code) => (
                <li key={code} className="flex items-center justify-between py-1.5 border-b border-dotted border-border last:border-b-0 text-[12.5px]">
                  <span>USD → {code}</span>
                  <span className="font-num tabular-nums">{store.rates[code].toFixed(4)}</span>
                </li>
              ))}
            </ul>
            <Note className="mt-2">Illustrative table. Not live market data.</Note>
          </PanelBody>
        </Panel>
        <Panel className="mb-0">
          <PanelHead title="Security Advisory" />
          <PanelBody>
            <p className="text-[12.5px] mb-2">
              <strong>Never share</strong> your password, transaction password or OTP with anyone — including anyone claiming to be from the
              institution.
            </p>
            <p className="text-[12.5px] m-0">
              <strong>No legitimate bank</strong> will ever ask you to make a payment to unlock, verify or release funds already shown in your
              account. Any such request is a fraud attempt.
            </p>
          </PanelBody>
        </Panel>
      </div>

      {/* Recent transactions */}
      {/* <Panel>
        <PanelHead title="Recent Transactions" note="Last 8 entries — all ledgers" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={100}>Date</Th>
                  <Th>Particulars</Th>
                  <Th width={120}>Status</Th>
                  <Th width={165} right>
                    Amount
                  </Th>
                </tr>
              </thead>
              <tbody>
                {store.transactions.slice(0, 8).map((t) => (
                  <tr key={t.ref}>
                    <Td className="font-num">{t.date}</Td>
                    <Td>
                      <CellStrong>{t.description}</CellStrong>
                      <span className="block text-[11px] text-ink-2 mt-0.5">{t.sub}</span>
                    </Td>
                    <Td>
                      <StatusTag status={t.status} />
                    </Td>
                    <Td right className={`font-num tabular-nums font-semibold ${t.direction === "credit" ? "text-pos" : "text-neg"}`}>
                      {t.direction === "credit" ? "+ " : "− "}
                      {formatCode(t.amount, t.currency)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
        <PanelBody>
          <Note>
            Status values follow the six-state model defined in the fund transaction security policy: <strong>Pending</strong>,{" "}
            <strong>Processing</strong>, <strong>Completed</strong>, <strong>Failed</strong>, <strong>Rejected</strong> and{" "}
            <strong>Under review</strong>. Entries marked <em>Under review</em> are held for compliance screening before settlement.
          </Note>
        </PanelBody>
      </Panel> */}
    </>
  );
}
