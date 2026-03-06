import { useState } from "react";
import { CheckCircle, Wifi, WifiOff } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import AlertsTable from "@/components/alerts/AlertsTable";
import AlertFilters, { type StatusFilter, type TimeRange } from "@/components/alerts/AlertFilters";
import AlertSummaryCards from "@/components/alerts/AlertSummaryCards";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";
import { useAlerts } from "@/hooks/useAlerts";

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { alerts, loading, counts, isConnected, lastUpdated } = useAlerts();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Alerts</h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">{counts.total} active alerts</p>
              <div className="flex items-center gap-1 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-success" />
                    <span className="text-success">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">Offline</span>
                  </>
                )}
              </div>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <Button className="bg-gradient-to-r from-success to-primary hover:opacity-90 text-background">
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge All
          </Button>
        </div>

        <AlertSummaryCards counts={counts} />

        <AlertFilters
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />

        <AlertsTable
          alerts={alerts}
          loading={loading}
          selectedSeverity={selectedSeverity}
          statusFilter={statusFilter}
          timeRange={selectedTimeRange}
          searchQuery={searchQuery}
        />
      </div>
    </AppLayout>
  );
};

export default Alerts;
