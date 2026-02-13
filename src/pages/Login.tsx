import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { useKeycloak } from "@react-keycloak/web";           // ← use this hook
import { useAuth } from "@/keycloak";                        // keep for isInitialized if needed
import { decodeToken, isTokenExpired } from "@/keycloak/utils/tokenUtils";

const Login = () => {
  const { keycloak, initialized } = useKeycloak();          // ← now you get keycloak
  const { isAuthenticated, login } = useAuth();             // optional – for consistency
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;

    // Check if we have a stale/expired token
    if (keycloak.token) {
      const decoded = decodeToken(keycloak.token);
      if (decoded && isTokenExpired(decoded)) {
        console.debug('[Login] Detected expired token → forcing logout');
        keycloak.logout({
          redirectUri: `${window.location.origin}/login`,
        });
        return;
      }
    }

    // If authenticated and token looks valid → proceed
    if (keycloak.authenticated) {
      navigate("/auth/callback", { replace: true });
    }
  }, [initialized, keycloak, navigate]);

  const handleLogin = () => {
    login();  // or keycloak.login() — both work
  };

  if (!initialized) {
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
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />
      </div>
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/favicon.png"
              alt="Avis AI Monitoring Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#43BFC7] to-[#FAA41E] bg-clip-text text-transparent">
                Avis
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Monitoring
              </p>
            </div>
          </div>
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
                Sign in with your enterprise credentials to access the platform.
              </p>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold py-6 rounded-xl glow-primary transition-all"
            >
              <Lock className="w-4 h-4 mr-2" />
              Login 
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