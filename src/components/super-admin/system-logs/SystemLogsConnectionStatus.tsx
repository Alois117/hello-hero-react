import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Props {
  isConnected: boolean;
  lastUpdated: Date | null;
}

const SystemLogsConnectionStatus = ({ isConnected, lastUpdated }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant="outline"
        className={`gap-2 ${
          isConnected
            ? "border-success/30 text-success"
            : "border-destructive/30 text-destructive"
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 animate-pulse" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Updated at {format(lastUpdated, "HH:mm:ss")}
        </span>
      )}
    </div>
  );
};

export default SystemLogsConnectionStatus;
