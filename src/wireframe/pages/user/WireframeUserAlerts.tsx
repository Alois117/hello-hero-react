import { WireframeBox, WireframeText, WireframeButton, WireframeInput, WireframeTable, WireframeBadge, WireframeCard } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserAlerts = () => {
  return (
    <WireframeDashboardLayout role="user" title="Alerts">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[Alerts]</WireframeText>
            <WireframeText variant="body">[Monitor and manage system alerts]</WireframeText>
          </div>
          <WireframeButton label="Acknowledge All" variant="outline" />
        </div>

        {/* Summary Cards */}
        <WireframeBox label="Alert Summary Cards">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WireframeCard title="Critical" value="[5]" className="border-destructive/30" />
            <WireframeCard title="High" value="[12]" className="border-orange-500/30" />
            <WireframeCard title="Warning" value="[28]" className="border-yellow-500/30" />
            <WireframeCard title="Acknowledged" value="[45]" className="border-green-500/30" />
          </div>
        </WireframeBox>

        {/* Filters Section */}
        <WireframeBox label="Alert Filters">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <WireframeInput placeholder="Search alerts..." type="search" />
            </div>
            <WireframeInput placeholder="Severity" type="select" className="w-40" />
            <WireframeInput placeholder="Host" type="select" className="w-40" />
            <WireframeInput placeholder="Tags" type="select" className="w-40" />
            <WireframeInput placeholder="Time Range" type="select" className="w-40" />
            <WireframeButton label="Apply Filters" variant="secondary" />
            <WireframeButton label="Clear" variant="ghost" />
          </div>
        </WireframeBox>

        {/* Alerts Table */}
        <WireframeTable
          label="Alerts Table (5 per page)"
          columns={["Severity", "Host", "Message", "Category", "Time", "Actions"]}
          rows={5}
        />

        {/* Alert Detail Drawer Preview */}
        <WireframeBox label="Alert Detail Drawer (Opens on row click)" dashed>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <WireframeBox label="Alert Metadata">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Alert ID]</WireframeText>
                    <WireframeText variant="body">[ALT-12345]</WireframeText>
                  </div>
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Host]</WireframeText>
                    <WireframeText variant="body">[web-server-01]</WireframeText>
                  </div>
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Severity]</WireframeText>
                    <WireframeBadge label="Critical" variant="critical" />
                  </div>
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Created]</WireframeText>
                    <WireframeText variant="body">[2024-01-15 14:32:00]</WireframeText>
                  </div>
                </div>
              </WireframeBox>

              <WireframeBox label="Throttle/Dedupe Status">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Occurrences]</WireframeText>
                    <WireframeText variant="body">[15]</WireframeText>
                  </div>
                  <div className="flex justify-between">
                    <WireframeText variant="caption">[Throttled]</WireframeText>
                    <WireframeBadge label="Yes" variant="warning" />
                  </div>
                </div>
              </WireframeBox>
            </div>

            <WireframeBox label="AI Insights">
              <div className="space-y-3">
                <WireframeText variant="h3">[Root Cause Analysis]</WireframeText>
                <WireframeText variant="body">[High probability: Memory leak in application process]</WireframeText>
                <WireframeText variant="caption">[Confidence: 87%]</WireframeText>
                <div className="pt-2">
                  <WireframeText variant="label">[Recommended Actions]</WireframeText>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs font-mono text-muted-foreground">• [Restart application service]</li>
                    <li className="text-xs font-mono text-muted-foreground">• [Check for recent deployments]</li>
                    <li className="text-xs font-mono text-muted-foreground">• [Review heap dump]</li>
                  </ul>
                </div>
              </div>
            </WireframeBox>
          </div>

          <div className="flex gap-2 mt-4">
            <WireframeButton label="Acknowledge" variant="primary" />
            <WireframeButton label="Escalate" variant="secondary" />
            <WireframeButton label="View Host" variant="outline" />
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserAlerts;
