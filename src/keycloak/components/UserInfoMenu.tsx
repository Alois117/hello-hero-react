import React, { useState } from 'react';
import { User, ChevronDown, Shield, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const UserInfoMenu: React.FC = () => {
  const { username, email, roles, appRole, logout } = useAuth();
  const { organization, isSuperAdmin, organizationDisplayName } = useOrganization();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const roleDisplayName = appRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-background" />
            </div>
            <div className="text-sm hidden md:block">
              <div className="font-medium">{username || email || 'User'}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {roleDisplayName}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium leading-none">{username}</p>
              {email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Roles Section */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Shield className="w-3 h-3" />
              <span>Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {roles.length > 0 ? (
                roles.slice(0, 5).map((role) => (
                  <Badge 
                    key={role} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {role}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">user</Badge>
              )}
              {roles.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{roles.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {/* Organization Section - Show for non-super_admin with valid org */}
          {!isSuperAdmin && organization && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Building2 className="w-3 h-3" />
                  <span>Organization</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {organizationDisplayName || organization.orgKey}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Super Admin Indicator */}
          {isSuperAdmin && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Building2 className="w-3 h-3" />
                  <span>Organization Access</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-primary/20 text-primary"
                >
                  All Organizations
                </Badge>
              </div>
            </>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogoutClick}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default UserInfoMenu;
