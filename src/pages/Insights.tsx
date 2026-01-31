import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TablePagination from "@/components/ui/table-pagination";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Info,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Server,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  useAiInsights, 
  type AiInsight, 
  type TimeFilter,
  getRelativeTime 
} from "@/hooks/useAiInsights";

// ============================================================================
// AI INSIGHTS PAGE - Main Dashboard
// Features:
// - Real-time data from webhook (5s silent refresh)
// - Time-based filtering (Today, 24h, 7d, 30d, Custom)
// - Client-side pagination
// - Expandable insight cards
// - Responsive design
// ============================================================================

const Insights = () => {
  const {
    paginatedInsights,
    loading,
    error,
    isConnected,
    lastUpdated,
    currentPage,
    totalPages,
    totalCount,
    setCurrentPage,
    startIndex,
    endIndex,
    timeFilter,
    setTimeFilter,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    counts,
    refresh,
  } = useAiInsights({ pageSize: 8 });

  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get impact color based on severity/impact level
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-error border-error/30 bg-error/10";
      case "high":
        return "text-accent border-accent/30 bg-accent/10";
      case "medium":
        return "text-warning border-warning/30 bg-warning/10";
      default:
        return "text-success border-success/30 bg-success/10";
    }
  };

  // Get severity badge variant
  const getSeverityBadge = (severity: AiInsight["severity"]) => {
    const styles: Record<string, string> = {
      critical: "bg-error/20 text-error border-error/30",
      high: "bg-accent/20 text-accent border-accent/30",
      medium: "bg-warning/20 text-warning border-warning/30",
      low: "bg-success/20 text-success border-success/30",
      info: "bg-primary/20 text-primary border-primary/30",
    };
    return styles[severity] || styles.info;
  };

  // Get type icon
  const getTypeIcon = (type: AiInsight["type"]) => {
    switch (type) {
      case "prediction":
        return <TrendingUp className="w-5 h-5" />;
      case "anomaly":
        return <Zap className="w-5 h-5" />;
      case "optimization":
        return <Lightbulb className="w-5 h-5" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Get type color
  const getTypeColor = (type: AiInsight["type"]) => {
    switch (type) {
      case "prediction":
        return "text-primary";
      case "anomaly":
        return "text-warning";
      case "optimization":
        return "text-success";
      case "alert":
        return "text-error";
      default:
        return "text-muted-foreground";
    }
  };

  // Time filter options
  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Lightbulb className="w-6 h-6 text-primary glow-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Insights</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Intelligent recommendations and predictions
              </p>
            </div>
          </div>

          {/* Connection Status & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-error" />
              )}
              {lastUpdated && (
                <span className="hidden sm:inline">
                  Updated {getRelativeTime(lastUpdated)}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-warning/20 bg-warning/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.anomalies}</p>
                <p className="text-sm text-muted-foreground">Anomalies</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-success/20 bg-success/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.predictions}</p>
                <p className="text-sm text-muted-foreground">Predictions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <AlertTriangle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.alerts}</p>
                <p className="text-sm text-muted-foreground">Alerts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Bar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time Range:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(option.value)}
                  className={cn(
                    "transition-all",
                    timeFilter === option.value && "bg-primary text-primary-foreground"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            {timeFilter === "custom" && (
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {customDateFrom ? format(customDateFrom, "MMM d, yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateFrom}
                      onSelect={setCustomDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {customDateTo ? format(customDateTo, "MMM d, yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateTo}
                      onSelect={setCustomDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 border-error/30 bg-error/5">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-error" />
              <div>
                <h3 className="text-lg font-semibold text-error">Failed to Load Insights</h3>
                <p className="text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={refresh} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedInsights.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-muted">
                <Lightbulb className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Insights Found</h3>
                <p className="text-muted-foreground mt-1">
                  {timeFilter === "custom" && customDateFrom
                    ? "No insights found for the selected date range."
                    : "No AI insights available at this time. Check back later."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Insights List */}
        {!loading && !error && paginatedInsights.length > 0 && (
          <div className="grid gap-4">
            {paginatedInsights.map((insight, index) => (
              <Card
                key={insight.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 hover:border-primary/30",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Collapsible
                  open={expandedInsights.has(insight.id)}
                  onOpenChange={() => toggleExpanded(insight.id)}
                >
                  {/* Card Header */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon & Type */}
                      <div
                        className={cn(
                          "p-3 rounded-lg shrink-0",
                          "bg-muted/50 border border-border",
                          getTypeColor(insight.type)
                        )}
                      >
                        {getTypeIcon(insight.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-start gap-2">
                          <Badge
                            variant="outline"
                            className={cn("capitalize", getSeverityBadge(insight.severity))}
                          >
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {insight.type}
                          </Badge>
                          {insight.host && (
                            <Badge variant="secondary" className="gap-1">
                              <Server className="w-3 h-3" />
                              {insight.host}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {insight.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {insight.summary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Impact:</span>
                            <Badge
                              variant="outline"
                              className={cn("capitalize", getImpactColor(insight.impact))}
                            >
                              {insight.impact}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium text-primary">
                              {insight.confidence}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{getRelativeTime(insight.createdAt)}</span>
                          </div>
                        </div>

                        {/* Recommendation Preview */}
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm">
                            <span className="font-medium">Recommendation: </span>
                            <span className="text-muted-foreground">
                              {insight.recommendation}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            {expandedInsights.has(insight.id) ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Less</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Details</span>
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 md:px-6 md:pb-6 pt-0">
                      <div className="border-t border-border pt-4 space-y-4">
                        {/* Entity Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Entity Type
                            </p>
                            <p className="font-medium">{insight.entityType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Host
                            </p>
                            <p className="font-medium">{insight.host || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Created
                            </p>
                            <p className="font-medium">
                              {insight.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Status
                            </p>
                            <Badge variant="outline" className="capitalize">
                              {insight.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Full Response Content */}
                        {insight.responseContent && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                              Full Analysis
                            </p>
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {insight.responseContent}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalCount > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            startIndex={startIndex}
            endIndex={endIndex}
            itemName="insights"
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Insights;
