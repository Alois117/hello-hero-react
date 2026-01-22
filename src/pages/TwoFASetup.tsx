import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TwoFASetup = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock TOTP secret and QR code
  const mockSecret = "JBSWY3DPEHPK3PXP";
  const mockQRCode = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Cg fill='%2300f2ff'%3E%3Crect x='20' y='20' width='20' height='20'/%3E%3Crect x='60' y='20' width='20' height='20'/%3E%3Crect x='100' y='20' width='20' height='20'/%3E%3Crect x='140' y='20' width='20' height='20'/%3E%3Crect x='20' y='60' width='20' height='20'/%3E%3Crect x='60' y='60' width='20' height='20'/%3E%3Crect x='100' y='60' width='20' height='20'/%3E%3Crect x='140' y='60' width='20' height='20'/%3E%3C/g%3E%3C/svg%3E";

  const handleCopySecret = () => {
    navigator.clipboard.writeText(mockSecret);
    toast.success("Secret key copied to clipboard!");
  };

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
      toast.success("2FA enabled successfully!");
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-surface to-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)] animate-pulse" />
      
      <Card className="glass-card border-primary/20 w-full max-w-lg relative z-10 animate-fade-in">
        <CardHeader className="space-y-4">
          <Button
            variant="ghost"
            className="w-fit -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gradient">
                Enable 2FA
              </CardTitle>
              <CardDescription className="text-base">
                Secure your account with two-factor authentication
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">1</span>
              Scan QR Code
            </h3>
            <div className="flex justify-center p-6 glass-card border border-border rounded-lg">
              <img 
                src={mockQRCode} 
                alt="2FA QR Code" 
                className="w-48 h-48 rounded-lg border-2 border-primary/20"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          {/* Step 2: Manual Entry */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">2</span>
              Or enter manually
            </h3>
            <div className="flex items-center gap-2 p-4 glass-card border border-border rounded-lg">
              <code className="flex-1 font-mono text-sm">{mockSecret}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySecret}
                className="hover:bg-primary/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Step 3: Verify */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">3</span>
              Verify Code
            </h3>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Enter 6-digit code from your app</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="glass-input text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full neon-button"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verifying..." : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFASetup;
