import { useState, useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/button";

type DashboardTheme = "dark" | "light";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<DashboardTheme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard-theme") as DashboardTheme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: DashboardTheme) => {
    const root = document.documentElement;

    if (newTheme === "light") {
      // Light theme CSS variables
      root.style.setProperty("--background", "0 0% 100%");
      root.style.setProperty("--foreground", "240 10% 3.9%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "240 10% 3.9%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "240 10% 3.9%");
      root.style.setProperty("--primary", "185 100% 40%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--secondary", "240 4.8% 95.9%");
      root.style.setProperty("--secondary-foreground", "240 5.9% 10%");
      root.style.setProperty("--muted", "240 4.8% 95.9%");
      root.style.setProperty("--muted-foreground", "240 3.8% 46.1%");
      root.style.setProperty("--accent", "340 100% 50%");
      root.style.setProperty("--accent-foreground", "0 0% 100%");
      root.style.setProperty("--destructive", "0 84.2% 60.2%");
      root.style.setProperty("--destructive-foreground", "0 0% 100%");
      root.style.setProperty("--border", "240 5.9% 90%");
      root.style.setProperty("--input", "240 5.9% 90%");
      root.style.setProperty("--ring", "185 100% 40%");
      root.style.setProperty("--surface", "240 4.8% 97%");
      root.style.setProperty("--success", "142 76% 36%");
      root.style.setProperty("--warning", "38 92% 50%");
      root.style.setProperty("--sidebar", "0 0% 98%");
      root.style.setProperty("--sidebar-foreground", "240 5.3% 26.1%");
      root.style.setProperty("--sidebar-border", "220 13% 91%");
      root.style.setProperty("--sidebar-accent", "220 14.3% 95.9%");
    } else {
      // Dark cyberpunk theme (existing)
      root.style.setProperty("--background", "229 58% 10%");
      root.style.setProperty("--foreground", "210 40% 98%");
      root.style.setProperty("--card", "229 48% 12%");
      root.style.setProperty("--card-foreground", "210 40% 98%");
      root.style.setProperty("--popover", "229 48% 12%");
      root.style.setProperty("--popover-foreground", "210 40% 98%");
      root.style.setProperty("--primary", "185 100% 50%");
      root.style.setProperty("--primary-foreground", "229 58% 10%");
      root.style.setProperty("--secondary", "257 76% 69%");
      root.style.setProperty("--secondary-foreground", "210 40% 98%");
      root.style.setProperty("--muted", "229 38% 20%");
      root.style.setProperty("--muted-foreground", "215 20.2% 65.1%");
      root.style.setProperty("--accent", "340 100% 58%");
      root.style.setProperty("--accent-foreground", "210 40% 98%");
      root.style.setProperty("--destructive", "0 84% 60%");
      root.style.setProperty("--destructive-foreground", "210 40% 98%");
      root.style.setProperty("--border", "229 38% 20%");
      root.style.setProperty("--input", "229 38% 20%");
      root.style.setProperty("--ring", "185 100% 50%");
      root.style.setProperty("--surface", "229 48% 15%");
      root.style.setProperty("--success", "142 76% 36%");
      root.style.setProperty("--warning", "38 92% 50%");
      root.style.setProperty("--sidebar", "229 48% 12%");
      root.style.setProperty("--sidebar-foreground", "210 40% 98%");
      root.style.setProperty("--sidebar-border", "229 38% 20%");
      root.style.setProperty("--sidebar-accent", "229 48% 15%");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative hover:bg-surface"
    >
      {theme === "dark" ? (
        <FiSun className="w-5 h-5" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
