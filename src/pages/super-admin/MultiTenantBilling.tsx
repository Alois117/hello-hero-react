// Super Admin Only - Multi-Tenant Billing Management
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp } from "lucide-react";

const MultiTenantBilling = () => {
  const billingData = [
    { org: "Acme Corp", plan: "Enterprise", mrr: 2499, status: "active", hosts: 142 },
    { org: "TechStart Inc", plan: "Professional", mrr: 799, status: "active", hosts: 45 },
    { org: "Global Systems", plan: "Enterprise", mrr: 4999, status: "active", hosts: 890 },
    { org: "StartupXYZ", plan: "Starter", mrr: 299, status: "trial", hosts: 12 },
    { org: "MegaCorp Ltd", plan: "Enterprise", mrr: 3999, status: "active", hosts: 567 },
  ];

  const totalMRR = billingData.reduce((sum, org) => sum + org.mrr, 0);

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Multi-Tenant Billing
          </h1>
          <p className="text-muted-foreground mt-1">Revenue and subscription management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-sm text-muted-foreground">Total MRR</div>
                <div className="text-2xl font-bold text-destructive">${totalMRR.toLocaleString()}</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
                <div className="text-2xl font-bold text-accent">+23%</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="text-sm text-muted-foreground">Active Tenants</div>
            <div className="text-2xl font-bold text-primary mt-1">{billingData.length}</div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="text-lg font-semibold mb-4">Organization Billing</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Hosts</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.map((org, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{org.org}</TableCell>
                  <TableCell>{org.plan}</TableCell>
                  <TableCell>{org.hosts}</TableCell>
                  <TableCell className="font-semibold">${org.mrr}</TableCell>
                  <TableCell>
                    <Badge variant={org.status === "active" ? "default" : "secondary"}>
                      {org.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default MultiTenantBilling;
