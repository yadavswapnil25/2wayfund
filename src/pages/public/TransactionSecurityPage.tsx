import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { PageHead, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import { useApp } from "../../state/AppContext";
import {
  BENEFICIARY_ITEMS,
  BENEFICIARY_NOTE,
  BUSINESS_CONTROLS,
  CONFIRMATION_ITEMS,
  CURRENCY_CONVERSION_ITEMS,
  DEVICE_SECURITY_CONTROLS,
  FINAL_CHECK_QUESTIONS,
  FINAL_DISCLAIMER_PARAGRAPHS,
  FRAUD_WARNING,
  FREEZE_NOTE,
  FREEZE_TRIGGERS,
  HIGH_VALUE_ITEMS,
  HIGH_VALUE_NOTE,
  HOLD_NOTE,
  HOLD_REASONS,
  IDENTITY_VERIFICATION_METHODS,
  INTERNAL_TRANSFER_CONTROLS,
  INTERNATIONAL_CHECKS,
  INTRO_PARAGRAPHS,
  MONITORING_FACTORS,
  MONITORING_NOTE,
  NEVER_SHARE_ITEMS,
  NOTIFICATION_TYPES,
  OTP_METHODS,
  OTP_NOTE,
  PASSWORD_RULES,
  PROCESSING_STATUSES,
  REFERENCE_USES,
  REFERENCE_WARNING,
  RESPONSIBILITY_CLOSING,
  RESPONSIBILITY_ITEMS,
  REVIEW_STEPS,
  SECURITY_PRINCIPLES,
  UNAUTHORIZED_INFO_ITEMS,
  VIDEO_KYC_STEPS_SHORT,
} from "../../data/transactionSecurityContent";

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
      <h3 className="text-sm mb-1.5">{title}</h3>
      {children}
    </div>
  );
}

