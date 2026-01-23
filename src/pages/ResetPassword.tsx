import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    
    // Mock password reset
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      toast.success("Password reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)] animate-pulse" />
        
        <Card className="glass-card border-primary/20 w-full max-w-md animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl text-gradient">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)] animate-pulse" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <Card className="glass-card border-primary/20 w-full max-w-md relative z-10 animate-fade-in">
        <CardHeader className="space-y-4">
          <Button
            variant="ghost"
            className="w-fit -ml-2"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          
          <div>
            <CardTitle className="text-3xl font-bold text-gradient mb-2">
              Reset Password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full neon-button"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
