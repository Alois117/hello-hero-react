import { useState } from "react";
import { AlertTriangle, X, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AlertsTable from "@/components/alerts/AlertsTable";
import AlertFilters from "@/components/alerts/AlertFilters";
import { AlertSeverity } from "@/components/alerts/SeverityBadge";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import { useDebounce } from "@/hooks/useDebounce";

const mockProblems = [
  {
    id: 1,
    severity: "critical",
    host: "api-gateway-01",
    issue: "Disk space critical - 95% full",
    duration: "5m",
    acknowledged: false
  },
  {
    id: 2,
    severity: "high",
    host: "prod-web-01",
    issue: "High CPU usage detected - 92%",
    duration: "12m",
    acknowledged: false
  },
  {
    id: 3,
    severity: "high",
    host: "db-master-01",
    issue: "Slow query performance detected",
    duration: "18m",
    acknowledged: true
  },
  {
    id: 4,
    severity: "warning",
    host: "cache-redis-03",
    issue: "Memory pressure warning - 78%",
    duration: "25m",
    acknowledged: false
  },
  {
    id: 5,
    severity: "warning",
    host: "worker-queue-02",
    issue: "Queue processing delay detected",
    duration: "32m",
    acknowledged: true
  },
];

const Alerts = () => {
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([
    "critical",
    "high",
    "warning",
    "info",
  ]);
  const [showAcknowledged, setShowAcknowledged] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/30" };
      case "high": return { bg: "bg-accent/20", text: "text-accent", border: "border-accent/30" };
      case "warning": return { bg: "bg-warning/20", text: "text-warning", border: "border-warning/30" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <X className="w-5 h-5" />;
      case "high": return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Alerts</h1>
            <p className="text-muted-foreground">{mockProblems.length} active alerts</p>
          </div>
          <Button className="bg-gradient-to-r from-success to-primary hover:opacity-90 text-background">
            Acknowledge All
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search alerts..."
              className="pl-9 sm:pl-10 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search alerts by problem, host, or AI summary"
            />
          </div>
          <AlertFilters
            selectedSeverities={selectedSeverities}
            onSeverityChange={setSelectedSeverities}
            showAcknowledged={showAcknowledged}
            onShowAcknowledgedChange={setShowAcknowledged}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="cyber-card border-destructive/30 bg-gradient-to-br from-destructive/20 to-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Critical</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </div>

          <div className="cyber-card border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="cyber-card border-warning/30 bg-gradient-to-br from-warning/20 to-warning/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Warning</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="cyber-card border-success/30 bg-gradient-to-br from-success/20 to-success/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Acknowledged</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <ErrorBoundary fallbackMessage="Failed to load alerts table">
          <AlertsTable />
        </ErrorBoundary>
      </div>
    </AppLayout>
  );
};

export default Alerts;
