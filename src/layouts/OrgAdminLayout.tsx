import { ReactNode } from "react";
import { Bell, Search, User, LayoutDashboard, Users, CreditCard, BarChart3, AlertCircle, Clock, Server as ServerIcon, Wrench, Brain, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { getAuthUser } from "@/utils/auth";

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
  const user = getAuthUser();
  
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card/80 backdrop-blur-lg border-r border-border z-50">
        <div className="p-6">
          {/* Logo - Exact same as UserLayout */}
          <div className="flex items-center gap-3 mb-8">
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

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all"
                activeClassName="bg-surface text-accent border-l-4 border-accent"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            <span className="text-muted-foreground">Admin Access</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 h-18 bg-card/80 backdrop-blur-lg border-b border-border z-40">
          <div className="h-full px-6 flex items-center justify-between">
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

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 border border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-background" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{user?.email || 'Admin'}</div>
                  <div className="text-xs text-muted-foreground">Org Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 pt-24">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrgAdminLayout;