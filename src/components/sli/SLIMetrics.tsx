import { Activity, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const SLIMetrics = () => {
  const slis = [
    {
      name: "Availability",
      current: 99.97,
      target: 99.95,
      status: "healthy",
      trend: "+0.02%",
      description: "Service uptime percentage"
    },
    {
      name: "Latency (p95)",
      current: 142,
      target: 200,
      status: "healthy",
      unit: "ms",
      trend: "-12ms",
      description: "95th percentile response time"
    },
    {
      name: "Error Rate",
      current: 0.08,
      target: 0.1,
      status: "healthy",
      unit: "%",
      trend: "-0.02%",
      description: "Failed requests percentage"
    },
    {
      name: "Throughput",
      current: 8420,
      target: 5000,
      status: "excellent",
      unit: "req/s",
      trend: "+842",
      description: "Requests per second"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Service Level Indicators</h2>
        <p className="text-muted-foreground">Real-time reliability and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slis.map((sli, index) => {
          const percentage = sli.unit === '%' 
            ? ((sli.target - sli.current) / sli.target) * 100 
            : (sli.current / sli.target) * 100;
          const isHealthy = sli.status === 'healthy' || sli.status === 'excellent';

          return (
            <Card key={index} className="glass-card border-primary/20 hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sli.name}</CardTitle>
                  <Badge variant={isHealthy ? "default" : "destructive"}>
                    {sli.status}
                  </Badge>
                </div>
                <CardDescription>{sli.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {sli.current}
                      {sli.unit || '%'}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {sli.target}{sli.unit || '%'} target
                    </span>
                  </div>

                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Last 24 hours</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      sli.trend.startsWith('+') || sli.trend.startsWith('-') && sli.name !== 'Error Rate'
                        ? 'text-success' 
                        : 'text-error'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span>{sli.trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SLO Summary */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Service Level Objectives (SLO)
          </CardTitle>
          <CardDescription>Current performance against defined objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 glass-card border border-border rounded-lg">
              <div>
                <p className="font-medium">Monthly Uptime SLO</p>
                <p className="text-sm text-muted-foreground">Target: 99.9% uptime</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">99.97%</p>
                <Badge variant="outline" className="mt-1">On Track</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 glass-card border border-border rounded-lg">
              <div>
                <p className="font-medium">Error Budget Remaining</p>
                <p className="text-sm text-muted-foreground">For current month</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">87.2%</p>
                <Badge variant="outline" className="mt-1">Healthy</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLIMetrics;
