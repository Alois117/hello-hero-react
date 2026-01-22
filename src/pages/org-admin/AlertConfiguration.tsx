import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";

const AlertConfiguration = () => {
  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Alert Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure alert rules and notification channels
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-accent" />
              <h3 className="font-semibold text-lg">Alert Thresholds</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cpu-threshold">CPU Usage Threshold (%)</Label>
                <Input id="cpu-threshold" type="number" defaultValue="80" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="memory-threshold">Memory Usage Threshold (%)</Label>
                <Input id="memory-threshold" type="number" defaultValue="85" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="disk-threshold">Disk Usage Threshold (%)</Label>
                <Input id="disk-threshold" type="number" defaultValue="90" className="mt-1" />
              </div>
              <Button className="w-full">Save Thresholds</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="font-semibold text-lg mb-6">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Webhook Integration</p>
                  <p className="text-sm text-muted-foreground">Send to external webhook</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">Post to Slack channel</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default AlertConfiguration;
