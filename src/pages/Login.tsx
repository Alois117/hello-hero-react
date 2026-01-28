import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Zap,
  Lock,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/keycloak";
import keycloak from "@/keycloak/config/keycloak";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, appRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      setIsSubmitting(true);

      // 🔑 Correct Keycloak login (redirect-based)
      keycloak.login({
        redirectUri: `${window.location.origin}/dashboard`,
        loginHint: email || undefined,
      });
    },
    [email, isSubmitting]
  );

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
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary" />
            <Zap className="w-6 h-6 text-accent absolute" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Avis™</h1>
          <p className="text-muted-foreground">
            AI-Powered Monitoring Intelligence
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              OAuth 2.0 • Keycloak Secure Login
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Avis
        </div>
      </div>
    </div>
  );
};

export default Login;
