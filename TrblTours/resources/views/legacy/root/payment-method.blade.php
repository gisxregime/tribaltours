<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Tribaltours Payment Method</title>
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body class="account-page" data-page="my-bookings" data-view="payment-method" data-require-auth="true">
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <div class="app-root">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header"><div><a href="{{ route('home') }}" class="brand-asimovian brand-top">Tribaltours</a><small class="text-muted">Tourist Workspace</small></div></div>
            <nav class="sidebar-nav">
                <p class="side-label">Navigation</p>
                <a class="side-link" href="{{ route('explore') }}" data-page="explore"><i class="fa-solid fa-compass"></i>Explore Tours</a>
                <div class="dropdown"><a class="side-link has-notif" href="#" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false"><i class="fa-solid fa-bell notif-bell"></i>Notifications<span class="side-badge" id="notificationBadge">0</span></a><div class="dropdown-menu notification-menu sidebar-notif"><div class="d-flex justify-content-between align-items-center px-2 pb-2 border-bottom"><strong>Notifications</strong><small class="text-muted">Live updates</small></div><div id="notificationList" class="d-grid gap-1 pt-2"></div></div></div>
                <a class="side-link" href="{{ route('my-posts') }}" data-page="my-posts"><i class="fa-solid fa-clipboard-list"></i>My Posts</a>
                <a class="side-link" href="{{ route('my-bookings') }}" data-page="my-bookings"><i class="fa-solid fa-ticket"></i>My Bookings</a>
                <a class="side-link" href="{{ route('likes') }}" data-page="likes"><i class="fa-solid fa-heart"></i>Likes</a>
                <a class="side-link" href="{{ route('messages') }}" data-page="messages"><i class="fa-solid fa-comments"></i>Messages</a>
                <p class="side-label">Account</p>
                <a class="side-link" href="{{ route('profile') }}" data-page="profile"><i class="fa-solid fa-user"></i>Profile</a>
                <a class="side-link" href="{{ route('settings') }}" data-page="settings"><i class="fa-solid fa-gear"></i>Settings</a>
            </nav>
            <div class="sidebar-footer"><button id="logoutBtn" class="logout-btn"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</button></div>
        </aside>

        <div class="app-main">
            <header class="topbar" id="topbar"><div class="topbar-left"><button id="sidebarToggle" class="sidebar-toggle d-lg-none" type="button" aria-label="Toggle sidebar"><i class="fa-solid fa-bars"></i></button><a href="{{ route('home') }}" class="brand-asimovian brand-top">Tribaltours</a></div></header>
            <main class="content-wrap account-wrap">
                <section class="page-header"><p class="page-kicker">Booking Flow</p><h1 class="page-title">Payment Method</h1></section>
                <div class="flow-wrap">
                    <section class="flow-card">
                        <h2 class="h5 mb-3">Choose your payment option</h2>
                        <div class="payment-method-grid">
                            <button class="payment-option" type="button" data-payment-option="GCash"><span><i class="fa-solid fa-mobile-screen-button me-2"></i>GCash</span><i class="fa-solid fa-circle"></i></button>
                            <button class="payment-option" type="button" data-payment-option="Maya"><span><i class="fa-solid fa-wallet me-2"></i>Maya</span><i class="fa-solid fa-circle"></i></button>
                            <button class="payment-option" type="button" data-payment-option="PayPal"><span><i class="fa-brands fa-paypal me-2"></i>PayPal</span><i class="fa-solid fa-circle"></i></button>
                            <button class="payment-option" type="button" data-payment-option="Credit / Debit Card"><span><i class="fa-regular fa-credit-card me-2"></i>Credit / Debit Card</span><i class="fa-solid fa-circle"></i></button>
                            <button class="payment-option" type="button" data-payment-option="Pay on meetup"><span><i class="fa-solid fa-hand-holding-dollar me-2"></i>Pay on meetup</span><i class="fa-solid fa-circle"></i></button>
                            <button class="payment-option" type="button" data-payment-option="Pay at tour location"><span><i class="fa-solid fa-location-dot me-2"></i>Pay at tour location</span><i class="fa-solid fa-circle"></i></button>
                        </div>
                        <div class="mt-3 small text-muted">Selected: <span id="selectedMethodLabel">Select a payment method</span></div>
                        <button id="continueToProcessing" class="btn-gold mt-3" type="button">Proceed to Payment</button>
                    </section>
                    <aside class="flow-card">
                        <h3 class="h6 mb-2">Booking Summary</h3>
                        <p class="mb-1">Tour: <strong data-payment-tour>Tour</strong></p>
                        <p class="mb-0">Total: <strong data-payment-total>PHP 0</strong></p>
                        <div class="small text-muted mt-2"><i class="fa-solid fa-shield-halved me-1"></i>Secure payment protected</div>
                    </aside>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/app.js') }}"></script>
</body>

</html>
