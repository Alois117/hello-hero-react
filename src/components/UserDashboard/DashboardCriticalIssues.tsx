import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Server, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SeverityBadge from "@/components/alerts/SeverityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { CriticalIssue } from "@/hooks/dashboard/useUserDashboard";
import { cn } from "@/lib/utils";

interface DashboardCriticalIssuesProps {
  issues: CriticalIssue[];
  loading?: boolean;
}

const DashboardCriticalIssues = ({ issues, loading }: DashboardCriticalIssuesProps) => {
  const navigate = useNavigate();

  const handleIssueClick = (issue: CriticalIssue) => {
    if (issue.source === "zabbix") {
      navigate(`/dashboard/zabbix?id=${issue.id}`);
    } else {
      navigate(`/dashboard/veeam?alarm=${issue.id}`);
    }
  };

  const unacknowledgedCount = issues.filter(i => !i.acknowledged).length;

  if (loading) {
    return (
      <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50 border-l-4 border-l-destructive">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="cyber-card p-6 bg-card/50 backdrop-blur border-border/50 border-l-4 border-l-destructive">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Critical Issues</h3>
            <p className="text-sm text-muted-foreground">
              {unacknowledgedCount > 0 
                ? `${unacknowledgedCount} unacknowledged`
                : "All issues acknowledged"
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/zabbix")}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={`${issue.source}-${issue.id}`}
              className={cn(
                "p-4 rounded-lg border transition-all cursor-pointer group",
                issue.acknowledged
                  ? "bg-surface/30 border-border/30 opacity-70"
                  : "bg-surface/50 border-border/50 hover:border-primary/50"
              )}
              onClick={() => handleIssueClick(issue)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-xs text-muted-foreground">{issue.duration}</span>
                    {issue.acknowledged && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                        Acknowledged
                      </span>
                    )}
                    {/* Source indicator */}
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                      issue.source === "zabbix" 
                        ? "bg-primary/20 text-primary"
                        : "bg-blue-500/20 text-blue-500"
                    )}>
                      {issue.source === "zabbix" ? (
                        <Server className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {issue.source === "zabbix" ? "Zabbix" : "Veeam"}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-1 line-clamp-2">{issue.problem}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Host: <span className="font-mono truncate">{issue.host}</span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-success" />
          </div>
          <p className="text-muted-foreground">No critical issues</p>
          <p className="text-sm text-success mt-1">All systems operational</p>
        </div>
      )}
    </Card>
  );
};

export default DashboardCriticalIssues;
