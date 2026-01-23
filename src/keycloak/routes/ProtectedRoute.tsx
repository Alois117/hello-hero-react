import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '../context/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

const roleHierarchy: Record<AppRole, number> = {
  user: 1,
  org_admin: 2,
  super_admin: 3,
};

const hasRequiredRole = (userRole: AppRole, requiredRole: AppRole): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isInitialized, appRole } = useAuth();
  const location = useLocation();

  // Show loading state while Keycloak initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <Shield className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (!hasRequiredRole(appRole, requiredRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRedirects: Record<AppRole, string> = {
      user: '/dashboard',
      org_admin: '/admin',
      super_admin: '/super-admin',
    };
    return <Navigate to={roleRedirects[appRole]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
