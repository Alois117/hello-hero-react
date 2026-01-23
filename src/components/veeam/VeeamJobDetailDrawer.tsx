import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Server,
  HardDrive,
  Calendar,
  Target,
  Activity,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TransformedVeeamJob, formatDuration, formatBytes } from "@/hooks/useVeeamBackupAndReplication";
import { useToast } from "@/hooks/use-toast";

interface VeeamJobDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: TransformedVeeamJob | null;
}

const getStatusColor = (status: TransformedVeeamJob["status"]) => {
  switch (status) {
    case "Success": return "bg-success/20 text-success border-success/30";
    case "Warning": return "bg-warning/20 text-warning border-warning/30";
    case "Failed": return "bg-destructive/20 text-destructive border-destructive/30";
    case "Running": return "bg-primary/20 text-primary border-primary/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

const VeeamJobDetailDrawer = ({
  open,
  onOpenChange,
  job,
}: VeeamJobDetailDrawerProps) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const { toast } = useToast();

  if (!job) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(job.rawMessage, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Raw JSON has been copied to your clipboard.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl overflow-y-auto"
        aria-label="Veeam job details drawer"
      >
        <SheetHeader>
          <SheetTitle>Job Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
              <Badge variant="outline">{job.platform}</Badge>
              <Badge variant="secondary">{job.jobType}</Badge>
            </div>

            <h2 className="text-xl font-bold">{job.vmName}</h2>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {job.lastRun.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Job Summary */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Job Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Job Type</p>
                <p className="font-medium">{job.jobType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">{job.target}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Schedule</p>
                <p className="font-medium">{job.schedule}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="font-medium">{job.platform}</p>
              </div>
            </div>
          </div>

          {/* Job Name Card */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Job Configuration
            </h3>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-mono break-all">{job.jobName}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              <span>ESXi Host: <span className="font-medium text-foreground">{job.esxiHost}</span></span>
            </div>
          </div>

          {/* Metrics */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Metrics
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Run Duration</span>
                </div>
                <span className="font-semibold">{formatDuration(job.durationSec)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Average Duration</span>
                </div>
                <span className="font-semibold">{formatDuration(job.avgDurationSec)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Transferred</span>
                </div>
                <span className="font-semibold">{formatBytes(job.dataTransferredBytes)}</span>
              </div>
            </div>
          </div>

          {/* Advanced - Raw JSON (Collapsible) */}
          <div className="cyber-card">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between text-lg font-semibold"
            >
              <span>Advanced</span>
              {showRawJson ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            {showRawJson && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Raw JSON Payload</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 bg-muted/50 rounded-lg text-xs overflow-auto max-h-64 font-mono">
                  {JSON.stringify(job.rawMessage, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VeeamJobDetailDrawer;
