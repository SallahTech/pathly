import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';

interface ThemeContextType {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    shadow: string;
  };
}

const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#F1F5F9',
  text: '#1E293B',
  textSecondary: '#64748B',
  primary: '#2563EB',
  secondary: '#64748B',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E2E8F0',
  shadow: '#000000',
};

const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  primary: '#3B82F6',
  secondary: '#94A3B8',
  accent: '#60A5FA',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  border: '#475569',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Use manual theme if set, otherwise follow system
  const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
