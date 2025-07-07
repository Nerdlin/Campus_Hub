import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
        ${theme === 'dark' ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      aria-label="Переключить тему"
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Светлая' : 'Тёмная'}</span>
    </button>
  );
};

export default ThemeToggle; 