import { UserRole } from './auth';

type Permission = string;

const rolePermissions: Record<UserRole, Permission[]> = {
  user: [
    'dashboard:view',
    'hosts:view',
    'hosts:detail',
    'problems:view',
    'traps:view',
    'insights:view',
    'reports:view',
    'settings:view',
  ],
  org_admin: [
    'dashboard:view',
    'hosts:view',
    'hosts:detail',
    'problems:view',
    'traps:view',
    'insights:view',
    'reports:view',
    'settings:view',
    'admin:users',
    'admin:billing',
    'admin:usage',
    'admin:alerts',
    'admin:oncall',
    'admin:zabbix',
    'admin:maintenance',
    'admin:ai',
  ],
  super_admin: [
    'dashboard:view',
    'hosts:view',
    'hosts:detail',
    'problems:view',
    'traps:view',
    'insights:view',
    'reports:view',
    'settings:view',
    'admin:users',
    'admin:billing',
    'admin:usage',
    'admin:alerts',
    'admin:oncall',
    'admin:zabbix',
    'admin:maintenance',
    'admin:ai',
    'superadmin:organizations',
    'superadmin:analytics',
    'superadmin:security',
    'superadmin:billing',
    'superadmin:recovery',
    'superadmin:aiml',
    'superadmin:features',
    'superadmin:reseller',
  ],
};

export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    org_admin: 2,
    super_admin: 3,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  if (route.startsWith('/super-admin')) {
    return hasRole(userRole, 'super_admin');
  }
  
  if (route.startsWith('/admin')) {
    return hasRole(userRole, 'org_admin');
  }
  
  if (route.startsWith('/dashboard')) {
    return hasRole(userRole, 'user');
  }
  
  return true;
};
