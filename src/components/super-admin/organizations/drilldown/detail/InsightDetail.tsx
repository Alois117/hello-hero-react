/**
 * InsightDetail - Detail renderer for an AI Insight item
 */
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InsightItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface InsightDetailProps {
  item: InsightItem;
}

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

const getInsightType = (type: string): string => {
  const lowerType = (type || "").toLowerCase();
  if (lowerType.includes("predict")) return "prediction";
  if (lowerType.includes("anomal")) return "anomaly";
  if (lowerType.includes("recommend")) return "recommendation";
  return "insight";
};

const InsightDetail = ({ item }: InsightDetailProps) => {
  const insightType = getInsightType(item.type);
  const Icon = typeIcons[insightType] || Brain;

  return (
    <div className="space-y-6">
      {/* Title & Type */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${typeColors[insightType] || typeColors.insight}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${typeColors[insightType] || typeColors.insight}`}
            >
              {insightType}
            </Badge>
            {item.severity && (
              <Badge variant="outline" className="text-xs capitalize border-border/50">
                {item.severity}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Insight Information</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailField
            label="Timestamp"
            value={
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {format(item.timestamp, "PPP p")}
              </span>
            }
          />
          <DetailField label="Type" value={insightType} />
          <DetailField label="Insight ID" value={item.id} mono />
          {item.client_id != null && (
            <DetailField
              label="Client ID"
              value={
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.client_id}
                </span>
              }
              mono
            />
          )}
        </div>
      </div>

      {/* Summary */}
      {item.summary && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {item.summary}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Raw Data */}
      <Separator className="bg-border/50" />
      <RawJsonSection data={item} label="Technical Details (JSON)" />
    </div>
  );
};

export default InsightDetail;
