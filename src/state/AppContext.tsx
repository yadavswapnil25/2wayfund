import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { createSeedStore } from "../data/seed";
import type { Store } from "../types/data";
import { getMyPhotoUrl } from "../services/meService";

export type Role = "customer" | "admin" | null;

export interface Session {
  role: Role;
  display: string;
  failures: number;
  /** Sanctum bearer token from a real API login (currently only the admin
   * login goes through the real backend) — undefined for the client-side
   * demo customer/staff logins, which never call the API. */
  token?: string;
}

export interface TransferWizardState {
  stage: 1 | 2 | 3;
  beneficiaryId: string | null;
  amount: number;
  channel: "IMPS" | "NEFT" | "RTGS";
  remarks: string;
}

export function freshTransferState(): TransferWizardState {
  return { stage: 1, beneficiaryId: null, amount: 0, channel: "IMPS", remarks: "" };
}

const SESSION_STORAGE_KEY = "2wf-session";
const DEFAULT_SESSION: Session = { role: null, display: "", failures: 0 };

/** Sign-in state survives a reload in the same tab (sessionStorage, not
 * localStorage) — cleared the moment the tab closes, matching the "This
 * browser tab only" label shown on the console. Every other page's data
 * still lives only in a JS variable and is discarded on reload, per the
 * Privacy Policy page — this is the one deliberate exception, because
 * losing a real, API-issued login on every refresh is just a bug. */
function readStoredSession(): Session {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (parsed.role !== "customer" && parsed.role !== "admin") return DEFAULT_SESSION;
    return { role: parsed.role, display: parsed.display ?? "", failures: parsed.failures ?? 0, token: parsed.token };
  } catch {
    return DEFAULT_SESSION;
  }
}

interface AppContextValue {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  session: Session;
  login: (role: "customer" | "admin", display: string, token?: string) => void;
  logout: () => void;
  recordFailure: () => void;
  balancesHidden: boolean;
  setBalancesHidden: Dispatch<SetStateAction<boolean>>;
  tx: TransferWizardState;
  setTx: Dispatch<SetStateAction<TransferWizardState>>;
  resetTx: () => void;
  /** The real logged-in customer's own photo, as a local object URL — one
   * fetch shared by every place it's shown (the header, the Account &
   * Passbook hero card) so they never fall out of sync with each other. */
  photoUrl: string | null;
  /** Re-fetches photoUrl from the backend. Runs automatically once
   * store.user.hasPhoto turns true; callers only need this directly right
   * after uploading a new photo, when hasPhoto may already have been true. */
  refreshPhoto: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createSeedStore());
  const [session, setSession] = useState<Session>(() => readStoredSession());
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [tx, setTx] = useState<TransferWizardState>(freshTransferState());
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  useEffect(() => {
    photoUrlRef.current = photoUrl;
  }, [photoUrl]);

  useEffect(() => {
    try {
      if (session.role) sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // sessionStorage can throw (private browsing, disabled storage) —
      // sign-in still works for the rest of this render, it just won't
      // survive a reload.
    }
  }, [session]);

  const login = useCallback((role: "customer" | "admin", display: string, token?: string) => {
    setSession((s) => ({ ...s, role, display, token }));
  }, []);

  const logout = useCallback(() => {
    setSession(DEFAULT_SESSION);
  }, []);

  const recordFailure = useCallback(() => {
    setSession((s) => ({ ...s, failures: s.failures + 1 }));
  }, []);

  const resetTx = useCallback(() => setTx(freshTransferState()), []);

  const refreshPhoto = useCallback(async () => {
    if (!session.token) return;
    const url = await getMyPhotoUrl(session.token);
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    setPhotoUrl(url);
  }, [session.token]);

  // Picks up the photo once /me reports hasPhoto (the Account & Passbook
  // page's own fetch sets it on the shared store) — and clears it again on
  // logout, so the next sign-in never briefly shows a stranger's photo.
  useEffect(() => {
    if (session.token && store.user.hasPhoto) {
      void refreshPhoto();
      return;
    }
    if (!session.token && photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      setPhotoUrl(null);
    }
  }, [session.token, store.user.hasPhoto, refreshPhoto]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      store,
      setStore,
      session,
      login,
      logout,
      recordFailure,
      balancesHidden,
      setBalancesHidden,
      tx,
      setTx,
      resetTx,
      photoUrl,
      refreshPhoto,
    }),
    [store, session, login, logout, recordFailure, balancesHidden, tx, resetTx, photoUrl, refreshPhoto]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
