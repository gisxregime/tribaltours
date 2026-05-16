<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function tourist(Request $request, ?string $guideId = null): View
    {
        return view('tourist.messages', [
            'routeGuideId' => $guideId ? trim((string) $guideId) : null,
        ]);
    }

    public function guide(): View
    {
        return view('guide.messages');
    }
}
