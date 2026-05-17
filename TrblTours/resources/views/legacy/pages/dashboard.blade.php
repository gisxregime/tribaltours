<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide Dashboard | Tribaltours</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="guide-dashboard" data-require-auth="true">
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <div class="app-root">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header guide-sidebar-header">
                <div class="guide-sidebar-brand">
                    <img src="{{ asset('images/favicon.png') }}" alt="Tribaltours logo" class="guide-sidebar-logo">
                    <small class="text-muted d-block mt-1">Tour Guide Workspace</small>
                </div>
            </div>
            <nav class="sidebar-nav">
                <p class="side-label">Navigation</p>
                <a class="side-link" href="{{ route('guide.dashboard') }}" data-page="guide-dashboard"><i class="fa-solid fa-chart-line"></i>Dashboard</a>
                <a class="side-link" href="{{ route('guide.request-feed.page') }}" data-page="guide-request-feed"><i class="fa-solid fa-clipboard-list"></i>Request Post Feed</a>
                <a class="side-link" href="{{ route('guide.booking-requests.index') }}" data-page="guide-booking-requests"><i class="fa-solid fa-inbox"></i>Booking Requests</a>
                <a class="side-link" href="{{ route('guide.tours.index') }}" data-page="guide-tours"><i class="fa-solid fa-map-location-dot"></i>My Tours</a>
                <a class="side-link" href="{{ route('guide.messages') }}" data-page="guide-messages"><i class="fa-solid fa-comments"></i>Messages</a>
                <a class="side-link" href="{{ route('guide.profile') }}" data-page="guide-profile"><i class="fa-solid fa-user"></i>Guide Profile</a>
            </nav>
            <div class="sidebar-footer">
                <button id="logoutBtn" class="logout-btn"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</button>
            </div>
        </aside>

        <div class="app-main">
            <header class="topbar" id="topbar">
                <div class="topbar-left">
                    <div class="dropdown d-lg-none">
                        <button class="sidebar-toggle" type="button" data-sidebar-toggle data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="Open navigation menu">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <ul class="dropdown-menu hamburger-dropdown">
                            <li><h6 class="dropdown-header">Navigation</h6></li>
                            <li><a class="dropdown-item" href="{{ route('guide.dashboard') }}"><i class="fa-solid fa-chart-line"></i>Dashboard</a></li>
                            <li><a class="dropdown-item" href="{{ route('guide.request-feed.page') }}"><i class="fa-solid fa-clipboard-list"></i>Request Post Feed</a></li>
                            <li><a class="dropdown-item" href="{{ route('guide.booking-requests.index') }}"><i class="fa-solid fa-inbox"></i>Booking Requests</a></li>
                            <li><a class="dropdown-item" href="{{ route('guide.tours.index') }}"><i class="fa-solid fa-map-location-dot"></i>My Tours</a></li>
                            <li><a class="dropdown-item" href="{{ route('guide.messages') }}"><i class="fa-solid fa-comments"></i>Messages</a></li>
                            <li><a class="dropdown-item" href="{{ route('guide.profile') }}"><i class="fa-solid fa-user"></i>Guide Profile</a></li>
                        </ul>
                    </div>
                    <a href="{{ route('home') }}" class="brand-asimovian guide-top-brand">Tribaltours</a>
                </div>
                <div class="topbar-right">
                    <div class="dropdown">
                        <button class="icon-btn" id="guideNotificationBtn" type="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="Open notifications">
                            <i class="fa-solid fa-bell"></i>
                            <span id="guideNotificationBadge" class="unread-badge">0</span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end notification-menu guide-notif-menu">
                            <div class="d-flex justify-content-between align-items-center px-2 pb-2 border-bottom">
                                <strong>Notifications</strong>
                                <button id="guideMarkAllRead" class="btn-soft py-1 px-2" type="button">Mark all read</button>
                            </div>
                            <div id="guideNotificationList" class="d-grid gap-1 pt-2"></div>
                        </div>
                    </div>
                </div>
            </header>

            <main class="content-wrap">
                <section class="page-header">
                    <h1 class="guide-page-title">Dashboard</h1>
                </section>

                <section class="stats-row guide-dashboard-stats">
                    <article class="stat-card stat-card-clickable" data-stat-href="{{ route('guide.tours.index') }}" tabindex="0" role="button" aria-label="Go to My Tours">
                        <p class="text-muted small">My Tours</p>
                        <p id="statTours" class="value">0</p>
                    </article>
                    <article class="stat-card stat-card-clickable" data-stat-href="{{ route('guide.booking-requests.index') }}?filter=pending" tabindex="0" role="button" aria-label="Go to Pending Requests">
                        <p class="text-muted small">Pending Requests</p>
                        <p id="statPending" class="value" style="color:#1f5fa6;">0</p>
                    </article>
                    <article class="stat-card stat-card-clickable" data-stat-href="{{ route('guide.booking-requests.index') }}?filter=accepted" tabindex="0" role="button" aria-label="Go to Accepted Bookings">
                        <p class="text-muted small">Accepted</p>
                        <p id="statAccepted" class="value" style="color:#477131;">0</p>
                    </article>
                    <article class="stat-card">
                        <p class="text-muted small">Total Earnings</p>
                        <p id="statEarnings" class="value" style="color:#0f766e;">₱0</p>
                        <a href="{{ route('guide.earnings-breakdown') }}" class="stat-see-more">See More <i class="fa-solid fa-angle-right"></i></a>
                    </article>
                    <article class="stat-card">
                        <p class="text-muted small">Average Rating</p>
                        <p id="statRating" class="value" style="color:#8f6512;">0.0</p>
                    </article>
                </section>

                <section class="guide-layout-grid">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h2 class="h4 mb-0">Tour Booked by Tourists</h2>
                        <a href="{{ route('guide.booking-requests.index') }}" class="btn-soft">Open Booking Requests</a>
                    </div>
                    <div id="dashboardPendingList" class="bookings-grid"></div>
                </section>

                <section class="guide-layout-grid mt-3">
                    <article class="settings-card simulated-earnings-card">
                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <div>
                                <h2 class="h5 mb-0">Tour Request Earnings</h2>
                                <div class="guide-earnings-owner mt-2">
                                    <img src="{{ asset('images/manila.jpg') }}" alt="Guide profile photo" class="guide-earnings-avatar" data-guide-earnings-avatar>
                                    <span class="guide-earnings-name" data-guide-earnings-name>Tour Guide</span>
                                </div>
                            </div>
                            <div class="d-flex flex-column align-items-end gap-2">
                                <div class="simulated-earnings-total" id="simulatedEarningsValue">₱0.00</div>
                                <a href="{{ route('guide.request-payments') }}" class="dash-view-more">View More <i class="fa-solid fa-angle-right"></i></a>
                            </div>
                        </div>
                        <p id="simulatedTransactionMeta" class="small text-muted mb-2"></p>
                        <div id="simulatedTransactionList" class="simulated-transaction-list"></div>
                    </article>
                </section>

                <section class="guide-layout-grid mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h2 class="h4 mb-0">Tourist Reviews</h2>
                        <a href="{{ route('guide.reviews') }}" class="dash-view-more">View More <i class="fa-solid fa-angle-right"></i></a>
                    </div>
                    <div id="dashboardReviewList" class="guide-layout-grid"></div>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/guide.js') }}?v={{ filemtime(public_path('assets/guide.js')) }}"></script>
</body>
</html>
