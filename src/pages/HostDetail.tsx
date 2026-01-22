import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Server, Cpu, HardDrive, Network, Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";

const HostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock host data
  const host = {
    id: id || "1",
    name: "prod-web-server-01",
    ip: "192.168.1.10",
    status: "online",
    group: "Web Servers",
    os: "Ubuntu 22.04 LTS",
    uptime: "45 days 12h 34m",
    cpu: 45,
    memory: 68,
    disk: 52,
    network: 1250,
  };

  const metrics = [
    { label: "CPU Usage", value: host.cpu, icon: Cpu, color: "text-primary" },
    { label: "Memory", value: host.memory, icon: HardDrive, color: "text-accent" },
    { label: "Disk", value: host.disk, icon: Server, color: "text-warning" },
  ];

  const triggers = [
    {
      id: 1,
      name: "High CPU usage",
      severity: "warning",
      value: "45%",
      threshold: "> 80%",
      lastChange: "2 hours ago",
      status: "ok"
    },
    {
      id: 2,
      name: "Memory utilization",
      severity: "medium",
      value: "68%",
      threshold: "> 90%",
      lastChange: "30 min ago",
      status: "ok"
    },
    {
      id: 3,
      name: "Disk space",
      severity: "low",
      value: "52%",
      threshold: "> 85%",
      lastChange: "1 hour ago",
      status: "ok"
    },
  ];

  const aiInsights = [
    {
      type: "optimization",
      message: "CPU usage shows consistent pattern. Consider scaling down during off-peak hours to reduce costs.",
      confidence: 92
    },
    {
      type: "prediction",
      message: "Based on current trends, disk space will reach 75% in approximately 14 days.",
      confidence: 87
    },
    {
      type: "recommendation",
      message: "Memory usage is stable. Current configuration is optimal for workload.",
      confidence: 95
    }
  ];

  return (
    <AppLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/hosts")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hosts
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gradient">{host.name}</h1>
              <Badge variant={host.status === 'online' ? 'default' : 'destructive'}>
                {host.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{host.ip} • {host.group}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="glass-card border-primary/20 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon className={`w-8 h-8 ${metric.color} glow-primary`} />
                  <span className="text-2xl font-bold">{metric.value}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
            <TabsTrigger value="triggers">Trigger History</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Host Information</CardTitle>
                <CardDescription>System details and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Operating System</p>
                      <p className="font-medium">{host.os}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-success" />
                        {host.uptime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network In/Out</p>
                      <p className="font-medium flex items-center gap-2">
                        <Network className="w-4 h-4 text-primary" />
                        {host.network} Mbps
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Group</p>
                      <Badge variant="outline">{host.group}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monitoring Status</p>
                      <Badge variant="default" className="flex items-center gap-2 w-fit">
                        <Activity className="w-3 h-3" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Real-time Performance Metrics</CardTitle>
                <CardDescription>Live system performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Activity className="w-12 h-12 mx-auto animate-pulse text-primary" />
                    <p>Live metrics chart placeholder</p>
                    <p className="text-sm">(Recharts implementation coming next)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Active Triggers</CardTitle>
                <CardDescription>Monitoring thresholds and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="p-4 glass-card border border-border rounded-lg hover-lift"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{trigger.name}</h3>
                            <Badge variant={trigger.status === 'ok' ? 'outline' : 'destructive'}>
                              {trigger.status === 'ok' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                              {trigger.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current</p>
                              <p className="font-medium">{trigger.value}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Threshold</p>
                              <p className="font-medium">{trigger.threshold}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Change</p>
                              <p className="font-medium">{trigger.lastChange}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Intelligent analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 glass-card border border-primary/20 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default HostDetail;
