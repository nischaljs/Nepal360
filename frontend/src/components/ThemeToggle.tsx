import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/theme.store';
import { Button } from './ui/button';

const ThemeToggle = () => {
  const { isDark, toggle } = useThemeStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
