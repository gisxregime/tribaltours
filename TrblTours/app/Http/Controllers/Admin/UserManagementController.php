<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class UserManagementController extends Controller
{
    public function index(): View
    {
        $users = User::query()->latest()->paginate(30);
        return view('dashboard', ['users' => $users]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.users.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.users.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): View
    {
        return view('dashboard', ['managedUser' => $user]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): RedirectResponse
    {
        return redirect()->route('admin.users.show', $user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:tourist,guide,admin'],
            'guide_verification_status' => ['nullable', 'in:pending,approved,rejected'],
            'is_profile_completed' => ['nullable', 'boolean'],
        ]);

        $user->update($payload);

        return back()->with('status', 'User updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();
        return back()->with('status', 'User deleted.');
    }
}
