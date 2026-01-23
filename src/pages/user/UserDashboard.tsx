import UserLayout from "@/layouts/UserLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Server, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import SeverityDistributionChart from "@/components/dashboard/SeverityDistributionChart";
import AlertsByHostWidget from "@/components/dashboard/AlertsByHostWidget";
import AlertsTimelineWidget from "@/components/dashboard/AlertsTimelineWidget";
import CriticalIssuesPanel from "@/components/dashboard/CriticalIssuesPanel";

const UserDashboard = () => {
  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your infrastructure health and performance
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Hosts"
            value="142"
            change="+5.2%"
            changeType="positive"
            icon={Server}
            color="primary"
          />
          <KPICard
            title="Active Problems"
            value="23"
            change="-12%"
            changeType="positive"
            icon={AlertTriangle}
            color="warning"
          />
          <KPICard
            title="Avg Response Time"
            value="124ms"
            change="+8%"
            changeType="negative"
            icon={Activity}
            color="accent"
          />
          <KPICard
            title="System Uptime"
            value="99.8%"
            change="+0.2%"
            changeType="positive"
            icon={TrendingUp}
            color="success"
          />
        </div>

        {/* CEO Required Widgets Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityDistributionChart />
          <AlertsByHostWidget />
        </div>

        {/* CEO Required Widgets Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsTimelineWidget />
          <CriticalIssuesPanel />
        </div>

        {/* AI Insights */}
        <div className="cyber-card border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">AI Insight</h3>
              <p className="text-muted-foreground mb-4">
                Based on pattern analysis, we've detected increased memory pressure on database cluster DB-PROD-WEST. 
                AI recommends scaling horizontally by adding 2 read replicas to distribute load. 
                Estimated cost impact: $240/month. Performance improvement: +35% query throughput.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:opacity-90 transition-opacity">
                  Apply Recommendation
                </button>
                <button className="px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
