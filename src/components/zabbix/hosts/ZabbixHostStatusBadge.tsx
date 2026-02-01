import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface ZabbixHostStatusBadgeProps {
  status: "enabled" | "disabled";
}

/**
 * Status badge for Zabbix hosts
 * Matches the visual style used in AlertsTable
 */
const ZabbixHostStatusBadge = ({ status }: ZabbixHostStatusBadgeProps) => {
  if (status === "enabled") {
    return (
      <Badge
        variant="outline"
        className="border-success/30 bg-success/10 text-success gap-1"
      >
        <CheckCircle className="w-3 h-3" />
        Enabled
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-destructive/30 bg-destructive/10 text-destructive gap-1"
    >
      <XCircle className="w-3 h-3" />
      Disabled
    </Badge>
  );
};

export default ZabbixHostStatusBadge;
