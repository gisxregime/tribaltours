<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>TrblTours Settings</title>
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body class="account-page" data-page="settings" data-require-auth="true">
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <div class="app-root">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div>
                    <a href="{{ route('home') }}" class="brand-asimovian brand-top">TrblTours</a>
                    <small class="text-muted">Tourist Workspace</small>
                </div>
            </div>
            <nav class="sidebar-nav">
                <p class="side-label">Navigation</p>
                <a class="side-link" href="{{ route('explore') }}" data-page="explore"><i class="fa-solid fa-compass"></i>Explore Tours</a>
                <div class="dropdown">
                    <a class="side-link has-notif" href="#" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                        <i class="fa-solid fa-bell notif-bell"></i>Notifications
                        <span class="side-badge" id="notificationBadge">0</span>
                    </a>
                    <div class="dropdown-menu notification-menu sidebar-notif">
                        <div class="d-flex justify-content-between align-items-center px-2 pb-2 border-bottom">
                            <strong>Notifications</strong>
                            <small class="text-muted">Live updates</small>
                        </div>
                        <div id="notificationList" class="d-grid gap-1 pt-2"></div>
                    </div>
                </div>
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
            <header class="topbar" id="topbar">
                <div class="topbar-left">
                    <div class="dropdown d-lg-none">
                        <button class="sidebar-toggle" type="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="Open navigation menu">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <ul class="dropdown-menu hamburger-dropdown">
                            <li><h6 class="dropdown-header">Navigation</h6></li>
                            <li><a class="dropdown-item" href="{{ route('explore') }}"><i class="fa-solid fa-compass"></i>Explore Tours</a></li>
                            <li><a class="dropdown-item" href="#"><i class="fa-solid fa-bell"></i>Notifications <span class="hamburger-badge">0</span></a></li>
                            <li><a class="dropdown-item" href="{{ route('my-posts') }}"><i class="fa-solid fa-clipboard-list"></i>My Posts</a></li>
                            <li><a class="dropdown-item" href="{{ route('my-bookings') }}"><i class="fa-solid fa-ticket"></i>My Bookings</a></li>
                            <li><a class="dropdown-item" href="{{ route('likes') }}"><i class="fa-solid fa-heart"></i>Likes</a></li>
                            <li><a class="dropdown-item" href="{{ route('messages') }}"><i class="fa-solid fa-comments"></i>Messages</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><h6 class="dropdown-header">Account</h6></li>
                            <li><a class="dropdown-item" href="{{ route('profile') }}"><i class="fa-solid fa-user"></i>Profile</a></li>
                            <li><a class="dropdown-item" href="{{ route('settings') }}"><i class="fa-solid fa-gear"></i>Settings</a></li>
                        </ul>
                    </div>
                    <a href="{{ route('home') }}" class="brand-asimovian brand-top">TrblTours</a>
                </div>
            </header>

            <main class="content-wrap account-wrap">
                <section class="page-header account-header">
                    <p class="page-kicker">Preferences and Privacy</p>
                    <h1 class="page-title">Settings</h1>
                </section>

                <section class="profile-grid">
                    <article class="settings-card account-card">
                        <form id="settingsForm">
                            <h2 class="h5 mb-3">Settings Toggles</h2>
                            <div class="setting-row">
                                <div>
                                    <strong>Email Notifications</strong>
                                    <div class="small text-muted">Get updates for bookings, offers, and messages.</div>
                                </div>
                                <div class="form-check form-switch"><input class="form-check-input" checked type="checkbox"></div>
                            </div>

                            <div class="setting-row">
                                <div>
                                    <strong>Privacy Settings</strong>
                                    <div class="small text-muted">Hide profile details from public guide listings.</div>
                                </div>
                                <div class="form-check form-switch"><input class="form-check-input" type="checkbox"></div>
                            </div>

                            <div class="setting-row">
                                <div>
                                    <strong>Delete Account</strong>
                                    <div class="small text-muted">Permanently remove your account and data.</div>
                                </div>
                                <button id="deleteAccountBtn" class="btn-danger" type="button"><i class="fa-regular fa-trash-can me-2"></i>Delete</button>
                            </div>

                            <button class="btn-gold mt-3" type="submit"><i class="fa-solid fa-floppy-disk me-2"></i>Save Settings</button>
                        </form>
                    </article>

                    <article class="settings-card account-card">
                        <h2 class="h5 mb-3">Account Information</h2>
                        <div class="setting-row"><span class="text-muted">Name</span><strong id="accountNameValue">Lara Dela Torre</strong></div>
                        <div class="setting-row"><span class="text-muted">Email</span><strong id="accountEmailValue">lara@trbltours.com</strong></div>
                        <div class="setting-row"><span class="text-muted">Role</span><strong id="accountRoleValue">Tourist</strong></div>
                        <div class="setting-row"><span class="text-muted">Joined Date</span><strong id="accountJoinedDateValue">March 14, 2025</strong></div>
                        <div class="setting-row"><span class="text-muted">Status</span><strong id="accountStatusValue" class="text-success">Active</strong></div>
                        <br>
                    </article>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        window.TRBL_PUSHER = {
            key: @json(env('PUSHER_APP_KEY')),
            cluster: @json(env('PUSHER_APP_CLUSTER', 'ap1'))
        };
    </script>
    <script src="{{ asset('assets/app.js') }}"></script>
</body>

</html>
