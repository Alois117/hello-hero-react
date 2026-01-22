// Super Admin Only - Disaster Recovery & Backup Management
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, CloudDownload, Shield, AlertTriangle } from "lucide-react";

const DisasterRecovery = () => {
  const backups = [
    { id: 1, type: "Full Backup", timestamp: "2025-01-15 03:00 UTC", size: "45.2 GB", status: "success" },
    { id: 2, type: "Incremental", timestamp: "2025-01-15 06:00 UTC", size: "2.1 GB", status: "success" },
    { id: 3, type: "Incremental", timestamp: "2025-01-15 09:00 UTC", size: "1.8 GB", status: "success" },
    { id: 4, type: "Full Backup", timestamp: "2025-01-14 03:00 UTC", size: "44.8 GB", status: "success" },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Disaster Recovery
          </h1>
          <p className="text-muted-foreground mt-1">Backup management and failover controls</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Database className="w-8 h-8 text-destructive mb-3" />
            <div className="text-sm text-muted-foreground">Last Backup</div>
            <div className="text-lg font-bold">2 hours ago</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <CloudDownload className="w-8 h-8 text-accent mb-3" />
            <div className="text-sm text-muted-foreground">Total Backups</div>
            <div className="text-lg font-bold">247</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">Retention</div>
            <div className="text-lg font-bold">90 days</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <AlertTriangle className="w-8 h-8 text-success mb-3" />
            <div className="text-sm text-muted-foreground">RTO Target</div>
            <div className="text-lg font-bold">15 min</div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Backups</h3>
            <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              Initiate Backup
            </Button>
          </div>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <Database className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="font-medium">{backup.type}</div>
                    <div className="text-sm text-muted-foreground">{backup.timestamp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">{backup.size}</div>
                  <Badge variant="default" className="bg-success/20 text-success border-success/50">
                    {backup.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <CloudDownload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50 border-destructive/20">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Failover Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              Test Failover
            </Button>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              Initiate Failover
            </Button>
          </div>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default DisasterRecovery;
