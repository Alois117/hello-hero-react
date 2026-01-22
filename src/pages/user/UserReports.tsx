import { useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";

const UserReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const mockReports = [
    { id: 1, name: "Daily System Health", period: "Last 24 hours", generated: "2 hours ago", type: "daily" },
    { id: 2, name: "Weekly Performance Summary", period: "Last 7 days", generated: "Yesterday", type: "weekly" },
    { id: 3, name: "Monthly Availability Report", period: "January 2025", generated: "3 days ago", type: "monthly" },
    { id: 4, name: "Security Audit Report", period: "Last 30 days", generated: "1 week ago", type: "monthly" },
    { id: 5, name: "Network Performance", period: "Last 48 hours", generated: "4 hours ago", type: "daily" },
    { id: 6, name: "Infrastructure Cost Analysis", period: "December 2024", generated: "2 weeks ago", type: "monthly" },
  ];

  const filteredReports = mockReports.filter(r => r.type === selectedPeriod);

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-6 h-6 text-primary glow-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">Generated insights and analytics</p>
            </div>
          </div>
          <Button className="neon-button hover-lift">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>

        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
          <TabsList className="glass-card">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-4">
            {filteredReports.map((report, index) => (
              <Card
                key={report.id}
                className="glass-card p-6 rounded-lg border border-border hover:border-primary/30 transition-all hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.period}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Generated {report.generated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="hover-lift">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" className="hover-lift">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Card className="glass-card p-6 rounded-lg border border-primary/20">
          <h3 className="font-semibold mb-4">AI Summary</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              System availability: <span className="text-success font-medium">99.97%</span> (above SLA target of 99.9%)
            </p>
            <p>
              Average response time: <span className="text-primary font-medium">234ms</span> (12% improvement from last period)
            </p>
            <p>
              Critical incidents: <span className="text-warning font-medium">2</span> (both resolved within SLA)
            </p>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserReports;