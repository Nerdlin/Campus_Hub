'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const THEME_KEY = 'theme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY) as Theme;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const initialTheme = saved || (systemPrefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 