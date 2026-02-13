import UserLayout from "@/layouts/UserLayout";
import { useUserDashboard } from "@/hooks/dashboard/useUserDashboard";
import {
  DashboardSummaryCards,
  DashboardSeverityChart,
  DashboardTimelineChart,
  DashboardTopHosts,
  DashboardCriticalIssues,
  DashboardVeeamStatus,
  DashboardHeader,
} from "@/components/UserDashboard";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { summary, chartData, criticalIssues, loading, error, isConnected, lastUpdated } = useUserDashboard();

  return (
    <UserLayout>
      <div className="space-y-4 sm:space-y-6 3xl:space-y-8 animate-fade-in">
        {/* Header with connection status */}
        <DashboardHeader
          isConnected={isConnected}
          lastUpdated={lastUpdated}
        />

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <strong>Connection Issue:</strong> {error}. Data may be stale.
          </div>
        )}

        {/* Summary Cards - Global Overview */}
        <DashboardSummaryCards summary={summary} loading={loading} />

        {/* Charts Row 1 - Alerts Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 3xl:gap-8">
          <DashboardSeverityChart data={chartData.severityDistribution} loading={loading} />
          <DashboardTimelineChart data={chartData.alertsTimeline} loading={loading} />
        </div>

        {/* Charts Row 2 - Hosts & Veeam */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 3xl:gap-8">
          <DashboardTopHosts data={chartData.topNoisyHosts} loading={loading} />
          <DashboardVeeamStatus data={chartData.veeamStatus} loading={loading} />
        </div>

        {/* Critical Issues Panel */}
        <DashboardCriticalIssues issues={criticalIssues} loading={loading} />

        {/* AI Insights Teaser */}
        <div 
          className="cyber-card border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5 cursor-pointer hover:border-primary/50 transition-all group"
          onClick={() => navigate("/dashboard/insights")}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">AI Insights</h3>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to explore →
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted/30 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-muted/30 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    {summary.totalInsights > 0 ? (
                      <>
                        <span className="font-semibold text-foreground">{summary.totalInsights}</span> AI insights generated. 
                        {summary.highPriorityInsights > 0 && (
                          <> <span className="text-warning font-semibold">{summary.highPriorityInsights}</span> require attention.</>
                        )}
                        {summary.recentInsights > 0 && (
                          <> <span className="text-primary font-semibold">{summary.recentInsights}</span> in the last 24 hours.</>
                        )}
                      </>
                    ) : (
                      "No AI insights available yet. The system is analyzing your infrastructure data."
                    )}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm">
                      {summary.predictionsCount} Predictions
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
                      {summary.anomaliesCount} Anomalies
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm">
                      {summary.totalReports} Reports
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
