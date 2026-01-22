import { useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wifi, WifiOff } from "lucide-react";
import { CheckCircle } from "lucide-react";
import AlertsTable from "@/components/alerts/AlertsTable";
import AlertFilters from "@/components/alerts/AlertFilters";
import AlertSummaryCards from "@/components/alerts/AlertSummaryCards";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";
import { useAlerts } from "@/hooks/useAlerts";

const UserAlerts = () => {
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([
    "disaster",
    "high",
    "average",
    "warning",
    "info",
  ]);
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { alerts, loading, counts, isConnected, lastUpdated } = useAlerts();

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
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

        {/* 5 Summary Cards */}
        <AlertSummaryCards counts={counts} />

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AlertFilters
            selectedSeverities={selectedSeverities}
            onSeverityChange={setSelectedSeverities}
            showAcknowledged={showAcknowledged}
            onShowAcknowledgedChange={setShowAcknowledged}
          />
        </div>

        {/* Alerts Table with live data */}
        <AlertsTable 
          alerts={alerts}
          loading={loading}
          selectedSeverities={selectedSeverities}
          showAcknowledged={showAcknowledged}
          searchQuery={searchQuery}
        />
      </div>
        
    </UserLayout>
  );
};

export default UserAlerts;
