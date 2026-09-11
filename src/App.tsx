import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./state/AppContext";
import { AppShell } from "./components/layout/AppShell";
import { RouteGuard } from "./components/RouteGuard";
import { landingFor } from "./lib/access";

import { LoginPage } from "./pages/auth/LoginPage";
import { CorporateLoginPage } from "./pages/auth/CorporateLoginPage";
import { AdminLoginPage } from "./pages/auth/AdminLoginPage";
import { DeniedPage } from "./pages/auth/DeniedPage";
import { SetPasswordPage } from "./pages/auth/SetPasswordPage";
import { RegisterAccountPage } from "./pages/auth/RegisterAccountPage";

import { AccountSummaryPage } from "./pages/customer/AccountSummaryPage";
import { TransferFundsPage } from "./pages/customer/TransferFundsPage";
import { BeneficiariesPage } from "./pages/customer/BeneficiariesPage";
import { BeneficiaryDirectoryPage } from "./pages/customer/BeneficiaryDirectoryPage";
import { NomineesPage } from "./pages/customer/NomineesPage";
import { PinSecurityPage } from "./pages/customer/PinSecurityPage";
import { StatementsPage } from "./pages/customer/StatementsPage";
import { ExchangePage } from "./pages/customer/ExchangePage";
import { UsdtPage } from "./pages/customer/UsdtPage";
import { CardsPage } from "./pages/customer/CardsPage";
import { ReceivePage } from "./pages/customer/ReceivePage";
import { DomesticPage } from "./pages/customer/DomesticPage";
import { InternationalPage } from "./pages/customer/InternationalPage";

import { ConsoleHomePage } from "./pages/admin/ConsoleHomePage";
import { ComplianceConsolePage } from "./pages/admin/ComplianceConsolePage";
import { OpenCustomerAccountPage } from "./pages/admin/OpenCustomerAccountPage";
import { CustomerAccountsPage } from "./pages/admin/CustomerAccountsPage";
import { MessagingPage } from "./pages/admin/MessagingPage";
import { AdjustmentsPage } from "./pages/admin/AdjustmentsPage";
import { CustomerDataPage } from "./pages/admin/CustomerDataPage";

import { HomePage } from "./pages/public/HomePage";
import { ClientsPage } from "./pages/public/ClientsPage";
import { MorePage } from "./pages/public/MorePage";
import { CompanyPage } from "./pages/public/CompanyPage";
import { SecurityPage } from "./pages/public/SecurityPage";
import { ESecurityPage } from "./pages/public/ESecurityPage";
import { TransactionSecurityPage } from "./pages/public/TransactionSecurityPage";
import { AccountsPage } from "./pages/public/AccountsPage";
import { AccountServicesPage } from "./pages/public/AccountServicesPage";
import { CardServicesPage } from "./pages/public/CardServicesPage";
import { ExchangeServicesPage } from "./pages/public/ExchangeServicesPage";
import { FeePolicyPage } from "./pages/public/FeePolicyPage";
import { PrivacyPolicyPage } from "./pages/public/PrivacyPolicyPage";
import { OpenAccountPage } from "./pages/public/OpenAccountPage";
import { EkycPage } from "./pages/public/EkycPage";
import { FeesPage } from "./pages/public/FeesPage";

