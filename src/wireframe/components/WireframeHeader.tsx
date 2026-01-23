import { cn } from "@/lib/utils";
import { WireframeText } from "./WireframeText";
import { WireframeInput } from "./WireframeInput";

interface WireframeHeaderProps {
  title?: string;
  showSearch?: boolean;
  showUser?: boolean;
  showThemeToggle?: boolean;
  className?: string;
}

export const WireframeHeader = ({ title, showSearch, showUser, showThemeToggle, className }: WireframeHeaderProps) => {
  return (
    <header className={cn("h-16 border-b-2 border-dashed border-muted-foreground/30 bg-muted/10 px-6 flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        {title && <WireframeText variant="h3">{title}</WireframeText>}
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="w-64">
            <WireframeInput placeholder="Search..." type="search" />
          </div>
        )}
        {showThemeToggle && (
          <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-mono">☀</span>
          </div>
        )}
        {showUser && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-mono">U</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">[User]</span>
          </div>
        )}
      </div>
    </header>
  );
};
