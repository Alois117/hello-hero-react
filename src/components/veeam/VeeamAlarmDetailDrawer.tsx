import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Server,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Hash,
  Bell,
  Bot,
} from "lucide-react";
import { VeeamAlarm, formatAlarmTime } from "@/hooks/useVeeamAlarms";
import { useToast } from "@/hooks/use-toast";

interface VeeamAlarmDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alarm: VeeamAlarm | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "warning":
      return "bg-warning/20 text-warning border-warning/30";
    case "high":
      return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    case "info":
      return "bg-primary/20 text-primary border-primary/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "acknowledged":
      return "bg-warning/20 text-warning border-warning/30";
    case "resolved":
      return "bg-success/20 text-success border-success/30";
    case "suppressed":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

const VeeamAlarmDetailDrawer = ({
  open,
  onOpenChange,
  alarm,
}: VeeamAlarmDetailDrawerProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  if (!alarm) return null;

  const handleCopyDedupeKey = () => {
    navigator.clipboard.writeText(alarm.dedupe_key || "");
    toast({
      title: "Copied to clipboard",
      description: "Dedupe key has been copied to your clipboard.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto"
        aria-label="Veeam alarm details drawer"
      >
        <SheetHeader>
          <SheetTitle>Alarm Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getStatusColor(alarm.status)}>
                {alarm.status}
              </Badge>
              <Badge className={getSeverityColor(alarm.severity)}>
                {alarm.severity}
              </Badge>
            </div>

            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              {alarm.name}
            </h2>
          </div>

          {/* Affected Entity */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Affected Entity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Entity Type</p>
                <p className="font-medium">{alarm.entity_type || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Entity Name</p>
                <p className="font-medium break-all">{alarm.entity_name || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {alarm.description || "No description available."}
            </p>
          </div>

          {/* Timeline */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Triggered At</span>
                </div>
                <span className="font-medium text-sm">
                  {formatAlarmTime(alarm.triggered_at)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">First Seen</span>
                </div>
                <span className="font-medium text-sm">
                  {formatAlarmTime(alarm.first_seen)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                </div>
                <span className="font-medium text-sm">
                  {formatAlarmTime(alarm.last_seen)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Resolved At</span>
                </div>
                <span className="font-medium text-sm">
                  {formatAlarmTime(alarm.resolved_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Advanced (Collapsed) */}
          <div className="cyber-card">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-lg font-semibold"
            >
              <span>Advanced</span>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Dedupe Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Dedupe Key
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyDedupeKey}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs font-mono p-2 bg-muted/30 rounded break-all">
                    {alarm.dedupe_key || "N/A"}
                  </p>
                </div>

                {/* Times Sent */}
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Times Sent</span>
                  </div>
                  <span className="font-medium">{alarm.times_sent ?? "N/A"}</span>
                </div>

                {/* Reminder Interval */}
                {alarm.reminder_interval !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Reminder Interval</span>
                    </div>
                    <span className="font-medium">{alarm.reminder_interval} min</span>
                  </div>
                )}

                {/* First AI Response */}
                {alarm.first_ai_response && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      First AI Response
                    </span>
                    <p className="text-xs p-3 bg-muted/30 rounded-lg leading-relaxed">
                      {alarm.first_ai_response}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VeeamAlarmDetailDrawer;
