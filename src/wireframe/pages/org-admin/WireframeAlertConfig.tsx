import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeAlertConfig = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Alert Configuration">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Alert Configuration]</WireframeText>
          <WireframeText variant="body">[Configure alert thresholds and notification channels]</WireframeText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Thresholds */}
          <WireframeBox label="Alert Thresholds">
            <div className="space-y-4">
              {[
                { name: "CPU Usage", value: "90%" },
                { name: "Memory Usage", value: "85%" },
                { name: "Disk Usage", value: "80%" },
              ].map((threshold, i) => (
                <div key={i} className="space-y-2">
                  <WireframeText variant="caption">[{threshold.name}]</WireframeText>
                  <div className="flex gap-2">
                    <WireframeInput placeholder={threshold.value} className="flex-1" />
                    <WireframeText variant="caption" className="self-center">[%]</WireframeText>
                  </div>
                </div>
              ))}
              <WireframeButton label="Save Thresholds" variant="primary" className="w-full" />
            </div>
          </WireframeBox>

          {/* Notification Channels */}
          <WireframeBox label="Notification Channels">
            <div className="space-y-3">
              {[
                { name: "Email Notifications", enabled: true },
                { name: "SMS Notifications", enabled: true },
                { name: "Webhook", enabled: false },
                { name: "Slack", enabled: true },
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                  <WireframeText variant="body">[{channel.name}]</WireframeText>
                  <div className="w-12 h-6 border-2 border-dashed border-muted-foreground/30 rounded-full relative">
                    <div className={`w-5 h-5 rounded-full absolute top-0.5 ${channel.enabled ? "right-0.5 bg-primary/50" : "left-0.5 bg-muted"}`} />
                  </div>
                </div>
              ))}
            </div>
          </WireframeBox>
        </div>

        {/* Escalation Policies */}
        <WireframeBox label="Escalation Policies">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <WireframeText variant="h3">[Default Escalation Policy]</WireframeText>
              <WireframeButton label="Edit" variant="outline" size="sm" />
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-dashed border-primary/50">
              <WireframeText variant="caption">[Step 1: Notify on-call engineer (0 min)]</WireframeText>
              <WireframeText variant="caption">[Step 2: Escalate to team lead (15 min)]</WireframeText>
              <WireframeText variant="caption">[Step 3: Alert manager (30 min)]</WireframeText>
            </div>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeAlertConfig;
