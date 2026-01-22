import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useKeycloakAuth } from "./useKeycloakAuth";
import { UserRole } from "@/utils/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protected route component that:
 * - Redirects to /login if not authenticated
 * - Checks role-based access (super_admin > org_admin > user)
 * - Handles loading states
 */
const ProtectedRoute = ({ children, requiredRole = "user" }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, hasRole } = useKeycloakAuth();
  const location = useLocation();

  // Show loading state while Keycloak initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role-based access
  if (user && !hasRole(requiredRole)) {
    if (user.role === "super_admin") {
      return <Navigate to="/super-admin" replace state={{ from: location }} />;
    }
    if (user.role === "org_admin") {
      return <Navigate to="/admin" replace state={{ from: location }} />;
    }
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;