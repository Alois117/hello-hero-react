import { Navigate } from 'react-router-dom';
import { useKeycloakAuth } from '@/auth/useKeycloakAuth';
import { UserRole } from '@/utils/auth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
}

/**
 * Role-based route component using Keycloak authentication
 * Redirects to login if not authenticated, or to appropriate dashboard if role doesn't match
 */
const RoleBasedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) => {
  const { isAuthenticated, isLoading, user, hasRole, login } = useKeycloakAuth();

  // Show loading state while Keycloak initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to Keycloak login
  if (!isAuthenticated) {
    login();
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // Check if user has required role
  if (user && !hasRole(requiredRole)) {
    // Redirect based on actual role
    if (user.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'org_admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/super-admin" replace />;
    }
  }
  
  return <>{children}</>;
};

export default RoleBasedRoute;
