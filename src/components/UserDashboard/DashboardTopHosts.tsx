import { Card } from "@/components/ui/card";
import { Server, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HostData {
  host: string;
  count: number;
  severity: "critical" | "high" | "warning" | "average";
}

interface DashboardTopHostsProps {
  data: HostData[];
  loading?: boolean;
}

const severityStyles = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-accent/20 text-accent",
  warning: "bg-warning/20 text-warning",
  average: "bg-muted/20 text-muted-foreground",
};

const DashboardTopHosts = ({ data, loading }: DashboardTopHostsProps) => {
  const navigate = useNavigate();

  const handleViewAlerts = (host: string) => {
    navigate(`/dashboard/zabbix?host=${encodeURIComponent(host)}`);
  };

  if (loading) {
    return (
      <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Top Noisy Hosts</h3>
          <p className="text-sm text-muted-foreground">Hosts with most alerts (Last 24h)</p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.host}
              className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handleViewAlerts(item.host)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm truncate">{item.host}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", severityStyles[item.severity])}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.count} alert{item.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No noisy hosts detected</p>
          <p className="text-sm text-success mt-1">All hosts operating normally</p>
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard/zabbix")}
        className="w-full mt-4 py-2 px-4 rounded-lg bg-surface border border-border hover:border-primary text-sm font-medium transition-colors"
      >
        View All Hosts
      </button>
    </Card>
  );
};

export default DashboardTopHosts;
