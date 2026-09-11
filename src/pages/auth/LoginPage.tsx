import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { CredentialLoginCard } from "./CredentialLoginCard";

export function LoginPage() {
  return (
    <CredentialLoginCard
      icon={ShieldCheck}
      accentClass="bg-gradient-to-b from-navy-lt to-navy"
      title="Internet Banking"
      subtitle="Sign in to manage your personal accounts, transfers and cards."
      idPrefix="login"
      redirectTo="/"
      footer={
        <div className="mt-4 flex flex-col items-center gap-1.5 text-[12px]">
          <Link to="/corporate-login" className="font-semibold text-navy">
            Corporate Internet Banking →
          </Link>
          <Link to="/admin-login" className="font-semibold text-ink-2">
            Staff login
          </Link>
        </div>
      }
    />
  );
}
