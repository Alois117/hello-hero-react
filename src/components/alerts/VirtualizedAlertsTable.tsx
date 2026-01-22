import { useState, useCallback, memo } from "react";
// @ts-ignore
import { FixedSizeList } from "react-window";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import SeverityBadge, { AlertSeverity } from "./SeverityBadge";
import AlertActionMenu from "./AlertActionMenu";
import AlertDetailDrawer from "./AlertDetailDrawer";

interface Alert {
  id: number;
  severity: AlertSeverity;
  host: string;
  category: string;
  problem: string;
  duration: string;
  acknowledged: boolean;
  timestamp: string;
}

interface VirtualizedAlertsTableProps {
  alerts: Alert[];
}

const AlertRow = memo(({ data, index, style }: any) => {
  const { alerts, onRowClick } = data;
  const alert = alerts[index];

  return (
    <div
      style={style}
      className="flex items-center border-b border-border hover:bg-muted/50 cursor-pointer transition-colors px-6"
      onClick={() => onRowClick(alert)}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowClick(alert);
        }
      }}
      aria-label={`Alert: ${alert.problem} on ${alert.host}`}
    >
      <div className="flex-1 flex items-center gap-4 py-4">
        <div className="w-24">
          <SeverityBadge severity={alert.severity} />
        </div>
        <div className="w-32">
          <Badge variant="outline">{alert.host}</Badge>
        </div>
        <div className="w-24">
          <Badge variant="secondary">{alert.category}</Badge>
        </div>
        <div className="flex-1 font-medium text-sm">{alert.problem}</div>
        <div className="w-20">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            {alert.duration}
          </span>
        </div>
        <div className="w-32">
          {alert.acknowledged ? (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle className="w-3 h-3" />
              Acknowledged
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Active</span>
          )}
        </div>
        <div className="w-20 text-right" onClick={(e) => e.stopPropagation()}>
          <AlertActionMenu
            alertId={alert.id}
            acknowledged={alert.acknowledged}
            onViewDetails={() => onRowClick(alert)}
          />
        </div>
      </div>
    </div>
  );
});

AlertRow.displayName = "AlertRow";

const VirtualizedAlertsTable = ({ alerts }: VirtualizedAlertsTableProps) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  }, []);

  return (
    <>
      <div className="cyber-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center border-b border-border px-6 py-3 bg-muted/30">
          <div className="w-24 text-sm font-medium">Severity</div>
          <div className="w-32 text-sm font-medium">Host</div>
          <div className="w-24 text-sm font-medium">Category</div>
          <div className="flex-1 text-sm font-medium">Problem</div>
          <div className="w-20 text-sm font-medium">Duration</div>
          <div className="w-32 text-sm font-medium">Status</div>
          <div className="w-20 text-sm font-medium text-right">Actions</div>
        </div>

        {/* Virtualized Table Body */}
        <FixedSizeList
          height={600}
          itemCount={alerts.length}
          itemSize={72}
          width="100%"
          itemData={{ alerts, onRowClick: handleRowClick }}
        >
          {AlertRow}
        </FixedSizeList>
      </div>

      <AlertDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        alert={selectedAlert}
      />
    </>
  );
};

export default memo(VirtualizedAlertsTable);
