import { useState, useCallback } from "react";
import { logAuditEvent, AUDIT_EVENTS } from "@/audit-logs";
import UserLayout from "@/layouts/UserLayout";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useReports, { ReportItem } from "@/hooks/useReports";
import useCustomReport from "@/hooks/custom-report/useCustomReport";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import ReportsList from "@/components/reports/ReportsList";
import ReportsPagination from "@/components/reports/ReportsPagination";
import ReportsConnectionStatus from "@/components/reports/ReportsConnectionStatus";
import CustomReportGenerator from "@/components/custom-report/CustomReportGenerator";
import ReportDrawer from "@/components/reports/ReportDrawer";

const UserReports = () => {
  const {
    loading,
    error,
    counts,
    isConnected,
    lastUpdated,
    paginatedReports,
    filteredReports,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
  } = useReports();

  const {
    generating: customGenerating,
    error: customError,
    generateCustomReport,
    paginatedReports: customPaginatedReports,
    filteredReports: customFilteredReports,
    searchQuery: customSearchQuery,
    setSearchQuery: setCustomSearchQuery,
    currentPage: customCurrentPage,
    setCurrentPage: setCustomCurrentPage,
    totalPages: customTotalPages,
    pageSize: customPageSize,
    count: customCount,
    loading: customLoading,
  } = useCustomReport();

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleReportClick = useCallback((report: ReportItem) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
    logAuditEvent(AUDIT_EVENTS.REPORT_VIEW, {
      entity_type: "report",
      entity_id: String(report.created_at),
      meta: { type: report.report_type },
    });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  }, []);

  const isCustomTab = selectedType === "custom";

  return (
    <UserLayout>
      <div className="space-y-4 sm:space-y-6 3xl:space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">Generated insights and analytics</p>
            </div>
          </div>
          <ReportsConnectionStatus isConnected={isConnected} lastUpdated={lastUpdated} />
        </div>

        {/* Summary Cards */}
        <ReportSummaryCards counts={counts} customCount={customCount} />

        {/* Custom Report Generator */}
        <CustomReportGenerator
          onGenerate={generateCustomReport}
          isGenerating={customGenerating}
        />

        {/* Main Content Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={isCustomTab ? customSearchQuery : searchQuery}
                onChange={(e) =>
                  isCustomTab
                    ? setCustomSearchQuery(e.target.value)
                    : setSearchQuery(e.target.value)
                }
                className="pl-9 bg-background border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Error States */}
          {error && !isCustomTab && (
            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          {customError && isCustomTab && (
            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
              <p className="text-destructive text-sm">{customError}</p>
            </div>
          )}

          {/* Standard report tabs: all / daily / weekly / monthly */}
          {["all", "daily", "weekly", "monthly"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-0">
              <ReportsList
                reports={paginatedReports}
                loading={loading}
                onReportClick={handleReportClick}
              />
              <ReportsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredReports.length}
                pageSize={pageSize}
              />
            </TabsContent>
          ))}

          {/* Custom reports tab */}
          <TabsContent value="custom" className="space-y-4 mt-0">
            <ReportsList
              reports={customPaginatedReports}
              loading={customLoading || customGenerating}
              onReportClick={handleReportClick}
            />
            <ReportsPagination
              currentPage={customCurrentPage}
              totalPages={customTotalPages}
              onPageChange={setCustomCurrentPage}
              totalItems={customFilteredReports.length}
              pageSize={customPageSize}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Drawer */}
      <ReportDrawer
        report={selectedReport}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </UserLayout>
  );
};

export default UserReports;
