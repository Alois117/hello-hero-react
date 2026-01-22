import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, AlertTriangle, AlertCircle, Info, Skull, Minus } from "lucide-react";

export type AlertSeverity = "disaster" | "critical" | "high" | "warning" | "average" | "info";

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

interface SeverityConfig {
  label: string;
  className: string;
  icon: React.ElementType;
}

const severityConfig: Record<AlertSeverity, SeverityConfig> = {
  disaster: {  
    label: "DISASTER",
    className: "bg-purple-600 text-background border-purple-600 font-bold",
    icon: Skull,  
  },
  critical: {
    label: "CRITICAL",
    className: "bg-destructive text-background border-destructive font-bold",
    icon: X,
  },
  high: {
    label: "HIGH",
    className: "bg-accent text-background border-accent font-bold",
    icon: AlertTriangle,
  },
  warning: {
    label: "WARNING",
    className: "bg-warning text-background border-warning font-bold",
    icon: AlertCircle,
  },
  average: {  
    label: "AVERAGE",
    className: "bg-amber-500 text-background border-amber-500 font-bold",
    icon: Minus,  
  },
  info: {
    label: "INFO",
    className: "bg-primary text-background border-primary font-bold",
    icon: Info,
  },
};

const SeverityBadge = ({ severity, className = "" }: SeverityBadgeProps) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 border-2 text-xs",
        config.className,
        className
      )}
      aria-label={`Severity: ${config.label}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.slice(0, 4)}</span>
    </Badge>
  );
};

export default SeverityBadge;