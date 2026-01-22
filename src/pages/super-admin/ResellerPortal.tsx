// Super Admin Only - Reseller Management Portal
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Users, DollarSign, TrendingUp } from "lucide-react";

const ResellerPortal = () => {
  const resellers = [
    { id: 1, name: "TechPartners Inc", tier: "Platinum", clients: 24, revenue: 45890, commission: 15 },
    { id: 2, name: "CloudSolutions LLC", tier: "Gold", clients: 18, revenue: 32450, commission: 12 },
    { id: 3, name: "MSP Global", tier: "Platinum", clients: 31, revenue: 58200, commission: 15 },
    { id: 4, name: "IT Services Pro", tier: "Silver", clients: 9, revenue: 14300, commission: 10 },
  ];

  const totalRevenue = resellers.reduce((sum, r) => sum + r.revenue, 0);
  const totalClients = resellers.reduce((sum, r) => sum + r.clients, 0);

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Reseller Portal
          </h1>
          <p className="text-muted-foreground mt-1">Partner management and commission tracking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Store className="w-8 h-8 text-destructive mb-3" />
            <div className="text-sm text-muted-foreground">Active Resellers</div>
            <div className="text-2xl font-bold text-destructive">{resellers.length}</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Users className="w-8 h-8 text-accent mb-3" />
            <div className="text-sm text-muted-foreground">Total Clients</div>
            <div className="text-2xl font-bold text-accent">{totalClients}</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <DollarSign className="w-8 h-8 text-primary mb-3" />
            <div className="text-sm text-muted-foreground">Partner Revenue</div>
            <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <TrendingUp className="w-8 h-8 text-success mb-3" />
            <div className="text-sm text-muted-foreground">Growth Rate</div>
            <div className="text-2xl font-bold text-success">+18%</div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reseller Partners</h3>
            <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              Add Reseller
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resellers.map((reseller) => (
                <TableRow key={reseller.id}>
                  <TableCell className="font-medium">{reseller.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={reseller.tier === "Platinum" ? "default" : "secondary"}
                      className={reseller.tier === "Platinum" ? "bg-destructive/20 text-destructive border-destructive/50" : ""}
                    >
                      {reseller.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{reseller.clients}</TableCell>
                  <TableCell className="font-semibold">${reseller.revenue.toLocaleString()}</TableCell>
                  <TableCell>{reseller.commission}%</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded bg-surface/50">
                <span className="font-medium">Platinum Tier</span>
                <Badge variant="default" className="bg-destructive/20 text-destructive border-destructive/50">15%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-surface/50">
                <span className="font-medium">Gold Tier</span>
                <Badge variant="secondary">12%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-surface/50">
                <span className="font-medium">Silver Tier</span>
                <Badge variant="secondary">10%</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-border/50">
                Generate Partner Report
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/50">
                Process Commissions
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/50">
                Review Tier Eligibility
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ResellerPortal;
