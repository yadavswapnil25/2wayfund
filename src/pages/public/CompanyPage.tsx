import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Compass, Gauge, Lightbulb, Scale, ShieldCheck, Smile, Sparkles } from "lucide-react";
import { PageHead, Chain, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout, KV } from "../../components/ui/Misc";
import {
  CLOSING_STATEMENT,
  COMMITMENT_PILLARS,
  COMPANY_FACTS,
  COMPANY_HISTORY,
  COMPANY_INTRO,
  COMPANY_TAGLINE,
  CROSS_BORDER_PARAGRAPHS,
  CURRENCY_CONVERSION_INTRO,
  CURRENCY_CONVERSION_NOTE,
  CURRENCY_CONVERSION_STEPS,
  DIGITAL_APPROACH_PARAGRAPHS,
  FUTURE_CLOSING,
  FUTURE_FORMULA,
  FUTURE_PARAGRAPHS,
  GLOBAL_BASE_CLOSING,
  GLOBAL_BASE_PARAGRAPHS,
  JOURNEY_MILESTONES,
  PAYMENT_CORRIDOR,
  PAYMENT_MODEL_CLOSING,
  PAYMENT_MODEL_STEPS,
  PAYMENT_SERVICES_CLOSING,
  PAYMENT_SERVICES_INTRO,
  PHILOSOPHY_PARAGRAPHS,
  PROMISE_PARAGRAPHS,
  PURPOSE_CLOSING,
  PURPOSE_LEAD,
  PURPOSE_PARAGRAPHS,
  SECURITY_CLOSING,
  SECURITY_INTRO,
  SECURITY_REQUIREMENTS,
  SETTLEMENT_DISCLAIMER,
  SETTLEMENT_FACTORS,
  TRANSPARENCY_CLOSING,
  TRANSPARENCY_PARAGRAPHS,
  VISION_BODY,
  VISION_CLOSING,
  VISION_LEAD,
  VISION_VALUES,
} from "../../data/companyContent";

const PILLAR_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Speed: Gauge,
  Security: ShieldCheck,
  Transparency: Compass,
  Compliance: Scale,
  Innovation: Lightbulb,
  "Customer Experience": Smile,
};

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i} className="m-0 mb-2.5 last:mb-0 text-[12.5px] text-ink-2 leading-relaxed">
          {p}
        </p>
      ))}
    </>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="list-none m-0 p-0 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[12.5px] text-ink">
          <Check size={14} className="flex-shrink-0 mt-0.5 text-pos" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChipRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border bg-tint text-navy">
          {item}
        </span>
      ))}
    </div>
  );
}

function NumberedRow({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3.5 py-3 border-b border-dotted border-border last:border-b-0">
      <span className="w-7 h-7 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </span>
      <div>
        <span className="block text-[13px] font-bold text-ink">{title}</span>
        <span className="block text-xs text-ink-2 mt-0.5">{desc}</span>
      </div>
    </li>
  );
}

function TimelineItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3.5 py-3 border-b border-dotted border-border last:border-b-0">
      <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
      <div>
        <span className="block text-[13px] font-bold text-navy">{title}</span>
        <span className="block text-xs text-ink-2 mt-0.5">{desc}</span>
      </div>
    </li>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Panel>
      <PanelHead title={title} />
      <PanelBody>{children}</PanelBody>
    </Panel>
  );
}

