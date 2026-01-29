import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLoadingScreen from '../components/AuthLoadingScreen';

const AuthCallback = () => {
  const { isAuthenticated, isInitialized, appRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) return;

    switch (appRole) {
      case 'super_admin':
        navigate('/super-admin', { replace: true });
        break;
      case 'org_admin':
        navigate('/admin', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  }, [isInitialized, isAuthenticated, appRole, navigate]);

  return <AuthLoadingScreen message="Finalizing secure login…" />;
};

export default AuthCallback;
