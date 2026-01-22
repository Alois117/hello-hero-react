import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Users, CreditCard, BarChart3, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const OrgAdminDashboard = () => {
  return (
    <OrgAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Organization Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, billing, and organization settings
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Users"
            value="24"
            change="+3"
            changeType="positive"
            icon={Users}
            color="accent"
          />
          <KPICard
            title="Active Hosts"
            value="142"
            change="+5"
            changeType="positive"
            icon={BarChart3}
            color="primary"
          />
          <KPICard
            title="Monthly Cost"
            value="$2,450"
            change="+12%"
            changeType="negative"
            icon={CreditCard}
            color="warning"
          />
          <KPICard
            title="Active Alerts"
            value="8"
            change="-4"
            changeType="positive"
            icon={AlertCircle}
            color="success"
          />
        </div>

        {/* Organization Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Recent User Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm font-semibold">
                      U{i}
                    </div>
                    <div>
                      <p className="font-medium text-sm">user{i}@company.com</p>
                      <p className="text-xs text-muted-foreground">Last login: {i} hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Usage Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Host Quota</span>
                  <span className="text-accent">142/200</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-primary w-[71%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>User Licenses</span>
                  <span className="text-primary">24/50</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[48%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Used</span>
                  <span className="text-success">45/100 GB</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success to-primary w-[45%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OrgAdminLayout>
  );
};

export default OrgAdminDashboard;
