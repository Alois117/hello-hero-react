/**
 * Organizations Connection Status
 * Displays silent refresh indicator and last updated time
 * Mirrors the Zabbix Alerts connection status UI
 */
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface OrganizationsConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  loading?: boolean;
}

const OrganizationsConnectionStatus = ({
  isConnected,
  lastUpdated,
  loading = false,
}: OrganizationsConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
      ) : isConnected ? (
        <Wifi className="w-4 h-4 text-success" />
      ) : (
        <WifiOff className="w-4 h-4 text-destructive" />
      )}
      <span>
        {isConnected ? "Connected" : "Disconnected"}
        {lastUpdated && (
          <span className="ml-2">
            • Last updated: {format(lastUpdated, "HH:mm:ss")}
          </span>
        )}
      </span>
    </div>
  );
};

export default OrganizationsConnectionStatus;
