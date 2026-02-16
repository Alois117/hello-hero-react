/**
 * Zabbix Metrics Drilldown Component
 * Combines Alerts and Hosts into a single tabbed view
 * Mirrors User Dashboard's Zabbix Metrics grouping
 */
import { useState } from "react";
import { Activity, AlertTriangle, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertItem, HostItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import AlertsDrilldown from "./AlertsDrilldown";
import HostsDrilldown from "./HostsDrilldown";

interface ZabbixMetricsDrilldownProps {
  orgName: string;
  alerts: {
    items: AlertItem[];
    loading: boolean;
    error: string | null;
  };
  hosts: {
    items: HostItem[];
    loading: boolean;
    error: string | null;
  };
  onRefreshAlerts: () => void;
  onRefreshHosts: () => void;
  onItemClick: (item: AlertItem | HostItem) => void;
}

const ZabbixMetricsDrilldown = ({
  orgName,
  alerts,
  hosts,
  onRefreshAlerts,
  onRefreshHosts,
  onItemClick,
}: ZabbixMetricsDrilldownProps) => {
  const [activeTab, setActiveTab] = useState("alerts");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Zabbix Metrics for {orgName}
        </h3>
        <p className="text-sm text-muted-foreground">Combined alerts and host monitoring data</p>
      </div>

      {/* Tabbed View */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts ({alerts.items.length})
          </TabsTrigger>
          <TabsTrigger value="hosts" className="gap-2">
            <Server className="w-4 h-4" />
            Hosts ({hosts.items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <AlertsDrilldown
            orgName={orgName}
            alerts={alerts.items}
            loading={alerts.loading}
            error={alerts.error}
            onRefresh={onRefreshAlerts}
            onItemClick={onItemClick}
          />
        </TabsContent>

        <TabsContent value="hosts" className="mt-4">
          <HostsDrilldown
            orgName={orgName}
            hosts={hosts.items}
            loading={hosts.loading}
            error={hosts.error}
            onRefresh={onRefreshHosts}
            onItemClick={onItemClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZabbixMetricsDrilldown;
