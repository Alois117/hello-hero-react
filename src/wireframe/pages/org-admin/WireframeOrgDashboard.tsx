import { WireframeBox, WireframeText, WireframeCard, WireframeChart } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeOrgDashboard = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Organization Admin">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Organization Admin Dashboard]</WireframeText>
          <WireframeText variant="body">[Manage your organization's monitoring infrastructure]</WireframeText>
        </div>

        {/* KPI Cards */}
        <WireframeBox label="Organization KPIs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WireframeCard title="Total Users" value="[24]" subtitle="[+3 this month]" icon="👥" />
            <WireframeCard title="Active Hosts" value="[142]" subtitle="[License: 200]" icon="🖥️" />
            <WireframeCard title="Monthly Cost" value="[$2,450]" subtitle="[Within budget]" icon="💰" />
            <WireframeCard title="Active Alerts" value="[23]" subtitle="[5 critical]" icon="🔔" />
          </div>
        </WireframeBox>

        {/* Activity and Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WireframeBox label="Recent User Activity">
            <div className="space-y-3">
              {[
                { user: "john.doe", action: "Logged in", time: "2m ago" },
                { user: "jane.smith", action: "Acknowledged alert", time: "15m ago" },
                { user: "bob.wilson", action: "Created host group", time: "1h ago" },
                { user: "alice.jones", action: "Updated settings", time: "2h ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b border-dashed border-muted-foreground/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <div>
                      <WireframeText variant="body">[{activity.user}]</WireframeText>
                      <WireframeText variant="caption">[{activity.action}]</WireframeText>
                    </div>
                  </div>
                  <WireframeText variant="caption">[{activity.time}]</WireframeText>
                </div>
              ))}
            </div>
          </WireframeBox>

          <WireframeBox label="Usage Metrics">
            <div className="space-y-4">
              {[
                { name: "Host Quota", used: 142, max: 200 },
                { name: "User Licenses", used: 24, max: 50 },
                { name: "Storage Used", used: 45, max: 100 },
              ].map((metric, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[{metric.name}]</WireframeText>
                    <WireframeText variant="caption">[{metric.used}/{metric.max}]</WireframeText>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/50" 
                      style={{ width: `${(metric.used / metric.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </WireframeBox>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WireframeChart label="User Activity Trend" type="line" />
          <WireframeChart label="Resource Usage" type="area" />
        </div>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeOrgDashboard;
