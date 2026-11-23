<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('super admin can access reports dashboard with book publication year separation', function () {
    $superAdmin = User::where('role', 'super_admin')->first();
    $this->actingAs($superAdmin);

    $response = $this->get('/laporan');
    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('reports/index')
        ->has('booksByYear')
        ->has('availablePublicationYears')
        ->has('recencyMetrics')
        ->where('startYear', null)
        ->where('endYear', null)
        ->where('selectedYear', null)
        ->where('yearSpecificStats', null)
    );
});

test('reports dashboard can be filtered by year range (dari tahun ke tahun)', function () {
    $superAdmin = User::where('role', 'super_admin')->first();
    $this->actingAs($superAdmin);

    // Range 1996 - 2020 should include 7 books (2005, 2017, 2018x2, 2019x2, 2020) and exclude 1980, 2021, 2022
    $response = $this->get('/laporan?start_year=1996&end_year=2020');
    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('reports/index')
        ->where('startYear', 1996)
        ->where('endYear', 2020)
        ->has('yearSpecificStats')
        ->where('yearSpecificStats.titles_count', 7)
        ->where('popularBooks', fn ($books) => collect($books)->every(fn ($b) => $b['publication_year'] >= 1996 && $b['publication_year'] <= 2020))
    );
});

test('reports dashboard can be filtered by specific single publication year', function () {
    $superAdmin = User::where('role', 'super_admin')->first();
    $this->actingAs($superAdmin);

    $response = $this->get('/laporan?publication_year=2018');
    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('reports/index')
        ->where('selectedYear', 2018)
        ->has('yearSpecificStats')
        ->where('yearSpecificStats.year', 2018)
        ->where('yearSpecificStats.titles_count', 2)
        ->where('popularBooks', fn ($books) => collect($books)->every(fn ($b) => $b['publication_year'] === 2018))
    );
});

test('accreditation report includes collection breakdown and year range filtering', function () {
    $superAdmin = User::where('role', 'super_admin')->first();
    $this->actingAs($superAdmin);

    $response = $this->get('/laporan/akreditasi?start_year=1996&end_year=2020');
    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('reports/accreditation')
        ->has('booksByYear')
        ->has('recencyStats')
        ->has('availablePublicationYears')
        ->where('startYear', 1996)
        ->where('endYear', 2020)
        ->where('metrics.total_titles', 7)
    );
});

test('book management index can be filtered by publication year', function () {
    $librarian = User::factory()->create(['role' => 'petugas', 'member_type' => 'staf']);
    $this->actingAs($librarian);

    $response = $this->get('/kelola-buku?publication_year=2005');
    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('books/index')
        ->where('filters.publication_year', '2005')
        ->where('books.data.0.publication_year', 2005)
    );
});

test('regular member cannot access reports dashboard', function () {
    $member = User::factory()->create(['role' => 'anggota', 'member_type' => 'siswa']);
    $this->actingAs($member);

    $response = $this->get('/laporan');
    $response->assertRedirect('/peminjaman-saya');

    $jsonResponse = $this->getJson('/laporan');
    $jsonResponse->assertStatus(403);
});
