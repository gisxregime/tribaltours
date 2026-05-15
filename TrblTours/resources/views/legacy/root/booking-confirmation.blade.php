<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tribaltours Booking Confirmation</title>
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body class="account-page" data-page="my-bookings" data-view="booking-confirmation" data-require-auth="true">
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
                <div class="flow-card processing-wrap">
                    <div class="confirmation-check"><i class="fa-solid fa-check"></i></div>
                    <h1 class="h4 mb-1">Booking Confirmed</h1>
                    <p class="text-muted mb-3">Your tour booking has been successfully reserved.</p>
                    <div class="text-start">
                        <p class="mb-1">Reference #: <strong data-confirm-ref>TRBL-XXXX</strong></p>
                        <p class="mb-1">Tour: <strong data-confirm-tour>Tour Name</strong></p>
                        <p class="mb-1">Location: <strong data-confirm-location>--</strong></p>
                        <p class="mb-1">Date: <strong data-confirm-date>--</strong></p>
                        <p class="mb-1">Time: <strong data-confirm-time>--</strong></p>
                        <p class="mb-1">Guests: <strong data-confirm-guests>1</strong></p>
                        <p class="mb-1">Payment Method: <strong data-confirm-method>--</strong></p>
                        <p class="mb-3">Total Paid: <strong data-confirm-total>PHP 0</strong></p>
                    </div>
                    <img id="bookingQrCode" src="" alt="Booking QR Code" width="160" height="160" class="rounded border">
                    <div class="d-flex gap-2 justify-content-center flex-wrap mt-3">
                        <button id="downloadReceiptBtn" class="btn-soft" type="button"><i class="fa-solid fa-download me-1"></i>Download Receipt</button>
                        <a class="btn-gold" href="{{ route('my-bookings') }}">View My Bookings</a>
                        <a class="btn-charcoal" href="{{ route('messages') }}">Message Tour Guide</a>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/app.js') }}"></script>
</body>

</html>
