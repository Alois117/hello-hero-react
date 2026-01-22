import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WireframeBox, WireframeText } from "./components/WireframePrimitives";

// Screen imports
import { LandingWireframe } from "./screens/LandingWireframe";
import { LoginWireframe, SignupWireframe, ForgotPasswordWireframe, ResetPasswordWireframe, TwoFAWireframe } from "./screens/auth/AuthWireframes";
import { UserDashboardWireframe } from "./screens/user/UserDashboardWireframe";
import { UserAlertsWireframe, UserHostsWireframe, UserHostDetailWireframe, UserTrapsWireframe, UserInsightsWireframe, UserReportsWireframe, UserSettingsWireframe } from "./screens/user/UserScreensWireframe";
import { OrgAdminDashboardWireframe, OrgAdminUsersWireframe, OrgAdminBillingWireframe, OrgAdminUsageWireframe, OrgAdminAlertsWireframe, OrgAdminOnCallWireframe, OrgAdminZabbixWireframe, OrgAdminMaintenanceWireframe, OrgAdminAIWireframe } from "./screens/org-admin/OrgAdminWireframes";
import { SuperAdminDashboardWireframe, SuperAdminOrgsWireframe, SuperAdminAnalyticsWireframe, SuperAdminSecurityWireframe, SuperAdminBillingWireframe, SuperAdminRecoveryWireframe, SuperAdminAIMLWireframe, SuperAdminFeaturesWireframe, SuperAdminResellerWireframe } from "./screens/super-admin/SuperAdminWireframes";

type Screen = 
  | "landing"
  | "login" | "signup" | "forgot-password" | "reset-password" | "two-fa"
  | "user-dashboard" | "user-alerts" | "user-hosts" | "user-host-detail" | "user-traps" | "user-insights" | "user-reports" | "user-settings"
  | "org-admin-dashboard" | "org-admin-users" | "org-admin-billing" | "org-admin-usage" | "org-admin-alerts" | "org-admin-oncall" | "org-admin-zabbix" | "org-admin-maintenance" | "org-admin-ai"
  | "super-admin-dashboard" | "super-admin-orgs" | "super-admin-analytics" | "super-admin-security" | "super-admin-billing" | "super-admin-recovery" | "super-admin-aiml" | "super-admin-features" | "super-admin-reseller";

const screenCategories = [
  {
    name: "Landing",
    screens: [{ id: "landing", label: "Landing Page" }],
  },
  {
    name: "Authentication",
    screens: [
      { id: "login", label: "Login" },
      { id: "signup", label: "Sign Up" },
      { id: "forgot-password", label: "Forgot Password" },
      { id: "reset-password", label: "Reset Password" },
      { id: "two-fa", label: "Two-Factor Auth" },
    ],
  },
  {
    name: "User Portal",
    screens: [
      { id: "user-dashboard", label: "Dashboard" },
      { id: "user-alerts", label: "Alerts" },
      { id: "user-hosts", label: "Hosts" },
      { id: "user-host-detail", label: "Host Detail" },
      { id: "user-traps", label: "Traps" },
      { id: "user-insights", label: "Insights" },
      { id: "user-reports", label: "Reports" },
      { id: "user-settings", label: "Settings" },
    ],
  },
  {
    name: "Org Admin",
    screens: [
      { id: "org-admin-dashboard", label: "Dashboard" },
      { id: "org-admin-users", label: "User Management" },
      { id: "org-admin-billing", label: "Billing" },
      { id: "org-admin-usage", label: "Usage Meters" },
      { id: "org-admin-alerts", label: "Alert Config" },
      { id: "org-admin-oncall", label: "On-Call" },
      { id: "org-admin-zabbix", label: "Zabbix Hosts" },
      { id: "org-admin-maintenance", label: "Maintenance" },
      { id: "org-admin-ai", label: "AI Settings" },
    ],
  },
  {
    name: "Super Admin",
    screens: [
      { id: "super-admin-dashboard", label: "Dashboard" },
      { id: "super-admin-orgs", label: "Organizations" },
      { id: "super-admin-analytics", label: "Analytics" },
      { id: "super-admin-security", label: "Security Logs" },
      { id: "super-admin-billing", label: "Billing" },
      { id: "super-admin-recovery", label: "Disaster Recovery" },
      { id: "super-admin-aiml", label: "AI/ML Performance" },
      { id: "super-admin-features", label: "Feature Flags" },
      { id: "super-admin-reseller", label: "Reseller Portal" },
    ],
  },
];

