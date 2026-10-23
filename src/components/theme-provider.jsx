'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or system preference (light default)
    try {
      const stored = localStorage.getItem('alliance_theme');
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
        document.documentElement.classList.toggle('dark', stored === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Option to respect system preference if set, but light remains default
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      } else {
        setThemeState('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('alliance_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (e) {}
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
