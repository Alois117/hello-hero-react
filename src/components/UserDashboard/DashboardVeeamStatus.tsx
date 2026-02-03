import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

interface VeeamStatusData {
  status: string;
  count: number;
  color: string;
}

interface DashboardVeeamStatusProps {
  data: VeeamStatusData[];
  loading?: boolean;
}

const DashboardVeeamStatus = ({ data, loading }: DashboardVeeamStatusProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="w-full h-[250px] rounded-full mx-auto max-w-[250px]" />
      </Card>
    );
  }

  const hasData = data.some(d => d.count > 0);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card 
      className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => navigate("/dashboard/veeam")}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Veeam VM Status</h3>
            <p className="text-sm text-muted-foreground">Protection & power state overview</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details →
        </span>
      </div>

      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.filter(d => d.count > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.filter(d => d.count > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.filter(d => d.count > 0).map((item) => (
              <div key={item.status} className="flex items-center gap-2 p-2 rounded-lg bg-surface/30">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {item.status}: <span className="font-medium text-foreground">{item.count}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No VM data available</p>
            <p className="text-sm text-muted-foreground mt-1">Connect to Veeam to see status</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardVeeamStatus;
