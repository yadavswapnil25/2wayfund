import { PageHead } from "../../components/ui/Flow";
import { ReferralManager } from "../../components/referral/ReferralManager";
import { useApp } from "../../state/AppContext";

/** Staff can generate and hold their own referral codes too — the
 * program isn't customer-only. Same component the customer-facing
 * Referrals page uses, since the underlying "my referral codes" API is
 * identical regardless of role. */
export function AdminReferralsPage() {
  const { session } = useApp();

  if (!session.token) return null;

  return (
    <>
      <PageHead
        title="Staff Referrals"
        lede="Generate a referral code and share it with anyone applying to open an account. Each code is valid for 24 hours and can be used once."
      />
      <ReferralManager token={session.token} />
    </>
  );
}
