import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useKeycloakAuth } from "@/auth/useKeycloakAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * User menu component with logout functionality
 * Displays user info from Keycloak token and provides logout option
 */
const UserMenu = () => {
  const { user, logout, isAuthenticated } = useKeycloakAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    console.log('[UserMenu] Logging out user:', user.email);
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              Role: {user.role.replace('_', ' ')}
            </p>
            {user.organizationId && (
              <p className="text-xs text-muted-foreground">
                Org: {user.organizationId}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
