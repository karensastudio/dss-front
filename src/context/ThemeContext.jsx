import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      setIsLightMode(savedMode === 'light');
    } else {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsLightMode(!prefersDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);

    localStorage.setItem('theme-mode', newMode ? 'light' : 'dark');
    const body = document.body;
    if (newMode) {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } else {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    }
  };

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
