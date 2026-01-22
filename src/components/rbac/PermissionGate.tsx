import { useKeycloakAuth } from '@/auth/useKeycloakAuth';
import { hasPermission } from '@/utils/rbac';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

/**
 * Permission-based rendering gate using Keycloak authentication
 * Only renders children if the user has the required permission
 */
const PermissionGate = ({ children, permission, fallback = null }: PermissionGateProps) => {
  const { user, isLoading, isAuthenticated } = useKeycloakAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Check if user is authenticated and has the required permission
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!hasPermission(user.role, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGate;
