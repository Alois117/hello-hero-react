/**
 * Reports Drilldown Component
 * Shows detailed reports list for the selected organization
 * Matches User Dashboard Reports behavior: View button, PDF button, Side Drawer
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, XCircle, RefreshCw, Calendar, ChevronLeft, ChevronRight, Eye, Download, Loader2, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import ReportDrawer from "@/components/reports/ReportDrawer";

interface ReportsDrilldownProps {
  orgName: string;
  reports: ReportItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: ReportItem) => void;
}

type ReportFilter = "all" | "daily" | "weekly" | "monthly";

const typeColors: Record<string, string> = {
  daily: "border-primary/30 bg-primary/10 text-primary",
  weekly: "border-accent/30 bg-accent/10 text-accent",
  monthly: "border-secondary/30 bg-secondary/10 text-secondary",
};

const PAGE_SIZE = 8;

const ReportsDrilldown = ({ orgName, reports, loading, error, onRefresh }: ReportsDrilldownProps) => {
  const [filter, setFilter] = useState<ReportFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Drawer state
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reset pagination when filtering/searching changes
  useEffect(() => {
    setPage(1);
  }, [filter, searchQuery]);

  const filteredReports = useMemo(() => {
    let result = reports;

    if (filter !== "all") {
      result = result.filter((r) => r.report_type === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(query) || r.report_type.toLowerCase().includes(query));
    }

    return result.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }, [reports, filter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: reports.length,
      daily: reports.filter((r) => r.report_type === "daily").length,
      weekly: reports.filter((r) => r.report_type === "weekly").length,
      monthly: reports.filter((r) => r.report_type === "monthly").length,
    }),
    [reports]
  );

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, safePage]);

  const startIndex = filteredReports.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, filteredReports.length);

  const getReportTitle = (report: ReportItem) => {
    const dateStr = format(report.created_at, "MMMM d, yyyy");
    switch (report.report_type) {
      case "daily":
        return `Daily System Health - ${dateStr}`;
      case "weekly":
        return `Weekly Performance Summary - ${format(report.created_at, "'Week of' MMMM d")}`;
      case "monthly":
        return `Monthly Availability Report - ${format(report.created_at, "MMMM yyyy")}`;
      default:
        return `${report.report_type} Report - ${dateStr}`;
    }
  };

  const handleViewClick = useCallback((e: React.MouseEvent, report: ReportItem) => {
    e.stopPropagation();
    // Convert to the shape expected by ReportDrawer (user dashboard ReportItem)
    setSelectedReport({
      report_type: report.report_type,
      report_template: report.report_template || "",
      created_at: report.created_at instanceof Date ? report.created_at.toISOString() : String(report.created_at),
    });
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  }, []);

  const handleDownloadPdf = useCallback(async (e: React.MouseEvent, report: ReportItem) => {
    e.stopPropagation();
    if (!report.report_template) return;

    const reportId = `${report.report_type}_${report.created_at.getTime()}`;
    setDownloadingId(reportId);

    try {
      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0; padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px; line-height: 1.6; color: #e2e8f0; background: #0f172a !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important;
          }
          table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; background: #1e293b !important; border-radius: 0.5rem; overflow: hidden; }
          th, td { border: 1px solid #334155; padding: 0.5rem; text-align: left; }
          th { background: #334155 !important; font-weight: 600; color: #f1f5f9; }
          img { max-width: 100%; height: auto; border-radius: 0.5rem; }
          h1, h2, h3, h4, h5, h6 { color: #f1f5f9; margin-top: 1.5rem; margin-bottom: 0.75rem; }
          h1 { font-size: 1.5rem; } h2 { font-size: 1.25rem; } h3 { font-size: 1.1rem; }
          p { margin-bottom: 1rem; }
          .success, .ok, .green { color: #22c55e !important; }
          .warning, .yellow { color: #eab308 !important; }
          .error, .critical, .red { color: #ef4444 !important; }
        </style>
        <div style="padding: 1.5rem; background: #0f172a;">${report.report_template}</div>
      `;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `report-${report.report_type}-${format(report.created_at, "yyyy-MM-dd")}.pdf`,
        image: { type: "jpeg" as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0f172a", logging: false },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
      };

      await html2pdf().set(options).from(container).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load reports</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Reports for {orgName}
            </h3>
            <p className="text-sm text-muted-foreground">Generated reports and their schedules</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ReportFilter)} className="flex-shrink-0">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="daily" className="text-xs">Daily ({counts.daily})</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">Weekly ({counts.weekly})</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Monthly ({counts.monthly})</TabsTrigger>
            </TabsList>
          </Tabs>

          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-background/50"
          />
        </div>

        {/* Reports List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-5 border-border/50">
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
              ))
            ) : paginatedReports.length === 0 ? (
              <Card className="p-8 border-border/50 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{searchQuery ? "No reports match your search" : "No reports found"}</p>
              </Card>
            ) : (
              paginatedReports.map((report, index) => {
                const reportId = `${report.report_type}_${report.created_at.getTime()}`;
                return (
                  <Card
                    key={report.id}
                    className="p-5 border-border/50 hover:border-primary/30 transition-colors duration-200 group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                          <BarChart3 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-base font-semibold group-hover:text-primary transition-colors">
                            {getReportTitle(report)}
                          </h4>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`${typeColors[report.report_type] || typeColors.daily} capitalize text-xs`}
                            >
                              {report.report_type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                report.status === "completed"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-warning/30 bg-warning/10 text-warning"
                              }`}
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Generated {format(report.created_at, "PPP 'at' p")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - matching User Dashboard */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewClick(e, report)}
                          disabled={!report.report_template}
                          className="border-primary/30 hover:border-primary hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDownloadPdf(e, report)}
                          disabled={!report.report_template || downloadingId === reportId}
                          className="border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                        >
                          {downloadingId === reportId ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Pagination (8 per page) */}
        {!loading && filteredReports.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {startIndex}-{endIndex} of {filteredReports.length} reports
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <p className="text-xs text-muted-foreground px-2">
                Page {safePage} / {totalPages}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Report Drawer - identical to User Dashboard */}
      <ReportDrawer
        report={selectedReport}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

export default ReportsDrilldown;
