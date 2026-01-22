import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Server, Activity, HardDrive, Cpu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectHosts,
  selectHostsLoading,
  selectHostsError,
} from "@/store/slices/hostsSlice";
import { useHosts } from "@/hooks/useHosts";

const capitalizeHostType = (type?: string): string => {
  if (!type) return "Unknown";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatUptime = (uptime?: string) => {
  if (!uptime) {
    return { daysOnly: "—", detailed: "—" };
  }

  // Extract number from strings like "20.1 days"
  const match = uptime.match(/([\d.]+)/);
  if (!match) {
    return { daysOnly: uptime, detailed: uptime };
  }

  const totalDays = parseFloat(match[1]);
  const days = Math.floor(totalDays);
  const hours = Math.round((totalDays - days) * 24);

  return {
    daysOnly: `${days} day${days !== 1 ? "s" : ""}`,
    detailed: `${days} day${days !== 1 ? "s" : ""}${
      hours > 0 ? ` ${hours} hour${hours !== 1 ? "s" : ""}` : ""
    }`,
  };
};


const UserHostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ✅ ENSURE HOSTS ARE FETCHED (fixes infinite loading)
  useHosts();

  // ✅ Use selectors (correct state shape)
  const hosts = useSelector(selectHosts);
  const isLoading = useSelector(selectHostsLoading);
  const error = useSelector(selectHostsError);

  const host = hosts.find((h) => h.hostid === id);
  const uptime = formatUptime(host?.uptime_days);

  // ✅ Loading state (only when nothing cached)
  if (isLoading && hosts.length === 0) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading host details...</p>
        </div>
      </UserLayout>
    );
  }

  // ✅ Error state
  if (error && hosts.length === 0) {
    return (
      <UserLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/hosts")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-destructive">
              Error loading hosts
            </h1>
          </div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </UserLayout>
    );
  }

  // ✅ Host not found (after data loaded)
  if (!host) {
    return (
      <UserLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/hosts")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-destructive">
              Host not found
            </h1>
          </div>
          <p className="text-muted-foreground">
            The requested host could not be found.
          </p>
        </div>
      </UserLayout>
    );
  }

  const displayName = host.hostname || "Unknown Host";
  const displayIP = host.ip || "—";
  const displayOS = capitalizeHostType(host.host_type);

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/hosts")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {displayIP} • {displayOS}
              </p>
            </div>
          </div>

          <Badge className="px-2 py-0.5 text-xs h-6 gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Online
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <p className="text-sm text-muted-foreground">CPU Usage</p>
            <p className="text-2xl font-bold mt-1">{host.cpu_usage || "—"}</p>
            <Cpu className="w-8 h-8 text-primary mt-3" />
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <p className="text-sm text-muted-foreground">Memory</p>
            <p className="text-2xl font-bold mt-1">{host.memory_usage || "—"}</p>
            <Activity className="w-8 h-8 text-accent mt-3" />
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <p className="text-sm text-muted-foreground">Disk Usage</p>
            <p className="text-2xl font-bold mt-1">{host.disk_usage || "—"}</p>
            <HardDrive className="w-8 h-8 text-success mt-3" />
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="text-2xl font-bold mt-1">{uptime.daysOnly}</p>
            <Server className="w-8 h-8 text-primary mt-3" />
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-lg font-semibold mb-4">Host Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hostname</p>
                  <p className="font-medium">{displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{displayIP}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">OS</p>
                  <p className="font-medium">{displayOS}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">{uptime.detailed}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              Live metrics visualization would appear here
            </Card>
          </TabsContent>

          <TabsContent value="triggers">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              Trigger history would appear here
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              AI insights and recommendations would appear here
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default UserHostDetail;
