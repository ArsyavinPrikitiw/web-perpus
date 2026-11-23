<?php

use App\Models\LibrarySetting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    Storage::fake('public');
});

test('head librarian (super admin) can access settings page', function () {
    $headLibrarian = User::where('role', 'super_admin')->first();
    $this->actingAs($headLibrarian);

    $response = $this->get('/pengaturan');
    $response->assertStatus(200);
});

test('non super admin cannot update library settings', function () {
    $student = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $this->actingAs($student);

    $response = $this->put('/pengaturan', [
        'library_name' => 'Perpustakaan Ilegal',
    ]);

    $response->assertRedirect('/peminjaman-saya');
    $response->assertSessionHas('error');
});

test('head librarian can upload and change library logo', function () {
    $headLibrarian = User::where('role', 'super_admin')->first();
    $this->actingAs($headLibrarian);

    $file = UploadedFile::fake()->image('custom_logo.png', 200, 200);

    $response = $this->post('/pengaturan', [
        'loan_duration_days' => 7,
        'daily_fine_rate' => 1000,
        'max_loan_siswa' => 3,
        'max_loan_guru' => 5,
        'max_renewal_count' => 1,
        'library_name' => 'Perpustakaan Cendekia Nusantara',
        'institution_name' => 'SMA Negeri 1 Prestasi Bangsa',
        'head_librarian_name' => 'Dra. Hj. Siti Rahmawati, M.Pd',
        'head_librarian_nip' => '19750814 200003 2 001',
        'opening_hours' => 'Senin - Jumat: 07.30 - 16.00 WIB',
        'rules_text' => 'Tata tertib perpustakaan.',
        'logo' => $file,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $setting = LibrarySetting::current()->fresh();
    expect($setting->logo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($setting->logo_path);
    expect($setting->logo_url)->not->toBeNull()
        ->and($setting->logo_url)->toContain('storage/'.$setting->logo_path);
});

test('head librarian can remove library logo to revert to default', function () {
    $headLibrarian = User::where('role', 'super_admin')->first();
    $this->actingAs($headLibrarian);

    // Initial logo
    $file = UploadedFile::fake()->image('initial_logo.png', 100, 100);
    $path = $file->store('logos', 'public');
    $setting = LibrarySetting::current();
    $setting->update(['logo_path' => $path]);

    Storage::disk('public')->assertExists($path);

    // Remove logo
    $response = $this->post('/pengaturan', [
        'loan_duration_days' => 7,
        'daily_fine_rate' => 1000,
        'max_loan_siswa' => 3,
        'max_loan_guru' => 5,
        'max_renewal_count' => 1,
        'library_name' => 'Perpustakaan Cendekia Nusantara',
        'institution_name' => 'SMA Negeri 1 Prestasi Bangsa',
        'head_librarian_name' => 'Dra. Hj. Siti Rahmawati, M.Pd',
        'head_librarian_nip' => '19750814 200003 2 001',
        'opening_hours' => 'Senin - Jumat: 07.30 - 16.00 WIB',
        'remove_logo' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $freshSetting = $setting->fresh();
    expect($freshSetting->logo_path)->toBeNull();
    expect($freshSetting->logo_url)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('logo upload validation rejects non image files and large files', function () {
    $headLibrarian = User::where('role', 'super_admin')->first();
    $this->actingAs($headLibrarian);

    $badFile = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

    $response = $this->post('/pengaturan', [
        'loan_duration_days' => 7,
        'daily_fine_rate' => 1000,
        'max_loan_siswa' => 3,
        'max_loan_guru' => 5,
        'max_renewal_count' => 1,
        'library_name' => 'Perpustakaan Cendekia Nusantara',
        'institution_name' => 'SMA Negeri 1 Prestasi Bangsa',
        'head_librarian_name' => 'Dra. Hj. Siti Rahmawati, M.Pd',
        'head_librarian_nip' => '19750814 200003 2 001',
        'opening_hours' => 'Senin - Jumat: 07.30 - 16.00 WIB',
        'logo' => $badFile,
    ]);

    $response->assertSessionHasErrors('logo');
});

test('dark mode theme cookie is preserved and renders dark class in html', function () {
    // Request with dark mode cookie
    $responseWithDark = $this->withUnencryptedCookies(['theme' => 'dark'])->get('/');
    $responseWithDark->assertStatus(200);
    $responseWithDark->assertSee('class="dark"', false);

    // Request with light mode cookie
    $responseWithLight = $this->withUnencryptedCookies(['theme' => 'light'])->get('/');
    $responseWithLight->assertStatus(200);
    $responseWithLight->assertDontSee('class="dark"', false);

    // When visiting login page with dark theme cookie, dark mode class is active
    $loginResponse = $this->withUnencryptedCookies(['theme' => 'dark'])->get('/login');
    $loginResponse->assertStatus(200);
    $loginResponse->assertSee('class="dark"', false);
});
