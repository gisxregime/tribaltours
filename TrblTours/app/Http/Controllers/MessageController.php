<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class MessageController extends Controller
{
    public function tourist(): View
    {
        return view('tourist.messages');
    }

    public function guide(): View
    {
        return view('guide.messages');
    }
}
