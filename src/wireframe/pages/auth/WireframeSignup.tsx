import { Link } from "react-router-dom";
import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";

const WireframeSignup = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <WireframeBox label="Signup Form" className="w-full max-w-md space-y-6 p-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
              <span className="text-xs font-mono">[J]</span>
            </div>
          </div>
          <WireframeText variant="h2">[Create Account]</WireframeText>
          <WireframeText variant="caption">[Join JARVIS™ Monitoring Platform]</WireframeText>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <WireframeInput label="Full Name" placeholder="John Doe" type="text" />
          <WireframeInput label="Email" placeholder="user@example.com" type="email" />
          <WireframeInput label="Password" placeholder="••••••••" type="password" />
          <WireframeInput label="Confirm Password" placeholder="••••••••" type="password" />
          
          {/* Organization (Optional) */}
          <WireframeBox label="Organization Setup" dashed className="p-3 space-y-3">
            <WireframeInput label="Organization Name (Optional)" placeholder="Acme Corp" type="text" />
            <WireframeText variant="caption">[Leave blank to join an existing org via invite]</WireframeText>
          </WireframeBox>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 border-2 border-dashed border-muted-foreground/30 rounded mt-0.5" />
          <WireframeText variant="caption">
            [I agree to the Terms of Service and Privacy Policy]
          </WireframeText>
        </div>

        {/* Submit Button */}
        <WireframeButton label="Create Account" variant="primary" className="w-full" />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
          <WireframeText variant="caption">[or sign up with]</WireframeText>
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
        </div>

        {/* Social Signup */}
        <div className="flex gap-4">
          <WireframeButton label="Google" variant="outline" className="flex-1" />
          <WireframeButton label="GitHub" variant="outline" className="flex-1" />
        </div>

        {/* Login Link */}
        <div className="text-center">
          <WireframeText variant="caption">
            [Already have an account?]{" "}
            <Link to="/wireframe/auth/login" className="text-primary">[Sign in]</Link>
          </WireframeText>
        </div>
      </WireframeBox>
    </div>
  );
};

export default WireframeSignup;
