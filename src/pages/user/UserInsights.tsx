import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const UserInsights = () => {
  const mockInsights = [
    {
      id: 1,
      type: "optimization",
      title: "CPU Usage Pattern Detected",
      description: "Server web-01 shows consistent CPU spikes every 6 hours. This pattern suggests a scheduled task that could be optimized.",
      impact: "high",
      confidence: 94,
      recommendation: "Review cron jobs and consider moving intensive tasks to off-peak hours",
    },
    {
      id: 2,
      type: "prediction",
      title: "Storage Capacity Warning",
      description: "Based on current growth rate, database server will reach 90% capacity in approximately 12 days.",
      impact: "critical",
      confidence: 87,
      recommendation: "Schedule storage expansion or implement data archival strategy",
    },
    {
      id: 3,
      type: "anomaly",
      title: "Unusual Network Traffic",
      description: "Detected 300% increase in outbound traffic from app-server-03 compared to baseline.",
      impact: "medium",
      confidence: 91,
      recommendation: "Investigate potential security issue or misconfigured application",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "text-error border-error/30 bg-error/10";
      case "high": return "text-accent border-accent/30 bg-accent/10";
      case "medium": return "text-warning border-warning/30 bg-warning/10";
      default: return "text-success border-success/30 bg-success/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimization": return <TrendingUp className="w-5 h-5" />;
      case "prediction": return <AlertTriangle className="w-5 h-5" />;
      case "anomaly": return <AlertTriangle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Lightbulb className="w-6 h-6 text-primary glow-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Intelligent recommendations and predictions</p>
          </div>
        </div>

        <div className="grid gap-4">
          {mockInsights.map((insight, index) => (
            <Card
              key={insight.id}
              className="glass-card p-6 rounded-lg border border-border hover:border-primary/30 transition-all hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-primary">
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium text-primary">{insight.confidence}%</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {insight.type}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-1">Recommendation:</p>
                  <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="hover-lift">
                    Learn More
                  </Button>
                  <Button size="sm" className="neon-button">
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserInsights;