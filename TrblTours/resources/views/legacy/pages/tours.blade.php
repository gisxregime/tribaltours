<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>My Tours | Tribaltours Guide</title>
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
                    <h1 class="guide-page-title">My Tours</h1>
                </section>

                <section class="guide-two-col align-items-start">
                    <article class="surface p-3 p-md-4">
                        <h2 class="h4 mb-3">Create Tour Listing</h2>
                        <form id="tourForm" class="guide-form-grid">
                            <input id="tourId" type="hidden">

                            <div class="full"><h3 class="h6 mb-1">Tour Information</h3></div>
                            
                            <label class="full">
                                <span class="field-label">Tour Title</span>
                                <input id="tourTitle" class="input-soft" type="text" placeholder="Island Hopping & Hidden Lagoons" required>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Short Description</span>
                                <textarea id="tourShortDescription" class="input-soft" rows="3" placeholder="Brief overview of your tour experience" required></textarea>
                            </label>
                            
                            <label>
                                <span class="field-label">Tour Category</span>
                                <select id="tourCategory" class="select-soft" required>
                                    <option value="">Select a category</option>
                                    <option value="Island Hopping">Island Hopping</option>
                                    <option value="Diving">Diving</option>
                                    <option value="Hiking">Hiking</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Food Tour">Food Tour</option>
                                    <option value="City Tour">City Tour</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Historical">Historical</option>
                                    <option value="Beach">Beach</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Photography">Photography</option>
                                </select>
                            </label>
                            
                            <label>
                                <span class="field-label">Tour Duration</span>
                                <input id="tourDuration" class="input-soft" type="text" placeholder="e.g., Half Day, Full Day, 2 Days, 3 Days" required>
                            </label>
                            
                            <label>
                                <span class="field-label">Region</span>
                                <select id="tourRegion" class="select-soft" required>
                                    <option value="">Select a region</option>
                                    <option value="Region I - Ilocos Region">Region I – Ilocos Region</option>
                                    <option value="Region II - Cagayan Valley">Region II – Cagayan Valley</option>
                                    <option value="Region III - Central Luzon">Region III – Central Luzon</option>
                                    <option value="CAR - Cordillera">CAR – Cordillera Administrative Region</option>
                                    <option value="Region IV-A - CALABARZON">Region IV-A – CALABARZON</option>
                                    <option value="MIMAROPA">MIMAROPA – Mindoro, Marinduque, Romblon, Palawan</option>
                                    <option value="Region V - Bicol">Region V – Bicol Region</option>
                                    <option value="Region VI - Western Visayas">Region VI – Western Visayas</option>
                                    <option value="Region VII - Central Visayas">Region VII – Central Visayas</option>
                                    <option value="Region VIII - Eastern Visayas">Region VIII – Eastern Visayas</option>
                                    <option value="Region IX - Zamboanga">Region IX – Zamboanga Peninsula</option>
                                    <option value="Region X - Northern Mindanao">Region X – Northern Mindanao</option>
                                    <option value="Region XI - Davao">Region XI – Davao Region</option>
                                    <option value="Region XII - SOCCSKSARGEN">Region XII – SOCCSKSARGEN</option>
                                    <option value="Region XIII - Caraga">Region XIII – Caraga</option>
                                    <option value="NCR - National Capital Region">NCR – National Capital Region</option>
                                    <option value="ARMM">ARMM – Autonomous Region in Muslim Mindanao</option>
                                    <option value="BARMM">BARMM – Bangsamoro Autonomous Region</option>
                                </select>
                            </label>
                            
                            <label>
                                <span class="field-label">City / Municipality</span>
                                <input id="tourCity" class="input-soft" type="text" placeholder="e.g., Puerto Princesa" required>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Specific Meeting Area</span>
                                <input id="tourMeetingArea" class="input-soft" type="text" placeholder="e.g., City Center, Puerto Princesa Cityport" required>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Meeting Point</span>
                                <input id="tourMeetingPoint" class="input-soft" type="text" placeholder="Exact meeting point details for tourists" required>
                            </label>

                            <div class="full mt-3"><h3 class="h6 mb-1">Images</h3></div>
                            <label class="full">
                                <span class="field-label">Add Images (3 to 5 required)</span>
                                <input id="tourImages" class="input-soft" type="file" accept="image/*" multiple>
                                <div class="guide-image-tools mt-2">
                                    <small id="tourImageMeta" class="text-muted">No images selected yet.</small>
                                    <button id="tourClearImages" class="btn-soft py-1 px-2" type="button">Clear images</button>
                                </div>
                                <div id="tourImagePreview" class="post-gallery guide-gallery mt-2"></div>
                            </label>

                            <div class="full mt-3"><h3 class="h6 mb-1">Pricing & Capacity</h3></div>
                            <label>
                                <span class="field-label">Base Price (₱)</span>
                                <input id="tourPrice" class="input-soft" type="number" min="1" placeholder="e.g., 1500" required>
                            </label>
                            
                            <label>
                                <span class="field-label">Per person or Per group</span>
                                <select id="tourPriceType" class="select-soft" required>
                                    <option value="per_person">Per person</option>
                                    <option value="per_group">Per group</option>
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

                            <div class="full mt-3"><h3 class="h6 mb-1">Availability</h3></div>
                            <label class="full">
                                <span class="field-label">Available Time Slots (comma separated)</span>
                                <input id="tourTimeSlots" class="input-soft" type="text" placeholder="08:00 AM, 01:00 PM, 05:00 PM" required>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Reservation Type</span>
                                <select id="tourReservationType" class="select-soft" required>
                                    <option value="instant">Instant Booking</option>
                                    <option value="manual">Manual Approval</option>
                                </select>
                                <small class="text-muted d-block mt-1">Instant: Tourist books and pays immediately. Manual: You approve/reject each booking.</small>
                            </label>

                            <div class="full mt-3"><h3 class="h6 mb-1">Tour Details</h3></div>
                            <label>
                                <span class="field-label">Languages Spoken</span>
                                <input id="tourLanguages" class="input-soft" type="text" placeholder="English, Filipino, Cebuano" required>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Tour Includes</span>
                                <textarea id="tourIncludes" class="input-soft" rows="2" placeholder="Boat transfer, Meals, Entrance fees, Guide service" required></textarea>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Tour Excludes</span>
                                <textarea id="tourExcludes" class="input-soft" rows="2" placeholder="Travel insurance, Personal expenses, Tips"></textarea>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Requirements / Reminders</span>
                                <textarea id="tourRequirements" class="input-soft" rows="2" placeholder="Bring swimwear, sunscreen, water bottle, etc."></textarea>
                            </label>
                            
                            <label class="full">
                                <span class="field-label">Safety Information</span>
                                <textarea id="tourSafetyInfo" class="input-soft" rows="2" placeholder="Safety guidelines, equipment provided, age restrictions, etc."></textarea>
                            </label>

                            <div class="full d-flex flex-wrap gap-2 mt-3">
                                <button id="tourSaveDraft" class="btn-soft" type="button"><i class="fa-regular fa-floppy-disk me-2"></i>Save Draft</button>
                                <button class="btn-gold" type="submit"><i class="fa-solid fa-paper-plane me-2"></i>Publish Listing</button>
                                <button id="tourFormReset" class="btn-soft" type="button">Reset</button>
                            </div>
                        </form>
                    </article>

                    <article class="surface p-3 p-md-4">
                        <h2 class="h4 mb-3">Tour Listings</h2>
                        <div id="guideToursList" class="guide-layout-grid"></div>
                        <div id="guideToursEmpty" class="guide-empty" style="display:none;">No listings yet. Create your first tour listing.</div>
                    </article>
                </section>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        (function () {
            function closestFromEventTarget(event, selector) {
                var target = event ? event.target : null;
                if (!target) {
                    return null;
                }
                if (typeof target.closest === 'function') {
                    return target.closest(selector);
                }
                if (target.parentElement && typeof target.parentElement.closest === 'function') {
                    return target.parentElement.closest(selector);
                }
                return null;
            }

            function parseJsonSafe(response) {
                var contentType = String(response.headers.get('content-type') || '').toLowerCase();
                if (contentType.indexOf('application/json') === -1) {
                    return Promise.resolve({});
                }
                return response.json().catch(function () {
                    return {};
                });
            }

            function fallbackDeleteTourRequest(tourId) {
                var csrfMeta = document.querySelector('meta[name="csrf-token"]');
                var csrf = csrfMeta ? String(csrfMeta.getAttribute('content') || '') : '';
                var headers = {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                };
                if (csrf) {
                    headers['X-CSRF-TOKEN'] = csrf;
                }

                return fetch('/guide/tours/' + encodeURIComponent(String(tourId)), {
                    method: 'DELETE',
                    credentials: 'same-origin',
                    headers: headers
                }).then(function (response) {
                    if (response.redirected) {
                        throw new Error('Delete request redirected unexpectedly.');
                    }
                    return parseJsonSafe(response).then(function (data) {
                        if (!response.ok) {
                            var message = data && data.message ? String(data.message) : 'Unable to delete listing right now.';
                            throw new Error(message);
                        }
                        return data;
                    });
                });
            }

            function toggleEmptyState() {
                var listHost = document.getElementById('guideToursList');
                var empty = document.getElementById('guideToursEmpty');
                if (!listHost || !empty) {
                    return;
                }
                empty.style.display = listHost.querySelector('[data-tour-id]') ? 'none' : '';
            }

            document.addEventListener('DOMContentLoaded', function () {
                var listHost = document.getElementById('guideToursList');
                if (!listHost) {
                    return;
                }

                listHost.addEventListener('click', function (event) {
                    var deleteBtn = closestFromEventTarget(event, '[data-delete-tour]');
                    if (!deleteBtn) {
                        return;
                    }

                    // Primary path: allow native form submit for reliable server-side deletion.
                    if (deleteBtn.form) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();
                    if (typeof event.stopImmediatePropagation === 'function') {
                        event.stopImmediatePropagation();
                    }

                    var tourId = String(deleteBtn.getAttribute('data-delete-tour') || '').trim();
                    if (!tourId) {
                        return;
                    }

                    deleteBtn.disabled = true;
                    var card = deleteBtn.closest('[data-tour-id]');

                    var deleter = window.TRBL_GUIDE_DELETE_TOUR;
                    var runDelete = typeof deleter === 'function'
                        ? Promise.resolve(deleter(tourId))
                        : fallbackDeleteTourRequest(tourId).then(function () {
                            if (card) {
                                card.remove();
                            }
                            toggleEmptyState();
                        });

                    runDelete.catch(function (error) {
                        deleteBtn.disabled = false;
                        var message = error && error.message ? error.message : 'Unable to delete listing right now.';
                        if (window.console && typeof window.console.error === 'function') {
                            window.console.error(message);
                        }

                        // Last-resort fallback: submit the form action directly.
                        var deleteForm = deleteBtn.form || closestFromEventTarget(event, 'form');
                        if (deleteForm && typeof deleteForm.submit === 'function') {
                            deleteForm.submit();
                        }
                    });
                }, true);
            });
        })();
    </script>
    <script src="{{ asset('assets/guide.js') }}?v={{ filemtime(public_path('assets/guide.js')) }}"></script>
</body>
</html>
