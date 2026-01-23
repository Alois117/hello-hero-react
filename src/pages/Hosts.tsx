import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server, Search, Check, X, AlertCircle, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHosts } from "@/hooks/useHosts";

const Hosts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { hosts, isLoading, error } = useHosts();

  const mappedHosts = hosts.map((host) => ({
    id: host.hostid,
    name: host.name || host.host,
    ip: host.ip || "—",
    status: "healthy",
    cpu: 0,
    memory: 0,
    uptime: "—",
    group: Array.isArray(host.hostgroups) ? host.hostgroups.join(", ") : (host.hostgroups || "Uncategorized"),
  }));

  const groups = Array.from(new Set(mappedHosts.map(h => h.group)));
  
  const filteredHosts = mappedHosts.filter(host => {
    const matchesSearch = (host.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = !selectedGroup || host.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "success";
      case "warning": return "warning";
      case "critical": return "destructive";
      default: return "muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <Check className="w-4 h-4" />;
      case "warning": return <AlertCircle className="w-4 h-4" />;
      case "critical": return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Hosts</h1>
            <p className="text-muted-foreground">{filteredHosts.length} hosts monitored</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background">
            <Server className="w-4 h-4 mr-2" />
            Add Host
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedGroup === null ? "default" : "outline"}
              onClick={() => setSelectedGroup(null)}
              className={selectedGroup === null ? "bg-primary" : ""}
            >
              All
            </Button>
            {groups.map(group => (
              <Button
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                onClick={() => setSelectedGroup(group)}
                className={selectedGroup === group ? "bg-primary" : ""}
              >
                {group}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12 text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Hosts Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHosts.map((host, index) => (
              <div
                key={host.id}
                className="cyber-card cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">{host.name}</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-${getStatusColor(host.status)}/20 text-${getStatusColor(host.status)} text-xs`}>
                    {getStatusIcon(host.status)}
                    {host.status}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IP</span>
                    <span className="font-medium">{host.ip}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{host.group}</span>
                    <span className="text-xs font-medium text-success">↑ {host.uptime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Hosts;
