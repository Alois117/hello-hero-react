/**
 * VeeamDetail - Detail renderer for a Veeam Job item
 */
import { HardDrive, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VeeamJobItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface VeeamDetailProps {
  item: VeeamJobItem;
}

const getJobStatus = (severity: string): string => {
  const lower = (severity || "").toLowerCase();
  if (lower === "success" || lower === "completed") return "success";
  if (lower === "failed" || lower === "error") return "failed";
  if (lower === "warning") return "warning";
  return "unknown";
};

const statusColors: Record<string, string> = {
  success: "border-success/30 bg-success/10 text-success",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-warning/30 bg-warning/10 text-warning",
  unknown: "border-muted/30 bg-muted/10 text-muted-foreground",
};

const statusIcons: Record<string, React.ElementType> = {
  success: CheckCircle,
  failed: XCircle,
  warning: AlertCircle,
  unknown: Clock,
};

const VeeamDetail = ({ item }: VeeamDetailProps) => {
  const status = getJobStatus(item.severity);
  const StatusIcon = statusIcons[status] || Clock;

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${statusColors[status]}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${statusColors[status]}`}
            >
              {status}
            </Badge>
            {item.type && (
              <Badge variant="outline" className="text-xs border-border/50">
                {item.type}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Job Information</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Job ID" value={item.id} mono />
          <DetailField label="Severity" value={item.severity} />
          {item.lastRun && (
            <DetailField
              label="Last Run"
              value={
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {format(item.lastRun, "PPP p")}
                </span>
              }
            />
          )}
          {item.nextRun && (
            <DetailField
              label="Next Run"
              value={
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {format(item.nextRun, "PPP p")}
                </span>
              }
            />
          )}
          {item.type && (
            <DetailField label="Job Type" value={item.type} />
          )}
          {item.status && (
            <DetailField label="Status" value={item.status} />
          )}
        </div>
      </div>

      {/* Raw Data */}
      <Separator className="bg-border/50" />
      <RawJsonSection data={item} label="Technical Details (JSON)" />
    </div>
  );
};

export default VeeamDetail;
