import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  HardDrive,
  Server,
  Shield,
  ShieldOff,
  Clock,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
  Monitor,
  Wifi,
  WifiOff,
} from "lucide-react";
import { VeeamVM, formatLastBackup } from "@/hooks/useVeeamInfrastructure";

interface VeeamVMDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vm: VeeamVM | null;
}

const VeeamVMDetailDrawer = ({
  open,
  onOpenChange,
  vm,
}: VeeamVMDetailDrawerProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!vm) return null;

  const rawJson = vm.raw_json;
  const isPoweredOn = rawJson.powerState === "PoweredOn";
  const isConnected = rawJson.connectionState === "Connected";
  const isProtected = rawJson.isProtected;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl overflow-y-auto"
        aria-label="VM details drawer"
      >
        <SheetHeader>
          <SheetTitle>VM Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                className={
                  isPoweredOn
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-muted/20 text-muted-foreground border-muted/30"
                }
              >
                {rawJson.powerState}
              </Badge>
              <Badge
                className={
                  isConnected
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-destructive/20 text-destructive border-destructive/30"
                }
              >
                {rawJson.connectionState}
              </Badge>
              <Badge
                className={
                  isProtected
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-warning/20 text-warning border-warning/30"
                }
              >
                {isProtected ? "Protected" : "Not Protected"}
              </Badge>
            </div>

            <h2 className="text-xl font-bold flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              {rawJson.name}
            </h2>
          </div>

          {/* Guest OS & DNS */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              System Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Guest OS</span>
                <span className="font-medium text-sm text-right max-w-[60%] break-words">
                  {rawJson.guestOs || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">DNS Name</span>
                <span className="font-medium text-sm break-all">
                  {rawJson.guestDnsName || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* IP Addresses */}
          {rawJson.guestIpAddresses && rawJson.guestIpAddresses.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                IP Addresses ({rawJson.guestIpAddresses.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {rawJson.guestIpAddresses.map((ip, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {ip}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Resources
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">CPU Count</span>
                <span className="font-medium">{rawJson.cpuCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="font-medium">{rawJson.memorySizeHuman}</span>
              </div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Storage
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Guest Used</span>
                <span className="font-medium">{rawJson.guestUsedPercentHuman}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Total Capacity</span>
                <span className="font-medium">{rawJson.guestTotalCapacityHuman || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Free Space</span>
                <span className="font-medium">{rawJson.guestTotalFreeHuman || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Committed / Allocated</span>
                <span className="font-medium">
                  {rawJson.totalCommittedHuman} / {rawJson.totalAllocatedHuman}
                </span>
              </div>
            </div>
          </div>

          {/* Virtual Disks */}
          {rawJson.virtualDisksSummary && rawJson.virtualDisksSummary.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Virtual Disks ({rawJson.virtualDisksCountCalculated})
              </h3>
              <div className="space-y-2">
                {rawJson.virtualDisksSummary.map((disk, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                  >
                    <span className="text-sm text-muted-foreground">{disk.name}</span>
                    <span className="font-medium text-sm">{disk.capacityHuman}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Protection & Backup */}
          <div className="cyber-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {isProtected ? (
                <Shield className="w-5 h-5 text-success" />
              ) : (
                <ShieldOff className="w-5 h-5 text-warning" />
              )}
              Protection
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={
                    isProtected
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-warning/20 text-warning border-warning/30"
                  }
                >
                  {isProtected ? "Protected" : "Not Protected"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                </div>
                <span className="font-medium text-sm">
                  {formatLastBackup(rawJson.lastProtectedDate)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Protection Jobs</span>
                <span className="font-medium">{rawJson.protectionJobUidsCount}</span>
              </div>
            </div>
          </div>

          {/* Advanced (Collapsed) */}
          <div className="cyber-card">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-lg font-semibold"
            >
              <span>Advanced</span>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">VM ID</span>
                  <span className="font-mono text-sm">{rawJson.vmId}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">MoRef</span>
                  <span className="font-mono text-sm">{rawJson.moRef}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Dedupe Key</span>
                  <span className="font-mono text-xs break-all max-w-[60%] text-right">
                    {rawJson.dedupe_key}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Is Replica</span>
                  <span className="font-medium">{rawJson.isReplica ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Is CDP Replica</span>
                  <span className="font-medium">{rawJson.isCdpReplica ? "Yes" : "No"}</span>
                </div>
                {rawJson.notes && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <p className="text-xs p-3 bg-muted/30 rounded-lg">{rawJson.notes}</p>
                  </div>
                )}

                {/* Datastore Usage */}
                {rawJson.datastoreUsageSummary && rawJson.datastoreUsageSummary.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Datastore Usage</span>
                    {rawJson.datastoreUsageSummary.map((ds, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Committed</span>
                          <span className="font-medium">{ds.committedHuman}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Datastore MoRef</span>
                          <span className="font-mono">{ds.datastoreMoRef}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VeeamVMDetailDrawer;
