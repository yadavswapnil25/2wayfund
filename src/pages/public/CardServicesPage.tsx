import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Ban,
  CreditCard,
  Gem,
  Landmark,
  Lock,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { PageHead, Chain } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout, KV } from "../../components/ui/Misc";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import {
  ATM_CONDITIONS,
  ATM_CONDITIONS_CLOSING,
  ATM_WITHDRAWAL_CLOSING,
  ATM_WITHDRAWAL_FACTORS,
  ATM_WITHDRAWAL_INTRO,
  BILL_CATEGORIES,
  CARD_AVAILABILITY_CHECKS,
  CARD_AVAILABILITY_CLOSING,
  CARD_FORMATS,
  CARD_LIMIT_CLOSING,
  CARD_LIMIT_FACTORS,
  CARD_PURCHASE_CATEGORIES,
  CARD_TYPES,
  CARD_TYPES_INTRO,
  CASH_ADVANCE_ITEMS,
  CREDIT_DESCRIPTION,
  DEBIT_FORMS,
  DECLINE_CLOSING,
  DECLINE_REASONS,
  DISCLOSURE_PARAGRAPHS,
  ECOSYSTEM_CHAIN,
  FX_CHAIN_EXAMPLES,
  FX_PARAGRAPH,
  HIGH_VALUE_CLOSING,
  HIGH_VALUE_FACTORS,
  HIGH_VALUE_INTRO,
  INTERNATIONAL_ATM_CHAIN,
  LOST_CARD_PARAGRAPHS,
  NETWORK_RULES_NOTE,
  NO_GUARANTEE_LIST,
  PHILOSOPHY_PILLARS,
  PREMIUM_NETWORK_NOTE,
  PROHIBITED_CARD_CLOSING,
  PROHIBITED_CARD_USES,
  RECHARGE_CHARGE_NOTE,
  RECHARGE_DESCRIPTION,
  REPLACEMENT_CLOSING,
  REPLACEMENT_REASONS,
  SECURITY_CLOSING,
  SECURITY_PROTECT_LIST,
} from "../../data/cardServiceContent";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  Debit: Wallet,
  Credit: Gem,
  Recharge: RefreshCw,
  Digital: Smartphone,
  Physical: CreditCard,
};

