import { Link } from "react-router-dom";
import { WireframeBox, WireframeText, WireframeButton, WireframeInput } from "../../components";

const WireframeTwoFA = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <WireframeBox label="2FA Verification" className="w-full max-w-md space-y-6 p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
          </div>
          <WireframeText variant="h2">[Two-Factor Authentication]</WireframeText>
          <WireframeText variant="caption">[Enter the 6-digit code from your authenticator app]</WireframeText>
        </div>

        {/* OTP Input */}
        <WireframeBox label="OTP Code Input" className="p-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-12 h-14 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <span className="text-lg font-mono text-muted-foreground/50">[_]</span>
              </div>
            ))}
          </div>
        </WireframeBox>

        {/* Demo Tip */}
        <WireframeBox label="Demo Tip" dashed className="p-2 text-center">
          <WireframeText variant="caption">[Demo: Enter 123456 to proceed]</WireframeText>
        </WireframeBox>

        {/* Submit */}
        <WireframeButton label="Verify & Continue" variant="primary" className="w-full" />

        {/* Alternative Options */}
        <div className="space-y-2">
          <WireframeButton label="Use Recovery Code" variant="ghost" className="w-full" />
          <div className="text-center">
            <Link to="/wireframe/auth/login">
              <WireframeText variant="caption" className="text-primary">[← Back to login]</WireframeText>
            </Link>
          </div>
        </div>
      </WireframeBox>
    </div>
  );
};

export default WireframeTwoFA;
