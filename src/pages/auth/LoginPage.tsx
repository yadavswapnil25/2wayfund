import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { INTERNAL_TRANSFER_CONTROLS } from "../../data/transactionSecurityContent";
import { CredentialLoginCard } from "./CredentialLoginCard";
import { LoginInfoPanel } from "./LoginInfoPanel";

export function LoginPage() {
  return (
    <div className="grid gap-5.5 items-start lg:grid-cols-[440px_minmax(0,1fr)]">
      <CredentialLoginCard
        icon={ShieldCheck}
        accentClass="bg-gradient-to-b from-navy-lt to-navy"
        title="Internet Banking"
        subtitle="Log in to manage your personal accounts, transfers and cards."
        idPrefix="login"
        redirectTo="/"
        footer={
          <div className="mt-4 flex flex-col items-center gap-1.5 text-[12px]">
            <Link to="/corporate-login" className="font-semibold text-navy">
              Corporate Internet Banking →
            </Link>
            {/* <Link to="/admin-login" className="font-semibold text-ink-2">
              Staff login
            </Link> */}
          </div>
        }
      />

      <LoginInfoPanel noticeIntro="Every personal account is protected with layered controls:" noticeItems={INTERNAL_TRANSFER_CONTROLS} />
    </div>
  );
}
