/**
 * SuperAdminInsightsView
 * Shared AI Insights component for Super Admin that matches the User Dashboard layout.
 * Used in both Global Overview and Organization Explorer drilldowns.
 */
import { useMemo, useState, useCallback } from "react";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Zap,
  Info,
  Brain,
  Clock,
  Server,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table-pagination";
import InsightCard from "@/components/AI-Insights/InsightCard";
import type { AiInsight } from "@/hooks/useAiInsights";
import { getRelativeTime } from "@/hooks/useAiInsights";
import type { InsightItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";

interface SuperAdminInsightsViewProps {
  /** Label for the context (e.g. org name or "Selected Organizations") */
  contextLabel: string;
  insights: InsightItem[];
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 8;

// ── Mapping helpers (InsightItem → AiInsight) ──────────────────────────────

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
  if (combined.includes("optimi") || combined.includes("improve") || combined.includes("recommend")) return "optimization";
  if (combined.includes("alert") || combined.includes("critical") || combined.includes("warning") || combined.includes("problem")) return "alert";
  return "info";
};

const toCardImpact = (severity?: string): AiInsight["impact"] => {
  const mapped = toCardSeverity(severity);
  if (mapped === "critical") return "critical";
  if (mapped === "high") return "high";
  if (mapped === "low") return "low";
  return "medium";
};

const extractHost = (summary: string): string => {
  const match = summary.match(/\*\*Host:\*\*\s*([^\n\r]+)/i)
    || summary.match(/host[:\s]+([^\n\r,.]+)/i);
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

const resolveTitle = (title: string, entityType: string): string => {
  const normalized = (title || "").trim();
  if (normalized && normalized.toLowerCase() !== "ai insight") return normalized;
  if (entityType && entityType.toLowerCase() !== "insight") return `${entityType} Insight`;
  return "AI Insight";
};

const toAiInsight = (item: InsightItem): AiInsight => {
  const summary = (item.summary || "").trim();
  const rawType = (item.type || "").trim();
  const entityType = inferEntityType(rawType, item.title);
  const title = resolveTitle(item.title, entityType);
  const host = extractHost(summary);
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

// ── Style helpers (same as User Dashboard) ─────────────────────────────────

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "critical": return "text-error border-error/30 bg-error/10";
    case "high": return "text-accent border-accent/30 bg-accent/10";
    case "medium": return "text-warning border-warning/30 bg-warning/10";
    default: return "text-success border-success/30 bg-success/10";
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
    case "prediction": return <TrendingUp className="w-5 h-5" />;
    case "anomaly": return <Zap className="w-5 h-5" />;
    case "optimization": return <Lightbulb className="w-5 h-5" />;
    case "alert": return <AlertTriangle className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const getTypeColor = (type: AiInsight["type"]) => {
  switch (type) {
    case "prediction": return "text-primary";
    case "anomaly": return "text-warning";
    case "optimization": return "text-success";
    case "alert": return "text-error";
    default: return "text-muted-foreground";
  }
};

// ── Component ──────────────────────────────────────────────────────────────

const SuperAdminInsightsView = ({
  contextLabel,
  insights,
  loading,
  error,
}: SuperAdminInsightsViewProps) => {
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const sortedInsights = useMemo(
    () => [...insights].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [insights]
  );

  const totalCount = sortedInsights.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalCount);

  const paginatedInsights = useMemo(
    () => sortedInsights.slice(startIndex, endIndex),
    [sortedInsights, startIndex, endIndex]
  );

  const insightCards = useMemo(
    () => paginatedInsights.map(toAiInsight),
    [paginatedInsights]
  );

  // Summary metrics
  const highPriorityCount = useMemo(
    () => sortedInsights.filter((i) => {
      const s = (i.severity || "").toLowerCase();
      return s.includes("critical") || s.includes("high") || s.includes("disaster");
    }).length,
    [sortedInsights]
  );

  const last24hCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return sortedInsights.filter((i) => i.timestamp.getTime() >= cutoff).length;
  }, [sortedInsights]);

  const mostAffectedHost = useMemo(() => {
    if (sortedInsights.length === 0) return "—";
    const hostCounts = new Map<string, number>();
    sortedInsights.forEach((i) => {
      const host = extractHost(i.summary || "").toLowerCase();
      if (host && host !== "unknown host") {
        hostCounts.set(host, (hostCounts.get(host) || 0) + 1);
      }
    });
    if (hostCounts.size === 0) return "—";
    let maxCount = 0;
    let topHost = "";
    hostCounts.forEach((count, host) => {
      if (count > maxCount) { maxCount = count; topHost = host; }
    });
    return topHost.split(/[-_.]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
  }, [sortedInsights]);

  const setExpanded = useCallback((id: string, open: boolean) => {
    setExpandedInsights((prev) => ({ ...prev, [id]: open }));
  }, []);

  // Error state
  if (error) {
    return (
      <Card className="p-8 border-destructive/30 bg-destructive/5">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-destructive">Failed to Load Insights</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Insights — {contextLabel}</h3>
          <p className="text-muted-foreground text-sm">
            AI-generated predictions, anomalies, and recommendations
          </p>
        </div>
      </div>

      {/* Summary cards (matching User Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total Insights</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highPriorityCount}</p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{last24hCount}</p>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-warning/30 bg-gradient-to-br from-warning/5 to-warning/15">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning/20">
              <Server className="w-5 h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{mostAffectedHost}</p>
              <p className="text-xs text-muted-foreground">Most Affected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading (initial only) */}
      {loading && totalCount === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 border-border/50">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && totalCount === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-muted">
              <Lightbulb className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Insights Found</h3>
              <p className="text-muted-foreground mt-1">
                No AI insights available for {contextLabel}.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Insight cards (User Dashboard layout) */}
      {totalCount > 0 && (
        <div className="grid gap-4">
          {insightCards.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              expanded={!!expandedInsights[insight.id]}
              onExpandedChange={(open) => setExpanded(insight.id, open)}
              getImpactColor={getImpactColor}
              getSeverityBadge={getSeverityBadge}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          startIndex={startIndex + 1}
          endIndex={endIndex}
          itemName="insights"
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default SuperAdminInsightsView;
