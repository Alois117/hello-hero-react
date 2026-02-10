/**
 * AI Insights Drilldown Component
 * Shows detailed insights list for the selected organization
 * ✅ Added pagination
 */
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  XCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import TablePagination from "@/components/ui/table-pagination";

interface InsightsDrilldownProps {
  orgName: string;
  insights: InsightItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: InsightItem) => void;
}

type InsightFilter = "all" | "predictions" | "anomalies" | "recommendations";

const typeIcons: Record<string, React.ElementType> = {
  prediction: TrendingUp,
  anomaly: AlertTriangle,
  recommendation: Lightbulb,
  insight: Brain,
};

const typeColors: Record<string, string> = {
  prediction: "border-accent/30 bg-accent/10 text-accent",
  anomaly: "border-warning/30 bg-warning/10 text-warning",
  recommendation: "border-primary/30 bg-primary/10 text-primary",
  insight: "border-secondary/30 bg-secondary/10 text-secondary",
};

const InsightsDrilldown = ({
  orgName,
  insights,
  loading,
  error,
  onRefresh,
  onItemClick,
}: InsightsDrilldownProps) => {
  const [filter, setFilter] = useState<InsightFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Pagination
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const getInsightType = (type: string): string => {
    const lowerType = (type || "").toLowerCase();
    if (lowerType.includes("predict")) return "prediction";
    if (lowerType.includes("anomal")) return "anomaly";
    if (lowerType.includes("recommend")) return "recommendation";
    return "insight";
  };

  const filteredInsights = useMemo(() => {
    let result = insights;

    // Apply filter
    if (filter !== "all") {
      result = result.filter((i) => {
        const type = getInsightType(i.type);
        if (filter === "predictions") return type === "prediction";
        if (filter === "anomalies") return type === "anomaly";
        if (filter === "recommendations") return type === "recommendation";
        return true;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const title = (i.title || "").toLowerCase();
        const summary = (i.summary || "").toLowerCase();
        const type = (i.type || "").toLowerCase();
        return title.includes(q) || summary.includes(q) || type.includes(q);
      });
    }

    // Sort latest first
    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [insights, filter, searchQuery]);

  const counts = useMemo(() => {
    const all = insights.length;
    const predictions = insights.filter((i) => getInsightType(i.type) === "prediction").length;
    const anomalies = insights.filter((i) => getInsightType(i.type) === "anomaly").length;
    const recommendations = insights.filter((i) => getInsightType(i.type) === "recommendation").length;
    return { all, predictions, anomalies, recommendations };
  }, [insights]);

  // ✅ Reset page when filters/search change or list shrinks
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // ✅ Pagination calculations
  const totalItems = filteredInsights.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedInsights = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInsights.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInsights, currentPage]);

  // If page is now out of range (e.g., fewer results after refresh)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalItems);

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load insights</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI Insights for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-generated predictions, anomalies, and recommendations
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as InsightFilter)}
          className="flex-shrink-0"
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs">
              Predictions ({counts.predictions})
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs">
              Anomalies ({counts.anomalies})
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">
              Reco ({counts.recommendations})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Search insights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background/50"
        />
      </div>

      {/* Insights List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </Card>
            ))
          ) : totalItems === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No insights match your search" : "No insights found"}
              </p>
            </Card>
          ) : (
            paginatedInsights.map((insight) => {
              const insightType = getInsightType(insight.type);
              const Icon = typeIcons[insightType] || Brain;

              return (
                <Card
                  key={insight.id}
                  className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => onItemClick?.(insight)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onItemClick?.(insight)}
                  aria-label={`View details for insight: ${insight.title}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${typeColors[insightType] || typeColors.insight}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${typeColors[insightType] || typeColors.insight}`}
                        >
                          {insightType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(insight.timestamp, "MMM dd, HH:mm")}
                      </div>
                    </div>

                    <p className="font-medium">{insight.title}</p>

                    {insight.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {insight.summary}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* ✅ Pagination */}
      {!loading && totalItems > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          itemName="insights"
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default InsightsDrilldown;
