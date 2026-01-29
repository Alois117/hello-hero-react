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

const hasRequiredRole = (
  userRole: AppRole,
  requiredRole: AppRole
): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'user',
  redirectTo = '/auth/callback',
}) => {
  const { isAuthenticated, isInitialized, appRole } = useAuth();
  const location = useLocation();

  // While Keycloak is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated → go through auth flow
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Authenticated but insufficient role → central router decides
  if (!hasRequiredRole(appRole, requiredRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
