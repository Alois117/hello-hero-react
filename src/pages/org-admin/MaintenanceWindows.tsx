import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus } from "lucide-react";

const MaintenanceWindows = () => {
  const windows = [
    { id: 1, name: "Database Upgrade", start: "2024-01-25 02:00", end: "2024-01-25 04:00", status: "scheduled" },
    { id: 2, name: "Network Maintenance", start: "2024-01-28 01:00", end: "2024-01-28 03:00", status: "scheduled" },
  ];

  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Maintenance Windows
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage maintenance periods
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Window
          </Button>
        </div>

        <div className="space-y-4">
          {windows.map((window) => (
            <Card key={window.id} className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{window.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {window.start} - {window.end}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {window.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default MaintenanceWindows;
