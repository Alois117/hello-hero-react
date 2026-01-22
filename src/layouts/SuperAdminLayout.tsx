import { ReactNode } from "react";
import { Bell, Search, User, LayoutDashboard, Building2, BarChart4, Shield, CreditCard, Database, Cpu, ToggleLeft, Store, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { useKeycloakAuth } from "@/auth/useKeycloakAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { icon: Building2, label: "Organizations", path: "/super-admin/organizations" },
  { icon: BarChart4, label: "Global Analytics", path: "/super-admin/analytics" },
  { icon: Shield, label: "Security Logs", path: "/super-admin/security-logs" },
  { icon: CreditCard, label: "Multi-Tenant Billing", path: "/super-admin/billing" },
  { icon: Database, label: "Disaster Recovery", path: "/super-admin/recovery" },
  { icon: Cpu, label: "AI/ML Performance", path: "/super-admin/aiml" },
  { icon: ToggleLeft, label: "Feature Flags", path: "/super-admin/features" },
  { icon: Store, label: "Reseller Portal", path: "/super-admin/reseller" },
];

const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const { user, logout, isAuthenticated } = useKeycloakAuth();
  
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card/80 backdrop-blur-lg border-r border-border z-50">
        <div className="p-6">
          {/* Logo - Same as UserLayout */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <Zap className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Jarvis
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
                activeClassName="bg-surface text-destructive border-l-4 border-destructive"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
            <span className="text-muted-foreground">Super Admin</span>
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
                  placeholder="Search organizations, logs, settings..."
                  className="pl-10 bg-surface/50 border-border/50 focus:border-destructive transition-all w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 ml-6">
              <ThemeToggle />
              
              <Button variant="ghost" size="icon" className="relative hover:bg-surface">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
              </Button>

              {isAuthenticated && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 border border-border/50 hover:border-destructive/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-destructive to-accent flex items-center justify-center">
                        <User className="w-4 h-4 text-background" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{user.name || user.email}</div>
                        <div className="text-xs text-muted-foreground">Super Admin</div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.organizationId && (
                          <p className="text-xs text-muted-foreground">Org: {user.organizationId}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive cursor-pointer" onSelect={(e) => e.preventDefault()}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be signed out of your current session.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => logout()}>
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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

export default SuperAdminLayout;
