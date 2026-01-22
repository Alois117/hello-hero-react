import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Building2, Users, CreditCard, Shield } from "lucide-react";

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Multi-tenant management and system-wide analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total Organizations" value="48" change="+5" changeType="positive" icon={Building2} color="accent" />
          <KPICard title="Total Users" value="1,234" change="+42" changeType="positive" icon={Users} color="primary" />
          <KPICard title="Monthly Revenue" value="$124K" change="+18%" changeType="positive" icon={CreditCard} color="success" />
          <KPICard title="Security Events" value="3" change="-12" changeType="positive" icon={Shield} color="warning" />
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
