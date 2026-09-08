import { PageHead } from "../components/ui/Flow";
import { Panel, PanelBody } from "../components/ui/Panel";

export function StubPage({ title, lede }: { title: string; lede: string }) {
  return (
    <>
      <PageHead title={title} lede={lede} />
      <Panel>
        <PanelBody>
          <p className="text-ink-2 text-sm">This page is a placeholder in the current build pass and will be filled in next.</p>
        </PanelBody>
      </Panel>
    </>
  );
}
