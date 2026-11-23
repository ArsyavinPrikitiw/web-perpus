<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="{{ request()->cookie('theme') === 'dark' ? 'dark' : '' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Deteksi Tema dari LocalStorage & Cookie Sebelum Render (Mencegah Layar Berkedip / FOUC) -->
        <script>
            (function() {
                try {
                    const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
                    const cookieTheme = match ? decodeURIComponent(match[1]) : null;
                    const localTheme = localStorage.getItem('theme');
                    const theme = localTheme || cookieTheme;
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else if (theme === 'light') {
                        document.documentElement.classList.remove('dark');
                    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                    }
                } catch (e) {}
            })();
        </script>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', 'resources/css/app.css'])
        @inertiaHead

        <style>
            /* Tombol Melayang Toggle Dark Mode Global */
            #theme-toggle-floating-btn {
                position: fixed !important;
                bottom: 24px !important;
                right: 24px !important;
                z-index: 2147483647 !important;
                width: 48px !important;
                height: 48px !important;
                border-radius: 9999px !important;
                background-color: #164e3b !important;
                border: 2px solid #ffffff !important;
                color: #ffffff !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
            }

            html.dark #theme-toggle-floating-btn {
                background-color: #1e293b !important;
                border: 2px solid #334155 !important;
                color: #facc15 !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
            }

            #theme-toggle-floating-btn:hover {
                transform: scale(1.08) !important;
            }

            #theme-toggle-floating-btn:active {
                transform: scale(0.95) !important;
            }

            .theme-icon-sun { display: none !important; }
            .theme-icon-moon { display: block !important; }
            html.dark .theme-icon-sun { display: block !important; }
            html.dark .theme-icon-moon { display: none !important; }

            @media print {
                #theme-toggle-floating-btn {
                    display: none !important;
                }
            }
        </style>
    </head>
    <body class="font-sans antialiased bg-[#f7f5f0] text-[#191816] transition-colors duration-200">
        @inertia

        <!-- Tombol Toggle Mode Gelap Global -->
        <button id="theme-toggle-floating-btn" type="button" title="Ganti Mode Gelap / Terang" aria-label="Toggle Theme">
            <!-- Ikon Matahari (Aktif saat Dark Mode) -->
            <svg class="theme-icon-sun" width="24" height="24" fill="none" stroke="#facc15" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Ikon Bulan (Aktif saat Light Mode) -->
            <svg class="theme-icon-moon" width="24" height="24" fill="none" stroke="#ffffff" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </button>

        <script>
            (function() {
                function applyTheme(theme) {
                    const html = document.documentElement;
                    if (theme === 'dark') {
                        html.classList.add('dark');
                    } else {
                        html.classList.remove('dark');
                    }
                    localStorage.setItem('theme', theme);
                    document.cookie = 'theme=' + theme + ';path=/;max-age=31536000;SameSite=Lax';
                }

                const btn = document.getElementById('theme-toggle-floating-btn');
                if (btn) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        const isDark = document.documentElement.classList.contains('dark');
                        const newTheme = isDark ? 'light' : 'dark';
                        applyTheme(newTheme);
                        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: newTheme } }));
                    });
                }

                window.addEventListener('storage', function(e) {
                    if (e.key === 'theme') {
                        applyTheme(e.newValue === 'dark' ? 'dark' : 'light');
                    }
                });
            })();
        </script>
    </body>
</html>