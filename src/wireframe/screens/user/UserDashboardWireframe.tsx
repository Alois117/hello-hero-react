import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder, WireframeDivider } from "../../components/WireframePrimitives";
import { WireframeHeader, WireframeSidebar, WireframePage, WireframeGrid, WireframeSection } from "../../components/WireframeLayout";
import { WireframeKPICard, WireframeChart, WireframeListItem, WireframeProgressBar } from "../../components/WireframeWidgets";

interface UserDashboardWireframeProps {
  onNavigate: (screen: string) => void;
  activeScreen?: string;
}

const userSidebarItems = [
  { label: "Dashboard", screen: "user-dashboard", icon: true },
  { label: "Alerts", screen: "user-alerts", icon: true },
  { label: "Hosts", screen: "user-hosts", icon: true },
  { label: "Traps", screen: "user-traps", icon: true },
  { label: "Insights", screen: "user-insights", icon: true },
  { label: "Reports", screen: "user-reports", icon: true },
  { label: "Settings", screen: "user-settings", icon: true },
];

export const UserDashboardLayout = ({ 
  children, 
  onNavigate, 
  activeScreen = "user-dashboard" 
}: { 
  children: React.ReactNode; 
  onNavigate: (screen: string) => void;
  activeScreen?: string;
}) => (
  <div className="min-h-screen flex flex-col bg-background">
    <WireframeHeader title="JARVIS" onNavigate={onNavigate} />
    <div className="flex flex-1">
      <WireframeSidebar
        items={userSidebarItems.map((item) => ({
          ...item,
          active: item.screen === activeScreen,
        }))}
        onNavigate={onNavigate}
        title="USER PORTAL"
      />
      <WireframePage>{children}</WireframePage>
    </div>
  </div>
);

export const UserDashboardWireframe = ({ onNavigate }: UserDashboardWireframeProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-dashboard">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Dashboard</WireframeText>
        <WireframeText variant="body" className="block mt-1">Monitor your infrastructure health and performance</WireframeText>
      </div>

      {/* KPI Cards */}
      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Hosts" value="142" change="+5.2%" changeType="positive" />
        <WireframeKPICard title="Active Problems" value="23" change="-12%" changeType="positive" />
        <WireframeKPICard title="Avg Response Time" value="124ms" change="+8%" changeType="negative" />
        <WireframeKPICard title="System Uptime" value="99.8%" change="+0.2%" changeType="positive" />
      </WireframeGrid>

      {/* Charts Row */}
      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <WireframeText variant="h3" className="block">System Health</WireframeText>
              <WireframeText variant="caption" className="block">Last 24 hours</WireframeText>
            </div>
          </div>
          <div className="space-y-4">
            <WireframeProgressBar label="CPU Usage" value={67} />
            <WireframeProgressBar label="Memory Usage" value={82} />
            <WireframeProgressBar label="Disk Usage" value={45} />
            <WireframeProgressBar label="Network I/O" value={34} />
          </div>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <WireframeText variant="h3" className="block">Recent Problems</WireframeText>
              <WireframeText variant="caption" className="block">Critical alerts</WireframeText>
            </div>
          </div>
          <div className="space-y-2">
            <WireframeListItem
              title="prod-web-01"
              subtitle="High CPU usage detected"
              badge={{ text: "High", variant: "warning" }}
              onClick={() => onNavigate("user-alerts")}
            />
            <WireframeListItem
              title="db-master-02"
              subtitle="Disk space critical"
              badge={{ text: "Critical", variant: "error" }}
              onClick={() => onNavigate("user-alerts")}
            />
            <WireframeListItem
              title="cache-redis-03"
              subtitle="Memory pressure warning"
              badge={{ text: "Warning", variant: "warning" }}
              onClick={() => onNavigate("user-alerts")}
            />
            <WireframeListItem
              title="api-gateway-01"
              subtitle="Response time elevated"
              badge={{ text: "High", variant: "warning" }}
              onClick={() => onNavigate("user-alerts")}
            />
          </div>
        </WireframeBox>
      </WireframeGrid>

      {/* AI Insights */}
      <WireframeBox variant="card" className="p-6 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex-shrink-0" />
          <div className="flex-1">
            <WireframeText variant="h3" className="block mb-2">AI Insight</WireframeText>
            <WireframeText variant="body" className="block mb-4">
              Based on pattern analysis, we've detected increased memory pressure on database cluster DB-PROD-WEST.
              AI recommends scaling horizontally by adding 2 read replicas to distribute load.
            </WireframeText>
            <div className="flex gap-3">
              <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
                <WireframeText variant="caption">Apply Recommendation</WireframeText>
              </WireframeBox>
              <WireframeBox variant="button" className="px-4 py-2">
                <WireframeText variant="caption">Learn More</WireframeText>
              </WireframeBox>
            </div>
          </div>
        </div>
      </WireframeBox>
    </div>
  </UserDashboardLayout>
);
