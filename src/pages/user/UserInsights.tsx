import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useAiInsights,
  type AiInsight,
  type TimeFilter,
  getRelativeTime,
} from "@/hooks/useAiInsights";

import InsightCard from "@/components/AI-Insights/InsightCard";
import { isItemRead, markItemRead } from "@/utils/readState";
import { useAuth } from "@/keycloak/context/AuthContext";

import React, { useState, useEffect } from "react";

const UserInsights = () => {
  const { decodedToken } = useAuth();
  const userId = decodedToken?.sub || '';
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
    highPriorityCount,
    last24hCount,
    mostAffectedHost,
    refresh,
  } = useAiInsights({ pageSize: 8 });

  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Sync read state from localStorage
  useEffect(() => {
    if (!userId || paginatedInsights.length === 0) return;
    const set = new Set<string>();
    paginatedInsights.forEach(i => {
      if (isItemRead(userId, i.id)) set.add(i.id);
    });
    setReadIds(set);
  }, [userId, paginatedInsights]);

  const handleMarkRead = (id: string) => {
    if (!userId) return;
    markItemRead(userId, id);
    setReadIds(prev => new Set(prev).add(id));
  };

  const setExpanded = (id: string, open: boolean) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [id]: open,
    }));
  };

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

  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <UserLayout>
      <div className="space-y-4 sm:space-y-6 3xl:space-y-8">
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

  {/* Status indicator + timestamp - no refresh button */}
  <div className="flex items-center gap-3 text-sm">
    {isConnected ? (
      <Wifi className="w-4 h-4 text-success" />
    ) : (
      <WifiOff className="w-4 h-4 text-error" />
    )}
    
    {lastUpdated && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Updated:</span>
        <span className="font-medium">
          {lastUpdated.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
    )}
  </div>
</div>

        {/* Only the new summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-5 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Insights</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-error/30 bg-gradient-to-br from-error/5 to-error/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-error/20">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-3xl font-bold">{highPriorityCount}</p>
                <p className="text-sm text-muted-foreground mt-1">High Priority</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{last24hCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Last 24h</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-warning/30 bg-gradient-to-br from-warning/5 to-warning/15 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <Server className="w-6 h-6 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-bold truncate">{mostAffectedHost}</p>
                <p className="text-sm text-muted-foreground mt-1">Most Affected Host</p>
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        )}

        {/* Error */}
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

        {/* No Insights */}
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
            {paginatedInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                expanded={!!expandedInsights[insight.id]}
                onExpandedChange={(open) => setExpanded(insight.id, open)}
                getImpactColor={getImpactColor}
                getSeverityBadge={getSeverityBadge}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                isRead={readIds.has(insight.id)}
                onMarkRead={() => handleMarkRead(insight.id)}
              />
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
    </UserLayout>
  );
};

export default UserInsights;