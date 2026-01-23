import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/keycloak";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, login, appRole } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      // Navigate to role-specific dashboard
      if (appRole === 'super_admin') {
        navigate("/super-admin", { replace: true });
      } else if (appRole === 'org_admin') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isInitialized, isAuthenticated, appRole, navigate]);

  const handleLogin = () => {
    login();
  };

  // Show loading while checking authentication status
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Secure Sign In</h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your enterprise credentials to access the monitoring dashboard.
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold py-6 rounded-xl glow-primary transition-all"
            >
              <Lock className="w-4 h-4 mr-2" />
              Login with Keycloak
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Protected by enterprise-grade SSO</p>
              <p>OAuth 2.0 + PKCE Authentication</p>
            </div>
          </div>
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
