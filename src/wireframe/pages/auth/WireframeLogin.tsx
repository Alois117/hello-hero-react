import { Link } from "react-router-dom";
import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";

const WireframeLogin = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <WireframeBox label="Login Form" className="w-full max-w-md space-y-6 p-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
              <span className="text-xs font-mono">[J]</span>
            </div>
          </div>
          <WireframeText variant="h2">[JARVIS™]</WireframeText>
          <WireframeText variant="caption">[Secure Authentication Portal]</WireframeText>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <WireframeInput label="Email" placeholder="user@example.com" type="email" />
          <WireframeInput label="Password" placeholder="••••••••" type="password" />
          
          {/* Role Selector */}
          <WireframeBox label="Role Selection (Dev Only)" dashed className="p-3">
            <WireframeInput label="Select Role" placeholder="user / org_admin / super_admin" type="select" />
          </WireframeBox>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-dashed border-muted-foreground/30 rounded" />
            <WireframeText variant="caption">[Remember me]</WireframeText>
          </div>
          <Link to="/wireframe/auth/forgot-password">
            <WireframeText variant="caption" className="text-primary">[Forgot password?]</WireframeText>
          </Link>
        </div>

        {/* Submit Button */}
        <WireframeButton label="Sign In" variant="primary" className="w-full" />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
          <WireframeText variant="caption">[or continue with]</WireframeText>
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
        </div>

        {/* Social Login */}
        <div className="flex gap-4">
          <WireframeButton label="Google" variant="outline" className="flex-1" />
          <WireframeButton label="GitHub" variant="outline" className="flex-1" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <WireframeText variant="caption">
            [Don't have an account?]{" "}
            <Link to="/wireframe/auth/signup" className="text-primary">[Sign up]</Link>
          </WireframeText>
        </div>

        {/* 2FA Notice */}
        <WireframeBox label="2FA Status" dashed className="p-2 text-center">
          <WireframeText variant="caption">[2FA verification may be required]</WireframeText>
        </WireframeBox>
      </WireframeBox>
    </div>
  );
};

export default WireframeLogin;
