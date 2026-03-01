/**
 * AI Insights Drilldown Component
 * Reuses user dashboard InsightCard layout/interaction (inline expand/collapse).
 * Existing Super Admin filter/search/pagination logic remains unchanged.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  XCircle,
  Zap,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import TablePagination from "@/components/ui/table-pagination";
import InsightCard from "@/components/AI-Insights/InsightCard";
import type { AiInsight } from "@/hooks/useAiInsights";

interface InsightsDrilldownProps {
  orgName: string;
  insights: InsightItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: InsightItem) => void;
}

type InsightFilter = "all" | "predictions" | "anomalies" | "recommendations";

const PAGE_SIZE = 8;

const getInsightType = (type: string): string => {
  const lowerType = (type || "").toLowerCase();
  if (lowerType.includes("predict")) return "prediction";
  if (lowerType.includes("anomal")) return "anomaly";
  if (lowerType.includes("recommend")) return "recommendation";
  return "insight";
};

const toCardSeverity = (severity?: string): AiInsight["severity"] => {
  const value = (severity || "").toLowerCase();
  if (value.includes("critical") || value.includes("disaster")) return "critical";
  if (value.includes("high") || value.includes("error")) return "high";
  if (value.includes("low")) return "low";
  if (value.includes("warning") || value.includes("average") || value.includes("medium")) return "medium";
  return "info";
};

const toCardType = (type: string, severity?: string, summary?: string, title?: string): AiInsight["type"] => {
  const combined = `${type || ""} ${severity || ""} ${summary || ""} ${title || ""}`.toLowerCase();
  if (combined.includes("predict") || combined.includes("forecast")) return "prediction";
  if (combined.includes("anomal") || combined.includes("outlier")) return "anomaly";
  if (combined.includes("optimi") || combined.includes("improve") || combined.includes("recommend")) {
    return "optimization";
  }
  if (
    combined.includes("alert") ||
    combined.includes("critical") ||
    combined.includes("warning") ||
    combined.includes("problem")
  ) {
    return "alert";
  }
  return "info";
};

const toCardImpact = (severity?: string): AiInsight["impact"] => {
  const mapped = toCardSeverity(severity);
  if (mapped === "critical") return "critical";
  if (mapped === "high") return "high";
  if (mapped === "low") return "low";
  return "medium";
};

const extractHostFromSummary = (summary: string): string => {
  const match = summary.match(/host[:\s]+([^\n\r,.]+)/i);
  return match?.[1]?.trim() || "Unknown Host";
};

const buildRecommendation = (summary: string): string => {
  if (!summary) return "Review the insight details for recommendations";
  const patterns = [
    /recommend[ation]*[s]?:?\s*(.+?)(?:\.|$)/i,
    /suggest[ion]*[s]?:?\s*(.+?)(?:\.|$)/i,
    /action[s]?:?\s*(.+?)(?:\.|$)/i,
  ];
  for (const pattern of patterns) {
    const match = summary.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return "Review the insight details for recommendations";
};

const inferEntityType = (rawType: string, title: string): string => {
  const normalized = rawType.trim();
  if (normalized && normalized.toLowerCase() !== "insight") return normalized;
  const fromTitle = (title || "").match(/^([a-z0-9_.-]+)\s+insight$/i)?.[1];
  return fromTitle ? fromTitle : "insight";
};

const resolveDisplayTitle = (title: string, entityType: string): string => {
  const normalized = (title || "").trim();
  if (normalized && normalized.toLowerCase() !== "ai insight") return normalized;
  if (entityType && entityType.toLowerCase() !== "insight") return `${entityType} Insight`;
  return "AI Insight";
};

const toInsightCardModel = (item: InsightItem): AiInsight => {
  const summary = (item.summary || "").trim();
  const rawType = (item.type || "").trim();
  const entityType = inferEntityType(rawType, item.title);
  const title = resolveDisplayTitle(item.title, entityType);
  const host = extractHostFromSummary(summary);
  const severity = toCardSeverity(item.severity);

  return {
    id: item.id,
    entityType,
    entityId: item.id,
    host,
    eventReference: item.id,
    severity,
    status: "generated",
    createdAt: item.timestamp,
    updatedAt: null,
    responseContent: summary,
    summary,
    title,
    type: toCardType(rawType, item.severity, summary, title),
    impact: toCardImpact(item.severity),
    confidence: 85,
    recommendation: buildRecommendation(summary),
  };
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

const InsightsDrilldown = ({
  orgName,
  insights,
  loading,
  error,
  onRefresh,
}: InsightsDrilldownProps) => {
  const [filter, setFilter] = useState<InsightFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const filteredInsights = useMemo(() => {
    let result = insights;

    if (filter !== "all") {
      result = result.filter((i) => {
        const type = getInsightType(i.type);
        if (filter === "predictions") return type === "prediction";
        if (filter === "anomalies") return type === "anomaly";
        if (filter === "recommendations") return type === "recommendation";
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const title = (i.title || "").toLowerCase();
        const summary = (i.summary || "").toLowerCase();
        const type = (i.type || "").toLowerCase();
        return title.includes(q) || summary.includes(q) || type.includes(q);
      });
    }

    return [...result].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [insights, filter, searchQuery]);

  const counts = useMemo(() => {
    const all = insights.length;
    const predictions = insights.filter((i) => getInsightType(i.type) === "prediction").length;
    const anomalies = insights.filter((i) => getInsightType(i.type) === "anomaly").length;
    const recommendations = insights.filter((i) => getInsightType(i.type) === "recommendation").length;
    return { all, predictions, anomalies, recommendations };
  }, [insights]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const totalItems = filteredInsights.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedInsights = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInsights.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInsights, currentPage]);

  const insightCards = useMemo(() => paginatedInsights.map(toInsightCardModel), [paginatedInsights]);

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
          <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
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

      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as InsightFilter)} className="flex-shrink-0">
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

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 border-border/50">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-3 w-1/3" />
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
          insightCards.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              expanded={!!expandedInsights[insight.id]}
              onExpandedChange={(open) =>
                setExpandedInsights((prev) => ({
                  ...prev,
                  [insight.id]: open,
                }))
              }
              getImpactColor={getImpactColor}
              getSeverityBadge={getSeverityBadge}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          ))
        )}
      </div>

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
