import { Download, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import OrgAdminLayout from "@/layouts/OrgAdminLayout";

const Billing = () => {
  const currentPlan = {
    name: "Professional",
    price: "$99",
    period: "month",
    features: ["Unlimited hosts", "Advanced analytics", "24/7 support", "Custom integrations"],
    nextBilling: "January 1, 2025"
  };

  const usage = [
    { name: "Users", current: 45, limit: 100, percentage: 45 },
    { name: "API Calls", current: 125000, limit: 200000, percentage: 62.5 },
    { name: "Storage", current: 28, limit: 50, percentage: 56, unit: "GB" },
    { name: "AI Queries", current: 850, limit: 1000, percentage: 85 }
  ];

  const invoices = [
    { id: "INV-2024-001", date: "Dec 1, 2024", amount: "$99.00", status: "Paid" },
    { id: "INV-2024-002", date: "Nov 1, 2024", amount: "$99.00", status: "Paid" },
    { id: "INV-2024-003", date: "Oct 1, 2024", amount: "$99.00", status: "Paid" },
    { id: "INV-2024-004", date: "Sep 1, 2024", amount: "$89.00", status: "Paid" },
  ];

  return (
    <OrgAdminLayout>
      <div className="p-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription and view usage metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <Card className="lg:col-span-2 glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                  <CardDescription>Next billing: {currentPlan.nextBilling}</CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-3xl font-bold mb-1">
                  {currentPlan.price}
                  <span className="text-base font-normal text-muted-foreground">/{currentPlan.period}</span>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Total Spent</CardTitle>
                <CardDescription>Last 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">$297.00</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">•••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 12/25</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Metrics */}
        <Card className="glass-card border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>Your current usage for this billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {usage.map((metric) => (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit || ""}
                    </span>
                  </div>
                  <Progress value={metric.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>Download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-sm text-muted-foreground">{invoice.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{invoice.amount}</div>
                      <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgAdminLayout>
  );
};

export default Billing;