export function TransactionSecurityPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead title="Transaction Security" lede="Implementing the eleven-step flow defined in the fund transaction security policy." />

      <Panel>
        <PanelBody>
          <Paragraphs items={INTRO_PARAGRAPHS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Authorised Transaction Flow" note="11 steps" />
        <PanelBody>
          <Flow steps={store.txFlow} />
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Transaction Password">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Customers should:</p>
          <Checklist items={PASSWORD_RULES} />
        </InfoCard>
        <InfoCard title="OTP & Additional Authentication">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Depending on the transaction, this may include:</p>
          <Checklist items={OTP_METHODS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{OTP_NOTE}</p>
        </InfoCard>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Beneficiary Security">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Before transferring to a new beneficiary, verification may include:</p>
          <Checklist items={BENEFICIARY_ITEMS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{BENEFICIARY_NOTE}</p>
        </InfoCard>
        <InfoCard title="Transaction Confirmation">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Before authorizing, customers should carefully verify:</p>
          <Checklist items={CONFIRMATION_ITEMS} />
        </InfoCard>
      </div>

      <Panel>
        <PanelHead title="High-Value Transaction Security" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Depending on the applicable account and transaction, the Company may request:</p>
          <Checklist items={HIGH_VALUE_ITEMS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{HIGH_VALUE_NOTE}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Transaction Monitoring">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Monitoring may consider factors such as:</p>
          <Checklist items={MONITORING_FACTORS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{MONITORING_NOTE}</p>
        </InfoCard>
        <InfoCard title="Suspicious or Unusual Transactions">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">During a review:</p>
          <Checklist items={REVIEW_STEPS} />
        </InfoCard>
      </div>

      <Panel>
        <PanelHead title="Transaction Security Freeze" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">A security restriction may be triggered by circumstances such as:</p>
          <Checklist items={FREEZE_TRIGGERS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{FREEZE_NOTE}</p>
          <p className="m-0 mt-2.5 text-[12px]">
            See <Link to="/security" className="text-navy-lt hover:underline">About KYC &amp; Security</Link> for the full restriction
            and Video KYC restoration flow.
          </p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Customer Identity Verification">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Additional verification may include:</p>
          <Checklist items={IDENTITY_VERIFICATION_METHODS} />
        </InfoCard>
        <InfoCard title="Video KYC Security">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">The customer may be instructed to:</p>
          <Checklist items={VIDEO_KYC_STEPS_SHORT} />
        </InfoCard>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Device & Login Security">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Security controls may include:</p>
          <Checklist items={DEVICE_SECURITY_CONTROLS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">Customers should log out after using an account on a shared or public device.</p>
        </InfoCard>
        <InfoCard title="International Transaction Security">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">International transactions may be subject to additional:</p>
          <Checklist items={INTERNATIONAL_CHECKS} />
        </InfoCard>
      </div>

      <Panel>
        <PanelHead title="Currency Conversion Security" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Where a transaction involves currency conversion, customers should verify the applicable:</p>
          <Checklist items={CURRENCY_CONVERSION_ITEMS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Internal 2 Way Fund Transfers" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Although an eligible internal transfer may have no standard transaction charge, it remains subject to applicable:</p>
          <Checklist items={INTERNAL_TRANSFER_CONTROLS} />
          <Callout title="0% transaction charge does not mean 0% security verification" variant="info" className="mt-3.5 mb-0">
            <p>Security procedures continue to apply to internal transfers.</p>
          </Callout>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Transaction Notification">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Notifications may include:</p>
          <Checklist items={NOTIFICATION_TYPES} />
        </InfoCard>
        <InfoCard title="Unauthorized Transaction">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">
            If a customer believes a transaction was not authorized by them, contact the official customer-support channel and provide:
          </p>
          <Checklist items={UNAUTHORIZED_INFO_ITEMS} />
        </InfoCard>
      </div>

      <Panel>
        <PanelHead title="Transaction Reference Number" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Customers should retain the transaction reference for future:</p>
          <Checklist items={REFERENCE_USES} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed font-semibold">{REFERENCE_WARNING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Payment Processing Status" />
        <PanelBody flush className="px-4.5">
          <ul className="list-none m-0 p-0">
            {PROCESSING_STATUSES.map((s) => (
              <li key={s.label} className="flex items-start gap-3 py-3 border-b border-dotted border-border last:border-b-0">
                <Tag variant={s.variant} className="mt-0.5">{s.label}</Tag>
                <span className="text-[12.5px] text-ink-2">{s.desc}</span>
              </li>
            ))}
          </ul>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <InfoCard title="Customer Responsibility">
          <Checklist items={RESPONSIBILITY_ITEMS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{RESPONSIBILITY_CLOSING}</p>
        </InfoCard>
        <InfoCard title="Transaction Security for Business Customers">
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Corporate customers may be subject to additional controls, including:</p>
          <Checklist items={BUSINESS_CONTROLS} />
        </InfoCard>
      </div>

      <Callout title="Fraud prevention warning" variant="warn">
        <div className="flex items-start gap-2">
          <ShieldAlert size={15} className="flex-shrink-0 mt-0.5 text-neg" />
          <div>
            <p className="mb-2">Customers should never provide their:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {NEVER_SHARE_ITEMS.map((item) => (
                <span key={item} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-white text-navy">
                  {item}
                </span>
              ))}
            </div>
            <p className="m-0">{FRAUD_WARNING}</p>
          </div>
        </div>
      </Callout>

      <Panel>
        <PanelHead title="Security & Compliance Hold" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">A security or compliance hold may occur because of:</p>
          <Checklist items={HOLD_REASONS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{HOLD_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Final Transaction Authorization" note="Final check" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Before a transaction is finally authorized, the customer should verify:</p>
          <ul className="list-none m-0 p-0 grid gap-2 sm:grid-cols-2">
            {FINAL_CHECK_QUESTIONS.map((q) => (
              <li key={q} className="text-[12.5px] text-ink font-semibold">{q}</li>
            ))}
          </ul>
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">Only after confirming these details should the customer provide final authorization.</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Security-First Approach" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_PRINCIPLES.map((p) => (
              <div key={p.name} className="border border-border-lt rounded-lg p-4">
                <h3 className="text-[13px] mb-1">{p.name}</h3>
                <p className="m-0 text-xs text-ink-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Callout title="Important disclaimer" variant="info" className="mb-0">
        <Paragraphs items={FINAL_DISCLAIMER_PARAGRAPHS} />
      </Callout>
    </>
  );
}
