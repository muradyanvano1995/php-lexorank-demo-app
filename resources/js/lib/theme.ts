const STORAGE_KEY = 'lexorank-theme';

export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    return null;
}

export function getSystemTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme: Theme): void {
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
}

export function toggleTheme(): Theme {
    const next: Theme = resolveTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);

    return next;
}

export function initTheme(): Theme {
    const theme = resolveTheme();
    applyTheme(theme);

    return theme;
}
