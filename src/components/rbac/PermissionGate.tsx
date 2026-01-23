import { getAuthUser } from '@/utils/auth';
import { hasPermission } from '@/utils/rbac';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

const PermissionGate = ({ children, permission, fallback = null }: PermissionGateProps) => {
  const user = getAuthUser();
  
  if (!user || !hasPermission(user.role, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGate;
