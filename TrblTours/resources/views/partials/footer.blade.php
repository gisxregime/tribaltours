<footer class="landing-footer py-4">
    <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <p class="mb-0 text-muted">&copy; {{ now()->year }} Tribaltours. All rights reserved.</p>
        <div class="d-flex gap-3">
            <a href="{{ route('home') }}" class="text-muted text-decoration-none">Home</a>
            <a href="{{ route('explore') }}" class="text-muted text-decoration-none">Explore</a>
            <a href="{{ route('sign-in') }}" class="text-muted text-decoration-none">Sign In</a>
        </div>
    </div>
</footer>
