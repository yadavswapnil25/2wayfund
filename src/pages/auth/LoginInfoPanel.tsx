import { useState } from "react";
import { Bell, ShieldCheck } from "lucide-react";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Checklist } from "../../components/ui/Prose";
import { ACCOUNT_SERVICES } from "../../data/accountServiceContent";
import { NEVER_SHARE_ITEMS, RESPONSIBILITY_ITEMS } from "../../data/transactionSecurityContent";

type InfoTab = "notice" | "security";

const TAB_BASE = "flex items-center gap-1.5 pb-2.5 text-[13px] font-semibold border-b-2 -mb-px";
const TAB_ACTIVE = "text-navy border-gold";
const TAB_INACTIVE = "text-ink-2 border-transparent hover:text-navy";

/** The informational side of a login screen's wide two-column layout —
 * shared by Internet Banking and Corporate Internet Banking, which differ
 * only in what the "Important Notification" tab lists (personal-account
 * controls vs. business-level controls); the Security Tips tab and the
 * "What's included" panel are identical for every account type. */
export function LoginInfoPanel({ noticeIntro, noticeItems }: { noticeIntro: string; noticeItems: string[] }) {
  const [tab, setTab] = useState<InfoTab>("notice");

  return (
    <div>
      <Panel>
        <PanelBody>
          <div className="flex items-center gap-5 mb-3.5 border-b border-border-lt">
            <button type="button" onClick={() => setTab("notice")} className={`${TAB_BASE} ${tab === "notice" ? TAB_ACTIVE : TAB_INACTIVE}`}>
              <Bell size={14} /> Important Notification
            </button>
            <button type="button" onClick={() => setTab("security")} className={`${TAB_BASE} ${tab === "security" ? TAB_ACTIVE : TAB_INACTIVE}`}>
              <ShieldCheck size={14} /> Security Tips
            </button>
          </div>

          {tab === "notice" ? (
            <>
              <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">{noticeIntro}</p>
              <Checklist items={noticeItems} />
            </>
          ) : (
            <>
              <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">Keep your account secure:</p>
              <Checklist items={RESPONSIBILITY_ITEMS} />
              <p className="m-0 mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Never share, with anyone</p>
              <p className="m-0 text-[12.5px] text-ink">{NEVER_SHARE_ITEMS.join(" · ")}</p>
            </>
          )}
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHead title="What's included" note="Once your application is approved" />
        <PanelBody>
          <Checklist items={ACCOUNT_SERVICES.map((s) => s.title)} />
        </PanelBody>
      </Panel>
    </div>
  );
}
