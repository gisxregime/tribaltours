// TOURIST WORKSPACE IMPLEMENTATION
// File: public/assets/app.js - Add these functions and pages

// === NEW PAGE: initExploreTours() ===
function initExploreTours() {
    if (document.body.dataset.page !== 'explore-tours') {
        return;
    }

    const searchInput = qs('#tourSearch');
    const filterCategory = qs('#tourFilterCategory');
    const filterRegion = qs('#tourFilterRegion');
    const toursGrid = qs('#toursGrid');
    const emptyState = qs('#toursEmpty');
    const sortSelect = qs('#tourSort');
    
    let allTours = [];
    let filteredTours = [];

    function renderTourCards() {
        toursGrid.innerHTML = '';
        
        if (!filteredTours.length) {
            if (emptyState) emptyState.style.display = '';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';

        filteredTours.forEach(function(tour) {
            const card = document.createElement('article');
            card.className = 'tour-card';
            card.innerHTML = [
                '<div class="tour-card-image">',
                '<img src="', escapeHtml(tour.cover_image_path || 'images/pangasinan.jpg'), '" alt="', escapeHtml(tour.title), '">',
                '</div>',
                '<div class="tour-card-body">',
                '<h3 class="h6 mb-1">', escapeHtml(tour.title), '</h3>',
                '<p class="small text-muted mb-2">', escapeHtml(tour.short_description.substring(0, 80) + '...'), '</p>',
                '<div class="d-flex justify-content-between align-items-center mb-2">',
                '<span class="badge">', escapeHtml(tour.category), '</span>',
                tour.rating_avg > 0 ? '<span class="text-warning"><i class="fa-solid fa-star"></i> ' + Number(tour.rating_avg).toFixed(1) + '</span>' : '',
                '</div>',
                '<p class="small text-muted mb-1">📍 ', escapeHtml(tour.city + ', ' + tour.region), '</p>',
                '<p class="small mb-2">⏱️ ', escapeHtml(tour.duration_label), '</p>',
                '<p class="small mb-2">👥 ', escapeHtml(tour.min_guests + ' - ' + tour.max_guests + ' guests'), '</p>',
                '<p class="price mb-2">₱', Number(tour.price).toLocaleString(), ' / ', (tour.price_type === 'per_person' ? 'person' : 'group'), '</p>',
                '<button class="btn-gold w-100" data-view-tour="', escapeHtml(tour.id), '">View Tour</button>',
                '</div>'
            ].join('');
            toursGrid.appendChild(card);
        });
    }

    function applyFilters() {
        const search = (searchInput ? searchInput.value : '').toLowerCase();
        const category = filterCategory ? filterCategory.value : '';
        const region = filterRegion ? filterRegion.value : '';

        filteredTours = allTours.filter(function(tour) {
            const matchSearch = !search || tour.title.toLowerCase().includes(search) || tour.short_description.toLowerCase().includes(search);
            const matchCategory = !category || tour.category === category;
            const matchRegion = !region || tour.region === region;
            return matchSearch && matchCategory && matchRegion;
        });

        const sort = sortSelect ? sortSelect.value : 'latest';
        if (sort === 'price-low') {
            filteredTours.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            filteredTours.sort((a, b) => b.price - a.price);
        } else if (sort === 'rating') {
            filteredTours.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        }
        // else: default 'latest' order from API

        renderTourCards();
    }

    function syncToursFromApi() {
        return apiRequest('/tourist/tours/explore').then(function(data) {
            allTours = data && Array.isArray(data.tours) ? data.tours : [];
            applyFilters();
        }).catch(function() {
            showToast('Unable to load tours.', 'danger');
        });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (filterRegion) filterRegion.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    toursGrid.addEventListener('click', function(event) {
        const viewBtn = event.target.closest('[data-view-tour]');
        if (viewBtn) {
            const tourId = viewBtn.dataset.viewTour;
            window.location.href = '/tourist/tour/' + encodeURIComponent(tourId);
        }
    });

    syncToursFromApi();
}

// === NEW PAGE: initTourDetail() ===
function initTourDetail() {
    if (document.body.dataset.page !== 'tour-detail') {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('tour') || window.location.pathname.split('/').pop();
    
    const tourTitle = qs('.tour-detail-title');
    const tourImage = qs('.tour-detail-image');
    const tourGallery = qs('.tour-gallery');
    const bookingForm = qs('#bookTourForm');
    const guestCount = qs('#bookingGuestCount');
    const selectedDate = qs('#bookingDate');
    const selectedTime = qs('#bookingTime');

    function renderTourDetail(tour) {
        if (tourTitle) tourTitle.textContent = tour.title;
        
        // Image gallery
        if (tourImage && tour.gallery_paths && tour.gallery_paths.length) {
            tourImage.src = tour.gallery_paths[0];
        }
        
        if (tourGallery) {
            tourGallery.innerHTML = (tour.gallery_paths || []).map(function(src, idx) {
                return '<img src="' + escapeHtml(src) + '" alt="Tour image ' + (idx+1) + '" class="gallery-thumb" data-src="' + escapeHtml(src) + '">';
            }).join('');
            
            qsa('.gallery-thumb', tourGallery).forEach(function(thumb) {
                thumb.addEventListener('click', function() {
                    if (tourImage) tourImage.src = thumb.dataset.src;
                });
            });
        }

        // Populate detail sections
        const detail = qs('[data-tour-detail]');
        if (detail) {
            detail.innerHTML = [
                '<div class="tour-detail-section">',
                '<h3>Tour Information</h3>',
                '<p><strong>Category:</strong> ', escapeHtml(tour.category), '</p>',
                '<p><strong>Duration:</strong> ', escapeHtml(tour.duration_label), '</p>',
                '<p><strong>Location:</strong> ', escapeHtml(tour.city + ', ' + tour.region), '</p>',
                '<p><strong>Meeting Point:</strong> ', escapeHtml(tour.meeting_point), '</p>',
                '<p><strong>Price:</strong> ₱', Number(tour.price).toLocaleString(), ' per ', (tour.price_type === 'per_person' ? 'person' : 'group'), '</p>',
                '<p><strong>Group Size:</strong> ', escapeHtml(tour.min_guests + ' - ' + tour.max_guests + ' guests'), '</p>',
                '</div>',
                '<div class="tour-detail-section">',
                '<h3>Description</h3>',
                '<p>', escapeHtml(tour.short_description), '</p>',
                '</div>',
                '<div class="tour-detail-section">',
                '<h3>What\'s Included</h3>',
                '<ul>', (tour.includes || []).map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(''), '</ul>',
                '</div>',
                tour.excludes ? '<div class="tour-detail-section"><h3>What\'s Not Included</h3><p>' + escapeHtml(tour.excludes) + '</p></div>' : '',
                '<div class="tour-detail-section">',
                '<h3>Available Times</h3>',
                '<p>', escapeHtml((tour.time_slots || []).join(', ')), '</p>',
                '</div>',
                tour.requirements ? '<div class="tour-detail-section"><h3>Requirements</h3><p>' + escapeHtml(tour.requirements) + '</p></div>' : '',
                tour.safety_info ? '<div class="tour-detail-section"><h3>Safety Information</h3><p>' + escapeHtml(tour.safety_info) + '</p></div>' : '',
                '<div class="tour-detail-section">',
                '<h3>Languages</h3>',
                '<p>', escapeHtml(tour.languages), '</p>',
                '</div>'
            ].join('');
        }

        // Setup booking form
        if (guestCount) {
            guestCount.min = tour.min_guests;
            guestCount.max = tour.max_guests;
            guestCount.value = tour.min_guests;
        }
        
        if (selectedTime) {
            selectedTime.innerHTML = '<option value="">Select time</option>' + (tour.time_slots || []).map(function(slot) {
                return '<option value="' + escapeHtml(slot) + '">' + escapeHtml(slot) + '</option>';
            }).join('');
        }
    }

    function loadTourDetail() {
        return apiRequest('/tourist/tours/' + encodeURIComponent(tourId)).then(function(data) {
            const tour = data && data.tour ? data.tour : null;
            if (!tour) {
                showToast('Tour not found.', 'danger');
                window.location.href = '/tourist/explore-tours';
                return;
            }
            renderTourDetail(tour);
            
            if (bookingForm) {
                bookingForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const payload = {
                        tour_listing_id: tourId,
                        guest_count: Number(guestCount ? guestCount.value : 1),
                        booked_for_date: selectedDate ? selectedDate.value : null,
                        booked_for_time: selectedTime ? selectedTime.value : null
                    };
                    
                    apiRequest('/tourist/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
                        body: JSON.stringify(payload)
                    }).then(function(result) {
                        showToast('Booking created! Redirecting to payment...', 'success');
                        setTimeout(function() {
                            window.location.href = '/tourist/my-bookings';
                        }, 2000);
                    }).catch(function(err) {
                        showToast(err && err.message ? err.message : 'Unable to create booking.', 'danger');
                    });
                });
            }
        }).catch(function() {
            showToast('Unable to load tour details.', 'danger');
        });
    }

    loadTourDetail();
}

// Call from document initialization:
// initExploreTours();
// initTourDetail();
