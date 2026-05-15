<header class="landing-nav" id="landingNav">
    <div class="container nav-shell">
        <a class="brand-lockup" href="{{ route('home') }}" aria-label="Tribaltours home page">
            <span class="brand-mark" aria-hidden="true">
                <img src="{{ asset('images/favicon.png') }}" alt="Tribaltours logo" width="34" height="34">
            </span>
            <span class="brand-name brand-asimovian">Tribaltours</span>
        </a>

        <nav class="desktop-links" aria-label="Main navigation">
            <a href="{{ route('explore') }}">Explore Tours</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#guide-program">Become a Guide</a>
        </nav>

        <div class="desktop-actions">
            <a class="btn-link" href="{{ route('sign-in') }}">Sign In</a>
            <a class="btn-gold" href="{{ route('get-started') }}">Get Started</a>
        </div>

        <button class="menu-btn" id="menuBtn" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobileMenu">
            <i class="fa-solid fa-bars"></i>
        </button>
    </div>

    @include('partials.mobile-navigation')
</header>
