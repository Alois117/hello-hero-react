import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SystemLogEntry } from "@/hooks/super-admin/system-logs/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: SystemLogEntry | null;
}

const severityVariant = (s: string) =>
  s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

const SystemLogDetailDrawer = ({ open, onOpenChange, log }: Props) => {
  const { toast } = useToast();

  if (!log) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast({ title: "Copied to clipboard", description: "Log entry copied." });
  };

  const detailEntries = log.details ? Object.entries(log.details) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant(log.severity)}>
              {log.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">{log.source}</Badge>
          </div>

          {/* Key-value fields */}
          <div className="cyber-card space-y-3">
            {[
              { label: "Event", value: log.event.replace(/_/g, " ") },
              { label: "User", value: log.user },
              { label: "IP Address", value: log.ipAddress },
              { label: "Timestamp", value: new Date(log.timestamp).toLocaleString() },
              { label: "ID", value: log.id },
            ].map((f) => (
              <div key={f.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-right max-w-[60%] break-all">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Extended details */}
          {detailEntries.length > 0 && (
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Extended Details</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
              <div className="space-y-2">
                {detailEntries.map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground">{key}: </span>
                    <span className="font-mono text-xs break-all">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="cyber-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Raw JSON</h3>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <pre className="p-3 bg-muted/50 rounded-lg text-xs overflow-auto max-h-64 font-mono">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SystemLogDetailDrawer;