export const WireframeContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderScreen = () => {
    const props = { onNavigate: handleNavigate };

    switch (currentScreen) {
      case "landing": return <LandingWireframe {...props} />;
      case "login": return <LoginWireframe {...props} />;
      case "signup": return <SignupWireframe {...props} />;
      case "forgot-password": return <ForgotPasswordWireframe {...props} />;
      case "reset-password": return <ResetPasswordWireframe {...props} />;
      case "two-fa": return <TwoFAWireframe {...props} />;
      case "user-dashboard": return <UserDashboardWireframe {...props} />;
      case "user-alerts": return <UserAlertsWireframe {...props} />;
      case "user-hosts": return <UserHostsWireframe {...props} />;
      case "user-host-detail": return <UserHostDetailWireframe {...props} />;
      case "user-traps": return <UserTrapsWireframe {...props} />;
      case "user-insights": return <UserInsightsWireframe {...props} />;
      case "user-reports": return <UserReportsWireframe {...props} />;
      case "user-settings": return <UserSettingsWireframe {...props} />;
      case "org-admin-dashboard": return <OrgAdminDashboardWireframe {...props} />;
      case "org-admin-users": return <OrgAdminUsersWireframe {...props} />;
      case "org-admin-billing": return <OrgAdminBillingWireframe {...props} />;
      case "org-admin-usage": return <OrgAdminUsageWireframe {...props} />;
      case "org-admin-alerts": return <OrgAdminAlertsWireframe {...props} />;
      case "org-admin-oncall": return <OrgAdminOnCallWireframe {...props} />;
      case "org-admin-zabbix": return <OrgAdminZabbixWireframe {...props} />;
      case "org-admin-maintenance": return <OrgAdminMaintenanceWireframe {...props} />;
      case "org-admin-ai": return <OrgAdminAIWireframe {...props} />;
      case "super-admin-dashboard": return <SuperAdminDashboardWireframe {...props} />;
      case "super-admin-orgs": return <SuperAdminOrgsWireframe {...props} />;
      case "super-admin-analytics": return <SuperAdminAnalyticsWireframe {...props} />;
      case "super-admin-security": return <SuperAdminSecurityWireframe {...props} />;
      case "super-admin-billing": return <SuperAdminBillingWireframe {...props} />;
      case "super-admin-recovery": return <SuperAdminRecoveryWireframe {...props} />;
      case "super-admin-aiml": return <SuperAdminAIMLWireframe {...props} />;
      case "super-admin-features": return <SuperAdminFeaturesWireframe {...props} />;
      case "super-admin-reseller": return <SuperAdminResellerWireframe {...props} />;
      default: return <LandingWireframe {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Navigation Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border/40 bg-card/30 overflow-y-auto flex-shrink-0"
          >
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <WireframeText variant="h3">JARVIS Wireframe</WireframeText>
                <motion.button
                  className="p-1 hover:bg-muted/30 rounded"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </motion.button>
              </div>
              <WireframeText variant="caption" className="block mt-1">
                Interactive UI Wireframe
              </WireframeText>
            </div>

            <nav className="p-2">
              {screenCategories.map((category, i) => (
                <div key={i} className="mb-4">
                  <WireframeText variant="label" className="block px-3 py-2 text-primary">
                    {category.name}
                  </WireframeText>
                  <div className="space-y-1">
                    {category.screens.map((screen) => (
                      <motion.button
                        key={screen.id}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          currentScreen === screen.id
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                        whileHover={{ x: 4 }}
                        onClick={() => handleNavigate(screen.id)}
                      >
                        {screen.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-border/30 mt-4">
              <WireframeText variant="caption" className="block text-muted-foreground">
                Total Screens: {screenCategories.reduce((acc, cat) => acc + cat.screens.length, 0)}
              </WireframeText>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-border/40 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </motion.button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default WireframeContainer;
