<?php

namespace App\Http\Controllers;

use App\Models\BookSuggestion;
use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Tampilan Konfigurasi Kebijakan Perpustakaan (Super Admin / Kepala Perpustakaan).
     */
    public function index(): Response
    {
        $setting = LibrarySetting::current();
        $staffMembers = User::whereIn('role', ['super_admin', 'petugas'])->get();
        $suggestions = BookSuggestion::with('user')->latest()->get();

        return Inertia::render('settings/index', [
            'setting' => $setting,
            'staffMembers' => $staffMembers,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Simpan Perubahan Kebijakan Durasi Pinjam, Tarif Denda, Data Institusi & Logo.
     */
    public function update(Request $request): RedirectResponse
    {
        $setting = LibrarySetting::current();

        $validated = $request->validate([
            'loan_duration_days' => 'required|integer|min:1|max:60',
            'daily_fine_rate' => 'required|integer|min:0|max:100000',
            'max_loan_siswa' => 'required|integer|min:1|max:20',
            'max_loan_guru' => 'required|integer|min:1|max:30',
            'max_renewal_count' => 'required|integer|min:0|max:5',
            'library_name' => 'required|string|max:255',
            'institution_name' => 'required|string|max:255',
            'head_librarian_name' => 'required|string|max:255',
            'head_librarian_nip' => 'required|string|max:100',
            'opening_hours' => 'required|string|max:255',
            'rules_text' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'remove_logo' => 'nullable|boolean',
        ], [
            'logo.image' => 'Berkas logo harus berupa gambar yang valid.',
            'logo.mimes' => 'Format logo yang didukung adalah JPEG, PNG, JPG, GIF, SVG, atau WEBP.',
            'logo.max' => 'Ukuran berkas logo maksimal adalah 2MB.',
        ]);

        if ($request->boolean('remove_logo')) {
            if ($setting->logo_path && Storage::disk('public')->exists($setting->logo_path)) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $setting->logo_path = null;
        } elseif ($request->hasFile('logo')) {
            if ($setting->logo_path && Storage::disk('public')->exists($setting->logo_path)) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $setting->logo_path = $path;
        }

        $setting->fill([
            'loan_duration_days' => $validated['loan_duration_days'],
            'daily_fine_rate' => $validated['daily_fine_rate'],
            'max_loan_siswa' => $validated['max_loan_siswa'],
            'max_loan_guru' => $validated['max_loan_guru'],
            'max_renewal_count' => $validated['max_renewal_count'],
            'library_name' => $validated['library_name'],
            'institution_name' => $validated['institution_name'],
            'head_librarian_name' => $validated['head_librarian_name'],
            'head_librarian_nip' => $validated['head_librarian_nip'],
            'opening_hours' => $validated['opening_hours'],
            'rules_text' => $validated['rules_text'] ?? null,
        ]);

        $setting->save();

        return back()->with('success', 'Konfigurasi kebijakan tarif denda, data institusi, dan logo perpustakaan berhasil diperbarui.');
    }

    /**
     * Tambah Akun Petugas / Pustakawan Baru (Super Admin).
     */
    public function storeStaff(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:super_admin,petugas',
            'identity_number' => 'required|string|unique:users,identity_number',
            'phone' => 'nullable|string|max:50',
            'class_name' => 'nullable|string|max:100', // Jabatan / Posisi staf
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'role' => $validated['role'],
            'member_type' => 'staf',
            'identity_number' => $validated['identity_number'],
            'phone' => $validated['phone'] ?? null,
            'class_name' => $validated['class_name'] ?? 'Petugas Perpustakaan',
            'max_loan_limit' => 5,
            'status' => 'active',
        ]);

        return back()->with('success', "Akun staf {$validated['name']} berhasil dibuat.");
    }

    /**
     * Putusan Usulan Buku Baru (Setujui / Tolak).
     */
    public function updateSuggestion(Request $request, int $id): RedirectResponse
    {
        $suggestion = BookSuggestion::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:500',
        ]);

        $suggestion->update($validated);

        $statusLabel = $validated['status'] === 'approved' ? 'disetujui' : 'ditolak';

        return back()->with('success', "Usulan buku '{$suggestion->title}' telah {$statusLabel}.");
    }
}
