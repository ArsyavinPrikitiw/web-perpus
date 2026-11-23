<?php

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Loan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('opac catalog page can be rendered for guest', function () {
    $response = $this->get('/katalog');
    $response->assertStatus(200);
});

test('opac book detail page can be rendered', function () {
    $book = Book::first();
    $response = $this->get("/katalog/buku/{$book->id}");
    $response->assertStatus(200);
});

test('login page can be rendered', function () {
    $response = $this->get('/login');
    $response->assertStatus(200);
});

test('kepala perpustakaan can log in using dummy email kepala@perpustakaan.sch.id and password kepalaperpus12345', function () {
    $response = $this->post('/login', [
        'email' => 'kepala@perpustakaan.sch.id',
        'password' => 'kepalaperpus12345',
    ]);

    $response->assertRedirect('/laporan');
    $this->assertAuthenticated();
});

test('user can log in using email and password', function () {
    $user = User::factory()->create([
        'email' => 'siswa@sekolah.sch.id',
        'password' => Hash::make('secret123'),
        'role' => 'anggota',
        'member_type' => 'siswa',
    ]);

    $response = $this->post('/login', [
        'email' => 'siswa@sekolah.sch.id',
        'password' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();
});

test('login fails with invalid credentials', function () {
    $response = $this->post('/login', [
        'email' => 'kepala@perpustakaan.sch.id',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('registration page can be rendered for guest', function () {
    $response = $this->get('/daftar');
    $response->assertStatus(200);
});

test('student can register self successfully with email, name, and password', function () {
    $response = $this->post('/daftar', [
        'name' => 'Fajar Nugraha',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-2024-999',
        'class_name' => 'PPLG 1',
        'email' => 'fajar@siswa.sch.id',
        'phone' => '081299998888',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();

    $user = User::where('email', 'fajar@siswa.sch.id')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Fajar Nugraha')
        ->and($user->role)->toBe('anggota')
        ->and($user->member_type)->toBe('siswa')
        ->and($user->class_name)->toBe('PPLG 1')
        ->and($user->max_loan_limit)->toBe(3);
});

test('teacher can register self successfully with email, name, and password', function () {
    $response = $this->post('/daftar', [
        'name' => 'Dra. Endang Lestari',
        'member_type' => 'guru',
        'identity_number' => 'NIP-198005052005012001',
        'email' => 'endang@guru.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $this->assertAuthenticated();

    $user = User::where('email', 'endang@guru.sch.id')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('anggota')
        ->and($user->member_type)->toBe('guru')
        ->and($user->max_loan_limit)->toBe(5);
});

test('petugas can register self successfully with email, name, and password', function () {
    $response = $this->post('/daftar', [
        'name' => 'Rahmat Hidayat, S.I.Pust',
        'member_type' => 'petugas',
        'identity_number' => 'PET-2026-001',
        'email' => 'rahmat.petugas@perpustakaan.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/sirkulasi');
    $this->assertAuthenticated();

    $user = User::where('email', 'rahmat.petugas@perpustakaan.sch.id')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe('petugas')
        ->and($user->member_type)->toBe('staf');
});

test('registration generates fallback identity number if left empty', function () {
    $response = $this->post('/daftar', [
        'name' => 'Siswa Tanpa NIS',
        'member_type' => 'siswa',
        'class_name' => 'XI MIPA 2',
        'email' => 'tanpanis@siswa.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $user = User::where('email', 'tanpanis@siswa.sch.id')->first();
    expect($user)->not->toBeNull()
        ->and($user->identity_number)->toStartWith('SIS-');
});

test('registration fails if email already exists', function () {
    $response = $this->post('/daftar', [
        'name' => 'Duplikat Kepala',
        'member_type' => 'siswa',
        'email' => 'kepala@perpustakaan.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('registration fails if password confirmation does not match', function () {
    $response = $this->post('/daftar', [
        'name' => 'Password Beda',
        'member_type' => 'siswa',
        'email' => 'beda@siswa.sch.id',
        'password' => 'secret123',
        'password_confirmation' => 'secret999',
    ]);

    $response->assertSessionHasErrors('password');
});

test('guest is redirected to login when accessing circulation desk', function () {
    $response = $this->get('/sirkulasi');
    $response->assertRedirect('/login');
});

test('student is forbidden from accessing circulation desk and book management', function () {
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $this->actingAs($student);

    $responseCirculation = $this->get('/sirkulasi');
    $responseCirculation->assertRedirect('/peminjaman-saya');

    $responseBooks = $this->get('/kelola-buku');
    $responseBooks->assertRedirect('/peminjaman-saya');
});

test('student can access my loans dashboard', function () {
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $this->actingAs($student);

    $response = $this->get('/peminjaman-saya');
    $response->assertStatus(200);
});

test('member fast lookup api returns eligibility and active loans for librarian', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $this->actingAs($librarian);

    $user = User::factory()->create([
        'name' => 'Budi Santoso',
        'identity_number' => 'NIS-2026-777',
        'role' => 'anggota',
        'member_type' => 'siswa',
    ]);

    $response = $this->getJson("/sirkulasi/lookup-member?code={$user->identity_number}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'user' => [
                'name' => $user->name,
                'identity_number' => $user->identity_number,
            ],
            'eligibility' => [
                'allowed' => true,
            ],
        ]);
});

test('member with unpaid fines is blocked from borrowing', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $this->actingAs($librarian);

    $user = User::factory()->create([
        'identity_number' => 'NIS-FINE-001',
        'role' => 'anggota',
        'member_type' => 'siswa',
    ]);

    $copy = BookCopy::first();

    Loan::create([
        'loan_code' => 'PJ-TEST-001',
        'user_id' => $user->id,
        'book_copy_id' => $copy->id,
        'librarian_id' => $librarian->id,
        'borrow_date' => Carbon::today()->subDays(10)->toDateString(),
        'due_date' => Carbon::today()->subDays(3)->toDateString(),
        'status' => 'terlambat',
        'fine_amount' => 5000,
        'fine_paid' => 0,
        'fine_status' => 'unpaid',
    ]);

    $response = $this->getJson("/sirkulasi/lookup-member?code={$user->identity_number}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'eligibility' => [
                'allowed' => false,
            ],
        ]);
});

test('fast scan book lookup returns available copy and metadata', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $this->actingAs($librarian);

    $copy = BookCopy::where('status', 'tersedia')->first();

    $response = $this->getJson("/sirkulasi/lookup-book?barcode={$copy->barcode}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'copy' => [
                'barcode' => $copy->barcode,
                'status' => 'tersedia',
            ],
        ]);
});

test('librarian can process new book loan transaction', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $availableCopy = BookCopy::where('status', 'tersedia')->first();

    $this->actingAs($librarian);

    $response = $this->post('/sirkulasi/pinjam', [
        'user_id' => $student->id,
        'book_copy_barcode' => $availableCopy->barcode,
        'notes' => 'Peminjaman tes feature pest',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('loans', [
        'user_id' => $student->id,
        'book_copy_id' => $availableCopy->id,
        'status' => 'dipinjam',
    ]);

    expect($availableCopy->fresh()->status)->toBe('dipinjam');
});

test('returning on-time book closes loan without fine', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $copy = BookCopy::first();
    $copy->update(['status' => 'dipinjam']);

    $activeLoan = Loan::create([
        'loan_code' => 'PJ-ONTIME-001',
        'user_id' => $student->id,
        'book_copy_id' => $copy->id,
        'librarian_id' => $librarian->id,
        'borrow_date' => Carbon::today()->subDays(2)->toDateString(),
        'due_date' => Carbon::today()->addDays(5)->toDateString(),
        'status' => 'dipinjam',
    ]);

    $this->actingAs($librarian);

    $response = $this->post('/sirkulasi/kembali', [
        'barcode_or_id' => $copy->barcode,
        'condition' => 'baik',
        'pay_fine_now' => false,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $updatedLoan = $activeLoan->fresh();
    expect($updatedLoan->status)->toBe('kembali');
    expect($copy->fresh()->status)->toBe('tersedia');
});

test('attendance kiosk check-in records visitor log', function () {
    $student = User::factory()->create([
        'name' => 'Muhammad Rizky Pratama',
        'identity_number' => 'NIS-2024-001',
        'role' => 'anggota',
        'member_type' => 'siswa',
    ]);

    $response = $this->post('/presensi/checkin', [
        'identity_number' => 'NIS-2024-001',
        'purpose' => 'Membaca Buku',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('attendance_logs', [
        'identity_number' => 'NIS-2024-001',
        'visitor_name' => 'Muhammad Rizky Pratama',
        'purpose' => 'Membaca Buku',
    ]);
});

test('clearance eligibility check returns true for student without loans and fines', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $this->actingAs($librarian);

    $cleanStudent = User::factory()->create([
        'role' => 'anggota',
        'member_type' => 'siswa',
        'identity_number' => 'NIS-CLEAN-001',
    ]);

    $response = $this->getJson("/bebas-pustaka/cek-kelayakan?user_id={$cleanStudent->id}");
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'is_clear' => true,
            'active_loans_count' => 0,
            'unpaid_fines' => 0,
        ]);
});

test('user can log out and session is cleared', function () {
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $this->actingAs($student);

    $response = $this->post('/logout');
    $response->assertRedirect('/login');

    $this->assertGuest();
});
