import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Search, Wallet, X } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { listCustomerAccounts, type CustomerAccountDto } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import { AddFundsPanel } from "./AddFundsPanel";

/** The Administration sidebar's dedicated "Add Funds" tool — crediting or
 * debiting a customer's balance directly used to live inline in Customer
 * Accounts (per expanded row); it now lives only here, reachable without
 * first finding that customer in the full account list. Finds the
 * customer by email, then hands off to AddFundsPanel. */
export function AddFundsPage() {
  const { session } = useApp();
  const [emailInput, setEmailInput] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CustomerAccountDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CustomerAccountDto | null>(null);

  const runSearch = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token || !search) {
        setResults(null);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listCustomerAccounts(session.token, { email: search }, signal);
        setResults(result.items);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not search customer accounts. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [session.token, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    void runSearch(controller.signal);
    return () => controller.abort();
  }, [runSearch]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setSearch(emailInput.trim());
  }

  function clearSearch() {
    setEmailInput("");
    setSearch("");
    setResults(null);
  }

  if (!session.token) return null;

  return (
    <>
      <PageHead
        title="Add Funds"
        lede="Find a customer by email and credit or debit their balance directly."
      />

      {selected ? (
        <Panel>
          <PanelBody>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-navy underline mb-3.5"
            >
              <ArrowLeft size={13} /> Choose a different customer
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-border-lt bg-tint px-4 py-3 mb-1">
              <span className="flex-none w-9 h-9 rounded-lg bg-[#EAF1F9] text-navy flex items-center justify-center">
                <Wallet size={15} />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">{selected.name}</p>
                <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                  {selected.email} · {selected.reference} · {selected.account_number}
                </p>
              </div>
            </div>

            <AddFundsPanel userId={selected.id} token={session.token} />
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelBody>
            <form onSubmit={submitSearch} className="flex items-center gap-2 mb-1">
              <Field htmlFor="add-funds-search" className="mb-0 flex-1">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                  <TextInput
                    id="add-funds-search"
                    type="text"
                    placeholder="Search by email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="pl-8 pr-8"
                  />
                  {emailInput ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
              </Field>
              <Btn type="submit">Search</Btn>
            </form>

            {loadError ? (
              <Callout title="Couldn't search customer accounts" variant="warn" className="mt-3">
                <p>{loadError}</p>
              </Callout>
            ) : null}

            {!search ? (
              <p className="text-center py-8 text-ink-2 text-[12.5px]">Search for a customer by email to add funds to their account.</p>
            ) : loading ? (
              <p className="text-center py-8 text-ink-2 text-[12.5px]">Searching…</p>
            ) : results !== null && results.length === 0 ? (
              <p className="text-center py-8 text-ink-2 text-[12.5px]">No accounts found for an email containing "{search}".</p>
            ) : results !== null ? (
              <div className="divide-y divide-border-lt mt-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-tint px-2 -mx-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="m-0 text-[12.5px] font-bold text-navy">{r.name}</p>
                      <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                        {r.email} · {r.reference} · {r.account_number}
                      </p>
                    </div>
                    <span className="flex-none text-[11px] font-semibold text-navy">Select →</span>
                  </button>
                ))}
              </div>
            ) : null}
          </PanelBody>
        </Panel>
      )}
    </>
  );
}
