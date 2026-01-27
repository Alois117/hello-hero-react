import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Lock, Loader2, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/keycloak";
import { 
  authenticateWithKeycloak, 
  isValidEmail, 
  isValidPassword 
} from "@/keycloak/utils/directAuth";
import keycloak from "@/keycloak/config/keycloak";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, appRole } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Validation checks
  const emailValid = isValidEmail(email);
  const passwordValid = isValidPassword(password);
  const formValid = email.trim() !== "" && emailValid && passwordValid;

  // Validation error messages
  const emailError = emailTouched && email.trim() !== "" && !emailValid 
    ? "Please enter a valid email address" 
    : null;
  const passwordError = passwordTouched && password.length > 0 && !passwordValid 
    ? "Password must be at least 6 characters" 
    : null;

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const roleRedirects: Record<string, string> = {
        super_admin: "/super-admin",
        org_admin: "/admin",
        user: "/dashboard",
      };
      navigate(roleRedirects[appRole] || "/dashboard", { replace: true });
    }
  }, [isInitialized, isAuthenticated, appRole, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authenticateWithKeycloak({
        username: email,
        password: password,
      });

      if (result.success && result.access_token && result.refresh_token) {
        // Initialize keycloak with the received tokens
        // This sets the tokens in memory within the keycloak-js instance
        await keycloak.init({
          onLoad: 'check-sso',
          token: result.access_token,
          refreshToken: result.refresh_token,
          idToken: result.id_token,
          checkLoginIframe: false,
        });

        // Force a page reload to reinitialize the auth context with new tokens
        // This ensures the ReactKeycloakProvider picks up the authenticated state
        window.location.href = '/dashboard';
      } else {
        setError(result.error || "Invalid username or password");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[Login] Authentication error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }, [email, password, formValid, isSubmitting]);

  // Show loading while checking existing authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary" />
              <Zap className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-glow-primary">Avis™</h1>
          <p className="text-muted-foreground">AI-Powered Monitoring Intelligence</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-border/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Secure Sign In</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access the monitoring dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  disabled={isSubmitting}
                  className={`pl-10 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  disabled={isSubmitting}
                  className={`pl-10 pr-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!formValid || isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold py-6 rounded-xl glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Protected by enterprise-grade security</p>
              <p>OAuth 2.0 Authentication</p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Enterprise-Grade Monitoring • AI-Powered Insights</p>
          <p>© {new Date().getFullYear()} Avis. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
