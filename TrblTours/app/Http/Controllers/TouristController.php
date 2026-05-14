<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\View\View;

class TouristController extends Controller
{
    public function index(): View
    {
        return view('index');
    }

    public function portal(): RedirectResponse
    {
        return redirect()->route('explore');
    }

    public function explore(): View
    {
        return view('tourist.explore');
    }

    public function likes(): View
    {
        return view('likes');
    }

    public function myPosts(): View
    {
        return view('tourist.my-posts');
    }
}
