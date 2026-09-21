import { FundsActionPage } from "./FundsActionPage";

/** The Administration sidebar's dedicated "Debit Funds" tool — split out
 * from "Add Funds" into its own entry so debiting isn't one toggle away
 * from crediting. */
export function DebitFundsPage() {
  return <FundsActionPage direction="debit" />;
}
