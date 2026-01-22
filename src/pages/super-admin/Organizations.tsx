import SuperAdminLayout from "@/layouts/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const Organizations = () => {
  const orgs = [
    { id: 1, name: "Acme Corp", users: 24, hosts: 142, plan: "Enterprise" },
    { id: 2, name: "TechStart Inc", users: 12, hosts: 45, plan: "Professional" },
    { id: 3, name: "Global Systems", users: 156, hosts: 890, plan: "Enterprise" },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            Organizations
          </h1>
          <p className="text-muted-foreground mt-1">Manage all tenant organizations</p>
        </div>

        <div className="space-y-4">
          {orgs.map((org) => (
            <Card key={org.id} className="p-6 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Building2 className="w-8 h-8 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">{org.users} users • {org.hosts} hosts</p>
                  </div>
                </div>
                <Badge variant="secondary">{org.plan}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Organizations;
