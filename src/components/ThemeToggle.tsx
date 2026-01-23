import { useState, useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
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
      className="relative hover:bg-surface transition-all border-border/50 hover:border-primary/50"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <FiMoon className="w-5 h-5" />
        ) : (
          <FiSun className="w-5 h-5" />
        )}
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;
