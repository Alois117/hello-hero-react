import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bell, 
  Server, 
  Settings, 
  LogIn, 
  Home,
  ChevronRight,
  ChevronLeft,
  X,
  Monitor,
  BarChart3,
  Shield,
  Users,
  Building2,
  Crown,
  FileText,
  Lightbulb,
  AlertTriangle,
  Calendar,
  CreditCard,
  Gauge,
  Wrench,
  Phone,
  Bot,
  Globe,
  Lock,
  Database,
  Activity,
  Flag,
  Store,
  Key,
  Mail,
  Smartphone,
  UserPlus,
  HelpCircle,
  TrendingUp,
  Clock,
  Zap,
  Network,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  Trash,
  Edit,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink
} from 'lucide-react';

// Screen types for the entire system
type Screen = 
  // Public
  | 'landing' 
  // Auth
  | 'login' | 'signup' | 'forgot-password' | 'reset-password' | '2fa-setup' | '2fa-verify'
  // User Dashboard
  | 'user-dashboard' | 'user-alerts' | 'user-hosts' | 'user-host-detail' | 'user-traps' | 'user-insights' | 'user-reports' | 'user-settings'
  // Org Admin
  | 'org-dashboard' | 'org-users' | 'org-billing' | 'org-usage' | 'org-alert-config' | 'org-oncall' | 'org-zabbix' | 'org-maintenance' | 'org-ai-settings'
  // Super Admin
  | 'super-dashboard' | 'super-orgs' | 'super-analytics' | 'super-security' | 'super-billing' | 'super-dr' | 'super-aiml' | 'super-flags' | 'super-reseller';

type ScreenCategory = 'public' | 'auth' | 'user' | 'org-admin' | 'super-admin';

interface WireframeBoxProps {
  label: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning' | 'error';
}

const WireframeBox: React.FC<WireframeBoxProps> = ({ 
  label, 
  className = '', 
  onClick, 
  icon,
  variant = 'muted' 
}) => {
  const variantStyles = {
    primary: 'border-primary/50 bg-primary/10 hover:bg-primary/20',
    secondary: 'border-secondary/50 bg-secondary/10 hover:bg-secondary/20',
    accent: 'border-accent/50 bg-accent/10 hover:bg-accent/20',
    muted: 'border-muted-foreground/30 bg-muted/20 hover:bg-muted/40',
    success: 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
    warning: 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20',
    error: 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
  };

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      className={`
        border-2 border-dashed rounded-lg p-2 
        flex flex-col items-center justify-center gap-1
        transition-colors ${onClick ? 'cursor-pointer' : ''}
        ${variantStyles[variant]}
        ${className}
      `}
      onClick={onClick}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      {label && <span className="text-xs text-muted-foreground font-medium text-center leading-tight">{label}</span>}
    </motion.div>
  );
};

const WireframeLine: React.FC<{ horizontal?: boolean; className?: string }> = ({ 
  horizontal = true, 
  className = '' 
}) => (
  <div 
    className={`
      ${horizontal ? 'h-0.5 w-full' : 'w-0.5 h-full'} 
      bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent
      ${className}
    `} 
  />
);

// Category selector
const CategorySelector: React.FC<{ 
  categories: { id: ScreenCategory; label: string; icon: React.ReactNode }[]; 
  current: ScreenCategory; 
  onSelect: (c: ScreenCategory) => void 
}> = ({ categories, current, onSelect }) => (
  <div className="flex gap-2 justify-center mb-4 flex-wrap">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`
          px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
          ${current === cat.id 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground hover:bg-muted/80'}
        `}
      >
        {cat.icon}
        {cat.label}
      </button>
    ))}
  </div>
);

// Screen selector within category
const ScreenSelector: React.FC<{ 
  screens: { id: Screen; label: string }[]; 
  current: Screen; 
  onSelect: (s: Screen) => void 
}> = ({ screens, current, onSelect }) => (
  <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
    {screens.map((screen) => (
      <button
        key={screen.id}
        onClick={() => onSelect(screen.id)}
        className={`
          px-3 py-1.5 rounded-full text-xs font-medium transition-all
          ${current === screen.id 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'}
        `}
      >
        {screen.label}
      </button>
    ))}
  </div>
);

// Common sidebar for dashboards
const DashboardSidebar: React.FC<{ 
  type: 'user' | 'org' | 'super';
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
  collapsed?: boolean;
}> = ({ type, currentScreen, onNavigate, collapsed = false }) => {
  const userItems = [
    { id: 'user-dashboard' as Screen, label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'user-alerts' as Screen, label: 'Alerts', icon: <Bell size={14} /> },
    { id: 'user-hosts' as Screen, label: 'Hosts', icon: <Server size={14} /> },
    { id: 'user-traps' as Screen, label: 'Traps', icon: <AlertTriangle size={14} /> },
    { id: 'user-insights' as Screen, label: 'Insights', icon: <Lightbulb size={14} /> },
    { id: 'user-reports' as Screen, label: 'Reports', icon: <FileText size={14} /> },
    { id: 'user-settings' as Screen, label: 'Settings', icon: <Settings size={14} /> },
  ];

  const orgItems = [
    { id: 'org-dashboard' as Screen, label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'org-users' as Screen, label: 'Users', icon: <Users size={14} /> },
    { id: 'org-billing' as Screen, label: 'Billing', icon: <CreditCard size={14} /> },
    { id: 'org-usage' as Screen, label: 'Usage', icon: <Gauge size={14} /> },
    { id: 'org-alert-config' as Screen, label: 'Alert Config', icon: <Wrench size={14} /> },
    { id: 'org-oncall' as Screen, label: 'On-Call', icon: <Phone size={14} /> },
    { id: 'org-zabbix' as Screen, label: 'Zabbix', icon: <Network size={14} /> },
    { id: 'org-maintenance' as Screen, label: 'Maintenance', icon: <Calendar size={14} /> },
    { id: 'org-ai-settings' as Screen, label: 'AI Settings', icon: <Bot size={14} /> },
  ];

  const superItems = [
    { id: 'super-dashboard' as Screen, label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'super-orgs' as Screen, label: 'Organizations', icon: <Building2 size={14} /> },
    { id: 'super-analytics' as Screen, label: 'Analytics', icon: <TrendingUp size={14} /> },
    { id: 'super-security' as Screen, label: 'Security', icon: <Lock size={14} /> },
    { id: 'super-billing' as Screen, label: 'Billing', icon: <CreditCard size={14} /> },
    { id: 'super-dr' as Screen, label: 'DR', icon: <Database size={14} /> },
    { id: 'super-aiml' as Screen, label: 'AI/ML', icon: <Activity size={14} /> },
    { id: 'super-flags' as Screen, label: 'Flags', icon: <Flag size={14} /> },
    { id: 'super-reseller' as Screen, label: 'Reseller', icon: <Store size={14} /> },
  ];

  const items = type === 'user' ? userItems : type === 'org' ? orgItems : superItems;
  const roleLabel = type === 'user' ? 'User' : type === 'org' ? 'Org Admin' : 'Super Admin';
  const roleIcon = type === 'user' ? <Users size={12} /> : type === 'org' ? <Building2 size={12} /> : <Crown size={12} />;

  return (
    <div className={`${collapsed ? 'w-14' : 'w-44'} space-y-2 p-2 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 shrink-0`}>
      <WireframeBox label={collapsed ? '' : 'Jarvis'} className="h-9" variant="primary" icon={<Shield size={14} />} />
      <WireframeLine />
      {items.map((item) => (
        <WireframeBox 
          key={item.id}
          label={collapsed ? '' : item.label} 
          className="h-8" 
          variant={currentScreen === item.id ? 'accent' : 'muted'}
          onClick={() => onNavigate(item.id)}
          icon={item.icon}
        />
      ))}
      <div className="flex-1 min-h-4" />
      <WireframeLine />
      <WireframeBox label={collapsed ? '' : roleLabel} className="h-8" icon={roleIcon} />
      <WireframeBox label={collapsed ? '' : 'Logout'} className="h-7" onClick={() => onNavigate('landing')} icon={<X size={12} />} />
    </div>
  );
};

