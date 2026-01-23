import { WireframeBox, WireframeText, WireframeCard } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUsageMeters = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Usage Meters">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Usage Meters]</WireframeText>
          <WireframeText variant="body">[Monitor resource usage and quotas]</WireframeText>
        </div>

        {/* Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Hosts", current: 142, max: 200, unit: "hosts" },
            { name: "Users", current: 24, max: 50, unit: "users" },
            { name: "Storage", current: 45, max: 100, unit: "GB" },
          ].map((meter, i) => (
            <WireframeBox key={i} label={meter.name}>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <WireframeText variant="caption">[Usage]</WireframeText>
                  <WireframeText variant="body">[{meter.current}/{meter.max} {meter.unit}]</WireframeText>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/50 to-primary" 
                    style={{ width: `${(meter.current / meter.max) * 100}%` }}
                  />
                </div>
                <WireframeText variant="caption">[{((meter.current / meter.max) * 100).toFixed(0)}% utilized]</WireframeText>
              </div>
            </WireframeBox>
          ))}
        </div>

        {/* Additional Metrics */}
        <WireframeBox label="Additional Usage Metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WireframeCard title="API Calls" value="[125K]" subtitle="[This month]" />
            <WireframeCard title="Data Ingested" value="[2.5 TB]" subtitle="[This month]" />
            <WireframeCard title="Alerts Processed" value="[15,420]" subtitle="[This month]" />
            <WireframeCard title="Reports Generated" value="[342]" subtitle="[This month]" />
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUsageMeters;
