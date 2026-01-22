import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder, WireframeDivider } from "../../components/WireframePrimitives";
import { WireframeGrid, WireframeSection } from "../../components/WireframeLayout";
import { WireframeKPICard, WireframeChart, WireframeTable, WireframeListItem, WireframeFormField, WireframeProgressBar } from "../../components/WireframeWidgets";
import { UserDashboardLayout } from "./UserDashboardWireframe";

interface ScreenProps {
  onNavigate: (screen: string) => void;
}

export const UserAlertsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-alerts">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Alerts</WireframeText>
          <WireframeText variant="body" className="block mt-1">Monitor and manage infrastructure alerts</WireframeText>
        </div>
        <div className="flex gap-2">
          <WireframeBox variant="button" className="px-4 py-2">
            <WireframeText variant="caption">Export</WireframeText>
          </WireframeBox>
          <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
            <WireframeText variant="caption">Acknowledge All</WireframeText>
          </WireframeBox>
        </div>
      </div>

      {/* Alert Stats */}
      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Alerts" value="156" change="+12" changeType="negative" />
        <WireframeKPICard title="Critical" value="8" change="-2" changeType="positive" />
        <WireframeKPICard title="Warning" value="34" change="+5" changeType="negative" />
        <WireframeKPICard title="Info" value="114" change="+9" changeType="negative" />
      </WireframeGrid>

      {/* Filters */}
      <WireframeBox variant="card" className="p-4">
        <div className="flex flex-wrap gap-4">
          <WireframeBox variant="input" className="w-64 h-10 px-3 flex items-center">
            <WireframeText variant="caption">Search alerts...</WireframeText>
          </WireframeBox>
          <WireframeBox variant="input" className="w-40 h-10 px-3 flex items-center justify-between">
            <WireframeText variant="caption">Severity</WireframeText>
            <div className="w-4 h-4 bg-muted/50" />
          </WireframeBox>
          <WireframeBox variant="input" className="w-40 h-10 px-3 flex items-center justify-between">
            <WireframeText variant="caption">Status</WireframeText>
            <div className="w-4 h-4 bg-muted/50" />
          </WireframeBox>
          <WireframeBox variant="input" className="w-40 h-10 px-3 flex items-center justify-between">
            <WireframeText variant="caption">Host</WireframeText>
            <div className="w-4 h-4 bg-muted/50" />
          </WireframeBox>
          <WireframeBox variant="input" className="w-40 h-10 px-3 flex items-center justify-between">
            <WireframeText variant="caption">Time Range</WireframeText>
            <div className="w-4 h-4 bg-muted/50" />
          </WireframeBox>
        </div>
      </WireframeBox>

      {/* Alerts Table */}
      <WireframeTable
        title="Active Alerts"
        columns={["Severity", "Host", "Problem", "Duration", "Status", "Actions"]}
        rows={8}
        onRowClick={() => {}}
      />
    </div>
  </UserDashboardLayout>
);

export const UserHostsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-hosts">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Hosts</WireframeText>
          <WireframeText variant="body" className="block mt-1">View and manage monitored hosts</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Add Host</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Hosts" value="142" />
        <WireframeKPICard title="Online" value="138" change="97%" changeType="positive" />
        <WireframeKPICard title="Offline" value="4" change="3%" changeType="negative" />
        <WireframeKPICard title="Maintenance" value="2" />
      </WireframeGrid>

      <WireframeTable
        title="All Hosts"
        columns={["Status", "Hostname", "IP Address", "Group", "Uptime", "Alerts", "Actions"]}
        rows={10}
        onRowClick={() => onNavigate("user-host-detail")}
      />
    </div>
  </UserDashboardLayout>
);

export const UserHostDetailWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-hosts">
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <motion.button
          className="text-muted-foreground hover:text-foreground"
          whileHover={{ x: -4 }}
          onClick={() => onNavigate("user-hosts")}
        >
          ← Back
        </motion.button>
        <div>
          <WireframeText variant="h1" className="block">prod-web-01</WireframeText>
          <WireframeText variant="body" className="block mt-1">192.168.1.100 • Linux Server</WireframeText>
        </div>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Status" value="Online" changeType="positive" />
        <WireframeKPICard title="Uptime" value="45d 12h" />
        <WireframeKPICard title="Active Alerts" value="3" />
        <WireframeKPICard title="Last Check" value="2s ago" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="CPU Usage" subtitle="Last 24 hours" type="area" />
        <WireframeChart title="Memory Usage" subtitle="Last 24 hours" type="area" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Network Traffic" subtitle="In/Out MB/s" type="line" />
        <WireframeChart title="Disk I/O" subtitle="Read/Write ops" type="bar" />
      </WireframeGrid>

      <WireframeBox variant="card" className="p-6">
        <WireframeText variant="h3" className="block mb-4">Recent Alerts</WireframeText>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <WireframeListItem
              key={i}
              title={`Alert ${i}`}
              subtitle="Description of the alert"
              badge={{ text: "Warning", variant: "warning" }}
            />
          ))}
        </div>
      </WireframeBox>
    </div>
  </UserDashboardLayout>
);