export function CardServicesPage() {
  return (
    <>
      <PageHead title="Card Services" lede="One Account. Multiple Payment Possibilities." />

      <Panel>
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">{CARD_TYPES_INTRO}</p>
          <div className="flex flex-wrap gap-2">
            {CARD_TYPES.map((t) => (
              <span key={t} className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border bg-tint text-navy">
                {t}
              </span>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="2 Way Debit Card" note="International access to your funds" />
        <PanelBody>
          <KV items={DEBIT_FORMS} />
          <p className="m-0 mt-3.5 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">{ATM_WITHDRAWAL_INTRO}</p>
          <Checklist items={ATM_WITHDRAWAL_FACTORS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{ATM_WITHDRAWAL_CLOSING}</p>

          <p className="m-0 mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">International ATM access depends on</p>
          <Chain nodes={INTERNATIONAL_ATM_CHAIN} />

          <p className="m-0 mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Eligible card purchases &amp; swipe transactions</p>
          <Checklist items={CARD_PURCHASE_CATEGORIES} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="2 Way Credit Card" note="Premium international credit facility" />
        <PanelBody>
          <Paragraphs items={[CREDIT_DESCRIPTION, PREMIUM_NETWORK_NOTE]} />
          <p className="m-0 mt-3.5 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">{HIGH_VALUE_INTRO}</p>
          <Checklist items={HIGH_VALUE_FACTORS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{HIGH_VALUE_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="2 Way Recharge Card" note="One card for multiple bill payments" />
        <PanelBody>
          <Paragraphs items={[RECHARGE_DESCRIPTION]} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Potential payment categories</p>
          <Checklist items={BILL_CATEGORIES} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{RECHARGE_CHARGE_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Digital & Physical Cards" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {CARD_FORMATS.map((f) => (
              <div key={f.title} className="border border-border-lt rounded-lg p-4">
                <h3 className="text-[13px] mb-1">{f.title}</h3>
                <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">{f.desc}</p>
                <Checklist items={f.supports} />
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <Lock size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Card Security</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Customers should protect their:</p>
          <Checklist items={SECURITY_PROTECT_LIST} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{SECURITY_CLOSING}</p>
        </div>

        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <ArrowLeftRight size={18} />
          </div>
          <h3 className="text-sm mb-1.5">International Currency Conversion</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">{FX_PARAGRAPH}</p>
          <div className="flex flex-col gap-2">
            {FX_CHAIN_EXAMPLES.map((ex) => (
              <Chain key={ex.join("-")} nodes={ex} />
            ))}
          </div>
        </div>
      </div>

      <Panel>
        <PanelHead title="Card Transaction Decline" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            A card transaction may be declined for legitimate security, compliance, technical, or operational reasons, including:
          </p>
          <Checklist items={DECLINE_REASONS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{DECLINE_CLOSING}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <Gem size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Card Limits</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Card limits may differ according to:</p>
          <Checklist items={CARD_LIMIT_FACTORS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{CARD_LIMIT_CLOSING}</p>
        </div>

        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <Landmark size={18} />
          </div>
          <h3 className="text-sm mb-1.5">ATM Withdrawal Conditions</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">The actual withdrawal amount may be restricted by:</p>
          <Checklist items={ATM_CONDITIONS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{ATM_CONDITIONS_CLOSING}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Credit Card Cash Withdrawal" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            Where permitted by the relevant credit-card program, customers may access cash through supported ATMs. Such transactions may
            be treated as cash advances and may be subject to separate:
          </p>
          <Checklist items={CASH_ADVANCE_ITEMS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">
            Customers should review the applicable credit-card agreement before using a credit card for cash withdrawal.
          </p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Card Availability" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            Cards are issued only to eligible customers who successfully complete the applicable:
          </p>
          <Checklist items={CARD_AVAILABILITY_CHECKS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CARD_AVAILABILITY_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Callout title="Responsible card use" variant="warn">
        <p>Customers must use their cards only for lawful and legitimate purposes. Cards must not be used for:</p>
        <ul className="list-none m-0 mt-2 mb-2 grid gap-1.5 sm:grid-cols-2">
          {PROHIBITED_CARD_USES.map((item) => (
            <li key={item} className="text-[12.5px] text-ink flex items-start gap-1.5">
              <Ban size={13} className="flex-shrink-0 mt-0.5 text-neg" />
              {item}
            </li>
          ))}
        </ul>
        <p>{PROHIBITED_CARD_CLOSING}</p>
      </Callout>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <PhoneCall size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Lost or Stolen Card</h3>
          <Paragraphs items={LOST_CARD_PARAGRAPHS} />
        </div>

        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <RefreshCw size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Card Replacement</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">A replacement card may be issued because of:</p>
          <Checklist items={REPLACEMENT_REASONS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{REPLACEMENT_CLOSING}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Card Program & Network Rules" />
        <PanelBody>
          <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{NETWORK_RULES_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Card Service Philosophy" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PHILOSOPHY_PILLARS.map(({ title, desc }) => {
              const Icon = PILLAR_ICONS[title] ?? ShieldCheck;
              return (
                <div key={title} className="border border-border-lt rounded-lg p-4">
                  <div className="w-9 h-9 rounded-lg mb-2.5 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
                    <Icon size={17} />
                  </div>
                  <h3 className="text-[13px] mb-1">{title}</h3>
                  <p className="m-0 text-xs text-ink-2 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Simple Payment Ecosystem" />
        <PanelBody>
          <Chain nodes={ECOSYSTEM_CHAIN} />
        </PanelBody>
      </Panel>

      <Callout title="No universal guarantee" variant="warn">
        <p>The card services described on this page should not be interpreted as a guarantee that:</p>
        <ul className="list-none m-0 mt-2 mb-2 grid gap-1.5 sm:grid-cols-2">
          {NO_GUARANTEE_LIST.map((item) => (
            <li key={item} className="text-[12.5px] text-ink">
              — {item}
            </li>
          ))}
        </ul>
        <p>Actual availability depends upon the applicable account, card program, country, network, merchant, bank, and regulatory requirements.</p>
      </Callout>

      <Callout title="Important disclosure" variant="info" className="mb-0">
        <Paragraphs items={DISCLOSURE_PARAGRAPHS} />
      </Callout>

      <p className="mt-4 text-[12px] text-ink-2">
        See your live cards on <Link to="/cards" className="text-navy-lt hover:underline">Cards &amp; Digital Payments</Link>, or{" "}
        <Link to="/e-security" className="text-navy-lt hover:underline">e-Security</Link> for day-to-day account safety guidance.
      </p>
    </>
  );
}
