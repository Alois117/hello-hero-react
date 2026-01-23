import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SeverityBadge from "@/components/alerts/SeverityBadge";

type Severity = "disaster" | "critical" | "high" | "average" | "warning" | "info";

interface CriticalIssue {
  id: string;
  host: string;
  problem: string;
  severity: Severity;
  duration: string;
  acknowledged: boolean;
}

const mockCriticalIssues: CriticalIssue[] = [
  {
    id: "1",
    host: "db-master-02",
    problem: "Disk space critical on /data partition",
    severity: "disaster",
    duration: "5m",
    acknowledged: false,
  },
  {
    id: "2",
    host: "prod-web-01",
    problem: "High CPU usage detected - 95% utilization",
    severity: "high",
    duration: "12m",
    acknowledged: false,
  },
  {
    id: "3",
    host: "api-gateway-01",
    problem: "Response time elevated above threshold",
    severity: "high",
    duration: "18m",
    acknowledged: true,
  },
  {
    id: "4",
    host: "backup-server-01",
    problem: "Backup job failed - retry in progress",
    severity: "high",
    duration: "25m",
    acknowledged: false,
  },
];

const CriticalIssuesPanel = () => {
  const navigate = useNavigate();

  const handleIssueClick = (issueId: string) => {
    navigate(`/dashboard/alerts?id=${issueId}`);
  };

  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50 border-l-4 border-l-destructive">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Today's Critical Issues</h3>
            <p className="text-sm text-muted-foreground">
              {mockCriticalIssues.filter(i => !i.acknowledged).length} unacknowledged
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/alerts?severity=high,disaster")}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {mockCriticalIssues.map((issue) => (
          <div
            key={issue.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer group ${
              issue.acknowledged
                ? "bg-surface/30 border-border/30 opacity-70"
                : "bg-surface/50 border-border/50 hover:border-primary/50"
            }`}
            onClick={() => handleIssueClick(issue.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-xs text-muted-foreground">{issue.duration}</span>
                  {issue.acknowledged && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                      Acknowledged
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm mb-1 truncate">{issue.problem}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Host: <span className="font-mono">{issue.host}</span>
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {mockCriticalIssues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No critical issues today</p>
          <p className="text-sm text-success mt-1">All systems operational</p>
        </div>
      )}
    </Card>
  );
};

export default CriticalIssuesPanel;
