import { useState, useCallback } from "react";
import UserLayout from "@/layouts/UserLayout";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import useReports, { ReportItem } from "@/hooks/useReports";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import ReportsList from "@/components/reports/ReportsList";
import ReportsPagination from "@/components/reports/ReportsPagination";
import ReportsConnectionStatus from "@/components/reports/ReportsConnectionStatus";
import CustomReportPicker from "@/components/reports/CustomReportPicker";
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
    dateRange,
    setDateRange,
    fetchCustomReports,
  } = useReports();

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleReportClick = useCallback((report: ReportItem) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  }, []);

  const handleDownloadPdf = useCallback((report: ReportItem) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Report - ${format(new Date(report.created_at), "PPP")}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 1.2cm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                color: #1a1a1a;
                line-height: 1.6;
                font-size: 12px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse;
                page-break-inside: auto; 
                margin: 0.5rem 0;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 0.5rem;
                text-align: left;
              }
              th {
                background: #f3f4f6;
                font-weight: 600;
              }
              tr { 
                page-break-inside: avoid; 
                page-break-after: auto; 
              }
              img { 
                max-width: 100%; 
                height: auto; 
                page-break-inside: avoid; 
              }
              h1, h2, h3 { page-break-after: avoid; }
              h1 { font-size: 1.5rem; }
              h2 { font-size: 1.25rem; }
              h3 { font-size: 1.1rem; }
            </style>
          </head>
          <body>
            ${report.report_template}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 800);
    }
  }, []);

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

        {/* Summary Cards - Read-only, not clickable */}
        <ReportSummaryCards counts={counts} />

        {/* Custom Reports Picker */}
        <CustomReportPicker
          dateRange={dateRange}
          setDateRange={setDateRange}
          onGenerate={fetchCustomReports}
          isLoading={loading}
        />

        {/* Main Content Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Reports List */}
          <TabsContent value={selectedType} className="space-y-4 mt-0">
            <ReportsList
              reports={paginatedReports}
              loading={loading}
              onReportClick={handleReportClick}
            />

            {/* Pagination */}
            <ReportsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredReports.length}
              pageSize={pageSize}
            />
          </TabsContent>
        </Tabs>

        {/* AI Summary Card */}
        {/* <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h3 className="font-semibold">AI Summary</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Total reports available:{" "}
              <span className="text-blue-400 font-medium">{counts.total}</span>
            </p>
            <p>
              Daily reports:{" "}
              <span className="text-emerald-400 font-medium">{counts.daily}</span> | Weekly:{" "}
              <span className="text-amber-400 font-medium">{counts.weekly}</span> | Monthly:{" "}
              <span className="text-purple-400 font-medium">{counts.monthly}</span>
            </p>
            {lastUpdated && (
              <p>
                Data refreshed automatically every 30 seconds for real-time monitoring.
              </p>
            )}
          </div>
        </div> */}
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
