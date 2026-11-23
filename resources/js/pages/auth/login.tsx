import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    IconBook,
    IconAlertCircle,
    IconArrowRight,
} from '@/components/icons';

interface LoginProps {
    setting: {
        library_name: string;
        institution_name: string;
        opening_hours: string;
        logo_url?: string | null;
    };
}

export default function Login({ setting }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        identity: '',
        password: '',
        remember: false,
    });

    const handleEmailChange = (val: string) => {
        setData((prev) => ({
            ...prev,
            email: val,
            identity: val,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const emailError = errors.email || errors.identity;

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#191816] dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-[#164e3b] selection:text-white transition-colors duration-200">
            <Head title="Masuk Sistem Perpustakaan" />

            {/* Top Minimal Header */}
            <header className="border-b border-[#ded7c4] dark:border-slate-800 bg-[#fdfbf7] dark:bg-slate-900 px-6 py-3.5 transition-colors">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xs bg-[#164e3b] text-white flex items-center justify-center shadow-2xs group-hover:bg-[#0f392b] transition-colors overflow-hidden shrink-0">
                            {setting?.logo_url ? (
                                <img src={setting.logo_url} alt="Logo Perpustakaan" className="w-full h-full object-contain p-0.5" />
                            ) : (
                                <IconBook size={20} />
                            )}
                        </div>
                        <div>
                            <div className="font-serif font-bold text-base tracking-tight text-[#191816] dark:text-slate-100 group-hover:text-[#164e3b] dark:group-hover:text-emerald-400 transition-colors">
                                {setting?.library_name || 'Perpustakaan Cendekia Nusantara'}
                            </div>
                            <div className="text-[11px] font-mono text-[#787161] dark:text-slate-400">
                                {setting?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5c574c] dark:text-slate-300 hover:text-[#164e3b] dark:hover:text-emerald-400 px-3 py-1.5 rounded-xs hover:bg-[#ede7d8] dark:hover:bg-slate-800 transition-colors"
                        >
                            <span>← Kembali ke Katalog Publik (OPAC)</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Center Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-[#d6cebc] dark:border-slate-800 rounded-xs shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
                    
                    {/* Left Panel: Archival Identity & Quick Info */}
                    <div className="lg:col-span-5 bg-[#faf8f3] dark:bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-[#d6cebc] dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between transition-colors">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] dark:bg-emerald-950/60 border border-[#a3d9b8] dark:border-emerald-800/60 text-[#164e3b] dark:text-emerald-300 text-[11px] font-mono font-medium mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#164e3b] dark:bg-emerald-400 animate-pulse"></span>
                                Autentikasi Pengguna Perpustakaan
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#191816] dark:text-slate-100 tracking-tight leading-snug">
                                Gerbang Masuk Layanan Literasi Digital
                            </h2>
                            <p className="text-[13px] text-[#5c574c] dark:text-slate-400 mt-2.5 leading-relaxed">
                                Masuk menggunakan alamat email untuk siswa, guru, petugas, dan kepala perpustakaan.
                            </p>

                            {/* Institutional Info Card */}
                            <div className="mt-6 p-4 rounded-xs bg-white dark:bg-slate-800 border border-[#ded7c4] dark:border-slate-700 space-y-2 text-[12px] transition-colors">
                                <div className="flex items-center justify-between text-[#666052] dark:text-slate-300">
                                    <span>Jam Pelayanan:</span>
                                    <span className="font-medium text-[#191816] dark:text-slate-100">{setting?.opening_hours || '07.30 - 16.00 WIB'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#666052] dark:text-slate-300">
                                    <span>Presensi Mandiri:</span>
                                    <Link href="/presensi/kiosk" className="text-[#164e3b] dark:text-emerald-400 underline hover:text-[#0f392b] dark:hover:text-emerald-300">
                                        Buka Kiosk Pintu Masuk
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Login Form */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="text-xl font-serif font-bold text-[#191816] dark:text-slate-100">
                                    Masuk ke Akun Anda
                                </h3>
                                <p className="text-[13px] text-[#6d6657] dark:text-slate-400 mt-1">
                                    Siswa, guru, petugas, dan kepala perpustakaan masuk menggunakan alamat email terdaftar.
                                </p>
                            </div>

                            {emailError && (
                                <div className="mb-5 p-3.5 rounded-xs bg-[#fef2f2] dark:bg-red-950/40 border border-[#fecaca] dark:border-red-900/60 text-[#991b1b] dark:text-red-300 text-[13px] flex items-start gap-2.5">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{emailError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Alamat Email <span className="text-[#b91c1c]">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        placeholder="nama@email.com"
                                        required
                                        autoFocus
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 font-mono transition-colors"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider">
                                            Kata Sandi (Password) <span className="text-[#b91c1c]">*</span>
                                        </label>
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                    />
                                    {errors.password && (
                                        <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 rounded-2xs border-[#d6cebc] dark:border-slate-700 text-[#164e3b] dark:text-emerald-600 focus:ring-[#164e3b] dark:focus:ring-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                        <span className="text-[13px] text-[#5c574c] dark:text-slate-300">Ingat sesi masuk</span>
                                    </label>
                                    <Link
                                        href="/katalog/informasi-dan-tata-tertib"
                                        className="text-[12px] text-[#164e3b] dark:text-emerald-400 hover:underline"
                                    >
                                        Bantuan & Tata Tertib
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-2 py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium text-[14px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span>Memverifikasi Akun...</span>
                                    ) : (
                                        <>
                                            <span>Masuk ke Sistem Perpustakaan</span>
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Register Prompt */}
                            <div className="mt-6 pt-5 border-t border-[#ede7d8] dark:border-slate-800 text-center transition-colors">
                                <p className="text-[13px] text-[#736c5e] dark:text-slate-400">
                                    Belum memiliki akun siswa, guru, atau petugas?
                                </p>
                                <Link
                                    href="/daftar"
                                    className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#164e3b] dark:text-emerald-400 hover:underline"
                                >
                                    <span>Daftar Akun Baru (Siswa, Guru, atau Petugas)</span>
                                    <IconArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Guest Info */}
                            <div className="mt-4 pt-4 border-t border-[#ede7d8]/60 dark:border-slate-800/60 text-center transition-colors">
                                <p className="text-[12px] text-[#787161] dark:text-slate-400">
                                    Hanya ingin melihat ketersediaan buku di rak fisik?{' '}
                                    <Link
                                        href="/katalog"
                                        className="font-medium text-[#164e3b] dark:text-emerald-400 hover:underline"
                                    >
                                        Telusuri OPAC Tamu →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="border-t border-[#ded7c4] dark:border-slate-800 bg-[#fbf9f5] dark:bg-slate-900 px-6 py-4 text-center text-[12px] text-[#787161] dark:text-slate-400 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        © {new Date().getFullYear()} {setting?.institution_name || 'SMA Negeri 1 Prestasi Bangsa'}. Seluruh Hak Cipta Dilindungi.
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/presensi/kiosk" className="hover:underline">Presensi Pintu Masuk</Link>
                        <span>•</span>
                        <Link href="/katalog/informasi-dan-tata-tertib" className="hover:underline">Tata Tertib</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}