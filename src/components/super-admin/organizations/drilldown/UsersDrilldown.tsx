/**
 * Users Drilldown Component
 * Shows detailed users list for the selected organization
 * Includes Add User functionality with role selection + invitation email
 */
import { useState, useMemo } from "react";
import { logAuditEvent, AUDIT_EVENTS } from "@/audit-logs";
import {
  Users, User, XCircle, RefreshCw, Mail, Shield,
  UserPlus, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserItem } from "@/hooks/super-admin/organizations/useOrganizationDetails";
import { useKeycloakMembers } from "@/hooks/keycloak";
import { useKeycloakUserManagement } from "@/hooks/keycloak";
import { useToast } from "@/hooks/use-toast";

interface UsersDrilldownProps {
  orgId: string;
  orgName: string;
  users: UserItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onItemClick?: (item: UserItem) => void;
}

type UserFilter = "all" | "active" | "inactive";
type UserRole = "org_admin" | "user";

const roleColors: Record<string, string> = {
  admin: "border-destructive/30 bg-destructive/10 text-destructive",
  org_admin: "border-destructive/30 bg-destructive/10 text-destructive",
  user: "border-primary/30 bg-primary/10 text-primary",
  viewer: "border-muted/30 bg-muted/10 text-muted-foreground",
};

const UsersDrilldown = ({ orgId, orgName, users, loading, error, onRefresh, onItemClick }: UsersDrilldownProps) => {
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create user dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "user" as UserRole,
  });

  const { addMember } = useKeycloakMembers(orgId);
  const { createUser, assignRealmRole, sendRequiredActionsEmail } = useKeycloakUserManagement();
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    let result = users;

    switch (filter) {
      case "active":
        result = result.filter(u => u.status === "active");
        break;
      case "inactive":
        result = result.filter(u => u.status !== "active");
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter(u => u.status === "active").length,
    inactive: users.filter(u => u.status !== "active").length,
  }), [users]);

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", username: "", email: "", role: "user" });
  };

  const openCreate = () => {
    resetForm();
    setShowCreateDialog(true);
    logAuditEvent(AUDIT_EVENTS.DIALOG_OPEN, { section: 'SuperAdmin_CreateUser', entity_type: 'organization', entity_id: orgId });
  };

  const handleCreate = async () => {
    if (!orgId || !formData.email.trim()) return;

    setSubmitting(true);

    try {
      // 1) Create user in Keycloak (no password — invitation-only)
      const created = await createUser({
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        enabled: true,
        requiredActions: ["VERIFY_EMAIL", "UPDATE_PASSWORD"],
      });

      if (!created.success || !created.id) {
        toast({ title: "Failed to create user", description: created.error, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const userId = created.id;

      // 2) Add user as member of the organization
      const memberResult = await addMember(userId);
      if (!memberResult.success) {
        toast({
          title: "User created, but org membership failed",
          description: memberResult.error,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // 3) Assign selected realm role
      const roleResult = await assignRealmRole(userId, formData.role);
      if (!roleResult.success) {
        toast({
          title: "User added to org, but role assignment failed",
          description: roleResult.error,
          variant: "destructive",
        });
        // Still continue — user is in the org
      }

      // 4) Send invitation email via Keycloak execute-actions-email
      const emailResult = await sendRequiredActionsEmail(userId, {
        actions: ["VERIFY_EMAIL", "UPDATE_PASSWORD"],
        lifespan: 86400, // 24 hours
      });

      if (!emailResult.success) {
        toast({
          title: "User created, but invitation email failed",
          description: emailResult.error || "The user may need to be invited manually.",
          variant: "destructive",
        });
      } else {
        toast({ title: "User created and invitation sent", description: `Invitation email sent to ${formData.email}` });
        logAuditEvent(AUDIT_EVENTS.USER_CREATE, { entity_type: 'user', entity_id: userId, result: 'success', meta: { role: formData.role, orgId } });
      }

      setShowCreateDialog(false);
      resetForm();
      onRefresh();
    } catch (err) {
      toast({ title: "Unexpected error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.email.trim().length > 0 && formData.role;

  if (error) {
    return (
      <Card className="p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium">Failed to load users</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Users for {orgName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Organization members and their roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as UserFilter)} className="flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs">
              Inactive ({counts.inactive})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-background/50"
        />
      </div>

      {/* Users List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No users match your search" : "No users found"}
              </p>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onItemClick?.(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onItemClick?.(user)}
                aria-label={`View details for user: ${user.name}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${user.status === "active" 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/50 border border-muted/30"
                    }
                  `}>
                    <User className={`w-5 h-5 ${
                      user.status === "active" ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant="outline"
                      className={`text-xs capitalize ${roleColors[user.role] || roleColors.user}`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        user.status === "active"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-muted/30 bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      {!loading && filteredUsers.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to {orgName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sa-create-firstName">First Name</Label>
                <Input
                  id="sa-create-firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sa-create-lastName">Last Name</Label>
                <Input
                  id="sa-create-lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sa-create-username">Username</Label>
              <Input
                id="sa-create-username"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sa-create-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="sa-create-email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sa-create-role">Role <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger id="sa-create-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                An invitation email will be sent to the user to complete their account setup.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !isFormValid}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Create & Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersDrilldown;