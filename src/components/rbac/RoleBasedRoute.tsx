import { Navigate } from 'react-router-dom';
import { getAuthUser, UserRole } from '@/utils/auth';
import { hasRole } from '@/utils/rbac';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
}

const RoleBasedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: RoleBasedRouteProps) => {
  const user = getAuthUser();
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (!hasRole(user.role, requiredRole)) {
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
