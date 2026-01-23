import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

interface WireframeNavProps {
  items: NavItem[];
  className?: string;
}

export const WireframeNav = ({ items, className }: WireframeNavProps) => {
  const location = useLocation();

  return (
    <nav className={cn("flex items-center gap-2 p-2 border-b-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-x-auto", className)}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary/20 border-2 border-dashed border-primary/50 text-primary"
                : "border-2 border-transparent hover:bg-muted/50 text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
