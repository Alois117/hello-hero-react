import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Server, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  { host: "api-gateway-01", alerts: 12 },
  { host: "prod-web-01", alerts: 8 },
  { host: "db-master-01", alerts: 6 },
  { host: "cache-redis-03", alerts: 5 },
  { host: "worker-queue-02", alerts: 3 },
];

import { memo } from "react";

const AlertsByHostWidget = memo(() => {
  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Alerts by Host</h3>
          <p className="text-sm text-muted-foreground">Top 5 noisy hosts</p>
        </div>
        <Server className="w-5 h-5 text-primary" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="host"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="alerts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.slice(0, 3).map((item) => (
          <div
            key={item.host}
            className="flex items-center justify-between p-2 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-colors"
          >
            <span className="text-sm font-medium">{item.host}</span>
            <Button variant="ghost" size="sm" className="gap-1">
              <span className="text-xs">{item.alerts} alerts</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
});

AlertsByHostWidget.displayName = "AlertsByHostWidget";

export default AlertsByHostWidget;
