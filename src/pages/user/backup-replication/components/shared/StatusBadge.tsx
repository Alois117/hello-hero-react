import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from "lucide-react";

import type { BackupReplicationStatus } from "@/pages/user/backup-replication/types";

interface StatusBadgeProps {
  status?: BackupReplicationStatus;
  showIcon?: boolean;
  size?: "sm" | "default";
}

function getStatusConfig(status?: string) {
  const s = (status || "").toLowerCase();

  if (s.includes("success") || s === "ok" || s === "healthy") {
    return {
      variant: "default" as const,
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
      icon: CheckCircle2,
      label: status || "Success",
    };
  }

  if (s.includes("warn") || s.includes("warning")) {
    return {
      variant: "secondary" as const,
      className: "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
      icon: AlertTriangle,
      label: status || "Warning",
    };
  }

  if (s.includes("stale") || s.includes("overdue")) {
    return {
      variant: "destructive" as const,
      className: "bg-orange-500/15 text-orange-600 border-orange-500/30 hover:bg-orange-500/20",
      icon: Clock,
      label: status || "Stale",
    };
  }

  if (s.includes("fail") || s.includes("error") || s.includes("critical")) {
    return {
      variant: "destructive" as const,
      className: "bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/20",
      icon: XCircle,
      label: status || "Failed",
    };
  }

  return {
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground border-border",
    icon: HelpCircle,
    label: status || "Unknown",
  };
}

export default function StatusBadge({ status, showIcon = true, size = "default" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-medium border",
        config.className,
        size === "sm" && "text-xs px-1.5 py-0"
      )}
    >
      {showIcon && <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {config.label}
    </Badge>
  );
}
