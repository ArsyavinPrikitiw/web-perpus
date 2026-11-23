import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import {
    IconBarChart,
    IconUsers,
    IconBook,
    IconCreditCard,
    IconPrinter,
    IconClock,
    IconCheckCircle,
    IconAlertCircle,
    IconArrowRight,
    IconCalendar,
    IconFilter,
    IconX,
} from '@/components/icons';

interface VisitByClass {
    class_name: string;
    total: number;
}

interface HourlyData {
    hour: string;
    count: number;
}

interface PopularBook {
    id: number;
    title: string;
    author: string;
    publisher: string;
    publication_year?: number;
    ddc_code: string;
    total_copies: number;
    available_copies: number;
    total_borrowed: number;
    category?: {
        name: string;
    };
}

interface BookByYear {
    year: number;
    titles_count: number;
    copies_count: number;
    available_copies: number;
    borrowed_count: number;
    is_recent: boolean;
    in_range?: boolean;
    titles_percentage: number;
    copies_percentage: number;
}

interface RecencyMetrics {
    threshold_year: number;
    recent_titles_count: number;
    recent_copies_count: number;
    recent_percentage: number;
    older_titles_count: number;
    older_copies_count: number;
    older_percentage: number;
}

interface YearSpecificStats {
    start_year?: number | null;
    end_year?: number | null;
    year: number;
    label?: string;
    titles_count: number;
    copies_count: number;
    available_copies: number;
    borrowed_count: number;
    is_recent: boolean;
    titles_percentage: number;
}

interface MonthlyCirculation {
    month: string;
    borrowed: number;
    returned: number;
}

interface FineSummary {
    fine_reason: string;
    total_amount: number;
    total_paid: number;
    count: number;
}

interface ReportsProps {
    visitsByClass: VisitByClass[];
    hourlyChartData: HourlyData[];
    popularBooks: PopularBook[];
    booksByYear?: BookByYear[];
    availablePublicationYears?: number[];
    startYear?: number | null;
    endYear?: number | null;
    selectedYear?: number | null;
    recencyMetrics?: RecencyMetrics;
    yearSpecificStats?: YearSpecificStats | null;
    monthlyCirculation: MonthlyCirculation[];
    finePaidSum: number;
    fineUnpaidSum: number;
    fineByReason: FineSummary[];
    fineRecentTransactions: any[];
    accreditationMetrics: {
        total_titles: number;
        total_volumes: number;
        total_categories: number;
        total_members: number;
        total_teachers: number;
        total_students: number;
        total_visits_all_time: number;
        total_circulation_all_time: number;
        punctuality_rate: number;
    };
    setting: {
        library_name: string;
        daily_fine_rate: number;
    };
}

