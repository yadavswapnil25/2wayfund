import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import { Panel, PanelBody, PanelHead } from "../ui/Panel";
import { Btn } from "../ui/Button";
import { Callout } from "../ui/Misc";
import { Tag } from "../ui/Tag";
import { formatStamp } from "../../lib/dates";
import {
  generateReferralCode,
  listMyReferralCodes,
  type ReferralCode,
  type ReferralCodeStatus,
} from "../../services/referralService";
import { ApiError } from "../../services/apiClient";

const STATUS_TAG: Record<ReferralCodeStatus, string> = {
  active: "approved",
  used: "submitted",
  expired: "rejected",
};

const STATUS_LABEL: Record<ReferralCodeStatus, string> = {
  active: "Active",
  used: "Used",
  expired: "Expired",
};

/** The "Generate referral code" workflow — open to any signed-in account,
 * customer or staff, so this one component is shared by the customer
 * dashboard and the admin console rather than built twice. A code
 * expires 24 hours after generation if unused, and locks permanently to
 * whichever application redeems it first. */
export function ReferralManager({ token }: { token: string }) {
  const [codes, setCodes] = useState<ReferralCode[] | null>(null);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const history = await listMyReferralCodes(token, signal);
        setCodes(history.items);
        setSuccessfulReferrals(history.successfulReferrals);
        setLoadError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your referral codes. Please try again.");
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function generate() {
    if (generating) return;
    setGenError(null);
    setGenerating(true);
    try {
      const created = await generateReferralCode(token);
      setCodes((prev) => [created, ...(prev ?? [])]);
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : "Could not generate a referral code. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copy(code: string, id: number) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard unavailable — nothing else to do in this demo */
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  }

  const activeCode = codes?.find((c) => c.status === "active") ?? null;

  return (
    <div>
      <Panel>
        <PanelHead title="Referral Program" note={`${successfulReferrals} successful ${successfulReferrals === 1 ? "referral" : "referrals"}`} />
        <PanelBody>
          {loadError ? (
            <Callout title="Couldn't load referral codes" variant="warn" className="mb-0">
              <p>{loadError}</p>
            </Callout>
          ) : (
            <>
              <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
                Generate a referral code and share it with anyone applying to open an account. Each code is valid for 24 hours and can be used
                once — generate a new one anytime.
              </p>

              {genError ? (
                <Callout title="Couldn't generate a code" variant="warn" className="mb-3.5">
                  <p>{genError}</p>
                </Callout>
              ) : null}

              {activeCode ? (
                <div className="rounded-2xl border border-gold/30 bg-[#FFFBF2] px-4.5 py-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-ink-2 font-semibold mb-1">
                      <Gift size={12} /> Your active referral code
                    </span>
                    <span className="font-num text-[19px] font-bold text-navy tracking-wide">{activeCode.code}</span>
                    <p className="m-0 mt-1 text-[11px] text-ink-2">Expires {formatStamp(new Date(activeCode.expiresAt))}</p>
                  </div>
                  <Btn variant="primary" onClick={() => void copy(activeCode.code, activeCode.id)}>
                    <span className="inline-flex items-center gap-1.5">
                      {copiedId === activeCode.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === activeCode.id ? "Copied" : "Copy code"}
                    </span>
                  </Btn>
                </div>
              ) : null}

              <Btn variant="block" onClick={() => void generate()} disabled={generating}>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Share2 size={14} />
                  {generating ? "Generating…" : activeCode ? "Generate a New Code" : "Generate Referral Code"}
                </span>
              </Btn>
            </>
          )}
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Code History" note={codes ? `${codes.length} generated` : undefined} />
        {codes === null ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">Loading…</p>
        ) : codes.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No referral codes generated yet.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {codes.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4.5 sm:px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-num font-bold text-[13px] text-navy">{c.code}</span>
                    <Tag variant={STATUS_TAG[c.status]}>{STATUS_LABEL[c.status]}</Tag>
                  </div>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                    Generated {formatStamp(new Date(c.createdAt))}
                    {c.usedAt ? ` · Used ${formatStamp(new Date(c.usedAt))}` : ""}
                  </p>
                </div>
                {c.status === "active" ? (
                  <button
                    type="button"
                    onClick={() => void copy(c.code, c.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint flex-none"
                  >
                    {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === c.id ? "Copied" : "Copy"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
