import { PageHead } from "../../components/ui/Flow";
import { ReferralManager } from "../../components/referral/ReferralManager";
import { useApp } from "../../state/AppContext";

export function ReferralsPage() {
  const { session } = useApp();

  if (!session.token) return null;

  return (
    <>
      <PageHead
        title="Referrals"
        lede="Generate a referral code and share it with anyone applying to open an account. Each code is valid for 24 hours and can be used once."
      />
      <ReferralManager token={session.token} />
    </>
  );
}
