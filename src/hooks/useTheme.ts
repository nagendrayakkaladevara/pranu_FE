import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ecqes-theme") as Theme | null;
    return stored ?? "dark";
  });

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem("ecqes-theme", next);
    applyTheme(next);
  }, []);

  // Apply on mount and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const resolved: "dark" | "light" = theme === "system" ? getSystemTheme() : theme;

  return { theme, resolved, setTheme } as const;
}
