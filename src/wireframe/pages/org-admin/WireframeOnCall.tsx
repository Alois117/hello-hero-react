import { WireframeBox, WireframeText, WireframeButton, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeOnCall = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="On-Call Schedules">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[On-Call Schedules]</WireframeText>
            <WireframeText variant="body">[Manage on-call rotations and escalations]</WireframeText>
          </div>
          <WireframeButton label="New Schedule" variant="primary" />
        </div>

        {/* Schedules List */}
        <WireframeBox label="On-Call Schedules">
          <div className="space-y-4">
            {[
              { name: "Primary On-Call", team: "Platform Team", members: 5, active: true },
              { name: "Secondary On-Call", team: "Platform Team", members: 4, active: true },
              { name: "Database On-Call", team: "DBA Team", members: 3, active: false },
            ].map((schedule, i) => (
              <WireframeBox key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <WireframeText variant="h3">[{schedule.name}]</WireframeText>
                      <div className="flex items-center gap-2 mt-1">
                        <WireframeText variant="caption">[{schedule.team}]</WireframeText>
                        <WireframeText variant="caption">[{schedule.members} members]</WireframeText>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <WireframeBadge label={schedule.active ? "Active" : "Inactive"} variant={schedule.active ? "success" : "default"} />
                    <WireframeButton label="Edit" variant="outline" size="sm" />
                  </div>
                </div>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* Current On-Call */}
        <WireframeBox label="Current On-Call">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <WireframeText variant="h3">[John Doe]</WireframeText>
              <WireframeText variant="caption">[On-call until: Tomorrow 9:00 AM]</WireframeText>
              <WireframeText variant="caption">[Contact: +1 234 567 890]</WireframeText>
            </div>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeOnCall;
