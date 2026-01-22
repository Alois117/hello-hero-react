// Super Admin Only - AI/ML Performance Monitoring
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cpu, Zap, Target, TrendingUp } from "lucide-react";

const AIMLPerformance = () => {
  const performanceData = [
    { time: "00:00", accuracy: 94.2, latency: 120, throughput: 1250 },
    { time: "04:00", accuracy: 95.1, latency: 115, throughput: 1340 },
    { time: "08:00", accuracy: 96.3, latency: 108, throughput: 1580 },
    { time: "12:00", accuracy: 95.8, latency: 112, throughput: 1620 },
    { time: "16:00", accuracy: 96.7, latency: 105, throughput: 1750 },
    { time: "20:00", accuracy: 95.4, latency: 118, throughput: 1490 },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            AI/ML Performance
          </h1>
          <p className="text-muted-foreground mt-1">Model metrics and inference analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Target className="w-8 h-8 text-destructive mb-3" />
            <div className="text-sm text-muted-foreground">Model Accuracy</div>
            <div className="text-2xl font-bold text-destructive">96.7%</div>
            <div className="text-xs text-success mt-1">↑ 2.1% vs baseline</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Zap className="w-8 h-8 text-accent mb-3" />
            <div className="text-sm text-muted-foreground">Avg Latency</div>
            <div className="text-2xl font-bold text-accent">105ms</div>
            <div className="text-xs text-success mt-1">↓ 12% improvement</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <TrendingUp className="w-8 h-8 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">Throughput</div>
            <div className="text-2xl font-bold text-primary">1,750/s</div>
            <div className="text-xs text-success mt-1">↑ 8% from avg</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Cpu className="w-8 h-8 text-secondary mb-3" />
            <div className="text-sm text-muted-foreground">GPU Utilization</div>
            <div className="text-2xl font-bold text-secondary">78%</div>
            <div className="text-xs text-muted-foreground mt-1">Optimal range</div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="text-lg font-semibold mb-4">24-Hour Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2} 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="latency" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Active Models</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Anomaly Detection v3.2</span>
                <span className="text-xs text-success">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Root Cause Analysis v2.1</span>
                <span className="text-xs text-success">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Predictive Maintenance v1.8</span>
                <span className="text-xs text-muted-foreground">Training</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>GPU Memory</span>
                  <span>18.4 / 24 GB</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-destructive" style={{ width: "76.6%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Cores</span>
                  <span>28 / 32</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: "87.5%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default AIMLPerformance;
