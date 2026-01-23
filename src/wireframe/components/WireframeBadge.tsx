import { cn } from "@/lib/utils";

interface WireframeBadgeProps {
  label: string;
  variant?: "default" | "critical" | "high" | "warning" | "info" | "success";
  className?: string;
}

export const WireframeBadge = ({ label, variant = "default", className }: WireframeBadgeProps) => {
  const variants = {
    default: "border-muted-foreground/30 text-muted-foreground",
    critical: "border-destructive/50 text-destructive bg-destructive/10",
    high: "border-orange-500/50 text-orange-500 bg-orange-500/10",
    warning: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
    info: "border-blue-500/50 text-blue-500 bg-blue-500/10",
    success: "border-green-500/50 text-green-500 bg-green-500/10",
  };

  return (
    <span className={cn(
      "px-2 py-0.5 border-2 border-dashed rounded text-xs font-mono",
      variants[variant],
      className
    )}>
      {label}
    </span>
  );
};
