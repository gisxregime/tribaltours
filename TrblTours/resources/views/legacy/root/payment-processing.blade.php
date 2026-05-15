<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Tribaltours Processing Payment</title>
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body class="account-page" data-page="my-bookings" data-view="payment-processing" data-require-auth="true">
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
                    <div class="processing-spinner"></div>
                    <h1 class="h4 mb-2">Processing your payment...</h1>
                    <p id="processingStatus" class="text-muted">Processing your payment... 0%</p>
                    <div class="progress mt-3" role="progressbar" aria-label="Payment progress">
                        <div id="processingProgress" class="progress-bar" style="width: 8%; background:#556B2F" aria-valuemin="0" aria-valuemax="100" aria-valuenow="8"></div>
                    </div>
                    <p class="small text-muted mt-3 mb-0">Please do not refresh or close this page.</p>
                    <button id="processingRetry" class="btn-soft mt-3" type="button">Retry</button>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/app.js') }}"></script>
</body>

</html>
