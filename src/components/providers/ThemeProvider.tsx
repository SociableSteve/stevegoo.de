"use client";

import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read theme from data-theme attribute set by the inline script
    // Only run in browser environment (not during SSR)
    if (typeof document === "undefined") return "light";

    const dataTheme = document.documentElement.dataset["theme"] as Theme;
    return (dataTheme === "light" || dataTheme === "dark") ? dataTheme : "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Persist to localStorage
    localStorage.setItem("theme", newTheme);

    // Add transition class
    document.documentElement.classList.add("theme-transitioning");

    // Update data-theme attribute
    document.documentElement.dataset["theme"] = newTheme;

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}