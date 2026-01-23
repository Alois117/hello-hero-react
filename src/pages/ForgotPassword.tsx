import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock password reset email
    setTimeout(() => {
      setSent(true);
      toast.success("Password reset link sent to your email");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md p-8 m-4 glass-card rounded-2xl border border-primary/20 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <Shield className="w-12 h-12 text-primary glow-primary" />
            <Zap className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-glow-primary">Jarvis</h1>
          </div>
        </div>

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
            <p className="text-muted-foreground text-center mb-6">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <Button type="submit" className="w-full neon-button hover-lift">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Link expires in 15 minutes
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
