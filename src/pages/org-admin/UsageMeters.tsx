import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const UsageMeters = () => {
  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Usage Meters
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor resource usage and quotas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Hosts", current: 142, max: 200, unit: "hosts" },
            { name: "Users", current: 24, max: 50, unit: "users" },
            { name: "Storage", current: 45, max: 100, unit: "GB" },
          ].map((meter) => (
            <Card key={meter.name} className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
                <h3 className="font-semibold text-lg">{meter.name}</h3>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Usage</span>
                  <span className="text-accent font-semibold">
                    {meter.current}/{meter.max} {meter.unit}
                  </span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary"
                    style={{ width: `${(meter.current / meter.max) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {((meter.current / meter.max) * 100).toFixed(0)}% utilized
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default UsageMeters;
