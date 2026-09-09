import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import {
  ACKNOWLEDGEMENT_NOTE,
  BREACH_NOTE,
  CHILDRENS_PRIVACY_PARAGRAPHS,
  COLLECTION_METHODS,
  COMMITMENT_GOALS,
  COOKIE_NOTE,
  COOKIE_USES,
  DPA_NOTE,
  FRAUD_MONITORING_NOTE,
  INFO_CATEGORIES,
  INTERNATIONAL_TRANSFER_NOTE,
  LEGAL_BASES,
  LEGAL_BASIS_NOTE,
  MARKETING_PARAGRAPHS,
  PAYMENT_DATA_NOTE,
  PAYMENT_DATA_USES,
  POLICY_CHANGE_NOTE,
  POLICY_CHANGE_REASONS,
  POLICY_INTRO,
  PRIVACY_RIGHTS,
  RECORDS_NOTE,
  RETENTION_NOTE,
  RETENTION_REASONS,
  RIGHTS_NOTE,
  SECURITY_NOTE,
  SECURITY_THREATS,
  SHARING_NOTE,
  SHARING_RECIPIENTS,
  THIRD_PARTY_SITES_NOTE,
  USE_PURPOSES,
} from "../../data/privacyPolicyContent";

export function PrivacyPolicyPage() {
  return (
    <>
      <PageHead title="Privacy Policy" lede="What this prototype actually collects: almost nothing." />

      <Callout title="Client-only, with one exception" variant="info">
        <p>
          Nearly every page here makes no network requests — anything typed into a form lives only in a JavaScript variable in your
          browser tab and is discarded on reload. The one exception is Open an Account: that form submits to a demonstration backend and
          the application record is stored in a database for this case study, so the compliance-review flow it feeds has something real
          to work against. No payment is collected and no identity document is requested or stored.
        </p>
      </Callout>

      <Panel>
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            A production institution would collect identity, contact, employment and financial information to open and service an
            account, under an applicable data-protection regime, with defined rights of access, correction and erasure. This prototype
            implements none of that collection. The policy below is the institution's stated Privacy Policy — what a production version
            of this service would publish and be bound by.
          </p>
          <Paragraphs items={POLICY_INTRO} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="1. Our Commitment to Privacy" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">
            We believe privacy is an essential part of customer trust. Our objective is to collect only information that is reasonably
            necessary for legitimate business, service, security, legal, and regulatory purposes. We seek to:
          </p>
          <Checklist items={COMMITMENT_GOALS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="2. Information We May Collect" note="Depending on the service you use" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {INFO_CATEGORIES.map((c) => (
              <div key={c.letter} className="border border-border-lt rounded-lg p-4">
                <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">{c.letter}. {c.title}</p>
                <Checklist items={c.items} />
                {c.note ? <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{c.note}</p> : null}
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="3. How We Collect Information" />
        <PanelBody>
          <Checklist items={COLLECTION_METHODS} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="4. Why We Use Personal Information" />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_PURPOSES.map((p) => (
              <div key={p.title} className="border border-border-lt rounded-lg p-4">
                <h3 className="text-[13px] mb-1">{p.title}</h3>
                <p className="m-0 text-xs text-ink-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="5. Legal Basis for Processing" />
        <PanelBody>
          <Checklist items={LEGAL_BASES} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{LEGAL_BASIS_NOTE}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">6. Payment and Financial Data</h3>
          <Checklist items={PAYMENT_DATA_USES} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{PAYMENT_DATA_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">7. Sharing of Personal Information</h3>
          <Checklist items={SHARING_RECIPIENTS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{SHARING_NOTE}</p>
        </div>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">8. International Data Transfers</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{INTERNATIONAL_TRANSFER_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">9. Data Security</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">Safeguards are designed to protect information against:</p>
          <Checklist items={SECURITY_THREATS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{SECURITY_NOTE}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="10. Data Retention" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">{RETENTION_NOTE}</p>
          <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Financial and transaction records may need to be retained for longer periods because of</p>
          <Checklist items={RETENTION_REASONS} />
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">11. Cookies and Similar Technologies</h3>
          <Checklist items={COOKIE_USES} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{COOKIE_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">12. Marketing Communications</h3>
          <Paragraphs items={MARKETING_PARAGRAPHS} />
        </div>
      </div>

      <Panel>
        <PanelHead title="13. Your Privacy Rights" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
          <Checklist items={PRIVACY_RIGHTS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{RIGHTS_NOTE}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">14. Identity Verification &amp; Legal Records</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{RECORDS_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">15. Children's Privacy</h3>
          <Paragraphs items={CHILDRENS_PRIVACY_PARAGRAPHS} />
        </div>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">16. Third-Party Websites</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{THIRD_PARTY_SITES_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">17. Fraud and Security Monitoring</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{FRAUD_MONITORING_NOTE}</p>
        </div>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">18. Data Breach &amp; Security Incidents</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{BREACH_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">19. Changes to This Privacy Policy</h3>
          <Checklist items={POLICY_CHANGE_REASONS} />
          <p className="m-0 mt-2.5 text-xs text-ink-2 leading-relaxed">{POLICY_CHANGE_NOTE}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Data Protection Authority" />
        <PanelBody>
          <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{DPA_NOTE}</p>
        </PanelBody>
      </Panel>

      <Callout title="Your acknowledgement" variant="info" className="mb-0">
        <p>{ACKNOWLEDGEMENT_NOTE}</p>
      </Callout>
    </>
  );
}
