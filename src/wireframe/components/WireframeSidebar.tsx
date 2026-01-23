import { cn } from "@/lib/utils";
import { WireframeText } from "./WireframeText";

interface SidebarItem {
  label: string;
  icon?: string;
  active?: boolean;
  badge?: string;
}

interface WireframeSidebarProps {
  title?: string;
  items: SidebarItem[];
  className?: string;
  onItemClick?: (label: string) => void;
}

export const WireframeSidebar = ({ title, items, className, onItemClick }: WireframeSidebarProps) => {
  return (
    <aside className={cn("w-64 border-r-2 border-dashed border-muted-foreground/30 bg-muted/10 p-4 space-y-4", className)}>
      {title && (
        <div className="pb-4 border-b-2 border-dashed border-muted-foreground/20">
          <WireframeText variant="h3">{title}</WireframeText>
        </div>
      )}
      <nav className="space-y-1">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onItemClick?.(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
              item.active
                ? "bg-primary/20 border-2 border-dashed border-primary/50"
                : "hover:bg-muted/50 border-2 border-transparent"
            )}
          >
            {item.icon && (
              <span className="w-5 h-5 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center text-[10px] font-mono">
                {item.icon}
              </span>
            )}
            <span className="text-sm font-mono text-muted-foreground flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 bg-destructive/20 border border-dashed border-destructive/50 rounded text-xs font-mono">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};
