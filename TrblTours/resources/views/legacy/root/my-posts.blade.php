<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Tribaltours My Posts</title>    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
</head>
<body class="account-page" data-page="my-posts" data-require-auth="true">
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
                    <h1 class="page-title">My Posts</h1>
                </section>

                <section class="stats-row">
                    <article class="stat-card"><p class="text-muted small">Total Requests</p><p id="statTotalRequests" class="value" data-request-stats="total_requests">{{ (int) data_get($stats ?? [], 'total_requests', 0) }}</p></article>
                    <article class="stat-card"><p class="text-muted small">Open</p><p id="statOpenRequests" class="value" style="color:#1f5fa6;" data-request-stats="open_requests">{{ (int) data_get($stats ?? [], 'open_requests', 0) }}</p></article>
                    <article class="stat-card"><p class="text-muted small">Selected Guides</p><p id="statSelectedGuides" class="value" style="color:#8f6512;" data-request-stats="selected_guides">{{ (int) data_get($stats ?? [], 'selected_guides', 0) }}</p></article>
                </section>

                <section class="request-manage-grid">
                    <article class="request-manage-card" data-request-id="tagum-1" data-tour-id="elnido">
                        <div class="request-top">
                            <div class="post-identity">
                                <img class="tourist-avatar" src="{{ asset('images/39.jpg') }}" alt="Alyssa Mae Rivera">
                                <div>
                                    <p class="tourist-name mb-0"><strong data-field="posted_by">Alyssa Mae Rivera</strong></p>
                                    <p class="small text-muted mb-0">Tourist</p>
                                </div>
                            </div>
                            <span class="badge-status badge-open">Open</span>
                        </div>
                        <div class="request-body">
                        <h2 class="h5 mb-1" data-field="title">Island Hopping &amp; Hidden Lagoons</h2>
                        <p class="small text-muted mb-0">Location: <span data-field="location">El Nido, Palawan</span></p>
                        <div class="row mt-3 g-2 small text-muted">
                            <div class="col-md-4">Rating: <strong class="text-dark"><span data-field="rating">4.93</span> (<span data-field="reviews">89</span>)</strong></div>
                            <div class="col-md-4">Duration: <strong class="text-dark" data-field="duration">2 days</strong></div>
                            <div class="col-md-4">Capacity: <strong class="text-dark" data-field="pax">2-12 pax</strong></div>
                            <div class="col-md-4">Difficulty: <strong class="text-dark" data-field="difficulty">Moderate</strong></div>
                            <div class="col-md-4">Price: <strong class="text-dark" data-field="price">PHP 3,800 / person</strong></div>
                        </div>
                        <p class="small text-muted mt-2 mb-2" data-field="description">Cruise through crystal waters, hidden lagoons, and island beaches with a guide focused on safety and premium island experiences.</p>
                        <div class="tag-row" data-field="tags"><span class="soft-tag">Island Hopping</span><span class="soft-tag">Snorkeling</span><span class="soft-tag">Beach</span></div>
                        </div>

                        <div class="negotiation-box">
                            <div class="offer-item"><strong>Guide Carlo</strong>: I can include banana farm and lunch stop. Offer PHP 4,900.<div class="mt-2"><button type="button" class="btn-gold" data-select-guide="Guide Carlo"><i class="fa-solid fa-user-check me-1"></i>Select Guide</button></div></div>
                            <div class="offer-item"><strong>Guide Mica</strong>: Private van + night market add-on, PHP 5,100.<div class="mt-2"><button type="button" class="btn-gold" data-select-guide="Guide Mica"><i class="fa-solid fa-user-check me-1"></i>Select Guide</button></div></div>
                            <form data-reply-form>
                                <label class="field-label" for="reply1">Reply</label>
                                <textarea id="reply1" class="input-soft" rows="2" placeholder="Send a message to guides..."></textarea>
                                <div class="d-flex gap-2 mt-2">
                                    <button type="submit" class="btn-charcoal">Reply</button>
                                    <button type="button" class="btn-danger"><i class="fa-regular fa-flag me-1"></i>Report</button>
                                </div>
                            </form>
                        </div>

                        <div class="d-flex gap-2 mt-3 flex-wrap">
                            <button class="btn-ghost" data-toggle-thread><i class="fa-regular fa-comments me-1"></i>View Negotiation</button>
                            <button class="btn-soft" type="button" data-edit-request data-bs-toggle="modal" data-bs-target="#editRequestModal"><i class="fa-regular fa-pen-to-square me-1"></i>Edit</button>
                            <button class="btn-danger" data-cancel-request><i class="fa-solid fa-xmark me-1"></i>Cancel</button>
                            <button class="btn-gold" data-complete-request><i class="fa-solid fa-check me-1"></i>Mark Complete</button>
                        </div>
                    </article>

                    <article class="request-manage-card" data-request-id="tagum-2" data-tour-id="bohol">
                        <div class="request-top">
                            <div class="post-identity">
                                <img class="tourist-avatar" src="{{ asset('images/caoursel1.webp') }}" alt="Marco Luis Santos">
                                <div>
                                    <p class="tourist-name mb-0"><strong data-field="posted_by">Marco Luis Santos</strong></p>
                                    <p class="small text-muted mb-0">Tourist</p>
                                </div>
                            </div>
                            <span class="badge-status badge-open">Open</span>
                        </div>
                        <div class="request-body">
                        <h2 class="h5 mb-1" data-field="title">Chocolate Hills &amp; Tarsier Sanctuary</h2>
                        <p class="small text-muted mb-0">Location: <span data-field="location">Bohol, Philippines</span></p>
                        <div class="row mt-3 g-2 small text-muted">
                            <div class="col-md-4">Rating: <strong class="text-dark"><span data-field="rating">4.97</span> (<span data-field="reviews">142</span>)</strong></div>
                            <div class="col-md-4">Duration: <strong class="text-dark" data-field="duration">2 days</strong></div>
                            <div class="col-md-4">Capacity: <strong class="text-dark" data-field="pax">2-8 pax</strong></div>
                            <div class="col-md-4">Difficulty: <strong class="text-dark" data-field="difficulty">Easy</strong></div>
                            <div class="col-md-4">Price: <strong class="text-dark" data-field="price">PHP 2,500 / person</strong></div>
                        </div>
                        <p class="small text-muted mt-2 mb-2" data-field="description">Walk through scenic forest paths, discover the iconic Chocolate Hills, and experience local wildlife with a verified local host.</p>
                        <div class="tag-row" data-field="tags"><span class="soft-tag">Nature</span><span class="soft-tag">Wildlife</span><span class="soft-tag">Scenic</span></div>
                        </div>

                        <div class="negotiation-box">
                            <div class="offer-item"><strong>Guide Liza</strong>: Includes local chef host and tasting route. PHP 5,600.<div class="mt-2"><button type="button" class="btn-gold" data-select-guide="Guide Liza"><i class="fa-solid fa-user-check me-1"></i>Select Guide</button></div></div>
                            <form data-reply-form>
                                <label class="field-label" for="reply2">Reply</label>
                                <textarea id="reply2" class="input-soft" rows="2" placeholder="Reply to this offer..."></textarea>
                                <div class="d-flex gap-2 mt-2">
                                    <button type="submit" class="btn-charcoal">Reply</button>
                                    <button type="button" class="btn-danger"><i class="fa-regular fa-flag me-1"></i>Report</button>
                                </div>
                            </form>
                        </div>

                        <div class="d-flex gap-2 mt-3 flex-wrap">
                            <button class="btn-ghost" data-toggle-thread><i class="fa-regular fa-comments me-1"></i>View Negotiation</button>
                            <button class="btn-soft" type="button" data-edit-request data-bs-toggle="modal" data-bs-target="#editRequestModal"><i class="fa-regular fa-pen-to-square me-1"></i>Edit</button>
                            <button class="btn-danger" data-cancel-request><i class="fa-solid fa-xmark me-1"></i>Cancel</button>
                            <button class="btn-gold" data-complete-request><i class="fa-solid fa-check me-1"></i>Mark Complete</button>
                        </div>
                    </article>

                    <article class="request-manage-card" data-request-id="tagum-3" data-tour-id="coron">
                        <div class="request-top">
                            <div class="post-identity">
                                <img class="tourist-avatar" src="{{ asset('images/manila.jpg') }}" alt="Patricia Anne Cruz">
                                <div>
                                    <p class="tourist-name mb-0"><strong data-field="posted_by">Patricia Anne Cruz</strong></p>
                                    <p class="small text-muted mb-0">Tourist</p>
                                </div>
                            </div>
                            <span class="badge-status badge-open">Open</span>
                        </div>
                        <div class="request-body">
                        <h2 class="h5 mb-1" data-field="title">Shipwreck Diving &amp; Kayangan Lake</h2>
                        <p class="small text-muted mb-0">Location: <span data-field="location">Coron, Palawan</span></p>
                        <div class="row mt-3 g-2 small text-muted">
                            <div class="col-md-4">Rating: <strong class="text-dark"><span data-field="rating">4.88</span> (<span data-field="reviews">176</span>)</strong></div>
                            <div class="col-md-4">Duration: <strong class="text-dark" data-field="duration">2 days</strong></div>
                            <div class="col-md-4">Capacity: <strong class="text-dark" data-field="pax">2-10 pax</strong></div>
                            <div class="col-md-4">Difficulty: <strong class="text-dark" data-field="difficulty">Moderate</strong></div>
                            <div class="col-md-4">Price: <strong class="text-dark" data-field="price">PHP 4,500 / person</strong></div>
                        </div>
                        <p class="small text-muted mt-2 mb-2" data-field="description">Dive legendary wreck sites and unwind at Kayangan Lake with guided routes designed for scenic and safe exploration.</p>
                        <div class="tag-row" data-field="tags"><span class="soft-tag">Diving</span><span class="soft-tag">Snorkeling</span><span class="soft-tag">Shipwreck</span></div>
                        </div>

                        <div class="negotiation-box">
                            <div class="offer-item"><strong>Guide Anne</strong>: Child-safe itinerary with river park and farm stay. PHP 6,800.<div class="mt-2"><button type="button" class="btn-gold" data-select-guide="Guide Anne"><i class="fa-solid fa-user-check me-1"></i>Select Guide</button></div></div>
                            <form data-reply-form>
                                <label class="field-label" for="reply3">Reply</label>
                                <textarea id="reply3" class="input-soft" rows="2" placeholder="Respond to negotiation..."></textarea>
                                <div class="d-flex gap-2 mt-2">
                                    <button type="submit" class="btn-charcoal">Reply</button>
                                    <button type="button" class="btn-danger"><i class="fa-regular fa-flag me-1"></i>Report</button>
                                </div>
                            </form>
                        </div>

                        <div class="d-flex gap-2 mt-3 flex-wrap">
                            <button class="btn-ghost" data-toggle-thread><i class="fa-regular fa-comments me-1"></i>View Negotiation</button>
                            <button class="btn-soft" type="button" data-edit-request data-bs-toggle="modal" data-bs-target="#editRequestModal"><i class="fa-regular fa-pen-to-square me-1"></i>Edit</button>
                            <button class="btn-danger" data-cancel-request><i class="fa-solid fa-xmark me-1"></i>Cancel</button>
                            <button class="btn-gold" data-complete-request><i class="fa-solid fa-check me-1"></i>Mark Complete</button>
                        </div>
                    </article>
                </section>

                <button class="btn-gold floating-create" type="button" data-bs-toggle="modal" data-bs-target="#createRequestModal" aria-label="Create Tour Request">
                    <i class="fa-solid fa-plus me-2"></i>Create Tour Request
                </button>
            </main>
        </div>
    </div>

    <div class="modal fade" id="createRequestModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Create Tour Request</h2>
                    <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
                </div>
                <form id="createRequestForm" class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="field-label" for="reqTitle">Title</label>
                            <input id="reqTitle" name="title" class="input-soft" required type="text" placeholder="Tagum eco-tour with family">
                        </div>
                        <div class="col-md-4">
                            <label class="field-label" for="reqLocation">Destination</label>
                            <input id="reqLocation" name="location" class="input-soft" required type="text" placeholder="Tagum City">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="reqDuration">Duration</label>
                            <input id="reqDuration" name="duration" class="form-control" type="range" min="1" max="14" value="3">
                            <small id="reqDurationValue" class="text-muted">3 days</small>
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="reqRegion">Region</label>
                            <select id="reqRegion" class="select-soft" name="region" required>
                                <option value="Davao del Norte" selected>Davao del Norte</option>
                                <option value="National Capital Region (NCR)">National Capital Region (NCR)</option>
                                <option value="Cordillera Administrative Region (CAR)">Cordillera Administrative Region (CAR)</option>
                                <option value="Ilocos Region">Ilocos Region</option>
                                <option value="Cagayan Valley">Cagayan Valley</option>
                                <option value="Central Luzon">Central Luzon</option>
                                <option value="CALABARZON">CALABARZON</option>
                                <option value="MIMAROPA">MIMAROPA</option>
                                <option value="Bicol Region">Bicol Region</option>
                                <option value="Western Visayas">Western Visayas</option>
                                <option value="Central Visayas">Central Visayas</option>
                                <option value="Eastern Visayas">Eastern Visayas</option>
                                <option value="Zamboanga Peninsula">Zamboanga Peninsula</option>
                                <option value="Northern Mindanao">Northern Mindanao</option>
                                <option value="Davao Region">Davao Region</option>
                                <option value="SOCCSKSARGEN">SOCCSKSARGEN</option>
                                <option value="Caraga">Caraga</option>
                                <option value="Bangsamoro">Bangsamoro</option>
                                <option value="Negros Island Region">Negros Island Region</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="reqBudget">Budget</label>
                            <input id="reqBudget" name="budget" class="input-soft" type="number" min="100" value="3000">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label">Adults</label>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn-ghost" type="button" data-counter-btn="adultInput" data-counter-type="minus"><i class="fa-solid fa-minus"></i></button>
                                <input id="adultInput" name="adults" class="input-soft" type="number" value="1" min="1">
                                <button class="btn-ghost" type="button" data-counter-btn="adultInput" data-counter-type="plus"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <small class="text-muted">Adults count: <span id="adultsCount">1</span></small>
                        </div>
                        <div class="col-md-6">
                            <label class="field-label">Children</label>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn-ghost" type="button" data-counter-btn="childInput" data-counter-type="minus"><i class="fa-solid fa-minus"></i></button>
                                <input id="childInput" name="children" class="input-soft" type="number" value="0" min="0">
                                <button class="btn-ghost" type="button" data-counter-btn="childInput" data-counter-type="plus"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <small class="text-muted">Children count: <span id="childrenCount">0</span></small>
                        </div>
                        <div class="col-12">
                            <label class="field-label">Interests</label>
                            <div id="interestOptions" class="d-flex gap-3 flex-wrap">
                                <label><input type="checkbox" name="interests[]" value="Nature"> Nature</label>
                                <label><input type="checkbox" name="interests[]" value="Culture"> Culture</label>
                                <label><input type="checkbox" name="interests[]" value="Beach"> Beach</label>
                                <label><input type="checkbox" name="interests[]" value="Adventure"> Adventure</label>
                                <label><input type="checkbox" name="interests[]" value="Food"> Food</label>
                            </div>
                            <div class="d-flex gap-2 mt-2">
                                <input id="customInterestInput" class="input-soft" type="text" placeholder="Enter custom interest">
                                <button id="addInterestBtn" class="btn-soft" type="button">+ Add another</button>
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="field-label" for="reqDetails">Trip Details for Guide</label>
                            <textarea id="reqDetails" name="details" class="input-soft" rows="3" placeholder="Share your planned activities, preferences, pickup point, schedule, and any special needs."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer mt-3 px-0 pb-0">
                        <button class="btn-ghost" type="button" data-bs-dismiss="modal">Cancel</button>
                        <button class="btn-gold" type="submit">Create Request</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal fade" id="editRequestModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Edit Request</h2>
                    <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>
                <form id="editRequestForm" class="modal-body">
                    <input id="editRequestId" type="hidden">
                    <input id="editTourId" type="hidden">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="field-label" for="editDestination">Tour destination</label>
                            <input id="editDestination" class="input-soft" required type="text">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editTitle">Tour title</label>
                            <input id="editTitle" class="input-soft" required type="text">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editRating">Ratings</label>
                            <input id="editRating" class="input-soft" min="0" max="5" step="0.01" required type="number">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editReviews">Rating count</label>
                            <input id="editReviews" class="input-soft" min="0" required type="number">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editDuration">Duration</label>
                            <input id="editDuration" class="input-soft" required type="text" placeholder="2 days">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editPax">Pax capacity</label>
                            <input id="editPax" class="input-soft" required type="text" placeholder="2-12 pax">
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editDifficulty">Difficulty level</label>
                            <select id="editDifficulty" class="select-soft" required>
                                <option value="Easy">Easy</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Challenging">Challenging</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="field-label" for="editPricing">Pricing per person (PHP)</label>
                            <input id="editPricing" class="input-soft" min="1" required type="number">
                        </div>
                        <div class="col-12">
                            <label class="field-label" for="editTags">Categories / tags (comma separated)</label>
                            <input id="editTags" class="input-soft" required type="text" placeholder="Island Hopping, Snorkeling, Beach">
                        </div>
                        <div class="col-12">
                            <label class="field-label" for="editDescription">Description</label>
                            <textarea id="editDescription" class="input-soft" rows="3" required></textarea>
                        </div>
                        <div class="col-12">
                            <label class="field-label" for="editImages">Uploaded images</label>
                            <input id="editImages" class="input-soft" type="file" accept="image/*" multiple>
                            <small class="text-muted d-block mt-1">Leave empty to keep current images.</small>
                            <div id="editImagePreview" class="post-gallery modal-gallery"></div>
                        </div>
                    </div>
                    <div class="modal-footer px-0 pb-0">
                        <button class="btn btn-light" type="button" data-bs-dismiss="modal">Close</button>
                        <button class="btn-gold" type="submit"><i class="fa-solid fa-floppy-disk me-2"></i>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal fade" id="selectGuideConfirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="h5 mb-0">Confirm Guide Selection</h2>
                    <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-2">You are about to select <strong id="selectGuideConfirmName">this guide</strong> for <strong id="selectGuideConfirmRequest">your request</strong>.</p>
                    <p class="small text-muted mb-0" id="selectGuideConfirmAmount">This will lock negotiation offers and move communication to private chat.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" type="button" data-bs-dismiss="modal">Cancel</button>
                    <button id="confirmSelectGuideBtn" class="btn-gold" type="button"><i class="fa-solid fa-user-check me-1"></i>Select Guide</button>
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
