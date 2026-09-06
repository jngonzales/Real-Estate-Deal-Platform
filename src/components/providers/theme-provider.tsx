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
  // Initialise lazily so we never have to call setState inside an effect just to
  // mirror localStorage. Server renders with the supplied defaultTheme; on the
  // client the stored value is read before first paint.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    if (stored && ["dark", "light", "system"].includes(stored)) return stored;
    return defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    getResolvedTheme(theme)
  );

  // Apply theme whenever it changes
  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    applyThemeToDOM(resolved);
    // Defer the React state update to a microtask so we don't trigger a
    // cascading render inside the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => setResolvedTheme(resolved));
  }, [theme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light";
      applyThemeToDOM(newResolved);
      // setState inside an event-handler callback is allowed by the rule.
      setResolvedTheme(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Immediately apply to DOM for instant feedback
    const resolved = getResolvedTheme(newTheme);
    applyThemeToDOM(resolved);
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
