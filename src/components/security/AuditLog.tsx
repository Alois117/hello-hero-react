import { Shield, User, Settings, Key, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AuditLog = () => {
  const auditEntries = [
    {
      timestamp: "2025-11-16 14:32:18",
      user: "sarah.chen@company.com",
      action: "USER_ROLE_CHANGED",
      resource: "user:mike.johnson",
      details: "Changed role from User to Admin",
      icon: User,
      severity: "medium"
    },
    {
      timestamp: "2025-11-16 14:28:05",
      user: "admin@company.com",
      action: "API_KEY_CREATED",
      resource: "api:prod-key-842",
      details: "Generated production API key",
      icon: Key,
      severity: "high"
    },
    {
      timestamp: "2025-11-16 14:15:42",
      user: "mike.johnson@company.com",
      action: "SETTINGS_UPDATED",
      resource: "org:settings",
      details: "Modified notification preferences",
      icon: Settings,
      severity: "low"
    },
    {
      timestamp: "2025-11-16 13:58:22",
      user: "system",
      action: "DATABASE_BACKUP",
      resource: "db:primary",
      details: "Automated backup completed successfully",
      icon: Database,
      severity: "low"
    },
    {
      timestamp: "2025-11-16 13:45:11",
      user: "alex.kim@company.com",
      action: "SECURITY_POLICY_UPDATED",
      resource: "policy:mfa",
      details: "Enabled mandatory 2FA for all users",
      icon: Shield,
      severity: "high"
    },
  ];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Audit Log
        </CardTitle>
        <CardDescription>Complete audit trail of all system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditEntries.map((entry, index) => (
            <div
              key={index}
              className={`p-4 glass-card border rounded-lg hover-lift ${
                entry.severity === 'high' 
                  ? 'border-error/30' 
                  : entry.severity === 'medium' 
                  ? 'border-warning/30' 
                  : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  entry.severity === 'high' 
                    ? 'bg-error/20' 
                    : entry.severity === 'medium' 
                    ? 'bg-warning/20' 
                    : 'bg-primary/20'
                }`}>
                  <entry.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.action.replace(/_/g, ' ')}</span>
                      <Badge variant={
                        entry.severity === 'high' 
                          ? 'destructive' 
                          : entry.severity === 'medium' 
                          ? 'default' 
                          : 'outline'
                      }>
                        {entry.severity}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{entry.details}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>User: <strong>{entry.user}</strong></span>
                    <span>Resource: <strong>{entry.resource}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
