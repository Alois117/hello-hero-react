/**
 * HostDetail - Detail renderer for a Zabbix Host item
 */
import { Server, Wifi, WifiOff, Clock, Globe, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HostItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface HostDetailProps {
  item: HostItem;
}

const HostDetail = ({ item }: HostDetailProps) => {
  const isEnabled = item.status === 0;

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${
          isEnabled
            ? "bg-success/10 border border-success/20"
            : "bg-muted/50 border border-muted/30"
        }`}>
          {isEnabled
            ? <Wifi className="w-5 h-5 text-success" />
            : <WifiOff className="w-5 h-5 text-muted-foreground" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                isEnabled
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
            {item.available != null && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  item.available === 1
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-muted/30 bg-muted/10 text-muted-foreground"
                }`}
              >
                {item.available === 1 ? "Available" : "Unavailable"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Host Information</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailField
            label="Hostname / IP"
            value={
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                {item.host}
              </span>
            }
            mono
          />
          <DetailField label="Host ID" value={item.hostid} mono />
          {item.lastAccess && (
            <DetailField
              label="Last Access"
              value={
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {format(item.lastAccess, "PPP p")}
                </span>
              }
            />
          )}
          <DetailField label="Status Code" value={String(item.status)} mono />
        </div>
      </div>

      {/* Groups */}
      {item.groups && item.groups.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Host Groups
            </p>
            <div className="flex flex-wrap gap-2">
              {item.groups.map((group, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs border-primary/20 bg-primary/5 text-primary"
                >
                  {group}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Raw Data */}
      <Separator className="bg-border/50" />
      <RawJsonSection data={item} label="Technical Details (JSON)" />
    </div>
  );
};

export default HostDetail;
