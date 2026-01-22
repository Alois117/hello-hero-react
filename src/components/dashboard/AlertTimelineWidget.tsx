import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { FiAlertCircle } from "react-icons/fi";

const data = [
  { time: "00:00", alerts: 4 },
  { time: "04:00", alerts: 2 },
  { time: "08:00", alerts: 7 },
  { time: "12:00", alerts: 12 },
  { time: "16:00", alerts: 8 },
  { time: "20:00", alerts: 5 },
];

import { memo } from "react";

const AlertTimelineWidget = memo(() => {
  const total = data.reduce((sum, item) => sum + item.alerts, 0);
  const avg = (total / data.length).toFixed(1);

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Alert Timeline</h3>
          <p className="text-sm text-muted-foreground">Last 24 hours</p>
        </div>
        <TrendingUp className="w-5 h-5 text-success" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <FiAlertCircle className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Alerts</span>
          </div>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Avg/Period</span>
          </div>
          <p className="text-2xl font-bold">{avg}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
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
          <Line
            type="monotone"
            dataKey="alerts"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

AlertTimelineWidget.displayName = "AlertTimelineWidget";

export default AlertTimelineWidget;
