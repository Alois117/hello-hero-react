/**
 * AlertDetail - Detail renderer for an Alert item
 */
import { AlertTriangle, Clock, Server, Hash, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface AlertDetailProps {
  item: AlertItem;
}

const severityColors: Record<string, string> = {
  disaster: "bg-destructive/20 text-destructive border-destructive/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  average: "bg-accent/20 text-accent border-accent/30",
  info: "bg-primary/20 text-primary border-primary/30",
  information: "bg-primary/20 text-primary border-primary/30",
};

const AlertDetail = ({ item }: AlertDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Title & Severity */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`text-xs capitalize ${severityColors[item.severity] || severityColors.info}`}
              >
                {item.severity}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${
                  item.status === "active"
                    ? "border-warning/30 bg-warning/10 text-warning"
                    : "border-success/30 bg-success/10 text-success"
                }`}
              >
                {item.status}
              </Badge>
              {item.acknowledged && (
                <Badge variant="outline" className="text-xs border-success/30 bg-success/10 text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Acknowledged
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Facts</p>
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
          {item.host && (
            <DetailField
              label="Host"
              value={
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.host}
                </span>
              }
            />
          )}
          {item.eventid && (
            <DetailField
              label="Event ID"
              value={
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.eventid}
                </span>
              }
              mono
            />
          )}
          <DetailField label="Internal ID" value={item.id} mono />
        </div>
      </div>

      {/* Message / Content */}
      {item.message && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</p>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-[12]">
                {item.message}
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

export default AlertDetail;
