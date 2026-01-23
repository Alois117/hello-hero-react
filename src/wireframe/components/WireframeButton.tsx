import { cn } from "@/lib/utils";

interface WireframeButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const WireframeButton = ({ label, variant = "primary", size = "md", className, onClick }: WireframeButtonProps) => {
  const variants = {
    primary: "bg-primary/20 border-primary/50 text-primary",
    secondary: "bg-secondary/20 border-secondary/50 text-secondary-foreground",
    outline: "bg-transparent border-muted-foreground/50 text-muted-foreground",
    ghost: "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "border-2 border-dashed rounded-md font-mono transition-colors hover:opacity-80",
        variants[variant],
        sizes[size],
        className
      )}
    >
      [{label}]
    </button>
  );
};
