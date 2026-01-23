import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserSettings = () => {
  return (
    <WireframeDashboardLayout role="user" title="Settings">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Settings]</WireframeText>
          <WireframeText variant="body">[Manage your account preferences]</WireframeText>
        </div>

        {/* Settings Tabs */}
        <WireframeBox label="Settings Tabs">
          <div className="flex gap-2 border-b-2 border-dashed border-muted-foreground/20 pb-2">
            {["Profile", "Notifications", "Appearance", "Security", "API Keys"].map((tab, i) => (
              <WireframeBox key={i} className={`px-4 py-2 ${i === 0 ? "bg-primary/20" : ""}`}>
                <WireframeText variant="caption">[{tab}]</WireframeText>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>

        {/* Profile Tab Content */}
        <WireframeBox label="Profile Settings">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <WireframeButton label="Change Avatar" variant="outline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <WireframeInput label="Full Name" placeholder="John Doe" />
              <WireframeInput label="Email" placeholder="john@example.com" type="email" />
              <WireframeInput label="Phone" placeholder="+1 234 567 890" />
              <WireframeInput label="Timezone" placeholder="UTC-5" type="select" />
            </div>
            <WireframeButton label="Save Profile" variant="primary" />
          </div>
        </WireframeBox>

        {/* Notifications Preview */}
        <WireframeBox label="Notifications Settings" dashed>
          <div className="space-y-3">
            {["Email Alerts", "SMS Alerts", "Push Notifications", "Weekly Digest"].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                <WireframeText variant="body">[{setting}]</WireframeText>
                <div className="w-12 h-6 border-2 border-dashed border-muted-foreground/30 rounded-full relative">
                  <div className={`w-5 h-5 rounded-full absolute top-0.5 ${i < 2 ? "right-0.5 bg-primary/50" : "left-0.5 bg-muted"}`} />
                </div>
              </div>
            ))}
          </div>
        </WireframeBox>

        {/* Appearance Preview */}
        <WireframeBox label="Appearance Settings" dashed>
          <div className="flex items-center gap-4">
            <WireframeText variant="body">[Theme:]</WireframeText>
            <WireframeBox className="px-4 py-2 bg-primary/20">
              <WireframeText variant="caption">[Dark]</WireframeText>
            </WireframeBox>
            <WireframeBox className="px-4 py-2">
              <WireframeText variant="caption">[Light]</WireframeText>
            </WireframeBox>
            <WireframeBox className="px-4 py-2">
              <WireframeText variant="caption">[System]</WireframeText>
            </WireframeBox>
          </div>
        </WireframeBox>

        {/* Security Preview */}
        <WireframeBox label="Security Settings" dashed>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <WireframeText variant="body">[Two-Factor Authentication]</WireframeText>
              <WireframeButton label="Enable 2FA" variant="outline" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <WireframeText variant="body">[Change Password]</WireframeText>
              <WireframeButton label="Update" variant="outline" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <WireframeText variant="body">[Active Sessions]</WireframeText>
              <WireframeButton label="Manage" variant="outline" size="sm" />
            </div>
          </div>
        </WireframeBox>

        {/* API Keys Preview */}
        <WireframeBox label="API Keys Settings" dashed>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <WireframeText variant="body">[Production Key]</WireframeText>
                <WireframeText variant="caption">[sk_live_****...****]</WireframeText>
              </div>
              <div className="flex gap-2">
                <WireframeButton label="Copy" variant="ghost" size="sm" />
                <WireframeButton label="Regenerate" variant="outline" size="sm" />
              </div>
            </div>
            <WireframeButton label="Create New API Key" variant="primary" />
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserSettings;
