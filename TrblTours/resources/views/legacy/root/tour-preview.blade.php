<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrblTours Tour Preview</title>
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>

<body class="account-page" data-page="explore" data-view="tour-preview" data-require-auth="true">
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
                <div class="tour-preview-layout">
                    <section>
                        <h1 class="preview-title" data-tour-title>Tour Title</h1>
                        <div class="preview-meta">
                            <span><i class="fa-solid fa-star text-warning me-1"></i><span data-tour-rating>0.0</span></span>
                            <span><span data-tour-reviews>0</span> reviews</span>
                            <span>Activity provider: <strong data-tour-provider>TrblTours</strong></span>
                        </div>

                        <div class="gallery-grid">
                            <div class="gallery-item gallery-item-a"><img data-tour-image src="{{ asset('images/pangasinan.jpg') }}" alt="Tour image 1"></div>
                            <div class="gallery-item gallery-item-b"><img data-tour-image src="{{ asset('images/puertoprincessa.jpg') }}" alt="Tour image 2"></div>
                            <div class="gallery-item gallery-item-c"><img data-tour-image src="{{ asset('images/carousel2.jpg') }}" alt="Tour image 3"></div>
                            <div class="gallery-item gallery-item-d"><img data-tour-image src="{{ asset('images/davao.jpg') }}" alt="Tour image 4"></div>
                        </div>

                        <p class="mt-3 text-muted" data-tour-description>
                            Tour description here.
                        </p>

                        <section class="activity-listing">
                            <h2 class="h4 mb-2">About this activity</h2>
                            <div class="activity-row" data-row-cancel><i class="fa-regular fa-circle-check text-success mt-1"></i><div><strong>Free cancellation</strong><div class="text-muted small" data-tour-cancellation-text>Cancel up to 24 hours in advance for a full refund</div></div></div>
                            <div class="activity-row" data-row-pay-later><i class="fa-solid fa-wallet text-success mt-1"></i><div><strong>Reserve now & pay later</strong><div class="text-muted small">Keep your travel plans flexible</div></div></div>
                            <div class="activity-row"><i class="fa-regular fa-clock text-success mt-1"></i><div><strong>Duration</strong><div class="text-muted small" data-tour-duration>5 hours</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-user-tie text-success mt-1"></i><div><strong>Live tour guide</strong><div class="text-muted small" data-tour-language>English, Filipino</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-location-dot text-success mt-1"></i><div><strong>Meeting point</strong><div class="text-muted small" data-tour-meeting-point>Main tourist pickup point</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-list-check text-success mt-1"></i><div><strong>Tour Includes</strong><div class="text-muted small" data-tour-includes>Boat transfer, Entrance fees</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-circle-minus text-danger mt-1"></i><div><strong>Tour Excludes</strong><div class="text-muted small" data-tour-excludes>Not specified</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-triangle-exclamation text-warning mt-1"></i><div><strong>Requirements / Reminders</strong><div class="text-muted small" data-tour-requirements>Follow guide reminders for a safe experience.</div></div></div>
                            <div class="activity-row"><i class="fa-solid fa-shield-halved text-success mt-1"></i><div><strong>Safety information</strong><div class="text-muted small" data-tour-safety>Safety briefing is provided before the activity starts.</div></div></div>
                        </section>

                        <section class="activity-listing mt-3">
                            <h2 class="h4 mb-2">Guide Information</h2>
                            <div class="d-flex align-items-center gap-3">
                                <img data-tour-guide-photo src="{{ asset('images/manila.jpg') }}" alt="Guide profile" style="width:64px;height:64px;border-radius:14px;object-fit:cover;border:1px solid #e4dbc7;">
                                <div>
                                    <p class="mb-1"><strong data-tour-guide-name>Guide Name</strong> <span data-tour-guide-badge class="soft-tag" style="display:none;">Verified</span></p>
                                    <p class="small text-muted mb-1">Experience: <span data-tour-guide-experience>1</span> years</p>
                                    <p class="small text-muted mb-1">Contact: <span data-tour-guide-contact>N/A</span></p>
                                    <p class="small text-muted mb-0">Social: <span data-tour-guide-social>N/A</span></p>
                                </div>
                            </div>
                        </section>

                        <section class="activity-listing mt-3">
                            <h2 class="h4 mb-2">Ratings &amp; Reviews</h2>
                            <p id="tourPreviewReviewEmpty" class="small text-muted mb-0">No public reviews yet for this listing.</p>
                            <div id="tourPreviewReviewList" class="guide-layout-grid mt-2"></div>
                        </section>
                    </section>

                    <aside class="booking-sticky">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <small class="text-muted">From</small>
                                <div class="price" data-tour-price>PHP 0</div>
                                <small class="text-muted" data-tour-price-type>per person</small>
                            </div>
                            <button class="like-save" id="previewLikeBtn" type="button" aria-label="Save this tour"></button>
                        </div>

                        <div class="booking-field">
                            <label class="field-label" for="previewGuests">Guests</label>
                            <select class="select-soft" id="previewGuests">
                                <option value="" selected>Select guests</option>
                                <option value="1">Adult x 1</option>
                                <option value="2">Adult x 2</option>
                                <option value="3">Adult x 3</option>
                                <option value="4">Adult x 4</option>
                            </select>
                        </div>

                        <div class="booking-field">
                            <label class="field-label" for="previewDate">Select date</label>
                            <input class="input-soft" id="previewDate" type="date">
                        </div>

                        <div class="booking-field">
                            <label class="field-label" for="previewTime">Select time</label>
                            <select class="select-soft" id="previewTime">
                                <option value="" selected>Select time slot</option>
                                <option value="08:00 AM">08:00 AM</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="01:00 PM">01:00 PM</option>
                            </select>
                        </div>

                        <button id="previewCheckAvailability" class="btn-gold w-100" type="button">Check Availability</button>
                        <button id="previewBookNow" class="btn-charcoal w-100 mt-2" type="button" disabled title="Please check availability first">Book Now</button>
                        <p id="previewBookNowHint" class="booking-helper-text text-muted mt-2 mb-0">Please check availability first</p>

                        <div class="booking-summary">
                            <p class="small mb-1"><i class="fa-regular fa-circle-check text-success me-2"></i>Free cancellation</p>
                            <p class="small mb-0"><i class="fa-solid fa-wallet text-success me-2"></i>Reserve now & pay later</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/app.js') }}"></script>
</body>

</html>
