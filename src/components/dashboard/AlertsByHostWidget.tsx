import { Card } from "@/components/ui/card";
import { Server, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockHostData = [
  { host: "prod-web-01", count: 47, severity: "high" },
  { host: "db-master-02", count: 34, severity: "critical" },
  { host: "cache-redis-03", count: 28, severity: "warning" },
  { host: "api-gateway-01", count: 23, severity: "high" },
  { host: "load-balancer-01", count: 19, severity: "average" },
];

const AlertsByHostWidget = () => {
  const navigate = useNavigate();

  const handleViewAlerts = (host: string) => {
    navigate(`/dashboard/alerts?host=${host}`);
  };

  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">Top Noisy Hosts</h3>
        <p className="text-sm text-muted-foreground">Hosts with most alerts (Last 24h)</p>
      </div>

      <div className="space-y-3">
        {mockHostData.map((item, i) => (
          <div
            key={item.host}
            className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => handleViewAlerts(item.host)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{item.host}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.severity === "critical"
                        ? "bg-destructive/20 text-destructive"
                        : item.severity === "high"
                        ? "bg-accent/20 text-accent"
                        : item.severity === "warning"
                        ? "bg-warning/20 text-warning"
                        : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.count} alerts
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/dashboard/alerts")}
        className="w-full mt-4 py-2 px-4 rounded-lg bg-surface border border-border hover:border-primary text-sm font-medium transition-colors"
      >
        View All Hosts
      </button>
    </Card>
  );
};

export default AlertsByHostWidget;
