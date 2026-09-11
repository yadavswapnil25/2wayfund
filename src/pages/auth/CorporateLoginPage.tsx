import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Building2, ShieldCheck } from "lucide-react";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Checklist } from "../../components/ui/Prose";
import { ACCOUNT_SERVICES } from "../../data/accountServiceContent";
import { BUSINESS_CONTROLS, NEVER_SHARE_ITEMS, RESPONSIBILITY_ITEMS } from "../../data/transactionSecurityContent";
import { CredentialLoginCard } from "./CredentialLoginCard";

type InfoTab = "notice" | "security";

const TAB_BASE = "flex items-center gap-1.5 pb-2.5 text-[13px] font-semibold border-b-2 -mb-px";
const TAB_ACTIVE = "text-navy border-gold";
const TAB_INACTIVE = "text-ink-2 border-transparent hover:text-navy";

function NoticeAndTips() {
  const [tab, setTab] = useState<InfoTab>("notice");

  return (
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
            <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">
              Every corporate application is reviewed with additional business-level controls:
            </p>
            <Checklist items={BUSINESS_CONTROLS} />
          </>
        ) : (
          <>
            <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">Keep your corporate account secure:</p>
            <Checklist items={RESPONSIBILITY_ITEMS} />
            <p className="m-0 mt-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Never share, with anyone</p>
            <p className="m-0 text-[12.5px] text-ink">{NEVER_SHARE_ITEMS.join(" · ")}</p>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}

export function CorporateLoginPage() {
  return (
    <div className="grid gap-5.5 items-start lg:grid-cols-[440px_minmax(0,1fr)]">
      <CredentialLoginCard
        icon={Building2}
        accentClass="bg-gradient-to-br from-gold-dk to-navy-dk"
        title="Corporate Internet Banking"
        subtitle="Sign in to manage your business accounts, payments and trade services."
        idPrefix="corp-login"
        redirectTo="/"
        footer={
          <div className="mt-4 flex flex-col items-center gap-1.5 text-[12px]">
            <Link to="/login" className="font-semibold text-navy">
              Internet Banking →
            </Link>
            <Link to="/admin-login" className="font-semibold text-ink-2">
              Staff login
            </Link>
          </div>
        }
      />

      <div>
        <NoticeAndTips />
        <Panel>
          <PanelHead title="What's included" note="Once your application is approved" />
          <PanelBody>
            <Checklist items={ACCOUNT_SERVICES.map((s) => s.title)} />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
