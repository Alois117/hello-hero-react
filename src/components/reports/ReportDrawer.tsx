import { useState, useMemo, useRef } from "react";
import { X, Download, FileText, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ReportItem } from "@/hooks/useReports";

interface ReportDrawerProps {
  report: ReportItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportDrawer = ({ report, isOpen, onClose }: ReportDrawerProps) => {
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build complete HTML document for iframe
  const iframeSrcDoc = useMemo(() => {
    if (!report?.report_template) return "";
    
    // Wrap the report content in a proper HTML document with styling
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #e2e8f0;
      background: #0f172a;
    }
    body {
      padding: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      background: #1e293b;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    th, td {
      border: 1px solid #334155;
      padding: 0.75rem 1rem;
      text-align: left;
    }
    th {
      background: #334155;
      font-weight: 600;
      color: #f1f5f9;
    }
    tr:hover {
      background: #1e293b;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #f1f5f9;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 1.875rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p {
      margin-bottom: 1rem;
    }
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    li {
      margin-bottom: 0.25rem;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }
    a {
      color: #60a5fa;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    pre, code {
      background: #1e293b;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
    }
    pre {
      padding: 1rem;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #94a3b8;
    }
    hr {
      border: none;
      border-top: 1px solid #334155;
      margin: 1.5rem 0;
    }
    .success, .ok, .green { color: #22c55e; }
    .warning, .yellow { color: #eab308; }
    .error, .critical, .red { color: #ef4444; }
  </style>
</head>
<body>
  ${report.report_template}
</body>
</html>`;
  }, [report?.report_template]);

  const handlePrintPdf = async () => {
    if (!report) return;
    setIsGeneratingPdf(true);

    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        // Use color-preserving styles matching the UI dark theme
        printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Report - ${format(new Date(report.created_at), "PPP")}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 1.2cm;
    }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #e2e8f0;
      background: #0f172a !important;
    }
    body { padding: 1.5rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5rem 0;
      background: #1e293b !important;
      border-radius: 0.5rem;
      overflow: hidden;
      page-break-inside: auto;
    }
    th, td {
      border: 1px solid #334155;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #334155 !important;
      font-weight: 600;
      color: #f1f5f9;
    }
    tr { page-break-inside: avoid; page-break-after: auto; }
    img { max-width: 100%; height: auto; page-break-inside: avoid; border-radius: 0.5rem; }
    h1, h2, h3, h4, h5, h6 {
      color: #f1f5f9;
      page-break-after: avoid;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.1rem; }
    p { margin-bottom: 1rem; }
    ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.25rem; }
    a { color: #60a5fa; text-decoration: none; }
    pre, code {
      background: #1e293b !important;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
    }
    pre { padding: 1rem; overflow-x: auto; }
    blockquote {
      border-left: 4px solid #3b82f6;
      margin: 1rem 0;
      padding-left: 1rem;
      color: #94a3b8;
    }
    hr { border: none; border-top: 1px solid #334155; margin: 1.5rem 0; }
    .success, .ok, .green { color: #22c55e !important; }
    .warning, .yellow { color: #eab308 !important; }
    .error, .critical, .red { color: #ef4444 !important; }
  </style>
</head>
<body>${report.report_template}</body>
</html>`);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 800);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "daily":
        return "bg-primary/20 text-primary border-primary/30";
      case "weekly":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "monthly":
        return "bg-accent/20 text-accent border-accent/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (!isOpen || !report) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-drawer-title"
        className={`
          fixed top-0 right-0 h-full z-50
          bg-card border-l border-border
          transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          shadow-2xl shadow-black/20
          ${isFullWidth ? "w-full" : "w-full max-w-5xl"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="report-drawer-title" className="font-semibold text-foreground">
                <Badge variant="outline" className={`${getTypeColor(report.report_type)} capitalize`}>
                  {report.report_type}
                </Badge>
                <span className="ml-2 text-sm font-normal text-muted-foreground">Report</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {format(new Date(report.created_at), "PPP 'at' p")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print PDF - Opens print dialog */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              disabled={isGeneratingPdf}
              className="border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPdf ? "Generating..." : "Print PDF"}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="hover:bg-muted"
              title={isFullWidth ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullWidth ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content - Sandboxed iframe for secure rendering */}
        <div className="h-[calc(100vh-73px)] bg-background">
          <iframe
            ref={iframeRef}
            title="Report Preview"
            srcDoc={iframeSrcDoc}
            sandbox="allow-same-origin"
            className="w-full h-full border-none"
            style={{ display: "block" }}
          />
        </div>
      </div>
    </>
  );
};

export default ReportDrawer;
