import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Loader2, HelpCircle } from "lucide-react";

export type VeeamStatus = "Success" | "Warning" | "Failed" | "Running" | "Unknown";

interface VeeamStatusBadgeProps {
  status: VeeamStatus;
  showIcon?: boolean;
}

const getStatusConfig = (status: VeeamStatus) => {
  switch (status) {
    case "Success":
      return {
        className: "bg-success/20 text-success border-success/30 hover:bg-success/30",
        icon: CheckCircle,
      };
    case "Warning":
      return {
        className: "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
        icon: AlertTriangle,
      };
    case "Failed":
      return {
        className: "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
        icon: XCircle,
      };
    case "Running":
      return {
        className: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
        icon: Loader2,
      };
    default:
      return {
        className: "bg-muted/20 text-muted-foreground border-muted/30 hover:bg-muted/30",
        icon: HelpCircle,
      };
  }
};

const VeeamStatusBadge = ({ status, showIcon = true }: VeeamStatusBadgeProps) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.className} gap-1.5 font-medium`}>
      {showIcon && (
        <Icon className={`w-3.5 h-3.5 ${status === "Running" ? "animate-spin" : ""}`} />
      )}
      {status}
    </Badge>
  );
};

export default VeeamStatusBadge;
