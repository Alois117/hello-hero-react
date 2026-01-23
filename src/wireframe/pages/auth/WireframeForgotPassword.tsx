import { Link } from "react-router-dom";
import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";

const WireframeForgotPassword = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <WireframeBox label="Forgot Password Form" className="w-full max-w-md space-y-6 p-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-10 h-10 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
              <span className="text-xs font-mono">[🔐]</span>
            </div>
          </div>
          <WireframeText variant="h2">[Reset Password]</WireframeText>
          <WireframeText variant="caption">[Enter your email to receive a reset link]</WireframeText>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <WireframeInput label="Email Address" placeholder="user@example.com" type="email" />
        </div>

        {/* Submit Button */}
        <WireframeButton label="Send Reset Link" variant="primary" className="w-full" />

        {/* Success State Preview */}
        <WireframeBox label="Success State (Hidden by default)" dashed className="p-4 text-center space-y-2">
          <div className="w-12 h-12 mx-auto border-2 border-dashed border-green-500/50 rounded-full flex items-center justify-center">
            <span className="text-green-500">✓</span>
          </div>
          <WireframeText variant="body">[Check your email]</WireframeText>
          <WireframeText variant="caption">[Reset link sent to user@example.com]</WireframeText>
        </WireframeBox>

        {/* Back to Login */}
        <div className="text-center">
          <Link to="/wireframe/auth/login">
            <WireframeText variant="caption" className="text-primary">[← Back to login]</WireframeText>
          </Link>
        </div>
      </WireframeBox>
    </div>
  );
};

export default WireframeForgotPassword;
