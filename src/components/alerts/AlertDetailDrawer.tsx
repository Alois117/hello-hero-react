import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  Copy,
  Sparkles
} from "lucide-react";
import SeverityBadge, { AlertSeverity } from "./SeverityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface AlertDetail {
  id: number;
  severity: AlertSeverity;
  host: string;
  category: string;
  problem: string;
  duration: string;
  acknowledged: boolean;
  timestamp: string;
  // Extended fields from webhook
  aiInsights?: string;
  timesSent?: number;
  firstSeen?: string;
  lastSeen?: string;
  dedupeKey?: string;
  rawMetadata?: {
    name: string;
    clock: string;
    eventid: string;
    r_clock: string;
    objectid: string;
    severity: string;
  };
}

interface AlertDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: AlertDetail | null;
}

// Parse markdown-style AI response
const parseAIInsights = (aiResponse: string) => {
  if (!aiResponse) return null;
  
  // Clean up the response
  const cleaned = aiResponse.trim();
  
  return cleaned;
};

const AlertDetailDrawer = ({
  open,
  onOpenChange,
  alert,
}: AlertDetailDrawerProps) => {
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  if (!alert) return null;

  const hasRealAIInsights = !!alert.aiInsights;
  const parsedInsights = parseAIInsights(alert.aiInsights || "");

  const handleRetryAI = () => {
    setAiLoading(true);
    setAiError(false);
    setIsStreaming(true);
    setTimeout(() => {
      setAiLoading(false);
      setIsStreaming(false);
    }, 2000);
  };

  const handleCopyInsight = () => {
    const insight = alert.aiInsights || "No AI insights available";
    navigator.clipboard.writeText(insight);
    toast({
      title: "Copied to clipboard",
      description: "AI insight has been copied to your clipboard.",
    });
  };

  // Calculate duration display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-2xl overflow-y-auto"
        aria-label="Alert details drawer"
      >
        <SheetHeader>
          <SheetTitle>Alert Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={alert.severity} />
              <Badge variant="outline">{alert.host}</Badge>
              <Badge variant="secondary">{alert.category}</Badge>
            </div>

            <h2 className="text-2xl font-bold">{alert.problem}</h2>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {alert.duration}
              </span>
              <span>{alert.timestamp}</span>
              {alert.acknowledged && (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle className="w-4 h-4" />
                  Acknowledged
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              aria-label="View alert in Zabbix"
            >
              <ExternalLink className="w-3 h-3" />
              View in Zabbix
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              aria-label="View raw logs"
            >
              <ExternalLink className="w-3 h-3" />
              View Raw Logs
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              aria-label="View in Wazuh"
            >
              <ExternalLink className="w-3 h-3" />
              View in Wazuh
            </Button>
          </div>

          {/* Raw Metadata */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-3">Raw Metadata</h3>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-xs">
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Event ID:</span> {alert.rawMetadata?.eventid || alert.id}</p>
                <p><span className="text-muted-foreground">Object ID:</span> {alert.rawMetadata?.objectid || "N/A"}</p>
                <p><span className="text-muted-foreground">Host:</span> {alert.host}</p>
                <p><span className="text-muted-foreground">Category:</span> {alert.category}</p>
                <p><span className="text-muted-foreground">Severity:</span> {alert.severity.toUpperCase()} ({alert.rawMetadata?.severity || "N/A"})</p>
                <p><span className="text-muted-foreground">Timestamp:</span> {alert.timestamp}</p>
                <p><span className="text-muted-foreground">Duration:</span> {alert.duration}</p>
                <p><span className="text-muted-foreground">Status:</span> {alert.acknowledged ? "Acknowledged" : "Active"}</p>
                {alert.dedupeKey && (
                  <p><span className="text-muted-foreground">Dedupe Key:</span> {alert.dedupeKey}</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights - Real data from webhook */}
          <div className="cyber-card border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Insights</h3>
                {hasRealAIInsights && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!aiLoading && !aiError && hasRealAIInsights && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyInsight}
                    className="gap-2"
                    aria-label="Copy AI insight"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className="gap-2"
                  aria-expanded={showAIInsights}
                  aria-label={showAIInsights ? "Hide AI insights" : "Show AI insights"}
                >
                  {showAIInsights ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showAIInsights && (
              <div className="space-y-3">
                {aiLoading ? (
                  <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                    {isStreaming && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">AI analyzing...</span>
                      </div>
                    )}
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <Skeleton className="h-4 w-5/6 animate-pulse" style={{ animationDelay: "100ms" }} />
                    <Skeleton className="h-4 w-4/6 animate-pulse" style={{ animationDelay: "200ms" }} />
                  </div>
                ) : aiError ? (
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2">AI Insights Unavailable</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Unable to generate AI insights at this time.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetryAI}
                          className="gap-2"
                          aria-label="Retry AI analysis"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : hasRealAIInsights && parsedInsights ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                          {parsedInsights}
                        </pre>
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="reasoning">
                        <AccordionTrigger className="text-sm">
                          View Raw AI Response
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="p-3 bg-muted/50 rounded-lg text-xs overflow-auto max-h-48">
                            {alert.aiInsights}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      aria-label="Get deeper AI explanation"
                    >
                      <Sparkles className="w-3 h-3" />
                      Explain Deeper
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      No AI insights available for this alert.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Throttle/Dedupe - Real data */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-3">
              Throttle & Deduplication
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Occurrences:</span>
                <span className="font-medium">{alert.timesSent || 1} times</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">First Seen:</span>
                <span className="font-medium">{formatDate(alert.firstSeen)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Seen:</span>
                <span className="font-medium">{formatDate(alert.lastSeen)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Throttle Status:</span>
                <Badge variant="secondary">
                  {(alert.timesSent || 1) > 1 ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {!alert.acknowledged && (
              <Button 
                className="flex-1"
                aria-label="Acknowledge this alert"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1"
              aria-label="Add comment to alert"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlertDetailDrawer;
