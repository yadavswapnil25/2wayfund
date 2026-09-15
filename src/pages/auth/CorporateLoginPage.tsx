import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { BUSINESS_CONTROLS } from "../../data/transactionSecurityContent";
import { CredentialLoginCard } from "./CredentialLoginCard";
import { LoginInfoPanel } from "./LoginInfoPanel";

export function CorporateLoginPage() {
  return (
    <div className="grid gap-5.5 items-start lg:grid-cols-[440px_minmax(0,1fr)]">
      <CredentialLoginCard
        icon={Building2}
        accentClass="bg-gradient-to-br from-gold-dk to-navy-dk"
        title="Corporate Internet Banking"
        subtitle="Log in to manage your business accounts, payments and trade services."
        idPrefix="corp-login"
        redirectTo="/"
        footer={
          <div className="mt-4 flex flex-col items-center gap-1.5 text-[12px]">
            <Link to="/login" className="font-semibold text-navy">
              Internet Banking →
            </Link>
            {/* <Link to="/admin-login" className="font-semibold text-ink-2">
              Staff login
            </Link> */}
          </div>
        }
      />

      <LoginInfoPanel noticeIntro="Every corporate application is reviewed with additional business-level controls:" noticeItems={BUSINESS_CONTROLS} />
    </div>
  );
}
