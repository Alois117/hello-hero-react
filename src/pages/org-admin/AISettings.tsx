import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";

const AISettings = () => {
  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            AI Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure AI-powered features and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-accent" />
              <h3 className="font-semibold text-lg">AI Features</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automated Insights</p>
                  <p className="text-sm text-muted-foreground">Generate AI-powered recommendations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Anomaly Detection</p>
                  <p className="text-sm text-muted-foreground">Detect unusual patterns automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Predictive Alerts</p>
                  <p className="text-sm text-muted-foreground">Predict issues before they occur</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="font-semibold text-lg mb-6">Model Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-model">Default AI Model</Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger id="default-model" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                <Select defaultValue="80">
                  <SelectTrigger id="confidence-threshold" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default AISettings;
