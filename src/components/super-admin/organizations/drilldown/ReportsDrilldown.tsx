/**
 * Reports Drilldown Component
 * Shows detailed reports list for the selected organization
 */
import { useEffect, useMemo, useState } from "react";
import { FileText, XCircle, RefreshCw, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";

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

const ReportsDrilldown = ({ orgName, reports, loading, error, onRefresh, onItemClick }: ReportsDrilldownProps) => {
  const [filter, setFilter] = useState<ReportFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

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
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs">
              Daily ({counts.daily})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              Weekly ({counts.weekly})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly ({counts.monthly})
            </TabsTrigger>
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
        <div className="space-y-2 pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
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
            paginatedReports.map((report) => (
              <Card
                key={report.id}
                className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onItemClick?.(report)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onItemClick?.(report)}
                aria-label={`View details for report: ${report.name}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{report.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{format(report.created_at, "PPP")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${typeColors[report.report_type] || typeColors.daily}`}
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
                </div>
              </Card>
            ))
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
  );
};

export default ReportsDrilldown;
