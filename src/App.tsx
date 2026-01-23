import { Provider } from "react-redux";
import { store } from "@/store";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Login from "./pages/Login";
import LandingPage from "./pages/landingpage/LandingPage";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TwoFASetup from "./pages/TwoFASetup";
import TwoFAVerify from "./pages/TwoFAVerify";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from './pages/legal/PrivacyPolicy'; 
import TermsOfUse from './pages/legal/TermsOfUse';

// Shared Components
import FloatingAIChatWrapper from "./components/ai/FloatingAIChatWrapper";;
import CommandPalette from "./components/CommandPalette";
import RoleBasedRoute from "./components/rbac/RoleBasedRoute";

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

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import Organizations from "./pages/super-admin/Organizations";
import GlobalAnalytics from "./pages/super-admin/GlobalAnalytics";
import SecurityLogs from "./pages/super-admin/SecurityLogs";
import MultiTenantBilling from "./pages/super-admin/MultiTenantBilling";
import AIMLPerformance from "./pages/super-admin/AIMLPerformance";
import FeatureFlagsPage from "./pages/super-admin/FeatureFlagsPage";
import ResellerPortal from "./pages/super-admin/ResellerPortal";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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

            {/* User Routes */}
            <Route path="/dashboard" element={<RoleBasedRoute requiredRole="user"><UserDashboard /></RoleBasedRoute>} />
            <Route path="/dashboard/zabbix" element={<RoleBasedRoute requiredRole="user"><UserZabbix /></RoleBasedRoute>} />
            <Route path="/dashboard/hosts/:id" element={<RoleBasedRoute requiredRole="user"><UserHostDetail /></RoleBasedRoute>} />
            <Route path="/dashboard/veeam" element={<RoleBasedRoute requiredRole="user"><UserVeeam /></RoleBasedRoute>} />
            <Route path="/dashboard/traps" element={<RoleBasedRoute requiredRole="user"><UserTraps /></RoleBasedRoute>} />
            <Route path="/dashboard/insights" element={<RoleBasedRoute requiredRole="user"><UserInsights /></RoleBasedRoute>} />
            <Route path="/dashboard/reports" element={<RoleBasedRoute requiredRole="user"><UserReports /></RoleBasedRoute>} />
            <Route path="/dashboard/settings" element={<RoleBasedRoute requiredRole="user"><UserSettings /></RoleBasedRoute>} />

            {/* Org Admin Routes */}
            <Route path="/admin" element={<RoleBasedRoute requiredRole="org_admin"><OrgAdminDashboard /></RoleBasedRoute>} />
            <Route path="/admin/users" element={<RoleBasedRoute requiredRole="org_admin"><UserManagement /></RoleBasedRoute>} />
            <Route path="/admin/billing" element={<RoleBasedRoute requiredRole="org_admin"><Billing /></RoleBasedRoute>} />
            <Route path="/admin/usage" element={<RoleBasedRoute requiredRole="org_admin"><UsageMeters /></RoleBasedRoute>} />
            <Route path="/admin/alerts" element={<RoleBasedRoute requiredRole="org_admin"><AlertConfiguration /></RoleBasedRoute>} />
            <Route path="/admin/oncall" element={<RoleBasedRoute requiredRole="org_admin"><OnCallSchedules /></RoleBasedRoute>} />
            <Route path="/admin/zabbix-monitoring" element={<RoleBasedRoute requiredRole="org_admin"><Zabbix /></RoleBasedRoute>} />
            <Route path="/admin/zabbix" element={<RoleBasedRoute requiredRole="org_admin"><ZabbixHosts /></RoleBasedRoute>} />
            <Route path="/admin/maintenance" element={<RoleBasedRoute requiredRole="org_admin"><MaintenanceWindows /></RoleBasedRoute>} />
            <Route path="/admin/ai" element={<RoleBasedRoute requiredRole="org_admin"><AISettings /></RoleBasedRoute>} />

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<RoleBasedRoute requiredRole="super_admin"><SuperAdminDashboard /></RoleBasedRoute>} />
            <Route path="/super-admin/organizations" element={<RoleBasedRoute requiredRole="super_admin"><Organizations /></RoleBasedRoute>} />
            <Route path="/super-admin/analytics" element={<RoleBasedRoute requiredRole="super_admin"><GlobalAnalytics /></RoleBasedRoute>} />
            <Route path="/super-admin/security-logs" element={<RoleBasedRoute requiredRole="super_admin"><SecurityLogs /></RoleBasedRoute>} />
            <Route path="/super-admin/billing" element={<RoleBasedRoute requiredRole="super_admin"><MultiTenantBilling /></RoleBasedRoute>} />
            <Route path="/super-admin/aiml" element={<RoleBasedRoute requiredRole="super_admin"><AIMLPerformance /></RoleBasedRoute>} />
            <Route path="/super-admin/features" element={<RoleBasedRoute requiredRole="super_admin"><FeatureFlagsPage /></RoleBasedRoute>} />
            <Route path="/super-admin/reseller" element={<RoleBasedRoute requiredRole="super_admin"><ResellerPortal /></RoleBasedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <CommandPalette />
          <FloatingAIChatWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
