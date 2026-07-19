import { createContext, useContext } from 'react';

/** Dark-only theme surface (ADR-007). Context is reserved for theme (ADR-005). */
export type ThemeMode = 'dark';

export type ThemeContextValue = {
  theme: ThemeMode;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
