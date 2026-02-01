import { Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";

interface ReportsConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
}

const ReportsConnectionStatus = ({
  isConnected,
  lastUpdated,
}: ReportsConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-success animate-pulse" />
          <span className="text-muted-foreground">
            Last updated:{" "}
            <span className="text-foreground font-medium">
              {lastUpdated ? format(lastUpdated, "HH:mm:ss") : "—"}
            </span>
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-destructive" />
          <span className="text-destructive">Disconnected</span>
        </>
      )}
    </div>
  );
};

export default ReportsConnectionStatus;
