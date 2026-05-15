<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Tribaltours My Bookings</title>    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="my-bookings" data-require-auth="true">
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <div class="app-root">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div>
                    <a href="{{ route('home') }}" class="brand-asimovian brand-top">Tribaltours</a>
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
                    <a href="{{ route('home') }}" class="brand-asimovian brand-top">Tribaltours</a>
                </div>
            </header>

            <main class="content-wrap">
                <section class="page-header">
                    <p class="page-kicker">Booking Management</p>
                    <h1 class="page-title">My Bookings</h1>
                </section>

                <section class="booking-tabs">
                    <button class="tab-btn active" data-tab="pending" type="button">Pending</button>
                    <button class="tab-btn" data-tab="booked" type="button">Booked</button>
                    <button class="tab-btn" data-tab="completed" type="button">Completed</button>
                    <button class="tab-btn" data-tab="cancelled" type="button">Cancelled</button>
                </section>

                <section class="bookings-grid"></section>

                <section id="bookingEmptyState" class="empty-state mt-3" style="display:none;">
                    <h3 class="h5 mt-2">No bookings in this tab</h3>
                    <p class="mb-3">Book your first tour!</p>
                    <button class="btn-gold" data-go-explore><i class="fa-solid fa-compass me-2"></i>Explore Tours</button>
                </section>
            </main>
        </div>
    </div>

    <div class="modal fade" id="reviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Rate Your Trip</h2>
                    <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
                </div>
                <form id="reviewForm" class="modal-body">
                    <p class="text-muted" data-review-prompt>How was your trip experience?</p>
                    <div class="d-flex gap-2 mb-3" style="font-size:1.6rem; color:#b8ad96;">
                        <button type="button" class="btn btn-light" data-review-star="1">★</button>
                        <button type="button" class="btn btn-light" data-review-star="2">★</button>
                        <button type="button" class="btn btn-light" data-review-star="3">★</button>
                        <button type="button" class="btn btn-light" data-review-star="4">★</button>
                        <button type="button" class="btn btn-light" data-review-star="5">★</button>
                    </div>
                    <label class="field-label" for="reviewText">Optional Review</label>
                    <textarea id="reviewText" class="input-soft" rows="4" placeholder="Share what you loved and what can be improved"></textarea>
                    <div class="modal-footer px-0 pb-0 mt-3">
                        <button class="btn btn-light" type="button" data-bs-dismiss="modal">Close</button>
                        <button class="btn-gold" type="submit"><i class="fa-solid fa-paper-plane me-2"></i>Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal fade" id="bookingCancelModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Cancel Booking</h2>
                    <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-2">Are you sure you want to cancel this booking?</p>
                    <p class="small text-muted mb-0">This action is permanent and can only be done within 24 hours of booking.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" type="button" data-bs-dismiss="modal">Keep Booking</button>
                    <button id="confirmCancelBookingBtn" class="btn-danger" type="button"><i class="fa-solid fa-ban me-1"></i>Cancel Booking</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="bookingReceiptModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Booking Receipt</h2>
                    <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <dl class="row mb-0">
                        <dt class="col-5 small text-muted">Tour name</dt>
                        <dd class="col-7 mb-2" id="receiptTourName">-</dd>

                        <dt class="col-5 small text-muted">Booking date</dt>
                        <dd class="col-7 mb-2" id="receiptBookingDate">-</dd>

                        <dt class="col-5 small text-muted">Guests count</dt>
                        <dd class="col-7 mb-2" id="receiptGuestCount">-</dd>

                        <dt class="col-5 small text-muted">Total amount paid</dt>
                        <dd class="col-7 mb-2" id="receiptTotalPaid">-</dd>

                        <dt class="col-5 small text-muted">Payment method</dt>
                        <dd class="col-7 mb-2" id="receiptPaymentMethod">-</dd>

                        <dt class="col-5 small text-muted">Transaction ID / Ref</dt>
                        <dd class="col-7 mb-2" id="receiptReference">-</dd>

                        <dt class="col-5 small text-muted">Booking status</dt>
                        <dd class="col-7 mb-0" id="receiptBookingStatus">-</dd>
                    </dl>
                    <p id="receiptAvailabilityMessage" class="alert alert-info small py-2 px-3 mt-3 mb-0" style="display:none;">Receipt will be available once payment is confirmed.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" type="button" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
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
