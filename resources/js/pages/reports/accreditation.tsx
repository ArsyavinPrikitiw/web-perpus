import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { IconPrinter, IconBookOpen, IconCheckCircle, IconCalendar, IconFilter, IconX } from '@/components/icons';

interface BookByYear {
    year: number;
    titles_count: number;
    copies_count: number;
    percentage: number;
    is_recent: boolean;
}

interface RecencyStats {
    threshold_year: number;
    recent_titles: number;
    recent_copies: number;
    recent_percentage: number;
    older_titles: number;
    older_copies: number;
    older_percentage: number;
}

interface AccreditationProps {
    booksByCategory: Array<{
        code: string;
        name: string;
        titles_count: number;
        copies_count: number;
    }>;
    booksByYear?: BookByYear[];
    recencyStats?: RecencyStats;
    startYear?: number | null;
    endYear?: number | null;
    selectedYear?: number | null;
    availablePublicationYears?: number[];
    metrics: {
        total_titles: number;
        total_copies: number;
        total_members: number;
        total_loans: number;
        total_attendance: number;
        total_fines_collected: number;
        is_filtered_by_year?: boolean;
        start_year?: number | null;
        end_year?: number | null;
        filter_label?: string;
    };
    setting: {
        library_name: string;
        institution_name: string;
        head_librarian_name: string;
        head_librarian_nip: string;
        logo_url?: string | null;
    };
}

