<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class GuideVerificationController extends Controller
{
    public function index(): View
    {
        $documents = VerificationDocument::query()->with(['user', 'reviewer'])->latest()->paginate(20);
        return view('dashboard', ['verificationDocuments' => $documents]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.guide-verifications.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('admin.guide-verifications.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(VerificationDocument $verificationDocument): View
    {
        return view('dashboard', ['verificationDocument' => $verificationDocument->load(['user', 'reviewer'])]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VerificationDocument $verificationDocument): RedirectResponse
    {
        return redirect()->route('admin.guide-verifications.show', $verificationDocument);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VerificationDocument $verificationDocument): RedirectResponse
    {
        $payload = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        $payload['reviewed_by'] = $request->user()->id;
        $payload['reviewed_at'] = now();

        $verificationDocument->update($payload);
        if ($verificationDocument->user) {
            $verificationDocument->user->update([
                'guide_verification_status' => $payload['status'],
                'guide_verified_at' => $payload['status'] === 'approved' ? now() : null,
            ]);
        }

        return back()->with('status', 'Guide verification updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VerificationDocument $verificationDocument): RedirectResponse
    {
        $verificationDocument->delete();
        return back()->with('status', 'Verification document removed.');
    }
}
