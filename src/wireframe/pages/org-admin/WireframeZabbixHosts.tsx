import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeZabbixHosts = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Zabbix Hosts">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <WireframeText variant="h1">[Zabbix Hosts]</WireframeText>
            <WireframeText variant="body">[Add and configure Zabbix monitored hosts]</WireframeText>
          </div>
          <WireframeButton label="Add Host" variant="primary" />
        </div>

        {/* Add Host Form */}
        <WireframeBox label="Add New Zabbix Host Form">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <WireframeInput label="Hostname" placeholder="web-server-01" />
              <WireframeInput label="IP Address" placeholder="192.168.1.10" />
            </div>
            <WireframeInput label="Zabbix Server URL" placeholder="https://zabbix.example.com" />
            <div className="grid grid-cols-2 gap-4">
              <WireframeInput label="Port" placeholder="10050" />
              <WireframeInput label="Template" placeholder="Linux by Zabbix agent" type="select" />
            </div>
            <WireframeButton label="Add Zabbix Host" variant="primary" className="w-full" />
          </div>
        </WireframeBox>

        {/* Existing Hosts Preview */}
        <WireframeBox label="Existing Zabbix Hosts" dashed>
          <WireframeText variant="caption">[List of connected Zabbix hosts would appear here]</WireframeText>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeZabbixHosts;
