import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertTriangle } from "lucide-react";

const data = [
  { name: "CRITICAL", value: 3, color: "hsl(var(--destructive))" },
  { name: "HIGH", value: 8, color: "hsl(var(--accent))" },
  { name: "WARNING", value: 12, color: "hsl(var(--warning))" },
  { name: "INFO", value: 5, color: "hsl(var(--primary))" },
];

import { memo } from "react";

const SeverityDistributionChart = memo(() => {
  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Severity Distribution</h3>
          <p className="text-sm text-muted-foreground">Alert breakdown by severity</p>
        </div>
        <AlertTriangle className="w-5 h-5 text-accent" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">
              <span className="font-medium">{item.value}</span>{" "}
              <span className="text-muted-foreground">{item.name}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

SeverityDistributionChart.displayName = "SeverityDistributionChart";

export default SeverityDistributionChart;
