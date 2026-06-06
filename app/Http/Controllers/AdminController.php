<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    use LogsActivity;

    public function userIndex()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::latest()->get()
        ]);
    }

    public function userStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,sales,export_staff,export_manager,finance,forwarder',
            'is_active' => 'required|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'],
        ]);

        $this->logAudit('CREATE_USER', 'User', $user->id, [
            'target_user_email' => $user->email,
            'target_user_role' => $user->role,
            'detail' => 'User baru ' . $user->name . ' (' . $user->role . ') didaftarkan oleh Admin.',
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function userUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,sales,export_staff,export_manager,finance,forwarder',
            'is_active' => 'required|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        $this->logAudit('UPDATE_USER', 'User', $user->id, [
            'target_user_email' => $user->email,
            'target_user_role' => $user->role,
            'detail' => 'User ' . $user->name . ' diperbarui oleh Admin.',
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function userToggleActive(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Anda tidak bisa menonaktifkan akun Anda sendiri.']);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        $this->logAudit('TOGGLE_USER_STATUS', 'User', $user->id, [
            'target_user_email' => $user->email,
            'is_active' => $user->is_active,
            'detail' => 'Status user ' . $user->name . ' diubah menjadi ' . $status . ' oleh Admin.',
        ]);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    public function auditLogs(Request $request)
    {
        $query = AuditLog::with('user');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $query->latest()->get(),
            'users' => User::select('id', 'name', 'role')->get(),
            'filters' => $request->only(['user_id', 'action', 'start_date', 'end_date'])
        ]);
    }
}
