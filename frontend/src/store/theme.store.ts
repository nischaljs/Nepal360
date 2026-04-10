import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const saved = localStorage.getItem('theme');
  const isDark = saved === 'dark'; // default to light if no saved preference

  // Apply immediately
  if (isDark) {
    document.documentElement.classList.add('dark');
  }

  return {
    isDark,
    toggle: () =>
      set((state) => {
        const next = !state.isDark;
        localStorage.setItem('theme', next ? 'dark' : 'light');
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: next };
      }),
    setDark: (dark: boolean) =>
      set(() => {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: dark };
      }),
  };
});
