<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class OtpVerificationController extends Controller
{
    public function issue(Request $request): RedirectResponse|JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'purpose' => ['required', 'in:register,login,password_reset,email_verify'],
            'channel' => ['nullable', 'in:email,sms'],
        ]);

        $isSimulation = (bool) config('auth.otp.simulation_enabled', false);
        $simulationCode = preg_replace('/\D+/', '', (string) config('auth.otp.simulation_code', '123456'));
        $expiresMinutes = max(1, (int) config('auth.otp.expires_minutes', 10));

        if ($simulationCode === '' || strlen($simulationCode) > 10) {
            $simulationCode = '123456';
        }

        $otpCode = $isSimulation
            ? $simulationCode
            : (string) random_int(100000, 999999);

        $otp = OtpVerification::query()->create([
            'user_id' => optional($request->user())->id,
            'email' => $payload['email'],
            'purpose' => $payload['purpose'],
            'channel' => $payload['channel'] ?? 'email',
            'otp_code' => $otpCode,
            'expires_at' => now()->addMinutes($expiresMinutes),
            'attempts' => 0,
        ]);

        if ($request->expectsJson()) {
            $response = [
                'message' => $isSimulation
                    ? 'OTP simulated successfully. Use the provided OTP code to continue.'
                    : 'OTP code issued. Integrate mail/SMS provider to deliver it.',
            ];

            if ($isSimulation || config('app.debug')) {
                $response['debug_otp_code'] = (string) $otp->otp_code;
            }

            return response()->json($response);
        }

        return back()->with('status', $isSimulation
            ? 'OTP simulated successfully. Use the configured code to continue.'
            : 'OTP code issued. Integrate mail/SMS provider to deliver it.');
    }

    public function verify(Request $request): RedirectResponse|JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
            'purpose' => ['required', 'in:register,login,password_reset,email_verify'],
            'otp_code' => ['required', 'string', 'max:10'],
        ]);

        $otp = OtpVerification::query()
            ->where('email', $payload['email'])
            ->where('purpose', $payload['purpose'])
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$otp || $otp->expires_at->isPast()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'OTP is invalid or expired.',
                    'errors' => ['otp_code' => ['OTP is invalid or expired.']],
                ], 422);
            }
            return back()->withErrors(['otp_code' => 'OTP is invalid or expired.']);
        }

        if (!hash_equals((string) $otp->otp_code, (string) $payload['otp_code'])) {
            $otp->increment('attempts');
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Incorrect OTP code.',
                    'errors' => ['otp_code' => ['Incorrect OTP code.']],
                ], 422);
            }
            return back()->withErrors(['otp_code' => 'Incorrect OTP code.']);
        }

        $otp->update(['verified_at' => now()]);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'OTP verified.']);
        }

        return back()->with('status', 'OTP verified.');
    }
}