function Landing() {
  const { session } = useApp();
  return <Navigate to={landingFor(session.role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/login" element={<RouteGuard><LoginPage /></RouteGuard>} />
        <Route path="/corporate-login" element={<RouteGuard><CorporateLoginPage /></RouteGuard>} />
        <Route path="/admin-login" element={<RouteGuard><AdminLoginPage /></RouteGuard>} />
        <Route path="/set-password" element={<RouteGuard><SetPasswordPage /></RouteGuard>} />
        <Route path="/register-account" element={<RouteGuard><RegisterAccountPage /></RouteGuard>} />
        <Route path="/denied" element={<RouteGuard><DeniedPage /></RouteGuard>} />

        <Route path="/" element={<RouteGuard><AccountSummaryPage /></RouteGuard>} />
        <Route path="/transfer" element={<RouteGuard><TransferFundsPage /></RouteGuard>} />
        <Route path="/beneficiaries" element={<RouteGuard><BeneficiariesPage /></RouteGuard>} />
        <Route path="/beneficiaries-directory" element={<RouteGuard><BeneficiaryDirectoryPage /></RouteGuard>} />
        <Route path="/nominees" element={<RouteGuard><NomineesPage /></RouteGuard>} />
        <Route path="/receive" element={<RouteGuard><ReceivePage /></RouteGuard>} />
        <Route path="/domestic" element={<RouteGuard><DomesticPage /></RouteGuard>} />
        <Route path="/international" element={<RouteGuard><InternationalPage /></RouteGuard>} />
        <Route path="/statements" element={<RouteGuard><StatementsPage /></RouteGuard>} />
        <Route path="/pin-security" element={<RouteGuard><PinSecurityPage /></RouteGuard>} />
        <Route path="/exchange" element={<RouteGuard><ExchangePage /></RouteGuard>} />
        <Route path="/usdt" element={<RouteGuard><UsdtPage /></RouteGuard>} />
        <Route path="/cards" element={<RouteGuard><CardsPage /></RouteGuard>} />

        <Route path="/console" element={<RouteGuard><ConsoleHomePage /></RouteGuard>} />
        <Route path="/admin" element={<RouteGuard><ComplianceConsolePage /></RouteGuard>} />
        <Route path="/open-customer-account" element={<RouteGuard><OpenCustomerAccountPage /></RouteGuard>} />
        <Route path="/customer-accounts" element={<RouteGuard><CustomerAccountsPage /></RouteGuard>} />
        <Route path="/messages" element={<RouteGuard><MessagingPage /></RouteGuard>} />
        <Route path="/adjustments" element={<RouteGuard><AdjustmentsPage /></RouteGuard>} />
        <Route path="/customer-data" element={<RouteGuard><CustomerDataPage /></RouteGuard>} />

        <Route path="/home" element={<RouteGuard><HomePage /></RouteGuard>} />
        <Route path="/clients" element={<RouteGuard><ClientsPage /></RouteGuard>} />
        <Route path="/more" element={<RouteGuard><MorePage /></RouteGuard>} />
        <Route path="/e-security" element={<RouteGuard><ESecurityPage /></RouteGuard>} />
        <Route path="/accounts" element={<RouteGuard><AccountsPage /></RouteGuard>} />
        <Route path="/account-services" element={<RouteGuard><AccountServicesPage /></RouteGuard>} />
        <Route path="/card-services" element={<RouteGuard><CardServicesPage /></RouteGuard>} />
        <Route path="/exchange-services" element={<RouteGuard><ExchangeServicesPage /></RouteGuard>} />
        <Route path="/fee-policy" element={<RouteGuard><FeePolicyPage /></RouteGuard>} />
        <Route path="/transaction-security" element={<RouteGuard><TransactionSecurityPage /></RouteGuard>} />
        <Route path="/privacy-policy" element={<RouteGuard><PrivacyPolicyPage /></RouteGuard>} />
        <Route path="/open-account" element={<RouteGuard><OpenAccountPage /></RouteGuard>} />
        <Route path="/ekyc" element={<RouteGuard><EkycPage /></RouteGuard>} />
        <Route path="/fees" element={<RouteGuard><FeesPage /></RouteGuard>} />
        <Route path="/security" element={<RouteGuard><SecurityPage /></RouteGuard>} />
        <Route path="/company" element={<RouteGuard><CompanyPage /></RouteGuard>} />

        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      {/* Real paths (/open-account, not /#/open-account) — whatever
       * serves the built app in production must rewrite every path back
       * to index.html (an SPA fallback rule) or a fresh load on any
       * non-root URL 404s. Vite's own dev server already does this, so
       * local development needs no extra configuration. */}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
