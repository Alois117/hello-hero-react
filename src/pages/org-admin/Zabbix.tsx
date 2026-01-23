import { useState } from "react";
import { useSelector } from "react-redux";
import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Server,
  AlertCircle,
  CheckCircle,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  selectHosts,
  selectHostsLoading,
  selectHostsError,
} from "@/store/slices/hostsSlice";
import { useHosts } from "@/hooks/useHosts";
import { useAlerts } from "@/hooks/useAlerts";
import AlertsTable from "@/components/alerts/AlertsTable";
import AlertFilters from "@/components/alerts/AlertFilters";
import AlertSummaryCards from "@/components/alerts/AlertSummaryCards";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";

const Zabbix = () => {
  const navigate = useNavigate();

  // Alerts state
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([
    "disaster",
    "high",
    "average",
    "warning",
    "info",
  ]);
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [alertSearchQuery, setAlertSearchQuery] = useState("");

  // Hosts state
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch alerts data
  const { alerts, loading: alertsLoading, counts, isConnected, lastUpdated } = useAlerts();

  // Fetch hosts data
  useHosts();
  const hosts = useSelector(selectHosts);
  const isHostsLoading = useSelector(selectHostsLoading);
  const hostsError = useSelector(selectHostsError);

  const mappedHosts = hosts.map((host) => ({
    id: host.hostid,
    name: host.hostname ?? "",
    ip: host.ip ?? "",
    status: "online",
    problems: 0,
    group: host.hostgroup ?? "",
  }));

  const groups = Array.from(
    new Set(hosts.flatMap((h) => h.hostgroups ?? []))
  );

  const hostQuery = hostSearchQuery.toLowerCase();

  const filteredHosts = mappedHosts.filter((host) => {
    const name = (host.name ?? "").toLowerCase();
    const ip = (host.ip ?? "").toLowerCase();

    const matchesSearch = name.includes(hostQuery) || ip.includes(hostQuery);
    const matchesGroup = !selectedGroup || host.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Zabbix
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage Zabbix alerts and monitored hosts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="hosts" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Hosts
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {/* Alerts Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">{counts.total} active alerts</p>
                <div className="flex items-center gap-1 text-xs">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-success" />
                      <span className="text-success">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">Offline</span>
                    </>
                  )}
                </div>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <Button className="bg-gradient-to-r from-success to-primary hover:opacity-90 text-background">
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge All
              </Button>
            </div>

            {/* Summary Cards */}
            <AlertSummaryCards counts={counts} />

            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-10"
                  value={alertSearchQuery}
                  onChange={(e) => setAlertSearchQuery(e.target.value)}
                />
              </div>
              <AlertFilters
                selectedSeverities={selectedSeverities}
                onSeverityChange={setSelectedSeverities}
                showAcknowledged={showAcknowledged}
                onShowAcknowledgedChange={setShowAcknowledged}
              />
            </div>

            {/* Alerts Table */}
            <AlertsTable
              alerts={alerts}
              loading={alertsLoading}
              selectedSeverities={selectedSeverities}
              showAcknowledged={showAcknowledged}
              searchQuery={alertSearchQuery}
            />
          </TabsContent>

          {/* Hosts Tab */}
          <TabsContent value="hosts" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search hosts..."
                    value={hostSearchQuery}
                    onChange={(e) => setHostSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={!selectedGroup ? "default" : "outline"}
                  onClick={() => setSelectedGroup(null)}
                >
                  All
                </Button>
                {groups.map((group) => (
                  <Button
                    key={group}
                    variant={selectedGroup === group ? "default" : "outline"}
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group}
                  </Button>
                ))}
              </div>

              {isHostsLoading && hosts.length === 0 && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}

              {hostsError && hosts.length === 0 && (
                <div className="flex justify-center py-12 text-destructive">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {hostsError}
                </div>
              )}

              {hosts.length > 0 && (
                <div className="space-y-3">
                  {filteredHosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No hosts found.
                    </div>
                  ) : (
                    filteredHosts.map((host) => (
                      <div
                        key={host.id}
                        onClick={() => navigate(`/dashboard/hosts/${host.id}`)}
                        className="flex justify-between p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <div className="flex gap-4">
                          <Server className="text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{host.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {host.ip || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {host.group}
                            </p>
                          </div>
                        </div>
                        <Badge className="px-2 py-0.5 text-xs h-6">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          online
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrgAdminLayout>
  );
};

export default Zabbix;
