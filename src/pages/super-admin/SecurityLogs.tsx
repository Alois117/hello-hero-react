import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuperAdminLayout from "@/layouts/SuperAdminLayout";

const SecurityLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { label: "Total Events", value: "1,247", icon: Shield, color: "text-primary" },
    { label: "Successful Logins", value: "892", icon: CheckCircle, color: "text-success" },
    { label: "Failed Attempts", value: "145", icon: XCircle, color: "text-error" },
    { label: "Security Alerts", value: "12", icon: AlertTriangle, color: "text-warning" },
  ];

  const securityEvents = [
    {
      id: 1,
      timestamp: "2024-12-15 14:32:15",
      event: "Failed Login Attempt",
      user: "unknown@suspicious.com",
      ip: "192.168.1.100",
      severity: "High",
      details: "Multiple failed login attempts detected"
    },
    {
      id: 2,
      timestamp: "2024-12-15 14:28:43",
      event: "Successful Login",
      user: "admin@company.com",
      ip: "10.0.0.5",
      severity: "Low",
      details: "Admin user logged in successfully"
    },
    {
      id: 3,
      timestamp: "2024-12-15 14:15:22",
      event: "Permission Change",
      user: "admin@company.com",
      ip: "10.0.0.5",
      severity: "Medium",
      details: "User role changed from User to Admin"
    },
    {
      id: 4,
      timestamp: "2024-12-15 13:58:11",
      event: "API Key Generated",
      user: "developer@company.com",
      ip: "10.0.0.12",
      severity: "Medium",
      details: "New API key created for integration"
    },
    {
      id: 5,
      timestamp: "2024-12-15 13:42:05",
      event: "Suspicious Activity",
      user: "user@external.com",
      ip: "203.0.113.45",
      severity: "High",
      details: "Unusual access pattern detected"
    },
  ];

  const filteredEvents = securityEvents.filter(event =>
    event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.ip.includes(searchQuery)
  );

  return (
    <SuperAdminLayout>
      <div className="p-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Security Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze security events across the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="glass-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search security events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {/* Security Events Table */}
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Latest security-related activities and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{event.timestamp}</TableCell>
                    <TableCell className="font-medium">{event.event}</TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell className="font-mono text-sm">{event.ip}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.severity === "High"
                            ? "destructive"
                            : event.severity === "Medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SecurityLogs;
