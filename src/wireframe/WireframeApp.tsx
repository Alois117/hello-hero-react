import { Routes, Route, Navigate } from "react-router-dom";

// Landing & Auth
import WireframeLanding from "./pages/WireframeLanding";
import WireframeLogin from "./pages/auth/WireframeLogin";
import WireframeSignup from "./pages/auth/WireframeSignup";
import WireframeForgotPassword from "./pages/auth/WireframeForgotPassword";
import WireframeTwoFA from "./pages/auth/WireframeTwoFA";

// User Dashboard
import WireframeUserDashboard from "./pages/user/WireframeUserDashboard";
import WireframeUserAlerts from "./pages/user/WireframeUserAlerts";
import WireframeUserHosts from "./pages/user/WireframeUserHosts";
import WireframeUserTraps from "./pages/user/WireframeUserTraps";
import WireframeUserReports from "./pages/user/WireframeUserReports";
import WireframeUserInsights from "./pages/user/WireframeUserInsights";
import WireframeUserSettings from "./pages/user/WireframeUserSettings";

// Org Admin
import WireframeOrgDashboard from "./pages/org-admin/WireframeOrgDashboard";
import WireframeUserManagement from "./pages/org-admin/WireframeUserManagement";
import WireframeAlertConfig from "./pages/org-admin/WireframeAlertConfig";
import WireframeZabbixHosts from "./pages/org-admin/WireframeZabbixHosts";
import WireframeOnCall from "./pages/org-admin/WireframeOnCall";
import WireframeMaintenance from "./pages/org-admin/WireframeMaintenance";
import WireframeUsageMeters from "./pages/org-admin/WireframeUsageMeters";
import WireframeBilling from "./pages/org-admin/WireframeBilling";
import WireframeAISettings from "./pages/org-admin/WireframeAISettings";

// Super Admin
import WireframeSuperDashboard from "./pages/super-admin/WireframeSuperDashboard";

const WireframeApp = () => {
  return (
    <Routes>
      <Route path="/" element={<WireframeLanding />} />
      
      {/* Auth */}
      <Route path="/auth/login" element={<WireframeLogin />} />
      <Route path="/auth/signup" element={<WireframeSignup />} />
      <Route path="/auth/forgot-password" element={<WireframeForgotPassword />} />
      <Route path="/auth/2fa" element={<WireframeTwoFA />} />

      {/* User Dashboard */}
      <Route path="/user/dashboard" element={<WireframeUserDashboard />} />
      <Route path="/user/alerts" element={<WireframeUserAlerts />} />
      <Route path="/user/hosts" element={<WireframeUserHosts />} />
      <Route path="/user/traps" element={<WireframeUserTraps />} />
      <Route path="/user/reports" element={<WireframeUserReports />} />
      <Route path="/user/insights" element={<WireframeUserInsights />} />
      <Route path="/user/settings" element={<WireframeUserSettings />} />

      {/* Org Admin */}
      <Route path="/org-admin/dashboard" element={<WireframeOrgDashboard />} />
      <Route path="/org-admin/users" element={<WireframeUserManagement />} />
      <Route path="/org-admin/alert-config" element={<WireframeAlertConfig />} />
      <Route path="/org-admin/zabbix-hosts" element={<WireframeZabbixHosts />} />
      <Route path="/org-admin/on-call" element={<WireframeOnCall />} />
      <Route path="/org-admin/maintenance" element={<WireframeMaintenance />} />
      <Route path="/org-admin/usage" element={<WireframeUsageMeters />} />
      <Route path="/org-admin/billing" element={<WireframeBilling />} />
      <Route path="/org-admin/ai-settings" element={<WireframeAISettings />} />

      {/* Super Admin */}
      <Route path="/super-admin/dashboard" element={<WireframeSuperDashboard />} />

      <Route path="*" element={<Navigate to="/wireframe" replace />} />
    </Routes>
  );
};

export default WireframeApp;
