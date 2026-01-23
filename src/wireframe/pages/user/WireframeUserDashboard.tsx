import { WireframeBox, WireframeText, WireframeCard, WireframeChart, WireframeTable, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserDashboard = () => {
  return (
    <WireframeDashboardLayout role="user" title="Dashboard">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[User Dashboard]</WireframeText>
            <WireframeText variant="body">[Real-time monitoring overview]</WireframeText>
          </div>
          <div className="flex gap-2">
            <WireframeBadge label="Last updated: 2m ago" variant="info" />
          </div>
        </div>

        {/* KPI Cards Row */}
        <WireframeBox label="KPI Cards Section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WireframeCard title="Total Hosts" value="[142]" subtitle="[+12 this week]" icon="🖥️" />
            <WireframeCard title="Active Problems" value="[23]" subtitle="[-5 from yesterday]" icon="⚠️" />
            <WireframeCard title="Healthy Systems" value="[94.2%]" subtitle="[↑ 2.1%]" icon="✓" />
            <WireframeCard title="Avg Response Time" value="[45ms]" subtitle="[Within SLA]" icon="⚡" />
          </div>
        </WireframeBox>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WireframeChart label="Severity Distribution Chart" type="bar" />
          <WireframeChart label="Alerts By Host Widget" type="bar" />
        </div>

        {/* Timeline and Critical Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WireframeChart label="Alerts Timeline Widget" type="area" />
          
          <WireframeBox label="Critical Issues Panel">
            <div className="space-y-3">
              {[
                { host: "web-server-01", issue: "High CPU", severity: "critical" },
                { host: "db-primary", issue: "Disk Full", severity: "high" },
                { host: "api-gateway", issue: "Memory Leak", severity: "warning" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                  <div>
                    <WireframeText variant="body">[{item.host}]</WireframeText>
                    <WireframeText variant="caption">[{item.issue}]</WireframeText>
                  </div>
                  <WireframeBadge label={item.severity} variant={item.severity as any} />
                </div>
              ))}
            </div>
          </WireframeBox>
        </div>

        {/* AI Insight Panel */}
        <WireframeBox label="AI Insight Panel" className="bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1 space-y-2">
              <WireframeText variant="h3">[AI-Generated Insight]</WireframeText>
              <WireframeText variant="body">
                [Based on current patterns, web-server-01 may experience memory exhaustion in the next 4 hours. 
                Consider scaling horizontally or investigating memory leaks.]
              </WireframeText>
              <div className="flex gap-2 pt-2">
                <WireframeBox dashed className="px-3 py-1">
                  <WireframeText variant="caption">[View Details]</WireframeText>
                </WireframeBox>
                <WireframeBox dashed className="px-3 py-1">
                  <WireframeText variant="caption">[Dismiss]</WireframeText>
                </WireframeBox>
              </div>
            </div>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserDashboard;
