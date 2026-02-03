import { useMemo } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useReports } from "@/hooks/useReports";
import { useAiInsights } from "@/hooks/useAiInsights";
import { useZabbixHosts } from "@/hooks/useZabbixHosts";
import { useVeeamAlarms } from "@/hooks/useVeeamAlarms";
import { useVeeamInfrastructure } from "@/hooks/useVeeamInfrastructure";

export interface DashboardSummary {
  // Zabbix
  totalHosts: number;
  enabledHosts: number;
  disabledHosts: number;
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  warningAlerts: number;
  acknowledgedAlerts: number;
  
  // Veeam
  totalVMs: number;
  protectedVMs: number;
  unprotectedVMs: number;
  poweredOnVMs: number;
  veeamAlarms: number;
  activeVeeamAlarms: number;
  resolvedVeeamAlarms: number;
  
  // AI Insights
  totalInsights: number;
  highPriorityInsights: number;
  recentInsights: number;
  predictionsCount: number;
  anomaliesCount: number;
  
  // Reports
  totalReports: number;
  dailyReports: number;
  weeklyReports: number;
  monthlyReports: number;
}

export interface DashboardChartData {
  severityDistribution: Array<{
    severity: string;
    count: number;
    color: string;
  }>;
  alertsTimeline: Array<{
    time: string;
    total: number;
    critical: number;
    warning: number;
  }>;
  topNoisyHosts: Array<{
    host: string;
    count: number;
    severity: "critical" | "high" | "warning" | "average";
  }>;
  veeamStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

export interface CriticalIssue {
  id: string;
  host: string;
  problem: string;
  severity: "disaster" | "critical" | "high" | "average" | "warning" | "info";
  duration: string;
  acknowledged: boolean;
  source: "zabbix" | "veeam";
}

export interface UseUserDashboardReturn {
  summary: DashboardSummary;
  chartData: DashboardChartData;
  criticalIssues: CriticalIssue[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
}

export const useUserDashboard = (): UseUserDashboardReturn => {
  // Consume existing hooks
  const alerts = useAlerts();
  const reports = useReports();
  const insights = useAiInsights();
  const hosts = useZabbixHosts();
  const veeamAlarms = useVeeamAlarms();
  const veeamInfra = useVeeamInfrastructure();

  // Aggregate loading state
  const loading = alerts.loading || reports.loading || insights.loading || 
                  hosts.loading || veeamAlarms.loading || veeamInfra.loading;

  // Aggregate error (first error found)
  const error = alerts.error || reports.error || insights.error || 
                hosts.error || veeamAlarms.error || veeamInfra.error || null;

  // Connection status
  const isConnected = alerts.isConnected || hosts.isConnected || 
                      veeamAlarms.isConnected || veeamInfra.isConnected;

  // Most recent update
  const lastUpdated = useMemo(() => {
    const dates = [
      alerts.lastUpdated,
      reports.lastUpdated,
      insights.lastUpdated,
      hosts.lastUpdated,
      veeamAlarms.lastUpdated,
      veeamInfra.lastUpdated,
    ].filter((d): d is Date => d !== null);

    if (dates.length === 0) return null;
    return dates.reduce((a, b) => (a > b ? a : b));
  }, [
    alerts.lastUpdated,
    reports.lastUpdated,
    insights.lastUpdated,
    hosts.lastUpdated,
    veeamAlarms.lastUpdated,
    veeamInfra.lastUpdated,
  ]);

  // Build summary
  const summary = useMemo((): DashboardSummary => ({
    // Zabbix
    totalHosts: hosts.counts.total,
    enabledHosts: hosts.counts.enabled,
    disabledHosts: hosts.counts.disabled,
    totalAlerts: alerts.counts.total,
    criticalAlerts: alerts.counts.disaster + alerts.counts.high,
    highAlerts: alerts.counts.high,
    warningAlerts: alerts.counts.warning,
    acknowledgedAlerts: alerts.counts.acknowledged,
    
    // Veeam
    totalVMs: veeamInfra.counts.total,
    protectedVMs: veeamInfra.counts.protected,
    unprotectedVMs: veeamInfra.counts.unprotected,
    poweredOnVMs: veeamInfra.counts.poweredOn,
    veeamAlarms: veeamAlarms.counts.total,
    activeVeeamAlarms: veeamAlarms.counts.active,
    resolvedVeeamAlarms: veeamAlarms.counts.resolved,
    
    // AI Insights
    totalInsights: insights.counts.total,
    highPriorityInsights: insights.highPriorityCount,
    recentInsights: insights.last24hCount,
    predictionsCount: insights.counts.predictions,
    anomaliesCount: insights.counts.anomalies,
    
    // Reports
    totalReports: reports.counts.total,
    dailyReports: reports.counts.daily,
    weeklyReports: reports.counts.weekly,
    monthlyReports: reports.counts.monthly,
  }), [
    hosts.counts,
    alerts.counts,
    veeamInfra.counts,
    veeamAlarms.counts,
    insights.counts,
    insights.highPriorityCount,
    insights.last24hCount,
    reports.counts,
  ]);

  // Build chart data
  const chartData = useMemo((): DashboardChartData => {
    // Severity distribution from alerts
    const severityDistribution = [
      { severity: "Info", count: alerts.alerts.filter(a => a.severity === "info").length, color: "hsl(var(--muted-foreground))" },
      { severity: "Warning", count: alerts.counts.warning, color: "hsl(var(--warning))" },
      { severity: "Average", count: alerts.counts.average, color: "hsl(var(--accent))" },
      { severity: "High", count: alerts.counts.high, color: "hsl(var(--destructive))" },
      { severity: "Disaster", count: alerts.counts.disaster, color: "hsl(var(--destructive))" },
    ];

    // Alerts timeline - group by hour buckets (last 24 hours)
    const now = Date.now();
    const hourBuckets: Record<string, { total: number; critical: number; warning: number }> = {};
    const timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
    
    timeLabels.forEach(label => {
      hourBuckets[label] = { total: 0, critical: 0, warning: 0 };
    });

    alerts.alerts.forEach(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      const hoursAgo = Math.floor((now - alertTime) / (1000 * 60 * 60));
      
      let bucket = "Now";
      if (hoursAgo >= 20) bucket = "00:00";
      else if (hoursAgo >= 16) bucket = "04:00";
      else if (hoursAgo >= 12) bucket = "08:00";
      else if (hoursAgo >= 8) bucket = "12:00";
      else if (hoursAgo >= 4) bucket = "16:00";
      else if (hoursAgo >= 1) bucket = "20:00";
      
      if (hourBuckets[bucket]) {
        hourBuckets[bucket].total++;
        if (alert.severity === "disaster" || alert.severity === "high") {
          hourBuckets[bucket].critical++;
        }
        if (alert.severity === "warning") {
          hourBuckets[bucket].warning++;
        }
      }
    });

    const alertsTimeline = timeLabels.map(time => ({
      time,
      ...hourBuckets[time],
    }));

    // Top noisy hosts - aggregate alerts by host
    const hostAlertCounts: Record<string, { count: number; maxSeverity: string }> = {};
    alerts.alerts.forEach(alert => {
      const host = alert.host || "Unknown";
      if (!hostAlertCounts[host]) {
        hostAlertCounts[host] = { count: 0, maxSeverity: "info" };
      }
      hostAlertCounts[host].count++;
      
      // Track highest severity
      const severityOrder = ["info", "warning", "average", "high", "critical", "disaster"];
      const currentIdx = severityOrder.indexOf(hostAlertCounts[host].maxSeverity);
      const newIdx = severityOrder.indexOf(alert.severity);
      if (newIdx > currentIdx) {
        hostAlertCounts[host].maxSeverity = alert.severity;
      }
    });

    const topNoisyHosts = Object.entries(hostAlertCounts)
      .map(([host, data]) => ({
        host,
        count: data.count,
        severity: (data.maxSeverity === "disaster" ? "critical" : data.maxSeverity) as "critical" | "high" | "warning" | "average",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Veeam status
    const veeamStatus = [
      { status: "Protected", count: veeamInfra.counts.protected, color: "hsl(var(--success))" },
      { status: "Unprotected", count: veeamInfra.counts.unprotected, color: "hsl(var(--destructive))" },
      { status: "Powered On", count: veeamInfra.counts.poweredOn, color: "hsl(var(--primary))" },
      { status: "Powered Off", count: veeamInfra.counts.poweredOff, color: "hsl(var(--muted-foreground))" },
    ];

    return {
      severityDistribution,
      alertsTimeline,
      topNoisyHosts,
      veeamStatus,
    };
  }, [alerts.alerts, alerts.counts, veeamInfra.counts]);

  // Build critical issues list
  const criticalIssues = useMemo((): CriticalIssue[] => {
    const issues: CriticalIssue[] = [];

    // Add critical/high alerts from Zabbix
    alerts.alerts
      .filter(a => a.severity === "disaster" || a.severity === "high")
      .slice(0, 4)
      .forEach(alert => {
        issues.push({
          id: String(alert.id),
          host: alert.host,
          problem: alert.problem,
          severity: alert.severity as CriticalIssue["severity"],
          duration: alert.duration,
          acknowledged: alert.acknowledged,
          source: "zabbix",
        });
      });

    // Add active Veeam alarms
    veeamAlarms.alarms
      .filter(a => a.status === "Active" && (a.severity === "Critical" || a.severity === "High"))
      .slice(0, 2)
      .forEach(alarm => {
        issues.push({
          id: alarm.alarm_id,
          host: alarm.entity_name,
          problem: alarm.description || alarm.name,
          severity: alarm.severity === "Critical" ? "critical" : "high",
          duration: getRelativeTime(alarm.triggered_at),
          acknowledged: alarm.status === "Acknowledged",
          source: "veeam",
        });
      });

    return issues.slice(0, 5);
  }, [alerts.alerts, veeamAlarms.alarms]);

  return {
    summary,
    chartData,
    criticalIssues,
    loading,
    error,
    isConnected,
    lastUpdated,
  };
};

// Helper function
function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default useUserDashboard;
