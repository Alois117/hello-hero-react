import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WireframeBoxProps {
  label?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "card" | "button" | "input" | "header" | "sidebar" | "chart" | "table";
  animated?: boolean;
}

export const WireframeBox = ({
  label,
  className = "",
  children,
  onClick,
  variant = "default",
  animated = true,
}: WireframeBoxProps) => {
  const variants = {
    default: "border-2 border-dashed border-border/60 bg-muted/20",
    card: "border border-border/40 bg-card/30 rounded-lg shadow-sm",
    button: "border border-primary/50 bg-primary/10 rounded-md cursor-pointer hover:bg-primary/20 transition-colors",
    input: "border border-border/50 bg-background/50 rounded-md",
    header: "border-b border-border/40 bg-card/40",
    sidebar: "border-r border-border/40 bg-card/30",
    chart: "border border-border/30 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg",
    table: "border border-border/30 bg-card/20 rounded-lg overflow-hidden",
  };

  const Component = animated ? motion.div : "div";
  const animationProps = animated
    ? {
        whileHover: { scale: onClick ? 1.02 : 1, opacity: 1 },
        whileTap: onClick ? { scale: 0.98 } : {},
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      className={`${variants[variant]} ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      {...animationProps}
    >
      {label && (
        <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/30 rounded absolute -top-3 left-2">
          {label}
        </span>
      )}
      {children}
    </Component>
  );
};

interface WireframeTextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  className?: string;
  children: ReactNode;
}

export const WireframeText = ({ variant = "body", className = "", children }: WireframeTextProps) => {
  const variants = {
    h1: "text-2xl font-bold text-foreground",
    h2: "text-xl font-semibold text-foreground",
    h3: "text-lg font-medium text-foreground",
    body: "text-sm text-muted-foreground",
    caption: "text-xs text-muted-foreground/70",
    label: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
  };

  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
};

interface WireframePlaceholderProps {
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

export const WireframePlaceholder = ({
  width = "w-full",
  height = "h-4",
  className = "",
  lines = 1,
}: WireframePlaceholderProps) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`${width} ${height} bg-muted/40 rounded animate-pulse`}
        style={{ width: i === lines - 1 && lines > 1 ? "60%" : undefined }}
      />
    ))}
  </div>
);

interface WireframeIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WireframeIcon = ({ className = "", size = "md" }: WireframeIconProps) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return <div className={`${sizes[size]} rounded bg-muted/50 ${className}`} />;
};

interface WireframeAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WireframeAvatar = ({ className = "", size = "md" }: WireframeAvatarProps) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 ${className}`} />;
};

export const WireframeDivider = ({ className = "" }: { className?: string }) => (
  <div className={`h-px bg-border/40 ${className}`} />
);

interface WireframeBadgeProps {
  variant?: "default" | "success" | "warning" | "error";
  children: ReactNode;
}

export const WireframeBadge = ({ variant = "default", children }: WireframeBadgeProps) => {
  const variants = {
    default: "bg-muted/50 text-muted-foreground",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    error: "bg-destructive/20 text-destructive",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${variants[variant]}`}>{children}</span>
  );
};
