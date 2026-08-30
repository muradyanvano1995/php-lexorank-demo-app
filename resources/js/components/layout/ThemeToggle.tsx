import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { resolveTheme, setTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
    const [theme, setThemeState] = useState<Theme>(() => resolveTheme());

    const toggle = (): void => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        setThemeState(next);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
