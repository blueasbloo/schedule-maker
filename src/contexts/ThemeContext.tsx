import { useState, useEffect, type ReactNode } from "react"
import type { ColorTheme } from "../types/theme"
import { themes } from "../constants/theme"
import { ThemeContext } from "./useCustomTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

const loadThemeFromStorage = () => {
  try {
    const savedTheme = localStorage.getItem('schedule-maker-theme');
    if (savedTheme) {
      const { themeId, isDarkMode } = JSON.parse(savedTheme);
      const theme = themes.find((t) => t.id === themeId);
      return { theme: theme || themes[0], isDarkMode: isDarkMode || false };
    }
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
  }
  return { theme: themes[0], isDarkMode: false };
};

const saveThemeToStorage = (themeId: string, isDarkMode: boolean) => {
  try {
    const themeData = { themeId, isDarkMode };
    localStorage.setItem('schedule-maker-theme', JSON.stringify(themeData));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(themes[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const savedSettings = loadThemeFromStorage();
    
    let themeToSet = savedSettings.theme;
    let darkModeToSet = savedSettings.isDarkMode;
    
    if (savedSettings.isDarkMode) {
      const baseThemeId = savedSettings.theme.id.replace("-dark", "");
      const darkTheme = themes.find((t) => t.id === `${baseThemeId}-dark`);
      if (darkTheme) {
        themeToSet = darkTheme;
      } else {
        darkModeToSet = false;
      }
    }
    
    setCurrentTheme(themeToSet);
    setIsDarkMode(darkModeToSet);
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (hasInitialized) {
      const baseThemeId = currentTheme.id.replace("-dark", "");
      saveThemeToStorage(baseThemeId, isDarkMode);
    }
  }, [currentTheme, isDarkMode, hasInitialized]);

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
    } else {
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