// ==================== PUBLIC SCREENS ====================

const LandingWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="w-28 h-10" icon={<Shield size={16} />} variant="primary" />
      <div className="flex gap-2">
        <WireframeBox label="Features" className="w-20 h-8" />
        <WireframeBox label="Pricing" className="w-20 h-8" />
        <WireframeBox label="Demo" className="w-16 h-8" />
        <WireframeBox label="AI Showcase" className="w-24 h-8" />
      </div>
      <div className="flex gap-2">
        <WireframeBox label="Login" className="w-20 h-10" variant="accent" onClick={() => onNavigate('login')} icon={<LogIn size={14} />} />
        <WireframeBox label="Sign Up" className="w-24 h-10" variant="primary" onClick={() => onNavigate('signup')} icon={<UserPlus size={14} />} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <div className="space-y-3">
        <WireframeBox label="Hero: Network Monitoring Reimagined" className="h-14 w-full" variant="primary" />
        <WireframeBox label="AI-Powered SNMP Monitoring Platform" className="h-10 w-full" />
        <WireframeBox label="Description text with key benefits..." className="h-16 w-full" />
        <div className="flex gap-2">
          <WireframeBox label="Start Free Trial" className="w-36 h-12" variant="accent" onClick={() => onNavigate('signup')} />
          <WireframeBox label="Watch Demo" className="w-32 h-12" variant="secondary" />
        </div>
      </div>
      <WireframeBox label="3D Holographic Dashboard Preview" className="h-52" icon={<Monitor size={32} />} variant="secondary" />
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Logo Marquee: Trusted by Enterprise" className="h-16 w-full" />
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Problem → Solution Section" className="h-10 w-64 mx-auto mb-4" variant="primary" />
      <div className="grid grid-cols-2 gap-4">
        <WireframeBox label="Problem: Complex Monitoring Challenges" className="h-32" icon={<XCircle size={20} />} variant="error" />
        <WireframeBox label="Solution: Jarvis AI-Powered Platform" className="h-32" icon={<CheckCircle size={20} />} variant="success" />
      </div>
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Features Carousel" className="h-10 w-48 mx-auto mb-4" variant="primary" />
      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Real-time Alerts" className="h-28" icon={<Bell size={20} />} />
        <WireframeBox label="Host Monitoring" className="h-28" icon={<Server size={20} />} />
        <WireframeBox label="AI Insights" className="h-28" icon={<Bot size={20} />} />
        <WireframeBox label="SNMP Traps" className="h-28" icon={<AlertTriangle size={20} />} />
      </div>
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="AI Showcase Section" className="h-10 w-40 mx-auto mb-4" variant="primary" />
      <WireframeBox label="Interactive AI Demo with Chat Interface" className="h-40" icon={<Bot size={32} />} variant="secondary" />
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Live Demo Section" className="h-10 w-40 mx-auto mb-4" variant="primary" />
      <WireframeBox label="Embedded Dashboard Demo" className="h-48" icon={<Eye size={32} />} />
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Technology Stack" className="h-10 w-48 mx-auto mb-4" variant="primary" />
      <div className="grid grid-cols-6 gap-2">
        {['React', 'TypeScript', 'Supabase', 'AI/ML', 'SNMP', 'Real-time'].map((tech) => (
          <WireframeBox key={tech} label={tech} className="h-16" />
        ))}
      </div>
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Pricing Plans" className="h-10 w-40 mx-auto mb-4" variant="primary" />
      <div className="grid grid-cols-3 gap-4">
        <WireframeBox label="Starter - Free" className="h-48" />
        <WireframeBox label="Professional - $49/mo" className="h-48" variant="accent" />
        <WireframeBox label="Enterprise - Custom" className="h-48" variant="primary" />
      </div>
    </div>

    <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Final CTA: Get Started Today" className="h-10 w-56 mx-auto mb-4" variant="primary" />
      <div className="flex justify-center gap-4">
        <WireframeBox label="Start Free Trial" className="w-40 h-12" variant="accent" onClick={() => onNavigate('signup')} />
        <WireframeBox label="Schedule Demo" className="w-40 h-12" variant="secondary" />
      </div>
    </div>

    <div className="flex justify-between p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="© Jarvis 2024" className="w-32 h-8" />
      <div className="flex gap-4">
        <WireframeBox label="Links Column 1" className="w-24 h-20" />
        <WireframeBox label="Links Column 2" className="w-24 h-20" />
        <WireframeBox label="Links Column 3" className="w-24 h-20" />
        <WireframeBox label="Social Icons" className="w-24 h-20" />
      </div>
    </div>
  </div>
);

// ==================== AUTH SCREENS ====================

const LoginWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[500px]">
    <div className="w-96 space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Welcome Back" className="h-10 w-full" variant="secondary" />
      <WireframeLine />
      <WireframeBox label="Email Input" className="h-12 w-full" icon={<Mail size={14} />} />
      <WireframeBox label="Password Input" className="h-12 w-full" icon={<Key size={14} />} />
      <WireframeBox label="Forgot Password?" className="h-8 w-36 ml-auto" onClick={() => onNavigate('forgot-password')} />
      <WireframeBox 
        label="Sign In with Magic Link" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('user-dashboard')}
        icon={<ChevronRight size={16} />}
      />
      <WireframeLine />
      <div className="grid grid-cols-2 gap-2">
        <WireframeBox label="Google SSO" className="h-10" />
        <WireframeBox label="Microsoft SSO" className="h-10" />
      </div>
      <WireframeLine />
      <WireframeBox label="Don't have an account? Sign up" className="h-10 w-full" onClick={() => onNavigate('signup')} />
      <WireframeBox label="← Back to Home" className="h-8 w-32 mx-auto" onClick={() => onNavigate('landing')} icon={<ChevronLeft size={12} />} />
    </div>
  </div>
);

const SignupWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[500px]">
    <div className="w-96 space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Create Account" className="h-10 w-full" variant="secondary" />
      <WireframeLine />
      <WireframeBox label="Full Name Input" className="h-12 w-full" icon={<Users size={14} />} />
      <WireframeBox label="Email Input" className="h-12 w-full" icon={<Mail size={14} />} />
      <WireframeBox label="Organization Name" className="h-12 w-full" icon={<Building2 size={14} />} />
      <WireframeBox label="Password Input" className="h-12 w-full" icon={<Key size={14} />} />
      <WireframeBox label="Confirm Password" className="h-12 w-full" icon={<Key size={14} />} />
      <WireframeBox label="☑ Agree to Terms & Privacy" className="h-8 w-full" />
      <WireframeBox 
        label="Create Account" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('2fa-setup')}
        icon={<UserPlus size={16} />}
      />
      <WireframeLine />
      <WireframeBox label="Already have an account? Sign in" className="h-10 w-full" onClick={() => onNavigate('login')} />
      <WireframeBox label="← Back to Home" className="h-8 w-32 mx-auto" onClick={() => onNavigate('landing')} icon={<ChevronLeft size={12} />} />
    </div>
  </div>
);

const ForgotPasswordWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-96 space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Reset Password" className="h-10 w-full" variant="secondary" />
      <WireframeBox label="Enter email to receive reset link" className="h-8 w-full" />
      <WireframeLine />
      <WireframeBox label="Email Input" className="h-12 w-full" icon={<Mail size={14} />} />
      <WireframeBox 
        label="Send Reset Link" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('reset-password')}
        icon={<Mail size={16} />}
      />
      <WireframeLine />
      <WireframeBox label="← Back to Login" className="h-10 w-full" onClick={() => onNavigate('login')} icon={<ChevronLeft size={12} />} />
    </div>
  </div>
);

const ResetPasswordWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-96 space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Set New Password" className="h-10 w-full" variant="secondary" />
      <WireframeLine />
      <WireframeBox label="New Password Input" className="h-12 w-full" icon={<Key size={14} />} />
      <WireframeBox label="Confirm New Password" className="h-12 w-full" icon={<Key size={14} />} />
      <WireframeBox label="Password Strength Indicator" className="h-6 w-full" variant="success" />
      <WireframeBox 
        label="Update Password" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('login')}
        icon={<CheckCircle size={16} />}
      />
    </div>
  </div>
);

const TwoFASetupWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[500px]">
    <div className="w-[420px] space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Setup Two-Factor Authentication" className="h-10 w-full" variant="secondary" />
      <WireframeLine />
      <WireframeBox label="QR Code for Authenticator App" className="h-40 w-40 mx-auto" icon={<Smartphone size={32} />} variant="secondary" />
      <WireframeBox label="Manual Code: XXXX-XXXX-XXXX" className="h-10 w-full" />
      <WireframeLine />
      <WireframeBox label="Enter 6-digit Verification Code" className="h-8 w-full" />
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5,6].map((i) => (
          <WireframeBox key={i} label="" className="h-12 w-10" />
        ))}
      </div>
      <WireframeBox 
        label="Verify & Enable 2FA" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('user-dashboard')}
        icon={<CheckCircle size={16} />}
      />
      <WireframeBox label="Skip for now" className="h-8 w-32 mx-auto" onClick={() => onNavigate('user-dashboard')} />
    </div>
  </div>
);

const TwoFAVerifyWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-96 space-y-4 p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
      <WireframeBox label="Jarvis Logo" className="h-14 w-36 mx-auto" variant="primary" icon={<Shield size={24} />} />
      <WireframeBox label="Two-Factor Verification" className="h-10 w-full" variant="secondary" />
      <WireframeBox label="Enter code from authenticator app" className="h-8 w-full" />
      <WireframeLine />
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5,6].map((i) => (
          <WireframeBox key={i} label="" className="h-14 w-11" />
        ))}
      </div>
      <WireframeBox 
        label="Verify" 
        className="h-14 w-full" 
        variant="accent"
        onClick={() => onNavigate('user-dashboard')}
        icon={<CheckCircle size={16} />}
      />
      <WireframeLine />
      <WireframeBox label="Use backup code instead" className="h-8 w-full" />
      <WireframeBox label="← Back to Login" className="h-8 w-32 mx-auto" onClick={() => onNavigate('login')} icon={<ChevronLeft size={12} />} />
    </div>
  </div>
);

// ==================== USER DASHBOARD SCREENS ====================

const UserDashboardWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-dashboard" onNavigate={onNavigate} />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Dashboard Overview" className="h-9 w-44" variant="primary" />
        <div className="flex gap-2">
          <WireframeBox label="Search" className="h-9 w-36" icon={<Search size={12} />} />
          <WireframeBox label="Theme" className="h-9 w-9" />
          <WireframeBox label="AI Chat" className="h-9 w-9" icon={<Bot size={12} />} />
          <WireframeBox label="" className="h-9 w-9" icon={<Bell size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Total Alerts" className="h-24" variant="secondary" icon={<Bell size={20} />} />
        <WireframeBox label="Critical Issues" className="h-24" variant="error" icon={<AlertTriangle size={20} />} />
        <WireframeBox label="Hosts Online" className="h-24" variant="success" icon={<Server size={20} />} />
        <WireframeBox label="Uptime %" className="h-24" variant="secondary" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <WireframeBox label="Alert Timeline Chart" className="h-44" icon={<BarChart3 size={24} />} />
        <WireframeBox label="Severity Distribution" className="h-44" icon={<BarChart3 size={24} />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WireframeBox label="Alerts by Host Widget" className="h-36" icon={<Server size={20} />} />
        <WireframeBox label="SLI Metrics Widget" className="h-36" icon={<Gauge size={20} />} />
        <WireframeBox label="Critical Issues Panel" className="h-36" icon={<AlertTriangle size={20} />} variant="error" />
      </div>

      <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Recent Alerts Table" className="h-9 w-44 mb-3" />
        <WireframeBox label="Table Header Row" className="h-9 mb-2" variant="secondary" />
        {[1,2,3].map((i) => (
          <WireframeBox key={i} label={`Alert Row ${i} - Click to view`} className="h-11 mb-2" onClick={() => onNavigate('user-alerts')} />
        ))}
      </div>
    </div>
  </div>
);

const UserAlertsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-alerts" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Alerts Management" className="h-10 w-48" variant="primary" icon={<Bell size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Filter" className="h-9 w-24" icon={<Filter size={12} />} />
          <WireframeBox label="Search" className="h-9 w-36" icon={<Search size={12} />} />
          <WireframeBox label="Export" className="h-9 w-24" variant="secondary" icon={<Download size={12} />} />
        </div>
      </div>

      <div className="flex gap-2 p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="All" className="h-8 w-14" variant="accent" />
        <WireframeBox label="Critical" className="h-8 w-20" variant="error" />
        <WireframeBox label="Warning" className="h-8 w-20" variant="warning" />
        <WireframeBox label="Info" className="h-8 w-14" />
        <WireframeBox label="Date Range Picker" className="h-8 w-36" icon={<Calendar size={12} />} />
        <WireframeBox label="Host Filter" className="h-8 w-28" icon={<Server size={12} />} />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <div className="flex gap-2 mb-2 text-xs text-muted-foreground px-2">
          <span className="w-20">Severity</span>
          <span className="flex-1">Alert Name</span>
          <span className="w-28">Host</span>
          <span className="w-24">Time</span>
          <span className="w-20">Actions</span>
        </div>
        <WireframeLine className="mb-2" />
        {[1,2,3,4,5,6,7].map((i) => (
          <WireframeBox key={i} label={`Alert ${i} - Network/Host Issue Description`} className="h-12 mb-2" />
        ))}
      </div>

      <div className="flex justify-between items-center">
        <WireframeBox label="Showing 1-7 of 234" className="h-8 w-40" />
        <div className="flex gap-1">
          <WireframeBox label="←" className="h-8 w-8" />
          <WireframeBox label="1" className="h-8 w-8" variant="accent" />
          <WireframeBox label="2" className="h-8 w-8" />
          <WireframeBox label="3" className="h-8 w-8" />
          <WireframeBox label="..." className="h-8 w-8" />
          <WireframeBox label="24" className="h-8 w-8" />
          <WireframeBox label="→" className="h-8 w-8" />
        </div>
      </div>
    </div>

    <div className="w-80 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
      <WireframeBox label="Alert Detail Drawer" className="h-10 w-full" variant="primary" />
      <WireframeLine />
      <WireframeBox label="Alert Title" className="h-8 w-full" />
      <div className="flex gap-2">
        <WireframeBox label="Critical" className="h-7 w-20" variant="error" />
        <WireframeBox label="Active" className="h-7 w-16" variant="warning" />
      </div>
      <WireframeBox label="Host: server-01" className="h-8 w-full" icon={<Server size={12} />} />
      <WireframeBox label="Time: 2024-01-15 14:32" className="h-8 w-full" icon={<Clock size={12} />} />
      <WireframeLine />
      <WireframeBox label="Description/Details" className="h-24 w-full" />
      <WireframeLine />
      <div className="flex gap-2">
        <WireframeBox label="Acknowledge" className="h-9 flex-1" variant="accent" />
        <WireframeBox label="Escalate" className="h-9 flex-1" variant="warning" />
      </div>
      <WireframeBox label="View Host" className="h-9 w-full" onClick={() => onNavigate('user-host-detail')} />
    </div>
  </div>
);

const UserHostsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-hosts" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Hosts Overview" className="h-10 w-44" variant="primary" icon={<Server size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Search Hosts" className="h-9 w-36" icon={<Search size={12} />} />
          <WireframeBox label="+ Add Host" className="h-9 w-28" variant="accent" icon={<Plus size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Online: 47" className="h-20" variant="success" icon={<CheckCircle size={16} />} />
        <WireframeBox label="Offline: 3" className="h-20" variant="error" icon={<XCircle size={16} />} />
        <WireframeBox label="Maintenance: 2" className="h-20" variant="warning" icon={<Wrench size={16} />} />
        <WireframeBox label="Total: 52" className="h-20" variant="secondary" icon={<Server size={16} />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
            <div className="flex justify-between mb-2">
              <WireframeBox label={`Host ${i}`} className="h-8 w-24" />
              <WireframeBox label="●" className="h-8 w-8" variant={i === 4 ? 'error' : 'success'} />
            </div>
            <WireframeBox label="CPU / Memory / Disk" className="h-20" icon={<BarChart3 size={16} />} />
            <WireframeBox label="View Details" className="h-8 w-full mt-2" onClick={() => onNavigate('user-host-detail')} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserHostDetailWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-hosts" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-4">
        <WireframeBox label="← Back" className="h-9 w-20" onClick={() => onNavigate('user-hosts')} icon={<ChevronLeft size={12} />} />
        <WireframeBox label="Host: server-prod-01" className="h-10 w-56" variant="primary" icon={<Server size={16} />} />
        <WireframeBox label="Online" className="h-8 w-20" variant="success" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="CPU: 45%" className="h-24" variant="secondary" icon={<Activity size={20} />} />
        <WireframeBox label="Memory: 72%" className="h-24" variant="warning" icon={<Database size={20} />} />
        <WireframeBox label="Disk: 38%" className="h-24" variant="secondary" icon={<Database size={20} />} />
        <WireframeBox label="Network: 12MB/s" className="h-24" variant="secondary" icon={<Network size={20} />} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <WireframeBox label="CPU Usage Over Time Chart" className="h-48" icon={<BarChart3 size={24} />} />
        <WireframeBox label="Memory Usage Over Time Chart" className="h-48" icon={<BarChart3 size={24} />} />
      </div>

      <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Recent Alerts for This Host" className="h-9 w-56 mb-3" />
        {[1,2,3].map((i) => (
          <WireframeBox key={i} label={`Alert ${i} - Click to view details`} className="h-11 mb-2" onClick={() => onNavigate('user-alerts')} />
        ))}
      </div>

      <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Host Configuration" className="h-9 w-44 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <WireframeBox label="IP: 192.168.1.100" className="h-10" />
          <WireframeBox label="SNMP Version: v3" className="h-10" />
          <WireframeBox label="Community: public" className="h-10" />
          <WireframeBox label="Last Polled: 2m ago" className="h-10" />
        </div>
      </div>
    </div>
  </div>
);

const UserTrapsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-traps" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="SNMP Traps" className="h-10 w-40" variant="primary" icon={<AlertTriangle size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Filter" className="h-9 w-24" icon={<Filter size={12} />} />
          <WireframeBox label="Date Range" className="h-9 w-32" icon={<Calendar size={12} />} />
          <WireframeBox label="Export" className="h-9 w-24" variant="secondary" icon={<Download size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WireframeBox label="Total Traps: 1,247" className="h-20" variant="secondary" />
        <WireframeBox label="Today: 23" className="h-20" variant="accent" />
        <WireframeBox label="Critical: 5" className="h-20" variant="error" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Traps Table Header" className="h-9 mb-2" variant="secondary" />
        {[1,2,3,4,5,6].map((i) => (
          <WireframeBox key={i} label={`SNMP Trap ${i} - OID / Source / Type`} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const UserInsightsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-insights" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="AI Insights" className="h-10 w-36" variant="primary" icon={<Lightbulb size={16} />} />
        <WireframeBox label="Refresh Analysis" className="h-9 w-36" variant="accent" icon={<RefreshCw size={12} />} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Predictive Analysis" className="h-10 w-44" variant="secondary" icon={<TrendingUp size={16} />} />
          <WireframeBox label="Trend Chart" className="h-36" icon={<BarChart3 size={24} />} />
          <WireframeBox label="AI Prediction Summary" className="h-20" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Anomaly Detection" className="h-10 w-44" variant="secondary" icon={<Eye size={16} />} />
          <WireframeBox label="Anomaly Timeline" className="h-36" icon={<BarChart3 size={24} />} />
          <WireframeBox label="Detected Anomalies List" className="h-20" />
        </div>
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Recommendations" className="h-10 w-44 mb-3" variant="secondary" icon={<Bot size={16} />} />
        <div className="grid grid-cols-3 gap-3">
          <WireframeBox label="Recommendation 1" className="h-28" />
          <WireframeBox label="Recommendation 2" className="h-28" />
          <WireframeBox label="Recommendation 3" className="h-28" />
        </div>
      </div>
    </div>
  </div>
);

const UserReportsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-reports" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Reports" className="h-10 w-32" variant="primary" icon={<FileText size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Schedule" className="h-9 w-28" icon={<Calendar size={12} />} />
          <WireframeBox label="+ New Report" className="h-9 w-32" variant="accent" icon={<Plus size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <WireframeBox label="Daily" className="h-10" variant="accent" />
        <WireframeBox label="Weekly" className="h-10" />
        <WireframeBox label="Monthly" className="h-10" />
        <WireframeBox label="Custom" className="h-10" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['Uptime Report', 'Alert Summary', 'Host Performance', 'SLA Compliance'].map((report) => (
          <div key={report} className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
            <WireframeBox label={report} className="h-10 w-full mb-3" variant="secondary" />
            <WireframeBox label="Report Preview Chart" className="h-32" icon={<BarChart3 size={20} />} />
            <div className="flex gap-2 mt-3">
              <WireframeBox label="View" className="h-9 flex-1" />
              <WireframeBox label="Download" className="h-9 flex-1" icon={<Download size={12} />} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UserSettingsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="user" currentScreen="user-settings" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="Settings" className="h-10 w-32" variant="primary" icon={<Settings size={16} />} />
      
      <div className="grid grid-cols-5 gap-2">
        <WireframeBox label="Profile" className="h-10" variant="accent" />
        <WireframeBox label="Security" className="h-10" />
        <WireframeBox label="Notifications" className="h-10" />
        <WireframeBox label="Integrations" className="h-10" />
        <WireframeBox label="Preferences" className="h-10" />
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-4">
        <WireframeBox label="Profile Settings" className="h-9 w-40" variant="secondary" />
        <WireframeLine />
        <div className="flex gap-4">
          <WireframeBox label="Avatar Upload" className="h-24 w-24" icon={<Users size={24} />} />
          <div className="flex-1 space-y-3">
            <WireframeBox label="Full Name Input" className="h-11" />
            <WireframeBox label="Email Input" className="h-11" />
            <WireframeBox label="Phone Input" className="h-11" />
          </div>
        </div>
        <WireframeBox label="Bio / Description Textarea" className="h-24" />
        <div className="flex gap-2 justify-end">
          <WireframeBox label="Cancel" className="h-10 w-24" />
          <WireframeBox label="Save Changes" className="h-10 w-32" variant="accent" />
        </div>
      </div>
    </div>
  </div>
);

// ==================== ORG ADMIN SCREENS ====================

const OrgDashboardWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-dashboard" onNavigate={onNavigate} />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Organization Dashboard" className="h-9 w-56" variant="primary" icon={<Building2 size={16} />} />
        <WireframeBox label="Org: Acme Corp" className="h-9 w-36" variant="secondary" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Total Users: 24" className="h-24" variant="secondary" icon={<Users size={20} />} />
        <WireframeBox label="Active Hosts: 156" className="h-24" variant="success" icon={<Server size={20} />} />
        <WireframeBox label="Alerts Today: 47" className="h-24" variant="warning" icon={<Bell size={20} />} />
        <WireframeBox label="Usage: 78%" className="h-24" variant="accent" icon={<Gauge size={20} />} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <WireframeBox label="Organization Activity Chart" className="h-44" icon={<BarChart3 size={24} />} />
        <WireframeBox label="User Activity Distribution" className="h-44" icon={<BarChart3 size={24} />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WireframeBox label="Quick: User Management" className="h-20" onClick={() => onNavigate('org-users')} icon={<Users size={16} />} />
        <WireframeBox label="Quick: Billing Overview" className="h-20" onClick={() => onNavigate('org-billing')} icon={<CreditCard size={16} />} />
        <WireframeBox label="Quick: Alert Config" className="h-20" onClick={() => onNavigate('org-alert-config')} icon={<Wrench size={16} />} />
      </div>
    </div>
  </div>
);

const OrgUsersWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-users" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="User Management" className="h-10 w-48" variant="primary" icon={<Users size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Search Users" className="h-9 w-36" icon={<Search size={12} />} />
          <WireframeBox label="+ Invite User" className="h-9 w-32" variant="accent" icon={<UserPlus size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Total: 24" className="h-16" variant="secondary" />
        <WireframeBox label="Admins: 3" className="h-16" variant="accent" />
        <WireframeBox label="Active: 22" className="h-16" variant="success" />
        <WireframeBox label="Pending: 2" className="h-16" variant="warning" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Users Table Header (Name, Email, Role, Status, Actions)" className="h-9 mb-2" variant="secondary" />
        {[1,2,3,4,5].map((i) => (
          <WireframeBox key={i} label={`User ${i} - john@example.com - User/Admin - Active`} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const OrgBillingWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-billing" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="Billing & Subscription" className="h-10 w-52" variant="primary" icon={<CreditCard size={16} />} />

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Current Plan" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="Professional - $49/mo" className="h-12 w-full" variant="accent" />
          <WireframeBox label="Next billing: Jan 15, 2024" className="h-8 w-full" />
          <WireframeBox label="Upgrade Plan" className="h-10 w-full" variant="primary" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Payment Method" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="•••• 4242" className="h-12 w-full" icon={<CreditCard size={16} />} />
          <WireframeBox label="Expires: 12/25" className="h-8 w-full" />
          <WireframeBox label="Update Card" className="h-10 w-full" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Usage Summary" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="Hosts: 156 / 200" className="h-8 w-full" />
          <WireframeBox label="Users: 24 / 50" className="h-8 w-full" />
          <WireframeBox label="API Calls: 45K / 100K" className="h-8 w-full" />
          <WireframeBox label="View Details" className="h-10 w-full" onClick={() => onNavigate('org-usage')} />
        </div>
      </div>

      <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Invoice History" className="h-9 w-40 mb-3" variant="secondary" />
        {[1,2,3].map((i) => (
          <WireframeBox key={i} label={`Invoice #${1000+i} - $49.00 - Paid - Dec ${i}, 2024`} className="h-11 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const OrgUsageWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-usage" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="Usage Meters" className="h-10 w-40" variant="primary" icon={<Gauge size={16} />} />

      <div className="grid grid-cols-2 gap-4">
        {['Hosts Usage', 'Users Usage', 'API Calls', 'Storage'].map((meter) => (
          <div key={meter} className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
            <WireframeBox label={meter} className="h-9 w-full" variant="secondary" />
            <WireframeBox label="Progress Bar 78%" className="h-6 w-full" variant="accent" />
            <WireframeBox label="Usage Chart Over Time" className="h-28" icon={<BarChart3 size={20} />} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrgAlertConfigWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-alert-config" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Alert Configuration" className="h-10 w-48" variant="primary" icon={<Wrench size={16} />} />
        <WireframeBox label="+ New Rule" className="h-9 w-28" variant="accent" icon={<Plus size={12} />} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <WireframeBox label="All Rules" className="h-10" variant="accent" />
        <WireframeBox label="Thresholds" className="h-10" />
        <WireframeBox label="Escalations" className="h-10" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        {['CPU > 90%', 'Memory > 85%', 'Disk > 80%', 'Network Latency > 100ms'].map((rule, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <WireframeBox label={rule} className="h-12 flex-1" />
            <WireframeBox label="Edit" className="h-12 w-16" icon={<Edit size={12} />} />
            <WireframeBox label="Del" className="h-12 w-14" variant="error" icon={<Trash size={12} />} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrgOnCallWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-oncall" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="On-Call Schedules" className="h-10 w-48" variant="primary" icon={<Phone size={16} />} />
        <WireframeBox label="+ New Schedule" className="h-9 w-36" variant="accent" icon={<Plus size={12} />} />
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Calendar View - On-Call Rotation" className="h-64" icon={<Calendar size={32} />} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
          <WireframeBox label="Current On-Call" className="h-9 w-40 mb-3" variant="success" />
          <WireframeBox label="John Doe - Primary" className="h-12 mb-2" icon={<Users size={14} />} />
          <WireframeBox label="Jane Smith - Backup" className="h-12" icon={<Users size={14} />} />
        </div>
        <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
          <WireframeBox label="Escalation Policy" className="h-9 w-40 mb-3" variant="warning" />
          <WireframeBox label="Level 1: 5 min → Primary" className="h-10 mb-2" />
          <WireframeBox label="Level 2: 15 min → Backup" className="h-10 mb-2" />
          <WireframeBox label="Level 3: 30 min → Manager" className="h-10" />
        </div>
      </div>
    </div>
  </div>
);

const OrgZabbixWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-zabbix" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Zabbix Hosts" className="h-10 w-40" variant="primary" icon={<Network size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Sync Now" className="h-9 w-28" icon={<RefreshCw size={12} />} />
          <WireframeBox label="+ Add Host" className="h-9 w-28" variant="accent" icon={<Plus size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WireframeBox label="Connected: 156" className="h-16" variant="success" />
        <WireframeBox label="Syncing: 3" className="h-16" variant="warning" />
        <WireframeBox label="Error: 1" className="h-16" variant="error" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Zabbix Hosts Table" className="h-9 mb-2" variant="secondary" />
        {[1,2,3,4,5].map((i) => (
          <WireframeBox key={i} label={`zabbix-host-${i} - 192.168.1.${i}0 - Connected - Last sync: 2m ago`} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const OrgMaintenanceWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-maintenance" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Maintenance Windows" className="h-10 w-52" variant="primary" icon={<Calendar size={16} />} />
        <WireframeBox label="+ Schedule Maintenance" className="h-9 w-48" variant="accent" icon={<Plus size={12} />} />
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Maintenance Calendar View" className="h-56" icon={<Calendar size={32} />} />
      </div>

      <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Upcoming Maintenance" className="h-9 w-48 mb-3" variant="secondary" />
        {['Server Upgrade - Jan 20', 'Network Maintenance - Jan 25', 'Database Migration - Feb 1'].map((maint, i) => (
          <WireframeBox key={i} label={maint} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const OrgAISettingsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="org" currentScreen="org-ai-settings" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="AI Settings" className="h-10 w-36" variant="primary" icon={<Bot size={16} />} />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="AI Model Configuration" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="Model: GPT-4 Turbo" className="h-10 w-full" />
          <WireframeBox label="Temperature: 0.7" className="h-10 w-full" />
          <WireframeBox label="Max Tokens: 2048" className="h-10 w-full" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="AI Features" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="☑ Predictive Alerts" className="h-10 w-full" />
          <WireframeBox label="☑ Anomaly Detection" className="h-10 w-full" />
          <WireframeBox label="☑ Auto Recommendations" className="h-10 w-full" />
        </div>
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="AI Usage Statistics" className="h-9 w-48 mb-3" variant="secondary" />
        <WireframeBox label="AI Usage Chart" className="h-36" icon={<BarChart3 size={24} />} />
      </div>
    </div>
  </div>
);

// ==================== SUPER ADMIN SCREENS ====================

const SuperDashboardWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-dashboard" onNavigate={onNavigate} />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Super Admin Dashboard" className="h-9 w-56" variant="primary" icon={<Crown size={16} />} />
        <WireframeBox label="System Status: Healthy" className="h-9 w-44" variant="success" />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <WireframeBox label="Organizations: 47" className="h-24" variant="secondary" icon={<Building2 size={20} />} />
        <WireframeBox label="Total Users: 1,247" className="h-24" variant="secondary" icon={<Users size={20} />} />
        <WireframeBox label="Total Hosts: 8,934" className="h-24" variant="secondary" icon={<Server size={20} />} />
        <WireframeBox label="MRR: $24,500" className="h-24" variant="success" icon={<CreditCard size={20} />} />
        <WireframeBox label="Uptime: 99.97%" className="h-24" variant="accent" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <WireframeBox label="Global Platform Metrics" className="h-48" icon={<BarChart3 size={24} />} />
        <WireframeBox label="Revenue Trend Chart" className="h-48" icon={<TrendingUp size={24} />} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Quick: Orgs" className="h-16" onClick={() => onNavigate('super-orgs')} icon={<Building2 size={16} />} />
        <WireframeBox label="Quick: Security" className="h-16" onClick={() => onNavigate('super-security')} icon={<Lock size={16} />} />
        <WireframeBox label="Quick: Billing" className="h-16" onClick={() => onNavigate('super-billing')} icon={<CreditCard size={16} />} />
        <WireframeBox label="Quick: AI/ML" className="h-16" onClick={() => onNavigate('super-aiml')} icon={<Activity size={16} />} />
      </div>
    </div>
  </div>
);

const SuperOrgsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-orgs" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Organizations" className="h-10 w-40" variant="primary" icon={<Building2 size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Search" className="h-9 w-36" icon={<Search size={12} />} />
          <WireframeBox label="+ New Org" className="h-9 w-28" variant="accent" icon={<Plus size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Total: 47" className="h-16" variant="secondary" />
        <WireframeBox label="Active: 45" className="h-16" variant="success" />
        <WireframeBox label="Trial: 8" className="h-16" variant="warning" />
        <WireframeBox label="Enterprise: 12" className="h-16" variant="accent" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Organizations Table" className="h-9 mb-2" variant="secondary" />
        {['Acme Corp', 'TechStart Inc', 'GlobalNet', 'DataFlow Ltd', 'CloudBase'].map((org, i) => (
          <WireframeBox key={i} label={`${org} - Enterprise - 156 hosts - $499/mo - Active`} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const SuperAnalyticsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-analytics" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Global Analytics" className="h-10 w-44" variant="primary" icon={<TrendingUp size={16} />} />
        <WireframeBox label="Date Range Picker" className="h-9 w-40" icon={<Calendar size={12} />} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WireframeBox label="User Growth Chart" className="h-48" icon={<BarChart3 size={24} />} />
        <WireframeBox label="Revenue Analytics" className="h-48" icon={<TrendingUp size={24} />} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <WireframeBox label="Org Distribution" className="h-36" icon={<BarChart3 size={20} />} />
        <WireframeBox label="Feature Adoption" className="h-36" icon={<BarChart3 size={20} />} />
        <WireframeBox label="Churn Analysis" className="h-36" icon={<BarChart3 size={20} />} />
      </div>
    </div>
  </div>
);

const SuperSecurityWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-security" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Security Logs" className="h-10 w-40" variant="primary" icon={<Lock size={16} />} />
        <div className="flex gap-2">
          <WireframeBox label="Filter" className="h-9 w-24" icon={<Filter size={12} />} />
          <WireframeBox label="Export" className="h-9 w-24" icon={<Download size={12} />} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Login Attempts: 1,247" className="h-16" variant="secondary" />
        <WireframeBox label="Failed: 23" className="h-16" variant="warning" />
        <WireframeBox label="Blocked: 5" className="h-16" variant="error" />
        <WireframeBox label="2FA Enabled: 89%" className="h-16" variant="success" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Audit Log" className="h-9 w-32 mb-3" variant="secondary" />
        {[1,2,3,4,5,6].map((i) => (
          <WireframeBox key={i} label={`[2024-01-15 14:${30+i}] User john@acme.com - Login - Success - IP: 192.168.1.${i}`} className="h-10 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const SuperBillingWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-billing" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="Multi-Tenant Billing" className="h-10 w-48" variant="primary" icon={<CreditCard size={16} />} />

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="MRR: $24,500" className="h-24" variant="success" icon={<TrendingUp size={20} />} />
        <WireframeBox label="ARR: $294K" className="h-24" variant="secondary" icon={<CreditCard size={20} />} />
        <WireframeBox label="Overdue: $1,200" className="h-24" variant="error" icon={<Clock size={20} />} />
        <WireframeBox label="Pending: $3,400" className="h-24" variant="warning" icon={<Clock size={20} />} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WireframeBox label="Revenue by Plan" className="h-44" icon={<BarChart3 size={24} />} />
        <WireframeBox label="Revenue Trend" className="h-44" icon={<TrendingUp size={24} />} />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Recent Transactions" className="h-9 w-44 mb-3" variant="secondary" />
        {[1,2,3,4].map((i) => (
          <WireframeBox key={i} label={`Acme Corp - $499.00 - Paid - Jan ${i}, 2024`} className="h-11 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const SuperDRWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-dr" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="Disaster Recovery" className="h-10 w-48" variant="primary" icon={<Database size={16} />} />

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Primary Region" className="h-9 w-full" variant="success" />
          <WireframeBox label="US-East-1" className="h-10 w-full" />
          <WireframeBox label="Status: Active" className="h-8 w-full" variant="success" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Secondary Region" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="EU-West-1" className="h-10 w-full" />
          <WireframeBox label="Status: Standby" className="h-8 w-full" />
        </div>
        <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 space-y-3">
          <WireframeBox label="Last Backup" className="h-9 w-full" variant="secondary" />
          <WireframeBox label="2 hours ago" className="h-10 w-full" />
          <WireframeBox label="Run Backup Now" className="h-8 w-full" variant="accent" />
        </div>
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Backup History" className="h-9 w-40 mb-3" variant="secondary" />
        {[1,2,3].map((i) => (
          <WireframeBox key={i} label={`Backup #${100+i} - Full - 2.4GB - Completed - Jan ${15-i}, 2024`} className="h-11 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

const SuperAIMLWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-aiml" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <WireframeBox label="AI/ML Performance" className="h-10 w-44" variant="primary" icon={<Activity size={16} />} />

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Model Accuracy: 94%" className="h-20" variant="success" />
        <WireframeBox label="Predictions/Day: 12K" className="h-20" variant="secondary" />
        <WireframeBox label="Latency: 120ms" className="h-20" variant="accent" />
        <WireframeBox label="Cost/Day: $45" className="h-20" variant="secondary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WireframeBox label="Model Performance Over Time" className="h-44" icon={<BarChart3 size={24} />} />
        <WireframeBox label="API Usage Distribution" className="h-44" icon={<BarChart3 size={24} />} />
      </div>

      <div className="p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
        <WireframeBox label="Model Versions" className="h-9 w-40 mb-3" variant="secondary" />
        <div className="grid grid-cols-3 gap-3">
          <WireframeBox label="v2.1 - Active" className="h-12" variant="success" />
          <WireframeBox label="v2.0 - Previous" className="h-12" />
          <WireframeBox label="v1.9 - Archived" className="h-12" />
        </div>
      </div>
    </div>
  </div>
);

const SuperFlagsWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-flags" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Feature Flags" className="h-10 w-40" variant="primary" icon={<Flag size={16} />} />
        <WireframeBox label="+ New Flag" className="h-9 w-28" variant="accent" icon={<Plus size={12} />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <WireframeBox label="Active: 12" className="h-16" variant="success" />
        <WireframeBox label="Inactive: 5" className="h-16" variant="muted" />
        <WireframeBox label="In Testing: 3" className="h-16" variant="warning" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        {['new-dashboard-ui', 'ai-insights-v2', 'advanced-reporting', 'mobile-app-beta', 'dark-mode-v2'].map((flag, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <WireframeBox label={flag} className="h-11 flex-1" />
            <WireframeBox label="%" className="h-11 w-16" />
            <WireframeBox label={i < 3 ? 'ON' : 'OFF'} className="h-11 w-16" variant={i < 3 ? 'success' : 'muted'} />
            <WireframeBox label="" className="h-11 w-10" icon={<Edit size={12} />} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SuperResellerWireframe: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => (
  <div className="flex gap-4">
    <DashboardSidebar type="super" currentScreen="super-reseller" onNavigate={onNavigate} collapsed />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <WireframeBox label="Reseller Portal" className="h-10 w-40" variant="primary" icon={<Store size={16} />} />
        <WireframeBox label="+ New Reseller" className="h-9 w-36" variant="accent" icon={<Plus size={12} />} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <WireframeBox label="Resellers: 8" className="h-20" variant="secondary" />
        <WireframeBox label="Clients: 124" className="h-20" variant="secondary" />
        <WireframeBox label="Revenue: $12K" className="h-20" variant="success" />
        <WireframeBox label="Commission: $1.8K" className="h-20" variant="accent" />
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10 p-3">
        <WireframeBox label="Resellers Table" className="h-9 mb-2" variant="secondary" />
        {['TechPartners Inc', 'CloudSolutions', 'NetManage Pro', 'IT Services Co'].map((reseller, i) => (
          <WireframeBox key={i} label={`${reseller} - ${15+i*5} clients - $${(i+1)*2}K revenue - Active`} className="h-12 mb-2" />
        ))}
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export const InteractiveWireframe: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<ScreenCategory>('public');
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

  const categories: { id: ScreenCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'public', label: 'Public', icon: <Home size={14} /> },
    { id: 'auth', label: 'Authentication', icon: <LogIn size={14} /> },
    { id: 'user', label: 'User Dashboard', icon: <Users size={14} /> },
    { id: 'org-admin', label: 'Org Admin', icon: <Building2 size={14} /> },
    { id: 'super-admin', label: 'Super Admin', icon: <Crown size={14} /> },
  ];

  const screensByCategory: Record<ScreenCategory, { id: Screen; label: string }[]> = {
    'public': [
      { id: 'landing', label: 'Landing Page' },
    ],
    'auth': [
      { id: 'login', label: 'Login' },
      { id: 'signup', label: 'Sign Up' },
      { id: 'forgot-password', label: 'Forgot Password' },
      { id: 'reset-password', label: 'Reset Password' },
      { id: '2fa-setup', label: '2FA Setup' },
      { id: '2fa-verify', label: '2FA Verify' },
    ],
    'user': [
      { id: 'user-dashboard', label: 'Dashboard' },
      { id: 'user-alerts', label: 'Alerts' },
      { id: 'user-hosts', label: 'Hosts' },
      { id: 'user-host-detail', label: 'Host Detail' },
      { id: 'user-traps', label: 'Traps' },
      { id: 'user-insights', label: 'Insights' },
      { id: 'user-reports', label: 'Reports' },
      { id: 'user-settings', label: 'Settings' },
    ],
    'org-admin': [
      { id: 'org-dashboard', label: 'Dashboard' },
      { id: 'org-users', label: 'Users' },
      { id: 'org-billing', label: 'Billing' },
      { id: 'org-usage', label: 'Usage' },
      { id: 'org-alert-config', label: 'Alert Config' },
      { id: 'org-oncall', label: 'On-Call' },
      { id: 'org-zabbix', label: 'Zabbix' },
      { id: 'org-maintenance', label: 'Maintenance' },
      { id: 'org-ai-settings', label: 'AI Settings' },
    ],
    'super-admin': [
      { id: 'super-dashboard', label: 'Dashboard' },
      { id: 'super-orgs', label: 'Organizations' },
      { id: 'super-analytics', label: 'Analytics' },
      { id: 'super-security', label: 'Security' },
      { id: 'super-billing', label: 'Billing' },
      { id: 'super-dr', label: 'Disaster Recovery' },
      { id: 'super-aiml', label: 'AI/ML' },
      { id: 'super-flags', label: 'Feature Flags' },
      { id: 'super-reseller', label: 'Reseller' },
    ],
  };

  const handleCategoryChange = (cat: ScreenCategory) => {
    setCurrentCategory(cat);
    setCurrentScreen(screensByCategory[cat][0].id);
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    // Auto-switch category based on screen prefix
    if (screen.startsWith('user-')) setCurrentCategory('user');
    else if (screen.startsWith('org-')) setCurrentCategory('org-admin');
    else if (screen.startsWith('super-')) setCurrentCategory('super-admin');
    else if (['login', 'signup', 'forgot-password', 'reset-password', '2fa-setup', '2fa-verify'].includes(screen)) setCurrentCategory('auth');
    else if (screen === 'landing') setCurrentCategory('public');
  };

  const renderScreen = () => {
    const screens: Record<Screen, React.ReactNode> = {
      'landing': <LandingWireframe onNavigate={handleNavigate} />,
      'login': <LoginWireframe onNavigate={handleNavigate} />,
      'signup': <SignupWireframe onNavigate={handleNavigate} />,
      'forgot-password': <ForgotPasswordWireframe onNavigate={handleNavigate} />,
      'reset-password': <ResetPasswordWireframe onNavigate={handleNavigate} />,
      '2fa-setup': <TwoFASetupWireframe onNavigate={handleNavigate} />,
      '2fa-verify': <TwoFAVerifyWireframe onNavigate={handleNavigate} />,
      'user-dashboard': <UserDashboardWireframe onNavigate={handleNavigate} />,
      'user-alerts': <UserAlertsWireframe onNavigate={handleNavigate} />,
      'user-hosts': <UserHostsWireframe onNavigate={handleNavigate} />,
      'user-host-detail': <UserHostDetailWireframe onNavigate={handleNavigate} />,
      'user-traps': <UserTrapsWireframe onNavigate={handleNavigate} />,
      'user-insights': <UserInsightsWireframe onNavigate={handleNavigate} />,
      'user-reports': <UserReportsWireframe onNavigate={handleNavigate} />,
      'user-settings': <UserSettingsWireframe onNavigate={handleNavigate} />,
      'org-dashboard': <OrgDashboardWireframe onNavigate={handleNavigate} />,
      'org-users': <OrgUsersWireframe onNavigate={handleNavigate} />,
      'org-billing': <OrgBillingWireframe onNavigate={handleNavigate} />,
      'org-usage': <OrgUsageWireframe onNavigate={handleNavigate} />,
      'org-alert-config': <OrgAlertConfigWireframe onNavigate={handleNavigate} />,
      'org-oncall': <OrgOnCallWireframe onNavigate={handleNavigate} />,
      'org-zabbix': <OrgZabbixWireframe onNavigate={handleNavigate} />,
      'org-maintenance': <OrgMaintenanceWireframe onNavigate={handleNavigate} />,
      'org-ai-settings': <OrgAISettingsWireframe onNavigate={handleNavigate} />,
      'super-dashboard': <SuperDashboardWireframe onNavigate={handleNavigate} />,
      'super-orgs': <SuperOrgsWireframe onNavigate={handleNavigate} />,
      'super-analytics': <SuperAnalyticsWireframe onNavigate={handleNavigate} />,
      'super-security': <SuperSecurityWireframe onNavigate={handleNavigate} />,
      'super-billing': <SuperBillingWireframe onNavigate={handleNavigate} />,
      'super-dr': <SuperDRWireframe onNavigate={handleNavigate} />,
      'super-aiml': <SuperAIMLWireframe onNavigate={handleNavigate} />,
      'super-flags': <SuperFlagsWireframe onNavigate={handleNavigate} />,
      'super-reseller': <SuperResellerWireframe onNavigate={handleNavigate} />,
    };
    return screens[currentScreen] || <LandingWireframe onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Jarvis System Wireframe</h1>
          <p className="text-muted-foreground text-sm">Click elements to navigate • Complete interactive prototype</p>
        </div>

        <CategorySelector 
          categories={categories} 
          current={currentCategory} 
          onSelect={handleCategoryChange} 
        />

        <ScreenSelector 
          screens={screensByCategory[currentCategory]} 
          current={currentScreen} 
          onSelect={setCurrentScreen} 
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-card/50"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Total Screens: {Object.values(screensByCategory).flat().length} • 
          Current: {currentScreen.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>
    </div>
  );
};

export default InteractiveWireframe;
