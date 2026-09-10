import { Link } from "react-router-dom";
import { PageHead, Chain } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout } from "../../components/ui/Misc";
import { Checklist, NumberedList, Paragraphs } from "../../components/ui/Prose";
import { TableWrap, Th, Td, CellStrong, CellSub } from "../../components/ui/Table";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import {
  CORPORATE_APPROVAL_NOTE,
  CORPORATE_DESCRIPTION,
  CORPORATE_DOCUMENTS,
  OPENING_PROCESS,
} from "../../data/accountServiceContent";

export function AccountsPage() {
  const { store } = useApp();
  const corporate = store.tiers.filter((t) => t.name.startsWith("Corporate Account"));
  const individual = store.tiers.filter((t) => !t.name.startsWith("Corporate Account"));

  return (
    <>
      <PageHead
        title="Account Types"
        lede={`${store.tiers.length} account classes — ${corporate.length} corporate and ${individual.length} individual tiers — each with a stated minimum opening requirement and a corresponding service segment.`}
      />

      <Panel>
        <PanelHead title="Corporate Account" note={corporate.length === 1 ? "Diamond Segment" : `${corporate.length} tiers`} />
        <PanelBody flush>
          <div className="px-4.5 sm:px-5 py-4">
            <Paragraphs items={[CORPORATE_DESCRIPTION]} />
          </div>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={100}>Segment</Th>
                  <Th>Account class</Th>
                  <Th width={165} right>Minimum opening</Th>
                </tr>
              </thead>
              <tbody>
                {corporate.map((tier) => (
                  <tr key={tier.name}>
                    <Td>{tier.segment}</Td>
                    <Td>
                      <CellStrong>{tier.name}</CellStrong>
                      <CellSub>{tier.description}</CellSub>
                    </Td>
                    <Td right>
                      <CellStrong>{formatCode(tier.openingAmt, tier.currency)}</CellStrong>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <div className="px-4.5 sm:px-5 py-4">
            <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-2">
              Corporate account holders may be required to provide, where applicable
            </p>
            <Checklist items={CORPORATE_DOCUMENTS} />
            <p className="m-0 mt-3.5 text-xs text-ink-2 leading-relaxed">{CORPORATE_APPROVAL_NOTE}</p>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Individual Account Segments" note="Four tiers, Advantage through Gold" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th width={100}>Segment</Th>
                  <Th>Account class</Th>
                  <Th width={165} right>Minimum opening</Th>
                </tr>
              </thead>
              <tbody>
                {individual.map((tier) => (
                  <tr key={tier.name}>
                    <Td>{tier.segment}</Td>
                    <Td>
                      <CellStrong>{tier.name}</CellStrong>
                      <CellSub>{tier.description}</CellSub>
                    </Td>
                    <Td right>
                      <CellStrong>{formatCode(tier.openingAmt, tier.currency)}</CellStrong>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Account Segmentation" />
        <PanelBody>
          <div className="flex flex-col gap-3">
            <div>
              <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Corporate Customer</p>
              <div className="flex flex-col gap-2">
                {corporate.map((tier) => (
                  <Chain key={tier.name} nodes={[tier.name, `${tier.segment} Segment`]} />
                ))}
              </div>
            </div>
            <div>
              <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-2">Individual Customer</p>
              <div className="flex flex-col gap-2">
                {individual.map((tier) => (
                  <Chain key={tier.name} nodes={[tier.name, `${tier.segment} Segment`]} />
                ))}
              </div>
            </div>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Account Opening Process" note="7 steps" />
        <PanelBody>
          <NumberedList items={OPENING_PROCESS} />
        </PanelBody>
      </Panel>

      <Callout title="Important" variant="warn">
        <p>
          Account-opening amounts should not be interpreted as an unconditional promise of account approval. All accounts are subject to
          customer eligibility, identity verification, KYC/AML requirements, sanctions screening, transaction-risk assessment, and
          acceptance of the applicable account terms.
        </p>
      </Callout>

      <p className="text-[12px] text-ink-2">
        See <Link to="/account-services" className="text-navy-lt hover:underline">Account Services</Link> for what you can do with an
        account once it's open, or <Link to="/open-account" className="text-navy-lt hover:underline">Apply for an Account</Link> to apply.
      </p>
    </>
  );
}
