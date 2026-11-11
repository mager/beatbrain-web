import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY, type Theme } from "../lib/theme";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [preference, setPreference] = useState<Theme | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch {}
    setPreference(saved === "light" || saved === "dark" ? saved : null);
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreference(event.newValue === "light" || event.newValue === "dark" ? event.newValue : null);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const next = preference || (media.matches ? "dark" : "light");
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preference, ready]);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setPreference(next);
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
