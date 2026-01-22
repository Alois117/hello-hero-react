// Super Admin Only - Global Analytics Dashboard
import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GlobalAnalytics = () => {
  const analyticsData = [
    { month: "Jan", users: 1245, hosts: 8920, incidents: 342 },
    { month: "Feb", users: 1389, hosts: 9450, incidents: 298 },
    { month: "Mar", users: 1567, hosts: 10200, incidents: 276 },
    { month: "Apr", users: 1834, hosts: 11500, incidents: 301 },
    { month: "May", users: 2012, hosts: 12800, incidents: 245 },
    { month: "Jun", users: 2245, hosts: 14200, incidents: 289 },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Global Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Cross-tenant performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="text-3xl font-bold text-destructive mt-2">2,245</div>
            <div className="text-xs text-success mt-1">↑ 12% from last month</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="text-sm text-muted-foreground">Total Hosts</div>
            <div className="text-3xl font-bold text-accent mt-2">14,200</div>
            <div className="text-xs text-success mt-1">↑ 8% from last month</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="text-sm text-muted-foreground">Avg Incidents</div>
            <div className="text-3xl font-bold text-primary mt-2">289</div>
            <div className="text-xs text-muted-foreground mt-1">↓ 4% from last month</div>
          </Card>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="text-lg font-semibold mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))" 
                }} 
              />
              <Bar dataKey="users" fill="hsl(var(--destructive))" />
              <Bar dataKey="hosts" fill="hsl(var(--accent))" />
              <Bar dataKey="incidents" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default GlobalAnalytics;
