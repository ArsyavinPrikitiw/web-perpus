<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilkan Halaman Login Resmi.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect($targetUrl);
        }

        $setting = LibrarySetting::current();

        return Inertia::render('auth/login', [
            'setting' => $setting,
        ]);
    }

    /**
     * Tampilkan Halaman Pendaftaran Akun Baru (Siswa, Guru, dan Petugas).
     */
    public function showRegister(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect($targetUrl);
        }

        $setting = LibrarySetting::current();

        return Inertia::render('auth/register', [
            'setting' => $setting,
        ]);
    }

    /**
     * Proses Pendaftaran Mandiri Akun Baru Menggunakan Email (Siswa, Guru, dan Petugas).
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'member_type' => 'required|string|in:siswa,guru,petugas',
            'identity_number' => 'nullable|string|max:50|unique:users,identity_number',
            'class_name' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'member_type.required' => 'Pilih peran / jenis akun (Siswa, Guru, atau Petugas).',
            'member_type.in' => 'Pilihan peran tidak valid.',
            'identity_number.unique' => 'Nomor identitas tersebut sudah terdaftar dalam sistem.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email tersebut sudah digunakan oleh akun lain.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $setting = LibrarySetting::current();
        $type = $validated['member_type'];
        $isPetugas = $type === 'petugas';

        $role = $isPetugas ? 'petugas' : 'anggota';
        $memberType = $isPetugas ? 'staf' : $type;

        $maxLoanLimit = match ($type) {
            'petugas' => 5,
            'guru' => $setting->max_loan_guru ?? 5,
            default => $setting->max_loan_siswa ?? 3,
        };

        $identityNumber = ! empty($validated['identity_number'])
            ? strtoupper(trim($validated['identity_number']))
            : $this->generateUniqueIdentity($type);

        $className = match ($type) {
            'siswa' => ! empty($validated['class_name']) ? trim($validated['class_name']) : null,
            'petugas' => 'Petugas Perpustakaan',
            default => null,
        };

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
            'role' => $role,
            'member_type' => $memberType,
            'identity_number' => $identityNumber,
            'class_name' => $className,
            'phone' => ! empty($validated['phone']) ? trim($validated['phone']) : null,
            'max_loan_limit' => $maxLoanLimit,
            'status' => 'active',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        $roleLabel = match ($role) {
            'petugas' => 'Petugas Perpustakaan',
            default => 'Anggota ('.ucfirst($memberType).')',
        };

        $targetUrl = match ($role) {
            'petugas' => route('circulation.index'),
            default => route('loans.my_loans'),
        };

        return redirect($targetUrl)->with('success', "Pendaftaran berhasil! Selamat datang, {$user->name}. Akun {$roleLabel} Anda telah aktif.");
    }

    /**
     * Proses Login Pengguna Menggunakan Email Resmi atau Identitas Terdaftar.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required_without:identity|nullable|string',
            'identity' => 'nullable|string',
            'password' => 'required|string',
        ], [
            'email.required_without' => 'Alamat email wajib diisi.',
            'identity.required' => 'Masukkan alamat email.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $identifier = trim((string) $request->input('email', $request->input('identity')));
        $password = (string) $request->input('password');
        $remember = $request->boolean('remember');

        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'identity_number';

        if (Auth::attempt([$field => $identifier, 'password' => $password], $remember)) {
            $request->session()->regenerate();
            $user = Auth::user();

            $roleLabel = match ($user->role) {
                'super_admin' => 'Kepala Perpustakaan',
                'petugas' => 'Petugas Perpustakaan',
                'anggota' => 'Anggota ('.ucfirst($user->member_type).')',
                default => 'Pengguna',
            };

            $targetUrl = match ($user->role) {
                'super_admin' => route('reports.index'),
                'petugas' => route('circulation.index'),
                default => route('loans.my_loans'),
            };

            return redirect()->intended($targetUrl)->with('success', "Selamat datang, {$user->name}! Masuk sebagai {$roleLabel}.");
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi tidak cocok.',
            'identity' => 'Email atau kata sandi tidak cocok.',
        ])->withInput($request->only('email', 'identity', 'remember'));
    }

    /**
     * Switch demo user role for testing and review (fallback graceful).
     */
    public function switchRole(Request $request, string $role): RedirectResponse
    {
        $targetUser = match ($role) {
            'super_admin' => User::where('role', 'super_admin')->first(),
            'petugas' => User::where('role', 'petugas')->first(),
            'siswa', 'anggota' => User::where('role', 'anggota')->where('member_type', 'siswa')->first(),
            'guru' => User::where('role', 'anggota')->where('member_type', 'guru')->first(),
            default => null,
        };

        if ($targetUser) {
            Auth::login($targetUser);
            $roleLabel = match ($targetUser->role) {
                'super_admin' => 'Kepala Perpustakaan',
                'petugas' => 'Petugas Perpustakaan',
                'anggota' => 'Anggota ('.ucfirst($targetUser->member_type).')',
                default => $targetUser->role,
            };

            return back()->with('success', "Beralih akun aktif sebagai: {$targetUser->name} [{$roleLabel}]");
        }

        return back()->with('error', 'Akun untuk peran tersebut belum tersedia. Silakan gunakan menu daftar akun baru.');
    }

    /**
     * Log out current session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('info', 'Anda telah berhasil keluar.');
    }

    /**
     * Generate unique identity number if not provided.
     */
    private function generateUniqueIdentity(string $type): string
    {
        $prefix = match ($type) {
            'petugas' => 'PET',
            'guru' => 'GUR',
            default => 'SIS',
        };

        $year = date('Y');

        do {
            $code = "{$prefix}-{$year}-".str_pad((string) mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (User::where('identity_number', $code)->exists());

        return $code;
    }
}
