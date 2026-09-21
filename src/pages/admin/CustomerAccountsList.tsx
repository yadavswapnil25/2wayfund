import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CreditCard, IdCard, Mail, Phone, Search, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { Panel } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { Callout } from "../../components/ui/Misc";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../state/AppContext";
import { formatStamp, isoToDisplay } from "../../lib/dates";
import { formatCode } from "../../lib/format";
import {
  deleteCustomerAccount,
  listCustomerAccounts,
  type AccountListMeta,
  type CustomerAccountDto,
} from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import { AccountFreezePanel } from "./AccountFreezePanel";
import { AccountLimitPanel } from "./AccountLimitPanel";
import { CardsPanel } from "./CardsPanel";
import { TransferBlockPanel } from "./TransferBlockPanel";

/** One labeled, icon-prefixed search input in the filter bar — shared
 * markup for Email, Customer ID, Account number and Mobile so the four
 * fields read as one deliberate set rather than four one-off inputs. */
function FilterField({
  icon,
  label,
  id,
  placeholder,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id} className="mb-0">
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none">{icon}</span>
        <TextInput
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8 py-2 text-[12.5px]"
        />
      </div>
    </Field>
  );
}

/** Every customer account — however it was provisioned (an approved
 * application or the "Open Account" tool) — with search and paging, the
 * same pattern as the Compliance Console's Application Queue. Takes an
 * optional refreshSignal so a caller (e.g. "Open Account", right after
 * creating a new one) can force a reload without this component needing
 * to know why; standalone callers can just leave it out. */
