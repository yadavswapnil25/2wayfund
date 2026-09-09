import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import { CreditCard, Eye, KeyRound, PhoneCall, ShieldAlert, Smartphone } from "lucide-react";
import { PageHead, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";

const IF_SOMETHING_LOOKS_WRONG = [
  "Stop — do not initiate any further transactions",
  "Contact the official customer-support channel, never a number or link from an unsolicited message",
  "Change your password, if account access remains available",
  "Report any transaction you do not recognise",
  "Complete any identity verification requested by the institution",
];

interface Tip {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}

const TIPS: Tip[] = [
  { icon: KeyRound, title: "Password & PIN", body: "Never share your NetBanking password or 9-digit transaction PIN with anyone, ever." },
  { icon: Smartphone, title: "One-time codes", body: "An OTP confirms an action you started. Nobody legitimate will ever ask you to read one back to them." },
  { icon: CreditCard, title: "No release payments", body: "No legitimate institution asks for a payment to unlock, verify or release funds already shown in your account." },
  { icon: Eye, title: "Watch your activity", body: "Review recent transactions and messages regularly — report anything you don't recognise straight away." },
  { icon: ShieldAlert, title: "Cooling-off holds", body: "A newly added beneficiary is held before its first settlement. That hold is never accelerated by a payment." },
  { icon: PhoneCall, title: "Verify the channel", body: "Reach the institution only through the number on your card or the official site — never a number from a message." },
];

export function ESecurityPage() {
  return (
    <>
      <PageHead title="e-Security" lede="Your Account. Your Identity. Your Security. Practical guidance for keeping your account safe day to day." />

      <Callout title="Never share your password, transaction password or OTP" variant="warn">
        <p>No legitimate institution will ever ask you to make a payment to unlock, verify or release funds already shown in your account.</p>
      </Callout>

      <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
            <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
              <Icon size={18} />
            </div>
            <h3 className="text-sm mb-1.5">{title}</h3>
            <p className="m-0 text-xs text-ink-2 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHead title="If Something Looks Wrong" />
        <PanelBody>
          <Flow steps={IF_SOMETHING_LOOKS_WRONG} />
        </PanelBody>
      </Panel>

      <p className="text-[12px] text-ink-2">
        See <Link to="/security" className="text-navy-lt hover:underline">About KYC &amp; Security</Link> for the full eight-layer
        control model behind every authorised transaction.
      </p>
    </>
  );
}
