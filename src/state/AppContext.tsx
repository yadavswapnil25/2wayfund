import { createContext, useCallback, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { createSeedStore } from "../data/seed";
import type { Store } from "../types/data";
import { CREDENTIALS } from "../data/constants";

export type Role = "customer" | "admin" | null;

export interface Session {
  role: Role;
  display: string;
  failures: number;
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

interface AppContextValue {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  session: Session;
  login: (role: "customer" | "admin", display: string) => void;
  logout: () => void;
  recordFailure: () => void;
  balancesHidden: boolean;
  setBalancesHidden: Dispatch<SetStateAction<boolean>>;
  tx: TransferWizardState;
  setTx: Dispatch<SetStateAction<TransferWizardState>>;
  resetTx: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createSeedStore());
  const [session, setSession] = useState<Session>({ role: null, display: "", failures: 0 });
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [tx, setTx] = useState<TransferWizardState>(freshTransferState());

  const login = useCallback((role: "customer" | "admin", display: string) => {
    setSession((s) => ({ ...s, role, display }));
  }, []);

  const logout = useCallback(() => {
    setSession({ role: null, display: "", failures: 0 });
  }, []);

  const recordFailure = useCallback(() => {
    setSession((s) => ({ ...s, failures: s.failures + 1 }));
  }, []);

  const resetTx = useCallback(() => setTx(freshTransferState()), []);

  const value = useMemo<AppContextValue>(
    () => ({ store, setStore, session, login, logout, recordFailure, balancesHidden, setBalancesHidden, tx, setTx, resetTx }),
    [store, session, login, logout, recordFailure, balancesHidden, tx, resetTx]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { CREDENTIALS };
