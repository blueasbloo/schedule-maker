import { useState, type ReactNode } from "react"
import type { ColorTheme } from "../types/theme"
import { themes } from "../constants/theme"
import { ThemeContext } from "./useCustomTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(themes[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      if (isDarkMode) {
        const darkTheme = themes.find((t) => t.id === `${themeId}-dark`);
        if (darkTheme) {
          setCurrentTheme(darkTheme);
        } else {
          setCurrentTheme(theme);
          setIsDarkMode(false);
        }
      } else {
        setCurrentTheme(theme);
      }
    }
  };

  const toggleDarkMode = () => {
    const baseThemeId = currentTheme.id.replace("-dark", "")
    const targetThemeId = isDarkMode ? baseThemeId : `${baseThemeId}-dark`
    const targetTheme = themes.find((t) => t.id === targetThemeId)

    if (targetTheme) {
      setCurrentTheme(targetTheme)
      setIsDarkMode(!isDarkMode)
    }
  }

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      toggleDarkMode, 
      isDarkMode,
      themes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
