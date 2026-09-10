import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, CreditCard, DollarSign, FileCheck2, Globe2, ShieldCheck } from "lucide-react";
import { Chain } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import type { CurrencyCode } from "../../types/data";

const PAYMENT_CORRIDOR = ["Country A", "International payment", "Currency conversion", "Country B", "Beneficiary bank account"];

const INDICATIVE_CODES: CurrencyCode[] = ["EUR", "INR", "GBP"];

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  { icon: DollarSign, title: "Multi-Currency Accounts", body: "Ledgers in USD, EUR, GBP, INR and more, held under one account number." },
  { icon: ArrowLeftRight, title: "Currency Exchange", body: "Illustrative conversion at indicative rates, with a transparent commission." },
  { icon: CreditCard, title: "Cards", body: "Debit and credit cards linked to your ledgers, with published limits." },
  { icon: ShieldCheck, title: "Security by Design", body: "An eleven-step authorised-transaction flow and eight security control layers." },
  { icon: Globe2, title: "International Reach", body: "Designated collection accounts in USD, EUR and GBP with a gateway reference." },
  { icon: FileCheck2, title: "Full Transparency", body: "Published fee schedule and account tiers — nothing hidden." },
];

function FeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
      <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
        <Icon size={18} />
      </div>
      <h3 className="text-sm mb-1.5">{title}</h3>
      <p className="m-0 text-xs text-ink-2 leading-relaxed">{body}</p>
    </div>
  );
}

export function HomePage() {
  const { store } = useApp();

  return (
    <>
      <div className="grid gap-5.5 mb-5.5 lg:grid-cols-[1.55fr_1fr] items-stretch">
        <div className="bg-gradient-to-br from-[#1E4570] via-navy to-navy-dk text-white rounded-[10px] p-8.5 shadow-md">
          <p className="m-0 mb-3 text-[11px] font-bold tracking-[0.13em] uppercase text-gold">2 Way Fund International</p>
          <h1 className="text-white! text-[31px] leading-tight tracking-tight mb-4 max-w-[22ch]">
            Connecting Countries. Converting Currencies. Enabling Global Payments.
          </h1>
          <p className="m-0 mb-5.5 text-[14px] leading-[1.7] text-white/85 max-w-[52ch]">
            A design prototype for a multi-currency NetBanking platform — international payments, currency exchange, cards and account
            services, built as a system-design case study. Fictional entity, fictional data, no real financial service.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/open-account"
              className="inline-block px-5.5 py-3 rounded-[5px] text-[13.5px] font-bold no-underline bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk border border-gold-dk hover:brightness-105"
            >
              Apply for an Account
            </Link>
            <Link
              to="/login"
              className="inline-block px-5.5 py-3 rounded-[5px] text-[13.5px] font-bold no-underline bg-transparent text-white border border-white/50 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="bg-white border border-border-lt rounded-[10px] p-5.5 shadow-sm">
          <span className="block mb-1.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">Indicative rates (USD base)</span>
          <ul className="list-none m-0 p-0 mt-2.5">
            {INDICATIVE_CODES.map((code) => (
              <li key={code} className="flex items-center justify-between py-2 border-b border-dotted border-border last:border-b-0 text-[13px]">
                <span>USD → {code}</span>
                <span className="num font-semibold text-navy">{store.rates[code].toFixed(4)}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-3 text-[11px] text-ink-2">Illustrative table. Not live market data.</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="How a Payment Moves" />
        <PanelBody>
          <Chain nodes={PAYMENT_CORRIDOR} />
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>

      <Callout title="Security by Design" className="mb-5.5">
        <p>
          Every authorised transaction moves through an eleven-step flow, protected by eight security control layers — from login
          credentials and transaction passwords through to manual compliance review on held payments.
        </p>
        <p>
          Identity is verified through eKYC before an account is approved. <Link to="/ekyc" className="text-navy-lt hover:underline">See how eKYC verification works →</Link>
        </p>
      </Callout>

      <div className="bg-navy-dk text-white rounded-[10px] p-6.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-white! text-lg mb-1">Ready to apply for an account?</h2>
          <p className="m-0 text-[12.5px] text-white/70 max-w-[60ch]">
            Apply with a referral code, then complete eKYC verification.
          </p>
        </div>
        <Link
          to="/open-account"
          className="inline-block px-5.5 py-3 rounded-[5px] text-[13.5px] font-bold no-underline bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk border border-gold-dk hover:brightness-105 flex-shrink-0"
        >
          Apply for an Account
        </Link>
      </div>
    </>
  );
}
