/**
 * Organizations List
 * Displays organization cards with real metrics
 */
import { Building2, Users, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Organization } from "@/hooks/super-admin/organizations";

interface OrganizationsListProps {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  onOrgClick: (org: Organization) => void;
  selectedOrgId?: string | null;
}

const OrganizationsList = ({
  organizations,
  loading,
  error,
  onOrgClick,
  selectedOrgId,
}: OrganizationsListProps) => {
  // Loading skeleton
  if (loading && organizations.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error && organizations.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Failed to Load Organizations</h3>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (organizations.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No Organizations Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              No organizations match your current filters.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {organizations.map((org, index) => (
        <Card
          key={org.id}
          onClick={() => onOrgClick(org)}
          className={`
            p-5 border-border/50 hover:border-primary/30 
            transition-all duration-200 cursor-pointer group
            ${selectedOrgId === org.id ? "border-primary/50 bg-primary/5" : ""}
          `}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Organization Icon */}
              <div className={`
                p-3 rounded-xl transition-colors
                ${org.status === "active" 
                  ? "bg-primary/10 border border-primary/20 group-hover:bg-primary/15" 
                  : "bg-muted/50 border border-muted/30"
                }
              `}>
                <Building2 className={`w-6 h-6 ${org.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              {/* Organization Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                  {org.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{org.userCount} users</span>
                  </div>
                  {org.activeAlerts > 0 && (
                    <div className="flex items-center gap-1 text-warning">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{org.activeAlerts} alerts</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Status + Arrow */}
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={
                  org.status === "active"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-muted/30 bg-muted/10 text-muted-foreground"
                }
              >
                {org.status === "active" ? "Active" : "Inactive"}
              </Badge>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrganizationsList;
