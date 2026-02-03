import { Card } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from "recharts";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineData {
  time: string;
  total: number;
  critical: number;
  warning: number;
}

interface DashboardTimelineChartProps {
  data: TimelineData[];
  loading?: boolean;
}

const DashboardTimelineChart = ({ data, loading }: DashboardTimelineChartProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50">
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="w-full h-[250px]" />
      </Card>
    );
  }

  const hasData = data.some(d => d.total > 0);

  return (
    <Card 
      className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => navigate("/dashboard/zabbix")}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Alerts Timeline</h3>
          <p className="text-sm text-muted-foreground">Alert activity over last 24 hours</p>
        </div>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details →
        </span>
      </div>

      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
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
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", r: 3 }}
                name="Critical"
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
        </>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No alert activity in the last 24 hours</p>
            <p className="text-sm text-success mt-1">System is stable</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardTimelineChart;
