import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder, WireframeDivider } from "../../components/WireframePrimitives";
import { WireframeHeader, WireframeSidebar, WireframePage, WireframeGrid, WireframeSection } from "../../components/WireframeLayout";
import { WireframeKPICard, WireframeChart, WireframeTable, WireframeListItem, WireframeFormField, WireframeProgressBar } from "../../components/WireframeWidgets";

interface ScreenProps {
  onNavigate: (screen: string) => void;
}

const orgAdminSidebarItems = [
  { label: "Dashboard", screen: "org-admin-dashboard", icon: true },
  { label: "User Management", screen: "org-admin-users", icon: true },
  { label: "Billing", screen: "org-admin-billing", icon: true },
  { label: "Usage Meters", screen: "org-admin-usage", icon: true },
  { label: "Alert Config", screen: "org-admin-alerts", icon: true },
  { label: "On-Call Schedules", screen: "org-admin-oncall", icon: true },
  { label: "Zabbix Hosts", screen: "org-admin-zabbix", icon: true },
  { label: "Maintenance", screen: "org-admin-maintenance", icon: true },
  { label: "AI Settings", screen: "org-admin-ai", icon: true },
];

const OrgAdminLayout = ({ 
  children, 
  onNavigate, 
  activeScreen 
}: { 
  children: React.ReactNode; 
  onNavigate: (screen: string) => void;
  activeScreen: string;
}) => (
  <div className="min-h-screen flex flex-col bg-background">
    <WireframeHeader title="JARVIS" onNavigate={onNavigate} />
    <div className="flex flex-1">
      <WireframeSidebar
        items={orgAdminSidebarItems.map((item) => ({
          ...item,
          active: item.screen === activeScreen,
        }))}
        onNavigate={onNavigate}
        title="ORG ADMIN"
      />
      <WireframePage>{children}</WireframePage>
    </div>
  </div>
);

export const OrgAdminDashboardWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-dashboard">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Organization Admin</WireframeText>
        <WireframeText variant="body" className="block mt-1">Manage users, billing, and organization settings</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Users" value="24" change="+3" changeType="positive" />
        <WireframeKPICard title="Active Hosts" value="142" change="+5" changeType="positive" />
        <WireframeKPICard title="Monthly Cost" value="$2,450" change="+12%" changeType="negative" />
        <WireframeKPICard title="Active Alerts" value="8" change="-4" changeType="positive" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Recent User Activity</WireframeText>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <WireframeListItem
                key={i}
                title={`user${i}@company.com`}
                subtitle={`Last login: ${i} hours ago`}
              />
            ))}
          </div>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Usage Metrics</WireframeText>
          <div className="space-y-4">
            <WireframeProgressBar label="Host Quota" value={142} max={200} />
            <WireframeProgressBar label="User Licenses" value={24} max={50} />
            <WireframeProgressBar label="Storage Used" value={45} max={100} />
          </div>
        </WireframeBox>
      </WireframeGrid>
    </div>
  </OrgAdminLayout>
);

export const OrgAdminUsersWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-users">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">User Management</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage organization users and permissions</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Invite User</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Users" value="24" />
        <WireframeKPICard title="Admins" value="3" />
        <WireframeKPICard title="Active" value="22" />
        <WireframeKPICard title="Pending" value="2" />
      </WireframeGrid>

      <WireframeTable
        title="Organization Users"
        columns={["User", "Email", "Role", "Status", "Last Active", "Actions"]}
        rows={8}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminBillingWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-billing">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Billing</WireframeText>
        <WireframeText variant="body" className="block mt-1">Manage subscription and payment details</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Current Plan" value="Professional" />
        <WireframeKPICard title="Monthly Cost" value="$2,450" />
        <WireframeKPICard title="Next Billing" value="Dec 15" />
        <WireframeKPICard title="Payment Status" value="Active" changeType="positive" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Current Plan</WireframeText>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <WireframeText variant="h2" className="block">Professional</WireframeText>
            <WireframeText variant="body" className="block mt-1">500 hosts • 30-day retention • AI insights</WireframeText>
          </div>
          <WireframeBox variant="button" className="w-full py-2">
            <WireframeText variant="caption">Upgrade Plan</WireframeText>
          </WireframeBox>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Payment Method</WireframeText>
          <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="w-12 h-8 bg-muted/50 rounded" />
            <div>
              <WireframeText variant="body" className="block">•••• •••• •••• 4242</WireframeText>
              <WireframeText variant="caption" className="block">Expires 12/25</WireframeText>
            </div>
          </div>
          <WireframeBox variant="button" className="w-full py-2">
            <WireframeText variant="caption">Update Payment Method</WireframeText>
          </WireframeBox>
        </WireframeBox>
      </WireframeGrid>

      <WireframeTable
        title="Billing History"
        columns={["Invoice", "Date", "Amount", "Status", "Actions"]}
        rows={6}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminUsageWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-usage">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Usage Meters</WireframeText>
        <WireframeText variant="body" className="block mt-1">Monitor resource consumption and quotas</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Hosts Used" value="142/200" />
        <WireframeKPICard title="API Calls" value="1.2M/2M" />
        <WireframeKPICard title="Storage" value="45/100 GB" />
        <WireframeKPICard title="Alerts Sent" value="2.3K/5K" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Usage Over Time" subtitle="Last 30 days" type="area" />
        <WireframeChart title="Resource Distribution" subtitle="By category" type="pie" />
      </WireframeGrid>

      <WireframeBox variant="card" className="p-6 space-y-4">
        <WireframeText variant="h3" className="block">Resource Quotas</WireframeText>
        <div className="space-y-4">
          <WireframeProgressBar label="Monitored Hosts" value={142} max={200} />
          <WireframeProgressBar label="API Calls (Monthly)" value={1200000} max={2000000} />
          <WireframeProgressBar label="Storage" value={45} max={100} />
          <WireframeProgressBar label="Alert Notifications" value={2300} max={5000} />
        </div>
      </WireframeBox>
    </div>
  </OrgAdminLayout>
);

