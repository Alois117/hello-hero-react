/**
 * Veeam Jobs Drilldown Component
 * Shows detailed Veeam backup jobs for the selected organization
 */
import { useState, useMemo } from "react";
import { HardDrive, CheckCircle, XCircle, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VeeamJobItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";

interface VeeamDrilldownProps {
  orgName: string;
  jobs: VeeamJobItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: VeeamJobItem) => void;
}

type VeeamFilter = "all" | "success" | "failed" | "warning";

const getJobStatus = (severity: string): string => {
  const lower = severity.toLowerCase();
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

const VeeamDrilldown = ({ orgName, jobs, loading, error, onRefresh, onItemClick }: VeeamDrilldownProps) => {
  const [filter, setFilter] = useState<VeeamFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Apply filter
    if (filter !== "all") {
      result = result.filter(j => getJobStatus(j.severity) === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.name.toLowerCase().includes(query) ||
        j.type?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      if (a.lastRun && b.lastRun) {
        return b.lastRun.getTime() - a.lastRun.getTime();
      }
      return 0;
    });
  }, [jobs, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: jobs.length,
    success: jobs.filter(j => getJobStatus(j.severity) === "success").length,
    failed: jobs.filter(j => getJobStatus(j.severity) === "failed").length,
    warning: jobs.filter(j => getJobStatus(j.severity) === "warning").length,
  }), [jobs]);

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load Veeam jobs</p>
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
            <HardDrive className="w-5 h-5 text-success" />
            Veeam Jobs for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Backup and replication job status
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as VeeamFilter)} className="flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="success" className="text-xs">
              Success ({counts.success})
            </TabsTrigger>
            <TabsTrigger value="failed" className="text-xs">
              Failed ({counts.failed})
            </TabsTrigger>
            <TabsTrigger value="warning" className="text-xs">
              Warning ({counts.warning})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background/50"
        />
      </div>

      {/* Jobs List */}
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
          ) : filteredJobs.length === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <HardDrive className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No jobs match your search" : "No jobs found"}
              </p>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const status = getJobStatus(job.severity);
              const StatusIcon = statusIcons[status] || Clock;
              
              return (
                <Card 
                  key={job.id} 
                  className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => onItemClick?.(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onItemClick?.(job)}
                  aria-label={`View details for job: ${job.name}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${statusColors[status]}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {job.type && <span>{job.type}</span>}
                        {job.lastRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(job.lastRun, "MMM dd, HH:mm")}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline"
                      className={`text-xs capitalize ${statusColors[status]}`}
                    >
                      {status}
                    </Badge>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      {!loading && filteredJobs.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      )}
    </div>
  );
};

export default VeeamDrilldown;
