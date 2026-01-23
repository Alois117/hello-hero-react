import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const mockData = [
  { severity: "Info", count: 45, color: "hsl(var(--muted-foreground))" },
  { severity: "Warning", count: 23, color: "hsl(var(--warning))" },
  { severity: "Average", count: 18, color: "hsl(var(--accent))" },
  { severity: "High", count: 12, color: "hsl(var(--destructive))" },
  { severity: "Disaster", count: 3, color: "hsl(var(--destructive))" },
];

const SeverityDistributionChart = () => {
  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">Severity Distribution</h3>
        <p className="text-sm text-muted-foreground">Alerts by severity level (Last 24h)</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="severity" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            cursor={{ fill: "hsl(var(--surface) / 0.3)" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {mockData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {mockData.map((item) => (
          <div key={item.severity} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">
              {item.severity}: <span className="font-medium text-foreground">{item.count}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SeverityDistributionChart;
