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
import LogoutConfirmDialog from './LogoutConfirmDialog';

const UserInfoMenu: React.FC = () => {
  const { username, email, roles, appRole, organizations, logout } = useAuth();
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

          {/* Organizations Section */}
          {organizations.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Building2 className="w-3 h-3" />
                  <span>Organizations</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(organizations as string[]).slice(0, 3).map((org, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {typeof org === 'string' ? org : JSON.stringify(org)}
                    </Badge>
                  ))}
                  {organizations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{organizations.length - 3} more
                    </Badge>
                  )}
                </div>
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
