import { WireframeBox, WireframeText, WireframeCard, WireframeChart, WireframeTable } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeSuperDashboard = () => {
  return (
    <WireframeDashboardLayout role="super-admin" title="Super Admin">
      <div className="space-y-6 p-6">
        <div>
          <WireframeText variant="h1">[Super Admin Dashboard]</WireframeText>
          <WireframeText variant="body">[Platform-wide monitoring and management]</WireframeText>
        </div>

        <WireframeBox label="Platform KPIs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WireframeCard title="Total Organizations" value="[156]" subtitle="[+12 this month]" icon="🏢" />
            <WireframeCard title="Total Users" value="[3,420]" subtitle="[Active: 2,890]" icon="👥" />
            <WireframeCard title="Monthly Revenue" value="[$124K]" subtitle="[↑ 15%]" icon="💰" />
            <WireframeCard title="System Health" value="[99.9%]" subtitle="[All systems operational]" icon="✓" />
          </div>
        </WireframeBox>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WireframeChart label="Revenue Trend" type="area" />
          <WireframeChart label="User Growth" type="line" />
        </div>

        <WireframeTable label="Recent Organizations" columns={["Organization", "Plan", "Users", "MRR", "Status"]} rows={5} />
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeSuperDashboard;
