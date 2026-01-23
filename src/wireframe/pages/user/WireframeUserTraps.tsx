import { WireframeBox, WireframeText, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserTraps = () => {
  return (
    <WireframeDashboardLayout role="user" title="Traps">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[SNMP Traps]</WireframeText>
          <WireframeText variant="body">[Real-time trap monitoring]</WireframeText>
        </div>

        {/* Category Tabs */}
        <WireframeBox label="Category Filter Tabs">
          <div className="flex gap-2">
            {["All", "SNMP", "Syslog", "Agent", "Custom"].map((cat, i) => (
              <WireframeBox key={i} className={`px-4 py-2 ${i === 0 ? "bg-primary/20" : ""}`}>
                <WireframeText variant="caption">[{cat}]</WireframeText>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* Traps List */}
        <WireframeBox label="Traps List">
          <div className="space-y-3">
            {[
              { category: "SNMP", source: "switch-core-01", message: "Interface down", severity: "critical", time: "2m ago" },
              { category: "Syslog", source: "firewall-01", message: "Connection rejected", severity: "warning", time: "5m ago" },
              { category: "Agent", source: "web-server-01", message: "Service restart", severity: "info", time: "12m ago" },
              { category: "SNMP", source: "router-edge", message: "High latency", severity: "high", time: "15m ago" },
              { category: "Custom", source: "app-monitor", message: "Deployment complete", severity: "success", time: "20m ago" },
            ].map((trap, i) => (
              <WireframeBox key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                      <span className="text-xs">📡</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <WireframeBadge label={trap.category} variant="default" />
                        <WireframeText variant="body">[{trap.source}]</WireframeText>
                      </div>
                      <WireframeText variant="h3" className="mt-1">[{trap.message}]</WireframeText>
                    </div>
                  </div>
                  <div className="text-right">
                    <WireframeBadge label={trap.severity} variant={trap.severity as any} />
                    <WireframeText variant="caption" className="block mt-1">[{trap.time}]</WireframeText>
                  </div>
                </div>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserTraps;
