import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const WebSocketIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Mock connection status changes
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% connected
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge
      variant="outline"
      className={`gap-2 ${
        isConnected
          ? "border-success/30 text-success"
          : "border-error/30 text-error"
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 animate-pulse-glow" />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Disconnected</span>
        </>
      )}
    </Badge>
  );
};

export default WebSocketIndicator;
