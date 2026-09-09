import { Link } from "react-router-dom";
import { PageHead, Flow } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, Paragraphs } from "../../components/ui/Prose";
import { TableWrap, Th, Td, CellStrong } from "../../components/ui/Table";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import {
  ACCOUNT_SERVICE_CHARGES,
  ACKNOWLEDGEMENT_NOTE,
  CARD_CHARGE_NOTE,
  CLARIFICATION_NOTE,
  COMMITMENT_NOTE,
  CONFIRMATION_CHECKLIST,
  EXCHANGE_COMMISSION_CLOSING,
  EXCHANGE_COMMISSION_FACTORS,
  FEE_CHANGE_CLOSING,
  FEE_CHANGE_REASONS,
  INTERNAL_EXCLUSIONS,
  INTERNAL_EXCLUSIONS_CLOSING,
  INTERNAL_TRANSFER_NOTE,
  NO_HIDDEN_CHARGES_NOTE,
  POLICY_INTRO,
  SERVICE_CHARGE_CLOSING,
  SERVICE_CHARGE_FACTORS,
  STANDARD_COMMISSION_NOTE,
  SUBSEQUENT_SERVICES,
  TAX_NOTE,
  THIRD_PARTY_NOTE,
} from "../../data/feePolicyContent";

export function FeePolicyPage() {
  const { store } = useApp();
  const example = store.feeExamples[0];
  const commission = example.gross * example.rate;

  return (
    <>
      <PageHead title="Fee Policy" lede="How an applicable fee is determined and communicated." />

      <Panel>
        <PanelBody>
          <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{POLICY_INTRO}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Standard transaction commission</p>
          <p className="m-0 mb-2.5 text-[22px] font-bold text-navy num">2%</p>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{STANDARD_COMMISSION_NOTE}</p>
          <p className="m-0 mt-2.5 text-xs text-ink-2 num">
            Example: {formatCode(example.gross, "USD")} × 2% = {formatCode(commission, "USD")} commission
          </p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Internal 2 Way Fund transfers</p>
          <p className="m-0 mb-2.5 text-[22px] font-bold text-pos num">0%</p>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{INTERNAL_TRANSFER_NOTE}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Internal Transfer Conditions" note="The 0% rate does not automatically apply to" />
        <PanelBody>
          <Checklist items={INTERNAL_EXCLUSIONS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{INTERNAL_EXCLUSIONS_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Service Charge Structure" />
        <PanelBody>
          <Flow steps={store.serviceChargeFlow} />
          <p className="m-0 mt-3.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">The charge may depend upon</p>
          <Checklist items={SERVICE_CHARGE_FACTORS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{SERVICE_CHARGE_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Currency Exchange Commission" />
        <PanelBody>
          <p className="m-0 mb-2.5 text-[12.5px] text-ink-2 leading-relaxed">The exchange-related charge may depend on:</p>
          <Checklist items={EXCHANGE_COMMISSION_FACTORS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{EXCHANGE_COMMISSION_CLOSING}</p>
        </PanelBody>
      </Panel>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Card-Related Charges</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{CARD_CHARGE_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Account-Related Services</h3>
          <p className="m-0 mb-2.5 text-xs text-ink-2 leading-relaxed">May carry separate charges, including:</p>
          <Checklist items={ACCOUNT_SERVICE_CHARGES} />
        </div>
      </div>

      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Third-Party Charges</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{THIRD_PARTY_NOTE}</p>
        </div>
        <div className="bg-white border border-border-lt rounded-lg p-5 shadow-sm">
          <h3 className="text-sm mb-1.5">Taxes and Government Charges</h3>
          <p className="m-0 text-xs text-ink-2 leading-relaxed">{TAX_NOTE}</p>
        </div>
      </div>

      <Panel>
        <PanelHead title="Internal vs External Transactions" note="Summary" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th>Transaction type</Th>
                  <Th width={200} right>Standard transaction charge</Th>
                </tr>
              </thead>
              <tbody>
                {store.feeRules.map((r) => (
                  <tr key={r.transactionType}>
                    <Td>{r.transactionType}</Td>
                    <Td right><CellStrong>{r.charge}</CellStrong></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Transaction Confirmation" note="Review before authorizing" />
        <PanelBody>
          <Checklist items={CONFIRMATION_CHECKLIST} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Changes to Fees" />
        <PanelBody>
          <p className="m-0 mb-3.5 text-[12.5px] text-ink-2 leading-relaxed">2 Way Fund International may revise its fees, commissions, and service charges from time to time, because of:</p>
          <Checklist items={FEE_CHANGE_REASONS} />
          <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{FEE_CHANGE_CLOSING}</p>
        </PanelBody>
      </Panel>

      <Callout title="No hidden charges" variant="info">
        <p>{NO_HIDDEN_CHARGES_NOTE}</p>
      </Callout>

      <Callout title="Important clarification" variant="warn">
        <p>{CLARIFICATION_NOTE}</p>
        <p className="m-0 mt-2 mb-0 text-[12.5px]">
          For example, a customer may transfer funds internally without a transaction charge and subsequently request:
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {SUBSEQUENT_SERVICES.map((s) => (
            <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-white text-navy">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-2.5">Such additional services may carry their own applicable charges.</p>
      </Callout>

      <Panel>
        <PanelHead title="Customer Acknowledgement" />
        <PanelBody>
          <Paragraphs items={[ACKNOWLEDGEMENT_NOTE]} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Commitment" />
        <PanelBody>
          <Paragraphs items={[COMMITMENT_NOTE]} />
        </PanelBody>
      </Panel>

      <p className="text-[12px] text-ink-2">
        See the full <Link to="/fees" className="text-navy-lt hover:underline">Fee Schedule &amp; Worked Examples</Link>.
      </p>
    </>
  );
}
