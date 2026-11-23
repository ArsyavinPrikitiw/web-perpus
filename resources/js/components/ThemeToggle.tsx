import React, { useEffect, useState } from 'react';

export function getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;
    const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
    const cookieTheme = match ? decodeURIComponent(match[1]) : null;
    const localTheme = localStorage.getItem('theme');
    const theme = localTheme || cookieTheme;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function setTheme(dark: boolean) {
    if (typeof window === 'undefined') return;
    const theme = dark ? 'dark' : 'light';
    if (dark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    document.cookie = `theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}

interface ThemeToggleProps {
    className?: string;
    variant?: 'button' | 'icon' | 'badge';
}

export default function ThemeToggle({ className = '', variant = 'button' }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const syncTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        syncTheme();

        const handleCustomThemeChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ theme: string }>;
            if (customEvent.detail?.theme) {
                setIsDark(customEvent.detail.theme === 'dark');
            } else {
                syncTheme();
            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme') {
                syncTheme();
            }
        };

        window.addEventListener('theme-changed', handleCustomThemeChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('theme-changed', handleCustomThemeChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const toggle = () => {
        setTheme(!isDark);
    };

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={toggle}
                className={`p-2 rounded-xs border border-[#ded7c4] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#454137] dark:text-amber-300 hover:bg-[#ede7d8] dark:hover:bg-slate-700 transition-colors cursor-pointer ${className}`}
                title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                aria-label="Toggle Theme"
            >
                {isDark ? (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-[#454137]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs border border-[#ded7c4] dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-medium text-[#454137] dark:text-slate-200 hover:bg-[#ede7d8] dark:hover:bg-slate-700 transition-colors cursor-pointer ${className}`}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <>
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Mode Terang</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Mode Gelap</span>
                </>
            )}
        </button>
    );
}
