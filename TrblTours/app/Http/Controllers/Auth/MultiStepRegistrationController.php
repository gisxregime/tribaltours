<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Session;
use Illuminate\View\View;

class MultiStepRegistrationController extends Controller
{
    public function showStep(int $step = 1): View
    {
        $step = max(1, min(4, $step));

        return view('legacy.root.get-started', [
            'registrationStep' => $step,
            'registrationDraft' => Session::get('registration_draft', []),
        ]);
    }

    public function storeStep(Request $request, int $step): RedirectResponse
    {
        $step = max(1, min(4, $step));
        $draft = Session::get('registration_draft', []);

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'role' => ['nullable', 'in:tourist,guide'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        Session::put('registration_draft', array_merge($draft, $validated, ['step' => $step]));

        return redirect()->route('auth.register.step', ['step' => min(4, $step + 1)]);
    }

    public function clearDraft(): RedirectResponse
    {
        Session::forget('registration_draft');

        return back()->with('status', 'Registration draft cleared.');
    }
}
