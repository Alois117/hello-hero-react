import { useState } from "react";
import { Flag, Shield, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const FeatureFlags = () => {
  const [flags, setFlags] = useState([
    {
      id: "ai_insights",
      name: "AI Insights",
      description: "Enable AI-powered insights and recommendations",
      enabled: true,
      scope: "All Users",
      icon: Zap,
      risk: "low"
    },
    {
      id: "beta_features",
      name: "Beta Features",
      description: "Access to experimental features in beta testing",
      enabled: false,
      scope: "Admins Only",
      icon: Flag,
      risk: "medium"
    },
    {
      id: "advanced_security",
      name: "Advanced Security",
      description: "Enhanced security features including threat detection",
      enabled: true,
      scope: "Enterprise Plan",
      icon: Shield,
      risk: "low"
    },
    {
      id: "multi_tenant",
      name: "Multi-Tenant Support",
      description: "Enable organization-level multi-tenancy features",
      enabled: false,
      scope: "Super Admins",
      icon: Users,
      risk: "high"
    },
  ]);

  const toggleFlag = (flagId: string) => {
    setFlags(flags.map(flag => 
      flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
    ));
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          Feature Flags
        </CardTitle>
        <CardDescription>Control feature availability across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 glass-card border border-border rounded-lg hover-lift"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  flag.enabled ? 'bg-primary/20' : 'bg-muted/20'
                }`}>
                  <flag.icon className={`w-5 h-5 ${flag.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{flag.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => toggleFlag(flag.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">{flag.scope}</Badge>
                    <Badge variant={
                      flag.risk === 'high' 
                        ? 'destructive' 
                        : flag.risk === 'medium' 
                        ? 'default' 
                        : 'outline'
                    }>
                      {flag.risk} risk
                    </Badge>
                    <Badge variant={flag.enabled ? 'default' : 'outline'}>
                      {flag.enabled ? 'Active' : 'Disabled'}
                    </Badge>
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

export default FeatureFlags;
