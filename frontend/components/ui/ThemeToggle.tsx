'use client';

import { useLayoutEffect } from 'react';
import { SunMoon } from 'lucide-react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'kassa-theme';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function ThemeToggle() {
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function syncTheme() {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const nextTheme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : mediaQuery.matches ? 'dark' : 'light';

      applyTheme(nextTheme);
    }

    try {
      syncTheme();
    } catch (error) {
      console.error('Unable to load the saved color theme:', error);
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    }

    function handleSystemThemeChange() {
      try {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          syncTheme();
        }
      } catch (error) {
        console.error('Unable to read the saved color theme:', error);
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error('Unable to save the selected color theme:', error);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Wissel tussen lichte en donkere modus"
      title="Wissel thema"
      className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950"
    >
      <SunMoon aria-hidden="true" className="h-4 w-4" />
      <span>Thema</span>
    </button>
  );
}
