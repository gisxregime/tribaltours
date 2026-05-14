<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class PaymentController extends Controller
{
    public function method(): View
    {
        return view('tourist.payment-method');
    }

    public function processing(): View
    {
        return view('tourist.payment-processing');
    }

    public function confirmation(): View
    {
        return view('tourist.booking-confirmation');
    }
}
