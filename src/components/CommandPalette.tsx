import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { Search, LayoutDashboard, Server, AlertTriangle, Radio, Lightbulb, FileText, Settings } from "lucide-react";

const commands = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "hosts", label: "Hosts", icon: Server, path: "/hosts" },
  { id: "problems", label: "Problems", icon: AlertTriangle, path: "/problems" },
  { id: "traps", label: "Traps", icon: Radio, path: "/traps" },
  { id: "insights", label: "Insights", icon: Lightbulb, path: "/insights" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <Command className="glass-card rounded-lg border border-primary/20 shadow-2xl animate-scale-in">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation" className="text-xs text-muted-foreground mb-2 px-2">
              {commands.map((command) => (
                <Command.Item
                  key={command.id}
                  onSelect={() => handleSelect(command.path)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <command.icon className="w-4 h-4 text-primary" />
                  <span>{command.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="border-t border-border p-2 text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
            {" "}to close
          </div>
        </Command>
      </div>
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setOpen(false)}
      />
    </div>
  );
};

export default CommandPalette;
