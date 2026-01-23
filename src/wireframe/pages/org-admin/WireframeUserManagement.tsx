import { WireframeBox, WireframeText, WireframeButton, WireframeInput, WireframeTable, WireframeBadge } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeUserManagement = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="User Management">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[User Management]</WireframeText>
            <WireframeText variant="body">[Manage organization users and roles]</WireframeText>
          </div>
          <WireframeButton label="Invite User" variant="primary" />
        </div>

        {/* Filters */}
        <WireframeBox label="User Filters">
          <div className="flex gap-4">
            <div className="flex-1">
              <WireframeInput placeholder="Search users..." type="search" />
            </div>
            <WireframeInput placeholder="Role" type="select" className="w-40" />
            <WireframeInput placeholder="Status" type="select" className="w-40" />
          </div>
        </WireframeBox>

        {/* Users Table */}
        <WireframeTable
          label="Users Table (5 per page)"
          columns={["User", "Email", "Role", "Status", "Last Active", "Actions"]}
          rows={5}
        />

        {/* User Actions Preview */}
        <WireframeBox label="User Actions Dropdown" dashed>
          <div className="space-y-2">
            <WireframeText variant="caption">[Available actions per user:]</WireframeText>
            <div className="flex gap-2 flex-wrap">
              <WireframeBadge label="Change Role" variant="info" />
              <WireframeBadge label="Deactivate" variant="warning" />
              <WireframeBadge label="Reset Password" variant="default" />
              <WireframeBadge label="View Activity" variant="default" />
              <WireframeBadge label="Remove" variant="critical" />
            </div>
          </div>
        </WireframeBox>

        {/* Invite User Modal Preview */}
        <WireframeBox label="Invite User Modal (Opens on button click)" dashed>
          <div className="space-y-4 max-w-md">
            <WireframeInput label="Email Address" placeholder="user@example.com" type="email" />
            <WireframeInput label="Role" placeholder="Select role..." type="select" />
            <WireframeInput label="Teams" placeholder="Select teams..." type="select" />
            <div className="flex gap-2">
              <WireframeButton label="Send Invite" variant="primary" />
              <WireframeButton label="Cancel" variant="outline" />
            </div>
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeUserManagement;
