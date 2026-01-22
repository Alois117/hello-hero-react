import { X, AlertTriangle, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SeverityBadge, { AlertSeverity } from "@/components/alerts/SeverityBadge";

interface CriticalIssue {
  id: number;
  severity: AlertSeverity;
  host: string;
  problem: string;
  timestamp: string;
}

const mockIssues: CriticalIssue[] = [
  {
    id: 1,
    severity: "critical",
    host: "api-gateway-01",
    problem: "Disk space critical - 95% full",
    timestamp: "5m ago",
  },
  {
    id: 2,
    severity: "high",
    host: "prod-web-01",
    problem: "High CPU usage detected - 92%",
    timestamp: "12m ago",
  },
  {
    id: 3,
    severity: "high",
    host: "db-master-01",
    problem: "Slow query performance detected",
    timestamp: "18m ago",
  },
];

import { memo } from "react";

const CriticalIssuesPanel = memo(() => {
  if (mockIssues.length === 0) {
    return (
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Critical Issues</h3>
            <p className="text-sm text-muted-foreground">High/Critical alerts today</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-accent" />
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="w-12 h-12 text-success mb-3" />
          <p className="text-lg font-semibold mb-1">No Critical Issues</p>
          <p className="text-sm text-muted-foreground">All systems running smoothly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Critical Issues</h3>
          <p className="text-sm text-muted-foreground">
            {mockIssues.length} high/critical alerts today
          </p>
        </div>
        <AlertTriangle className="w-5 h-5 text-accent" />
      </div>

      <div className="space-y-3">
        {mockIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <SeverityBadge severity={issue.severity} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{issue.host}</Badge>
                  <span className="text-xs text-muted-foreground">{issue.timestamp}</span>
                </div>
                <p className="text-sm font-medium mb-3">{issue.problem}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-xs">Open Detail</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All Alerts
      </Button>
    </div>
  );
});

CriticalIssuesPanel.displayName = "CriticalIssuesPanel";

export default CriticalIssuesPanel;
