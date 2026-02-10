/**
 * ReportDetail - Detail renderer for a Report item
 */
import { FileText, Calendar, Hash, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReportItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface ReportDetailProps {
  item: ReportItem;
}

const typeColors: Record<string, string> = {
  daily: "border-primary/30 bg-primary/10 text-primary",
  weekly: "border-accent/30 bg-accent/10 text-accent",
  monthly: "border-secondary/30 bg-secondary/10 text-secondary",
};

const ReportDetail = ({ item }: ReportDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Title & Type */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
          <FileText className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${typeColors[item.report_type] || typeColors.daily}`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {item.report_type}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                item.status === "completed"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-warning/30 bg-warning/10 text-warning"
              }`}
            >
              {item.status}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Report Information</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailField
            label="Created"
            value={
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                {format(item.created_at, "PPP p")}
              </span>
            }
          />
          <DetailField label="Report ID" value={item.id} mono />
          <DetailField label="Report Type" value={item.report_type} />
          <DetailField label="Status" value={item.status} />
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

      {/* Raw Data */}
      <Separator className="bg-border/50" />
      <RawJsonSection data={item} label="Technical Details (JSON)" />
    </div>
  );
};

export default ReportDetail;