export default function ReportsIndex({
    visitsByClass,
    hourlyChartData,
    popularBooks,
    booksByYear = [],
    availablePublicationYears = [],
    startYear = null,
    endYear = null,
    selectedYear = null,
    recencyMetrics,
    yearSpecificStats = null,
    monthlyCirculation,
    finePaidSum,
    fineUnpaidSum,
    fineByReason,
    fineRecentTransactions,
    accreditationMetrics,
    setting,
}: ReportsProps) {
    const maxVisitsClass = Math.max(...visitsByClass.map((v) => v.total), 1);
    const maxHourly = Math.max(...hourlyChartData.map((h) => h.count), 1);
    const maxMonthly = Math.max(...monthlyCirculation.map((m) => Math.max(m.borrowed, m.returned)), 1);

    const [startYearInput, setStartYearInput] = useState<string>(
        startYear ? String(startYear) : (selectedYear ? String(selectedYear) : '')
    );
    const [endYearInput, setEndYearInput] = useState<string>(
        endYear ? String(endYear) : ''
    );

    const isFilterActive = startYear !== null || endYear !== null || selectedYear !== null;

    const handleApplyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query: Record<string, any> = {};
        if (startYearInput.trim()) query.start_year = startYearInput.trim();
        if (endYearInput.trim()) query.end_year = endYearInput.trim();

        router.get('/laporan', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setStartYearInput('');
        setEndYearInput('');
        router.get('/laporan', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleQuickRange = (from: number, to: number) => {
        setStartYearInput(String(from));
        setEndYearInput(String(to));
        router.get(
            '/laporan',
            { start_year: from, end_year: to },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getAccreditationLink = () => {
        const params = new URLSearchParams();
        if (startYear !== null) params.set('start_year', String(startYear));
        if (endYear !== null) params.set('end_year', String(endYear));
        const qs = params.toString();
        return qs ? `/laporan/akreditasi?${qs}` : '/laporan/akreditasi';
    };

    const activeFilterLabel = yearSpecificStats?.label || (
        startYear && endYear && startYear !== endYear
            ? `${startYear} - ${endYear}`
            : String(startYear || endYear || selectedYear || '')
    );

    return (
        <AppLayout
            title="Laporan & Statistik Perpustakaan"
            subtitle="Analisis tren sirkulasi buku, demografi kunjungan kelas, jam tersibuk, buku paling diminati, dan transparansi kas denda."
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href={getAccreditationLink()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[13px] font-bold rounded-xs shadow-xs transition-colors"
                    >
                        <IconPrinter size={16} />
                        <span>Format Laporan Akreditasi Sekolah</span>
                    </Link>
                </div>
            }
        >
            <Head title="Laporan & Statistik - Perpustakaan Cendekia" />

            {/* Publication Year 2-Column Range Filter Bar */}
            <div className="mb-6 p-5 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#ece6d5]">
                    <div className="w-8 h-8 rounded-2xs bg-[#f4eee1] flex items-center justify-center text-[#164e3b] border border-[#ded7c4]">
                        <IconCalendar size={18} />
                    </div>
                    <div>
                        <div className="text-[14px] font-bold text-[#191816]">
                            Filter Koleksi Berdasarkan Rentang Tahun Terbit Buku
                        </div>
                        <div className="text-[12px] text-[#6d6657]">
                            Pilih batas tahun terbit (misal: dari tahun 1996 ke 2020) untuk menyesuaikan laporan buku dan statistik sirkulasi.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Kolom 1: Dari Tahun */}
                    <div className="sm:col-span-4">
                        <label className="block text-[11px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                            Dari Tahun Terbit
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1900"
                                max="2099"
                                value={startYearInput}
                                onChange={(e) => setStartYearInput(e.target.value)}
                                placeholder="contoh: 1996"
                                className="w-full px-3 py-2 text-[13px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono text-[#191816] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Kolom 2: Sampai Tahun */}
                    <div className="sm:col-span-4">
                        <label className="block text-[11px] font-mono font-medium text-[#454137] uppercase tracking-wider mb-1.5">
                            Sampai Tahun Terbit
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1900"
                                max="2099"
                                value={endYearInput}
                                onChange={(e) => setEndYearInput(e.target.value)}
                                placeholder="contoh: 2020"
                                className="w-full px-3 py-2 text-[13px] bg-[#faf8f5] border border-[#d6cebc] rounded-xs font-mono text-[#191816] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#164e3b] focus:border-[#164e3b] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-3.5 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[12px] font-bold rounded-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                        >
                            <IconFilter size={14} />
                            <span>Terapkan Rentang Tahun</span>
                        </button>
                        {isFilterActive && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="py-2 px-3 bg-[#faf8f5] hover:bg-[#ede7d8] text-[#991b1b] border border-[#d6cebc] text-[12px] font-medium rounded-xs transition-colors flex items-center justify-center gap-1"
                            >
                                <IconX size={14} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </form>

                {/* Quick Presets for Convenient Filtering */}
                <div className="mt-3.5 pt-3 border-t border-[#f0eadc] flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-[#787161] font-mono mr-1">Rekomendasi Periode:</span>
                    <button
                        type="button"
                        onClick={() => handleQuickRange(1996, 2020)}
                        className="px-2 py-0.5 rounded-2xs bg-[#f4eee1] hover:bg-[#e8dec7] text-[#164e3b] border border-[#ded7c4] font-mono transition-colors"
                    >
                        Tahun 1996 - 2020
                    </button>
                    <button
                        type="button"
                        onClick={() => handleQuickRange(2015, 2022)}
                        className="px-2 py-0.5 rounded-2xs bg-[#f4eee1] hover:bg-[#e8dec7] text-[#164e3b] border border-[#ded7c4] font-mono transition-colors"
                    >
                        Tahun 2015 - 2022
                    </button>
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="px-2 py-0.5 rounded-2xs bg-[#f4eee1] hover:bg-[#e8dec7] text-[#5c574c] border border-[#ded7c4] font-mono transition-colors"
                    >
                        Semua Koleksi (Akumulasi)
                    </button>
                </div>

                {/* Filter Active Notification Banner */}
                {isFilterActive && (
                    <div className="mt-4 pt-3 border-t border-[#ece6d5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#f4faf6] p-3 rounded-2xs border border-[#b8e4cd]">
                        <div className="flex items-center gap-2 text-[12px] text-[#134e31]">
                            <span className="w-2 h-2 rounded-full bg-[#164e3b] animate-pulse"></span>
                            <span>
                                Menampilkan data laporan khusus untuk <strong>koleksi buku tahun terbit {activeFilterLabel}</strong>.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#991b1b] hover:text-[#b91c1c] underline underline-offset-2"
                        >
                            <IconX size={12} />
                            <span>Reset Filter & Tampilkan Semua Tahun</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Year-Specific Highlight Strip (Shown when filter is active) */}
            {yearSpecificStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <div className="p-4 bg-[#f8faf8] border-2 border-[#164e3b]/30 rounded-xs shadow-2xs">
                        <div className="text-[11px] font-mono uppercase text-[#164e3b] font-bold">
                            Judul Buku ({activeFilterLabel})
                        </div>
                        <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">
                            {yearSpecificStats.titles_count} Judul
                        </div>
                        <div className="text-[11px] text-[#2e6b4c] mt-0.5">
                            {yearSpecificStats.titles_percentage}% dari total koleksi perpustakaan
                        </div>
                    </div>
                    <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                        <div className="text-[11px] font-mono uppercase text-[#787161]">Total Eksemplar Fisik</div>
                        <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                            {yearSpecificStats.copies_count} Buku
                        </div>
                        <div className="text-[11px] text-[#8a816e] mt-0.5">Volume buku terdaftar</div>
                    </div>
                    <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                        <div className="text-[11px] font-mono uppercase text-[#787161]">Eksemplar Tersedia</div>
                        <div className="text-2xl font-serif font-bold text-[#198754] mt-0.5">
                            {yearSpecificStats.available_copies} Tersedia
                        </div>
                        <div className="text-[11px] text-[#8a816e] mt-0.5">Siap dipinjam di rak</div>
                    </div>
                    <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                        <div className="text-[11px] font-mono uppercase text-[#787161]">Frekuensi Dipinjam</div>
                        <div className="text-2xl font-serif font-bold text-[#b45309] mt-0.5">
                            {yearSpecificStats.borrowed_count} Kali
                        </div>
                        <div className="text-[11px] text-[#8a816e] mt-0.5">Sirkulasi peminjaman</div>
                    </div>
                </div>
            )}

            {/* High-Level Accreditation Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Sirkulasi Pinjaman</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {accreditationMetrics.total_circulation_all_time} Transaksi
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Akumulasi sirkulasi</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Anggota Terdaftar</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {accreditationMetrics.total_members} Orang
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">
                        {accreditationMetrics.total_students} Siswa • {accreditationMetrics.total_teachers} Guru
                    </div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Total Kunjungan Pemustaka</div>
                    <div className="text-2xl font-serif font-bold text-[#191816] mt-0.5">
                        {accreditationMetrics.total_visits_all_time} Kunjungan
                    </div>
                    <div className="text-[11px] text-[#8a816e] mt-0.5">Terekam di buku tamu digital</div>
                </div>
                <div className="p-4 bg-white border border-[#ded7c4] rounded-xs shadow-2xs">
                    <div className="text-[11px] font-mono uppercase text-[#787161]">Ketepatan Pengembalian</div>
                    <div className="text-2xl font-serif font-bold text-[#164e3b] mt-0.5">
                        {accreditationMetrics.punctuality_rate}%
                    </div>
                    <div className="text-[11px] text-[#2e6b4c] mt-0.5">Bebas denda keterlambatan</div>
                </div>
            </div>

            {/* Recency Analysis for SNP Accreditation */}
            {recencyMetrics && (
                <div className="mb-8 p-5 bg-[#faf8f3] border border-[#d8cfbe] rounded-xs shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2d8c5] mb-4 gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-bold bg-[#164e3b] text-white">
                                    Standar SNP 009:2020
                                </span>
                                <h3 className="font-serif font-bold text-base text-[#191816]">
                                    Analisis Kemutakhiran Koleksi (Buku 5 Tahun Terakhir)
                                </h3>
                            </div>
                            <p className="text-[12px] text-[#6d6657] mt-0.5">
                                Evaluasi proporsi buku terbitan tahun {recencyMetrics.threshold_year} ke atas sebagai indikator pembobotan akreditasi perpustakaan sekolah.
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-serif font-bold text-[#164e3b]">
                                {recencyMetrics.recent_percentage}%
                            </span>
                            <span className="text-[11px] text-[#6d6657] block font-mono">Kemutakhiran Koleksi</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white rounded-xs border border-[#ded7c4]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-[#164e3b]">
                                    Koleksi Mutakhir (≥ {recencyMetrics.threshold_year})
                                </span>
                                <span className="font-mono font-bold text-[#164e3b]">
                                    {recencyMetrics.recent_titles_count} Judul ({recencyMetrics.recent_percentage}%)
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-[#f0ebd9] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#164e3b] rounded-full transition-all duration-500"
                                    style={{ width: `${recencyMetrics.recent_percentage}%` }}
                                />
                            </div>
                            <div className="text-[11px] text-[#787161] mt-1 font-mono">
                                Total {recencyMetrics.recent_copies_count} eksemplar fisik
                            </div>
                        </div>

                        <div className="p-3 bg-white rounded-xs border border-[#ded7c4]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-[#5c574c]">
                                    Koleksi Klasik / Terdahulu (&lt; {recencyMetrics.threshold_year})
                                </span>
                                <span className="font-mono font-bold text-[#5c574c]">
                                    {recencyMetrics.older_titles_count} Judul ({recencyMetrics.older_percentage}%)
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-[#f0ebd9] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#8c826c] rounded-full transition-all duration-500"
                                    style={{ width: `${recencyMetrics.older_percentage}%` }}
                                />
                            </div>
                            <div className="text-[11px] text-[#787161] mt-1 font-mono">
                                Total {recencyMetrics.older_copies_count} eksemplar fisik
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Chart 1: Frekuensi Kunjungan Berdasarkan Kelas */}
                <div className="lg:col-span-6 bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                        <div>
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Kunjungan Siswa per Rombongan Belajar
                            </h3>
                            <p className="text-[12px] text-[#6d6657] mt-0.5">
                                Peringkat kelas dengan intensitas literasi dan kehadiran fisik tertinggi.
                            </p>
                        </div>
                        <IconUsers size={20} className="text-[#164e3b]" />
                    </div>

                    <div className="space-y-3.5">
                        {visitsByClass.map((vc, idx) => {
                            const pct = Math.round((vc.total / maxVisitsClass) * 100);
                            return (
                                <div key={idx} className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-[#191816]">{vc.class_name}</span>
                                        <span className="font-mono text-[#5c574c] font-bold">{vc.total} kunjungan</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#f5efe2] rounded-2xs overflow-hidden border border-[#ded7c4]">
                                        <div
                                            className="h-full bg-[#164e3b] rounded-2xs transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chart 2: Jam Tersibuk Kunjungan (07:00 - 16:00) */}
                <div className="lg:col-span-6 bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                        <div>
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Pola Jam Tersibuk Perpustakaan
                            </h3>
                            <p className="text-[12px] text-[#6d6657] mt-0.5">
                                Distribusi waktu check-in siswa untuk evaluasi pengaturan jam piket pustakawan.
                            </p>
                        </div>
                        <IconClock size={20} className="text-[#164e3b]" />
                    </div>

                    <div className="flex items-end gap-2 h-44 pt-6 px-2 border-b border-[#ded7c4]">
                        {hourlyChartData.map((item) => {
                            const barHeight = Math.max(8, Math.round((item.count / maxHourly) * 100));
                            return (
                                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#191816] text-white text-[10px] py-0.5 px-1.5 rounded-2xs font-mono whitespace-nowrap pointer-events-none z-10">
                                        {item.count} kunjungan
                                    </div>
                                    <div
                                        className="w-full bg-[#3d7a64] group-hover:bg-[#164e3b] rounded-t-2xs transition-all duration-300"
                                        style={{ height: `${barHeight}%` }}
                                    />
                                    <span className="text-[9px] font-mono text-[#787161] rotate-[-45deg] origin-top-left mt-2">
                                        {item.hour.slice(0, 2)}:00
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 text-[11px] text-center text-[#787161] font-mono">
                        Puncak keramaian umumnya terjadi pada jam istirahat pertama (09:00 - 10:00) dan istirahat kedua (12:00 - 13:00).
                    </div>
                </div>
            </div>

            {/* Monthly Circulation Volume Bar Chart */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 mb-8 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Total Sirkulasi Buku Keluar-Masuk per Bulan
                        </h3>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            Perbandingan volume buku dipinjam versus buku dikembalikan selama 6 bulan terakhir.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-2xs bg-[#164e3b]"></span>
                            <span>Buku Dipinjam</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-2xs bg-[#85a898]"></span>
                            <span>Buku Kembali</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-4">
                    {monthlyCirculation.map((m, idx) => {
                        const borrowPct = Math.round((m.borrowed / maxMonthly) * 100);
                        const returnPct = Math.round((m.returned / maxMonthly) * 100);
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="h-32 flex items-end gap-1.5 w-full justify-center border-b border-[#ded7c4] pb-1">
                                    <div
                                        className="w-5 bg-[#164e3b] rounded-t-2xs transition-all duration-300 relative group"
                                        style={{ height: `${Math.max(6, borrowPct)}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#191816] text-white text-[9px] py-0.5 px-1 rounded-2xs font-mono pointer-events-none">
                                            {m.borrowed}
                                        </div>
                                    </div>
                                    <div
                                        className="w-5 bg-[#85a898] rounded-t-2xs transition-all duration-300 relative group"
                                        style={{ height: `${Math.max(6, returnPct)}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#191816] text-white text-[9px] py-0.5 px-1 rounded-2xs font-mono pointer-events-none">
                                            {m.returned}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[11px] font-mono font-medium text-[#4d483e] text-center">
                                    {m.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Popular Books Leaderboard (Adaptable by publication year) */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 mb-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#ece6d5] mb-4 gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <IconBook size={18} className="text-[#164e3b]" />
                            <h3 className="font-serif font-bold text-base text-[#191816]">
                                Koleksi Buku Paling Banyak Dipinjam {isFilterActive ? `(${activeFilterLabel})` : ''}
                            </h3>
                        </div>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            {isFilterActive
                                ? `Daftar buku terbitan periode ${activeFilterLabel} yang paling sering disirkulasikan oleh pemustaka.`
                                : 'Data rujukan utama untuk evaluasi anggaran pengadaan dan penambahan eksemplar buku berikutnya.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFilterActive && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="text-[11px] font-mono text-[#991b1b] hover:underline"
                            >
                                Reset Filter Periode
                            </button>
                        )}
                        <span className="text-[11px] font-mono text-[#164e3b] bg-[#e8f5ed] px-2 py-0.5 rounded-2xs border border-[#a3d9b8]">
                            Top {popularBooks.length} Koleksi
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Peringkat</th>
                                <th className="py-2.5 px-4">Judul Buku & Penulis</th>
                                <th className="py-2.5 px-4 text-center">Tahun Terbit</th>
                                <th className="py-2.5 px-4">Klasifikasi DDC</th>
                                <th className="py-2.5 px-4 text-center">Total Eksemplar</th>
                                <th className="py-2.5 px-4 text-center">Ketersediaan Rak</th>
                                <th className="py-2.5 px-4 text-right">Frekuensi Sirkulasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {popularBooks.length > 0 ? (
                                popularBooks.map((book, index) => (
                                    <tr key={book.id} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-mono font-bold text-[#164e3b]">
                                            #{index + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/katalog/buku/${book.id}`}
                                                className="font-bold text-[#191816] hover:text-[#164e3b] hover:underline"
                                            >
                                                {book.title}
                                            </Link>
                                            <div className="text-[11px] text-[#787161]">
                                                {book.author} • {book.publisher}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-[#191816]">
                                            {book.publication_year ?? '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-1.5 py-0.5 rounded-2xs bg-[#f4eee1] text-[#524d42] font-mono text-[11px] border border-[#ded7c4]">
                                                DDC {book.ddc_code}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono text-[#5e5748]">
                                            {book.total_copies} Buku
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono">
                                            <span className={book.available_copies > 0 ? 'text-[#198754] font-semibold' : 'text-[#dc2626] font-semibold'}>
                                                {book.available_copies} Tersedia
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-[#164e3b]">
                                            {book.total_borrowed} kali dipinjam
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-[#787161]">
                                        Tidak ditemukan koleksi buku untuk kriteria rentang tahun terbit ini.
                                        {isFilterActive && (
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilter}
                                                    className="text-xs text-[#164e3b] font-bold underline"
                                                >
                                                    Tampilkan semua tahun terbit
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financial Ledger: Kas Denda */}
            <div className="bg-white border border-[#ded7c4] rounded-xs p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#ece6d5] mb-5">
                    <div>
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            Laporan Finansial Kas Denda & Ganti Rugi
                        </h3>
                        <p className="text-[12px] text-[#6d6657] mt-0.5">
                            Rekapitulasi transparan kas denda buku telat, rusak, atau hilang untuk pemeliharaan koleksi.
                        </p>
                    </div>
                    <IconCreditCard size={20} className="text-[#b45309]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-[#e8f5ed] border border-[#a3d9b8] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#134e31]">Kas Denda Terkumpul (Lunas)</div>
                        <div className="text-2xl font-serif font-bold text-[#134e31] mt-1">
                            Rp {finePaidSum.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-[#2e6b4c] mt-0.5">Tercatat di kas sirkulasi</div>
                    </div>
                    <div className="p-4 bg-[#fee2e2] border border-[#fca5a5] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#991b1b]">Denda Tertunggak (Belum Bayar)</div>
                        <div className="text-2xl font-serif font-bold text-[#991b1b] mt-1">
                            Rp {fineUnpaidSum.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-[#b91c1c] mt-0.5">Masih ditagihkan ke peminjam</div>
                    </div>
                    <div className="p-4 bg-[#faf8f5] border border-[#ded7c4] rounded-xs">
                        <div className="text-[11px] font-mono uppercase text-[#787161]">Ketentuan Tarif</div>
                        <div className="text-2xl font-serif font-bold text-[#191816] mt-1">
                            Rp {setting.daily_fine_rate.toLocaleString('id-ID')} / hari
                        </div>
                        <div className="text-[11px] text-[#8a816e] mt-0.5">Denda harian per eksemplar</div>
                    </div>
                </div>

                {/* Fine Breakdown by Reason */}
                <div className="overflow-x-auto border border-[#ded7c4] rounded-xs">
                    <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f5efe2] text-[#4d483e] font-semibold border-b border-[#ded7c4]">
                            <tr>
                                <th className="py-2.5 px-4">Kategori Pelanggaran</th>
                                <th className="py-2.5 px-4">Jumlah Kejadian</th>
                                <th className="py-2.5 px-4">Total Nominal Tagihan</th>
                                <th className="py-2.5 px-4">Kas Telah Dibayar</th>
                                <th className="py-2.5 px-4 text-right">Status Pelunasan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebe4d3]">
                            {fineByReason.length > 0 ? (
                                fineByReason.map((f, i) => (
                                    <tr key={i} className="hover:bg-[#faf8f5]">
                                        <td className="py-3 px-4 font-semibold text-[#191816] capitalize">
                                            Denda {f.fine_reason}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#5e5748]">
                                            {f.count} Transaksi
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-[#191816]">
                                            Rp {Number(f.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[#198754] font-semibold">
                                            Rp {Number(f.total_paid).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {f.total_amount === f.total_paid ? (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                    100% Lunas
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]">
                                                    Ada Tertunggak
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-[#787161]">
                                        Tidak ada catatan denda yang terhimpun.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
