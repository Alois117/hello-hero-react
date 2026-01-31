/**
 * Organization Context for Multi-Tenant Enforcement
 * 
 * SECURITY CRITICAL:
 * - Provides organization context derived from JWT token
 * - Blocks access if organization validation fails
 * - Organization is IMMUTABLE after login
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  validateOrganizationMembership,
  type ParsedOrganization,
  type OrganizationValidationResult,
} from '../utils/organizationUtils';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';

interface OrganizationContextType {
  /** Current organization (null for super_admin) */
  organization: ParsedOrganization | null;
  /** Organization ID for API requests */
  organizationId: string | null;
  /** Display name for UI */
  organizationDisplayName: string | null;
  /** Whether org validation passed */
  isOrganizationValid: boolean;
  /** Whether user is super_admin (bypasses org restrictions) */
  isSuperAdmin: boolean;
  /** Number of orgs in token */
  organizationCount: number;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children?: React.ReactNode;
}

//Access Denied Screen - Shown when organization validation fails
const AccessDeniedScreen: React.FC<{ message: string; onLogout: () => void }> = ({
  message,
  onLogout,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md w-full mx-4">
      <div className="bg-card border border-destructive/50 rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground text-sm">{message}</p>
          <div className="pt-4 w-full">
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  </div>
);

//Validating Organization Screen - Shown during validation
const ValidatingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Building2 className="w-12 h-12 text-primary animate-pulse mx-auto" />
      <div className="flex items-center gap-2 text-muted-foreground justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Validating organization access...</span>
      </div>
    </div>
  </div>
);

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isInitialized, decodedToken, appRole, logout } = useAuth();
  const [validationResult, setValidationResult] = useState<OrganizationValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Validate organization when auth state changes
  useEffect(() => {
    if (!isInitialized) {
      setIsValidating(true);
      return;
    }

    if (!isAuthenticated) {
      setValidationResult(null);
      setIsValidating(false);
      return;
    }

    const result = validateOrganizationMembership(decodedToken, appRole);
    setValidationResult(result);
    setIsValidating(false);
  }, [isInitialized, isAuthenticated, decodedToken, appRole]);

  const contextValue = useMemo<OrganizationContextType>(() => {
    const org = validationResult?.organization || null;
    const isSuperAdmin = appRole === 'super_admin';

    return {
      organization: org,
      organizationId: isSuperAdmin ? null : (org?.id || null),
      organizationDisplayName: org?.displayName || null,
      isOrganizationValid: validationResult?.isValid ?? false,
      isSuperAdmin,
      organizationCount: validationResult?.organizationCount ?? 0,
    };
  }, [validationResult, appRole]);

  // While initializing or validating
  if (!isInitialized || isValidating) {
    return <ValidatingScreen />;
  }

  // Not authenticated - allow routing to proceed
  if (!isAuthenticated) {
    return (
      <OrganizationContext.Provider value={contextValue}>
        {children ?? <Outlet />}
      </OrganizationContext.Provider>
    );
  }

  // FAIL CLOSED: Block access if validation failed for non-super_admin
  if (!validationResult?.isValid && appRole !== 'super_admin') {
    return (
      <AccessDeniedScreen
        message={validationResult?.errorMessage || 'Organization validation failed.'}
        onLogout={logout}
      />
    );
  }

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children ?? <Outlet />}
    </OrganizationContext.Provider>
  );
};

/**
 * Hook to access organization context
 */
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;
