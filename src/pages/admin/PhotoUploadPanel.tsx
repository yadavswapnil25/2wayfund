import { Camera } from "lucide-react";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";

export function PhotoUploadPanel({
  photo,
  photoPreview,
  onChange,
}: {
  photo: File | null;
  photoPreview: string | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <Panel>
      <PanelHead
        title={
          <span className="flex items-center gap-1.5">
            <Camera size={14} className="text-navy" /> Customer Official Identification Photograph
          </span>
        }
        note="Optional — supports JPG, PNG, WebP"
      />
      <PanelBody>
        <div className="flex items-center gap-4 flex-wrap">
          {photoPreview ? (
            <img src={photoPreview} alt="Customer preview" className="w-20 h-20 rounded-lg object-cover border border-border-lt flex-none" />
          ) : (
            <div className="w-20 h-20 rounded-lg border border-dashed border-border bg-tint flex items-center justify-center text-ink-2 flex-none">
              <Camera size={22} />
            </div>
          )}
          <div className="flex-1 min-w-[220px]">
            <input
              id="oca-photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
              className="block w-full text-[12px] text-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-[5px] file:border file:border-border file:bg-white file:text-xs file:font-semibold file:cursor-pointer"
            />
            {photo ? (
              <button type="button" onClick={() => onChange(null)} className="mt-1.5 text-[11px] font-semibold text-neg underline">
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
