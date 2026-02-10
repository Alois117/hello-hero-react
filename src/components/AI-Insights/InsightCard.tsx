import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Clock, Server } from "lucide-react";
import { type AiInsight, getRelativeTime } from "@/hooks/useAiInsights";

interface InsightCardProps {
  insight: AiInsight;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  getImpactColor: (impact: string) => string;
  getSeverityBadge: (severity: AiInsight["severity"]) => string;
  getTypeIcon: (type: AiInsight["type"]) => JSX.Element;
  getTypeColor: (type: AiInsight["type"]) => string;
  isRead?: boolean;
  onMarkRead?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = React.memo(
  ({
    insight,
    expanded,
    onExpandedChange,
    getImpactColor,
    getSeverityBadge,
    getTypeIcon,
    getTypeColor,
    isRead = false,
    onMarkRead,
  }) => {
    const handleExpandChange = (open: boolean) => {
      if (open && !isRead && onMarkRead) {
        onMarkRead();
      }
      onExpandedChange(open);
    };

    return (
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:border-primary/30",
        isRead ? "opacity-75" : "border-l-2 border-l-primary/40 bg-primary/[0.02]"
      )}>
        <Collapsible open={expanded} onOpenChange={handleExpandChange}>
          {/* Header */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg shrink-0 bg-muted/50 border border-border",
                  getTypeColor(insight.type)
                )}
              >
                {getTypeIcon(insight.type)}
              </div>

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
                  <h3 className={cn("text-lg leading-tight", isRead ? "font-medium text-muted-foreground" : "font-semibold")}>{insight.title}</h3>
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
                    <span className="font-medium text-primary">{insight.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{getRelativeTime(insight.createdAt)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm">
                    <span className="font-medium">Recommendation: </span>
                    <span className="text-muted-foreground">{insight.recommendation}</span>
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {expanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span className="hidden sm:inline">See less</span>
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

          <CollapsibleContent>
            <div className="px-4 pb-6 md:px-6 md:pb-8 pt-0">
              <div className="border-t border-border pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Entity Type
                    </p>
                    <p className="font-medium mt-1">{insight.entityType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Host</p>
                    <p className="font-medium mt-1">{insight.host || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Created
                    </p>
                    <p className="font-medium mt-1">
                      {insight.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <Badge variant="outline" className="capitalize mt-1">
                      {insight.status}
                    </Badge>
                  </div>
                </div>

                {insight.responseContent && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                      Full Analysis
                    </p>
                    <div className="p-5 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {insight.responseContent}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-8">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onExpandedChange(false)}
                    className="gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Close details
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  },
  (prev, next) =>
    prev.insight === next.insight &&
    prev.expanded === next.expanded &&
    prev.isRead === next.isRead &&
    prev.getImpactColor === next.getImpactColor &&
    prev.getSeverityBadge === next.getSeverityBadge &&
    prev.getTypeIcon === next.getTypeIcon &&
    prev.getTypeColor === next.getTypeColor
);

InsightCard.displayName = "InsightCard";

export default InsightCard;