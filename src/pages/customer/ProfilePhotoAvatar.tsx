import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useApp } from "../../state/AppContext";
import { monogram } from "../../lib/format";
import { updateMyPhoto } from "../../services/meService";
import { ApiError } from "../../services/apiClient";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB, matching the backend's own limit (UpdateMyPhotoRequest).
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** The customer's own avatar in the Account & Passbook hero card, with a
 * click-to-change control. Reads/writes the same shared photoUrl the
 * header (Brandbar) reads from, so both update together the moment a new
 * photo is saved — there's only ever one fetch, one source of truth.
 * Upload errors are reported to the caller rather than rendered here, so
 * they show at the top of the page next to the page's other errors. */
export function ProfilePhotoAvatar({ name, onError }: { name: string; onError: (message: string | null) => void }) {
  const { session, setStore, photoUrl, refreshPhoto } = useApp();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelected(file: File | null) {
    if (!file || !session.token) return;
    onError(null);

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      onError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      onError("That photo is too large — the limit is 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const hasPhoto = await updateMyPhoto(file, session.token);
      setStore((s) => ({ ...s, user: { ...s.user, hasPhoto } }));
      await refreshPhoto();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Could not update your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <span className="relative flex-none w-9 h-9 rounded-full border-2 border-white/40 overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[13px] font-bold flex items-center justify-center">
            {monogram(name)}
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          title="Change profile photo"
          className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/50 text-white transition-colors disabled:cursor-wait"
        >
          {uploading ? (
            <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <Camera size={13} />
          )}
        </button>
        <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-pos border-2 border-[#0B3D42] pointer-events-none" />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void handleSelected(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </>
  );
}
