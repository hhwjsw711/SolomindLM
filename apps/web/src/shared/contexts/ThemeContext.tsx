import { ReactNode, useCallback, useEffect, useState } from "react";
import { ThemeContext } from "./useTheme";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("solomind_theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* localStorage unavailable */
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("solomind_theme", newTheme);
      return newTheme;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
