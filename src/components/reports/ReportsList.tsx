import { format } from "date-fns";
import { FileText, Calendar, BarChart3, Download, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportItem } from "@/hooks/useReports";

interface ReportsListProps {
  reports: ReportItem[];
  loading: boolean;
  onReportClick: (report: ReportItem) => void;
  onDownloadPdf: (report: ReportItem) => void;
}

const ReportsList = ({ reports, loading, onReportClick, onDownloadPdf }: ReportsListProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "weekly":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "monthly":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getReportTitle = (report: ReportItem) => {
    const dateStr = format(new Date(report.created_at), "MMMM d, yyyy");
    switch (report.report_type) {
      case "daily":
        return `Daily System Health - ${dateStr}`;
      case "weekly":
        return `Weekly Performance Summary - ${format(new Date(report.created_at), "'Week of' MMMM d")}`;
      case "monthly":
        return `Monthly Availability Report - ${format(new Date(report.created_at), "MMMM yyyy")}`;
      default:
        return `${report.report_type} Report - ${dateStr}`;
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, report: ReportItem) => {
    e.stopPropagation();
    onDownloadPdf(report);
  };

  const handleViewClick = (e: React.MouseEvent, report: ReportItem) => {
    e.stopPropagation();
    onReportClick(report);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Reports Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              No reports match your current filters. Try adjusting your search or date range.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report, index) => (
        <Card
          key={`${report.report_type}_${report.created_at}`}
          className="p-5 border-border/50 hover:border-primary/30 transition-colors duration-200 group"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                  {getReportTitle(report)}
                </h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${getTypeColor(report.report_type)} capitalize text-xs`}>
                    {report.report_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Generated {format(new Date(report.created_at), "PPP 'at' p")}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Always Visible */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleViewClick(e, report)}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDownloadClick(e, report)}
                className="border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReportsList;
