(function () {
    const GUIDE_TOURS_KEY = 'tribaltours_guide_tours_v1';
    const GUIDE_BOOKINGS_KEY = 'tribaltours_guide_booking_requests_v1';
    const GUIDE_REVIEWS_KEY = 'tribaltours_guide_reviews_v1';
    const GUIDE_PROFILE_KEY = 'tribaltours_guide_profile_v1';
    const GUIDE_NOTIFICATIONS_KEY = 'tribaltours_guide_notifications_v1';
    const GUIDE_CONVERSATIONS_KEY = 'tribaltours_guide_conversations_v1';
    const GUIDE_TOUR_DRAFT_KEY = 'tribaltours_guide_tour_form_draft_v1';
    const TOURIST_REQUESTS_KEY = 'tribaltours_tourist_requests_v1';
    const ROLE_KEY = 'role';
    const STARTER_MESSAGE = "Hi! 👋 Welcome and thank you for choosing me as your guide. I'm excited to help make your trip enjoyable and memorable. Feel free to tell me your preferred destination, travel dates, group size, interests (adventure, culture, food, nature, etc.), or any questions you have. I'll help you plan the experience that fits you best.";
    const PENDING_NOTIFICATION_DELETE_DELAY = 4200;

    const pendingGuideNotificationDeletes = Object.create(null);

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function parseJSON(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (_error) {
            return fallback;
        }
    }

    function readStore(key, fallback) {
        return parseJSON(localStorage.getItem(key), fallback);
    }

    function writeStore(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function uid(prefix) {
        return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return map[char] || char;
        });
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function getToastHost() {
        let host = qs('#guideToastHost');
        if (!host) {
            host = document.createElement('div');
            host.id = 'guideToastHost';
            host.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(host);
        }
        return host;
    }

    function showToast(message, kind) {
        if (!window.bootstrap || !window.bootstrap.Toast) {
            return;
        }

        const host = getToastHost();
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-' + (kind || 'dark') + ' border-0';
        toast.setAttribute('role', 'status');
        toast.innerHTML = [
            '<div class="d-flex">',
            '<div class="toast-body">' + escapeHtml(message) + '</div>',
            '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>',
            '</div>'
        ].join('');
        host.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 2400 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }

    function showActionToast(message, actionLabel, onAction, kind, delay) {
        if (!window.bootstrap || !window.bootstrap.Toast) {
            return;
        }

        const host = getToastHost();
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-' + (kind || 'dark') + ' border-0';
        toast.setAttribute('role', 'status');

        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center';

        const body = document.createElement('div');
        body.className = 'toast-body';
        body.textContent = String(message || '');
        wrapper.appendChild(body);

        if (actionLabel && typeof onAction === 'function') {
            const actionButton = document.createElement('button');
            actionButton.type = 'button';
            actionButton.className = 'btn btn-sm btn-light me-2';
            actionButton.textContent = String(actionLabel);
            actionButton.addEventListener('click', function () {
                onAction();
                bsToast.hide();
            });
            wrapper.appendChild(actionButton);
        }

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close btn-close-white me-2 m-auto';
        closeButton.setAttribute('data-bs-dismiss', 'toast');
        wrapper.appendChild(closeButton);

        toast.appendChild(wrapper);
        host.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, { delay: Number(delay || 4200) });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }

    function formatPeso(value) {
        return '₱' + Number(value || 0).toLocaleString('en-PH');
    }

    function normalizeGuideTour(tour) {
        const raw = tour || {};
        const profile = getGuideProfile();
        const defaultProvider = String(profile && profile.name ? profile.name : 'Guide Name').trim() || 'Guide Name';
        const defaultLanguages = String(profile && profile.languages ? profile.languages : 'English, Filipino').trim() || 'English, Filipino';
        const parseList = function (value, fallback) {
            const source = Array.isArray(value) ? value : String(value || '').split(',');
            const clean = source.map(function (item) {
                return String(item || '').trim();
            }).filter(Boolean);
            if (clean.length) {
                return clean;
            }
            return Array.isArray(fallback) ? fallback : [];
        };
        const parseBool = function (value, fallback) {
            if (typeof value === 'boolean') {
                return value;
            }
            if (typeof value === 'string') {
                const lowered = value.toLowerCase();
                if (lowered === 'true' || lowered === '1') {
                    return true;
                }
                if (lowered === 'false' || lowered === '0') {
                    return false;
                }
            }
            return Boolean(fallback);
        };
        const tags = Array.isArray(raw.tags)
            ? raw.tags
            : String(raw.tags || '').split(',').map(function (tag) {
                return String(tag || '').trim();
            });
        const cleanTags = tags.filter(Boolean).slice(0, 6);
        const minGuests = Math.max(1, Number(raw.minGuests || raw.min_guests || 1));
        const maxGuests = Math.max(minGuests, Number(raw.maxGuests || raw.max_guests || 10));
        const guestTypes = parseList(raw.guestTypes, ['Adult']);
        const timeSlots = parseList(raw.timeSlots, ['08:00 AM', '01:00 PM', '05:00 PM']);
        const includes = parseList(raw.includes, ['Boat transfer', 'Entrance fees']);
        const gallery = Array.isArray(raw.gallery)
            ? raw.gallery.map(function (src) {
                return String(src || '').trim();
            }).filter(Boolean).slice(0, 10)
            : [];
        const fallbackImage = String(raw.coverImage || raw.image || gallery[0] || '../images/carousel2.jpg').trim() || '../images/carousel2.jpg';
        const finalGallery = gallery.length ? gallery : [fallbackImage];

        return {
            id: String(raw.id || uid('guide-tour')),
            title: String(raw.title || '').trim(),
            category: String(raw.category || 'Island Hopping').trim(),
            province: String(raw.province || '').trim(),
            city: String(raw.city || '').trim(),
            meetingArea: String(raw.meetingArea || '').trim(),
            location: String(raw.location || ((raw.city || '') + (raw.province ? ', ' + raw.province : ''))).trim(),
            duration: String(raw.duration || raw.duration_label || '2 days').trim(),
            durationHours: String(raw.durationHours || raw.duration || raw.duration_label || '2 days').trim(),
            minGuests: minGuests,
            maxGuests: maxGuests,
            pax: String(raw.pax || (String(minGuests) + '-' + String(maxGuests) + ' guests')).trim(),
            guestTypes: guestTypes,
            timeSlots: timeSlots,
            difficulty: String(raw.difficulty || 'Moderate').trim(),
            rating: Math.min(Math.max(Number(raw.rating || 0), 0), 5),
            reviews: Math.max(0, Math.round(Number(raw.reviews || 0))),
            price: Math.max(1, Math.round(Number(raw.price || 0))),
            priceType: String(raw.priceType || raw.price_type || 'Per person').trim(),
            reservationType: String(raw.reservationType || raw.reservation_type || 'Instant booking').trim(),
            status: String(raw.status || 'Draft').trim(),
            provider: String(raw.provider || raw.guide || defaultProvider).trim() || defaultProvider,
            languages: String(raw.languages || defaultLanguages).trim() || defaultLanguages,
            meetingPoint: String(raw.meetingPoint || raw.meeting_point || 'Main tourist pickup point').trim() || 'Main tourist pickup point',
            freeCancellation: parseBool(raw.freeCancellation != null ? raw.freeCancellation : raw.free_cancellation, true),
            cancellationText: String(raw.cancellationText || 'Cancel up to 24 hours in advance for a full refund').trim(),
            reserveNowPayLater: parseBool(raw.reserveNowPayLater != null ? raw.reserveNowPayLater : raw.reserve_now_pay_later, true),
            includes: includes,
            excludes: String(raw.excludes || '').trim(),
            requirements: String(raw.requirements || '').trim(),
            safetyInfo: String(raw.safetyInfo || raw.safety_info || '').trim(),
            guidePhoto: String(raw.guidePhoto || profile.avatar || '../images/manila.jpg').trim() || '../images/manila.jpg',
            guideVerified: parseBool(raw.guideVerified, false),
            guideExperienceYears: Math.max(0, Number(raw.guideExperienceYears || 1)),
            guideContact: String(raw.guideContact || '').trim(),
            guideSocial: String(raw.guideSocial || '').trim(),
            tags: cleanTags,
            weatherSuitability: String(raw.weatherSuitability || raw.weather_suitability || '').trim(),
            bestSeason: String(raw.bestSeason || raw.best_season || '').trim(),
            childFriendly: parseBool(raw.childFriendly != null ? raw.childFriendly : raw.child_friendly, false),
            petFriendly: parseBool(raw.petFriendly != null ? raw.petFriendly : raw.pet_friendly, false),
            description: String(raw.description || raw.short_description || '').trim(),
            image: finalGallery[0],
            coverImage: finalGallery[0],
            gallery: finalGallery
        };
    }

    function defaultTours() {
        return [
            {
                id: 'guide-elnido',
                title: 'Island Hopping and Hidden Lagoons',
                category: 'Island Hopping',
                province: 'Palawan',
                city: 'El Nido',
                meetingArea: 'El Nido Port area',
                location: 'El Nido, Palawan',
                duration: '2 days',
                durationHours: '2 days',
                minGuests: 2,
                maxGuests: 12,
                pax: '2-12 guests',
                guestTypes: ['Adult', 'Children'],
                timeSlots: ['08:00 AM', '01:00 PM', '05:00 PM'],
                difficulty: 'Moderate',
                rating: 4.93,
                reviews: 89,
                price: 3800,
                priceType: 'Per person',
                reservationType: 'Instant booking',
                status: 'Published',
                provider: 'Joshua Adrian Badal',
                languages: 'English, Filipino',
                meetingPoint: 'El Nido Port passenger terminal',
                freeCancellation: true,
                cancellationText: 'Cancel up to 24 hours in advance for a full refund',
                reserveNowPayLater: true,
                includes: ['Boat transfer', 'Entrance fees', 'Guide support'],
                excludes: 'Personal expenses',
                requirements: 'Bring swimwear, dry bag, and sun protection.',
                safetyInfo: 'Safety briefing is provided before departure.',
                guidePhoto: '../images/7a.jpg',
                guideVerified: true,
                guideExperienceYears: 6,
                guideContact: '+63 912 111 2222',
                guideSocial: 'facebook.com/joshua.guide',
                weatherSuitability: 'Best on clear weather',
                bestSeason: 'December to May',
                childFriendly: true,
                petFriendly: false,
                image: '../images/puertoprincessa.jpg',
                coverImage: '../images/puertoprincessa.jpg',
                gallery: ['../images/puertoprincessa.jpg', '../images/carousel3.jpg', '../images/manila.png', '../images/pangasinan.jpg', '../images/davao.jpg'],
                tags: ['Island Hopping', 'Snorkeling', 'Beach'],
                description: 'Premium island route with safe pacing, licensed boat support, and curated lagoon stops.'
            },
            {
                id: 'guide-bohol',
                title: 'Chocolate Hills and Tarsier Sanctuary',
                category: 'Nature',
                province: 'Bohol',
                city: 'Tagbilaran',
                meetingArea: 'Tagbilaran city center',
                location: 'Bohol, Philippines',
                duration: '2 days',
                durationHours: '2 days',
                minGuests: 2,
                maxGuests: 8,
                pax: '2-8 guests',
                guestTypes: ['Adult', 'Children', 'Senior'],
                timeSlots: ['08:00 AM', '01:00 PM'],
                difficulty: 'Easy',
                rating: 4.97,
                reviews: 142,
                price: 2500,
                priceType: 'Per person',
                reservationType: 'Instant booking',
                status: 'Published',
                provider: 'Jethro Cabunas',
                languages: 'English, Filipino',
                meetingPoint: 'Bohol Tourism Board pickup station',
                freeCancellation: true,
                cancellationText: 'Cancel up to 24 hours in advance for a full refund',
                reserveNowPayLater: true,
                includes: ['Transportation', 'Entrance fees'],
                excludes: 'Meals not listed in itinerary',
                requirements: 'Wear comfortable footwear and bring water.',
                safetyInfo: 'Trail and road safety reminders are given before start.',
                guidePhoto: '../images/39.jpg',
                guideVerified: true,
                guideExperienceYears: 5,
                guideContact: '+63 917 333 4444',
                guideSocial: 'instagram.com/jethro.guides',
                weatherSuitability: 'Good year-round',
                bestSeason: 'November to May',
                childFriendly: true,
                petFriendly: false,
                image: '../images/pangasinan.jpg',
                coverImage: '../images/pangasinan.jpg',
                gallery: ['../images/pangasinan.jpg', '../images/puertoprincessa.jpg', '../images/carousel2.jpg', '../images/davao.jpg', '../images/manila.jpg'],
                tags: ['Nature', 'Wildlife', 'Scenic'],
                description: 'Balanced nature trail and countryside route with cultural stops and flexible meal options.'
            },
            {
                id: 'guide-coron',
                title: 'Shipwreck Diving and Kayangan Lake',
                category: 'Adventure',
                province: 'Palawan',
                city: 'Coron',
                meetingArea: 'Coron town center',
                location: 'Coron, Palawan',
                duration: '2 days',
                durationHours: '2 days',
                minGuests: 2,
                maxGuests: 10,
                pax: '2-10 guests',
                guestTypes: ['Adult'],
                timeSlots: ['08:00 AM', '01:00 PM'],
                difficulty: 'Moderate',
                rating: 4.88,
                reviews: 176,
                price: 4500,
                priceType: 'Per person',
                reservationType: 'Manual approval',
                status: 'Draft',
                provider: 'Joshua Duhaylungsod',
                languages: 'English, Filipino',
                meetingPoint: 'Coron town pier check-in area',
                freeCancellation: false,
                cancellationText: 'Cancellation policy depends on weather and permits.',
                reserveNowPayLater: true,
                includes: ['Boat transfer', 'Snorkeling gear'],
                excludes: 'Diving certification fees',
                requirements: 'Open-water certification required for diving activities.',
                safetyInfo: 'Dive safety briefing and buddy system required.',
                guidePhoto: '../images/Manila-4.webp',
                guideVerified: true,
                guideExperienceYears: 8,
                guideContact: '+63 919 555 6666',
                guideSocial: 'facebook.com/coron.guide',
                weatherSuitability: 'Best in calm sea conditions',
                bestSeason: 'December to May',
                childFriendly: false,
                petFriendly: false,
                image: '../images/manila.png',
                coverImage: '../images/manila.png',
                gallery: ['../images/manila.png', '../images/puertoprincessa.jpg', '../images/davao.jpg', '../images/carousel2.jpg', '../images/carousel3.jpg'],
                tags: ['Diving', 'Snorkeling', 'Shipwreck'],
                description: 'Wreck-focused itinerary for trained divers with scenic lake cooldown sessions.'
            }
        ];
    }

    function defaultTouristRequests() {
        return [
            {
                id: 'tourist-request-1',
                touristName: 'Alyssa Mae Rivera',
                touristAvatar: '../images/39.jpg',
                title: 'Family-friendly island day with kid-safe beaches',
                location: 'El Nido, Palawan',
                budgetMin: 3000,
                budgetMax: 5200,
                duration: '2 days',
                travelers: '2 adults / 2 children',
                interests: ['Island Hopping', 'Beach', 'Snorkeling'],
                createdAt: nowISO()
            },
            {
                id: 'tourist-request-2',
                touristName: 'Marco Luis Santos',
                touristAvatar: '../images/caoursel1.webp',
                title: 'Bohol route with airport pickup and food stops',
                location: 'Bohol, Philippines',
                budgetMin: 2500,
                budgetMax: 5600,
                duration: '2 days',
                travelers: '2 adults',
                interests: ['Nature', 'Food', 'Wildlife'],
                createdAt: nowISO()
            }
        ];
    }

    function defaultBookings() {
        return [
            {
                id: 'guide-booking-1',
                tourId: 'guide-elnido',
                touristName: 'Alyssa Mae Rivera',
                touristAvatar: '../images/39.jpg',
                bookingDate: '2026-05-18',
                guests: '4 guests',
                status: 'Pending'
            },
            {
                id: 'guide-booking-2',
                tourId: 'guide-bohol',
                touristName: 'Marco Luis Santos',
                touristAvatar: '../images/caoursel1.webp',
                bookingDate: '2026-05-20',
                guests: '2 guests',
                status: 'Accepted'
            },
            {
                id: 'guide-booking-3',
                tourId: 'guide-coron',
                touristName: 'Patricia Anne Cruz',
                touristAvatar: '../images/manila.jpg',
                bookingDate: '2026-05-22',
                guests: '3 guests',
                status: 'Declined'
            }
        ];
    }

    function defaultReviews() {
        return [
            {
                id: 'guide-review-1',
                tourId: 'guide-elnido',
                reviewer: 'Danica Flores',
                rating: 5,
                comment: 'Smooth pacing and clear safety briefing. Loved the hidden lagoon route.'
            },
            {
                id: 'guide-review-2',
                tourId: 'guide-bohol',
                reviewer: 'Noel Antonio',
                rating: 4,
                comment: 'Well-coordinated itinerary and very informative local stories.'
            }
        ];
    }

    function defaultConversations() {
        return [
            {
                id: 'conv-alyssa-mae-rivera',
                touristName: 'Alyssa Mae Rivera',
                avatar: '../images/39.jpg',
                tourTitle: 'Island Hopping and Hidden Lagoons',
                unread: 0,
                lastTime: nowISO(),
                messages: [
                    {
                        id: uid('msg'),
                        mine: false,
                        text: 'Hi Guide! Can we start the tour earlier in the morning?',
                        createdAt: nowISO()
                    }
                ]
            }
        ];
    }

    function defaultProfile() {
        return {
            name: 'Guide Name',
            location: 'Davao, Philippines',
            bio: 'Local guide focused on immersive routes, safety-first planning, and smooth tourist coordination.',
            phone: '+63 912 345 6789',
            email: 'guide@example.com',
            specialties: 'Island Hopping, Nature Trails, Cultural Tours',
            languages: 'English, Filipino, Cebuano',
            certifications: 'DOT Accredited Guide, Basic Life Support, Open Water Dive Support',
            social: 'facebook.com/guideprofile, instagram.com/guideprofile',
            avatar: '../images/manila.jpg'
        };
    }

    function formatDate(value) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return 'Unknown date';
        }
        return parsed.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function relativeTime(value) {
        const parsed = new Date(value).getTime();
        if (!parsed) {
            return 'Just now';
        }
        const diff = Date.now() - parsed;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diff < minute) {
            return 'Just now';
        }
        if (diff < hour) {
            return Math.floor(diff / minute) + 'm ago';
        }
        if (diff < day) {
            return Math.floor(diff / hour) + 'h ago';
        }
        return Math.floor(diff / day) + 'd ago';
    }

    function parseGuestCount(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Math.max(1, Math.round(value));
        }
        const match = String(value || '').match(/\d+/);
        if (!match) {
            return 1;
        }
        return Math.max(1, Number(match[0]));
    }

    function isBookedStatus(status) {
        const normalized = String(status || '').trim().toLowerCase();
        return normalized === 'accepted' || normalized === 'booked' || normalized === 'confirmed' || normalized === 'completed';
    }

    function bookingStatusMeta(status) {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized === 'pending') {
            return { label: 'Pending', className: '' };
        }
        if (normalized === 'declined' || normalized === 'rejected' || normalized === 'cancelled') {
            return { label: 'Declined', className: 'declined' };
        }
        if (isBookedStatus(normalized)) {
            return { label: 'Booked', className: 'completed' };
        }
        return { label: status || 'Unknown', className: '' };
    }

    function getGuideTours() {
        const tours = readStore(GUIDE_TOURS_KEY, []);
        return Array.isArray(tours) ? tours.map(normalizeGuideTour) : [];
    }

    function setGuideTours(tours) {
        const list = Array.isArray(tours) ? tours.map(normalizeGuideTour) : [];
        writeStore(GUIDE_TOURS_KEY, list);
    }

    function getGuideBookings() {
        const bookings = readStore(GUIDE_BOOKINGS_KEY, []);
        return Array.isArray(bookings) ? bookings : [];
    }

    function setGuideBookings(bookings) {
        writeStore(GUIDE_BOOKINGS_KEY, Array.isArray(bookings) ? bookings : []);
    }

    function getGuideReviews() {
        const reviews = readStore(GUIDE_REVIEWS_KEY, []);
        return Array.isArray(reviews) ? reviews : [];
    }

    function setGuideReviews(reviews) {
        writeStore(GUIDE_REVIEWS_KEY, Array.isArray(reviews) ? reviews : []);
    }

    function getTouristRequests() {
        const requests = readStore(TOURIST_REQUESTS_KEY, []);
        return Array.isArray(requests) ? requests : [];
    }

    function setTouristRequests(requests) {
        writeStore(TOURIST_REQUESTS_KEY, Array.isArray(requests) ? requests : []);
    }

    function getGuideNotifications() {
        const notifications = readStore(GUIDE_NOTIFICATIONS_KEY, []);
        return Array.isArray(notifications) ? notifications : [];
    }

    function setGuideNotifications(notifications) {
        writeStore(GUIDE_NOTIFICATIONS_KEY, Array.isArray(notifications) ? notifications : []);
    }

    function getConversations() {
        const conversations = readStore(GUIDE_CONVERSATIONS_KEY, []);
        return Array.isArray(conversations) ? conversations : [];
    }

    function setConversations(conversations) {
        writeStore(GUIDE_CONVERSATIONS_KEY, Array.isArray(conversations) ? conversations : []);
    }

    function getGuideProfile() {
        return readStore(GUIDE_PROFILE_KEY, {});
    }

    function setGuideProfile(profile) {
        writeStore(GUIDE_PROFILE_KEY, profile || {});
    }

    function ensureSeedData() {
        if (!Array.isArray(readStore(GUIDE_TOURS_KEY, null))) {
            setGuideTours(defaultTours());
        }
        if (!Array.isArray(readStore(TOURIST_REQUESTS_KEY, null))) {
            setTouristRequests(defaultTouristRequests());
        }
        if (!Array.isArray(readStore(GUIDE_BOOKINGS_KEY, null))) {
            setGuideBookings(defaultBookings());
        }
        if (!Array.isArray(readStore(GUIDE_REVIEWS_KEY, null))) {
            setGuideReviews(defaultReviews());
        }
        if (!Array.isArray(readStore(GUIDE_NOTIFICATIONS_KEY, null))) {
            setGuideNotifications([]);
        }
        if (!Array.isArray(readStore(GUIDE_CONVERSATIONS_KEY, null))) {
            setConversations(defaultConversations());
        }
        const profile = readStore(GUIDE_PROFILE_KEY, null);
        if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
            setGuideProfile(defaultProfile());
        }

        syncBookingsToTours();
        syncReviewsToTours();
    }

    function syncBookingsToTours() {
        const tours = getGuideTours();
        const tourMap = tours.reduce(function (acc, tour) {
            acc[tour.id] = tour;
            return acc;
        }, {});
        const synced = getGuideBookings().map(function (booking) {
            if (!tourMap[booking.tourId]) {
                return null;
            }
            return booking;
        }).filter(Boolean);
        setGuideBookings(synced);
    }

    function syncReviewsToTours() {
        const tours = getGuideTours();
        const validIds = tours.map(function (tour) {
            return tour.id;
        });
        const synced = getGuideReviews().filter(function (review) {
            return validIds.includes(review.tourId);
        });
        setGuideReviews(synced);
    }

    function initSidebar() {
        const backdrop = qs('#sidebarBackdrop');
        qsa('[data-sidebar-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                document.body.classList.toggle('sidebar-open');
            });
        });
        if (backdrop) {
            backdrop.addEventListener('click', function () {
                document.body.classList.remove('sidebar-open');
            });
        }
    }

    function initTopbarScroll() {
        const topbar = qs('#topbar');
        if (!topbar) {
            return;
        }
        const onScroll = function () {
            topbar.classList.toggle('scrolled', window.scrollY > 10);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function setActiveNavigation() {
        const page = document.body.dataset.page || '';
        qsa('.side-link[data-page]').forEach(function (link) {
            link.classList.toggle('active', link.dataset.page === page);
        });
    }

    function getNotificationRoute(notification) {
        const payload = (notification && notification.payload) || {};
        if (notification.type === 'guide-selected') {
            return 'messages.html?conversation=' + encodeURIComponent(payload.conversationId || '') + '&starter=1';
        }
        if (notification.type === 'booking-request') {
            return 'booking-requests.html';
        }
        return 'dashboard.html';
    }

    function renderGuideNotifications() {
        const list = getGuideNotifications();
        const badge = qs('#guideNotificationBadge');
        const listHost = qs('#guideNotificationList');
        const unread = list.filter(function (item) {
            return !item.read;
        }).length;

        if (badge) {
            badge.textContent = String(unread);
            badge.style.display = unread ? 'grid' : 'none';
        }

        if (!listHost) {
            return;
        }

        listHost.innerHTML = '';
        if (!list.length) {
            listHost.innerHTML = '<p class="small text-muted mb-0 px-2 py-2">No notifications yet.</p>';
            return;
        }

        list.forEach(function (item) {
            const id = String(item && item.id ? item.id : '');
            const actorName = String(item && item.actorName ? item.actorName : 'System').trim() || 'System';
            const payload = item && item.payload && typeof item.payload === 'object' ? item.payload : {};
            const avatarSource = String(
                (item && item.actorAvatar)
                || payload.actorAvatar
                || payload.senderAvatar
                || payload.avatar
                || '../images/manila.jpg'
            );
            const text = String(
                (item && item.fullText)
                || (item && item.text)
                || (item && item.actionText)
                || 'New notification.'
            );
            const timeLabel = String(item && item.time ? item.time : relativeTime(item && item.createdAt ? item.createdAt : nowISO()));

            const row = document.createElement('div');
            row.className = 'notification-entry' + (item && item.read ? '' : ' unread');
            row.dataset.notificationId = id;
            row.innerHTML = [
                '<span class="notification-entry__dot"', ((item && item.read) ? ' hidden' : ''), '></span>',
                '<img class="notification-entry__avatar" src="', escapeHtml(avatarSource), '" alt="', escapeHtml(actorName), ' avatar">',
                '<button type="button" class="notification-entry__main" data-notification-open="', escapeHtml(id), '">',
                '<span class="notification-entry__text">', escapeHtml(text), '</span>',
                '<small class="notification-entry__time">', escapeHtml(timeLabel), '</small>',
                '</button>',
                '<button type="button" class="notification-entry__delete" data-notification-delete="', escapeHtml(id), '" aria-label="Delete notification">',
                '<i class="fa-solid fa-xmark"></i>',
                '</button>'
            ].join('');
            listHost.appendChild(row);
        });
    }

    function initGuideNotifications() {
        const trigger = qs('#guideNotificationBtn');
        const dropdown = trigger ? trigger.closest('.dropdown') : null;
        const menu = dropdown ? qs('.dropdown-menu', dropdown) : null;

        if (menu) {
            menu.classList.add('notification-dropdown-menu');

            let header = qs('.notification-dropdown-header', menu);
            if (!header) {
                const legacyHeader = qs('.border-bottom', menu);
                if (legacyHeader) {
                    header = legacyHeader;
                } else {
                    header = document.createElement('div');
                    menu.insertBefore(header, menu.firstChild);
                }
                header.className = 'notification-dropdown-header';
            }

            if (!qs('#guideMarkAllRead', header)) {
                const actions = document.createElement('div');
                actions.className = 'notification-dropdown-actions';
                actions.innerHTML = '<button id="guideMarkAllRead" class="btn-soft py-1 px-2" type="button">Mark all read</button>';
                header.innerHTML = '<strong>Notifications</strong>';
                header.appendChild(actions);
            } else if (!qs('.notification-dropdown-actions', header)) {
                const markAllButton = qs('#guideMarkAllRead', header);
                const actions = document.createElement('div');
                actions.className = 'notification-dropdown-actions';
                if (markAllButton) {
                    actions.appendChild(markAllButton);
                }
                header.innerHTML = '<strong>Notifications</strong>';
                header.appendChild(actions);
            }

            const existingListHost = qs('#guideNotificationList', menu);
            if (existingListHost) {
                existingListHost.classList.add('notification-dropdown-list');
            }

            if (!qs('#guideClearAllNotifications', menu)) {
                const footer = document.createElement('div');
                footer.className = 'notification-dropdown-footer';
                footer.innerHTML = '<button id="guideClearAllNotifications" class="btn-soft py-1 px-2" type="button">Clear all notifications</button>';
                menu.appendChild(footer);
            }
        }

        const markAll = qs('#guideMarkAllRead');
        const clearAll = qs('#guideClearAllNotifications');
        const listHost = qs('#guideNotificationList');

        if (markAll && !markAll.dataset.boundClick) {
            markAll.addEventListener('click', function () {
                const updated = getGuideNotifications().map(function (item) {
                    return Object.assign({}, item, { read: true });
                });
                setGuideNotifications(updated);
                renderGuideNotifications();
            });
            markAll.dataset.boundClick = 'true';
        }

        if (clearAll && !clearAll.dataset.boundClick) {
            clearAll.addEventListener('click', function () {
                const current = getGuideNotifications();
                if (!current.length) {
                    showToast('No notifications to clear.', 'secondary');
                    return;
                }

                setGuideNotifications([]);
                renderGuideNotifications();
                closeDropdownByButtonId('guideNotificationBtn');
            });
            clearAll.dataset.boundClick = 'true';
        }

        if (listHost && !listHost.dataset.boundClick) {
            listHost.addEventListener('click', function (event) {
                const deleteTarget = event.target.closest('[data-notification-delete]');
                if (deleteTarget) {
                    const deleteId = String(deleteTarget.getAttribute('data-notification-delete') || '');
                    if (!deleteId || pendingGuideNotificationDeletes[deleteId]) {
                        return;
                    }

                    const current = getGuideNotifications();
                    const deleteIndex = current.findIndex(function (item) {
                        return String(item.id) === deleteId;
                    });
                    if (deleteIndex < 0) {
                        return;
                    }

                    const removedItem = current[deleteIndex];
                    const next = current.filter(function (item) {
                        return String(item.id) !== deleteId;
                    });
                    setGuideNotifications(next);
                    renderGuideNotifications();

                    const timer = window.setTimeout(function () {
                        delete pendingGuideNotificationDeletes[deleteId];
                    }, PENDING_NOTIFICATION_DELETE_DELAY);

                    pendingGuideNotificationDeletes[deleteId] = {
                        item: removedItem,
                        index: deleteIndex,
                        timerId: timer,
                    };

                    showActionToast('Notification removed.', 'Undo', function () {
                        const pending = pendingGuideNotificationDeletes[deleteId];
                        if (!pending) {
                            return;
                        }
                        window.clearTimeout(pending.timerId);
                        const restored = getGuideNotifications();
                        const insertAt = Math.min(pending.index, restored.length);
                        restored.splice(insertAt, 0, pending.item);
                        setGuideNotifications(restored);
                        renderGuideNotifications();
                        delete pendingGuideNotificationDeletes[deleteId];
                    }, 'dark', 4200);
                    return;
                }

                const target = event.target.closest('[data-notification-open]');
                if (!target) {
                    return;
                }
                const id = String(target.getAttribute('data-notification-open') || '');
                const current = getGuideNotifications();
                const clicked = current.find(function (item) {
                    return String(item.id) === id;
                });
                const updated = current.map(function (item) {
                    if (String(item.id) === id) {
                        return Object.assign({}, item, { read: true });
                    }
                    return item;
                });
                setGuideNotifications(updated);
                renderGuideNotifications();
                closeDropdownByButtonId('guideNotificationBtn');
                window.location.href = getNotificationRoute(clicked || {});
            });
            listHost.dataset.boundClick = 'true';
        }

        window.addEventListener('storage', function (event) {
            if (!event || event.key === GUIDE_NOTIFICATIONS_KEY) {
                renderGuideNotifications();
            }
        });

        renderGuideNotifications();
    }

    function closeDropdownByButtonId(buttonId) {
        const trigger = qs('#' + String(buttonId || ''));
        if (!trigger || !window.bootstrap || !window.bootstrap.Dropdown) {
            return;
        }

        const instance = window.bootstrap.Dropdown.getInstance(trigger) || window.bootstrap.Dropdown.getOrCreateInstance(trigger);
        instance.hide();
    }

    function ensureConversation(touristName, avatar, tourTitle, idHint) {
        const normalizedName = String(touristName || 'Tourist').trim();
        const conversationId = idHint || ('conv-' + normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        const conversations = getConversations();
        const existing = conversations.find(function (conversation) {
            return conversation.id === conversationId;
        });
        if (existing) {
            return existing;
        }
        const created = {
            id: conversationId,
            touristName: normalizedName,
            avatar: avatar || '../images/manila.jpg',
            tourTitle: tourTitle || 'Custom Tourist Request',
            unread: 0,
            lastTime: nowISO(),
            messages: []
        };
        conversations.unshift(created);
        setConversations(conversations);
        return created;
    }

    function initRequestPostFeedPage() {
        if (document.body.dataset.page !== 'guide-request-feed') {
            return;
        }

        const host = qs('#guideRequestFeed');
        const empty = qs('#guideRequestEmpty');
        if (!host) {
            return;
        }
        const guideProfile = getGuideProfile();
        const activeGuideName = String(guideProfile && guideProfile.name ? guideProfile.name : 'Tour Guide').trim() || 'Tour Guide';

        function normalizeComments(comments) {
            if (!Array.isArray(comments)) {
                return [];
            }
            return comments.map(function (entry) {
                return {
                    id: String(entry && entry.id ? entry.id : uid('guide-comment')),
                    guideName: String(entry && entry.guideName ? entry.guideName : activeGuideName).trim() || activeGuideName,
                    text: String(entry && entry.text ? entry.text : '').trim(),
                    createdAt: String(entry && entry.createdAt ? entry.createdAt : nowISO())
                };
            }).filter(function (entry) {
                return entry.text;
            });
        }

        function commentMarkup(requestId, comments) {
            const safeComments = normalizeComments(comments);
            const rendered = safeComments.length
                ? safeComments.map(function (entry) {
                    return [
                        '<article class="surface p-2 mb-2">',
                        '<div class="d-flex justify-content-between align-items-start gap-2">',
                        '<p class="mb-1 small"><strong>', escapeHtml(entry.guideName), '</strong></p>',
                        '<small class="text-muted">', escapeHtml(relativeTime(entry.createdAt)), '</small>',
                        '</div>',
                        '<p class="small mb-0 text-muted">', escapeHtml(entry.text), '</p>',
                        '</article>'
                    ].join('');
                }).join('')
                : '<p class="small text-muted mb-2">No comments yet. Be the first guide to comment.</p>';

            return [
                '<div class="mt-3 pt-2 border-top">',
                '<h3 class="h6 mb-2">Guide Comments</h3>',
                '<div class="mb-2">', rendered, '</div>',
                '<form data-request-comment-form="', escapeHtml(requestId), '">',
                '<textarea class="input-soft" rows="2" data-comment-text placeholder="Write your comment for this request..." required></textarea>',
                '<div class="d-flex justify-content-end mt-2">',
                '<button class="btn-charcoal" type="submit"><i class="fa-regular fa-paper-plane me-1"></i>Post Comment</button>',
                '</div>',
                '</form>',
                '</div>'
            ].join('');
        }

        function render() {
            const requests = getTouristRequests().slice().sort(function (a, b) {
                return new Date(b.createdAt || nowISO()).getTime() - new Date(a.createdAt || nowISO()).getTime();
            });

            host.innerHTML = '';
            if (!requests.length) {
                if (empty) {
                    empty.style.display = '';
                }
                return;
            }

            if (empty) {
                empty.style.display = 'none';
            }

            requests.forEach(function (item) {
                const card = document.createElement('article');
                card.className = 'request-manage-card';
                card.innerHTML = [
                    '<div class="request-top">',
                    '<div class="post-identity">',
                    '<img class="tourist-avatar" src="', escapeHtml(item.touristAvatar || '../images/manila.jpg'), '" alt="', escapeHtml(item.touristName || 'Tourist'), '">',
                    '<div>',
                    '<p class="tourist-name mb-0"><strong>', escapeHtml(item.touristName || 'Tourist'), '</strong></p>',
                    '<p class="small text-muted mb-0">', escapeHtml(formatDate(item.createdAt)), '</p>',
                    '</div>',
                    '</div>',
                    '<span class="badge-status badge-open">Open</span>',
                    '</div>',
                    '<div class="request-body">',
                    '<h2 class="h5 mb-1">', escapeHtml(item.title || 'Tour request'), '</h2>',
                    '<p class="small text-muted mb-2">Location: ', escapeHtml(item.location || 'Philippines'), '</p>',
                    '<div class="row g-2 small text-muted">',
                    '<div class="col-md-4">Budget: <strong class="text-dark">', formatPeso(item.budgetMin), ' - ', formatPeso(item.budgetMax), '</strong></div>',
                    '<div class="col-md-4">Duration: <strong class="text-dark">', escapeHtml(item.duration || 'Flexible'), '</strong></div>',
                    '<div class="col-md-4">Travelers: <strong class="text-dark">', escapeHtml(item.travelers || '1 traveler'), '</strong></div>',
                    '</div>',
                    '<div class="tag-row">',
                    (Array.isArray(item.interests) ? item.interests : []).map(function (tag) {
                        return '<span class="soft-tag">' + escapeHtml(tag) + '</span>';
                    }).join(''),
                    '</div>',
                    commentMarkup(item.id, item.comments),
                    '</div>'
                ].join('');
                host.appendChild(card);
            });
        }

        host.addEventListener('submit', function (event) {
            const form = event.target.closest('[data-request-comment-form]');
            if (!form) {
                return;
            }
            event.preventDefault();
            const requestId = form.dataset.requestCommentForm;
            const textarea = qs('[data-comment-text]', form);
            const message = String(textarea ? textarea.value : '').trim();
            if (!message) {
                return;
            }

            const requests = getTouristRequests();
            const updated = requests.map(function (item) {
                if (item.id !== requestId) {
                    return item;
                }
                const comments = normalizeComments(item.comments);
                comments.push({
                    id: uid('guide-comment'),
                    guideName: activeGuideName,
                    text: message,
                    createdAt: nowISO()
                });
                return Object.assign({}, item, { comments: comments });
            });

            setTouristRequests(updated);
            render();
            showToast('Comment posted to request.', 'success');
        });

        window.addEventListener('storage', function (event) {
            if (!event || event.key === TOURIST_REQUESTS_KEY) {
                render();
            }
        });

        render();
    }

    function initBookingRequestsPage() {
        if (document.body.dataset.page !== 'guide-booking-requests') {
            return;
        }

        const listHost = qs('#guideBookingList');
        const empty = qs('#guideBookingEmpty');
        const filterButtons = qsa('[data-booking-filter]');
        let activeFilter = 'All';

        function getTourMap() {
            return getGuideTours().reduce(function (acc, tour) {
                acc[tour.id] = tour;
                return acc;
            }, {});
        }

        function render() {
            if (!listHost) {
                return;
            }
            const tourMap = getTourMap();
            const bookings = getGuideBookings();
            const filtered = activeFilter === 'All'
                ? bookings
                : bookings.filter(function (item) {
                    return item.status === activeFilter;
                });

            listHost.innerHTML = '';
            if (!filtered.length) {
                if (empty) {
                    empty.style.display = '';
                }
                return;
            }
            if (empty) {
                empty.style.display = 'none';
            }

            filtered.forEach(function (booking) {
                const tour = tourMap[booking.tourId];
                if (!tour) {
                    return;
                }
                const card = document.createElement('article');
                card.className = 'booking-card';
                card.dataset.bookingId = booking.id;
                card.innerHTML = [
                    '<img class="media" src="', escapeHtml(tour.image), '" alt="', escapeHtml(tour.title), '">',
                    '<div class="booking-body">',
                    '<div class="d-flex justify-content-between align-items-start gap-2">',
                    '<h2 class="h6 mb-0">', escapeHtml(tour.title), '</h2>',
                    '<span class="status-pill ', booking.status === 'Accepted' ? 'completed' : '', '">', escapeHtml(booking.status), '</span>',
                    '</div>',
                    '<div class="d-flex align-items-center gap-2 mt-2">',
                    '<img src="', escapeHtml(booking.touristAvatar || '../images/manila.jpg'), '" alt="', escapeHtml(booking.touristName), '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">',
                    '<small>', escapeHtml(booking.touristName), '</small>',
                    '</div>',
                    '<p class="small text-muted mb-1 mt-2">Booking date: ', escapeHtml(formatDate(booking.bookingDate)), '</p>',
                    '<p class="small text-muted mb-2">Guests: ', escapeHtml(booking.guests || '1 guest'), '</p>',
                    '<div class="d-flex gap-2">',
                    '<button class="btn-charcoal w-100" type="button" data-accept-booking="', escapeHtml(booking.id), '"', booking.status !== 'Pending' ? ' disabled' : '', '>Accept</button>',
                    '<button class="btn-danger w-100" type="button" data-decline-booking="', escapeHtml(booking.id), '"', booking.status !== 'Pending' ? ' disabled' : '', '>Decline</button>',
                    '</div>',
                    '</div>'
                ].join('');
                listHost.appendChild(card);
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.dataset.bookingFilter || 'All';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                render();
            });
        });

        if (listHost) {
            listHost.addEventListener('click', function (event) {
                const acceptBtn = event.target.closest('[data-accept-booking]');
                const declineBtn = event.target.closest('[data-decline-booking]');
                if (!acceptBtn && !declineBtn) {
                    return;
                }
                const id = (acceptBtn || declineBtn).dataset.acceptBooking || (acceptBtn || declineBtn).dataset.declineBooking;
                const nextStatus = acceptBtn ? 'Accepted' : 'Declined';
                const updated = getGuideBookings().map(function (booking) {
                    if (booking.id === id) {
                        return Object.assign({}, booking, { status: nextStatus });
                    }
                    return booking;
                });
                setGuideBookings(updated);
                render();
                showToast('Booking request updated to ' + nextStatus + '.', 'success');
            });
        }

        filterButtons.forEach(function (button) {
            button.classList.toggle('active', button.dataset.bookingFilter === activeFilter);
        });
        render();
    }

    function initToursPage() {
        if (document.body.dataset.page !== 'guide-tours') {
            return;
        }

        const form = qs('#tourForm');
        const listHost = qs('#guideToursList');
        const empty = qs('#guideToursEmpty');
        const resetBtn = qs('#tourFormReset');

        const fields = {
            id: qs('#tourId'),
            title: qs('#tourTitle'),
            category: qs('#tourCategory'),
            province: qs('#tourProvince'),
            city: qs('#tourCity'),
            meetingArea: qs('#tourMeetingArea'),
            duration: qs('#tourDuration'),
            meetingPoint: qs('#tourMeetingPoint'),
            price: qs('#tourPrice'),
            priceType: qs('#tourPriceType'),
            minGuests: qs('#tourMinGuests'),
            maxGuests: qs('#tourMaxGuests'),
            guestAdult: qs('#tourGuestAdult'),
            guestChildren: qs('#tourGuestChildren'),
            guestSenior: qs('#tourGuestSenior'),
            timeSlots: qs('#tourTimeSlots'),
            reservationType: qs('#tourReservationType'),
            freeCancellation: qs('#tourFreeCancellation'),
            cancellationText: qs('#tourCancellationText'),
            reservePayLater: qs('#tourReservePayLater'),
            status: qs('#tourStatus'),
            provider: qs('#tourProvider'),
            languages: qs('#tourLanguages'),
            includes: qs('#tourIncludes'),
            excludes: qs('#tourExcludes'),
            requirements: qs('#tourRequirements'),
            safetyInfo: qs('#tourSafetyInfo'),
            guidePhoto: qs('#tourGuidePhoto'),
            guidePhotoPreview: qs('#tourGuidePhotoPreview'),
            guideVerified: qs('#tourGuideVerified'),
            guideExperience: qs('#tourGuideExperience'),
            guideContact: qs('#tourGuideContact'),
            guideSocial: qs('#tourGuideSocial'),
            difficulty: qs('#tourDifficulty'),
            tags: qs('#tourTags'),
            weather: qs('#tourWeather'),
            bestSeason: qs('#tourBestSeason'),
            childFriendly: qs('#tourChildFriendly'),
            petFriendly: qs('#tourPetFriendly'),
            rating: qs('#tourRating'),
            reviews: qs('#tourReviews'),
            images: qs('#tourImages'),
            imagePreview: qs('#tourImagePreview'),
            description: qs('#tourDescription')
        };
        const saveDraftBtn = qs('#tourSaveDraft');
        const dropzone = qs('#tourDropzone');
        const uploadProgress = qs('#tourUploadProgress');

        let previewGallery = [];
        let imageTouched = false;
        let guidePhotoTouched = false;
        let draftTimer = null;

        function selectedGuestTypes() {
            return [
                fields.guestAdult && fields.guestAdult.checked ? 'Adult' : '',
                fields.guestChildren && fields.guestChildren.checked ? 'Children' : '',
                fields.guestSenior && fields.guestSenior.checked ? 'Senior' : ''
            ].filter(Boolean);
        }

        function setGuestTypes(types) {
            const set = Array.isArray(types) ? types : [];
            if (fields.guestAdult) {
                fields.guestAdult.checked = set.includes('Adult');
            }
            if (fields.guestChildren) {
                fields.guestChildren.checked = set.includes('Children');
            }
            if (fields.guestSenior) {
                fields.guestSenior.checked = set.includes('Senior');
            }
        }

        function parseListValue(value) {
            return String(value || '')
                .split(/,|\n/)
                .map(function (item) {
                    return item.trim();
                })
                .filter(Boolean);
        }

        function setUploadProgress(value) {
            if (!uploadProgress) {
                return;
            }
            const safe = Math.max(0, Math.min(100, Number(value || 0)));
            uploadProgress.style.width = safe + '%';
            uploadProgress.setAttribute('aria-valuenow', String(safe));
        }

        function normalizeLocation() {
            const city = String(fields.city ? fields.city.value : '').trim();
            const province = String(fields.province ? fields.province.value : '').trim();
            if (city && province) {
                return city + ', ' + province;
            }
            return city || province || '';
        }

        function clearForm() {
            if (!form) {
                return;
            }
            form.reset();
            if (fields.id) {
                fields.id.value = '';
            }
            previewGallery = [];
            imageTouched = false;
            guidePhotoTouched = false;
            renderGallery(fields.imagePreview, [], 'Tour', true);
            const profile = getGuideProfile();
            if (fields.provider) {
                fields.provider.value = String(profile && profile.name ? profile.name : '');
            }
            if (fields.languages) {
                fields.languages.value = String(profile && profile.languages ? profile.languages : 'English, Filipino');
            }
            if (fields.guidePhotoPreview) {
                fields.guidePhotoPreview.src = String(profile && profile.avatar ? profile.avatar : '../images/manila.jpg');
            }
            setGuestTypes(['Adult']);
            setUploadProgress(0);
            writeStore(GUIDE_TOUR_DRAFT_KEY, null);
        }

        function renderGallery(host, gallery, title, removable) {
            if (!host) {
                return;
            }
            const safe = Array.isArray(gallery) ? gallery.slice(0, 10) : [];
            if (!safe.length) {
                host.innerHTML = '<p class="small text-muted mb-0">No images selected yet.</p>';
                return;
            }
            host.innerHTML = safe.map(function (src, index) {
                return [
                    '<div class="guide-gallery-item">',
                    '<img src="', escapeHtml(src), '" alt="', escapeHtml(title || 'Tour'), ' image ', String(index + 1), '">',
                    index === 0 ? '<span class="guide-gallery-badge">Cover</span>' : '',
                    removable
                        ? '<button class="guide-gallery-cover" type="button" data-set-cover-image="' + String(index) + '" aria-label="Set as cover">★</button>'
                        : '',
                    removable
                        ? '<button class="guide-gallery-remove" type="button" data-remove-preview-image="' + String(index) + '" aria-label="Remove image">&times;</button>'
                        : '',
                    '</div>'
                ].join('');
            }).join('');
        }

        function filesToDataUrls(fileList, onProgress) {
            const files = Array.from(fileList || []);
            const total = files.length || 1;
            let done = 0;
            return Promise.all(files.map(function (file) {
                return new Promise(function (resolve, reject) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        done += 1;
                        if (typeof onProgress === 'function') {
                            onProgress(Math.round((done / total) * 100));
                        }
                        resolve(String(reader.result || ''));
                    };
                    reader.onerror = function () {
                        reject(new Error('Unable to read image file.'));
                    };
                    reader.readAsDataURL(file);
                });
            }));
        }

        function buildPayload(existingTour, forcedStatus) {
            const existing = existingTour || null;
            const galleryBase = imageTouched
                ? previewGallery.slice(0, 10)
                : (existing && Array.isArray(existing.gallery) ? existing.gallery.slice(0, 10) : previewGallery.slice(0, 10));
            const gallery = galleryBase.filter(Boolean);
            const guidePhoto = guidePhotoTouched
                ? String(fields.guidePhotoPreview ? fields.guidePhotoPreview.src : '')
                : String(existing && existing.guidePhoto ? existing.guidePhoto : (fields.guidePhotoPreview ? fields.guidePhotoPreview.src : ''));
            const minGuests = Math.max(1, Number(fields.minGuests ? fields.minGuests.value : 1));
            const maxGuests = Math.max(minGuests, Number(fields.maxGuests ? fields.maxGuests.value : 10));
            const title = String(fields.title ? fields.title.value : '').trim();

            return normalizeGuideTour({
                id: fields.id && fields.id.value ? fields.id.value : uid('guide-tour'),
                title: title,
                category: String(fields.category ? fields.category.value : '').trim(),
                province: String(fields.province ? fields.province.value : '').trim(),
                city: String(fields.city ? fields.city.value : '').trim(),
                meetingArea: String(fields.meetingArea ? fields.meetingArea.value : '').trim(),
                location: normalizeLocation(),
                duration: String(fields.duration ? fields.duration.value : '').trim(),
                durationHours: String(fields.duration ? fields.duration.value : '').trim(),
                minGuests: minGuests,
                maxGuests: maxGuests,
                pax: String(minGuests) + '-' + String(maxGuests) + ' guests',
                guestTypes: selectedGuestTypes(),
                timeSlots: parseListValue(fields.timeSlots ? fields.timeSlots.value : ''),
                price: Math.max(1, Number(fields.price ? fields.price.value : 0)),
                priceType: String(fields.priceType ? fields.priceType.value : 'Per person').trim(),
                reservationType: String(fields.reservationType ? fields.reservationType.value : 'Instant booking').trim(),
                freeCancellation: Boolean(fields.freeCancellation ? fields.freeCancellation.checked : true),
                cancellationText: String(fields.cancellationText ? fields.cancellationText.value : '').trim(),
                reserveNowPayLater: Boolean(fields.reservePayLater ? fields.reservePayLater.checked : true),
                provider: String(fields.provider ? fields.provider.value : '').trim(),
                languages: String(fields.languages ? fields.languages.value : '').trim(),
                meetingPoint: String(fields.meetingPoint ? fields.meetingPoint.value : '').trim(),
                includes: parseListValue(fields.includes ? fields.includes.value : ''),
                excludes: String(fields.excludes ? fields.excludes.value : '').trim(),
                requirements: String(fields.requirements ? fields.requirements.value : '').trim(),
                safetyInfo: String(fields.safetyInfo ? fields.safetyInfo.value : '').trim(),
                guidePhoto: guidePhoto,
                guideVerified: Boolean(fields.guideVerified ? fields.guideVerified.checked : false),
                guideExperienceYears: Math.max(0, Number(fields.guideExperience ? fields.guideExperience.value : 0)),
                guideContact: String(fields.guideContact ? fields.guideContact.value : '').trim(),
                guideSocial: String(fields.guideSocial ? fields.guideSocial.value : '').trim(),
                difficulty: String(fields.difficulty ? fields.difficulty.value : 'Moderate').trim(),
                tags: parseListValue(fields.tags ? fields.tags.value : '').slice(0, 8),
                weatherSuitability: String(fields.weather ? fields.weather.value : '').trim(),
                bestSeason: String(fields.bestSeason ? fields.bestSeason.value : '').trim(),
                childFriendly: Boolean(fields.childFriendly ? fields.childFriendly.checked : false),
                petFriendly: Boolean(fields.petFriendly ? fields.petFriendly.checked : false),
                rating: Number(fields.rating ? fields.rating.value : 0),
                reviews: Number(fields.reviews ? fields.reviews.value : 0),
                status: String(forcedStatus || (fields.status ? fields.status.value : 'Draft')).trim(),
                description: String(fields.description ? fields.description.value : '').trim(),
                coverImage: gallery[0] || (existing && existing.coverImage) || '../images/carousel2.jpg',
                gallery: gallery,
                image: gallery[0] || (existing && existing.image) || '../images/carousel2.jpg'
            });
        }

        function validatePayload(payload) {
            const errors = [];
            if (!payload.title) {
                errors.push({ field: fields.title, message: 'Tour title is required.' });
            }
            if (!payload.description || payload.description.length < 20) {
                errors.push({ field: fields.description, message: 'Description must be at least 20 characters.' });
            }
            if (!payload.province) {
                errors.push({ field: fields.province, message: 'Province is required.' });
            }
            if (!payload.city) {
                errors.push({ field: fields.city, message: 'City or municipality is required.' });
            }
            if (!payload.meetingArea) {
                errors.push({ field: fields.meetingArea, message: 'Specific meeting area is required.' });
            }
            if (!payload.meetingPoint) {
                errors.push({ field: fields.meetingPoint, message: 'Meeting point is required.' });
            }
            if (!payload.duration) {
                errors.push({ field: fields.duration, message: 'Tour duration is required.' });
            }
            if (Number(payload.price) < 1) {
                errors.push({ field: fields.price, message: 'Base price must be at least 1.' });
            }
            if (!payload.guestTypes || !payload.guestTypes.length) {
                errors.push({ field: fields.guestAdult, message: 'Select at least one guest type.' });
            }
            if (!payload.timeSlots || !payload.timeSlots.length) {
                errors.push({ field: fields.timeSlots, message: 'Add at least one available time slot.' });
            }
            if (!Array.isArray(payload.gallery) || payload.gallery.length < 3 || payload.gallery.length > 10) {
                errors.push({ field: fields.images, message: 'Please upload between 3 and 10 images.' });
            }
            if (Number(payload.maxGuests) < Number(payload.minGuests)) {
                errors.push({ field: fields.maxGuests, message: 'Maximum guests cannot be lower than minimum guests.' });
            }
            return errors;
        }

        function applyPayloadToForm(tour, clearDraftAfter) {
            if (!tour) {
                return;
            }
            if (fields.id) {
                fields.id.value = tour.id;
            }
            if (fields.title) {
                fields.title.value = tour.title;
            }
            if (fields.category) {
                fields.category.value = tour.category || 'Island Hopping';
            }
            if (fields.province) {
                fields.province.value = tour.province || '';
            }
            if (fields.city) {
                fields.city.value = tour.city || '';
            }
            if (fields.meetingArea) {
                fields.meetingArea.value = tour.meetingArea || '';
            }
            if (fields.duration) {
                fields.duration.value = tour.duration;
            }
            if (fields.meetingPoint) {
                fields.meetingPoint.value = tour.meetingPoint || '';
            }
            if (fields.price) {
                fields.price.value = String(tour.price);
            }
            if (fields.priceType) {
                fields.priceType.value = tour.priceType || 'Per person';
            }
            if (fields.minGuests) {
                fields.minGuests.value = String(Math.max(1, Number(tour.minGuests || 1)));
            }
            if (fields.maxGuests) {
                fields.maxGuests.value = String(Math.max(1, Number(tour.maxGuests || 10)));
            }
            setGuestTypes(tour.guestTypes || ['Adult']);
            if (fields.timeSlots) {
                fields.timeSlots.value = Array.isArray(tour.timeSlots) ? tour.timeSlots.join(', ') : '';
            }
            if (fields.reservationType) {
                fields.reservationType.value = tour.reservationType || 'Instant booking';
            }
            if (fields.freeCancellation) {
                fields.freeCancellation.checked = Boolean(tour.freeCancellation);
            }
            if (fields.cancellationText) {
                fields.cancellationText.value = tour.cancellationText || '';
            }
            if (fields.reservePayLater) {
                fields.reservePayLater.checked = Boolean(tour.reserveNowPayLater);
            }
            if (fields.status) {
                fields.status.value = tour.status;
            }
            if (fields.provider) {
                fields.provider.value = tour.provider || '';
            }
            if (fields.languages) {
                fields.languages.value = tour.languages || '';
            }
            if (fields.includes) {
                fields.includes.value = Array.isArray(tour.includes) ? tour.includes.join(', ') : '';
            }
            if (fields.excludes) {
                fields.excludes.value = tour.excludes || '';
            }
            if (fields.requirements) {
                fields.requirements.value = tour.requirements || '';
            }
            if (fields.safetyInfo) {
                fields.safetyInfo.value = tour.safetyInfo || '';
            }
            if (fields.guidePhotoPreview) {
                fields.guidePhotoPreview.src = tour.guidePhoto || '../images/manila.jpg';
            }
            if (fields.guideVerified) {
                fields.guideVerified.checked = Boolean(tour.guideVerified);
            }
            if (fields.guideExperience) {
                fields.guideExperience.value = String(Math.max(0, Number(tour.guideExperienceYears || 0)));
            }
            if (fields.guideContact) {
                fields.guideContact.value = tour.guideContact || '';
            }
            if (fields.guideSocial) {
                fields.guideSocial.value = tour.guideSocial || '';
            }
            if (fields.difficulty) {
                fields.difficulty.value = tour.difficulty || 'Moderate';
            }
            if (fields.tags) {
                fields.tags.value = (tour.tags || []).join(', ');
            }
            if (fields.weather) {
                fields.weather.value = tour.weatherSuitability || '';
            }
            if (fields.bestSeason) {
                fields.bestSeason.value = tour.bestSeason || '';
            }
            if (fields.childFriendly) {
                fields.childFriendly.checked = Boolean(tour.childFriendly);
            }
            if (fields.petFriendly) {
                fields.petFriendly.checked = Boolean(tour.petFriendly);
            }
            if (fields.rating) {
                fields.rating.value = Number(tour.rating || 0).toFixed(2);
            }
            if (fields.reviews) {
                fields.reviews.value = String(Math.max(0, Number(tour.reviews || 0)));
            }
            if (fields.images) {
                fields.images.value = '';
            }
            if (fields.description) {
                fields.description.value = tour.description;
            }
            previewGallery = (tour.gallery || [tour.image]).slice(0, 10);
            imageTouched = false;
            guidePhotoTouched = false;
            renderGallery(fields.imagePreview, previewGallery, tour.title, true);
            setUploadProgress(0);
            if (clearDraftAfter) {
                writeStore(GUIDE_TOUR_DRAFT_KEY, null);
            }
        }

        function saveDraft(showFeedback) {
            const currentTours = getGuideTours();
            const existing = currentTours.find(function (tour) {
                return fields.id && fields.id.value && tour.id === fields.id.value;
            }) || null;
            const payload = buildPayload(existing, existing ? existing.status : 'Draft');
            writeStore(GUIDE_TOUR_DRAFT_KEY, payload);
            if (showFeedback) {
                showToast('Draft saved.', 'success');
            }
        }

        function scheduleDraftSave() {
            if (draftTimer) {
                window.clearTimeout(draftTimer);
            }
            draftTimer = window.setTimeout(function () {
                saveDraft(false);
            }, 500);
        }

        function readGuidePhoto(file) {
            return new Promise(function (resolve, reject) {
                const reader = new FileReader();
                reader.onload = function () {
                    resolve(String(reader.result || ''));
                };
                reader.onerror = function () {
                    reject(new Error('Unable to read guide profile photo.'));
                };
                reader.readAsDataURL(file);
            });
        }

        function appendImages(fileList) {
            const files = Array.from(fileList || []).filter(function (file) {
                return file && /^image\//.test(String(file.type || ''));
            });
            if (!files.length) {
                return;
            }
            const availableSlots = Math.max(0, 10 - previewGallery.length);
            if (!availableSlots) {
                showToast('Maximum of 10 images allowed per listing.', 'warning');
                return;
            }
            const selected = files.slice(0, availableSlots);
            setUploadProgress(0);
            filesToDataUrls(selected, setUploadProgress).then(function (images) {
                previewGallery = previewGallery.concat(images).slice(0, 10);
                imageTouched = true;
                renderGallery(fields.imagePreview, previewGallery, fields.title ? fields.title.value : 'Tour', true);
                if (files.length > availableSlots) {
                    showToast('Only ' + String(availableSlots) + ' image(s) were added. Limit is 10.', 'warning');
                }
            }).catch(function () {
                showToast('Unable to load selected image files.', 'danger');
            });
        }

        function render() {
            if (!listHost) {
                return;
            }
            const tours = getGuideTours();
            listHost.innerHTML = '';
            if (!tours.length) {
                if (empty) {
                    empty.style.display = '';
                }
                return;
            }
            if (empty) {
                empty.style.display = 'none';
            }
            tours.forEach(function (tour) {
                const card = document.createElement('article');
                card.className = 'request-manage-card';
                card.dataset.tourId = tour.id;
                card.innerHTML = [
                    '<div class="request-top">',
                    '<div>',
                    '<h2 class="h5 mb-1">', escapeHtml(tour.title), '</h2>',
                    '<p class="small text-muted mb-0">Location: ', escapeHtml(tour.location), '</p>',
                    '</div>',
                    '<span class="badge-status ', tour.status === 'Published' ? 'badge-complete' : 'badge-negotiating', '">', escapeHtml(tour.status || 'Draft'), '</span>',
                    '</div>',
                    '<div class="request-body">',
                    '<div class="row mt-2 g-2 small text-muted">',
                    '<div class="col-md-4">Rating: <strong class="text-dark">', Number(tour.rating || 0).toFixed(2), ' (', String(tour.reviews || 0), ')</strong></div>',
                    '<div class="col-md-4">Duration: <strong class="text-dark">', escapeHtml(tour.duration), '</strong></div>',
                    '<div class="col-md-4">Capacity: <strong class="text-dark">', escapeHtml(tour.pax), '</strong></div>',
                    '<div class="col-md-4">Difficulty: <strong class="text-dark">', escapeHtml(tour.difficulty), '</strong></div>',
                    '<div class="col-md-4">Price: <strong class="text-dark">', formatPeso(tour.price), ' / ', escapeHtml((tour.priceType || 'Per person').replace(/^Per\s+/i, '').toLowerCase()), '</strong></div>',
                    '<div class="col-md-4">Provider: <strong class="text-dark">', escapeHtml(tour.provider || 'Guide'), '</strong></div>',
                    '<div class="col-md-4">Languages: <strong class="text-dark">', escapeHtml(tour.languages || 'English, Filipino'), '</strong></div>',
                    '<div class="col-md-12">Meeting Point: <strong class="text-dark">', escapeHtml(tour.meetingPoint || 'Main tourist pickup point'), '</strong></div>',
                    '</div>',
                    '<p class="small text-muted mt-2 mb-2">', escapeHtml(tour.description || 'No description yet.'), '</p>',
                    '<div class="tag-row">',
                    (tour.tags || []).map(function (tag) {
                        return '<span class="soft-tag">' + escapeHtml(tag) + '</span>';
                    }).join(''),
                    '</div>',
                    '<div class="post-gallery guide-gallery">',
                    (tour.gallery || [tour.image]).slice(0, 10).map(function (src, index) {
                        return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(tour.title) + ' image ' + (index + 1) + '">';
                    }).join(''),
                    '</div>',
                    '<div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-3">',
                    '<strong>', formatPeso(tour.price), '</strong>',
                    '<div class="d-flex gap-2">',
                    '<a class="btn-soft" href="/tour-preview?tour=', encodeURIComponent(tour.id), '&from=guide">Preview</a>',
                    '<button class="btn-soft" type="button" data-edit-tour="', escapeHtml(tour.id), '">Edit</button>',
                    '<button class="btn-danger" type="button" data-delete-tour="', escapeHtml(tour.id), '">Delete</button>',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join('');
                listHost.appendChild(card);
            });
        }

        function focusListingCard(tourId) {
            if (!listHost) {
                return;
            }
            const cards = qsa('[data-tour-id]', listHost);
            const targetCard = cards.find(function (card) {
                return card.dataset.tourId === tourId;
            });
            const anchorTarget = targetCard || listHost;
            if (!anchorTarget) {
                return;
            }

            window.location.hash = 'guideToursList';
            anchorTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (targetCard) {
                const previousOutline = targetCard.style.outline;
                const previousOffset = targetCard.style.outlineOffset;
                targetCard.style.outline = '2px solid #c89a2e';
                targetCard.style.outlineOffset = '4px';
                window.setTimeout(function () {
                    targetCard.style.outline = previousOutline;
                    targetCard.style.outlineOffset = previousOffset;
                }, 1400);
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const tours = getGuideTours();
                const existing = tours.find(function (tour) {
                    return fields.id && fields.id.value && tour.id === fields.id.value;
                }) || null;
                const payload = buildPayload(existing, fields.status ? fields.status.value : 'Published');
                const errors = validatePayload(payload);
                if (errors.length) {
                    const first = errors[0];
                    if (first.field && typeof first.field.setCustomValidity === 'function') {
                        first.field.setCustomValidity(first.message);
                        first.field.reportValidity();
                        first.field.addEventListener('input', function clearError() {
                            first.field.setCustomValidity('');
                        }, { once: true });
                    }
                    showToast(first.message, 'danger');
                    return;
                }
                const index = tours.findIndex(function (tour) {
                    return tour.id === payload.id;
                });
                if (index >= 0) {
                    tours[index] = payload;
                    showToast('Tour listing updated.', 'success');
                } else {
                    tours.unshift(payload);
                    showToast('Tour listing created.', 'success');
                }
                setGuideTours(tours);
                writeStore(GUIDE_TOUR_DRAFT_KEY, null);
                clearForm();
                render();
                focusListingCard(payload.id);
            });
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function () {
                saveDraft(true);
            });
        }

        if (fields.images) {
            fields.images.addEventListener('change', function () {
                const files = fields.images.files;
                if (!files || !files.length) {
                    return;
                }
                appendImages(files);
                fields.images.value = '';
                scheduleDraftSave();
            });
        }

        if (dropzone && fields.images) {
            dropzone.addEventListener('click', function () {
                fields.images.click();
            });
            ['dragenter', 'dragover'].forEach(function (eventName) {
                dropzone.addEventListener(eventName, function (event) {
                    event.preventDefault();
                    dropzone.classList.add('dragover');
                });
            });
            ['dragleave', 'drop'].forEach(function (eventName) {
                dropzone.addEventListener(eventName, function (event) {
                    event.preventDefault();
                    dropzone.classList.remove('dragover');
                });
            });
            dropzone.addEventListener('drop', function (event) {
                const files = event.dataTransfer && event.dataTransfer.files;
                if (files && files.length) {
                    appendImages(files);
                    scheduleDraftSave();
                }
            });
        }

        if (fields.guidePhoto && fields.guidePhotoPreview) {
            fields.guidePhoto.addEventListener('change', function () {
                const file = fields.guidePhoto.files && fields.guidePhoto.files[0];
                if (!file) {
                    return;
                }
                readGuidePhoto(file).then(function (src) {
                    fields.guidePhotoPreview.src = src;
                    guidePhotoTouched = true;
                    scheduleDraftSave();
                }).catch(function () {
                    showToast('Unable to load guide profile photo.', 'danger');
                });
            });
        }

        if (fields.imagePreview) {
            fields.imagePreview.addEventListener('click', function (event) {
                const removeBtn = event.target.closest('[data-remove-preview-image]');
                if (removeBtn) {
                    const removeIndex = Number(removeBtn.dataset.removePreviewImage);
                    if (!Number.isInteger(removeIndex) || removeIndex < 0 || removeIndex >= previewGallery.length) {
                        return;
                    }
                    previewGallery = previewGallery.filter(function (_src, index) {
                        return index !== removeIndex;
                    });
                    imageTouched = true;
                    renderGallery(fields.imagePreview, previewGallery, fields.title ? fields.title.value : 'Tour', true);
                    scheduleDraftSave();
                    return;
                }

                const coverBtn = event.target.closest('[data-set-cover-image]');
                if (coverBtn) {
                    const coverIndex = Number(coverBtn.dataset.setCoverImage);
                    if (!Number.isInteger(coverIndex) || coverIndex < 0 || coverIndex >= previewGallery.length) {
                        return;
                    }
                    const selected = previewGallery[coverIndex];
                    previewGallery = [selected].concat(previewGallery.filter(function (_src, index) {
                        return index !== coverIndex;
                    }));
                    imageTouched = true;
                    renderGallery(fields.imagePreview, previewGallery, fields.title ? fields.title.value : 'Tour', true);
                    scheduleDraftSave();
                }
            });
        }

        if (listHost) {
            listHost.addEventListener('click', function (event) {
                const editBtn = event.target.closest('[data-edit-tour]');
                if (editBtn) {
                    const id = editBtn.dataset.editTour;
                    const tour = getGuideTours().find(function (item) {
                        return item.id === id;
                    });
                    applyPayloadToForm(tour, true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const deleteBtn = event.target.closest('[data-delete-tour]');
                if (!deleteBtn) {
                    return;
                }
                const id = deleteBtn.dataset.deleteTour;
                const tours = getGuideTours().filter(function (tour) {
                    return tour.id !== id;
                });
                setGuideTours(tours);
                setGuideBookings(getGuideBookings().filter(function (booking) {
                    return booking.tourId !== id;
                }));
                setGuideReviews(getGuideReviews().filter(function (review) {
                    return review.tourId !== id;
                }));
                render();
                showToast('Tour listing deleted.', 'warning');
            });
        }

        if (form) {
            form.addEventListener('input', scheduleDraftSave);
            form.addEventListener('change', scheduleDraftSave);
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                clearForm();
            });
        }

        const savedDraft = readStore(GUIDE_TOUR_DRAFT_KEY, null);
        if (savedDraft && typeof savedDraft === 'object' && !Array.isArray(savedDraft)) {
            applyPayloadToForm(normalizeGuideTour(savedDraft), false);
        } else {
            clearForm();
        }

        render();
    }

    function initMessagesPage() {
        if (document.body.dataset.page !== 'guide-messages') {
            return;
        }

        const list = qs('#conversationList');
        const searchInput = qs('#guideMessageSearch');
        const chatTitle = qs('#chatTitle');
        const chatSubTitle = qs('#chatSubTitle');
        const chatMessages = qs('#chatMessages');
        const chatInput = qs('#chatInput');
        const chatForm = qs('#chatForm');
        const typingIndicator = qs('#typingIndicator');
        const params = new URLSearchParams(window.location.search);

        if (!list || !chatTitle || !chatMessages || !chatForm || !chatInput) {
            return;
        }

        let activeSearch = '';
        let conversations = getConversations();
        if (!conversations.length) {
            conversations = defaultConversations();
            setConversations(conversations);
        }

        let activeConversation = conversations[0] || null;
        const routeConversationId = params.get('conversation');
        if (routeConversationId) {
            const found = conversations.find(function (conversation) {
                return conversation.id === routeConversationId;
            });
            if (found) {
                activeConversation = found;
                activeConversation.unread = 0;
            }
        }

        if (activeConversation && params.get('starter') === '1') {
            const hasStarter = (activeConversation.messages || []).some(function (message) {
                return message.meta === 'selected-guide-starter';
            });
            if (!hasStarter) {
                activeConversation.messages.push({
                    id: uid('msg'),
                    mine: true,
                    text: STARTER_MESSAGE,
                    createdAt: nowISO(),
                    meta: 'selected-guide-starter'
                });
                activeConversation.lastTime = nowISO();
                setConversations(conversations);
            }
            chatInput.value = STARTER_MESSAGE;
        }

        function persistConversations() {
            setConversations(conversations);
        }

        function sortedConversations() {
            return conversations.slice().sort(function (a, b) {
                return new Date(b.lastTime || nowISO()).getTime() - new Date(a.lastTime || nowISO()).getTime();
            });
        }

        function renderList() {
            list.innerHTML = '';
            const visibleConversations = sortedConversations().filter(function (conversation) {
                if (!activeSearch) {
                    return true;
                }
                const lastMessage = (conversation.messages || []).slice(-1)[0];
                const blob = [
                    conversation.touristName,
                    conversation.tourTitle,
                    lastMessage ? lastMessage.text : ''
                ].join(' ').toLowerCase();
                return blob.includes(activeSearch);
            });

            if (!visibleConversations.length) {
                list.innerHTML = '<div class="px-3 py-3 small text-muted">No conversations found.</div>';
                return;
            }

            visibleConversations.forEach(function (conversation) {
                const lastMessage = (conversation.messages || []).slice(-1)[0];
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'conversation-item' + (activeConversation && activeConversation.id === conversation.id ? ' active' : '');
                row.dataset.conversationId = conversation.id;
                row.innerHTML = [
                    '<img class="conversation-avatar" src="', escapeHtml(conversation.avatar || '../images/manila.jpg'), '" alt="', escapeHtml(conversation.touristName || 'Tourist'), '">',
                    '<div class="flex-grow-1">',
                    '<div class="d-flex justify-content-between"><strong>', escapeHtml(conversation.touristName || 'Tourist'), '</strong><small class="text-muted">', relativeTime(conversation.lastTime), '</small></div>',
                    '<div class="small text-muted text-truncate" style="max-width:180px;">', escapeHtml(lastMessage ? lastMessage.text : 'No messages yet.'), '</div>',
                    '</div>',
                    conversation.unread > 0 ? '<span class="badge rounded-pill text-bg-warning">' + conversation.unread + '</span>' : ''
                ].join('');
                list.appendChild(row);
            });
        }

        function renderMessages() {
            if (!activeConversation) {
                chatTitle.textContent = 'Select a conversation';
                if (chatSubTitle) {
                    chatSubTitle.textContent = 'No active thread';
                }
                chatMessages.innerHTML = '';
                return;
            }

            chatTitle.textContent = activeConversation.touristName || 'Tourist';
            if (chatSubTitle) {
                chatSubTitle.textContent = activeConversation.tourTitle || 'Travel planning thread';
            }
            chatMessages.innerHTML = '';
            (activeConversation.messages || []).forEach(function (message) {
                const row = document.createElement('div');
                row.className = 'msg-row' + (message.mine ? ' mine' : '');
                row.innerHTML = '<div class="msg-bubble">' + escapeHtml(message.text) + '</div>';
                chatMessages.appendChild(row);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        list.addEventListener('click', function (event) {
            const row = event.target.closest('[data-conversation-id]');
            if (!row) {
                return;
            }
            const id = row.dataset.conversationId;
            const found = conversations.find(function (conversation) {
                return conversation.id === id;
            });
            if (!found) {
                return;
            }
            activeConversation = found;
            activeConversation.unread = 0;
            persistConversations();
            renderList();
            renderMessages();
        });

        chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!activeConversation) {
                return;
            }
            const text = String(chatInput.value || '').trim();
            if (!text) {
                return;
            }
            activeConversation.messages.push({
                id: uid('msg'),
                mine: true,
                text: text,
                createdAt: nowISO()
            });
            activeConversation.lastTime = nowISO();
            chatInput.value = '';
            renderMessages();
            renderList();
            persistConversations();

            if (typingIndicator) {
                typingIndicator.style.display = 'block';
            }
            const replyTargetId = activeConversation.id;
            setTimeout(function () {
                const replyTarget = conversations.find(function (conversation) {
                    return conversation.id === replyTargetId;
                });
                if (!replyTarget) {
                    return;
                }
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
                const reply = 'Noted. I will prepare options and confirm schedule details shortly.';
                replyTarget.messages.push({
                    id: uid('msg'),
                    mine: false,
                    text: reply,
                    createdAt: nowISO()
                });
                replyTarget.lastTime = nowISO();
                renderMessages();
                renderList();
                persistConversations();
            }, 900);
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                activeSearch = String(searchInput.value || '').trim().toLowerCase();
                renderList();
            });
        }

        renderList();
        renderMessages();
    }

    function initProfilePage() {
        if (document.body.dataset.page !== 'guide-profile') {
            return;
        }

        const form = qs('#guideProfileForm');
        const avatarInput = qs('#guideAvatarInput');
        const avatarPreview = qs('#guideAvatarPreview');
        const profile = getGuideProfile();

        const fields = {
            name: qs('#guideName'),
            location: qs('#guideLocation'),
            bio: qs('#guideBio'),
            phone: qs('#guidePhone'),
            email: qs('#guideEmail'),
            specialties: qs('#guideSpecialties'),
            languages: qs('#guideLanguages'),
            certifications: qs('#guideCertifications'),
            social: qs('#guideSocial')
        };

        function fillProfileView() {
            if (avatarPreview) {
                avatarPreview.src = profile.avatar || '../images/manila.jpg';
            }
            Object.keys(fields).forEach(function (key) {
                if (fields[key]) {
                    fields[key].value = profile[key] || '';
                }
            });
            const heading = qs('#guideProfileHeading');
            const sub = qs('#guideProfileSub');
            if (heading) {
                heading.textContent = profile.name || 'Guide Name';
            }
            if (sub) {
                sub.textContent = profile.location || 'Philippines';
            }
        }

        if (avatarInput && avatarPreview) {
            avatarInput.addEventListener('change', function () {
                const file = avatarInput.files && avatarInput.files[0];
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = function () {
                    avatarPreview.src = String(reader.result || '');
                };
                reader.readAsDataURL(file);
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const updated = Object.assign({}, profile, {
                    name: fields.name ? fields.name.value.trim() : profile.name,
                    location: fields.location ? fields.location.value.trim() : profile.location,
                    bio: fields.bio ? fields.bio.value.trim() : profile.bio,
                    phone: fields.phone ? fields.phone.value.trim() : profile.phone,
                    email: fields.email ? fields.email.value.trim() : profile.email,
                    specialties: fields.specialties ? fields.specialties.value.trim() : profile.specialties,
                    languages: fields.languages ? fields.languages.value.trim() : profile.languages,
                    certifications: fields.certifications ? fields.certifications.value.trim() : profile.certifications,
                    social: fields.social ? fields.social.value.trim() : profile.social,
                    avatar: avatarPreview ? avatarPreview.src : profile.avatar
                });
                setGuideProfile(updated);
                showToast('Guide profile saved.', 'success');
                fillProfileView();
            });
        }

        fillProfileView();
    }

    function renderPendingBookingsSummary(host) {
        if (!host) {
            return;
        }
        const tours = getGuideTours().reduce(function (acc, tour) {
            acc[tour.id] = tour;
            return acc;
        }, {});
        const bookings = getGuideBookings();
        const booked = bookings.filter(function (booking) {
            return isBookedStatus(booking.status);
        });
        const pending = bookings.filter(function (booking) {
            return String(booking.status || '').trim().toLowerCase() === 'pending';
        });
        const overview = booked.length ? booked : pending;
        const heading = booked.length ? 'Booked Tours' : 'Pending Approval';

        host.innerHTML = '';
        if (!overview.length) {
            host.innerHTML = '<div class="empty-state">No tourist bookings yet.</div>';
            return;
        }

        overview.slice(0, 6).forEach(function (booking) {
            const tour = tours[booking.tourId];
            if (!tour) {
                return;
            }
            const statusMeta = bookingStatusMeta(booking.status);
            const card = document.createElement('article');
            card.className = 'booking-card';
            card.innerHTML = [
                '<img class="media" src="', escapeHtml(tour.image), '" alt="', escapeHtml(tour.title), '">',
                '<div class="booking-body">',
                '<p class="small text-muted mb-1">', heading, '</p>',
                '<h3 class="h6 mb-1">', escapeHtml(tour.title), '</h3>',
                '<p class="small text-muted mb-1">Tourist: ', escapeHtml(booking.touristName || 'Tourist'), '</p>',
                '<p class="small text-muted mb-1">Listing: ', escapeHtml(tour.location || 'N/A'), '</p>',
                '<p class="small text-muted mb-2">Date: ', formatDate(booking.bookingDate), ' • Guests: ', escapeHtml(booking.guests || '1 guest'), '</p>',
                '<span class="status-pill ', statusMeta.className, '">', escapeHtml(statusMeta.label), '</span>',
                '</div>'
            ].join('');
            host.appendChild(card);
        });
    }

    function renderReviewsSummary(host) {
        if (!host) {
            return;
        }
        const tours = getGuideTours().reduce(function (acc, tour) {
            acc[tour.id] = tour;
            return acc;
        }, {});
        const bookings = getGuideBookings();
        const reviews = getGuideReviews();
        host.innerHTML = '';
        if (!reviews.length) {
            host.innerHTML = '<div class="empty-state">No reviews yet.</div>';
            return;
        }

        reviews.forEach(function (review) {
            const tour = tours[review.tourId];
            if (!tour) {
                return;
            }
            const relatedBooking = bookings.find(function (booking) {
                return booking.tourId === review.tourId && String(booking.touristName || '').trim().toLowerCase() === String(review.reviewer || '').trim().toLowerCase();
            });
            const row = document.createElement('article');
            row.className = 'settings-card dashboard-review-card';
            row.innerHTML = [
                '<p class="small text-muted mb-1">Booked Listing</p>',
                '<p class="mb-1"><strong>', escapeHtml(tour.title), '</strong></p>',
                '<p class="small mb-1">Tourist: ', escapeHtml(review.reviewer), '</p>',
                '<p class="small mb-1">Rating: <strong>', '★'.repeat(Math.max(1, Number(review.rating || 0))), '</strong></p>',
                relatedBooking ? '<p class="small text-muted mb-2">Booked date: ' + escapeHtml(formatDate(relatedBooking.bookingDate)) + ' • ' + escapeHtml(relatedBooking.guests || '1 guest') + '</p>' : '<p class="small text-muted mb-2">Booked date: Not available</p>',
                '<p class="small text-muted mb-0">', escapeHtml(review.comment), '</p>'
            ].join('');
            host.appendChild(row);
        });
    }

    function initDashboardPage() {
        if (document.body.dataset.page !== 'guide-dashboard') {
            return;
        }

        const tours = getGuideTours();
        const bookings = getGuideBookings();
        const reviews = getGuideReviews();
        const tourMap = tours.reduce(function (acc, tour) {
            acc[tour.id] = tour;
            return acc;
        }, {});
        const totalTours = tours.length;
        const pending = bookings.filter(function (booking) {
            return booking.status === 'Pending';
        }).length;
        const accepted = bookings.filter(function (booking) {
            return isBookedStatus(booking.status);
        }).length;
        const earnings = bookings.reduce(function (sum, booking) {
            if (!isBookedStatus(booking && booking.status)) {
                return sum;
            }
            const tour = tourMap[booking.tourId];
            if (!tour) {
                return sum;
            }
            return sum + (Number(tour.price || 0) * parseGuestCount(booking.guests));
        }, 0);
        const averageRating = reviews.length
            ? (reviews.reduce(function (sum, review) {
                return sum + Number(review.rating || 0);
            }, 0) / reviews.length).toFixed(1)
            : '0.0';

        const statTours = qs('#statTours');
        const statPending = qs('#statPending');
        const statAccepted = qs('#statAccepted');
        const statEarnings = qs('#statEarnings');
        const statRating = qs('#statRating');

        if (statTours) {
            statTours.textContent = String(totalTours);
        }
        if (statPending) {
            statPending.textContent = String(pending);
        }
        if (statAccepted) {
            statAccepted.textContent = String(accepted);
        }
        if (statEarnings) {
            statEarnings.textContent = formatPeso(earnings);
        }
        if (statRating) {
            statRating.textContent = String(averageRating);
        }

        renderPendingBookingsSummary(qs('#dashboardPendingList'));
        renderReviewsSummary(qs('#dashboardReviewList'));
    }

    function initGlobalActions() {
        const logout = qs('#logoutBtn');
        if (logout) {
            logout.addEventListener('click', function () {
                localStorage.removeItem(ROLE_KEY);
                window.location.href = '../index.html';
            });
        }
    }

    function init() {
        ensureSeedData();
        initSidebar();
        initTopbarScroll();
        setActiveNavigation();
        initGuideNotifications();
        initGlobalActions();

        initDashboardPage();
        initRequestPostFeedPage();
        initBookingRequestsPage();
        initToursPage();
        initMessagesPage();
        initProfilePage();
    }

    document.addEventListener('DOMContentLoaded', init);
})();