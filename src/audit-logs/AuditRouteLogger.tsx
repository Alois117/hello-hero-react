/**
 * AuditRouteLogger
 * 
 * Listens to React Router location changes and emits NAVIGATE_SECTION events.
 * Also detects dashboard switches.
 * 
 * Must be placed inside <BrowserRouter>.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logAuditEvent } from './logger';
import { AUDIT_EVENTS } from './constants';

const getDashboardName = (path: string): string => {
  if (path.startsWith('/super-admin')) return 'super_admin';
  if (path.startsWith('/admin')) return 'org_admin';
  if (path.startsWith('/dashboard')) return 'user';
  return 'public';
};

const AuditRouteLogger: React.FC = () => {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);
  const prevDashboard = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentDashboard = getDashboardName(currentPath);

    // Skip initial mount if same route (React strict mode double-render)
    if (prevPath.current === currentPath) return;

    // Log navigation
    logAuditEvent(AUDIT_EVENTS.NAVIGATE_SECTION, {
      from_route: prevPath.current || undefined,
      section: currentPath,
      nav_method: 'route_change',
    });

    // Detect dashboard switch
    if (prevDashboard.current && prevDashboard.current !== currentDashboard) {
      logAuditEvent(AUDIT_EVENTS.DASHBOARD_SWITCH, {
        from_route: prevPath.current || undefined,
        meta: {
          from_dashboard: prevDashboard.current,
          to_dashboard: currentDashboard,
        },
      });
    }

    prevPath.current = currentPath;
    prevDashboard.current = currentDashboard;
  }, [location.pathname]);

  return null;
};

export default AuditRouteLogger;