export function CompanyPage() {
  return (
    <>
      <PageHead title="About 2 Way Fund International" lede={COMPANY_TAGLINE} />

      <Panel>
        <PanelBody>
          <p className="m-0 mb-4 text-[12.5px] text-ink-2 leading-relaxed">{COMPANY_INTRO}</p>
          <KV items={COMPANY_FACTS} />
        </PanelBody>
      </Panel>

      <Section title="How We Started">
        <Paragraphs items={[COMPANY_HISTORY]} />
      </Section>

      <Section title="Our Vision">
        <p className="m-0 mb-2.5 text-[13px] font-semibold text-navy">{VISION_LEAD}</p>
        <Paragraphs items={[VISION_BODY]} />
        <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">We believe international payments should be</p>
        <ChipRow items={VISION_VALUES} />
        <p className="m-0 mt-3.5 text-[12.5px] text-ink-2 leading-relaxed">{VISION_CLOSING}</p>
      </Section>

      <Section title="Our Purpose">
        <p className="m-0 mb-2.5 text-[13px] font-semibold text-navy">{PURPOSE_LEAD}</p>
        <Paragraphs items={PURPOSE_PARAGRAPHS} />
        <p className="m-0 mt-2.5 text-[12.5px] font-semibold text-ink">{PURPOSE_CLOSING}</p>
      </Section>

      <Section title="International Payment Services">
        <p className="m-0 mb-4 text-[12.5px] text-ink-2 leading-relaxed">{PAYMENT_SERVICES_INTRO}</p>
        <Chain nodes={PAYMENT_CORRIDOR} />
        <p className="m-0 mt-4 text-[12.5px] text-ink-2 leading-relaxed">{PAYMENT_SERVICES_CLOSING}</p>
      </Section>

      <Section title="Currency Conversion">
        <Paragraphs items={CURRENCY_CONVERSION_INTRO} />
        <div className="mt-3.5">
          <Flow steps={CURRENCY_CONVERSION_STEPS} />
        </div>
        <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CURRENCY_CONVERSION_NOTE}</p>
      </Section>

      <Section title="Cross-Border Fund Transfer">
        <Paragraphs items={CROSS_BORDER_PARAGRAPHS} />
        <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Actual settlement times depend on factors such as</p>
        <Checklist items={SETTLEMENT_FACTORS} />
        <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{SETTLEMENT_DISCLAIMER}</p>
      </Section>

      <Section title="A Digital Approach to International Payments">
        <Paragraphs items={DIGITAL_APPROACH_PARAGRAPHS} />
      </Section>

      <Section title="Security and Transaction Integrity">
        <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">{SECURITY_INTRO}</p>
        <Checklist items={SECURITY_REQUIREMENTS} />
        <p className="m-0 mt-3.5 text-[12.5px] text-ink-2 leading-relaxed">{SECURITY_CLOSING}</p>
        <p className="m-0 mt-2.5 text-[12px]">
          See <Link to="/security" className="text-navy-lt hover:underline">About KYC &amp; Security</Link> for the full control model, or{" "}
          <Link to="/e-security" className="text-navy-lt hover:underline">e-Security</Link> for day-to-day guidance.
        </p>
      </Section>

      <Section title="Transparency and Customer Confidence">
        <Paragraphs items={TRANSPARENCY_PARAGRAPHS} />
        <p className="m-0 mt-2.5 text-[12.5px] font-semibold text-ink">{TRANSPARENCY_CLOSING}</p>
      </Section>

      <Section title="Serving a Global Customer Base">
        <Paragraphs items={GLOBAL_BASE_PARAGRAPHS} />
        <p className="m-0 mt-2.5 text-[12.5px] font-semibold text-ink">{GLOBAL_BASE_CLOSING}</p>
      </Section>

      <Panel>
        <PanelHead title="Our Commitment" note="Six pillars, since 2013" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITMENT_PILLARS.map(({ name, desc }) => {
              const Icon = PILLAR_ICONS[name] ?? Sparkles;
              return (
                <div key={name} className="border border-border-lt rounded-lg p-4">
                  <div className="w-9 h-9 rounded-lg mb-2.5 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
                    <Icon size={17} />
                  </div>
                  <h3 className="text-[13px] mb-1">{name}</h3>
                  <p className="m-0 text-xs text-ink-2 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </PanelBody>
      </Panel>

      <Section title="Our Journey">
        <ul className="list-none m-0 p-0">
          {JOURNEY_MILESTONES.map((m) => (
            <TimelineItem key={m.title} title={m.title} desc={m.desc} />
          ))}
        </ul>
      </Section>

      <Section title="How Our International Payment Model Works">
        <p className="m-0 mb-3.5 text-[12.5px] text-ink-2">A simplified example of an eligible international payment may look like this:</p>
        <ol className="list-none m-0 p-0">
          {PAYMENT_MODEL_STEPS.map((s, i) => (
            <NumberedRow key={s.title} n={i + 1} title={s.title} desc={s.desc} />
          ))}
        </ol>
        <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{PAYMENT_MODEL_CLOSING}</p>
      </Section>

      <Section title="Our Global Philosophy">
        <Paragraphs items={PHILOSOPHY_PARAGRAPHS} />
      </Section>

      <Section title="Looking Toward the Future">
        <Paragraphs items={FUTURE_PARAGRAPHS} />
        <div className="my-3.5">
          <Chain nodes={FUTURE_FORMULA} />
        </div>
        <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{FUTURE_CLOSING}</p>
      </Section>

      <Section title="Our Promise">
        <Paragraphs items={PROMISE_PARAGRAPHS} />
      </Section>

      <div className="bg-navy-dk text-white rounded-[10px] p-6.5 text-center">
        <p className="m-0 mb-2 text-[15px] font-semibold text-white max-w-[54ch] mx-auto">{CLOSING_STATEMENT}</p>
        <p className="m-0 text-[13px] text-gold font-bold uppercase tracking-wide">2 Way Fund International</p>
        <p className="m-0 mt-1 text-[12px] text-white/70">{COMPANY_TAGLINE}</p>
      </div>

      <Callout title="Fictional institution" variant="warn" className="mt-5.5 mb-0">
        <p>
          2 Way Fund International is a fictional entity created for this system-design prototype. Every fact on this page — the
          founding story, address, and commitments above — is fictional content prepared for demonstration purposes and does not
          describe a real financial service.
        </p>
      </Callout>
    </>
  );
}
