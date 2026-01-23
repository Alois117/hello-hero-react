import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Server, 
  AlertTriangle, 
  Radio,
  Lightbulb,
  FileText,
  Settings,
  Shield,
  Zap
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Server, label: "Hosts", path: "/hosts" },
  { icon: AlertTriangle, label: "Alerts", path: "/alerts" },
  { icon: Radio, label: "Traps", path: "/traps" },
  { icon: Lightbulb, label: "Insights", path: "/insights" },
  { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Shield, label: "Admin Panel", path: "/admin/org" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border glass-surface fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary" />
            <Zap className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-glow-primary">Jarvis</h1>
            <p className="text-xs text-muted-foreground">AI Monitoring</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover-lift text-sidebar-foreground"
            activeClassName="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30 glow-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Status Indicator */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
              <span className="text-xs text-success">Online</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last sync: 2s ago
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
