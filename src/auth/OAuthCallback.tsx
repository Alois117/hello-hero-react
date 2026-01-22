import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from './useKeycloakAuth';

/**
 * OAuth callback page that handles the redirect from Keycloak
 * Redirects users to appropriate dashboard based on their role
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useKeycloakAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log('[OAuthCallback] Authentication successful, redirecting based on role:', user.role);
      
      // Redirect based on user role
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin', { replace: true });
          break;
        case 'org_admin':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Completing login...</h2>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
