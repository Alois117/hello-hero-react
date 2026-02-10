import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Keycloak Auth
import { AuthProvider, OrganizationProvider, ProtectedRoute } from "@/keycloak";
import AuthCallback from "@/keycloak/pages/AuthCallback";

// Public Pages
import Login from "./pages/Login";
import LandingPage from "./pages/landingpage/LandingPage";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TwoFASetup from "./pages/TwoFASetup";
import TwoFAVerify from "./pages/TwoFAVerify";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfUse from "./pages/legal/TermsOfUse";

// Shared Components
import FloatingAIChatWrapper from "./components/ai/FloatingAIChatWrapper";
import CommandPalette from "./components/CommandPalette";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserZabbix from "./pages/user/UserZabbix";
import UserHostDetail from "./pages/user/UserHostDetail";
import UserVeeam from "./pages/user/UserVeeam";
import UserTraps from "./pages/user/UserTraps";
import UserInsights from "./pages/user/UserInsights";
import UserReports from "./pages/user/UserReports";
import UserSettings from "./pages/user/UserSettings";

// Org Admin Pages
import OrgAdminDashboard from "./pages/org-admin/OrgAdminDashboard";
import UserManagement from "./pages/org-admin/UserManagement";
import Billing from "./pages/org-admin/Billing";
import UsageMeters from "./pages/org-admin/UsageMeters";
import AlertConfiguration from "./pages/org-admin/AlertConfiguration";
import OnCallSchedules from "./pages/org-admin/OnCallSchedules";
import ZabbixHosts from "./pages/org-admin/ZabbixHosts";
import Zabbix from "./pages/org-admin/Zabbix";
import MaintenanceWindows from "./pages/org-admin/MaintenanceWindows";
import AISettings from "./pages/org-admin/AISettings";
import OrgAdminSettings from "./pages/org-admin/OrgAdminSettings";

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import Organizations from "./pages/super-admin/Organizations";
import GlobalAnalytics from "./pages/super-admin/GlobalAnalytics";
import SecurityLogs from "./pages/super-admin/SecurityLogs";
import MultiTenantBilling from "./pages/super-admin/MultiTenantBilling";
import AIMLPerformance from "./pages/super-admin/AIMLPerformance";
import FeatureFlagsPage from "./pages/super-admin/FeatureFlagsPage";
import ResellerPortal from "./pages/super-admin/ResellerPortal";
import SuperAdminSettings from "./pages/super-admin/SuperAdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/2fa/setup" element={<TwoFASetup />} />
              <Route path="/2fa/verify" element={<TwoFAVerify />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Routes */}
              <Route element={<OrganizationProvider />}>
                <Route path="/dashboard" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/zabbix" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserZabbix /></ProtectedRoute>} />
                <Route path="/dashboard/hosts/:id" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserHostDetail /></ProtectedRoute>} />
                <Route path="/dashboard/veeam" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserVeeam /></ProtectedRoute>} />
                <Route path="/dashboard/traps" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserTraps /></ProtectedRoute>} />
                <Route path="/dashboard/insights" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserInsights /></ProtectedRoute>} />
                <Route path="/dashboard/reports" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserReports /></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute requiredRole="user" redirectTo="/auth/callback"><UserSettings /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute requiredRole="org_admin"><OrgAdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="org_admin"><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/billing" element={<ProtectedRoute requiredRole="org_admin"><Billing /></ProtectedRoute>} />
                <Route path="/admin/usage" element={<ProtectedRoute requiredRole="org_admin"><UsageMeters /></ProtectedRoute>} />
                <Route path="/admin/alerts" element={<ProtectedRoute requiredRole="org_admin"><AlertConfiguration /></ProtectedRoute>} />
                <Route path="/admin/oncall" element={<ProtectedRoute requiredRole="org_admin"><OnCallSchedules /></ProtectedRoute>} />
                <Route path="/admin/zabbix-monitoring" element={<ProtectedRoute requiredRole="org_admin"><Zabbix /></ProtectedRoute>} />
                <Route path="/admin/zabbix" element={<ProtectedRoute requiredRole="org_admin"><ZabbixHosts /></ProtectedRoute>} />
                <Route path="/admin/maintenance" element={<ProtectedRoute requiredRole="org_admin"><MaintenanceWindows /></ProtectedRoute>} />
                <Route path="/admin/ai" element={<ProtectedRoute requiredRole="org_admin"><AISettings /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="org_admin"><OrgAdminSettings /></ProtectedRoute>} />

                <Route path="/super-admin" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
                <Route path="/super-admin/organizations" element={<ProtectedRoute requiredRole="super_admin"><Organizations /></ProtectedRoute>} />
                <Route path="/super-admin/analytics" element={<ProtectedRoute requiredRole="super_admin"><GlobalAnalytics /></ProtectedRoute>} />
                <Route path="/super-admin/security-logs" element={<ProtectedRoute requiredRole="super_admin"><SecurityLogs /></ProtectedRoute>} />
                <Route path="/super-admin/billing" element={<ProtectedRoute requiredRole="super_admin"><MultiTenantBilling /></ProtectedRoute>} />
                <Route path="/super-admin/aiml" element={<ProtectedRoute requiredRole="super_admin"><AIMLPerformance /></ProtectedRoute>} />
                <Route path="/super-admin/features" element={<ProtectedRoute requiredRole="super_admin"><FeatureFlagsPage /></ProtectedRoute>} />
                <Route path="/super-admin/reseller" element={<ProtectedRoute requiredRole="super_admin"><ResellerPortal /></ProtectedRoute>} />
                <Route path="/super-admin/settings" element={<ProtectedRoute requiredRole="super_admin"><SuperAdminSettings /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />

            </Routes>

            <CommandPalette />
            <FloatingAIChatWrapper />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
