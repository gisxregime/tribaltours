<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>My Tours | TrblTours Guide</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="guide-tours" data-require-auth="true">
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <div class="app-root">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header guide-sidebar-header">
                <div class="guide-sidebar-brand">
                    <img src="{{ asset('images/favicon.png') }}" alt="TrblTours logo" class="guide-sidebar-logo">
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
                    <a href="{{ route('home') }}" class="brand-asimovian guide-top-brand">TrblTours</a>
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
                    <h1 class="guide-page-title">My Tours</h1>
                </section>

                <section class="guide-two-col align-items-start">
                    <article class="surface p-3 p-md-4">
                        <h2 class="h4 mb-3">Create Tour Listing</h2>
                        <form id="tourForm" class="guide-form-grid">
                            <input id="tourId" type="hidden">

                            <div class="full"><h3 class="h6 mb-1">Basic Tour Information</h3></div>
                            <label class="full">
                                <span class="field-label">Tour Title</span>
                                <input id="tourTitle" class="input-soft" type="text" placeholder="Island Hopping & Hidden Lagoons" required>
                            </label>
                            <label class="full">
                                <span class="field-label">Short Description</span>
                                <textarea id="tourDescription" class="input-soft" rows="3" required></textarea>
                            </label>
                            <label>
                                <span class="field-label">Tour Category</span>
                                <select id="tourCategory" class="select-soft" required>
                                    <option value="Island Hopping">Island Hopping</option>
                                    <option value="Hiking">Hiking</option>
                                    <option value="Food Tour">Food Tour</option>
                                    <option value="Cultural Tour">Cultural Tour</option>
                                    <option value="City Tour">City Tour</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Historical">Historical</option>
                                </select>
                            </label>
                            <label>
                                <span class="field-label">Tour Duration</span>
                                <select id="tourDuration" class="select-soft" required>
                                    <option value="Half day">Half day</option>
                                    <option value="1 day">1 day</option>
                                    <option value="2 days">2 days</option>
                                    <option value="Multi-day">Multi-day</option>
                                </select>
                            </label>
                            <label>
                                <span class="field-label">Province</span>
                                <input id="tourProvince" class="input-soft" type="text" required>
                            </label>
                            <label>
                                <span class="field-label">City / Municipality</span>
                                <input id="tourCity" class="input-soft" type="text" required>
                            </label>
                            <label class="full">
                                <span class="field-label">Specific Meeting Area</span>
                                <input id="tourMeetingArea" class="input-soft" type="text" required>
                            </label>
                            <label class="full">
                                <span class="field-label">Meeting Point</span>
                                <input id="tourMeetingPoint" class="input-soft" type="text" placeholder="Main tourist pickup point" required>
                            </label>

                            <div class="full mt-2"><h3 class="h6 mb-1">Add Image</h3></div>
                            <label class="full">
                                <span class="field-label">Main Cover & Gallery Images (3 to 5)</span>
                                <input id="tourImages" class="input-soft" type="file" accept="image/*" multiple>
                                <div class="guide-image-tools mt-2">
                                    <small id="tourImageMeta" class="text-muted">No images selected yet.</small>
                                    <button id="tourClearImages" class="btn-soft py-1 px-2" type="button">Clear images</button>
                                </div>
                                <div id="tourImagePreview" class="post-gallery guide-gallery mt-2"></div>
                            </label>

                            <div class="full mt-2"><h3 class="h6 mb-1">Pricing & Booking Settings</h3></div>
                            <label>
                                <span class="field-label">Base Price (₱)</span>
                                <input id="tourPrice" class="input-soft" type="number" min="1" required>
                            </label>
                            <label>
                                <span class="field-label">Price Type</span>
                                <select id="tourPriceType" class="select-soft" required>
                                    <option value="Per person">Per person</option>
                                    <option value="Per group">Per group</option>
                                </select>
                            </label>
                            <label>
                                <span class="field-label">Minimum Guests</span>
                                <input id="tourMinGuests" class="input-soft" type="number" min="1" value="1" required>
                            </label>
                            <label>
                                <span class="field-label">Maximum Guests</span>
                                <input id="tourMaxGuests" class="input-soft" type="number" min="1" value="10" required>
                            </label>
                            <label class="full">
                                <span class="field-label">Guest Type Support</span>
                                <div class="d-flex flex-wrap gap-3 mt-1">
                                    <label class="d-flex align-items-center gap-2"><input id="tourGuestAdult" type="checkbox" value="Adult" checked>Adult</label>
                                    <label class="d-flex align-items-center gap-2"><input id="tourGuestChildren" type="checkbox" value="Children">Children</label>
                                    <label class="d-flex align-items-center gap-2"><input id="tourGuestSenior" type="checkbox" value="Senior">Senior</label>
                                </div>
                            </label>
                            <label class="full">
                                <span class="field-label">Available Time Slots (comma separated)</span>
                                <input id="tourTimeSlots" class="input-soft" type="text" placeholder="08:00 AM, 01:00 PM, 05:00 PM" required>
                            </label>
                            <label>
                                <span class="field-label">Reservation Type</span>
                                <select id="tourReservationType" class="select-soft" required>
                                    <option value="Instant booking">Instant booking</option>
                                    <option value="Manual approval">Manual approval</option>
                                </select>
                            </label>

                            <div class="full mt-2"><h3 class="h6 mb-1">Tour Details</h3></div>
                            <label class="full d-flex align-items-center gap-2"><input id="tourFreeCancellation" type="checkbox" checked>Free Cancellation</label>
                            <label class="full">
                                <span class="field-label">Cancellation Description</span>
                                <textarea id="tourCancellationText" class="input-soft" rows="2">Cancel up to 24 hours in advance for a full refund</textarea>
                            </label>
                            <label class="full d-flex align-items-center gap-2"><input id="tourReservePayLater" type="checkbox" checked>Reserve Now & Pay Later</label>
                            <label>
                                <span class="field-label">Languages Spoken</span>
                                <input id="tourLanguages" class="input-soft" type="text" placeholder="English, Filipino, Cebuano" required>
                            </label>
                            <label>
                                <span class="field-label">Tour Includes</span>
                                <textarea id="tourIncludes" class="input-soft" rows="2" placeholder="Boat transfer, Meals, Entrance fees"></textarea>
                            </label>
                            <label>
                                <span class="field-label">Tour Excludes</span>
                                <textarea id="tourExcludes" class="input-soft" rows="2"></textarea>
                            </label>
                            <label>
                                <span class="field-label">Requirements / Reminders</span>
                                <textarea id="tourRequirements" class="input-soft" rows="2"></textarea>
                            </label>
                            <label class="full">
                                <span class="field-label">Safety Information</span>
                                <textarea id="tourSafetyInfo" class="input-soft" rows="2"></textarea>
                            </label>

                            
                            <div class="full mt-2"><h3 class="h6 mb-1">Preview Card Information & Attributes</h3></div>
                            <label>
                                <span class="field-label">Difficulty Level</span>
                                <select id="tourDifficulty" class="select-soft" required>
                                    <option value="Easy">Easy</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </label>
                            <label>
                                <span class="field-label">Activity Tags (comma separated)</span>
                                <input id="tourTags" class="input-soft" type="text" placeholder="Snorkeling, Hiking, Beach">
                            </label>
                            <label>
                                <span class="field-label">Weather Suitability</span>
                                <input id="tourWeather" class="input-soft" type="text" placeholder="Sunny, light rain">
                            </label>
                            <label>
                                <span class="field-label">Best Season</span>
                                <input id="tourBestSeason" class="input-soft" type="text" placeholder="December to May">
                            </label>
                            <label class="d-flex align-items-center gap-2"><input id="tourChildFriendly" type="checkbox">Child Friendly</label>
                            <label class="d-flex align-items-center gap-2"><input id="tourPetFriendly" type="checkbox">Pet Friendly</label>

                            <div class="full d-flex flex-wrap gap-2 mt-2">
                                <button id="tourSaveDraft" class="btn-soft" type="button"><i class="fa-regular fa-floppy-disk me-2"></i>Save Draft</button>
                                <button class="btn-gold" type="submit"><i class="fa-solid fa-paper-plane me-2"></i>Publish / Update Listing</button>
                                <button id="tourFormReset" class="btn-soft" type="button">Reset</button>
                            </div>
                        </form>
                    </article>

                    <article class="surface p-3 p-md-4">
                        <h2 class="h4 mb-3">Current Listings</h2>
                        <div id="guideToursList" class="guide-layout-grid"></div>
                        <div id="guideToursEmpty" class="guide-empty" style="display:none;">No listings yet. Create your first tour listing.</div>
                    </article>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/guide.js') }}"></script>
</body>
</html>
