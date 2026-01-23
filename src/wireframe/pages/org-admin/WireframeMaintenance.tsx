import { WireframeBox, WireframeText, WireframeButton, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeMaintenance = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Maintenance Windows">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[Maintenance Windows]</WireframeText>
            <WireframeText variant="body">[Schedule and manage maintenance periods]</WireframeText>
          </div>
          <WireframeButton label="New Window" variant="primary" />
        </div>

        {/* Maintenance Windows List */}
        <WireframeBox label="Scheduled Maintenance">
          <div className="space-y-4">
            {[
              { name: "Database Upgrade", start: "2024-01-25 02:00", end: "04:00", status: "scheduled" },
              { name: "Network Maintenance", start: "2024-01-28 01:00", end: "03:00", status: "scheduled" },
              { name: "Security Patching", start: "2024-02-01 03:00", end: "05:00", status: "pending" },
            ].map((window, i) => (
              <WireframeBox key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔧</span>
                    </div>
                    <div>
                      <WireframeText variant="h3">[{window.name}]</WireframeText>
                      <WireframeText variant="caption">[{window.start} - {window.end}]</WireframeText>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <WireframeBadge label={window.status} variant="info" />
                    <WireframeButton label="Edit" variant="outline" size="sm" />
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

export default WireframeMaintenance;
