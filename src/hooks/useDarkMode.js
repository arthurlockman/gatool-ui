import { useState, useMemo, useEffect } from "react";
import { usePersistentState } from "./UsePersistentState";

export function useDarkMode() {
  const [darkMode, setDarkMode] = usePersistentState(
    "setting:darkMode",
    false
  );
  const [useOsTheme, setUseOsTheme] = usePersistentState(
    "setting:useOsTheme",
    true
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemPrefersDark(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const appearanceDark = useMemo(
    () => (useOsTheme ? systemPrefersDark : !!darkMode),
    [useOsTheme, systemPrefersDark, darkMode]
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      appearanceDark ? "dark" : "light"
    );
  }, [appearanceDark]);

  return {
    darkMode,
    setDarkMode,
    useOsTheme,
    setUseOsTheme,
    systemPrefersDark,
    appearanceDark,
  };
}
