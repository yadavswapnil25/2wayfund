import { Link } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { TableWrap, Th, Td, CellStrong } from "../../components/ui/Table";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";

export function FeesPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead title="Fees & Charges" lede="Standard commission schedule. Internal 2 Way Fund transfers attract no charge." />

      <Panel>
        <PanelHead title="Fee Schedule" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th>Transaction type</Th>
                  <Th width={110} right>Charge</Th>
                  <Th>Notes</Th>
                </tr>
              </thead>
              <tbody>
                {store.feeRules.map((r) => (
                  <tr key={r.transactionType}>
                    <Td><CellStrong>{r.transactionType}</CellStrong></Td>
                    <Td right><CellStrong>{r.charge}</CellStrong></Td>
                    <Td>{r.notes}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Worked Examples" />
        <PanelBody flush>
          <TableWrap>
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  <Th>Transaction</Th>
                  <Th width={90} right>Rate</Th>
                  <Th width={110} right>Commission</Th>
                  <Th width={110} right>Net</Th>
                </tr>
              </thead>
              <tbody>
                {store.feeExamples.map((e) => {
                  const commission = e.gross * e.rate;
                  return (
                    <tr key={e.label}>
                      <Td>{e.label} · {formatCode(e.gross, "USD")}</Td>
                      <Td right>{(e.rate * 100).toFixed(0)}%</Td>
                      <Td right className="text-neg">− {formatCode(commission, "USD")}</Td>
                      <Td right><CellStrong>{formatCode(e.gross - commission, "USD")}</CellStrong></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        </PanelBody>
      </Panel>

      <p className="text-[12px] text-ink-2">
        See <Link to="/fee-policy" className="text-navy-lt hover:underline">Fee Policy</Link> for how a charge is determined and
        communicated.
      </p>
    </>
  );
}
