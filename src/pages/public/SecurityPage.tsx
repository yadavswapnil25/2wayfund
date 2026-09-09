import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { PageHead, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, NumberedList, Paragraphs } from "../../components/ui/Prose";
import { useApp } from "../../state/AppContext";
import {
  ACCEPTABLE_ID_NOTE,
  ANNUAL_PURPOSE_ITEMS,
  COMMITMENT_TAGLINE,
  FAILURE_CONSEQUENCES,
  FAILURE_NOTE,
  INFO_CHANGE_ITEMS,
  INFO_CHANGE_NOTE,
  KYC_DEFINITION,
  KYC_DOCUMENTS,
  KYC_INTRO,
  LIVENESS_ACTIONS,
  LIVENESS_CLOSING,
  PASSWORD_SECURITY_NOTE,
  PRIVACY_NOTE,
  RESPONSIBILITY_CLOSING,
  RESPONSIBILITY_ITEMS,
  RESTORATION_CHECKS,
  RESTORATION_NOTE,
  RESTRICTION_CLOSING,
  RESTRICTION_EFFECTS,
  SECURITY_WARNING,
  THREE_ATTEMPTS_NOTE,
  VIDEO_KYC_PROCESS,
} from "../../data/kycPolicyContent";

export function SecurityPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead
        title="About KYC & Security"
        lede="The eight-layer security control model, and the authorised-transaction flow it protects."
      />

      <Panel>
        <PanelHead title="Customer KYC" note="Know Your Customer" />
        <PanelBody>
          <Paragraphs items={[KYC_INTRO, KYC_DEFINITION]} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">
            Depending on the account, customers may be required to provide
          </p>
          <Checklist items={KYC_DOCUMENTS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Security Control Layers" />
        <PanelBody flush className="px-4.5">
          <NumberedList items={store.securityLayers.map((l) => ({ title: l.name, desc: l.desc }))} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Authorised Transaction Flow" />
        <PanelBody>
          <Flow steps={store.txFlow} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Transaction Password Security" />
        <PanelBody>
          <Paragraphs items={[PASSWORD_SECURITY_NOTE, THREE_ATTEMPTS_NOTE]} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">During the restriction period</p>
          <Checklist items={RESTRICTION_EFFECTS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{RESTRICTION_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Restriction & Recovery Flow — Design Reference, Not Implemented" />
        <PanelBody>
          <Flow steps={store.restrictFlow} numbered={false} />
          <Callout title="Design reference only" variant="warn" className="mt-4 mb-0">
            <p>
              This flow documents how a restricted transaction facility would be restored in a production build. No account in this
              prototype is ever actually restricted, and nothing here can be triggered from the demo.
            </p>
          </Callout>
        </PanelBody>
      </Panel>

      <Callout title="Important security warning" variant="warn">
        <div className="flex items-start gap-2">
          <ShieldAlert size={15} className="flex-shrink-0 mt-0.5 text-neg" />
          <p className="m-0">{SECURITY_WARNING}</p>
        </div>
      </Callout>

      <Panel>
        <PanelHead title="Video KYC Process" note="6 steps" />
        <PanelBody>
          <NumberedList items={VIDEO_KYC_PROCESS} />
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Acceptable Identification</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{ACCEPTABLE_ID_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Live Person Verification</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">The customer may be instructed to:</p>
          <Checklist items={LIVENESS_ACTIONS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{LIVENESS_CLOSING}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Video KYC & Account Restoration" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Following successful verification, 2 Way Fund International may conduct additional:</p>
          <Checklist items={RESTORATION_CHECKS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{RESTORATION_NOTE}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Annual KYC Update Cycle" />
        <PanelBody>
          <Flow steps={store.annualKycCycle} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Periodic KYC updates may help ensure that</p>
          <Checklist items={ANNUAL_PURPOSE_ITEMS} />
        </PanelBody>
      </Panel>

      <Callout title="Failure to complete required KYC" variant="warn">
        <p className="mb-2">{FAILURE_NOTE}</p>
        <p className="m-0 mb-2 text-[12.5px]">Depending on the applicable circumstances, restrictions may affect:</p>
        <div className="flex flex-wrap gap-2">
          {FAILURE_CONSEQUENCES.map((c) => (
            <span key={c} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-white text-navy">
              {c}
            </span>
          ))}
        </div>
      </Callout>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Changes to Customer Information</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Customers should promptly notify the Company of changes to:</p>
          <Checklist items={INFO_CHANGE_ITEMS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{INFO_CHANGE_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Security, Fraud Prevention &amp; Privacy</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{PRIVACY_NOTE}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Customer Responsibility" />
        <PanelBody>
          <Checklist items={RESPONSIBILITY_ITEMS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed font-semibold">{RESPONSIBILITY_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Callout title="A control model, not a checklist" variant="info">
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber" />
          <p className="m-0">
            Every layer above works together — a transaction that clears login, OTP and the transaction password can still be held by
            transaction monitoring or risk scoring before it settles. See{" "}
            <Link to="/e-security" className="font-semibold text-navy-lt hover:underline">e-Security</Link> for what this means for you
            day to day, or complete a sample verification on the{" "}
            <Link to="/ekyc" className="font-semibold text-navy-lt hover:underline">eKYC Verification</Link> page.
          </p>
        </div>
      </Callout>

      <div className="bg-navy-dk text-white rounded-[10px] p-6.5 text-center">
        <p className="m-0 mb-1 text-[13px] text-gold font-bold uppercase tracking-wide">Our Commitment</p>
        <p className="m-0 text-[15px] font-semibold text-white">{COMMITMENT_TAGLINE}</p>
      </div>
    </>
  );
}
