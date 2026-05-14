<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>TrblTours Messages</title>
    <base href="{{ url('/') }}/">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="messages" data-require-auth="true">
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

            <main class="content-wrap">
                <section class="page-header">
                    <p class="page-kicker">Guide Communications</p>
                    <h1 class="page-title">Messages</h1>
                </section>

                <section class="message-layout">
                    <aside class="conversation-list">
                        <div class="conversation-search">
                            <input class="input-soft" type="text" placeholder="Search conversation">
                        </div>
                        <div class="conversation-items" id="conversationList"></div>
                    </aside>

                    <article class="chat-window position-relative">
                        <header class="chat-header">
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-light d-lg-none" type="button"><i class="fa-solid fa-arrow-left"></i></button>
                                <strong id="chatTitle">Select a conversation</strong>
                            </div>
                            <button class="btn btn-light" type="button"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                        </header>

                        <div class="chat-messages" id="chatMessages"></div>
                        <div id="typingIndicator" class="typing-indicator"><i class="fa-solid fa-ellipsis"></i> Guide is typing...</div>

                        <form id="chatForm" class="chat-input">
                            <button id="emojiToggle" class="btn btn-light" type="button"><i class="fa-regular fa-face-smile"></i></button>
                            <input id="chatInput" class="input-soft" type="text" placeholder="Type your message">
                            <button class="btn-gold" type="submit"><i class="fa-solid fa-paper-plane"></i></button>
                        </form>

                        <div id="emojiPanel" class="emoji-panel">
                            <button type="button" data-emoji="😀">😀</button>
                            <button type="button" data-emoji="😍">😍</button>
                            <button type="button" data-emoji="👍">👍</button>
                            <button type="button" data-emoji="✨">✨</button>
                            <button type="button" data-emoji="🙏">🙏</button>
                            <button type="button" data-emoji="🌴">🌴</button>
                            <button type="button" data-emoji="🏔️">🏔️</button>
                            <button type="button" data-emoji="📍">📍</button>
                        </div>
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
