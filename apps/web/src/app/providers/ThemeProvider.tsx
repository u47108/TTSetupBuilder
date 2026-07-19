import { useEffect, useMemo, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from '@/app/providers/ThemeContext';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => ({ theme: 'dark' }), []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
