import type { ReactNode } from "react"

export interface ThemeProviderProps {
  children: ReactNode
}

export interface ThemeContextType {
  currentTheme: ColorTheme,
  setTheme: (themeId: string) => void,
  toggleDarkMode: () => void,
  isDarkMode: boolean,
  themes: ColorTheme[]
}

export interface ColorTheme {
  id: string,
  name: string,
  isDark?: boolean,
  colors: {
    // General colors
    primary: string,
    secondary: string,
    tertiary?: string,

    // Card colors
    cardBackground: string,
    cardBorder: string,

    // Schedule text colors
    textPrimary: string,
    textSecondary: string,

    // Button colors
    buttonColor: string,
    buttonColorHover: string,

    // Border colors
    borderLight: string,

    // Schedule stripe background colors
    bgColor1: string,
    bgColor2: string,

    // App-level colors
    footerBackground: string;
    surfaceBackground: string;
    surfaceText: string;

    // Custom colors
    primarySet?: string[];
    textSet?: string[];
    timeBadgeSet?: string[];
  }
}