export default function AccreditationReport({
    booksByCategory,
    booksByYear = [],
    recencyStats,
    startYear = null,
    endYear = null,
    selectedYear = null,
    availablePublicationYears = [],
    metrics,
    setting,
}: AccreditationProps) {
    const [startYearInput, setStartYearInput] = useState<string>(
        startYear ? String(startYear) : (selectedYear ? String(selectedYear) : '')
    );
    const [endYearInput, setEndYearInput] = useState<string>(
        endYear ? String(endYear) : ''
    );

    const isFiltered = Boolean(metrics.is_filtered_by_year || startYear !== null || endYear !== null || selectedYear !== null);

    const handlePrint = () => {
        window.print();
    };

    const handleApplyFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query: Record<string, any> = {};
        if (startYearInput.trim()) query.start_year = startYearInput.trim();
        if (endYearInput.trim()) query.end_year = endYearInput.trim();

        router.get('/laporan/akreditasi', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setStartYearInput('');
        setEndYearInput('');
        router.get('/laporan/akreditasi', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getDashboardLink = () => {
        const params = new URLSearchParams();
        if (startYear !== null) params.set('start_year', String(startYear));
        if (endYear !== null) params.set('end_year', String(endYear));
        const qs = params.toString();
        return qs ? `/laporan?${qs}` : '/laporan';
    };

    const filterDisplayLabel = metrics.filter_label || (
        startYear && endYear && startYear !== endYear
            ? `Tahun Terbit ${startYear} s/d ${endYear}`
            : (startYear || endYear || selectedYear ? `Tahun Terbit ${startYear || endYear || selectedYear}` : 'Semua Tahun Terbit')
    );

    return (
        <div className="min-h-screen bg-[#ede8dc] py-8 px-4 flex flex-col items-center print:bg-white print:p-0">
            <Head title="Laporan Portofolio Akreditasi Perpustakaan Sekolah" />

            {/* Action Bar (Hidden on print) */}
            <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-6 no-print bg-white p-3.5 rounded-xs border border-[#ded7c4] shadow-xs gap-3">
                <Link
                    href={getDashboardLink()}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#454137] hover:text-[#164e3b]"
                >
                    ← Kembali ke Dashboard Laporan
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Publication Year 2-Column Range Filter inputs */}
                    <form onSubmit={handleApplyFilter} className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#6d6657] font-mono uppercase">Periode:</span>
                        <input
                            type="number"
                            min="1900"
                            max="2099"
                            value={startYearInput}
                            onChange={(e) => setStartYearInput(e.target.value)}
                            placeholder="Dari: 1996"
                            className="w-24 text-[12px] px-2 py-1 bg-[#faf8f5] border border-[#ded7c4] rounded-xs font-mono text-[#191816] focus:outline-none focus:border-[#164e3b]"
                        />
                        <span className="text-xs text-[#787161] font-mono">-</span>
                        <input
                            type="number"
                            min="1900"
                            max="2099"
                            value={endYearInput}
                            onChange={(e) => setEndYearInput(e.target.value)}
                            placeholder="Sampai: 2020"
                            className="w-24 text-[12px] px-2 py-1 bg-[#faf8f5] border border-[#ded7c4] rounded-xs font-mono text-[#191816] focus:outline-none focus:border-[#164e3b]"
                        />
                        <button
                            type="submit"
                            className="px-2.5 py-1 bg-[#164e3b] text-white text-[11px] font-bold rounded-xs hover:bg-[#0f392b] transition-colors"
                        >
                            Filter
                        </button>
                        {isFiltered && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="px-2 py-1 bg-[#faf8f5] text-[#991b1b] border border-[#ded7c4] text-[11px] font-medium rounded-xs hover:bg-[#ede7d8] transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </form>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#164e3b] hover:bg-[#0f392b] text-white text-[12px] font-bold rounded-xs shadow-xs transition-colors"
                    >
                        <IconPrinter size={15} />
                        <span>Cetak Akreditasi (A4 / PDF)</span>
                    </button>
                </div>
            </div>

            {/* Official Report Document */}
            <div className="w-full max-w-4xl bg-white p-10 sm:p-14 border border-[#cfc7b4] shadow-md print:border-none print:shadow-none print:p-6 text-[#111110] font-serif leading-normal">
                {/* Official Letterhead */}
                <div className="relative pb-4 border-b-4 border-double border-[#191816]">
                    {setting?.logo_url && (
                        <div className="sm:absolute left-0 top-1/2 sm:-translate-y-1/2 mb-3 sm:mb-0 flex justify-center sm:justify-start">
                            <img src={setting.logo_url} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                        </div>
                    )}
                    <div className={`text-center ${setting?.logo_url ? 'sm:px-20' : ''}`}>
                        <div className="text-[12px] font-sans uppercase tracking-widest text-[#3d3a33] font-semibold">
                            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </div>
                        <div className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#191816] mt-0.5">
                            {setting.institution_name}
                        </div>
                        <div className="text-sm font-semibold tracking-wide text-[#164e3b] mt-0.5 font-sans">
                            PORTOFOLIO INSTRUMEN AKREDITASI PERPUSTAKAAN SEKOLAH (STANDAR SNP 009:2020)
                        </div>
                        <div className="text-[11px] font-sans text-[#5c574c] mt-1">
                            Disusun untuk Penilaian Akreditasi Perpustakaan Nasional Republik Indonesia
                        </div>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center my-6">
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#191816]">
                        LAPORAN EVALUASI DIRI & DATA STATISTIK PUSTAKA
                    </h2>
                    <div className="text-[12px] font-sans text-[#5c574c] mt-0.5 font-medium">
                        {isFiltered
                            ? `Pemisahan Data Koleksi Khusus ${filterDisplayLabel} • Periode Evaluasi ${new Date().getFullYear()}`
                            : `Periode Evaluasi Tahun Anggaran ${new Date().getFullYear()} • Kategori: Perpustakaan Sekolah Menengah Atas`}
                    </div>
                </div>

                {/* Section 1: Profil & Metrik Kunci */}
                <div className="space-y-4 mb-8 text-[13px] font-sans">
                    <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1 flex items-center justify-between">
                        <span>I. Data Umum & Ringkasan Indikator Kinerja Pustaka</span>
                        {isFiltered && (
                            <span className="text-[11px] font-mono text-[#164e3b] uppercase">
                                [ Fokus {filterDisplayLabel} ]
                            </span>
                        )}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Nama Institusi / Sekolah</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.institution_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Nama Unit Perpustakaan</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.library_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Kepala Perpustakaan</div>
                            <strong className="text-[13px] text-[#191816] block mt-0.5">{setting.head_librarian_name}</strong>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">
                                {isFiltered ? `Kekayaan Koleksi (${filterDisplayLabel})` : 'Kekayaan Koleksi (Judul)'}
                            </div>
                            <div className="text-xl font-mono font-bold text-[#164e3b] mt-0.5">
                                {metrics.total_titles} Judul
                            </div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">
                                {isFiltered ? `Total Eksemplar Fisik (${filterDisplayLabel})` : 'Total Eksemplar Fisik'}
                            </div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-0.5">
                                {metrics.total_copies} Eksemplar
                            </div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Anggota Perpustakaan Terdaftar</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-0.5">
                                {metrics.total_members} Anggota
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Klasifikasi Koleksi Berdasarkan DDC */}
                <div className="space-y-3 mb-8 text-[13px] font-sans">
                    <div className="flex items-center justify-between border-b border-[#ded7c4] pb-1">
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            II. Distribusi Koleksi Berdasarkan Bagan Klasifikasi DDC (Dewey Decimal Classification)
                        </h3>
                        {isFiltered && (
                            <span className="text-[11px] font-mono text-[#164e3b]">
                                ({filterDisplayLabel})
                            </span>
                        )}
                    </div>
                    <div className="overflow-x-auto border border-[#ded7c4] rounded-2xs">
                        <table className="w-full text-left">
                            <thead className="bg-[#f5efe2] text-[#332f27] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2 px-3 w-16">Kode</th>
                                    <th className="py-2 px-3">Klasifikasi Utama DDC</th>
                                    <th className="py-2 px-3 text-right">Jumlah Judul</th>
                                    <th className="py-2 px-3 text-right">Total Eksemplar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ece6d5]">
                                {booksByCategory.map((c) => (
                                    <tr key={c.code} className="hover:bg-[#faf8f5]">
                                        <td className="py-2 px-3 font-mono font-bold text-[#164e3b]">{c.code}</td>
                                        <td className="py-2 px-3 font-medium text-[#191816]">{c.name}</td>
                                        <td className="py-2 px-3 text-right font-mono">{c.titles_count}</td>
                                        <td className="py-2 px-3 text-right font-mono font-semibold">{c.copies_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#f0e9d8] font-bold border-t-2 border-[#ded7c4]">
                                <tr>
                                    <td colSpan={2} className="py-2.5 px-3">
                                        TOTAL KELOMPOK DDC {isFiltered ? `(${filterDisplayLabel})` : ''}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                        {booksByCategory.reduce((sum, c) => sum + c.titles_count, 0)} Judul
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                        {booksByCategory.reduce((sum, c) => sum + c.copies_count, 0)} Eks
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Section 3: Rekapitulasi Berdasarkan Tahun Terbit */}
                <div className="space-y-3 mb-8 text-[13px] font-sans">
                    <div className="flex items-center justify-between border-b border-[#ded7c4] pb-1">
                        <h3 className="font-serif font-bold text-base text-[#191816]">
                            III. Rekapitulasi Koleksi Pustaka Menurut Tahun Publikasi / Terbit
                        </h3>
                        {isFiltered && (
                            <span className="text-[11px] font-mono text-[#164e3b]">
                                ({filterDisplayLabel})
                            </span>
                        )}
                    </div>
                    <div className="overflow-x-auto border border-[#ded7c4] rounded-2xs">
                        <table className="w-full text-left">
                            <thead className="bg-[#f5efe2] text-[#332f27] font-semibold border-b border-[#ded7c4]">
                                <tr>
                                    <th className="py-2 px-3 text-center w-24">Tahun Terbit</th>
                                    <th className="py-2 px-3 text-right">Jumlah Judul</th>
                                    <th className="py-2 px-3 text-right">Jumlah Eksemplar</th>
                                    <th className="py-2 px-3 text-right">Persentase Judul</th>
                                    <th className="py-2 px-3 text-center">Status Kemutakhiran</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ece6d5]">
                                {booksByYear.length > 0 ? (
                                    booksByYear.map((by) => (
                                        <tr key={by.year} className="hover:bg-[#faf8f5]">
                                            <td className="py-2 px-3 text-center font-mono font-bold text-[#191816]">
                                                {by.year}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono">
                                                {by.titles_count}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono font-semibold">
                                                {by.copies_count}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono">
                                                {by.percentage}%
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                {by.is_recent ? (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-2xs bg-[#e8f5ed] text-[#134e31] border border-[#a3d9b8]">
                                                        Mutakhir (≤ 5 Thn)
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-2xs bg-[#f4eee1] text-[#736c5e] border border-[#ded7c4]">
                                                        Arsip / Klasik
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-[#787161]">
                                            Tidak ada koleksi dalam kriteria rentang tahun ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 4: Kemutakhiran Koleksi & Borang SNP */}
                {recencyStats && (
                    <div className="space-y-3 mb-8 text-[13px] font-sans">
                        <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1">
                            IV. Instrumen Kemutakhiran Koleksi Standar Nasional Perpustakaan (SNP)
                        </h3>
                        <div className="p-4 bg-[#faf8f3] border border-[#ded7c4] rounded-2xs space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span>Batas Ambang Tahun Mutakhir:</span>
                                <span className="font-mono font-bold">Tahun {recencyStats.threshold_year} sampai sekarang</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span>Koleksi Mutakhir (Terbit 5 Tahun Terakhir):</span>
                                <span className="font-mono font-bold text-[#164e3b]">
                                    {recencyStats.recent_titles} Judul ({recencyStats.recent_percentage}% dari total koleksi)
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span>Koleksi Terdahulu (&lt; 5 Tahun Terakhir):</span>
                                <span className="font-mono text-[#5c574c]">
                                    {recencyStats.older_titles} Judul ({recencyStats.older_percentage}%)
                                </span>
                            </div>
                            <div className="pt-2 border-t border-[#ded7c4] text-[11px] text-[#5c574c] italic">
                                Catatan: Komponen kemutakhiran koleksi SNP mensyaratkan minimal 15-20% koleksi buku berusia terbit kurang dari 5 tahun untuk memperoleh nilai optimal akreditasi A.
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 5: Indikator Layanan & Tata Kelola */}
                <div className="space-y-3 mb-8 text-[13px] font-sans">
                    <h3 className="font-serif font-bold text-base text-[#191816] border-b border-[#ded7c4] pb-1">
                        V. Statistik Pemanfaatan & Transparansi Layanan Pemustaka
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Akumulasi Kunjungan</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">
                                {metrics.total_attendance}
                            </div>
                            <div className="text-[10px] text-[#8a816e]">Buku tamu digital</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Akumulasi Sirkulasi</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">
                                {metrics.total_loans}
                            </div>
                            <div className="text-[10px] text-[#8a816e]">Transaksi pinjam</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Penerimaan Kas Denda</div>
                            <div className="text-xl font-mono font-bold text-[#191816] mt-1">
                                Rp {metrics.total_fines_collected.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[10px] text-[#8a816e]">Transparansi kas</div>
                        </div>
                        <div className="p-3 bg-[#faf8f5] border border-[#e4decb] rounded-2xs">
                            <div className="text-[11px] text-[#787161]">Otomasi Barcode</div>
                            <div className="text-xl font-mono font-bold text-[#164e3b] mt-1">100%</div>
                            <div className="text-[10px] text-[#8a816e]">Terkomputerisasi</div>
                        </div>
                    </div>
                </div>

                {/* Validation and Signature Block */}
                <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-[13px] font-sans">
                    <div className="space-y-1">
                        <div className="text-[11px] text-[#787161] font-mono uppercase tracking-wider">
                            Pemeriksa / Asesor Akreditasi:
                        </div>
                        <div className="h-16 flex items-end">
                            <span className="text-[#a8a192] italic font-serif">(Tanda Tangan / Tanggal)</span>
                        </div>
                        <div className="font-semibold text-[#191816]">_____________________________</div>
                        <div className="text-[11px] text-[#6d6657]">Tim Asesor Akreditasi Perpustakaan</div>
                    </div>

                    <div className="text-right space-y-1">
                        <div className="text-[#3d3a33]">Kota Pelajar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div className="font-semibold text-[#191816]">Kepala Perpustakaan Sekolah,</div>
                        <div className="h-16 flex items-center justify-end">
                            <span className="text-[11px] font-mono text-[#164e3b] uppercase border border-[#164e3b]/30 px-2 py-0.5 rounded-2xs">
                                [ TTD & CAP RESMI ]
                            </span>
                        </div>
                        <div className="font-serif font-bold text-base text-[#191816] underline underline-offset-2">
                            {setting.head_librarian_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#5c574c]">
                            NIP. {setting.head_librarian_nip}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
