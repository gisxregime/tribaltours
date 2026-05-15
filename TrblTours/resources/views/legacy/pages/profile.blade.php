<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Guide Profile | Tribaltours</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="guide-profile" data-require-auth="true">
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
                    <h1 class="guide-page-title">Guide Profile</h1>
                    <p class="text-muted mb-0">Clean single-page profile editor for your public guide details.</p>
                </section>

                <section class="surface p-3 p-md-4 mb-3">
                    <div class="d-flex flex-wrap align-items-center gap-3">
                        <img id="guideAvatarPreview" src="{{ asset(auth()->user()?->avatar_path ?: 'images/manila.jpg') }}" alt="Guide avatar" style="width:82px;height:82px;border-radius:16px;object-fit:cover;border:1px solid #e2d8c5;">
                        <div>
                            <h2 id="guideProfileHeading" class="h3 mb-1">{{ auth()->user()?->name ?: 'Guide Name' }}</h2>
                            <p id="guideProfileSub" class="text-muted mb-2">{{ auth()->user()?->location ?: 'Philippines' }}</p>
                            <label class="btn-soft mb-0" for="guideAvatarInput"><i class="fa-regular fa-image me-1"></i>Change Photo</label>
                            <input id="guideAvatarInput" type="file" accept="image/*" hidden>
                        </div>
                    </div>
                </section>

                <section class="surface p-3 p-md-4">
                    <form id="guideProfileForm" class="guide-form-grid">
                        <label>
                            <span class="field-label">Display name</span>
                            <input id="guideName" class="input-soft" type="text" required>
                        </label>
                        <label>
                            <span class="field-label">Location</span>
                            <input id="guideLocation" class="input-soft" type="text" required>
                        </label>
                        <label class="full">
                            <span class="field-label">Bio</span>
                            <textarea id="guideBio" class="input-soft" rows="3" required></textarea>
                        </label>
                        <label>
                            <span class="field-label">Contact number</span>
                            <input id="guidePhone" class="input-soft" type="text" required>
                        </label>
                        <label>
                            <span class="field-label">Email</span>
                            <input id="guideEmail" class="input-soft" type="email" required>
                        </label>
                        <label class="full">
                            <span class="field-label">Tour specialties</span>
                            <input id="guideSpecialties" class="input-soft" type="text" placeholder="Island Hopping, Cultural Tours" required>
                        </label>
                        <label>
                            <span class="field-label">Languages</span>
                            <input id="guideLanguages" class="input-soft" type="text" required>
                        </label>
                        <label>
                            <span class="field-label">Certifications</span>
                            <input id="guideCertifications" class="input-soft" type="text" required>
                        </label>
                        <label class="full">
                            <span class="field-label">Social links</span>
                            <input id="guideSocial" class="input-soft" type="text" placeholder="facebook.com/... , instagram.com/..." required>
                        </label>
                        <div class="full d-flex justify-content-end">
                            <button class="btn-gold" type="submit"><i class="fa-solid fa-floppy-disk me-2"></i>Save Profile</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/guide.js') }}"></script>
</body>
</html>
