import { ReactNode, useState } from "react";
import {
  Bell,
  Search,
  LayoutDashboard,
  Building2,
  BarChart4,
  Shield,
  CreditCard,
  Cpu,
  ToggleLeft,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { UserInfoMenu } from "@/keycloak";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Organizations", path: "/super-admin/organizations" },
  { icon: BarChart4, label: "Global Analytics", path: "/super-admin/analytics" },
  { icon: Shield, label: "Security Logs", path: "/super-admin/security-logs" },
  { icon: CreditCard, label: "Multi-Tenant Billing", path: "/super-admin/billing" },
  { icon: Cpu, label: "AI/ML Performance", path: "/super-admin/aiml" },
  { icon: ToggleLeft, label: "Feature Flags", path: "/super-admin/features" },
  { icon: Settings, label: "Settings", path: "/super-admin/settings" },
];

const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* MOBILE HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Avis Logo" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                Avis
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">AI Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          </Button>
          <UserInfoMenu />
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-lg border-r border-border
          transform transition-transform duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.png"
                alt="Avis AI Monitoring Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                  Avis
                </h1>
                <p className="text-xs text-muted-foreground">AI Monitoring</p>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="absolute top-4 right-4 md:hidden" onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </Button>

          <nav className="flex-1 overflow-y-auto px-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all"
                activeClassName="bg-surface text-destructive border-l-4 border-destructive"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex-shrink-0 border-t border-border p-4 bg-card/50">
            <div className="flex items-center gap-2 text-sm justify-center">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
              <span className="text-muted-foreground">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />}

      {/* DESKTOP HEADER */}
      <header className="hidden md:flex fixed top-0 right-0 left-64 h-[72px] bg-card/80 backdrop-blur-lg border-b border-border z-40 items-center px-4 lg:px-6 3xl:px-10">
        <div className="flex-1 max-w-xl lg:max-w-2xl 3xl:max-w-3xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search organizations, logs, settings..."
              className="pl-10 bg-surface/50 border-border/50 focus:border-destructive transition-all w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4 ml-4 lg:ml-6">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative hover:bg-surface">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
          </Button>
          <UserInfoMenu />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-16 md:pt-[100px] md:ml-64 p-4 sm:p-6 3xl:p-8 4xl:p-10">
        <div className="max-w-[2200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;