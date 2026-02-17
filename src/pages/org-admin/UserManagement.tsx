import { useState, useMemo, useCallback } from "react";
import { UserPlus, Search, Filter, MoreVertical, Shield, Mail, Ban, CheckCircle, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import TablePagination from "@/components/ui/table-pagination";
import { useOrganization } from "@/keycloak/context/OrganizationContext";
import { useKeycloakMembers, type KeycloakMember } from "@/hooks/keycloak";
import { useKeycloakUserManagement, type CreateUserData, type UpdateUserData } from "@/hooks/keycloak";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { organizationId } = useOrganization();
  const { members, loading, error, refresh } = useKeycloakMembers(organizationId);
  const { createUser, updateUser, toggleUserEnabled } = useKeycloakUserManagement();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<KeycloakMember | null>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", temporaryPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(u =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getUserDisplayName = (u: KeycloakMember) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email || "Unknown";

  const openCreate = () => {
    setFormData({ firstName: "", lastName: "", email: "", temporaryPassword: "" });
    setShowCreateDialog(true);
  };

  const openEdit = (user: KeycloakMember) => {
    setFormData({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", temporaryPassword: "" });
    setEditingUser(user);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    const result = await createUser({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      temporaryPassword: formData.temporaryPassword || undefined,
    });
    setSubmitting(false);

    if (result.success) {
      toast({ title: "User created successfully" });
      setShowCreateDialog(false);
      refresh();
    } else {
      toast({ title: "Failed to create user", description: result.error, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    const result = await updateUser(editingUser.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    });
    setSubmitting(false);

    if (result.success) {
      toast({ title: "User updated successfully" });
      setEditingUser(null);
      refresh();
    } else {
      toast({ title: "Failed to update user", description: result.error, variant: "destructive" });
    }
  };

  const handleToggle = async (user: KeycloakMember) => {
    const result = await toggleUserEnabled(user.id);
    if (result.success) {
      toast({ title: `User ${result.enabled ? "enabled" : "disabled"} successfully` });
      refresh();
    } else {
      toast({ title: "Failed to toggle user", description: result.error, variant: "destructive" });
    }
  };

  return (
    <OrgAdminLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Button className="neon-button" onClick={openCreate}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 border border-destructive/30 bg-destructive/5 rounded-lg text-sm text-destructive">
            {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={refresh}>Retry</Button>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-card border-primary/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading members...</p>
                  </TableCell>
                </TableRow>
              ) : currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No users match your search" : "No members found"}
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </div>
                        {getUserDisplayName(user)}
                      </div>
                    </TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.enabled ? "default" : "destructive"}>
                        {user.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-primary/20">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(user)}>
                            {user.enabled ? (
                              <><Ban className="w-4 h-4 mr-2" />Disable</>
                            ) : (
                              <><CheckCircle className="w-4 h-4 mr-2" />Enable</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            startIndex={startIndex}
            endIndex={endIndex}
            itemName="users"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div><Label>Last Name</Label><Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Temporary Password</Label><Input type="password" value={formData.temporaryPassword} onChange={e => setFormData(p => ({ ...p, temporaryPassword: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting || !formData.email}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div><Label>Last Name</Label><Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgAdminLayout>
  );
};

export default UserManagement;
