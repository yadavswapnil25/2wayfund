import { PageHead } from "../../components/ui/Flow";
import { CustomerAccountsList } from "./CustomerAccountsList";

export function CustomerAccountsPage() {
  return (
    <>
      <PageHead title="Customer Accounts" lede="Every customer account, however it was provisioned — search, review and drill into any one of them." />
      <CustomerAccountsList />
    </>
  );
}
