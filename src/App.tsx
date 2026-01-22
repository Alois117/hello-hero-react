import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import FloatingAIChat from "./components/ai/FloatingAIChat";
import CommandPalette from "./components/CommandPalette";

// Keycloak Auth
import { ProtectedRoute, OAuthCallback } from "./auth";

import LandingPage from "./pages/landingpage/LandingPage";
// Login page for manual login trigger
import Login from "./pages/Login";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserHosts from "./pages/user/UserHosts";
import UserHostDetail from "./pages/user/UserHostDetail";
import UserAlerts from "./pages/user/UserAlerts";
import UserTraps from "./pages/user/UserTraps";
import UserInsights from "./pages/user/UserInsights";
import UserReports from "./pages/user/UserReports";
import UserSettings from "./pages/user/UserSettings";
import BackupReplication from "./pages/user/BackupReplication";

// Org Admin Pages
import OrgAdminDashboard from "./pages/org-admin/OrgAdminDashboard";
import UserManagement from "./pages/org-admin/UserManagement";
import Billing from "./pages/org-admin/Billing";
import UsageMeters from "./pages/org-admin/UsageMeters";
import AlertConfiguration from "./pages/org-admin/AlertConfiguration";
import OnCallSchedules from "./pages/org-admin/OnCallSchedules";
import ZabbixHosts from "./pages/org-admin/ZabbixHosts";
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
import Wireframe from "./pages/Wireframe";
import PrivacyPolicy from './pages/legal/PrivacyPolicy'; 
import TermsOfUse from './pages/legal/TermsOfUse';

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
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
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/wireframe" element={<Wireframe />} />

              {/* User Routes - Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hosts"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserHosts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hosts/:id"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserHostDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/alerts"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserAlerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/traps"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserTraps />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/insights"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserInsights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/reports"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/backup-replication"
                element={
                  <ProtectedRoute requiredRole="user">
                    <BackupReplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserSettings />
                  </ProtectedRoute>
                }
              />

              {/* Org Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <OrgAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/billing"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usage"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <UsageMeters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/alerts"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <AlertConfiguration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/oncall"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <OnCallSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/zabbix"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <ZabbixHosts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/maintenance"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <MaintenanceWindows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/ai"
                element={
                  <ProtectedRoute requiredRole="org_admin">
                    <AISettings />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes - Protected */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/organizations"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <Organizations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/analytics"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <GlobalAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/security-logs"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SecurityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/billing"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <MultiTenantBilling />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/aiml"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <AIMLPerformance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/features"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <FeatureFlagsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/reseller"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <ResellerPortal />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <CommandPalette />
            <FloatingAIChat />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
