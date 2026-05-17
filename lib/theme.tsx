"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gl-theme") as Theme | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("gl-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Avoid hydration mismatch — render children immediately, theme snaps in on mount
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
