import { WireframeBox, WireframeText, WireframeButton, WireframeBadge, WireframeCard } from "../../components";
import WireframeDashboardLayout from "../../layouts/WireframeDashboardLayout";

const WireframeBilling = () => {
  return (
    <WireframeDashboardLayout role="org-admin" title="Billing">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <WireframeText variant="h1">[Billing]</WireframeText>
          <WireframeText variant="body">[Manage subscription and payments]</WireframeText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <WireframeBox label="Current Plan" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <WireframeBadge label="Professional" variant="info" />
                <WireframeText variant="h2">[$299/month]</WireframeText>
                <ul className="space-y-1">
                  <li className="text-xs font-mono text-muted-foreground">• [50 hosts included]</li>
                  <li className="text-xs font-mono text-muted-foreground">• [Advanced AI features]</li>
                  <li className="text-xs font-mono text-muted-foreground">• [Priority support]</li>
                </ul>
                <WireframeText variant="caption">[Next billing: Feb 1, 2024]</WireframeText>
              </div>
              <WireframeButton label="Upgrade Plan" variant="primary" />
            </div>
          </WireframeBox>

          {/* Quick Stats */}
          <div className="space-y-4">
            <WireframeCard title="Total Spent" value="[$2,450]" subtitle="[This year]" />
            <WireframeCard title="Payment Method" value="[•••• 4242]" subtitle="[Visa]" />
          </div>
        </div>

        {/* Usage This Month */}
        <WireframeBox label="Usage This Month">
          <div className="space-y-3">
            {[
              { item: "Base Plan", amount: "$299.00" },
              { item: "Additional Hosts (12)", amount: "$120.00" },
              { item: "API Overage", amount: "$31.00" },
            ].map((line, i) => (
              <div key={i} className="flex justify-between p-2 border-b border-dashed border-muted-foreground/20">
                <WireframeText variant="body">[{line.item}]</WireframeText>
                <WireframeText variant="body">[{line.amount}]</WireframeText>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <WireframeText variant="h3">[Total]</WireframeText>
              <WireframeText variant="h3">[$450.00]</WireframeText>
            </div>
          </div>
        </WireframeBox>

        {/* Invoice History */}
        <WireframeBox label="Invoice History">
          <div className="space-y-2">
            {[
              { date: "Jan 1, 2024", amount: "$450.00", status: "Paid" },
              { date: "Dec 1, 2023", amount: "$420.00", status: "Paid" },
              { date: "Nov 1, 2023", amount: "$380.00", status: "Paid" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/20 rounded">
                <div className="flex items-center gap-4">
                  <WireframeText variant="body">[{invoice.date}]</WireframeText>
                  <WireframeText variant="body">[{invoice.amount}]</WireframeText>
                  <WireframeBadge label={invoice.status} variant="success" />
                </div>
                <WireframeButton label="Download" variant="ghost" size="sm" />
              </div>
            ))}
          </div>
        </WireframeBox>
      </div>
    </WireframeDashboardLayout>
  );
};

export default WireframeBilling;
