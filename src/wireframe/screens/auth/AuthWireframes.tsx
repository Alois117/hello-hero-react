import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframePlaceholder } from "../../components/WireframePrimitives";
import { WireframeFormField } from "../../components/WireframeWidgets";

interface AuthWireframeProps {
  onNavigate: (screen: string) => void;
}

const AuthLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-secondary mb-4" />
        <WireframeText variant="h1" className="block">{title}</WireframeText>
        {subtitle && <WireframeText variant="body" className="block mt-2">{subtitle}</WireframeText>}
      </div>
      <WireframeBox variant="card" className="p-8">
        {children}
      </WireframeBox>
    </motion.div>
  </div>
);

export const LoginWireframe = ({ onNavigate }: AuthWireframeProps) => (
  <AuthLayout title="Welcome Back" subtitle="Sign in to your JARVIS account">
    <div className="space-y-4">
      <WireframeFormField label="Email Address" />
      <WireframeFormField label="Password" />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <WireframeBox variant="input" className="w-4 h-4 rounded" />
          <WireframeText variant="caption">Remember me</WireframeText>
        </label>
        <motion.button
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate("forgot-password")}
        >
          <WireframeText variant="caption">Forgot password?</WireframeText>
        </motion.button>
      </div>
      <motion.button
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate("user-dashboard")}
      >
        Sign In
      </motion.button>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-card text-muted-foreground text-sm">or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <WireframeBox variant="button" className="py-3 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/50" />
          <WireframeText variant="caption">Google</WireframeText>
        </WireframeBox>
        <WireframeBox variant="button" className="py-3 flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded bg-muted/50" />
          <WireframeText variant="caption">GitHub</WireframeText>
        </WireframeBox>
      </div>
      <div className="text-center mt-6">
        <WireframeText variant="caption">Don't have an account? </WireframeText>
        <motion.button
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate("signup")}
        >
          <WireframeText variant="caption">Sign up</WireframeText>
        </motion.button>
      </div>
    </div>
  </AuthLayout>
);

export const SignupWireframe = ({ onNavigate }: AuthWireframeProps) => (
  <AuthLayout title="Create Account" subtitle="Start your 14-day free trial">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <WireframeFormField label="First Name" />
        <WireframeFormField label="Last Name" />
      </div>
      <WireframeFormField label="Email Address" />
      <WireframeFormField label="Organization Name" />
      <WireframeFormField label="Password" />
      <WireframeFormField label="Confirm Password" />
      <label className="flex items-start gap-2">
        <WireframeBox variant="input" className="w-4 h-4 rounded mt-0.5" />
        <WireframeText variant="caption">
          I agree to the Terms of Service and Privacy Policy
        </WireframeText>
      </label>
      <motion.button
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate("user-dashboard")}
      >
        Create Account
      </motion.button>
      <div className="text-center mt-6">
        <WireframeText variant="caption">Already have an account? </WireframeText>
        <motion.button
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate("login")}
        >
          <WireframeText variant="caption">Sign in</WireframeText>
        </motion.button>
      </div>
    </div>
  </AuthLayout>
);

export const ForgotPasswordWireframe = ({ onNavigate }: AuthWireframeProps) => (
  <AuthLayout title="Reset Password" subtitle="Enter your email to receive a reset link">
    <div className="space-y-4">
      <WireframeFormField label="Email Address" />
      <motion.button
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate("reset-password")}
      >
        Send Reset Link
      </motion.button>
      <div className="text-center mt-6">
        <motion.button
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate("login")}
        >
          <WireframeText variant="caption">← Back to login</WireframeText>
        </motion.button>
      </div>
    </div>
  </AuthLayout>
);

export const ResetPasswordWireframe = ({ onNavigate }: AuthWireframeProps) => (
  <AuthLayout title="Set New Password" subtitle="Create a strong password for your account">
    <div className="space-y-4">
      <WireframeFormField label="New Password" />
      <WireframeFormField label="Confirm New Password" />
      <div className="space-y-2">
        <WireframeText variant="caption" className="block">Password requirements:</WireframeText>
        {["At least 8 characters", "One uppercase letter", "One number", "One special character"].map((req, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success/30" />
            <WireframeText variant="caption">{req}</WireframeText>
          </div>
        ))}
      </div>
      <motion.button
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate("login")}
      >
        Update Password
      </motion.button>
    </div>
  </AuthLayout>
);

export const TwoFAWireframe = ({ onNavigate }: AuthWireframeProps) => (
  <AuthLayout title="Two-Factor Authentication" subtitle="Enter the code from your authenticator app">
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <WireframeBox key={i} variant="input" className="w-12 h-14 flex items-center justify-center">
            <WireframeText variant="h2">•</WireframeText>
          </WireframeBox>
        ))}
      </div>
      <motion.button
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate("user-dashboard")}
      >
        Verify Code
      </motion.button>
      <div className="text-center space-y-2">
        <motion.button
          className="text-primary hover:underline block mx-auto"
          whileHover={{ scale: 1.05 }}
        >
          <WireframeText variant="caption">Use backup code instead</WireframeText>
        </motion.button>
        <motion.button
          className="text-muted-foreground hover:underline block mx-auto"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNavigate("login")}
        >
          <WireframeText variant="caption">← Back to login</WireframeText>
        </motion.button>
      </div>
    </div>
  </AuthLayout>
);
