import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ThemeToggle from '@/components/ThemeToggle';
import {
    IconBook,
    IconBookOpen,
    IconShield,
    IconUsers,
    IconAlertCircle,
    IconCheck,
    IconArrowRight,
    IconSparkles,
    IconCreditCard,
} from '@/components/icons';

interface RegisterProps {
    setting: {
        library_name: string;
        institution_name: string;
        opening_hours: string;
        daily_fine_rate: number;
        loan_duration_days: number;
        max_loan_siswa: number;
        max_loan_guru: number;
        logo_url?: string | null;
    };
}

export default function Register({ setting }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        member_type: 'siswa', // 'siswa' | 'guru' | 'petugas'
        identity_number: '',
        class_name: 'PPLG 1',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        agree: true,
    });

    const classOptions = [
        'PPLG 1',
        'PPLG 2',
        'PPLG 3',
        'Animasi 1',
        'Animasi 2',
        'TPFL 1',
        'BCF 1',
        'BCF 2',
        'Teknik Otomotif 1',
        'Teknik Otomotif 2',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/daftar', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const getRoleBadge = () => {
        switch (data.member_type) {
            case 'petugas':
                return 'PETUGAS PERPUSTAKAAN';
            case 'guru':
                return 'DEWAN GURU';
            default:
                return 'SISWA / PELAJAR';
        }
    };

    const getIdentityPlaceholder = () => {
        switch (data.member_type) {
            case 'petugas':
                return 'contoh: PET-2026-001 (opsional, auto-generate)';
            case 'guru':
                return 'contoh: NIP-19850101... (opsional, auto-generate)';
            default:
                return 'contoh: NIS-2024-001 (opsional, auto-generate)';
        }
    };

    const getIdentityLabel = () => {
        switch (data.member_type) {
            case 'petugas':
                return 'Nomor Induk Pegawai / ID Petugas';
            case 'guru':
                return 'Nomor Induk Pegawai (NIP)';
            default:
                return 'Nomor Induk Siswa (NIS)';
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#191816] dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-[#164e3b] selection:text-white transition-colors duration-200">
            <Head title="Pendaftaran Akun Baru Perpustakaan" />

            {/* Top Minimal Header */}
            <header className="border-b border-[#ded7c4] dark:border-slate-800 bg-[#fdfbf7] dark:bg-slate-900 px-6 py-3.5 transition-colors">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xs bg-[#164e3b] text-white flex items-center justify-center shadow-2xs group-hover:bg-[#0f392b] transition-colors overflow-hidden shrink-0">
                            {setting?.logo_url ? (
                                <img src={setting.logo_url} alt="Logo" className="w-full h-full object-contain p-0.5" />
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

                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="icon" />
                        <span className="hidden sm:inline text-[13px] text-[#787161] dark:text-slate-400">Sudah punya akun?</span>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#164e3b] dark:text-emerald-400 hover:text-[#0f392b] px-3 py-1.5 rounded-xs border border-[#164e3b]/30 bg-white dark:bg-slate-800 hover:bg-[#e8f5ed] dark:hover:bg-slate-700 transition-colors"
                        >
                            <span>Masuk / Login →</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-[#d6cebc] dark:border-slate-800 rounded-xs shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
                    
                    {/* Left Panel: Membership Benefits & Live Digital Card Preview */}
                    <div className="lg:col-span-5 bg-[#faf8f3] dark:bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-[#d6cebc] dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between transition-colors">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-2xs bg-[#e8f5ed] dark:bg-emerald-950/60 border border-[#a3d9b8] dark:border-emerald-800/60 text-[#164e3b] dark:text-emerald-300 text-[11px] font-mono font-medium mb-5">
                                <IconSparkles size={13} />
                                <span>Pendaftaran Akun Baru Perpustakaan</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#191816] dark:text-slate-100 tracking-tight leading-snug">
                                Registrasi Mandiri Siswa, Guru & Petugas
                            </h2>
                            <p className="text-[13px] text-[#5c574c] dark:text-slate-400 mt-2.5 leading-relaxed">
                                Daftarkan akun Anda menggunakan email aktif. Dapatkan akses katalog, peminjaman digital, sirkulasi buku, dan kartu anggota perpustakaan resmi.
                            </p>

                            {/* Live Digital Card Preview */}
                            <div className="mt-6 p-4 rounded-xs bg-[#f4eee1] dark:bg-slate-800 border border-[#d8cfbe] dark:border-slate-700 shadow-2xs relative overflow-hidden transition-colors">
                                <div className="flex items-center justify-between border-b border-[#e2dacb] dark:border-slate-700 pb-2.5 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-2xs bg-[#164e3b] text-white flex items-center justify-center">
                                            <IconCreditCard size={13} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#191816] dark:text-slate-100">KARTU ANGGOTA DIGITAL</div>
                                            <div className="text-[9px] font-mono text-[#787161] dark:text-slate-400">PRATINJAU REAL-TIME</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-2xs bg-[#164e3b] text-white">
                                        {getRoleBadge()}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <div>
                                        <div className="text-[10px] font-mono text-[#787161] dark:text-slate-400">NAMA LENGKAP:</div>
                                        <div className="font-serif font-bold text-[14px] text-[#191816] dark:text-slate-100 truncate">
                                            {data.name || 'Nama Lengkap Pengguna'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div>
                                            <div className="text-[10px] font-mono text-[#787161] dark:text-slate-400">EMAIL TERDAFTAR:</div>
                                            <div className="font-mono text-[11px] font-medium text-[#164e3b] dark:text-emerald-400 truncate">
                                                {data.email || 'email@domain.com'}
                                            </div>
                                        </div>
                                        {data.member_type === 'siswa' && (
                                            <div>
                                                <div className="text-[10px] font-mono text-[#787161] dark:text-slate-400">KELAS / ROMBEL:</div>
                                                <div className="font-mono text-[12px] font-medium text-[#3d3930] dark:text-slate-200">
                                                    {data.class_name || 'Pilih Kelas'}
                                                </div>
                                            </div>
                                        )}
                                        {data.member_type === 'petugas' && (
                                            <div>
                                                <div className="text-[10px] font-mono text-[#787161] dark:text-slate-400">HAK AKSES:</div>
                                                <div className="font-mono text-[12px] font-medium text-[#164e3b] dark:text-emerald-400">
                                                    Meja Sirkulasi & Buku
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Simulated Barcode Strip */}
                                <div className="mt-3 pt-2 border-t border-[#e2dacb] dark:border-slate-700 flex items-center justify-between">
                                    <div className="font-mono text-[9px] text-[#787161] dark:text-slate-400">
                                        {data.identity_number ? `ID: ${data.identity_number}` : 'KODE BARCODE OTOMATIS'}
                                    </div>
                                    <div className="flex gap-0.5 h-4 items-end">
                                        {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2].map((h, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-[#191816] dark:bg-slate-300 inline-block"
                                                style={{ width: `${(idx % 3) + 1}px`, height: `${h * 4}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Benefits checklist */}
                            <div className="mt-6 space-y-2 text-[12px] text-[#4a463d] dark:text-slate-300">
                                {data.member_type === 'petugas' ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <span className="w-4 h-4 rounded-full bg-[#e8f5ed] dark:bg-emerald-950 text-[#164e3b] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <IconCheck size={11} />
                                            </span>
                                            <span>Akses penuh ke <strong>Meja Sirkulasi</strong>: peminjaman, pengembalian, perpanjangan, dan denda.</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-4 h-4 rounded-full bg-[#e8f5ed] dark:bg-emerald-950 text-[#164e3b] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <IconCheck size={11} />
                                            </span>
                                            <span>Kelola katalog buku fisik, cetak label barcode, dan manajemen data keanggotaan.</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <span className="w-4 h-4 rounded-full bg-[#e8f5ed] dark:bg-emerald-950 text-[#164e3b] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <IconCheck size={11} />
                                            </span>
                                            <span>Kuota pinjam hingga <strong>{data.member_type === 'guru' ? (setting?.max_loan_guru || 5) : (setting?.max_loan_siswa || 3)} buku</strong> sekaligus.</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-4 h-4 rounded-full bg-[#e8f5ed] dark:bg-emerald-950 text-[#164e3b] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <IconCheck size={11} />
                                            </span>
                                            <span>Perpanjangan mandiri secara online sebelum jatuh tempo pinjaman.</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-4 h-4 rounded-full bg-[#e8f5ed] dark:bg-emerald-950 text-[#164e3b] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <IconCheck size={11} />
                                            </span>
                                            <span>Penerbitan <strong>Surat Bebas Pustaka Digital</strong> ber-QR code resmi.</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bottom link to login */}
                        <div className="mt-8 pt-6 border-t border-[#e2dbca] dark:border-slate-800">
                            <div className="text-[12px] text-[#787161] dark:text-slate-400">
                                Sudah memiliki akun terdaftar?
                            </div>
                            <Link
                                href="/login"
                                className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-[#164e3b] dark:text-emerald-400 hover:underline"
                            >
                                <span>Masuk ke Akun Perpustakaan Anda</span>
                                <IconArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Right Panel: Registration Form */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="text-xl font-serif font-bold text-[#191816] dark:text-slate-100">
                                    Formulir Pendaftaran Akun
                                </h3>
                                <p className="text-[13px] text-[#6d6657] dark:text-slate-400 mt-1">
                                    Lengkapi data diri Anda menggunakan email aktif untuk membuat akun siswa, guru, atau petugas perpustakaan.
                                </p>
                            </div>

                            {/* Any Global Error Alert */}
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-5 p-3.5 rounded-xs bg-[#fef2f2] dark:bg-red-950/40 border border-[#fecaca] dark:border-red-900/60 text-[#991b1b] dark:text-red-300 text-[13px] space-y-1">
                                    <div className="flex items-center gap-2 font-bold">
                                        <IconAlertCircle size={16} />
                                        <span>Periksa kembali isian formulir:</span>
                                    </div>
                                    <ul className="list-disc list-inside text-xs pl-1">
                                        {Object.values(errors).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Role Selection Tabs (Siswa, Guru, Petugas) */}
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Pilih Peran / Jenis Akun <span className="text-[#b91c1c]">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#ede8dc] dark:bg-slate-800 rounded-xs border border-[#ded7c4] dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setData('member_type', 'siswa')}
                                            className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                                data.member_type === 'siswa'
                                                    ? 'bg-white dark:bg-slate-700 text-[#164e3b] dark:text-emerald-400 shadow-2xs font-bold'
                                                    : 'text-[#666052] dark:text-slate-400 hover:text-[#191816]'
                                            }`}
                                        >
                                            <IconUsers size={14} />
                                            <span>Siswa</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('member_type', 'guru')}
                                            className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                                data.member_type === 'guru'
                                                    ? 'bg-white dark:bg-slate-700 text-[#164e3b] dark:text-emerald-400 shadow-2xs font-bold'
                                                    : 'text-[#666052] dark:text-slate-400 hover:text-[#191816]'
                                            }`}
                                        >
                                            <IconBookOpen size={14} />
                                            <span>Guru</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('member_type', 'petugas')}
                                            className={`py-2 px-2 text-xs font-semibold rounded-2xs transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                                data.member_type === 'petugas'
                                                    ? 'bg-white dark:bg-slate-700 text-[#164e3b] dark:text-emerald-400 shadow-2xs font-bold'
                                                    : 'text-[#666052] dark:text-slate-400 hover:text-[#191816]'
                                            }`}
                                        >
                                            <IconShield size={14} />
                                            <span>Petugas</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Nama Lengkap <span className="text-[#b91c1c]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={
                                            data.member_type === 'siswa'
                                                ? 'contoh: Muhammad Rizky Pratama'
                                                : data.member_type === 'guru'
                                                ? 'contoh: Bambang Hariyanto, S.Pd'
                                                : 'contoh: Ahmad Fadillah, S.Hum'
                                        }
                                        required
                                        className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                    />
                                    {errors.name && <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.name}</p>}
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Alamat Email <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@email.com"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                        />
                                        {errors.email && <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            No. WhatsApp / HP <span className="text-[11px] text-[#787161] font-normal">(opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                        />
                                        {errors.phone && <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Identity Number & Class Name (if Siswa) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            {getIdentityLabel()} <span className="text-[11px] text-[#787161] font-normal">(opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.identity_number}
                                            onChange={(e) => setData('identity_number', e.target.value)}
                                            placeholder={getIdentityPlaceholder()}
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                        />
                                        {errors.identity_number && (
                                            <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.identity_number}</p>
                                        )}
                                    </div>

                                    {data.member_type === 'siswa' ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider">
                                                    Kelas / Rombel <span className="text-[#b91c1c]">*</span>
                                                </label>
                                            </div>

                                            <select
                                                value={data.class_name}
                                                onChange={(e) => setData('class_name', e.target.value)}
                                                className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 rounded-xs font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                            >
                                                {classOptions.map((cls) => (
                                                    <option key={cls} value={cls}>
                                                        {cls}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.class_name && (
                                                <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.class_name}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col justify-end">
                                            <div className="p-2.5 rounded-xs bg-[#f4eee1] dark:bg-slate-800 border border-[#ded7c4] dark:border-slate-700 text-[11px] text-[#5c574c] dark:text-slate-300">
                                                {data.member_type === 'petugas'
                                                    ? 'Akun Petugas akan memiliki wewenang mengelola meja sirkulasi & inventaris buku.'
                                                    : 'Akun Guru memiliki batas pinjam maksimal 5 buku secara serentak.'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Password & Confirmation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Kata Sandi <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                        />
                                        {errors.password && (
                                            <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-mono font-medium text-[#454137] dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Ulangi Kata Sandi <span className="text-[#b91c1c]">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ketik ulang kata sandi"
                                            required
                                            className="w-full px-3.5 py-2.5 text-[14px] bg-[#faf8f5] dark:bg-slate-800 border border-[#d6cebc] dark:border-slate-700 text-[#191816] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#164e3b] dark:focus:ring-emerald-500 focus:border-[#164e3b] dark:focus:border-emerald-500 transition-colors"
                                        />
                                        {errors.password_confirmation && (
                                            <p className="text-[12px] text-[#991b1b] dark:text-red-400 mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Agreement Checkbox */}
                                <div className="pt-1">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.agree}
                                            onChange={(e) => setData('agree', e.target.checked)}
                                            required
                                            className="mt-0.5 w-4 h-4 rounded-2xs border-[#d6cebc] dark:border-slate-700 text-[#164e3b] dark:text-emerald-600 focus:ring-[#164e3b] dark:focus:ring-emerald-500 bg-white dark:bg-slate-800"
                                        />
                                        <span className="text-[12px] text-[#5c574c] dark:text-slate-300 leading-snug">
                                            Saya menyatakan data di atas benar dan bersedia mematuhi tata tertib layanan perpustakaan sekolah.
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing || !data.agree}
                                    className="w-full mt-2 py-3 px-4 bg-[#164e3b] hover:bg-[#0f392b] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium text-[14px] rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span>Mendaftarkan Akun...</span>
                                    ) : (
                                        <>
                                            <span>
                                                {data.member_type === 'petugas'
                                                    ? 'Daftar Akun Petugas Perpustakaan'
                                                    : data.member_type === 'guru'
                                                    ? 'Daftar Akun Dewan Guru'
                                                    : 'Daftar Akun Siswa & Terbitkan Kartu'}
                                            </span>
                                            <IconArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Link to Login */}
                            <div className="mt-6 pt-5 border-t border-[#ede7d8] dark:border-slate-800 text-center transition-colors">
                                <p className="text-[13px] text-[#736c5e] dark:text-slate-400">
                                    Sudah memiliki akun?{' '}
                                    <Link href="/login" className="font-semibold text-[#164e3b] dark:text-emerald-400 hover:underline">
                                        Masuk ke akun Anda di sini →
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
