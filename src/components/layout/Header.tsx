import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { UserInfoMenu } from "@/keycloak";

const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-64 h-18 bg-card/80 backdrop-blur-lg border-b border-border z-40">
      <div className="h-full px-4 lg:px-6 3xl:px-10 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl lg:max-w-2xl 3xl:max-w-3xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search hosts, problems, insights..."
              className="pl-10 bg-surface/50 border-border/50 focus:border-primary transition-all w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 lg:gap-4 ml-4 lg:ml-6">
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-surface">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
          </Button>

          {/* User Menu with Keycloak Integration */}
          <UserInfoMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
