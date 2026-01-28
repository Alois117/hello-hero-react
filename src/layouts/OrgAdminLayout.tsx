import { ReactNode, useState } from "react";
import {
  Bell,
  Search,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Clock,
  Server as ServerIcon,
  Wrench,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { UserInfoMenu } from "@/keycloak";

interface OrgAdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: CreditCard, label: "Billing", path: "/admin/billing" },
  { icon: BarChart3, label: "Usage Meters", path: "/admin/usage" },
  { icon: Clock, label: "On-Call", path: "/admin/oncall" },
  { icon: ServerIcon, label: "Zabbix", path: "/admin/zabbix-monitoring" },
  { icon: Wrench, label: "Maintenance", path: "/admin/maintenance" },
];

const OrgAdminLayout = ({ children }: OrgAdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* ========== MOBILE HEADER (visible only on small screens) ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <Zap className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
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
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </Button>
          <UserInfoMenu />
        </div>
      </header>

      {/* ========== SIDEBAR ========== */}
      {/* 
        Mobile: Hidden by default, slides in as overlay
        Desktop: Fixed position, always visible, does NOT scroll with page
      */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-lg border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          overflow-hidden
        `}
      >
        {/* Sidebar inner container - flex column for proper structure */}
        <div className="flex flex-col h-full">
          {/* Logo Section (top) */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <Zap className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                  Avis
                </h1>
                <p className="text-xs text-muted-foreground">AI Monitoring</p>
              </div>
            </div>
          </div>

          {/* Close button – only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation - scrollable only if content overflows */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all"
                activeClassName="bg-surface text-accent border-l-4 border-accent"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer/Status Section (bottom) - always fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border p-4 bg-card/50">
            <div className="flex items-center gap-2 text-sm justify-center">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
              <span className="text-muted-foreground">Admin Access</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ========== DESKTOP HEADER (hidden on mobile) ========== */}
      {/* 
        Fixed positioning with left offset for sidebar
        Does NOT overlap main content due to pt-[72px] on main
      */}
      <header className="hidden md:flex fixed top-0 right-0 left-64 h-[72px] bg-card/80 backdrop-blur-lg border-b border-border z-40 items-center px-6">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users, billing, settings..."
              className="pl-10 bg-surface/50 border-border/50 focus:border-accent transition-all w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative hover:bg-surface">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
          </Button>
          <UserInfoMenu />
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      {/* 
        Mobile: pt-16 for mobile header, no left margin
        Desktop: ml-64 for sidebar, pt-[72px] for header
        Content starts below header and to the right of sidebar
      */}
      <main className="pt-16 md:pt-[72px] md:ml-64 p-6">
        {children}
      </main>
    </div>
  );
};

export default OrgAdminLayout;
