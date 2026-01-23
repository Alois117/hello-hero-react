import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const mockTimelineData = [
  { time: "00:00", total: 12, critical: 2, high: 4, warning: 6 },
  { time: "04:00", total: 8, critical: 1, high: 3, warning: 4 },
  { time: "08:00", total: 23, critical: 4, high: 8, warning: 11 },
  { time: "12:00", total: 34, critical: 5, high: 12, warning: 17 },
  { time: "16:00", total: 28, critical: 3, high: 10, warning: 15 },
  { time: "20:00", total: 19, critical: 2, high: 7, warning: 10 },
  { time: "Now", total: 15, critical: 1, high: 5, warning: 9 },
];

const AlertsTimelineWidget = () => {
  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">Alerts Timeline</h3>
        <p className="text-sm text-muted-foreground">Alert activity over last 24 hours</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={mockTimelineData}>
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#totalGradient)"
          />
          <Line
            type="monotone"
            dataKey="critical"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--destructive))", r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Total Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">Critical</span>
        </div>
      </div>
    </Card>
  );
};

export default AlertsTimelineWidget;
