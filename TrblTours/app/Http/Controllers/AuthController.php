<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class AuthController extends Controller
{
    public function signIn(): View
    {
        return view('auth.sign-in');
    }

    public function getStarted(): View
    {
        return view('auth.get-started');
    }

    public function login(): View
    {
        return view('auth.login');
    }

    public function register(): View
    {
        return view('auth.register');
    }

    public function forgotPassword(): View
    {
        return view('auth.forgot-password');
    }
}
