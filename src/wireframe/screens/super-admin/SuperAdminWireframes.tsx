import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder, WireframeDivider } from "../../components/WireframePrimitives";
import { WireframeHeader, WireframeSidebar, WireframePage, WireframeGrid, WireframeSection } from "../../components/WireframeLayout";
import { WireframeKPICard, WireframeChart, WireframeTable, WireframeListItem, WireframeFormField, WireframeProgressBar } from "../../components/WireframeWidgets";

interface ScreenProps {
  onNavigate: (screen: string) => void;
}

const superAdminSidebarItems = [
  { label: "Dashboard", screen: "super-admin-dashboard", icon: true },
  { label: "Organizations", screen: "super-admin-orgs", icon: true },
  { label: "Global Analytics", screen: "super-admin-analytics", icon: true },
  { label: "Security Logs", screen: "super-admin-security", icon: true },
  { label: "Multi-Tenant Billing", screen: "super-admin-billing", icon: true },
  { label: "Disaster Recovery", screen: "super-admin-recovery", icon: true },
  { label: "AI/ML Performance", screen: "super-admin-aiml", icon: true },
  { label: "Feature Flags", screen: "super-admin-features", icon: true },
  { label: "Reseller Portal", screen: "super-admin-reseller", icon: true },
];

const SuperAdminLayout = ({ 
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
        items={superAdminSidebarItems.map((item) => ({
          ...item,
          active: item.screen === activeScreen,
        }))}
        onNavigate={onNavigate}
        title="SUPER ADMIN"
      />
      <WireframePage>{children}</WireframePage>
    </div>
  </div>
);

export const SuperAdminDashboardWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-dashboard">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Super Admin Dashboard</WireframeText>
        <WireframeText variant="body" className="block mt-1">Multi-tenant management and system-wide analytics</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Organizations" value="48" change="+5" changeType="positive" />
        <WireframeKPICard title="Total Users" value="1,234" change="+42" changeType="positive" />
        <WireframeKPICard title="Monthly Revenue" value="$124K" change="+18%" changeType="positive" />
        <WireframeKPICard title="Security Events" value="3" change="-12" changeType="positive" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Revenue Trend" subtitle="Last 12 months" type="area" />
        <WireframeChart title="Organization Growth" subtitle="New signups" type="bar" />
      </WireframeGrid>

      <WireframeGrid cols={3}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">System Health</WireframeText>
          <div className="space-y-3">
            {["API Gateway", "Database Cluster", "Cache Layer", "Message Queue"].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <WireframeText variant="body">{service}</WireframeText>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
            ))}
          </div>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Recent Activity</WireframeText>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <WireframeListItem
                key={i}
                title={`Event ${i}`}
                subtitle="Description"
              />
            ))}
          </div>
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Quick Actions</WireframeText>
          <div className="space-y-2">
            {["Create Organization", "System Backup", "Clear Cache", "View Logs"].map((action, i) => (
              <WireframeBox key={i} variant="button" className="w-full py-2 text-left px-3">
                <WireframeText variant="caption">{action}</WireframeText>
              </WireframeBox>
            ))}
          </div>
        </WireframeBox>
      </WireframeGrid>
    </div>
  </SuperAdminLayout>
);

export const SuperAdminOrgsWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-orgs">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Organizations</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage all tenant organizations</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Organization</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Orgs" value="48" />
        <WireframeKPICard title="Active" value="45" />
        <WireframeKPICard title="Trial" value="8" />
        <WireframeKPICard title="Enterprise" value="12" />
      </WireframeGrid>

      <WireframeTable
        title="All Organizations"
        columns={["Organization", "Plan", "Users", "Hosts", "MRR", "Status", "Actions"]}
        rows={10}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminAnalyticsWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-analytics">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Global Analytics</WireframeText>
        <WireframeText variant="body" className="block mt-1">Platform-wide metrics and insights</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Hosts" value="12.4K" />
        <WireframeKPICard title="Alerts/Day" value="45K" />
        <WireframeKPICard title="API Calls/Day" value="2.3M" />
        <WireframeKPICard title="Avg Response" value="89ms" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Platform Usage" subtitle="Last 30 days" type="area" />
        <WireframeChart title="Alert Distribution" subtitle="By severity" type="pie" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="API Performance" subtitle="Response times" type="line" />
        <WireframeChart title="Geographic Distribution" subtitle="Users by region" type="bar" />
      </WireframeGrid>
    </div>
  </SuperAdminLayout>
);

