<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class BookingController extends Controller
{
    public function myBookings(): View
    {
        return view('tourist.my-bookings');
    }

    public function details(): View
    {
        return view('tourist.booking-details');
    }

    public function confirmation(): View
    {
        return view('tourist.booking-confirmation');
    }

    public function paymentMethod(): View
    {
        return view('tourist.payment-method');
    }

    public function paymentProcessing(): View
    {
        return view('tourist.payment-processing');
    }
}
