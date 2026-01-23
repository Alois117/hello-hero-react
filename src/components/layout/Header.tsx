import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAuth, getAuthUser } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-18 bg-card/80 backdrop-blur-lg border-b border-border z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search hosts, problems, insights..."
              className="pl-10 bg-surface/50 border-border/50 focus:border-primary transition-all w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-6">
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-surface">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-background" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{user?.email || "User"}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user?.role?.replace("_", " ") || "User"}
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