export function CustomerAccountsList({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const { session } = useApp();
  const [accounts, setAccounts] = useState<CustomerAccountDto[]>([]);
  const [meta, setMeta] = useState<AccountListMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [accountNumberInput, setAccountNumberInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [search, setSearch] = useState({ email: "", reference: "", accountNumber: "", mobile: "" });
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CustomerAccountDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasSearch = !!(search.email || search.reference || search.accountNumber || search.mobile);

  // Nothing loads (and no account list, real or otherwise, is shown)
  // until staff actually search by at least one field — this list can
  // hold hundreds of accounts, and dumping all of them on page load
  // isn't useful when staff always arrive here already knowing who
  // they're looking for. Every filled-in field narrows the search
  // further (AND, not OR).
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!hasSearch) {
        setAccounts([]);
        setMeta(null);
        setLoadError(null);
        setLoading(false);
        return;
      }
      if (!session.token) {
        setLoadError("Your session has no API token — sign out and sign back in to load accounts.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listCustomerAccounts(
          session.token,
          {
            email: search.email || undefined,
            reference: search.reference || undefined,
            accountNumber: search.accountNumber || undefined,
            mobile: search.mobile || undefined,
            page,
          },
          signal
        );
        setAccounts(result.items);
        setMeta(result.meta);
        setLoading(false);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load customer accounts. Please try again.");
        setLoading(false);
      }
    },
    [session.token, search, hasSearch, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, refreshSignal]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch({
      email: emailInput.trim(),
      reference: referenceInput.trim(),
      accountNumber: accountNumberInput.trim(),
      mobile: mobileInput.trim(),
    });
  }

  function clearSearch() {
    setEmailInput("");
    setReferenceInput("");
    setAccountNumberInput("");
    setMobileInput("");
    setPage(1);
    setSearch({ email: "", reference: "", accountNumber: "", mobile: "" });
  }

  /** The active filters described in plain language, for the "Showing
   * results for…" strip and the "No accounts found" empty state. */
  function describeSearch(): string {
    const parts: string[] = [];
    if (search.email) parts.push(`email containing "${search.email}"`);
    if (search.reference) parts.push(`Customer ID containing "${search.reference}"`);
    if (search.accountNumber) parts.push(`account number containing "${search.accountNumber}"`);
    if (search.mobile) parts.push(`mobile number containing "${search.mobile}"`);
    return parts.join(" and ");
  }

  async function confirmDelete() {
    if (!deleteTarget || !session.token || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCustomerAccount(deleteTarget.id, session.token);
      setAccounts((prev) => prev.filter((acc) => acc.id !== deleteTarget.id));
      setMeta((prev) => (prev ? { ...prev, total: prev.total - 1 } : prev));
      if (expandedId === deleteTarget.id) setExpandedId(null);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete this account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Panel>
      <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt flex-wrap">
        <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
          <Users size={17} />
        </span>
        <div className="flex-1 min-w-[160px]">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Customer Accounts</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {loading
              ? "Loading…"
              : meta
                ? `${meta.total} ${meta.total === 1 ? "account" : "accounts"}${meta.lastPage > 1 ? ` · page ${meta.currentPage} of ${meta.lastPage}` : ""}`
                : "Search to find an account"}
          </p>
        </div>
      </div>

      <form onSubmit={submitSearch} className="px-4.5 sm:px-5 py-4 border-b border-border-lt bg-tint/50">
        <div className="flex items-center gap-1.5 mb-3">
          <SlidersHorizontal size={12} className="text-navy" />
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-navy">Filters</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField
            icon={<Mail size={14} />}
            label="Email"
            id="cust-search-email"
            placeholder="e.g. aditi@example.com"
            value={emailInput}
            onChange={setEmailInput}
          />
          <FilterField
            icon={<IdCard size={14} />}
            label="Customer ID"
            id="cust-search-reference"
            placeholder="e.g. 2WFMP04817"
            value={referenceInput}
            onChange={setReferenceInput}
          />
          <FilterField
            icon={<CreditCard size={14} />}
            label="Account number"
            id="cust-search-account"
            placeholder="e.g. 410079004817"
            value={accountNumberInput}
            onChange={setAccountNumberInput}
          />
          <FilterField
            icon={<Phone size={14} />}
            label="Mobile"
            id="cust-search-mobile"
            placeholder="e.g. 90000 00000"
            value={mobileInput}
            onChange={setMobileInput}
          />
        </div>
        <div className="flex items-center gap-3 mt-3.5">
          <Btn type="submit" variant="primary" className="inline-flex items-center gap-1.5">
            <Search size={13} /> Search
          </Btn>
          {emailInput || referenceInput || accountNumberInput || mobileInput || hasSearch ? (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-2 hover:text-navy"
            >
              <X size={12} /> Clear filters
            </button>
          ) : null}
        </div>
      </form>

      {hasSearch ? (
        <p className="m-0 px-4.5 sm:px-5 py-2 text-[11px] text-ink-2 bg-tint border-b border-border-lt">
          Showing results for {describeSearch()} —{" "}
          <button type="button" onClick={clearSearch} className="text-navy font-semibold underline">
            clear
          </button>
        </p>
      ) : null}

      {loadError ? (
        <div className="px-4.5 sm:px-5 py-3">
          <Callout title="Couldn't load customer accounts" variant="warn" className="mb-0">
            <p>{loadError}</p>
          </Callout>
        </div>
      ) : null}

      {loading ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">Loading customer accounts…</p>
      ) : !hasSearch ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">
          Search by email, Customer ID, account number, or mobile number to find an account.
        </p>
      ) : accounts.length === 0 ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">No accounts found for {describeSearch()}.</p>
      ) : (
        <div className="divide-y divide-border-lt">
          {accounts.map((a) => {
            const isOpen = a.id === expandedId;
            return (
              <div key={a.id}>
                <div className="flex flex-wrap items-center gap-3 px-4.5 sm:px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-num font-bold text-[13px] text-navy">{a.reference}</span>
                      <Tag variant={a.kyc_status === "Verified" ? "approved" : "review"}>{a.kyc_status}</Tag>
                      {a.transfers_blocked ? <Tag variant="rejected">Transfers blocked</Tag> : null}
                    </div>
                    <p className="m-0 mt-0.5 text-[12px] text-ink">
                      {a.name} · {a.account_tier}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                      {a.email} · {a.account_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : a.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                    >
                      {isOpen ? "Close" : "Details"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(a);
                      }}
                      aria-label={`Delete account ${a.reference}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E3B8B0] bg-white px-3 py-1.5 text-xs font-semibold text-neg hover:bg-[#FDF6F4]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="px-4.5 sm:px-5 pb-4 bg-tint/40">
                    <p className="m-0 mb-2 text-[10.5px] tracking-wide uppercase text-navy font-bold">Personal &amp; Identity</p>
                    <div className="grid gap-3.5 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
                      {(
                        [
                          ["Father's / Guardian's name", a.father_name || "—"],
                          ["Date of birth", a.dob ? isoToDisplay(a.dob) : "—"],
                          ["Country", a.country || "—"],
                          ["Mobile", a.mobile || "—"],
                          ["PAN", a.pan || "—"],
                          ["Aadhaar", a.aadhaar || "—"],
                          ["Photo on file", a.has_photo ? "Yes" : "No"],
                        ] as [string, string][]
                      ).map(([k, v]) => (
                        <div key={k}>
                          <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{k}</span>
                          <p className="m-0 text-[13px] font-semibold text-ink">{v}</p>
                        </div>
                      ))}
                    </div>

                    <p className="m-0 mb-2 text-[10.5px] tracking-wide uppercase text-navy font-bold">Banking Details</p>
                    <div className="grid gap-3.5 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
                      {(
                        [
                          ["Panel number", a.panel_code],
                          ["Segment", a.segment],
                          ["IFSC", a.ifsc || "—"],
                          ["MICR", a.micr || "—"],
                          ["Branch", a.branch || "—"],
                          ["Daily transfer limit", formatCode(Number(a.daily_domestic_limit), "INR")],
                          ["PIN status", a.pin_status],
                        ] as [string, string][]
                      ).map(([k, v]) => (
                        <div key={k}>
                          <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{k}</span>
                          <p className="m-0 text-[13px] font-semibold text-ink">{v}</p>
                        </div>
                      ))}
                    </div>

                    <p className="m-0 mb-2 text-[10.5px] tracking-wide uppercase text-navy font-bold">Address</p>
                    <div className="grid gap-3.5 mb-4 sm:grid-cols-2">
                      <div>
                        <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Resident address</span>
                        <p className="m-0 text-[13px] font-semibold text-ink">{a.resident_address || "—"}</p>
                      </div>
                      <div>
                        <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Office address</span>
                        <p className="m-0 text-[13px] font-semibold text-ink">{a.office_address || "—"}</p>
                      </div>
                    </div>

                    <p className="m-0 mb-2 text-[10.5px] tracking-wide uppercase text-navy font-bold">Account Status</p>
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
                      {(
                        [
                          ["Last login", a.last_login_at ? formatStamp(new Date(a.last_login_at)) : "Never"],
                          ["Opened", a.created_at ? formatStamp(new Date(a.created_at)) : "—"],
                        ] as [string, string][]
                      ).map(([k, v]) => (
                        <div key={k}>
                          <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{k}</span>
                          <p className="m-0 text-[13px] font-semibold text-ink">{v}</p>
                        </div>
                      ))}
                    </div>
                    {session.token ? <CardsPanel userId={a.id} token={session.token} /> : null}
                    {session.token ? (
                      <TransferBlockPanel
                        userId={a.id}
                        token={session.token}
                        blocked={a.transfers_blocked}
                        scope={a.transfers_block_scope}
                        onChange={(status) =>
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc.id === a.id
                                ? { ...acc, transfers_blocked: status.blocked, transfers_blocked_reason: status.reason, transfers_block_scope: status.scope }
                                : acc
                            )
                          )
                        }
                      />
                    ) : null}
                    {session.token ? (
                      <AccountFreezePanel
                        userId={a.id}
                        token={session.token}
                        blocked={a.transfers_blocked}
                        onChange={(status) =>
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc.id === a.id
                                ? { ...acc, transfers_blocked: status.blocked, transfers_blocked_reason: status.reason, transfers_block_scope: status.scope }
                                : acc
                            )
                          )
                        }
                      />
                    ) : null}
                    {session.token ? (
                      <AccountLimitPanel
                        userId={a.id}
                        token={session.token}
                        limit={Number(a.daily_domestic_limit)}
                        onChange={(limit) =>
                          setAccounts((prev) => prev.map((acc) => (acc.id === a.id ? { ...acc, daily_domestic_limit: limit } : acc)))
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {meta && meta.lastPage > 1 ? (
        <div className="flex items-center justify-between gap-3 px-4.5 sm:px-5 py-3 border-t border-border-lt">
          <button
            type="button"
            disabled={meta.currentPage <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <span className="text-[11px] text-ink-2">
            Page {meta.currentPage} of {meta.lastPage}
          </span>
          <button
            type="button"
            disabled={meta.currentPage >= meta.lastPage || loading}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      ) : null}

      {deleteTarget ? (
        <Modal
          title={
            <span className="flex items-center gap-1.5 text-neg">
              <Trash2 size={15} /> Delete customer account?
            </span>
          }
          onClose={() => (deleting ? null : setDeleteTarget(null))}
          footerExtra={
            <Btn variant="reject" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete permanently"}
            </Btn>
          }
        >
          {deleteError ? (
            <Callout title="Couldn't delete this account" variant="warn">
              <p>{deleteError}</p>
            </Callout>
          ) : null}
          <p>
            Delete <strong className="text-navy">{deleteTarget.reference}</strong> ({deleteTarget.name}, {deleteTarget.email})? This
            permanently removes the account and everything it owns — balances, transactions, cards, beneficiaries, and login access.
            It cannot be undone.
          </p>
          <p className="text-ink-2">The application this account was provisioned from, if any, is kept — only unlinked.</p>
        </Modal>
      ) : null}
    </Panel>
  );
}
