import { WireframeBox, WireframeText, WireframeButton, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserReports = () => {
  return (
    <WireframeDashboardLayout role="user" title="Reports">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Reports]</WireframeText>
          <WireframeText variant="body">[System health and performance reports]</WireframeText>
        </div>

        {/* Period Tabs */}
        <WireframeBox label="Report Period Tabs">
          <div className="flex gap-2">
            {["Daily", "Weekly", "Monthly"].map((period, i) => (
              <WireframeBox key={i} className={`px-4 py-2 ${i === 0 ? "bg-primary/20" : ""}`}>
                <WireframeText variant="caption">[{period}]</WireframeText>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* Reports List */}
        <WireframeBox label="Reports List">
          <div className="space-y-3">
            {[
              { name: "System Health Report", period: "Daily", generated: "Today 08:00", type: "Health" },
              { name: "Alert Summary", period: "Daily", generated: "Today 08:00", type: "Alerts" },
              { name: "Performance Metrics", period: "Weekly", generated: "Mon 00:00", type: "Performance" },
              { name: "Capacity Planning", period: "Monthly", generated: "Jan 1", type: "Capacity" },
            ].map((report, i) => (
              <WireframeBox key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <div>
                      <WireframeText variant="h3">[{report.name}]</WireframeText>
                      <div className="flex items-center gap-2 mt-1">
                        <WireframeBadge label={report.period} variant="default" />
                        <WireframeText variant="caption">[Generated: {report.generated}]</WireframeText>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <WireframeButton label="PDF" variant="outline" size="sm" />
                    <WireframeButton label="CSV" variant="outline" size="sm" />
                  </div>
                </div>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* AI Summary */}
        <WireframeBox label="AI Summary Panel" className="bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="space-y-2">
              <WireframeText variant="h3">[AI-Generated Summary]</WireframeText>
              <WireframeText variant="body">[Overall system health improved by 5% this week. Key highlights:]</WireframeText>
              <ul className="space-y-1">
                <li className="text-xs font-mono text-muted-foreground">• [Uptime: 99.9%]</li>
                <li className="text-xs font-mono text-muted-foreground">• [MTTR: 12 minutes]</li>
                <li className="text-xs font-mono text-muted-foreground">• [Alerts resolved: 156]</li>
              </ul>
            </div>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserReports;