export const UserTrapsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-traps">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">SNMP Traps</WireframeText>
        <WireframeText variant="body" className="block mt-1">View and manage SNMP trap events</WireframeText>
      </div>

      <WireframeGrid cols={3}>
        <WireframeKPICard title="Total Traps" value="1,245" />
        <WireframeKPICard title="Today" value="89" change="+12" changeType="negative" />
        <WireframeKPICard title="Unprocessed" value="23" />
      </WireframeGrid>

      <WireframeTable
        title="Recent Traps"
        columns={["Time", "Source", "OID", "Type", "Value", "Status"]}
        rows={10}
      />
    </div>
  </UserDashboardLayout>
);

export const UserInsightsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-insights">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">AI Insights</WireframeText>
        <WireframeText variant="body" className="block mt-1">AI-powered analysis and recommendations</WireframeText>
      </div>

      <WireframeGrid cols={3}>
        <WireframeKPICard title="Active Insights" value="12" />
        <WireframeKPICard title="Applied" value="45" />
        <WireframeKPICard title="Cost Savings" value="$2,340" changeType="positive" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Anomaly Detection" subtitle="Last 7 days" type="line" />
        <WireframeChart title="Prediction Accuracy" subtitle="Model performance" type="bar" />
      </WireframeGrid>

      <WireframeSection title="Active Recommendations">
        <div className="space-y-3">
          {[
            { title: "Scale Database Cluster", subtitle: "Add 2 read replicas for improved performance", badge: "High Impact" },
            { title: "Optimize Memory Usage", subtitle: "Reduce memory allocation on idle services", badge: "Medium Impact" },
            { title: "Update SSL Certificates", subtitle: "3 certificates expiring in 30 days", badge: "Maintenance" },
          ].map((item, i) => (
            <WireframeBox key={i} variant="card" className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <WireframeText variant="h3" className="block">{item.title}</WireframeText>
                  <WireframeText variant="body" className="block mt-1">{item.subtitle}</WireframeText>
                </div>
                <div className="flex gap-2">
                  <WireframeBox variant="button" className="px-3 py-1">
                    <WireframeText variant="caption">Details</WireframeText>
                  </WireframeBox>
                  <WireframeBox variant="button" className="px-3 py-1 bg-primary/20">
                    <WireframeText variant="caption">Apply</WireframeText>
                  </WireframeBox>
                </div>
              </div>
            </WireframeBox>
          ))}
        </div>
      </WireframeSection>
    </div>
  </UserDashboardLayout>
);

export const UserReportsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-reports">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Reports</WireframeText>
          <WireframeText variant="body" className="block mt-1">Generate and view infrastructure reports</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Report</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Reports" value="24" />
        <WireframeKPICard title="Scheduled" value="5" />
        <WireframeKPICard title="This Month" value="8" />
        <WireframeKPICard title="Shared" value="12" />
      </WireframeGrid>

      <WireframeTable
        title="Recent Reports"
        columns={["Name", "Type", "Created", "Schedule", "Status", "Actions"]}
        rows={8}
      />
    </div>
  </UserDashboardLayout>
);

export const UserSettingsWireframe = ({ onNavigate }: ScreenProps) => (
  <UserDashboardLayout onNavigate={onNavigate} activeScreen="user-settings">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Settings</WireframeText>
        <WireframeText variant="body" className="block mt-1">Manage your account preferences</WireframeText>
      </div>

      <WireframeGrid cols={3}>
        <div className="col-span-1">
          <WireframeBox variant="card" className="p-4">
            <nav className="space-y-1">
              {["Profile", "Notifications", "Security", "API Keys", "Integrations", "Appearance"].map((item, i) => (
                <motion.div
                  key={i}
                  className={`px-3 py-2 rounded-md cursor-pointer ${i === 0 ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/30"}`}
                  whileHover={{ x: 4 }}
                >
                  <WireframeText variant="body">{item}</WireframeText>
                </motion.div>
              ))}
            </nav>
          </WireframeBox>
        </div>

        <div className="col-span-2">
          <WireframeBox variant="card" className="p-6 space-y-6">
            <WireframeText variant="h3" className="block">Profile Settings</WireframeText>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30" />
              <WireframeBox variant="button" className="px-4 py-2">
                <WireframeText variant="caption">Change Avatar</WireframeText>
              </WireframeBox>
            </div>
            <WireframeDivider />
            <div className="grid grid-cols-2 gap-4">
              <WireframeFormField label="First Name" />
              <WireframeFormField label="Last Name" />
              <WireframeFormField label="Email" />
              <WireframeFormField label="Phone" />
            </div>
            <WireframeFormField label="Bio" type="textarea" />
            <WireframeFormField label="Timezone" type="select" />
            <div className="flex justify-end gap-3">
              <WireframeBox variant="button" className="px-4 py-2">
                <WireframeText variant="caption">Cancel</WireframeText>
              </WireframeBox>
              <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
                <WireframeText variant="caption">Save Changes</WireframeText>
              </WireframeBox>
            </div>
          </WireframeBox>
        </div>
      </WireframeGrid>
    </div>
  </UserDashboardLayout>
);
