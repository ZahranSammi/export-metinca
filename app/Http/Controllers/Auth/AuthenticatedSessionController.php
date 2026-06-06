<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        if (!Auth::user()->is_active) {
            Auth::guard('web')->logout();
            return redirect()->back()->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan. Hubungi admin.',
            ]);
        }

        $request->session()->regenerate();

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'LOGIN',
            'payload' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if (Auth::check()) {
            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'LOGOUT',
                'payload' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            ]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
