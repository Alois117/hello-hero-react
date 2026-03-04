/**
 * Organizations Connection Status
 * Stable connection indicator — never flickers during background refresh
 */
import { Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";

interface OrganizationsConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  loading?: boolean;
}

const OrganizationsConnectionStatus = ({
  isConnected,
  lastUpdated,
}: OrganizationsConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isConnected ? (
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
