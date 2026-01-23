import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Zap, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { mockLogin, UserRole } from "@/utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const user = mockLogin(email, password, role);
      if (user) {
        toast.success(`Welcome to Avis™ (${role})`);
        // Navigate to role-specific dashboard
        if (role === 'super_admin') {
          navigate("/super-admin");
        } else if (role === 'org_admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error("Please enter credentials");
      }
      setLoading(false);
    }, 1000);
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
          <h1 className="text-4xl font-bold mb-2 text-glow-primary">Avis™</h1>
          <p className="text-muted-foreground">AI-Powered Monitoring Intelligence</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-border/50 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@avis.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-surface/50 border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-surface/50 border-border/50 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Role (Dev/Testing)</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="bg-surface/50 border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-surface/50" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-semibold py-6 rounded-xl glow-primary transition-all"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Sign up
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Enterprise-Grade Monitoring • AI-Powered Insights</p>
          <p>© {new Date().getFullYear()} Avis. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
