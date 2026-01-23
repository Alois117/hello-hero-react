import { useState } from "react";
import { UserPlus, Search, Filter, MoreVertical, Shield, Mail, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrgAdminLayout from "@/layouts/OrgAdminLayout";
import TablePagination from "@/components/ui/table-pagination";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const users = [
    { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", role: "Admin", status: "Active", lastActive: "2 min ago" },
    { id: 2, name: "Mike Johnson", email: "mike.j@company.com", role: "User", status: "Active", lastActive: "1 hour ago" },
    { id: 3, name: "Alex Kim", email: "alex.kim@company.com", role: "Admin", status: "Active", lastActive: "3 hours ago" },
    { id: 4, name: "Emma Wilson", email: "emma.w@company.com", role: "User", status: "Inactive", lastActive: "2 days ago" },
    { id: 5, name: "James Brown", email: "james.b@company.com", role: "User", status: "Active", lastActive: "5 min ago" },
    { id: 6, name: "Lisa Park", email: "lisa.park@company.com", role: "Admin", status: "Active", lastActive: "30 min ago" },
    { id: 7, name: "David Lee", email: "david.lee@company.com", role: "User", status: "Active", lastActive: "1 day ago" },
    { id: 8, name: "Rachel Green", email: "rachel.g@company.com", role: "User", status: "Inactive", lastActive: "1 week ago" },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <OrgAdminLayout>
      <div className="p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Button className="neon-button">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
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
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Users Table */}
        <div className="glass-card border-primary/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>
                      {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-primary/20">
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-error">
                          <Ban className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
    </OrgAdminLayout>
  );
};

export default UserManagement;
