import { useState } from "react";
import { useSelector } from "react-redux";
import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Server,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  selectHosts,
  selectHostsLoading,
  selectHostsError,
} from "@/store/slices/hostsSlice";
import { useHosts } from "@/hooks/useHosts";

const UserHosts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // ✅ Fetch lifecycle
  useHosts();

  const hosts = useSelector(selectHosts);
  const isLoading = useSelector(selectHostsLoading);
  const error = useSelector(selectHostsError);

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

  const query = searchQuery.toLowerCase();

  const filteredHosts = mappedHosts.filter((host) => {
    const name = (host.name ?? "").toLowerCase();
    const ip = (host.ip ?? "").toLowerCase();

    const matchesSearch =
      name.includes(query) || ip.includes(query);

    const matchesGroup =
      !selectedGroup || host.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Hosts</h1>
          <p className="text-muted-foreground">
            Manage and monitor your infrastructure hosts
          </p>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {isLoading && hosts.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {error && hosts.length === 0 && (
            <div className="flex justify-center py-12 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
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
                    onClick={() =>
                      navigate(`/dashboard/hosts/${host.id}`)
                    }
                    className="flex justify-between p-4 border rounded-lg cursor-pointer hover:border-primary"
                  >
                    <div className="flex gap-4">
                      <Server />
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
      </div>
    </UserLayout>
  );
};

export default UserHosts;
