<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Settings
        $setting = LibrarySetting::current();

        // 2. Akun Kepala Perpustakaan (Satu-satunya akun default dengan email kepala@perpustakaan.sch.id)
        $superAdmin = User::create([
            'name' => 'Dra. Hj. Siti Rahmawati, M.Pd',
            'email' => 'kepala@perpustakaan.sch.id',
            'password' => Hash::make('kepalaperpus12345'),
            'role' => 'super_admin',
            'member_type' => 'staf',
            'identity_number' => '19750814 200003 2 001',
            'phone' => '081234567801',
            'address' => 'Jl. Pendidikan No. 45, Kota Pelajar',
            'class_name' => 'Kepala Perpustakaan',
            'max_loan_limit' => 10,
            'status' => 'active',
        ]);

        // 3. DDC Categories
        $categoriesData = [
            ['code' => '000', 'name' => 'Karya Umum, Komputer & Informasi', 'description' => 'Sistem komputer, pemrograman, ensiklopedia, bibliografi, dan sains informasi.'],
            ['code' => '100', 'name' => 'Filsafat & Psikologi', 'description' => 'Epistemologi, logika, etika, filsafat barat dan timur, psikologi kognitif dan perilaku.'],
            ['code' => '200', 'name' => 'Agama & Teologi', 'description' => 'Studi komparasi agama, sejarah keagamaan, etika moral beragama, dan kitab suci.'],
            ['code' => '300', 'name' => 'Ilmu Sosial, Hukum & Pendidikan', 'description' => 'Sosiologi, ekonomi makro/mikro, hukum nasional, pedagogi, dan tata kelola masyarakat.'],
            ['code' => '400', 'name' => 'Bahasa & Linguistik', 'description' => 'Tata bahasa baku bahasa Indonesia, leksikografi, sintaksis, dan bahasa asing.'],
            ['code' => '500', 'name' => 'Sains Murni & Matematika', 'description' => 'Aljabar, kalkulus, geometri, fisika kuantum, kimia analitik, dan biologi molekuler.'],
            ['code' => '600', 'name' => 'Teknologi & Ilmu Terapan', 'description' => 'Kedokteran, teknik sipil, rekayasa perangkat lunak, robotika, dan agrikultur.'],
            ['code' => '700', 'name' => 'Kesenian, Arsitektur & Olahraga', 'description' => 'Desain grafis, musik tradisional, fotografi, olahraga prestasi, dan sejarah seni rupa.'],
            ['code' => '800', 'name' => 'Kesusastraan & Novel', 'description' => 'Sastra Indonesia klasik dan kontemporer, puisi, antologi cerpen, dan novel dunia.'],
            ['code' => '900', 'name' => 'Sejarah, Biografi & Geografi', 'description' => 'Kronik sejarah nasional Indonesia, geopolitik dunia, atlas nusantara, dan biografi tokoh.'],
        ];

        $categoryModels = [];
        foreach ($categoriesData as $c) {
            $categoryModels[$c['code']] = Category::create($c);
        }

        // 4. Books and Physical Copies (Koleksi Perpustakaan dengan rentang tahun terbit 1980 - 2022)
        $booksData = [
            [
                'title' => 'Laskar Pelangi',
                'author' => 'Andrea Hirata',
                'publisher' => 'Bentang Pustaka',
                'publication_year' => 2005,
                'isbn' => '978-979-3062-79-2',
                'ddc_code' => '899.221',
                'category_id' => $categoryModels['800']->id,
                'rack_location' => 'Rak Sastra F-01 (Lt. 1)',
                'synopsis' => 'Kisah perjuangan sepuluh anak di Belitung Timur yang menempuh pendidikan di sekolah sederhana Muhammadiyah dengan segala keterbatasan namun penuh harapan dan ketulusan.',
                'cover_image' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Sepuluh Murid Baru\nBab 2: Antediluvium\nBab 3: Inisiasi Sahabat\nBab 4: Penjelajah Pasir Putih\nBab 5: Bintang Menari di Langit Belitong\nBab 6: Cita-cita dan Janji Masa Depan",
                'copies' => [
                    ['barcode' => 'BK-899-00101', 'call_number' => '899.221 HIR l k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-899-00102', 'call_number' => '899.221 HIR l k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-899-00103', 'call_number' => '899.221 HIR l k.3', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Bumi Manusia (Tetralogi Buru)',
                'author' => 'Pramoedya Ananta Toer',
                'publisher' => 'Hasta Mitra / Lentera Dipantara',
                'publication_year' => 1980,
                'isbn' => '978-979-97312-3-4',
                'ddc_code' => '899.221',
                'category_id' => $categoryModels['800']->id,
                'rack_location' => 'Rak Sastra F-02 (Lt. 1)',
                'synopsis' => 'Karya agung sastra Indonesia yang memotret kebangkitan kesadaran nasional pada awal abad ke-20 melalui kisah Minke, pemuda pribumi terpelajar di tengah hegemoni kolonial.',
                'cover_image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bagian Satu: Wonokromo\nBagian Dua: Pertemuan dengan Annelies Mellema\nBagian Tiga: Suara Hati Nyai Ontosoroh\nBagian Empat: Pengadilan Kulit Putih\nBagian Lima: Harga Diri Pribumi Terpelajar",
                'copies' => [
                    ['barcode' => 'BK-899-00201', 'call_number' => '899.221 TOE b k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-899-00202', 'call_number' => '899.221 TOE b k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Kalkulus dan Geometri Analitis Jilid 1 (Edisi 9)',
                'author' => 'Edwin J. Purcell & Dale Varberg',
                'publisher' => 'Penerbit Erlangga',
                'publication_year' => 2018,
                'isbn' => '978-979-741-998-1',
                'ddc_code' => '515',
                'category_id' => $categoryModels['500']->id,
                'rack_location' => 'Rak Matematika S-03 (Lt. 2)',
                'synopsis' => 'Buku teks standar rujukan internasional untuk pemahaman konsep limit, diferensial, turunan fungsi, integral tentu dan tak tentu, serta terapannya dalam pemodelan geometri.',
                'cover_image' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 0: Persiapan Awal Sistem Bilangan Riil\nBab 1: Limit dan Kontinuitas Fungsi\nBab 2: Turunan dan Diferensial\nBab 3: Aplikasi Turunan pada Nilai Ekstrem\nBab 4: Teorema Dasar Kalkulus dan Integral Tentu",
                'copies' => [
                    ['barcode' => 'BK-515-00301', 'call_number' => '515 PUR k k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-515-00302', 'call_number' => '515 PUR k k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-515-00303', 'call_number' => '515 PUR k k.3', 'condition' => 'rusak_ringan', 'status' => 'pemeliharaan'],
                ],
            ],
            [
                'title' => 'Fisika Dasar untuk Sains dan Teknik: Mekanika & Termodinamika',
                'author' => 'David Halliday & Robert Resnick',
                'publisher' => 'Penerbit Erlangga',
                'publication_year' => 2019,
                'isbn' => '978-979-099-123-0',
                'ddc_code' => '530',
                'category_id' => $categoryModels['500']->id,
                'rack_location' => 'Rak Fisika S-04 (Lt. 2)',
                'synopsis' => 'Panduan komprehensif mekanika gerak Newton, dinamika fluida, getaran harmonik, gelombang bunyi, dan hukum termodinamika disertai contoh analisis vektor dan eksperimen laboratorium.',
                'cover_image' => 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Pengukuran Satuan Standar SI\nBab 2: Vektor dan Gerak Lurus\nBab 3: Dinamika Newton dan Gaya Gravitasi\nBab 4: Energi Kinetik dan Usaha Mekanik\nBab 5: Teori Kinetik Gas dan Hukum Termodinamika",
                'copies' => [
                    ['barcode' => 'BK-530-00401', 'call_number' => '530 HAL f k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-530-00402', 'call_number' => '530 HAL f k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Struktur Data dan Algoritma Modern dengan TypeScript',
                'author' => 'Dr. Rinaldi Munir, M.T.',
                'publisher' => 'Informatika Bandung',
                'publication_year' => 2021,
                'isbn' => '978-602-8758-45-1',
                'ddc_code' => '005.1',
                'category_id' => $categoryModels['000']->id,
                'rack_location' => 'Rak Komputer T-02 (Lt. 2)',
                'synopsis' => 'Eksplorasi mendalam struktur data pohon biner, graf berbobot, hash table, algoritma greedy, dynamic programming, dan analisis kompleksitas Big-O dengan contoh implementasi praktis.',
                'cover_image' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Notasi Asimtotik dan Efisiensi Algoritma\nBab 2: Linked List, Stack, dan Queue\nBab 3: Binary Search Tree dan Red-Black Tree\nBab 4: Algoritma Pencarian Graf BFS & DFS\nBab 5: Pemrograman Dinamis dan Paradigma Greedy",
                'copies' => [
                    ['barcode' => 'BK-005-00501', 'call_number' => '005.1 MUN s k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-005-00502', 'call_number' => '005.1 MUN s k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Filosofi Teras: Panduan Stoikisme Generasi Mental Tangguh',
                'author' => 'Henry Manampiring',
                'publisher' => 'Penerbit Buku Kompas',
                'publication_year' => 2018,
                'isbn' => '978-602-412-518-9',
                'ddc_code' => '188',
                'category_id' => $categoryModels['100']->id,
                'rack_location' => 'Rak Filsafat P-01 (Lt. 1)',
                'synopsis' => 'Adaptasi filsafat Stoa Yunani Kuno karya Seneca, Epictetus, dan Marcus Aurelius yang relevan untuk mengatasi cemas, emosi negatif, dan membangun ketahanan mental generasi masa kini.',
                'cover_image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Survei Khawatir Nasional\nBab 2: Dikotomi Kendali: Internal vs Eksternal\nBab 3: Bintang Bimbingan Stoikisme\nBab 4: Mengelola Amarah dan Kritik\nBab 5: Menghadapi Duka dan Kegagalan",
                'copies' => [
                    ['barcode' => 'BK-188-00601', 'call_number' => '188 MAN f k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Tata Bahasa Baku Bahasa Indonesia (Edisi IV)',
                'author' => 'Badan Pengembangan dan Pembinaan Bahasa Kemdikbudristek',
                'publisher' => 'Balai Pustaka',
                'publication_year' => 2019,
                'isbn' => '978-979-069-321-4',
                'ddc_code' => '415',
                'category_id' => $categoryModels['400']->id,
                'rack_location' => 'Rak Bahasa B-01 (Lt. 1)',
                'synopsis' => 'Pedoman terlengkap deskripsi ilmiah struktur fonologi, morfologi, pembentukan kata dasar dan berimbuhan, sintaksis klausa, serta semantik kalimat dalam bahasa Indonesia formal.',
                'cover_image' => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Kedudukan dan Fungsi Bahasa Indonesia\nBab 2: Sistem Ejaan dan Fonologi\nBab 3: Morfologi dan Bentuk Kata Berimbuhan\nBab 4: Sintaksis Frasa, Klausa, dan Kalimat Efektif\nBab 5: Ragam Bahasa Ilmiah dan Kedinasan",
                'copies' => [
                    ['barcode' => 'BK-415-00701', 'call_number' => '415 BPP t k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-415-00702', 'call_number' => '415 BPP t k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Pengantar Teori Ekonomi: Mikro & Makro Kontemporer',
                'author' => 'Prof. Sadono Sukirno',
                'publisher' => 'Rajawali Pers',
                'publication_year' => 2020,
                'isbn' => '978-979-769-345-9',
                'ddc_code' => '330',
                'category_id' => $categoryModels['300']->id,
                'rack_location' => 'Rak Sosial E-02 (Lt. 1)',
                'synopsis' => 'Pengantar esensial mekanisme pasar bebas, elastisitas permintaan dan penawaran, struktur pasar monopoli vs persaingan sempurna, pendapatan nasional, inflasi, dan kebijakan fiskal.',
                'cover_image' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Bidang Studi dan Masalah Pokok Ekonomi\nBab 2: Teori Permintaan, Penawaran, dan Keseimbangan Pasar\nBab 3: Teori Tingkah Laku Konsumen\nBab 4: Perhitungan Pendapatan Nasional\nBab 5: Kebijakan Moneter dan Pengendalian Inflasi",
                'copies' => [
                    ['barcode' => 'BK-330-00801', 'call_number' => '330 SUK p k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-330-00802', 'call_number' => '330 SUK p k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Sejarah Nasional Indonesia: Zaman Praaksara hingga Era Kemerdekaan',
                'author' => 'Marwati Djoened Poesponegoro & Nugroho Notosusanto',
                'publisher' => 'Balai Pustaka',
                'publication_year' => 2017,
                'isbn' => '978-979-407-407-7',
                'ddc_code' => '959.8',
                'category_id' => $categoryModels['900']->id,
                'rack_location' => 'Rak Sejarah H-01 (Lt. 2)',
                'synopsis' => 'Rekonstruksi kronologis perjalanan kepulauan Nusantara, kerajaan maritim Sriwijaya dan Majapahit, perlawanan terhadap kolonialisme VOC, hingga proklamasi kemerdekaan 1945.',
                'cover_image' => 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Jilid I: Zaman Prasejarah di Indonesia\nJilid II: Zaman Kuno dan Kerajaan Hindu-Buddha\nJilid III: Masuknya Islam dan Kerajaan Maritim\nJilid IV: Penetrasi Kolonial Barat\nJilid V: Pergerakan Nasional dan Lahirnya Republik",
                'copies' => [
                    ['barcode' => 'BK-959-00901', 'call_number' => '959.8 POE s k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-959-00902', 'call_number' => '959.8 POE s k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
            [
                'title' => 'Sains Lingkungan dan Konservasi Keanekaragaman Hayati',
                'author' => 'Prof. Dr. Emil Salim',
                'publisher' => 'Gramedia Pustaka Utama',
                'publication_year' => 2022,
                'isbn' => '978-602-06-5432-1',
                'ddc_code' => '577',
                'category_id' => $categoryModels['500']->id,
                'rack_location' => 'Rak Biologi S-05 (Lt. 2)',
                'synopsis' => 'Kajian strategis ekosistem hutan tropis Indonesia, mitigasi krisis iklim, pelestarian satwa endemik, serta paradigma pembangunan berkelanjutan menuju transisi energi hijau.',
                'cover_image' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
                'table_of_contents' => "Bab 1: Biosfer dan Keseimbangan Ekologis\nBab 2: Kekayaan Endemik Wallacea dan Sundaland\nBab 3: Dampak Antropogenik Deforestasi\nBab 4: Diplomasi Iklim dan Karbon Biru\nBab 5: Aksi Restorasi Berbasis Komunitas Lokal",
                'copies' => [
                    ['barcode' => 'BK-577-01001', 'call_number' => '577 SAL s k.1', 'condition' => 'baik', 'status' => 'tersedia'],
                    ['barcode' => 'BK-577-01002', 'call_number' => '577 SAL s k.2', 'condition' => 'baik', 'status' => 'tersedia'],
                ],
            ],
        ];

        foreach ($booksData as $bData) {
            $copies = $bData['copies'];
            unset($bData['copies']);

            $book = Book::create($bData);

            foreach ($copies as $c) {
                BookCopy::create([
                    'book_id' => $book->id,
                    'barcode' => $c['barcode'],
                    'call_number' => $c['call_number'],
                    'condition' => $c['condition'],
                    'status' => $c['status'],
                ]);
            }

            $book->syncCopiesCount();
        }
    }
}
