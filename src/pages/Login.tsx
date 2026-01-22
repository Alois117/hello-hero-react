import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Zap, LogIn } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloakAuth } from "@/auth";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, login } = useKeycloakAuth();

  // If already authenticated, redirect to appropriate dashboard based on role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case "super_admin":
          navigate("/super-admin", { replace: true });
          break;
        case "org_admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/dashboard", { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleLogin = () => {
    login();
  };

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
          <h1 className="text-4xl font-bold mb-2 text-glow-primary">Jarvis™</h1>
          <p className="text-muted-foreground">AI-Powered Monitoring Intelligence</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-border/50 p-8">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in with your organization credentials to access the monitoring dashboard.
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold py-6 rounded-xl glow-primary transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In with SSO
            </Button>

            <p className="text-xs text-muted-foreground">
              You will be redirected to your organization's identity provider for secure authentication.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Enterprise-Grade Monitoring • AI-Powered Insights</p>
          <p className="mt-2">© 2025 Jarvis™. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
