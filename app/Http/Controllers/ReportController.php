<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Book;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Dashboard Laporan & Statistik Komprehensif.
     */
    public function index(Request $request): Response
    {
        $setting = LibrarySetting::current();

        // Parameter filter rentang tahun terbit (2 kolom: Dari Tahun dan Sampai Tahun)
        $publicationYear = $request->filled('publication_year') ? (int) $request->input('publication_year') : null;

        $startYear = $request->filled('start_year')
            ? (int) $request->input('start_year')
            : $publicationYear;

        $endYear = $request->filled('end_year')
            ? (int) $request->input('end_year')
            : ($request->filled('start_year') ? null : $publicationYear);

        // Pastikan urutan tahun valid jika kedua kolom terisi
        if ($startYear !== null && $endYear !== null && $startYear > $endYear) {
            [$startYear, $endYear] = [$endYear, $startYear];
        }

        $isFiltered = $startYear !== null || $endYear !== null;
        $selectedYear = ($startYear !== null && $endYear === null) || ($startYear === $endYear) ? $startYear : null;

        // Daftar semua tahun terbit yang tersedia di koleksi perpustakaan
        $availablePublicationYears = Book::select('publication_year')
            ->whereNotNull('publication_year')
            ->distinct()
            ->orderBy('publication_year')
            ->pluck('publication_year')
            ->map(fn ($y) => (int) $y)
            ->values()
            ->all();

        $currentYear = (int) date('Y');
        $recencyThreshold = $currentYear - 5;
        $totalBooksCount = (int) Book::count();
        $totalCopiesCount = (int) Book::sum('total_copies');

        // Frekuensi sirkulasi pinjaman per tahun terbit buku
        $loansCountByYear = Loan::join('book_copies', 'loans.book_copy_id', '=', 'book_copies.id')
            ->join('books', 'book_copies.book_id', '=', 'books.id')
            ->select('books.publication_year', DB::raw('count(loans.id) as total_borrowed'))
            ->groupBy('books.publication_year')
            ->pluck('total_borrowed', 'books.publication_year');

        // Rekapitulasi koleksi yang dipisahkan berdasarkan tahun terbit buku
        $booksByYear = Book::select(
            'publication_year',
            DB::raw('count(*) as titles_count'),
            DB::raw('sum(total_copies) as copies_count'),
            DB::raw('sum(available_copies) as available_copies')
        )
            ->groupBy('publication_year')
            ->orderByDesc('publication_year')
            ->get()
            ->map(function ($item) use ($loansCountByYear, $recencyThreshold, $totalBooksCount, $totalCopiesCount, $startYear, $endYear) {
                $year = (int) $item->publication_year;
                $titles = (int) $item->titles_count;
                $copies = (int) $item->copies_count;
                $available = (int) $item->available_copies;
                $borrowed = (int) ($loansCountByYear[$year] ?? 0);

                $inRange = true;
                if ($startYear !== null && $year < $startYear) {
                    $inRange = false;
                }
                if ($endYear !== null && $year > $endYear) {
                    $inRange = false;
                }

                return [
                    'year' => $year,
                    'titles_count' => $titles,
                    'copies_count' => $copies,
                    'available_copies' => $available,
                    'borrowed_count' => $borrowed,
                    'is_recent' => $year >= $recencyThreshold,
                    'in_range' => $inRange,
                    'titles_percentage' => $totalBooksCount > 0 ? round(($titles / $totalBooksCount) * 100, 1) : 0,
                    'copies_percentage' => $totalCopiesCount > 0 ? round(($copies / $totalCopiesCount) * 100, 1) : 0,
                ];
            });

        // Metrik kemutakhiran koleksi pustaka (Standar Akreditasi Perpustakaan SNP)
        $recentTitlesCount = (int) Book::where('publication_year', '>=', $recencyThreshold)->count();
        $recentCopiesCount = (int) Book::where('publication_year', '>=', $recencyThreshold)->sum('total_copies');
        $olderTitlesCount = max(0, $totalBooksCount - $recentTitlesCount);
        $olderCopiesCount = max(0, $totalCopiesCount - $recentCopiesCount);

        $recencyMetrics = [
            'threshold_year' => $recencyThreshold,
            'recent_titles_count' => $recentTitlesCount,
            'recent_copies_count' => $recentCopiesCount,
            'recent_percentage' => $totalBooksCount > 0 ? round(($recentTitlesCount / $totalBooksCount) * 100, 1) : 0,
            'older_titles_count' => $olderTitlesCount,
            'older_copies_count' => $olderCopiesCount,
            'older_percentage' => $totalBooksCount > 0 ? round(($olderTitlesCount / $totalBooksCount) * 100, 1) : 0,
        ];

        // Statistik khusus jika filter rentang tahun terbit aktif
        $yearSpecificStats = null;
        if ($isFiltered) {
            $filteredBooksQuery = Book::query();
            if ($startYear !== null && $endYear !== null) {
                $filteredBooksQuery->whereBetween('publication_year', [$startYear, $endYear]);
            } elseif ($startYear !== null) {
                $filteredBooksQuery->where('publication_year', '>=', $startYear);
            } elseif ($endYear !== null) {
                $filteredBooksQuery->where('publication_year', '<=', $endYear);
            }

            $rangeTitles = (int) (clone $filteredBooksQuery)->count();
            $rangeCopies = (int) (clone $filteredBooksQuery)->sum('total_copies');
            $rangeAvailable = (int) (clone $filteredBooksQuery)->sum('available_copies');

            $rangeBorrowed = (int) Loan::join('book_copies', 'loans.book_copy_id', '=', 'book_copies.id')
                ->join('books', 'book_copies.book_id', '=', 'books.id')
                ->where(function ($q) use ($startYear, $endYear) {
                    if ($startYear !== null && $endYear !== null) {
                        $q->whereBetween('books.publication_year', [$startYear, $endYear]);
                    } elseif ($startYear !== null) {
                        $q->where('books.publication_year', '>=', $startYear);
                    } elseif ($endYear !== null) {
                        $q->where('books.publication_year', '<=', $endYear);
                    }
                })
                ->count();

            $rangeLabel = ($startYear !== null && $endYear !== null && $startYear !== $endYear)
                ? "{$startYear} - {$endYear}"
                : (string) ($startYear ?? $endYear);

            $yearSpecificStats = [
                'start_year' => $startYear,
                'end_year' => $endYear,
                'year' => ($startYear === $endYear) ? $startYear : ($startYear ?? $endYear),
                'label' => $rangeLabel,
                'titles_count' => $rangeTitles,
                'copies_count' => $rangeCopies,
                'available_copies' => $rangeAvailable,
                'borrowed_count' => $rangeBorrowed,
                'is_recent' => $startYear !== null ? ($startYear >= $recencyThreshold) : false,
                'titles_percentage' => $totalBooksCount > 0 ? round(($rangeTitles / $totalBooksCount) * 100, 1) : 0,
            ];
        }

        // 1. Frekuensi kunjungan siswa per kelas
        $visitsByClass = AttendanceLog::select('class_name', DB::raw('count(*) as total'))
            ->whereNotNull('class_name')
            ->where('class_name', '!=', '')
            ->groupBy('class_name')
            ->orderByDesc('total')
            ->take(8)
            ->get();

        // 2. Distribusi Jam Tersibuk Kunjungan (07:00 - 16:00)
        $rawLogs = AttendanceLog::select('checkin_at')->get();
        $hourlyDistribution = [];
        for ($h = 7; $h <= 16; $h++) {
            $label = sprintf('%02d:00', $h);
            $hourlyDistribution[$label] = 0;
        }
        foreach ($rawLogs as $log) {
            $hour = (int) $log->checkin_at->format('H');
            $label = sprintf('%02d:00', $hour);
            if (isset($hourlyDistribution[$label])) {
                $hourlyDistribution[$label]++;
            }
        }
        $hourlyChartData = [];
        foreach ($hourlyDistribution as $hour => $count) {
            $hourlyChartData[] = ['hour' => $hour, 'count' => $count];
        }

        // 3. Buku Terpopuler (Paling Banyak Dipinjam) - Difilter sesuai rentang tahun terbit jika aktif
        $popularBooksQuery = Book::with('category')
            ->withCount('copies')
            ->select('books.*')
            ->addSelect([
                'total_borrowed' => Loan::selectRaw('count(*)')
                    ->whereColumn('book_copies.book_id', 'books.id')
                    ->join('book_copies', 'loans.book_copy_id', '=', 'book_copies.id'),
            ]);

        if ($startYear !== null && $endYear !== null) {
            $popularBooksQuery->whereBetween('books.publication_year', [$startYear, $endYear]);
        } elseif ($startYear !== null) {
            $popularBooksQuery->where('books.publication_year', '>=', $startYear);
        } elseif ($endYear !== null) {
            $popularBooksQuery->where('books.publication_year', '<=', $endYear);
        }

        $popularBooks = $popularBooksQuery
            ->orderByDesc('total_borrowed')
            ->take(10)
            ->get();

        // 4. Sirkulasi Bulanan (Buku Keluar vs Buku Kembali 6 Bulan Terakhir)
        $monthlyCirculation = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::today()->subMonths($i);
            $monthKey = $date->format('M Y');
            $borrowedCount = Loan::whereYear('borrow_date', $date->year)
                ->whereMonth('borrow_date', $date->month)
                ->count();
            $returnedCount = Loan::whereNotNull('return_date')
                ->whereYear('return_date', $date->year)
                ->whereMonth('return_date', $date->month)
                ->count();

            $monthlyCirculation[] = [
                'month' => $monthKey,
                'borrowed' => $borrowedCount,
                'returned' => $returnedCount,
            ];
        }

        // 5. Laporan Finansial Kas Denda
        $finePaidSum = (int) Loan::where('fine_status', 'paid')->sum('fine_paid');
        $fineUnpaidSum = (int) Loan::where('fine_status', 'unpaid')->sum('fine_amount');
        $fineByReason = Loan::select('fine_reason', DB::raw('sum(fine_amount) as total_amount'), DB::raw('sum(fine_paid) as total_paid'), DB::raw('count(*) as count'))
            ->whereNotNull('fine_reason')
            ->groupBy('fine_reason')
            ->get();

        $fineRecentTransactions = Loan::with(['user', 'bookCopy.book'])
            ->where('fine_amount', '>', 0)
            ->latest('updated_at')
            ->take(10)
            ->get();

        // 6. Ringkasan Akreditasi
        $accreditationMetrics = [
            'total_titles' => Book::count(),
            'total_volumes' => Book::sum('total_copies'),
            'total_categories' => Category::count(),
            'total_members' => User::where('role', 'anggota')->count(),
            'total_teachers' => User::where('role', 'anggota')->where('member_type', 'guru')->count(),
            'total_students' => User::where('role', 'anggota')->where('member_type', 'siswa')->count(),
            'total_visits_all_time' => AttendanceLog::count(),
            'total_circulation_all_time' => Loan::count(),
            'punctuality_rate' => Loan::where('status', 'kembali')->where('fine_amount', 0)->count() > 0
                ? round((Loan::where('status', 'kembali')->where('fine_amount', 0)->count() / max(1, Loan::where('status', 'kembali')->count())) * 100, 1)
                : 100.0,
        ];

        return Inertia::render('reports/index', [
            'visitsByClass' => $visitsByClass,
            'hourlyChartData' => $hourlyChartData,
            'popularBooks' => $popularBooks,
            'booksByYear' => $booksByYear,
            'availablePublicationYears' => $availablePublicationYears,
            'startYear' => $startYear,
            'endYear' => $endYear,
            'selectedYear' => $selectedYear,
            'recencyMetrics' => $recencyMetrics,
            'yearSpecificStats' => $yearSpecificStats,
            'monthlyCirculation' => $monthlyCirculation,
            'finePaidSum' => $finePaidSum,
            'fineUnpaidSum' => $fineUnpaidSum,
            'fineByReason' => $fineByReason,
            'fineRecentTransactions' => $fineRecentTransactions,
            'accreditationMetrics' => $accreditationMetrics,
            'setting' => $setting,
        ]);
    }

    /**
     * Tampilan Resmi & Ekspor Laporan Akreditasi Perpustakaan.
     */
    public function exportAccreditation(Request $request): Response
    {
        $setting = LibrarySetting::current();

        $publicationYear = $request->filled('publication_year') ? (int) $request->input('publication_year') : null;

        $startYear = $request->filled('start_year')
            ? (int) $request->input('start_year')
            : $publicationYear;

        $endYear = $request->filled('end_year')
            ? (int) $request->input('end_year')
            : ($request->filled('start_year') ? null : $publicationYear);

        if ($startYear !== null && $endYear !== null && $startYear > $endYear) {
            [$startYear, $endYear] = [$endYear, $startYear];
        }

        $isFiltered = $startYear !== null || $endYear !== null;
        $selectedYear = ($startYear !== null && $endYear === null) || ($startYear === $endYear) ? $startYear : null;

        $availablePublicationYears = Book::select('publication_year')
            ->whereNotNull('publication_year')
            ->distinct()
            ->orderBy('publication_year')
            ->pluck('publication_year')
            ->map(fn ($y) => (int) $y)
            ->values()
            ->all();

        $currentYear = (int) date('Y');
        $recencyThreshold = $currentYear - 5;
        $totalTitlesAll = (int) Book::count();
        $totalCopiesAll = (int) Book::sum('total_copies');

        // Rekapitulasi koleksi menurut tahun terbit
        $booksByYearQuery = Book::select(
            'publication_year',
            DB::raw('count(*) as titles_count'),
            DB::raw('sum(total_copies) as copies_count')
        )
            ->groupBy('publication_year')
            ->orderByDesc('publication_year');

        if ($startYear !== null && $endYear !== null) {
            $booksByYearQuery->whereBetween('publication_year', [$startYear, $endYear]);
        } elseif ($startYear !== null) {
            $booksByYearQuery->where('publication_year', '>=', $startYear);
        } elseif ($endYear !== null) {
            $booksByYearQuery->where('publication_year', '<=', $endYear);
        }

        $booksByYear = $booksByYearQuery->get()
            ->map(function ($item) use ($totalTitlesAll, $recencyThreshold) {
                $year = (int) $item->publication_year;
                $titles = (int) $item->titles_count;
                $copies = (int) $item->copies_count;

                return [
                    'year' => $year,
                    'titles_count' => $titles,
                    'copies_count' => $copies,
                    'percentage' => $totalTitlesAll > 0 ? round(($titles / $totalTitlesAll) * 100, 1) : 0,
                    'is_recent' => $year >= $recencyThreshold,
                ];
            });

        $recentTitles = (int) Book::where('publication_year', '>=', $recencyThreshold)->count();
        $recentCopies = (int) Book::where('publication_year', '>=', $recencyThreshold)->sum('total_copies');

        $recencyStats = [
            'threshold_year' => $recencyThreshold,
            'recent_titles' => $recentTitles,
            'recent_copies' => $recentCopies,
            'recent_percentage' => $totalTitlesAll > 0 ? round(($recentTitles / $totalTitlesAll) * 100, 1) : 0,
            'older_titles' => max(0, $totalTitlesAll - $recentTitles),
            'older_copies' => max(0, $totalCopiesAll - $recentCopies),
            'older_percentage' => $totalTitlesAll > 0 ? round(((max(0, $totalTitlesAll - $recentTitles)) / $totalTitlesAll) * 100, 1) : 0,
        ];

        $applyYearFilter = function ($q) use ($startYear, $endYear) {
            if ($startYear !== null && $endYear !== null) {
                $q->whereBetween('publication_year', [$startYear, $endYear]);
            } elseif ($startYear !== null) {
                $q->where('publication_year', '>=', $startYear);
            } elseif ($endYear !== null) {
                $q->where('publication_year', '<=', $endYear);
            }
        };

        $booksByCategory = Category::withCount(['books' => function ($q) use ($applyYearFilter, $isFiltered) {
            if ($isFiltered) {
                $applyYearFilter($q);
            }
        }])
            ->with(['books' => function ($q) use ($applyYearFilter, $isFiltered) {
                $q->select('id', 'category_id', 'total_copies', 'publication_year');
                if ($isFiltered) {
                    $applyYearFilter($q);
                }
            }])
            ->get()
            ->map(function ($cat) {
                return [
                    'code' => $cat->code,
                    'name' => $cat->name,
                    'titles_count' => $cat->books_count,
                    'copies_count' => (int) $cat->books->sum('total_copies'),
                ];
            });

        $bookScopedQuery = Book::query();
        if ($isFiltered) {
            $applyYearFilter($bookScopedQuery);
        }

        $filterLabel = 'Semua Tahun Terbit';
        if ($isFiltered) {
            if ($startYear !== null && $endYear !== null && $startYear !== $endYear) {
                $filterLabel = "Tahun Terbit {$startYear} s/d {$endYear}";
            } elseif ($startYear !== null && $endYear !== null) {
                $filterLabel = "Tahun Terbit {$startYear}";
            } elseif ($startYear !== null) {
                $filterLabel = "Tahun Terbit Mulai {$startYear}";
            } else {
                $filterLabel = "Tahun Terbit s/d {$endYear}";
            }
        }

        $metrics = [
            'total_titles' => (int) (clone $bookScopedQuery)->count(),
            'total_copies' => (int) (clone $bookScopedQuery)->sum('total_copies'),
            'total_members' => User::where('role', 'anggota')->count(),
            'total_loans' => Loan::count(),
            'total_attendance' => AttendanceLog::count(),
            'total_fines_collected' => (int) Loan::where('fine_status', 'paid')->sum('fine_paid'),
            'is_filtered_by_year' => $isFiltered,
            'start_year' => $startYear,
            'end_year' => $endYear,
            'filter_label' => $filterLabel,
        ];

        return Inertia::render('reports/accreditation', [
            'booksByCategory' => $booksByCategory,
            'booksByYear' => $booksByYear,
            'recencyStats' => $recencyStats,
            'startYear' => $startYear,
            'endYear' => $endYear,
            'selectedYear' => $selectedYear,
            'availablePublicationYears' => $availablePublicationYears,
            'metrics' => $metrics,
            'setting' => $setting,
        ]);
    }
}
