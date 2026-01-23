import { cn } from "@/lib/utils";
import { WireframeBox } from "./WireframeBox";
import { WireframeText } from "./WireframeText";

interface WireframeCardProps {
  label?: string;
  title?: string;
  value?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
}

export const WireframeCard = ({ label, title, value, subtitle, icon, className, children }: WireframeCardProps) => {
  return (
    <WireframeBox label={label} className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {title && <WireframeText variant="caption">{title}</WireframeText>}
          {value && <WireframeText variant="h2">{value}</WireframeText>}
          {subtitle && <WireframeText variant="caption">{subtitle}</WireframeText>}
        </div>
        {icon && (
          <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <span className="text-xs font-mono text-muted-foreground">[{icon}]</span>
          </div>
        )}
      </div>
      {children}
    </WireframeBox>
  );
};
