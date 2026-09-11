import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Search, Users, X } from "lucide-react";
import { Panel } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { Callout } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { formatStamp } from "../../lib/dates";
import { listCustomerAccounts, type AccountListMeta, type CustomerAccountDto } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import { AddFundsPanel } from "./AddFundsPanel";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) {
        setLoadError("Your session has no API token — sign out and sign back in to load accounts.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listCustomerAccounts(session.token, { email: search || undefined, page }, signal);
        setAccounts(result.items);
        setMeta(result.meta);
        setLoading(false);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load customer accounts. Please try again.");
        setLoading(false);
      }
    },
    [session.token, search, page]
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
    setSearch(emailInput.trim());
  }

  function clearSearch() {
    setEmailInput("");
    setPage(1);
    setSearch("");
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
                : "0 accounts"}
          </p>
        </div>

        <form onSubmit={submitSearch} className="flex items-center gap-2 flex-none">
          <Field htmlFor="cust-search-email" className="mb-0">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="cust-search-email"
                type="text"
                placeholder="Search by email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-xs w-[220px]"
              />
              {emailInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
          </Field>
          <Btn type="submit" className="!py-1.5">
            Search
          </Btn>
        </form>
      </div>

      {search ? (
        <p className="m-0 px-4.5 sm:px-5 py-2 text-[11px] text-ink-2 bg-tint border-b border-border-lt">
          Showing results for email containing "<strong className="text-ink">{search}</strong>" —{" "}
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
      ) : accounts.length === 0 ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">
          {search ? `No accounts found for an email containing "${search}".` : "No customer accounts yet."}
        </p>
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
                    </div>
                    <p className="m-0 mt-0.5 text-[12px] text-ink">
                      {a.name} · {a.account_tier}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                      {a.email} · {a.account_number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : a.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint flex-none"
                  >
                    {isOpen ? "Close" : "Details"}
                  </button>
                </div>

                {isOpen ? (
                  <div className="px-4.5 sm:px-5 pb-4 bg-tint/40">
                    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))" }}>
                      {(
                        [
                          ["Panel number", a.panel_code],
                          ["Segment", a.segment],
                          ["Mobile", a.mobile || "—"],
                          ["PAN", a.pan || "—"],
                          ["Aadhaar", a.aadhaar || "—"],
                          ["PIN status", a.pin_status],
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
                    {session.token ? <AddFundsPanel userId={a.id} token={session.token} /> : null}
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
    </Panel>
  );
}
