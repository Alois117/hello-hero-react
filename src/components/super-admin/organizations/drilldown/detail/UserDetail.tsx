/**
 * UserDetail - Detail renderer for a User item
 */
import { User, Mail, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { format } from "date-fns";
import DetailField from "./DetailField";
import RawJsonSection from "./RawJsonSection";

interface UserDetailProps {
  item: UserItem;
}

const roleColors: Record<string, string> = {
  admin: "border-destructive/30 bg-destructive/10 text-destructive",
  user: "border-primary/30 bg-primary/10 text-primary",
  viewer: "border-muted/30 bg-muted/10 text-muted-foreground",
};

const UserDetail = ({ item }: UserDetailProps) => {
  return (
    <div className="space-y-6">
      {/* Title & Role */}
      <div className="flex items-start gap-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${item.status === "active"
            ? "bg-primary/10 border border-primary/20"
            : "bg-muted/50 border border-muted/30"
          }
        `}>
          <User className={`w-6 h-6 ${
            item.status === "active" ? "text-primary" : "text-muted-foreground"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-tight">{item.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${roleColors[item.role] || roleColors.user}`}
            >
              <Shield className="w-3 h-3 mr-1" />
              {item.role}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                item.status === "active"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-muted/30 bg-muted/10 text-muted-foreground"
              }`}
            >
              {item.status}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Key Facts */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">User Information</p>
        <div className="grid grid-cols-1 gap-4">
          <DetailField
            label="Email"
            value={
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {item.email}
              </span>
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="User ID" value={item.id} mono />
            <DetailField label="Role" value={item.role} />
            <DetailField label="Status" value={item.status} />
            {item.lastLogin && (
              <DetailField
                label="Last Login"
                value={
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {format(item.lastLogin, "PPP p")}
                  </span>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Raw Data */}
      <Separator className="bg-border/50" />
      <RawJsonSection data={item} label="Technical Details (JSON)" />
    </div>
  );
};

export default UserDetail;
