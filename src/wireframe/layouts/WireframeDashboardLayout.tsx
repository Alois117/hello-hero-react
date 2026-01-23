import { ReactNode } from "react";
import { WireframeSidebar, WireframeHeader, WireframeNav } from "../components";

interface WireframeDashboardLayoutProps {
  children: ReactNode;
  role: "user" | "org-admin" | "super-admin";
  title?: string;
}

const sidebarItems = {
  user: [
    { label: "Dashboard", icon: "📊", active: false },
    { label: "Alerts", icon: "🔔", badge: "23" },
    { label: "Hosts", icon: "🖥️" },
    { label: "Traps", icon: "📡" },
    { label: "Reports", icon: "📈" },
    { label: "Insights", icon: "💡" },
    { label: "Settings", icon: "⚙️" },
  ],
  "org-admin": [
    { label: "Dashboard", icon: "📊", active: false },
    { label: "User Management", icon: "👥" },
    { label: "Alert Config", icon: "🔔" },
    { label: "Zabbix Hosts", icon: "🖥️" },
    { label: "On-Call", icon: "📞" },
    { label: "Maintenance", icon: "🔧" },
    { label: "Usage Meters", icon: "📊" },
    { label: "Billing", icon: "💳" },
    { label: "AI Settings", icon: "🤖" },
  ],
  "super-admin": [
    { label: "Dashboard", icon: "📊", active: false },
    { label: "Organizations", icon: "🏢" },
    { label: "Global Analytics", icon: "📈" },
    { label: "Feature Flags", icon: "🚩" },
    { label: "Billing", icon: "💰" },
    { label: "Reseller Portal", icon: "🤝" },
    { label: "AI/ML Performance", icon: "🤖" },
    { label: "Disaster Recovery", icon: "🛡️" },
    { label: "Security Logs", icon: "🔐" },
  ],
};

const navItems = [
  { label: "Landing", path: "/wireframe" },
  { label: "Login", path: "/wireframe/auth/login" },
  { label: "Signup", path: "/wireframe/auth/signup" },
  { label: "User Dashboard", path: "/wireframe/user/dashboard" },
  { label: "Org Admin", path: "/wireframe/org-admin/dashboard" },
  { label: "Super Admin", path: "/wireframe/super-admin/dashboard" },
];

const WireframeDashboardLayout = ({ children, role, title }: WireframeDashboardLayoutProps) => {
  const items = sidebarItems[role];
  const roleTitle = role === "user" ? "User" : role === "org-admin" ? "Org Admin" : "Super Admin";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Wireframe Navigation */}
      <WireframeNav items={navItems} />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <WireframeSidebar 
          title={`[JARVIS - ${roleTitle}]`} 
          items={items.map((item, i) => ({ ...item, active: i === 0 }))} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <WireframeHeader 
            title={title} 
            showSearch 
            showUser 
            showThemeToggle 
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default WireframeDashboardLayout;
