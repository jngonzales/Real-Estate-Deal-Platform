"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Helper to get resolved theme
function getResolvedTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  }
  return theme;
}

// Helper to apply theme to DOM
function applyThemeToDOM(resolvedTheme: "dark" | "light") {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  // Remove both classes first to ensure clean state
  root.classList.remove("light", "dark");
  // Force a reflow to ensure the removal takes effect
  void root.offsetHeight;
  // Add the new theme class
  root.classList.add(resolvedTheme);
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "dealflow-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored && ["dark", "light", "system"].includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey]);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;
    
    const resolved = getResolvedTheme(theme);
    applyThemeToDOM(resolved);
    setResolvedTheme(resolved);
  }, [theme, mounted]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light";
      applyThemeToDOM(newResolved);
      setResolvedTheme(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    console.log("setTheme called with:", newTheme);
    // Immediately apply to DOM for instant feedback
    const resolved = getResolvedTheme(newTheme);
    console.log("Resolved theme:", resolved);
    console.log("Current classes before:", document.documentElement.classList.toString());
    applyThemeToDOM(resolved);
    console.log("Current classes after:", document.documentElement.classList.toString());
    setResolvedTheme(resolved);
    
    // Update state and storage
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  }, [storageKey]);

  // Prevent flash by not rendering until mounted
  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
