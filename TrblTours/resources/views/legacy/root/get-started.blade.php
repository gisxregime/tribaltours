<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrblTours | Get Started</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('assets/auth.css') }}">
</head>
<body class="auth-page">
    <main class="auth-shell" aria-label="TrblTours onboarding">
        <aside class="auth-hero" aria-hidden="true">
            <img class="auth-hero-image" src="{{ asset('images/carousel2.jpg') }}" alt="">
            <div class="auth-hero-overlay"></div>
            <div class="auth-hero-inner">
                <a href="{{ route('home') }}" class="auth-brand" aria-label="TrblTours home">TrblTours</a>
                <div class="auth-hero-copy">
                    <p class="auth-kicker">Trusted Travel Platform</p>
                    <h1>Discover curated local journeys with trusted guides.</h1>
                    <p>Build your account with secure verification, professional onboarding standards, and a marketplace-ready traveler profile.</p>
                    <div class="auth-hero-stats" aria-label="TrblTours trust metrics">
                        <div class="auth-stat"><span>Tours</span><strong>1,240+</strong></div>
                        <div class="auth-stat"><span>Travelers</span><strong>58k</strong></div>
                        <div class="auth-stat"><span>Destinations</span><strong>96</strong></div>
                        <div class="auth-stat"><span>Rating</span><strong>4.9</strong></div>
                    </div>
                </div>
            </div>
        </aside>

        <section class="auth-panel">
            <div
                class="auth-panel-inner"
                id="authApp"
                data-auth-context="register"
                data-register-url="{{ route('auth.register.legacy', absolute: false) }}"
                data-otp-issue-url="{{ route('auth.otp.issue', absolute: false) }}"
                data-otp-verify-url="{{ route('auth.otp.verify', absolute: false) }}"
                data-csrf-token="{{ csrf_token() }}"
            ></div>
        </section>
    </main>

    <script src="{{ asset('assets/auth.js') }}"></script>
</body>
</html>
