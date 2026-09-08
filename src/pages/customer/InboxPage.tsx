import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";

export function InboxPage() {
  const { store } = useApp();

  return (
    <>
      <PageHead title="Bank Notices" lede="Secure notices and alerts from 2 Way Fund International. Delivery is in-app only." />

      <Panel>
        <div className="px-4.5 py-3.5 border-b border-border-lt">
          <h3 className="m-0 text-[15px] font-bold text-ink">Official Bank Messages &amp; Notifications</h3>
          <p className="m-0 mt-0.5 text-[12px] text-navy-lt">Communications received directly from 2 Way Fund International</p>
        </div>
        <PanelBody>
          <div className="flex flex-col gap-3">
            {store.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border px-4 py-3.5 ${!m.read ? "bg-[#EEF5FC] border-[#BFD8F0]" : "bg-white border-border-lt"}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[13.5px] text-ink">{m.subject}</strong>
                    {!m.read ? <span className="w-2 h-2 rounded-full bg-navy-lt flex-none" /> : null}
                    <Tag variant={m.priority === "High" ? "review" : "submitted"}>{m.priority}</Tag>
                  </div>
                  <span className="text-[11px] text-ink-2 font-num whitespace-nowrap">{m.sentAt}</span>
                </div>
                <p className="mt-2 mb-0 text-[12.5px] text-ink leading-relaxed whitespace-pre-line">{m.body}</p>
                <p className="mt-2.5 mb-0 text-[11px] text-ink-2">Sender: {m.sentBy}</p>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}
