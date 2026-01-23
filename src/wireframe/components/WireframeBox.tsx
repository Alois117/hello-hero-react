import { cn } from "@/lib/utils";

interface WireframeBoxProps {
  label?: string;
  className?: string;
  children?: React.ReactNode;
  dashed?: boolean;
  onClick?: () => void;
}

export const WireframeBox = ({ label, className, children, dashed = false, onClick }: WireframeBoxProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border-2 border-muted-foreground/30 rounded-lg p-4 bg-muted/20 relative",
        dashed && "border-dashed",
        onClick && "cursor-pointer hover:bg-muted/40 transition-colors",
        className
      )}
    >
      {label && (
        <span className="absolute -top-3 left-3 bg-background px-2 text-xs text-muted-foreground font-mono">
          {label}
        </span>
      )}
      {children}
    </div>
  );
};
