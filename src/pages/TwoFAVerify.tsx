import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TwoFAVerify = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    
    // Mock verification
    setTimeout(() => {
      setIsLoading(false);
      // Mock successful 2FA
      if (code === "123456") {
        toast.success("Verification successful!");
        localStorage.setItem("isAuthenticated", "true");
        navigate("/");
      } else {
        toast.error("Invalid code. Please try again.");
        setCode("");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)] animate-pulse" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      
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
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gradient">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-base">
                Enter the code from your authenticator app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="glass-input text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Tip: For demo, use code <code className="px-1 py-0.5 bg-primary/10 rounded">123456</code>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full neon-button"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-primary hover:text-primary/80"
                onClick={() => toast.info("Recovery code feature coming soon")}
              >
                Use recovery code instead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFAVerify;