export const SuperAdminSecurityWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-security">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Security Logs</WireframeText>
        <WireframeText variant="body" className="block mt-1">Audit logs and security events</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Security Events" value="156" />
        <WireframeKPICard title="Failed Logins" value="23" change="-5" changeType="positive" />
        <WireframeKPICard title="Suspicious" value="3" />
        <WireframeKPICard title="Blocked IPs" value="12" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Security Events" subtitle="Last 7 days" type="bar" />
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Recent Threats</WireframeText>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <WireframeListItem
                key={i}
                title={`Threat ${i}`}
                subtitle="Blocked automatically"
                badge={{ text: "Blocked", variant: "success" }}
              />
            ))}
          </div>
        </WireframeBox>
      </WireframeGrid>

      <WireframeTable
        title="Audit Log"
        columns={["Timestamp", "User", "Action", "IP Address", "Status", "Details"]}
        rows={10}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminBillingWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-billing">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">Multi-Tenant Billing</WireframeText>
        <WireframeText variant="body" className="block mt-1">Revenue analytics and billing management</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="MRR" value="$124K" change="+12%" changeType="positive" />
        <WireframeKPICard title="ARR" value="$1.48M" />
        <WireframeKPICard title="Churn Rate" value="2.1%" />
        <WireframeKPICard title="LTV" value="$4,200" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Revenue Trend" subtitle="Last 12 months" type="area" />
        <WireframeChart title="Revenue by Plan" subtitle="Distribution" type="pie" />
      </WireframeGrid>

      <WireframeTable
        title="Billing Overview"
        columns={["Organization", "Plan", "MRR", "Status", "Next Invoice", "Actions"]}
        rows={10}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminRecoveryWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-recovery">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Disaster Recovery</WireframeText>
          <WireframeText variant="body" className="block mt-1">Backup management and recovery procedures</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Backup</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Last Backup" value="2h ago" />
        <WireframeKPICard title="Backup Size" value="234 GB" />
        <WireframeKPICard title="RPO" value="1 hour" />
        <WireframeKPICard title="RTO" value="15 min" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Backup Status</WireframeText>
          {["Database", "File Storage", "Configuration", "Logs"].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <WireframeText variant="body">{item}</WireframeText>
              <span className="text-xs text-success">Healthy</span>
            </div>
          ))}
        </WireframeBox>

        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Recovery Regions</WireframeText>
          {["US-East", "US-West", "EU-West", "APAC"].map((region, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <WireframeText variant="body">{region}</WireframeText>
              <span className="w-2 h-2 rounded-full bg-success" />
            </div>
          ))}
        </WireframeBox>
      </WireframeGrid>

      <WireframeTable
        title="Backup History"
        columns={["ID", "Type", "Size", "Duration", "Status", "Actions"]}
        rows={6}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminAIMLWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-aiml">
    <div className="space-y-6">
      <div>
        <WireframeText variant="h1" className="block">AI/ML Performance</WireframeText>
        <WireframeText variant="body" className="block mt-1">Monitor AI model performance and accuracy</WireframeText>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Model Accuracy" value="94.2%" />
        <WireframeKPICard title="Predictions/Day" value="45K" />
        <WireframeKPICard title="False Positives" value="2.1%" />
        <WireframeKPICard title="Training Jobs" value="3" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Model Accuracy Over Time" subtitle="Last 30 days" type="line" />
        <WireframeChart title="Prediction Distribution" subtitle="By type" type="bar" />
      </WireframeGrid>

      <WireframeTable
        title="Model Performance"
        columns={["Model", "Version", "Accuracy", "Latency", "Last Trained", "Status"]}
        rows={6}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminFeaturesWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-features">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Feature Flags</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage feature rollouts and experiments</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Create Flag</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Flags" value="24" />
        <WireframeKPICard title="Active" value="18" />
        <WireframeKPICard title="Experiments" value="4" />
        <WireframeKPICard title="Rollouts" value="6" />
      </WireframeGrid>

      <WireframeTable
        title="Feature Flags"
        columns={["Flag Name", "Type", "Status", "Rollout %", "Organizations", "Actions"]}
        rows={8}
      />
    </div>
  </SuperAdminLayout>
);

export const SuperAdminResellerWireframe = ({ onNavigate }: ScreenProps) => (
  <SuperAdminLayout onNavigate={onNavigate} activeScreen="super-admin-reseller">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <WireframeText variant="h1" className="block">Reseller Portal</WireframeText>
          <WireframeText variant="body" className="block mt-1">Manage reseller partners and commissions</WireframeText>
        </div>
        <WireframeBox variant="button" className="px-4 py-2 bg-primary/20">
          <WireframeText variant="caption">Add Reseller</WireframeText>
        </WireframeBox>
      </div>

      <WireframeGrid cols={4}>
        <WireframeKPICard title="Total Resellers" value="12" />
        <WireframeKPICard title="Active Deals" value="45" />
        <WireframeKPICard title="Commission (MTD)" value="$8.4K" />
        <WireframeKPICard title="Conversion Rate" value="34%" />
      </WireframeGrid>

      <WireframeGrid cols={2}>
        <WireframeChart title="Reseller Performance" subtitle="Revenue by partner" type="bar" />
        <WireframeBox variant="card" className="p-6 space-y-4">
          <WireframeText variant="h3" className="block">Top Performers</WireframeText>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <WireframeListItem
                key={i}
                title={`Reseller ${i}`}
                subtitle={`$${(10 - i) * 1.2}K this month`}
              />
            ))}
          </div>
        </WireframeBox>
      </WireframeGrid>

      <WireframeTable
        title="Reseller Partners"
        columns={["Partner", "Tier", "Customers", "Revenue", "Commission", "Status", "Actions"]}
        rows={8}
      />
    </div>
  </SuperAdminLayout>
);
