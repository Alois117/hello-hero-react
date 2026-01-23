import { cn } from "@/lib/utils";

interface WireframeTextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  className?: string;
  children: React.ReactNode;
}

export const WireframeText = ({ variant = "body", className, children }: WireframeTextProps) => {
  const variants = {
    h1: "text-2xl font-bold text-foreground",
    h2: "text-xl font-semibold text-foreground",
    h3: "text-lg font-medium text-foreground",
    body: "text-sm text-muted-foreground",
    caption: "text-xs text-muted-foreground/70",
    label: "text-xs font-mono uppercase tracking-wider text-muted-foreground",
  };

  return <span className={cn(variants[variant], className)}>{children}</span>;
};
