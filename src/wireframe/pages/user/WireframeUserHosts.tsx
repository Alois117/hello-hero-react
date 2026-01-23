import { WireframeBox, WireframeText, WireframeButton, WireframeInput, WireframeCard, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserHosts = () => {
  return (
    <WireframeDashboardLayout role="user" title="Hosts">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[Hosts]</WireframeText>
            <WireframeText variant="body">[142 hosts monitored]</WireframeText>
          </div>
          <WireframeButton label="Add Host" variant="primary" />
        </div>

        {/* Filters */}
        <WireframeBox label="Host Filters">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <WireframeInput placeholder="Search hosts..." type="search" />
            </div>
            <div className="flex gap-2">
              <WireframeButton label="All" variant="primary" size="sm" />
              <WireframeButton label="Web Servers" variant="outline" size="sm" />
              <WireframeButton label="Databases" variant="outline" size="sm" />
              <WireframeButton label="API" variant="outline" size="sm" />
            </div>
          </div>
        </WireframeBox>

        {/* Hosts Grid */}
        <WireframeBox label="Hosts Grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "web-server-01", status: "up", cpu: 75, mem: 62, group: "Web" },
              { name: "web-server-02", status: "up", cpu: 45, mem: 58, group: "Web" },
              { name: "db-primary", status: "warning", cpu: 92, mem: 88, group: "Database" },
              { name: "db-replica-01", status: "up", cpu: 35, mem: 42, group: "Database" },
              { name: "api-gateway", status: "critical", cpu: 98, mem: 95, group: "API" },
              { name: "cache-redis", status: "up", cpu: 28, mem: 65, group: "Cache" },
            ].map((host, i) => (
              <WireframeBox key={i} className="p-4 space-y-3 cursor-pointer hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <WireframeText variant="h3">[{host.name}]</WireframeText>
                  <WireframeBadge 
                    label={host.status} 
                    variant={host.status === "up" ? "success" : host.status === "warning" ? "warning" : "critical"} 
                  />
                </div>
                <WireframeBadge label={host.group} variant="info" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <WireframeText variant="caption">[CPU]</WireframeText>
                    <WireframeText variant="body">[{host.cpu}%]</WireframeText>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/50" 
                      style={{ width: `${host.cpu}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <WireframeText variant="caption">[Memory]</WireframeText>
                    <WireframeText variant="body">[{host.mem}%]</WireframeText>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary/50" 
                      style={{ width: `${host.mem}%` }}
                    />
                  </div>
                </div>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* Host Detail Preview */}
        <WireframeBox label="Host Detail Page Preview (Navigates on click)" dashed>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <WireframeCard title="CPU Usage" value="[75%]" icon="📊" />
            <WireframeCard title="Memory" value="[62%]" icon="💾" />
            <WireframeCard title="Disk" value="[45%]" icon="💿" />
          </div>
          <div className="mt-4 space-y-2">
            <WireframeText variant="label">[Tabs: Overview | Live Metrics | Trigger History | AI Analysis]</WireframeText>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserHosts;
