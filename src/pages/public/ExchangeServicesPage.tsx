import { Link } from "react-router-dom";
import { Coins, Info, LineChart, Percent, ShieldCheck } from "lucide-react";
import { PageHead, Chain, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import { useApp } from "../../state/AppContext";
import {
  AVAILABILITY_CLOSING,
  AVAILABILITY_FACTORS,
  CALCULATION_FORMULA,
  CALCULATION_NOTE,
  COMMISSION_CLOSING,
  COMMISSION_FACTORS,
  COMMITMENT_ITEMS,
  COMPLIANCE_CHECKLIST,
  COMPLIANCE_CLOSING,
  CONFIRMATION_CHAIN,
  CONFIRMATION_CLOSING,
  DIGITAL_ASSET_NOTE,
  EXAMPLE_PAIRS,
  EXCHANGE_INTRO,
  FINAL_DISCLOSURE_PARAGRAPHS,
  FLUCTUATION_CLOSING,
  FLUCTUATION_LIST,
  NO_FIXED_COMMISSION_NOTE,
  RATE_CLOSING,
  RATE_FACTORS,
  SCENARIOS,
  THIRD_PARTY_NOTE,
  TRANSPARENCY_CHECKLIST,
  USDT_NOTE,
} from "../../data/exchangeServiceContent";

export function ExchangeServicesPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead title="Exchange Services" lede="How a currency conversion is processed, and the commission applied." />

      <Panel>
        <PanelBody>
          <Paragraphs items={[EXCHANGE_INTRO]} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">For example</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {EXAMPLE_PAIRS.map((p) => (
              <span key={p} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-tint text-navy num">
                {p}
              </span>
            ))}
          </div>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{USDT_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="How Currency Exchange Works" />
        <PanelBody>
          <Flow steps={store.exchangeProcess} />
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <LineChart size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Exchange Rate</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">The exchange rate applicable to a transaction may depend on:</p>
          <Checklist items={RATE_FACTORS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{RATE_CLOSING}</p>
        </div>

        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <Percent size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Exchange Commission</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">The applicable exchange commission may depend on:</p>
          <Checklist items={COMMISSION_FACTORS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{COMMISSION_CLOSING}</p>
        </div>
      </div>

      <Callout title="No fixed universal exchange commission" variant="info">
        <p>{NO_FIXED_COMMISSION_NOTE}</p>
      </Callout>

      <Panel>
        <PanelHead title="Currency Exchange — Simple Formula" />
        <PanelBody>
          <Chain nodes={CALCULATION_FORMULA} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CALCULATION_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Transparent Exchange Information" note="Review before confirming" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            Before confirming a currency conversion, customers should review the information made available for the transaction:
          </p>
          <Checklist items={TRANSPARENCY_CHECKLIST} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="International Currency Conversion" note="Example scenarios" />
        <PanelBody>
          <div className="flex flex-col gap-4">
            {SCENARIOS.map((s) => (
              <div key={s.label} className="border border-border-lt rounded-lg p-4">
                <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">{s.label}</p>
                <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">{s.desc}</p>
                {s.chain.length ? <Chain nodes={s.chain} /> : null}
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Exchange Rate Fluctuation" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Foreign-exchange markets are continuously changing. As a result:</p>
          <Checklist items={FLUCTUATION_LIST} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{FLUCTUATION_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Customer Confirmation" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">The customer should carefully review, before providing final authorization:</p>
          <Chain nodes={CONFIRMATION_CHAIN} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CONFIRMATION_CLOSING}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <Info size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Third-Party Charges</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{THIRD_PARTY_NOTE}</p>
        </div>

        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-sm mb-1.5">Compliance &amp; Verification</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Currency-exchange transactions may be subject to:</p>
          <Checklist items={COMPLIANCE_CHECKLIST} />
        </div>
      </div>

      <Callout title="Compliance may delay a transaction" variant="warn">
        <p>{COMPLIANCE_CLOSING}</p>
      </Callout>

      <Panel>
        <PanelHead title="Digital Assets and USDT" />
        <PanelBody className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center flex-shrink-0">
            <Coins size={19} />
          </div>
          <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{DIGITAL_ASSET_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Currency Availability" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Not every currency is necessarily available at all times. Currency availability may depend upon:</p>
          <Checklist items={AVAILABILITY_FACTORS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{AVAILABILITY_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Commitment to Transparent Currency Exchange" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            Our objective is to make international currency conversion easier to understand. We aim to provide customers with clear
            information regarding:
          </p>
          <Checklist items={COMMITMENT_ITEMS} />
        </PanelBody>
      </Panel>

      <Callout title="Final disclosure" variant="info" className="mb-0">
        <Paragraphs items={FINAL_DISCLOSURE_PARAGRAPHS} />
      </Callout>

      <p className="mt-4 text-[12px] text-ink-2">
        See the live calculator on <Link to="/exchange" className="text-navy-lt hover:underline">Currency Exchange</Link>.
      </p>
    </>
  );
}
