import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const DashboardHeader = ({ isConnected, lastUpdated, onRefresh, refreshing }: DashboardHeaderProps) => {
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return "Never";
    
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return "Just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
          Monitoring Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Real-time monitoring overview powered by AI
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          isConnected 
            ? "bg-success/20 text-success" 
            : "bg-destructive/20 text-destructive"
        )}>
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        
        {/* Last updated */}
        <div className="text-xs text-muted-foreground hidden sm:block">
          Updated: {formatLastUpdated(lastUpdated)}
        </div>
        
        {/* Refresh button */}
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
