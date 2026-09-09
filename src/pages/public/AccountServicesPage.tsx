import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, Banknote, Bell, Globe2, LifeBuoy } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import {
  ACCOUNT_SERVICES,
  CORPORATE_AUDIENCE,
  CORPORATE_COMPLIANCE_NOTE,
  CORPORATE_VS_INDIVIDUAL_INTRO,
  FINAL_NOTE_PARAGRAPHS,
  FX_CHARGE_TYPES,
  FX_PARAGRAPHS,
  MONITORING_CLOSING,
  MONITORING_LIST,
  PHILOSOPHY_BODY,
  PHILOSOPHY_LEAD,
  PHILOSOPHY_PILLARS,
  PROCESSING_TIME_CLOSING,
  PROCESSING_TIME_FACTORS,
  PROHIBITED_CLOSING,
  PROHIBITED_USES,
} from "../../data/accountServiceContent";

const SERVICE_ICONS: LucideIcon[] = [Banknote, ArrowLeftRight, Globe2, Bell, LifeBuoy];

export function AccountServicesPage() {
  return (
    <>
      <PageHead
        title="Account Services"
        lede="Depending on the account category and applicable eligibility requirements, account holders may access the following international payment-related services."
      />

      <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCOUNT_SERVICES.map(({ title, desc }, i) => {
          const Icon = SERVICE_ICONS[i];
          return (
            <div key={title} className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
              <div className="w-9.5 h-9.5 rounded-lg mb-3 bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk flex items-center justify-center">
                <Icon size={18} />
              </div>
              <h3 className="text-sm mb-1.5">{title}</h3>
              <p className="m-0 text-xs text-ink-2 leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>

      <Panel>
        <PanelHead title="Corporate and Individual Account — Key Difference" />
        <PanelBody>
          <Paragraphs items={[CORPORATE_VS_INDIVIDUAL_INTRO]} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">The Corporate Account is intended for</p>
          <Checklist items={CORPORATE_AUDIENCE} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CORPORATE_COMPLIANCE_NOTE}</p>
          <p className="m-0 mt-3.5 text-[12.5px] text-ink">
            Individual Accounts are intended for eligible natural persons, across the General, Classic, Master and 3D categories. See{" "}
            <Link to="/accounts" className="text-navy-lt hover:underline">Account Types</Link> for the full segment structure.
          </p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Security and Compliance" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            2 Way Fund International places importance on the security and integrity of its account and payment services. Customers may
            be required to complete identity verification and provide supporting documents before account activation or transaction
            processing. Transactions may also be subject to monitoring designed to detect:
          </p>
          <Checklist items={MONITORING_LIST} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{MONITORING_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Callout title="Responsible use of accounts" variant="warn">
        <p>Customers must use their accounts only for lawful and legitimate purposes. Accounts must not be used for:</p>
        <ul className="list-none m-0 mt-2 mb-2 grid gap-1.5 sm:grid-cols-2">
          {PROHIBITED_USES.map((item) => (
            <li key={item} className="text-[12.5px] text-ink">
              — {item}
            </li>
          ))}
        </ul>
        <p>{PROHIBITED_CLOSING}</p>
      </Callout>

      <Panel>
        <PanelHead title="Currency and Exchange-Rate Conditions" />
        <PanelBody>
          <Paragraphs items={FX_PARAGRAPHS} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Any applicable</p>
          <Checklist items={FX_CHARGE_TYPES} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">will be handled according to the applicable account and transaction terms.</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="No Guaranteed Processing Time" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">{PROCESSING_TIME_CLOSING} Processing times may depend on:</p>
          <Checklist items={PROCESSING_TIME_FACTORS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Account Philosophy" />
        <PanelBody>
          <p className="m-0 mb-2.5 text-[13px] font-semibold text-navy">{PHILOSOPHY_LEAD}</p>
          <Paragraphs items={[PHILOSOPHY_BODY]} />
          <div className="flex flex-wrap gap-2 mt-3.5">
            {PHILOSOPHY_PILLARS.map((p) => (
              <span key={p} className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border bg-tint text-navy">
                {p}
              </span>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Callout title="Final note" variant="info" className="mb-0">
        <Paragraphs items={FINAL_NOTE_PARAGRAPHS} />
        <p className="mt-2.5">
          All services are subject to applicable laws, regulatory requirements, customer verification, transaction screening, and the
          Company's applicable account-opening and service conditions.
        </p>
      </Callout>
    </>
  );
}
