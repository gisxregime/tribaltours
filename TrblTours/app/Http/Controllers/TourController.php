<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class TourController extends Controller
{
    public function explore(): View
    {
        return view('explore');
    }

    public function preview(): View
    {
        return view('tourist.tour-preview');
    }
}
