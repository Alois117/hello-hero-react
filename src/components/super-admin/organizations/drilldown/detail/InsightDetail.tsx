/**
 * InsightDetail - Drawer detail renderer aligned to user insight detail sections.
 */
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Server, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InsightItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { getRelativeTime } from "@/hooks/useAiInsights";

interface InsightDetailProps {
  item: InsightItem;
}

const getInsightType = (type: string): "prediction" | "anomaly" | "recommendation" | "insight" => {
  const lowerType = (type || "").toLowerCase();
  if (lowerType.includes("predict")) return "prediction";
  if (lowerType.includes("anomal")) return "anomaly";
  if (lowerType.includes("recommend")) return "recommendation";
  return "insight";
};

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

const severityBadgeStyles: Record<string, string> = {
  critical: "bg-error/20 text-error border-error/30",
  high: "bg-accent/20 text-accent border-accent/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-success/20 text-success border-success/30",
  info: "bg-primary/20 text-primary border-primary/30",
};

const extractHost = (summary: string) => {
  const match = summary.match(/host[:\s]+([^\n\r,.]+)/i);
  return match?.[1]?.trim() || "N/A";
};

const toStatus = (severity?: string) => {
  const value = (severity || "").toLowerCase();
  if (value.includes("critical") || value.includes("high")) return "active";
  return "observed";
};

const InsightDetail = ({ item }: InsightDetailProps) => {
  const insightType = getInsightType(item.type);
  const Icon = typeIcons[insightType] || Brain;
  const severity = (item.severity || "info").toLowerCase();
  const host = extractHost(item.summary || "");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-lg shrink-0 border ${typeColors[insightType] || typeColors.insight}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-start gap-2">
            <Badge
              variant="outline"
              className={`capitalize ${severityBadgeStyles[severity] || severityBadgeStyles.info}`}
            >
              {severity}
            </Badge>
            <Badge
              variant="outline"
              className={`capitalize ${typeColors[insightType] || typeColors.insight}`}
            >
              {insightType}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Server className="w-3 h-3" />
              {host}
            </Badge>
          </div>

          <h3 className="text-lg leading-tight font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.summary}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{getRelativeTime(item.timestamp)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Entity Type</p>
            <p className="font-medium mt-1">{insightType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Host</p>
            <p className="font-medium mt-1">{host}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
            <p className="font-medium mt-1">{item.timestamp.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
            <Badge variant="outline" className="capitalize mt-1">
              {toStatus(item.severity)}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Full Analysis</p>
          <div className="p-5 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.summary || "No analysis available."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightDetail;