export const OrgAdminAlertsWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-alerts">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Alert Configuration</WireframeText>
          <WireframeText variant="body" className="block mt-1">Configure alert rules and notification channels</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Rule</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Active Rules" value="34" />
        <WireframeKPICard title="Channels" value="5" />
        <WireframeKPICard title="Triggered Today" value="12" />
        <WireframeKPICard title="Suppressed" value="3" />
      </WireframeGrid>

      <WireframeTable
        title="Alert Rules"
        columns={["Rule Name", "Condition", "Severity", "Channels", "Status", "Actions"]}
        rows={8}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminOnCallWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-oncall">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">On-Call Schedules</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage team rotations and escalation policies</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Schedule</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Current On-Call</WireframeText>
          <div className="space-y-3">
            {["Primary", "Secondary", "Escalation"].map((level, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                  <div>
                    <WireframeText variant="body" className="block">User Name</WireframeText>
                    <WireframeText variant="caption" className="block">{level}</WireframeText>
                  </div>
                </div>
                <WireframeText variant="caption">Until Dec 8, 9am</WireframeText>
              </div>
            ))}
          </div>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Weekly Schedule</WireframeText>
          <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
            <WireframeText variant="caption">Calendar View</WireframeText>
          </div>
        </WireframeBox>
      </WireframeGrid>

      <WireframeTable
        title="Schedules"
        columns={["Name", "Team", "Rotation", "Members", "Status", "Actions"]}
        rows={5}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminZabbixWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-zabbix">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Zabbix Hosts</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage Zabbix integration and host mappings</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Sync Hosts</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Connected Hosts" value="142" />
        <WireframeKPICard title="Last Sync" value="5m ago" />
        <WireframeKPICard title="Sync Status" value="Healthy" changeType="positive" />
        <WireframeKPICard title="Pending" value="0" />
      </WireframeGrid>

      <WireframeTable
        title="Host Mappings"
        columns={["Zabbix Host", "JARVIS Host", "Group", "Templates", "Status", "Actions"]}
        rows={10}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminMaintenanceWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-maintenance">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Maintenance Windows</WireframeText>
          <WireframeText variant="body" className="block mt-1">Schedule maintenance periods to suppress alerts</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Window</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Active" value="2" />
        <WireframeKPICard title="Scheduled" value="5" />
        <WireframeKPICard title="This Week" value="3" />
        <WireframeKPICard title="Hosts Affected" value="45" />
      </WireframeGrid>

      <WireframeTable
        title="Maintenance Windows"
        columns={["Name", "Start", "End", "Hosts", "Status", "Actions"]}
        rows={6}
      />
    </div>
  </OrgAdminLayout>
);

export const OrgAdminAIWireframe = ({ onNavigate }: ScreenProps) => (
  <OrgAdminLayout onNavigate={onNavigate} activeScreen="org-admin-ai">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">AI Settings</WireframeText>
        <WireframeText variant="body" className="block mt-1">Configure AI-powered features and models</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="AI Insights" value="Enabled" changeType="positive" />
        <WireframeKPICard title="Predictions" value="234" />
        <WireframeKPICard title="Accuracy" value="94%" />
        <WireframeKPICard title="Cost Savings" value="$4.2K" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">AI Features</WireframeText>
          {["Anomaly Detection", "Predictive Analytics", "Auto-Remediation", "Smart Alerts"].map((feature, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <WireframeText variant="body">{feature}</WireframeText>
              <WireframeBox variant="button" className="w-12 h-6 rounded-full bg-primary/30" />
            </div>
          ))}
        </WireframeBox>

        <WireframeChart title="AI Model Performance" subtitle="Last 30 days" type="line" />
      </WireframeGrid>
    </div>
  </OrgAdminLayout>
);
