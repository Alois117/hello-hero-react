import { cn } from "@/lib/utils";

interface WireframeInputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "search" | "select";
  className?: string;
}

export const WireframeInput = ({ label, placeholder, type = "text", className }: WireframeInputProps) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
      )}
      <div className="border-2 border-dashed border-muted-foreground/30 rounded-md px-3 py-2 bg-muted/10">
        <span className="text-sm text-muted-foreground/50 font-mono">
          {type === "select" ? `[▼ ${placeholder || "Select..."}]` : `[${placeholder || type}]`}
        </span>
      </div>
    </div>
  );
};
