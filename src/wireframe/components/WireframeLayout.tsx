import { ReactNode } from "react";
import { motion } from "framer-motion";
import { WireframeBox, WireframeText, WireframeIcon, WireframeAvatar, WireframeDivider } from "./WireframePrimitives";

interface WireframeHeaderProps {
  title: string;
  onNavigate?: (screen: string) => void;
  showUserMenu?: boolean;
  variant?: "landing" | "dashboard";
}

export const WireframeHeader = ({ title, onNavigate, showUserMenu = true, variant = "dashboard" }: WireframeHeaderProps) => (
  <WireframeBox variant="header" className="h-14 px-4 flex items-center justify-between" animated={false}>
    <div className="flex items-center gap-4">
      <motion.div
        className="flex items-center gap-2 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={() => onNavigate?.("landing")}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
        <WireframeText variant="h3">{title}</WireframeText>
      </motion.div>
      {variant === "landing" && (
        <div className="hidden md:flex items-center gap-6 ml-8">
          {["Features", "Pricing", "Demo", "Contact"].map((item) => (
            <span key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="flex items-center gap-3">
      {variant === "landing" ? (
        <>
          <motion.button
            className="text-sm text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate?.("login")}
          >
            Login
          </motion.button>
          <motion.button
            className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md"
            whileHover={{ scale: 1.05 }}
            onClick={() => onNavigate?.("signup")}
          >
            Get Started
          </motion.button>
        </>
      ) : showUserMenu ? (
        <>
          <WireframeIcon size="sm" />
          <WireframeIcon size="sm" />
          <WireframeAvatar />
        </>
      ) : null}
    </div>
  </WireframeBox>
);

interface WireframeSidebarProps {
  items: Array<{ label: string; screen?: string; icon?: boolean; active?: boolean }>;
  onNavigate?: (screen: string) => void;
  title?: string;
  collapsed?: boolean;
}

export const WireframeSidebar = ({ items, onNavigate, title, collapsed = false }: WireframeSidebarProps) => (
  <WireframeBox variant="sidebar" className={`${collapsed ? "w-16" : "w-60"} flex flex-col`} animated={false}>
    {title && (
      <div className="p-4 border-b border-border/30">
        <WireframeText variant="label">{title}</WireframeText>
      </div>
    )}
    <nav className="flex-1 p-2 space-y-1">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
            item.active
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          }`}
          whileHover={{ x: 4 }}
          onClick={() => item.screen && onNavigate?.(item.screen)}
        >
          <WireframeIcon size="sm" />
          {!collapsed && <span className="text-sm">{item.label}</span>}
        </motion.div>
      ))}
    </nav>
  </WireframeBox>
);

interface WireframePageProps {
  children: ReactNode;
  className?: string;
}

export const WireframePage = ({ children, className = "" }: WireframePageProps) => (
  <motion.div
    className={`flex-1 p-6 overflow-auto ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

interface WireframeGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export const WireframeGrid = ({ children, cols = 4, gap = "md" }: WireframeGridProps) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  const gapClasses = { sm: "gap-3", md: "gap-4", lg: "gap-6" };

  return <div className={`grid ${colClasses[cols]} ${gapClasses[gap]}`}>{children}</div>;
};

export const WireframeSection = ({ children, title }: { children: ReactNode; title?: string }) => (
  <section className="space-y-4">
    {title && <WireframeText variant="h2">{title}</WireframeText>}
    {children}
  </section>
);
