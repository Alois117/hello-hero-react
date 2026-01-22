import { useState } from "react";
import UserLayout from "@/layouts/UserLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Server, AlertCircle, Info } from "lucide-react";

const UserTraps = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const mockTraps = [
    { id: 1, category: "SNMP", source: "192.168.1.100", message: "Link down on interface eth0", severity: "critical", timestamp: "2 min ago" },
    { id: 2, category: "Syslog", source: "web-server-01", message: "Disk usage above 90%", severity: "warning", timestamp: "5 min ago" },
    { id: 3, category: "SNMP", source: "192.168.1.150", message: "CPU temperature high", severity: "warning", timestamp: "8 min ago" },
    { id: 4, category: "Custom", source: "app-server-03", message: "Custom health check failed", severity: "high", timestamp: "12 min ago" },
    { id: 5, category: "Syslog", source: "db-server-01", message: "Connection pool exhausted", severity: "critical", timestamp: "15 min ago" },
  ];

  const filteredTraps = selectedCategory === "all" 
    ? mockTraps 
    : mockTraps.filter(t => t.category.toLowerCase() === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-error";
      case "high": return "text-accent";
      case "warning": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-5 h-5" />;
      case "high": return <AlertCircle className="w-5 h-5" />;
      case "warning": return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Radio className="w-6 h-6 text-primary glow-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SNMP Traps</h1>
            <p className="text-muted-foreground">Real-time trap monitoring</p>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
          <TabsList className="glass-card">
            <TabsTrigger value="all">All Traps</TabsTrigger>
            <TabsTrigger value="snmp">SNMP</TabsTrigger>
            <TabsTrigger value="syslog">Syslog</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {filteredTraps.map((trap, index) => (
              <Card
                key={trap.id}
                className="glass-card p-4 rounded-lg border border-border hover:border-primary/30 transition-all hover-lift cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={getSeverityColor(trap.severity)}>
                      {getSeverityIcon(trap.severity)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {trap.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{trap.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium">{trap.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Server className="w-3 h-3" />
                        <span>{trap.source}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getSeverityColor(trap.severity)} border-current`}>
                    {trap.severity}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default UserTraps;