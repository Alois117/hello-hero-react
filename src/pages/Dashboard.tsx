import { Server, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import AppLayout from "@/components/layout/AppLayout";
import SeverityDistributionChart from "@/components/dashboard/SeverityDistributionChart";
import AlertsByHostWidget from "@/components/dashboard/AlertsByHostWidget";
import AlertsTimelineWidget from "@/components/dashboard/AlertsTimelineWidget";
import CriticalIssuesPanel from "@/components/dashboard/CriticalIssuesPanel";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring intelligence powered by AI</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Hosts"
            value="142"
            change="+12%"
            changeType="positive"
            icon={Server}
            color="primary"
          />
          <KPICard
            title="Active Problems"
            value="23"
            change="-8%"
            changeType="positive"
            icon={AlertTriangle}
            color="accent"
          />
          <KPICard
            title="Healthy Systems"
            value="119"
            change="+5%"
            changeType="positive"
            icon={CheckCircle}
            color="success"
          />
          <KPICard
            title="Avg Response Time"
            value="127ms"
            change="-15%"
            changeType="positive"
            icon={Activity}
            color="secondary"
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
    </AppLayout>
  );
};

export default Dashboard;
