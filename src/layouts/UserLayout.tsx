import { ReactNode, useState } from "react";
import {
  Bell,
  Search,
  LayoutDashboard,
  Lightbulb,
  FileText,
  Settings,
  Server as ServerIcon,
  Database,
  Menu,      // ← hamburger icon
  X,         // ← close icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import ThemeToggle from "@/components/ThemeToggle";
import { UserInfoMenu } from "@/keycloak";

interface UserLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ServerIcon, label: "Zabbix", path: "/dashboard/zabbix" },
  { icon: Database, label: "Veeam", path: "/dashboard/veeam" },
  { icon: Lightbulb, label: "Insights", path: "/dashboard/insights" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const UserLayout = ({ children }: UserLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Mobile Hamburger Button – visible only on small screens */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border h-16 flex items-center px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.png"
              alt="Avis Logo"
              className="h-8 w-auto object-contain"
            />
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

      {/* Sidebar – hidden on mobile by default, shown as overlay when open */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-lg border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:inset-auto
        `}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo + Text – horizontal layout, same as original style but cleaner */}
          <div className="flex items-center gap-3 mb-10">
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

          {/* Close button – only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </Button>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // close on mobile after click
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all"
                activeClassName="bg-surface text-primary border-l-4 border-primary"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border pt-4 mt-auto">
            <div className="flex items-center gap-2 text-sm justify-center">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
              <span className="text-muted-foreground">System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content – shift right only on md+ screens */}
      <div className="md:ml-64 pt-16 md:pt-0">
        {/* Desktop Header – hidden on mobile */}
        <header className="hidden md:flex fixed top-0 right-0 left-64 h-18 bg-card/80 backdrop-blur-lg border-b border-border z-40 items-center px-6">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search hosts, problems, insights..."
                className="pl-10 bg-surface/50 border-border/50 focus:border-primary transition-all w-full"
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

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;