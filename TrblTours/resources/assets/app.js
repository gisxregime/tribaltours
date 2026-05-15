(function () {
    const ROLE_KEY = 'role';
    const LIKES_KEY = 'tribaltours_likes';
    const NOTIFICATIONS_KEY = 'tribaltours_notifications';
    const ACTIVE_PAGE_KEY = 'tribaltours_active_page';
    const BOOKING_DRAFT_KEY = 'tribaltours_booking_draft';
    const BOOKING_HISTORY_KEY = 'tribaltours_booking_history';
    const TOUR_OVERRIDES_KEY = 'tribaltours_tour_overrides';
    const GUIDE_TOURS_KEY = 'tribaltours_guide_tours_v1';
    const BOOKING_PROCESSING_LOCK_KEY = 'tribaltours_booking_processing_lock';
    const TOURIST_REQUESTS_KEY = 'tribaltours_tourist_requests_v1';
    const GUIDE_NOTIFICATIONS_KEY = 'tribaltours_guide_notifications_v1';
    const GUIDE_CONVERSATIONS_KEY = 'tribaltours_guide_conversations_v1';
    const GUIDE_STARTER_MESSAGE = 'You have been selected as the tour guide. Start discussing plans and arrangements.';
    const REQUEST_DEFAULT_REGION = 'Davao del Norte';

    const TOUR_CATALOG = {
        bohol: {
            id: 'bohol',
            location: 'Bohol, Philippines',
            title: 'Chocolate Hills & Tarsier Sanctuary',
            guide: 'Jethro Cabunas',
            rating: 4.97,
            reviews: 142,
            duration: '2 days',
            pax: '2-8 pax',
            difficulty: 'Easy',
            price: 2500,
            badge: 'Featured',
            image: 'images/pangasinan.jpg',
            guideAvatar: 'images/39.jpg',
            tags: ['Nature', 'Wildlife', 'Scenic'],
            region: 'cebu',
            latest: 20260508,
            provider: 'Jethro Cabunas',
            durationHours: '2 days',
            languages: 'English, Filipino',
            meetingPoint: 'Bohol Tourism Board pickup station',
            description: 'Walk through scenic forest paths, discover the iconic Chocolate Hills, and experience local wildlife with a verified local host.',
            gallery: ['images/pangasinan.jpg', 'images/puertoprincessa.jpg', 'images/carousel2.jpg', 'images/davao.jpg']
        },
        elnido: {
            id: 'elnido',
            location: 'El Nido, Palawan',
            title: 'Island Hopping & Hidden Lagoons',
            guide: 'Joshua Adrian Badal',
            rating: 4.93,
            reviews: 89,
            duration: '2 days',
            pax: '2-12 pax',
            difficulty: 'Moderate',
            price: 3800,
            badge: 'Featured',
            image: 'images/puertoprincessa.jpg',
            guideAvatar: 'images/7a.jpg',
            tags: ['Island Hopping', 'Snorkeling', 'Beach'],
            region: 'cebu',
            latest: 20260507,
            provider: 'Joshua Adrian Badal',
            durationHours: '2 days',
            languages: 'English, Filipino',
            meetingPoint: 'El Nido Port passenger terminal',
            description: 'Cruise through crystal waters, hidden lagoons, and island beaches with a guide focused on safety and premium island experiences.',
            gallery: ['images/puertoprincessa.jpg', 'images/carousel3.jpg', 'images/manila.png', 'images/pangasinan.jpg']
        },
        coron: {
            id: 'coron',
            location: 'Coron, Palawan',
            title: 'Shipwreck Diving & Kayangan Lake',
            guide: 'Joshua Duhaylungsod',
            rating: 4.88,
            reviews: 176,
            duration: '2 days',
            pax: '2-10 pax',
            difficulty: 'Moderate',
            price: 4500,
            badge: 'Featured',
            image: 'images/manila.png',
            guideAvatar: 'images/Manila-4.webp',
            tags: ['Diving', 'Snorkeling', 'Shipwreck'],
            region: 'cebu',
            latest: 20260506,
            provider: 'Joshua Duhaylungsod',
            durationHours: '2 days',
            languages: 'English, Filipino',
            meetingPoint: 'Coron town pier check-in area',
            description: 'Dive legendary wreck sites and unwind at Kayangan Lake with guided routes designed for scenic and safe exploration.',
            gallery: ['images/manila.png', 'images/puertoprincessa.jpg', 'images/davao.jpg', 'images/carousel2.jpg']
        },
        mtapo: {
            id: 'mtapo',
            location: 'Davao, Philippines',
            title: 'Mount Apo Summit Trek',
            guide: 'Lance Sebastian',
            rating: 4.95,
            reviews: 63,
            duration: '3 days',
            pax: '4-10 pax',
            difficulty: 'Challenging',
            price: 8500,
            badge: 'Trekking',
            image: 'images/davao.jpg',
            guideAvatar: 'images/intramurous.jpg',
            tags: ['Summit', 'Trekking', 'Camping'],
            region: 'davao',
            latest: 20260505,
            provider: 'Lance Sebastian',
            durationHours: '3 days',
            languages: 'English, Filipino',
            meetingPoint: 'Davao jump-off registration point',
            description: 'Take on the highest peak in the Philippines with expert pacing, camp coordination, and summit-focused trail support.',
            gallery: ['images/davao.jpg', 'images/carousel2.jpg', 'images/pangasinan.jpg', 'images/manila.png']
        },
        batanes: {
            id: 'batanes',
            location: 'Batanes, Philippines',
            title: 'Windmill Trail & Ivatan Culture',
            guide: 'Lloyd Viloria',
            rating: 4.96,
            reviews: 201,
            duration: '4 days',
            pax: '4-12 pax',
            difficulty: 'Easy',
            price: 6500,
            badge: 'Featured',
            image: 'images/carousel2.jpg',
            guideAvatar: 'images/manila.jpg',
            tags: ['Scenic', 'Culture', 'Photography'],
            region: 'manila',
            latest: 20260504,
            provider: 'Lloyd Viloria',
            durationHours: '4 days',
            languages: 'English, Filipino, Ivatan',
            meetingPoint: 'Basco tourism welcome center',
            description: 'Discover rolling hills, iconic windmills, and local Ivatan stories in a relaxed multi-day scenic itinerary.',
            gallery: ['images/carousel2.jpg', 'images/manila.jpg', 'images/pangasinan.jpg', 'images/puertoprincessa.jpg']
        },
        siargao: {
            id: 'siargao',
            location: 'Siargao, Philippines',
            title: 'Surf Lessons & Cloud 9 Waves',
            guide: 'Marklurence Mandalupe',
            rating: 4.91,
            reviews: 104,
            duration: '3 days',
            pax: '2-8 pax',
            difficulty: 'Moderate',
            price: 2200,
            badge: 'Water Sports',
            image: 'images/carousel3.jpg',
            guideAvatar: 'images/caoursel1.webp',
            tags: ['Surfing', 'Beach', 'Lessons'],
            region: 'davao',
            latest: 20260503,
            provider: 'Marklurence Mandalupe',
            durationHours: '3 days',
            languages: 'English, Filipino',
            meetingPoint: 'Cloud 9 boardwalk entrance',
            description: 'Improve your surf skills with guided sessions, board rentals, and beachside local experiences in Siargao.',
            gallery: ['images/carousel3.jpg', 'images/puertoprincessa.jpg', 'images/davao.jpg', 'images/carousel2.jpg']
        }
    };

    const DEFAULT_NOTIFICATIONS = [
        {
            id: 1,
            type: 'message',
            text: 'Maria Santos sent a new message.',
            time: '2m ago',
            read: false,
            payload: { conversationId: 'maria' }
        },
        {
            id: 2,
            type: 'booking-confirmation',
            text: 'Your Mt. Apo booking is confirmed.',
            time: '15m ago',
            read: false,
            payload: { tourId: 'mtapo' }
        },
        {
            id: 3,
            type: 'offer',
            text: 'New offer for Tagum River Discovery.',
            time: '32m ago',
            read: false,
            payload: { requestId: 'tagum-1' }
        },
        {
            id: 4,
            type: 'price-alert',
            text: 'Price alert: Bohol tour dropped 12%.',
            time: '1h ago',
            read: false,
            payload: { tourId: 'bohol' }
        },
        {
            id: 5,
            type: 'profile-update',
            text: 'Profile completion reached 90%.',
            time: '3h ago',
            read: false,
            payload: { section: 'preferences' }
        }
    ];

    const NOTIFICATION_TEMPLATE_BY_ID = DEFAULT_NOTIFICATIONS.reduce(function (acc, item) {
        acc[item.id] = item;
        return acc;
    }, {});

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function currentRole() {
        return localStorage.getItem(ROLE_KEY) || 'tourist';
    }

    function ensureTouristRole() {
        if (!localStorage.getItem(ROLE_KEY)) {
            localStorage.setItem(ROLE_KEY, 'tourist');
        }
    }

    function touristGuard() {
        ensureTouristRole();
        return true;
    }

    function initSidebar() {
        const toggle = qs('#sidebarToggle');
        const backdrop = qs('#sidebarBackdrop');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            if (window.matchMedia('(max-width: 992px)').matches) {
                document.body.classList.toggle('sidebar-open');
            } else {
                document.body.classList.toggle('sidebar-collapsed');
            }
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
        const handleScroll = function () {
            topbar.classList.toggle('scrolled', window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    function initTopbarNotifications() {
        const topbar = qs('#topbar');
        if (!topbar) {
            return;
        }

        let topbarRight = qs('.topbar-right', topbar);
        if (!topbarRight) {
            topbarRight = document.createElement('div');
            topbarRight.className = 'topbar-right';
            topbar.appendChild(topbarRight);
        }

        if (!qs('#topNotificationBtn', topbarRight)) {
            const bellButton = document.createElement('button');
            bellButton.type = 'button';
            bellButton.id = 'topNotificationBtn';
            bellButton.className = 'icon-btn';
            bellButton.setAttribute('data-bs-toggle', 'modal');
            bellButton.setAttribute('data-bs-target', '#topNotificationModal');
            bellButton.setAttribute('aria-label', 'Open notifications');
            bellButton.innerHTML = '<i class="fa-solid fa-bell"></i><span id="topNotificationBadge" class="unread-badge">0</span>';
            topbarRight.prepend(bellButton);
        }

        if (!qs('#topNotificationModal')) {
            const modal = document.createElement('div');
            modal.className = 'modal fade notification-modal';
            modal.id = 'topNotificationModal';
            modal.tabIndex = -1;
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = [
                '<div class="modal-dialog modal-dialog-centered">',
                '<div class="modal-content">',
                '<div class="modal-header">',
                '<h2 class="h5 mb-0">Notifications</h2>',
                '<div class="notification-modal-actions">',
                '<button id="topMarkAllRead" class="btn-soft py-1 px-3" type="button">Mark all read</button>',
                '<button class="btn-close" type="button" data-bs-dismiss="modal"></button>',
                '</div>',
                '</div>',
                '<div class="modal-body pt-2">',
                '<div id="topNotificationList" class="notification-modal-list"></div>',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
            document.body.appendChild(modal);
        }

        const markAll = qs('#topMarkAllRead');
        if (markAll && !markAll.dataset.boundClick) {
            markAll.addEventListener('click', function () {
                const updated = getNotifications().map(function (item) {
                    return Object.assign({}, item, { read: true });
                });
                setNotifications(updated);
                renderNotifications();
            });
            markAll.dataset.boundClick = 'true';
        }

        const sidebarNotifDropdown = qs('.sidebar-nav .dropdown .side-link.has-notif');
        if (sidebarNotifDropdown) {
            const wrapper = sidebarNotifDropdown.closest('.dropdown');
            if (wrapper) {
                wrapper.classList.add('notif-transferred');
            }
        }
    }

    function setActiveNavigation() {
        const page = document.body.dataset.page || localStorage.getItem(ACTIVE_PAGE_KEY) || '';
        if (page) {
            localStorage.setItem(ACTIVE_PAGE_KEY, page);
        }
        qsa('.side-link[data-page]').forEach(function (link) {
            link.classList.toggle('active', link.dataset.page === page);
            link.addEventListener('click', function () {
                localStorage.setItem(ACTIVE_PAGE_KEY, link.dataset.page || '');
            });
        });
    }

    function applyRoleVisibility() {
        const role = currentRole();
        qsa('[data-role-visible]').forEach(function (element) {
            const allowed = (element.dataset.roleVisible || '').split(',').map(function (item) {
                return item.trim();
            });
            element.style.display = allowed.includes(role) ? '' : 'none';
        });
    }

    function parseJSON(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (_error) {
            return fallback;
        }
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

    function normalizeTourData(baseTour, patch) {
        const merged = Object.assign({}, baseTour || {}, patch || {});
        const fallbackImage = merged.image || (baseTour && baseTour.image) || '';
        const ensureList = function (value, fallback) {
            const source = Array.isArray(value) ? value : String(value || '').split(',');
            const cleaned = source.map(function (item) {
                return String(item || '').trim();
            }).filter(Boolean);
            if (cleaned.length) {
                return cleaned;
            }
            return Array.isArray(fallback) ? fallback : [];
        };
        const asBool = function (value, fallback) {
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
        const rawTags = Array.isArray(merged.tags)
            ? merged.tags
            : String(merged.tags || '').split(',');
        const tags = rawTags.map(function (tag) {
            return String(tag || '').trim();
        }).filter(Boolean).slice(0, 6);

        const gallery = (Array.isArray(merged.gallery) ? merged.gallery : []).map(function (img) {
            return String(img || '').trim();
        }).filter(Boolean).slice(0, 4);

        if (!gallery.length && fallbackImage) {
            gallery.push(fallbackImage);
        }
        while (gallery.length < 4) {
            gallery.push(gallery[gallery.length - 1] || fallbackImage);
        }

        return Object.assign({}, merged, {
            location: String(merged.location || (baseTour && baseTour.location) || ''),
            title: String(merged.title || (baseTour && baseTour.title) || ''),
            rating: Math.min(Math.max(Number(merged.rating || (baseTour && baseTour.rating) || 0), 0), 5),
            reviews: Math.max(Math.round(Number(merged.reviews || (baseTour && baseTour.reviews) || 0)), 0),
            duration: String(merged.duration || (baseTour && baseTour.duration) || ''),
            pax: String(merged.pax || (baseTour && baseTour.pax) || ''),
            difficulty: String(merged.difficulty || (baseTour && baseTour.difficulty) || 'Moderate'),
            price: Math.max(Math.round(Number(merged.price || (baseTour && baseTour.price) || 0)), 1),
            description: String(merged.description || (baseTour && baseTour.description) || ''),
            tags: tags.length ? tags : ((baseTour && baseTour.tags) || []),
            image: gallery[0] || fallbackImage,
            gallery: gallery,
            coverImage: String(merged.coverImage || gallery[0] || fallbackImage || ''),
            durationHours: String(merged.durationHours || merged.duration || (baseTour && baseTour.durationHours) || ''),
            provider: String(merged.provider || merged.guide || (baseTour && (baseTour.provider || baseTour.guide)) || ''),
            meetingPoint: String(merged.meetingPoint || (baseTour && baseTour.meetingPoint) || 'Main tourist pickup point'),
            languages: String(merged.languages || (baseTour && baseTour.languages) || 'English, Filipino'),
            category: String(merged.category || (baseTour && baseTour.category) || 'Tour'),
            priceType: String(merged.priceType || (baseTour && baseTour.priceType) || 'Per person'),
            minGuests: Math.max(1, Number(merged.minGuests || (baseTour && baseTour.minGuests) || 1)),
            maxGuests: Math.max(1, Number(merged.maxGuests || (baseTour && baseTour.maxGuests) || 10)),
            guestTypes: ensureList(merged.guestTypes, ['Adult']),
            timeSlots: ensureList(merged.timeSlots, ['08:00 AM', '01:00 PM', '05:00 PM']),
            reservationType: String(merged.reservationType || (baseTour && baseTour.reservationType) || 'Instant booking'),
            freeCancellation: asBool(merged.freeCancellation, true),
            cancellationText: String(merged.cancellationText || (baseTour && baseTour.cancellationText) || 'Cancel up to 24 hours in advance for a full refund'),
            reserveNowPayLater: asBool(merged.reserveNowPayLater, true),
            includes: ensureList(merged.includes, ['Boat transfer', 'Entrance fees']),
            excludes: String(merged.excludes || (baseTour && baseTour.excludes) || 'Not specified'),
            requirements: String(merged.requirements || (baseTour && baseTour.requirements) || 'Follow guide reminders for a safe experience.'),
            safetyInfo: String(merged.safetyInfo || (baseTour && baseTour.safetyInfo) || 'Safety briefing is provided before the activity starts.'),
            guidePhoto: String(merged.guidePhoto || (baseTour && baseTour.guidePhoto) || merged.guideAvatar || ''),
            guideVerified: asBool(merged.guideVerified, false),
            guideExperienceYears: Math.max(0, Number(merged.guideExperienceYears || (baseTour && baseTour.guideExperienceYears) || 1)),
            guideContact: String(merged.guideContact || (baseTour && baseTour.guideContact) || ''),
            guideSocial: String(merged.guideSocial || (baseTour && baseTour.guideSocial) || ''),
            weatherSuitability: String(merged.weatherSuitability || (baseTour && baseTour.weatherSuitability) || ''),
            bestSeason: String(merged.bestSeason || (baseTour && baseTour.bestSeason) || ''),
            childFriendly: asBool(merged.childFriendly, false),
            petFriendly: asBool(merged.petFriendly, false)
        });
    }

    function normalizeTourAssetPath(path) {
        const value = String(path || '').trim();
        if (!value) {
            return '';
        }
        if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
            return value;
        }
        if (value.startsWith('../')) {
            return value.replace(/^\.\.\//, '');
        }
        if (value.startsWith('./')) {
            return value.replace(/^\.\//, '');
        }
        return value;
    }

    function getGuideToursCatalog() {
        const stored = parseJSON(localStorage.getItem(GUIDE_TOURS_KEY), []);
        const list = Array.isArray(stored) ? stored : [];
        return list.reduce(function (acc, item) {
            if (!item || typeof item !== 'object') {
                return acc;
            }
            const id = String(item.id || '').trim();
            if (!id) {
                return acc;
            }
            const rawGallery = Array.isArray(item.gallery) ? item.gallery : [item.image];
            const gallery = rawGallery.map(function (img) {
                return normalizeTourAssetPath(img);
            }).filter(Boolean).slice(0, 4);
            const normalized = normalizeTourData({
                id: id,
                location: String(item.location || 'Philippines'),
                title: String(item.title || 'Custom Tour'),
                category: String(item.category || 'Tour'),
                guide: String(item.provider || item.guide || 'Guide'),
                rating: Number(item.rating || 0),
                reviews: Number(item.reviews || 0),
                duration: String(item.duration || '2 days'),
                durationHours: String(item.durationHours || item.duration || '2 days'),
                pax: String(item.pax || '1-6 pax'),
                minGuests: Number(item.minGuests || 1),
                maxGuests: Number(item.maxGuests || 10),
                guestTypes: Array.isArray(item.guestTypes) ? item.guestTypes : [],
                timeSlots: Array.isArray(item.timeSlots) ? item.timeSlots : [],
                difficulty: String(item.difficulty || 'Moderate'),
                price: Number(item.price || 1),
                priceType: String(item.priceType || 'Per person'),
                reservationType: String(item.reservationType || 'Instant booking'),
                badge: String(item.status || 'Guide Listing'),
                freeCancellation: Boolean(item.freeCancellation),
                cancellationText: String(item.cancellationText || ''),
                reserveNowPayLater: Boolean(item.reserveNowPayLater),
                includes: Array.isArray(item.includes) ? item.includes : [],
                excludes: String(item.excludes || ''),
                requirements: String(item.requirements || ''),
                safetyInfo: String(item.safetyInfo || ''),
                image: normalizeTourAssetPath(item.image || gallery[0] || 'images/pangasinan.jpg'),
                coverImage: normalizeTourAssetPath(item.coverImage || item.image || gallery[0] || 'images/pangasinan.jpg'),
                guideAvatar: normalizeTourAssetPath(item.guideAvatar || 'images/manila.jpg'),
                guidePhoto: normalizeTourAssetPath(item.guidePhoto || item.guideAvatar || 'images/manila.jpg'),
                guideVerified: Boolean(item.guideVerified),
                guideExperienceYears: Number(item.guideExperienceYears || 1),
                guideContact: String(item.guideContact || ''),
                guideSocial: String(item.guideSocial || ''),
                tags: Array.isArray(item.tags) ? item.tags : [],
                region: 'all',
                latest: Date.now(),
                provider: String(item.provider || item.guide || 'Guide'),
                languages: String(item.languages || 'English, Filipino'),
                meetingPoint: String(item.meetingPoint || 'Main tourist pickup point'),
                description: String(item.description || ''),
                weatherSuitability: String(item.weatherSuitability || ''),
                bestSeason: String(item.bestSeason || ''),
                childFriendly: Boolean(item.childFriendly),
                petFriendly: Boolean(item.petFriendly),
                gallery: gallery.length ? gallery : [normalizeTourAssetPath(item.image || 'images/pangasinan.jpg')]
            }, {});
            acc[id] = normalized;
            return acc;
        }, {});
    }

    function getTourOverrides() {
        const overrides = parseJSON(localStorage.getItem(TOUR_OVERRIDES_KEY), {});
        if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
            return {};
        }
        return overrides;
    }

    function setTourOverrides(overrides) {
        localStorage.setItem(TOUR_OVERRIDES_KEY, JSON.stringify(overrides));
    }

    function updateTourOverride(tourId, patch) {
        const guideTours = getGuideToursCatalog();
        const base = TOUR_CATALOG[tourId] || guideTours[tourId] || TOUR_CATALOG.bohol;
        const overrides = getTourOverrides();
        const current = overrides[tourId] || {};
        overrides[tourId] = normalizeTourData(base, Object.assign({}, current, patch || {}));
        setTourOverrides(overrides);
    }

    function getNotifications() {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!stored) {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
            return DEFAULT_NOTIFICATIONS.slice();
        }
        const parsed = parseJSON(stored, DEFAULT_NOTIFICATIONS.slice());
        if (!Array.isArray(parsed)) {
            return DEFAULT_NOTIFICATIONS.slice();
        }
        return parsed.map(function (item, index) {
            const id = Number(item && item.id);
            const fallback = NOTIFICATION_TEMPLATE_BY_ID[id] || DEFAULT_NOTIFICATIONS[index] || DEFAULT_NOTIFICATIONS[0];
            return Object.assign({}, fallback, item, {
                id: Number((item && item.id) || fallback.id),
                type: String((item && item.type) || fallback.type),
                text: String((item && item.text) || fallback.text),
                time: String((item && item.time) || fallback.time),
                read: Boolean(item && typeof item.read === 'boolean' ? item.read : fallback.read),
                payload: Object.assign({}, fallback.payload || {}, (item && item.payload) || {})
            });
        });
    }

    function setNotifications(list) {
        const safeList = Array.isArray(list) ? list : DEFAULT_NOTIFICATIONS.slice();
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(safeList));
    }

    function getGuideConversations() {
        const list = parseJSON(localStorage.getItem(GUIDE_CONVERSATIONS_KEY), []);
        return Array.isArray(list) ? list : [];
    }

    function setGuideConversations(list) {
        const safeList = Array.isArray(list) ? list : [];
        localStorage.setItem(GUIDE_CONVERSATIONS_KEY, JSON.stringify(safeList));
    }

    function normalizeGuideAssetPath(path) {
        const value = String(path || '').trim();
        if (!value) {
            return '../images/manila.jpg';
        }
        if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('../')) {
            return value;
        }
        if (value.startsWith('images/')) {
            return '../' + value;
        }
        return value;
    }

    function addTouristRequestForGuide(payload) {
        const requests = parseJSON(localStorage.getItem(TOURIST_REQUESTS_KEY), []);
        const current = Array.isArray(requests) ? requests : [];
        const item = {
            id: payload.id || ('tourist-request-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)),
            touristName: String(payload.touristName || 'Tourist').trim(),
            touristAvatar: normalizeGuideAssetPath(payload.touristAvatar || 'images/manila.jpg'),
            title: String(payload.title || 'Tourist request').trim(),
            location: String(payload.location || 'Philippines').trim(),
            budgetMin: Math.max(0, Number(payload.budgetMin || 0)),
            budgetMax: Math.max(0, Number(payload.budgetMax || 0)),
            duration: String(payload.duration || 'Flexible').trim(),
            travelers: String(payload.travelers || '1 traveler').trim(),
            interests: Array.isArray(payload.interests) ? payload.interests : [],
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(TOURIST_REQUESTS_KEY, JSON.stringify([item].concat(current).slice(0, 80)));
    }

    function createGuideSelectionNotification(payload) {
        const touristName = String(payload.touristName || 'Tourist').trim();
        const tourTitle = String(payload.tourTitle || 'tour request').trim();
        const conversationId = 'conv-' + touristName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const avatar = normalizeGuideAssetPath(payload.touristAvatar || 'images/manila.jpg');

        const conversations = getGuideConversations();
        const existingConversation = conversations.find(function (conversation) {
            return conversation.id === conversationId;
        });

        const introText = 'I selected you as my tour guide for ' + tourTitle + '.';
        if (!existingConversation) {
            conversations.unshift({
                id: conversationId,
                touristName: touristName,
                avatar: avatar,
                tourTitle: tourTitle,
                unread: 1,
                lastTime: new Date().toISOString(),
                messages: [
                    {
                        id: 'msg-' + Date.now().toString(36),
                        mine: false,
                        text: introText,
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        } else {
            existingConversation.avatar = avatar;
            existingConversation.tourTitle = tourTitle;
            existingConversation.unread = Math.max(Number(existingConversation.unread || 0), 0) + 1;
            existingConversation.lastTime = new Date().toISOString();
            existingConversation.messages = Array.isArray(existingConversation.messages) ? existingConversation.messages : [];
            existingConversation.messages.push({
                id: 'msg-' + Date.now().toString(36),
                mine: false,
                text: introText,
                createdAt: new Date().toISOString()
            });
        }
        setGuideConversations(conversations);

        const notifications = parseJSON(localStorage.getItem(GUIDE_NOTIFICATIONS_KEY), []);
        const current = Array.isArray(notifications) ? notifications : [];
        current.push({
            id: 'guide-notif-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
            type: 'guide-selected',
            text: touristName + ' selected you for "' + tourTitle + '".',
            createdAt: new Date().toISOString(),
            read: false,
            payload: {
                conversationId: conversationId,
                requestId: String(payload.requestId || ''),
                starterMessage: GUIDE_STARTER_MESSAGE
            }
        });
        localStorage.setItem(GUIDE_NOTIFICATIONS_KEY, JSON.stringify(current.slice(-120)));
    }

    function getNotificationRoute(item) {
        if (!item || !item.type) {
            return '';
        }
        const payload = item.payload || {};
        if (item.type === 'message') {
            const conversationId = payload.conversationId || 'maria';
            return 'messages.html?conversation=' + encodeURIComponent(conversationId);
        }
        if (item.type === 'booking-confirmation') {
            const tourId = payload.tourId || 'bohol';
            return 'booking-details.html?tour=' + encodeURIComponent(tourId);
        }
        if (item.type === 'offer') {
            const requestId = payload.requestId || 'tagum-1';
            return 'my-posts.html?request=' + encodeURIComponent(requestId) + '&openThread=1';
        }
        if (item.type === 'price-alert') {
            const tourId = payload.tourId || 'bohol';
            return 'tour-preview.html?tour=' + encodeURIComponent(tourId);
        }
        if (item.type === 'profile-update') {
            const section = payload.section || 'preferences';
            return 'profile.html?section=' + encodeURIComponent(section);
        }
        return '';
    }

    function renderNotifications() {
        const list = getNotifications();
        const sidebarContainer = qs('#notificationList');
        const modalContainer = qs('#topNotificationList');
        const sidebarBadge = qs('#notificationBadge');
        const topbarBadge = qs('#topNotificationBadge');
        if (!sidebarContainer && !modalContainer && !sidebarBadge && !topbarBadge) {
            return;
        }

        const unread = list.filter(function (item) {
            return !item.read;
        }).length;

        if (sidebarBadge) {
            sidebarBadge.textContent = String(unread);
            sidebarBadge.style.display = 'grid';
        }

        if (topbarBadge) {
            topbarBadge.textContent = String(unread);
            topbarBadge.style.display = unread > 0 ? 'grid' : 'none';
        }

        function renderList(container) {
            if (!container) {
                return;
            }
            container.innerHTML = '';
            list.forEach(function (item) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'dropdown-item notification-item' + (item.read ? '' : ' unread');
                button.dataset.notificationId = String(item.id);
                button.innerHTML = [
                    '<div class="notification-item__content">',
                    '<div class="notification-item__title">', item.text, '</div>',
                    '<small class="notification-item__time">', item.time, '</small>',
                    '</div>'
                ].join('');
                if (!item.read) {
                    const dot = document.createElement('span');
                    dot.className = 'badge rounded-pill text-bg-warning notification-item__badge';
                    dot.textContent = 'new';
                    button.appendChild(dot);
                }
                container.appendChild(button);
            });
        }

        function bindListClick(container) {
            if (!container || container.dataset.boundClick) {
                return;
            }
            container.addEventListener('click', function (event) {
                const target = event.target.closest('[data-notification-id]');
                if (!target) {
                    return;
                }
                const id = Number(target.dataset.notificationId);
                const currentList = getNotifications();
                const selectedItem = currentList.find(function (item) {
                    return item.id === id;
                });
                const updated = currentList.map(function (item) {
                    if (item.id === id) {
                        return Object.assign({}, item, { read: true });
                    }
                    return item;
                });
                setNotifications(updated);
                renderNotifications();
                const route = getNotificationRoute(selectedItem);
                if (route) {
                    window.location.href = route;
                }
            });
            container.dataset.boundClick = 'true';
        }

        renderList(sidebarContainer);
        renderList(modalContainer);
        bindListClick(sidebarContainer);
        bindListClick(modalContainer);
    }

    function getLikes() {
        const likes = parseJSON(localStorage.getItem(LIKES_KEY), []);
        return Array.isArray(likes) ? likes : [];
    }

    function setLikes(likes) {
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    }

    function postLikeToApi(action, tourId) {
        // API-ready hook. Replace with fetch('/api/likes', { method: 'POST', body: ... })
        console.info('Like API hook', action, tourId);
    }

    function toggleLike(tourId, triggerButton) {
        const likes = getLikes();
        const exists = likes.includes(tourId);
        const nextLikes = exists ? likes.filter(function (item) {
            return item !== tourId;
        }) : likes.concat([tourId]);

        setLikes(nextLikes);
        postLikeToApi(exists ? 'remove' : 'save', tourId);
        if (triggerButton) {
            triggerButton.classList.add('heart-pop');
            triggerButton.addEventListener('animationend', function removePopClass() {
                triggerButton.classList.remove('heart-pop');
                triggerButton.removeEventListener('animationend', removePopClass);
            });
        }
        bindLikeButtons();
        updateSavedCounters();
        return !exists;
    }

    function bindLikeButtons(scope) {
        qsa('.like-save[data-like-id]', scope || document).forEach(function (button) {
            const id = button.dataset.likeId;
            const active = getLikes().includes(id);
            button.classList.toggle('active', active);
            button.innerHTML = active
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
            button.title = active ? 'Remove from likes' : 'Save tour';
        });
    }

    function updateSavedCounters() {
        const count = getLikes().length;
        qsa('[data-saved-count]').forEach(function (el) {
            el.textContent = String(count);
        });
    }

    function debounce(fn, delay) {
        let timer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    function showToast(message, kind) {
        const host = qs('#toastHost') || createToastHost();
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-' + (kind || 'dark') + ' border-0';
        toast.setAttribute('role', 'status');
        toast.innerHTML = [
            '<div class="d-flex">',
            '<div class="toast-body">' + message + '</div>',
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

    function createToastHost() {
        const host = document.createElement('div');
        host.id = 'toastHost';
        host.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(host);
        return host;
    }

    function setButtonLoading(button, loading) {
        if (!button) {
            return;
        }
        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...';
            return;
        }
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Submit';
    }

    function fakeAjax(payload, timeout) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve({ ok: true, data: payload });
            }, timeout || 900);
        });
    }

    function resolveRequestRegionKey(value) {
        const text = String(value || '').trim().toLowerCase();
        if (!text) {
            return 'all';
        }
        if (text.indexOf('davao') !== -1 || text.indexOf('mindanao') !== -1) {
            return 'davao';
        }
        if (text.indexOf('cebu') !== -1 || text.indexOf('bohol') !== -1 || text.indexOf('palawan') !== -1 || text.indexOf('visayas') !== -1) {
            return 'cebu';
        }
        if (text.indexOf('manila') !== -1 || text.indexOf('ncr') !== -1 || text.indexOf('luzon') !== -1) {
            return 'manila';
        }
        return 'all';
    }

    function buildRequestCard(data) {
        return [
            '<article class="feed-item request-card" data-type="request" data-region="', data.regionKey || resolveRequestRegionKey(data.region), '" data-price="', data.budgetMax || 2000, '" data-latest="', Date.now(), '" data-search="',
            (data.title + ' ' + data.location + ' ' + (data.interests || '')).toLowerCase(),
            '">',
            '<div class="d-flex justify-content-between align-items-start gap-2">',
            '<div>',
            '<p class="text-uppercase small fw-bold text-muted mb-1">Request Post</p>',
            '<h6 class="mb-1">', data.title, '</h6>',
            '<p class="mb-0 text-muted small">', data.location, '</p>',
            '</div>',
            '<span class="badge-status badge-open">Open</span>',
            '</div>',
            '<div class="mt-3 small text-muted">',
            '<div>Budget: <strong class="text-dark">PHP ', Number(data.budgetMin || 0).toLocaleString(), ' - PHP ', Number(data.budgetMax || 0).toLocaleString(), '</strong></div>',
            '<div>Travelers: <strong class="text-dark">', data.adults || 1, ' adults', Number(data.children || 0) > 0 ? ' / ' + data.children + ' children' : '', '</strong></div>',
            '<div>Duration: <strong class="text-dark">', data.duration || 3, ' days</strong></div>',
            '</div>',
            '<div class="tag-row">',
            (data.interests || '').split(',').filter(Boolean).slice(0, 4).map(function (tag) {
                return '<span class="soft-tag">' + tag.trim() + '</span>';
            }).join(''),
            '</div>',
            '<div class="mt-3 d-flex justify-content-between">',
            '<button class="btn-soft">View Offers</button>',
            '<button class="btn-gold">Promote</button>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initExplorePage() {
        const feed = qs('#feedCards');
        if (!feed) {
            return;
        }

        const searchInput = qs('#searchInput');
        const typeButtons = qsa('[data-feed-type]');
        const regionButtons = qsa('[data-region-chip]');
        const sortSelect = qs('#sortSelect');
        const budgetRange = qs('#budgetRange');
        const budgetOutput = qs('#budgetOutput');
        const durationInput = qs('#reqDuration');
        const durationOutput = qs('#reqDurationValue');
        const minBudget = qs('#reqBudgetMin');
        const maxBudget = qs('#reqBudgetMax');
        const budgetPreview = qs('#reqBudgetPreview');
        const adultsDisplay = qs('#adultsCount');
        const childrenDisplay = qs('#childrenCount');
        const createForm = qs('#createRequestForm');
        const regionInput = qs('#reqRegion', createForm || document);
        const visibleCounter = qs('#visibleCounter');

        let activeType = 'all';
        let activeRegion = 'all';

        if (regionInput && !String(regionInput.value || '').trim()) {
            regionInput.value = REQUEST_DEFAULT_REGION;
        }

        if (budgetRange && budgetOutput) {
            budgetOutput.textContent = 'PHP ' + Number(budgetRange.value).toLocaleString();
            budgetRange.addEventListener('input', function () {
                budgetOutput.textContent = 'PHP ' + Number(budgetRange.value).toLocaleString();
            });
        }

        if (durationInput && durationOutput) {
            durationOutput.textContent = durationInput.value + ' days';
            durationInput.addEventListener('input', function () {
                durationOutput.textContent = durationInput.value + ' days';
            });
        }

        function syncModalBudget() {
            if (!minBudget || !maxBudget || !budgetPreview) {
                return;
            }
            const min = Number(minBudget.value);
            const max = Number(maxBudget.value);
            budgetPreview.textContent = 'PHP ' + min.toLocaleString() + ' - PHP ' + max.toLocaleString();
        }

        if (minBudget && maxBudget) {
            syncModalBudget();
            minBudget.addEventListener('input', syncModalBudget);
            maxBudget.addEventListener('input', syncModalBudget);
        }

        qsa('[data-counter-btn]').forEach(function (button) {
            button.addEventListener('click', function () {
                const target = button.dataset.counterBtn;
                const type = button.dataset.counterType;
                const el = qs('#' + target);
                if (!el) {
                    return;
                }
                const current = Number(el.value || 0);
                const next = Math.max(type === 'minus' ? current - 1 : current + 1, target === 'adultInput' ? 1 : 0);
                el.value = String(next);
                if (target === 'adultInput' && adultsDisplay) {
                    adultsDisplay.textContent = String(next);
                }
                if (target === 'childInput' && childrenDisplay) {
                    childrenDisplay.textContent = String(next);
                }
            });
        });

        function applyFilters() {
            const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
            const cards = qsa('.feed-item', feed);

            cards.forEach(function (card) {
                const cardType = card.dataset.type;
                const cardRegion = card.dataset.region;
                const blob = card.dataset.search || '';
                const showType = activeType === 'all' || cardType === activeType;
                const showRegion = activeRegion === 'all' || cardRegion === activeRegion;
                const showSearch = query.length === 0 || blob.includes(query);
                card.style.display = showType && showRegion && showSearch ? '' : 'none';
            });

            const sorted = cards.slice().sort(function (a, b) {
                const mode = sortSelect ? sortSelect.value : 'latest';
                if (mode === 'price-asc') {
                    return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
                }
                return Number(b.dataset.latest || 0) - Number(a.dataset.latest || 0);
            });

            sorted.forEach(function (card) {
                feed.appendChild(card);
            });

            if (visibleCounter) {
                const count = cards.filter(function (card) {
                    return card.style.display !== 'none';
                }).length;
                visibleCounter.textContent = String(count) + ' cards in feed';
            }
        }

        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.dataset.feedType || 'all';
                typeButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        regionButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeRegion = button.dataset.regionChip || 'all';
                regionButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', debounce(applyFilters, 220));
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        if (createForm) {
            createForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const submitBtn = qs('button[type="submit"]', createForm);
                const formData = new FormData(createForm);
                const payload = Object.fromEntries(formData.entries());
                const low = Number(payload.budgetMin || 0);
                const high = Number(payload.budgetMax || 0);
                const regionText = String(payload.region || REQUEST_DEFAULT_REGION).trim();

                if (high < low) {
                    showToast('Budget max should be greater than min.', 'danger');
                    return;
                }

                if (!regionText) {
                    showToast('Region is required.', 'warning');
                    if (regionInput) {
                        regionInput.focus();
                    }
                    return;
                }

                setButtonLoading(submitBtn, true);
                fakeAjax(payload, 1100).then(function () {
                    const selectedInterests = qsa('input[name="interests[]"]:checked', createForm).map(function (item) {
                        return item.value;
                    });
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = buildRequestCard({
                        title: payload.title || 'New Tourist Request',
                        location: payload.location || 'Philippines',
                        region: regionText,
                        duration: payload.duration || durationInput.value,
                        budgetMin: payload.budgetMin || minBudget.value,
                        budgetMax: payload.budgetMax || maxBudget.value,
                        adults: payload.adults || 1,
                        children: payload.children || 0,
                        interests: selectedInterests.join(',')
                    });
                    feed.prepend(wrapper.firstChild);
                    addTouristRequestForGuide({
                        touristName: 'Tourist User',
                        touristAvatar: 'images/manila.jpg',
                        title: payload.title || 'New Tourist Request',
                        location: payload.location || 'Philippines',
                        budgetMin: payload.budgetMin || minBudget.value,
                        budgetMax: payload.budgetMax || maxBudget.value,
                        duration: (payload.duration || durationInput.value) + ' days',
                        travelers: String(payload.adults || 1) + ' adults' + (Number(payload.children || 0) > 0 ? ' / ' + String(payload.children) + ' children' : ''),
                        interests: selectedInterests
                    });
                    createForm.reset();
                    syncModalBudget();
                    if (regionInput) {
                        regionInput.value = REQUEST_DEFAULT_REGION;
                    }
                    if (durationOutput && durationInput) {
                        durationOutput.textContent = durationInput.value + ' days';
                    }
                    const modal = bootstrap.Modal.getInstance(qs('#createRequestModal'));
                    if (modal) {
                        modal.hide();
                    }
                    showToast('Request created successfully.', 'success');
                    applyFilters();
                }).finally(function () {
                    setButtonLoading(submitBtn, false);
                });
            });
        }

        const infiniteHook = qs('#infiniteHook');
        if (infiniteHook) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        window.dispatchEvent(new CustomEvent('tribaltours:infinite-scroll', {
                            detail: { source: 'index-feed' }
                        }));
                        showToast('Infinite scroll hook reached.', 'dark');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });
            observer.observe(infiniteHook);
        }

        qsa('[data-page-link]').forEach(function (button) {
            button.addEventListener('click', function () {
                qsa('[data-page-link]').forEach(function (b) { b.classList.remove('active'); });
                button.classList.add('active');
                showToast('Pagination simulation: Page ' + button.dataset.pageLink, 'dark');
            });
        });

        feed.addEventListener('click', function (event) {
            const likeButton = event.target.closest('[data-like-id]');
            if (!likeButton) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const liked = toggleLike(likeButton.dataset.likeId, likeButton);
            showToast(liked ? 'Tour saved to likes.' : 'Tour removed from likes.', 'success');
        });

        syncExploreCardsWithCatalog();
        applyFilters();
    }

    function initMyPostsPage() {
        const editModal = qs('#editRequestModal');
        const editForm = qs('#editRequestForm');
        const cards = qsa('.request-manage-card');
        const editModalInstance = editModal ? bootstrap.Modal.getOrCreateInstance(editModal) : null;
        const params = new URLSearchParams(window.location.search);
        const requestFromRoute = params.get('request');
        const openThreadFromRoute = params.get('openThread') === '1';
        const formFields = {
            requestId: qs('#editRequestId'),
            tourId: qs('#editTourId'),
            destination: qs('#editDestination'),
            title: qs('#editTitle'),
            rating: qs('#editRating'),
            reviews: qs('#editReviews'),
            duration: qs('#editDuration'),
            pax: qs('#editPax'),
            difficulty: qs('#editDifficulty'),
            pricing: qs('#editPricing'),
            tags: qs('#editTags'),
            description: qs('#editDescription'),
            images: qs('#editImages'),
            imagePreview: qs('#editImagePreview')
        };
        let pendingGallery = [];

        function renderTags(host, tags) {
            if (!host) {
                return;
            }
            host.innerHTML = '';
            (tags || []).forEach(function (tag) {
                const pill = document.createElement('span');
                pill.className = 'soft-tag';
                pill.textContent = tag;
                host.appendChild(pill);
            });
        }

        function renderGallery(host, gallery, title) {
            if (!host) {
                return;
            }
            const list = (gallery || []).filter(Boolean).slice(0, 4);
            host.innerHTML = list.map(function (src, idx) {
                return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(title) + ' image ' + (idx + 1) + '">';
            }).join('');
        }

        function renderMyPostCard(card, tour) {
            const setText = function (selector, value) {
                const el = qs(selector, card);
                if (el) {
                    el.textContent = value;
                }
            };
            setText('[data-field="location"]', tour.location);
            setText('[data-field="title"]', tour.title);
            setText('[data-field="rating"]', tour.rating.toFixed(2));
            setText('[data-field="reviews"]', String(tour.reviews));
            setText('[data-field="duration"]', tour.duration);
            setText('[data-field="pax"]', tour.pax);
            setText('[data-field="difficulty"]', tour.difficulty);
            setText('[data-field="price"]', formatPeso(tour.price) + ' / person');
            setText('[data-field="description"]', tour.description);
            renderTags(qs('[data-field="tags"]', card), tour.tags);
            renderGallery(qs('[data-field="images"]', card), tour.gallery, tour.title);
            const previewLink = qs('[data-preview-link]', card);
            if (previewLink) {
                previewLink.setAttribute('href', 'tour-preview.html?tour=' + encodeURIComponent(tour.id));
            }
        }

        function fillEditForm(card, tour) {
            if (formFields.requestId) {
                formFields.requestId.value = card.dataset.requestId || '';
            }
            if (formFields.tourId) {
                formFields.tourId.value = tour.id;
            }
            if (formFields.destination) {
                formFields.destination.value = tour.location;
            }
            if (formFields.title) {
                formFields.title.value = tour.title;
            }
            if (formFields.rating) {
                formFields.rating.value = tour.rating.toFixed(2);
            }
            if (formFields.reviews) {
                formFields.reviews.value = String(tour.reviews);
            }
            if (formFields.duration) {
                formFields.duration.value = tour.duration;
            }
            if (formFields.pax) {
                formFields.pax.value = tour.pax;
            }
            if (formFields.difficulty) {
                formFields.difficulty.value = tour.difficulty;
            }
            if (formFields.pricing) {
                formFields.pricing.value = String(tour.price);
            }
            if (formFields.tags) {
                formFields.tags.value = (tour.tags || []).join(', ');
            }
            if (formFields.description) {
                formFields.description.value = tour.description;
            }
            if (formFields.images) {
                formFields.images.value = '';
            }
            pendingGallery = [];
            renderGallery(formFields.imagePreview, tour.gallery, tour.title);
        }

        function filesToDataUrls(fileList) {
            const files = Array.from(fileList || []).slice(0, 4);
            return Promise.all(files.map(function (file) {
                return new Promise(function (resolve, reject) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        resolve(String(reader.result || ''));
                    };
                    reader.onerror = function () {
                        reject(new Error('Failed to read image file.'));
                    };
                    reader.readAsDataURL(file);
                });
            }));
        }

        cards.forEach(function (card) {
            const tourId = card.dataset.tourId || 'bohol';
            renderMyPostCard(card, getTourById(tourId));

            const toggleBtn = qs('[data-toggle-thread]', card);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function () {
                    const box = qs('.negotiation-box', card);
                    box.classList.toggle('open');
                    toggleBtn.textContent = box.classList.contains('open') ? 'Hide Negotiation' : 'View Negotiation';
                });
            }

            qsa('[data-reply-form]', card).forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    const input = qs('textarea', form);
                    if (!input.value.trim()) {
                        return;
                    }
                    const offer = document.createElement('div');
                    offer.className = 'offer-item';
                    offer.textContent = 'You: ' + input.value.trim();
                    form.parentElement.insertBefore(offer, form);
                    input.value = '';
                    showToast('Reply posted in thread.', 'success');
                });
            });

            qsa('[data-select-guide]', card).forEach(function (button) {
                button.addEventListener('click', function () {
                    const guideName = button.dataset.selectGuide || 'Guide';
                    const touristName = qs('[data-field="posted_by"]', card)
                        ? qs('[data-field="posted_by"]', card).textContent.trim()
                        : 'Tourist';
                    const title = qs('[data-field="title"]', card)
                        ? qs('[data-field="title"]', card).textContent.trim()
                        : 'Tour request';
                    const touristAvatar = qs('.tourist-avatar', card)
                        ? qs('.tourist-avatar', card).getAttribute('src')
                        : 'images/manila.jpg';
                    createGuideSelectionNotification({
                        guideName: guideName,
                        touristName: touristName,
                        touristAvatar: touristAvatar,
                        tourTitle: title,
                        requestId: card.dataset.requestId || ''
                    });
                    showToast(guideName + ' selected for this request.', 'success');
                });
            });

            const cancelBtn = qs('[data-cancel-request]', card);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function () {
                    card.remove();
                    showToast('Request canceled.', 'warning');
                });
            }

            const completeBtn = qs('[data-complete-request]', card);
            if (completeBtn) {
                completeBtn.addEventListener('click', function () {
                    const badge = qs('.badge-status', card);
                    badge.className = 'badge-status badge-complete';
                    badge.textContent = 'Completed';
                    showToast('Request marked complete.', 'success');
                });
            }

            const editBtn = qs('[data-edit-request]', card);
            if (editBtn && editModalInstance) {
                editBtn.addEventListener('click', function () {
                    const currentTour = getTourById(card.dataset.tourId || 'bohol');
                    fillEditForm(card, currentTour);
                    if (!editBtn.dataset.bsToggle) {
                        editModalInstance.show();
                    }
                });
            }
        });

        if (requestFromRoute) {
            const targetCard = qs('.request-manage-card[data-request-id="' + requestFromRoute + '"]');
            if (targetCard) {
                if (openThreadFromRoute) {
                    const threadBox = qs('.negotiation-box', targetCard);
                    const threadBtn = qs('[data-toggle-thread]', targetCard);
                    if (threadBox && !threadBox.classList.contains('open')) {
                        threadBox.classList.add('open');
                    }
                    if (threadBtn) {
                        threadBtn.textContent = 'Hide Negotiation';
                    }
                }
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        if (formFields.images) {
            formFields.images.addEventListener('change', function () {
                if (!formFields.images.files || !formFields.images.files.length) {
                    pendingGallery = [];
                    const currentTour = getTourById((formFields.tourId && formFields.tourId.value) || 'bohol');
                    renderGallery(formFields.imagePreview, currentTour.gallery, currentTour.title);
                    return;
                }
                filesToDataUrls(formFields.images.files).then(function (images) {
                    pendingGallery = images;
                    const title = formFields.title ? formFields.title.value : 'Tour';
                    renderGallery(formFields.imagePreview, pendingGallery, title);
                }).catch(function () {
                    showToast('Unable to load selected images.', 'danger');
                });
            });
        }

        if (editForm) {
            editForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', editForm);
                const id = formFields.requestId ? formFields.requestId.value : '';
                const tourId = formFields.tourId ? formFields.tourId.value : '';
                const card = qs('[data-request-id="' + id + '"]');
                if (!card || !tourId) {
                    return;
                }

                const tags = String(formFields.tags ? formFields.tags.value : '')
                    .split(',')
                    .map(function (tag) {
                        return tag.trim();
                    })
                    .filter(Boolean)
                    .slice(0, 6);
                if (!tags.length) {
                    showToast('Add at least one category/tag.', 'warning');
                    return;
                }

                const rating = Number(formFields.rating ? formFields.rating.value : 0);
                const reviews = Number(formFields.reviews ? formFields.reviews.value : 0);
                const price = Number(formFields.pricing ? formFields.pricing.value : 0);
                const currentTour = getTourById(tourId);
                const gallery = pendingGallery.length ? pendingGallery.slice(0, 4) : currentTour.gallery;
                const payload = {
                    location: String(formFields.destination ? formFields.destination.value : '').trim(),
                    title: String(formFields.title ? formFields.title.value : '').trim(),
                    rating: Math.min(Math.max(rating, 0), 5),
                    reviews: Math.max(Math.round(reviews), 0),
                    duration: String(formFields.duration ? formFields.duration.value : '').trim(),
                    durationHours: String(formFields.duration ? formFields.duration.value : '').trim(),
                    pax: String(formFields.pax ? formFields.pax.value : '').trim(),
                    difficulty: String(formFields.difficulty ? formFields.difficulty.value : '').trim() || 'Moderate',
                    tags: tags,
                    price: Math.max(Math.round(price), 1),
                    description: String(formFields.description ? formFields.description.value : '').trim(),
                    gallery: gallery,
                    image: gallery[0] || currentTour.image
                };

                setButtonLoading(button, true);
                fakeAjax({}, 900).then(function () {
                    updateTourOverride(tourId, payload);
                    const updatedTour = getTourById(tourId);
                    renderMyPostCard(card, updatedTour);
                    if (editModalInstance) {
                        editModalInstance.hide();
                    }
                    showToast('Tour post updated successfully.', 'success');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }
    }

    function initBookingsPage() {
        const tabButtons = qsa('.tab-btn');
        const grid = qs('.bookings-grid');
        const emptyState = qs('#bookingEmptyState');
        const reviewModal = qs('#reviewModal');
        const reviewForm = qs('#reviewForm');
        const bookingHistory = getBookingHistory();
        let activeTab = bookingHistory.length ? 'booked' : 'pending';
        let targetBookingId = null;
        let selectedStars = 0;

        function formatBookingDate(entry) {
            const raw = entry.date || entry.bookedAt;
            if (!raw) {
                return 'To be confirmed';
            }
            const dateObj = new Date(raw);
            if (Number.isNaN(dateObj.getTime())) {
                return raw;
            }
            return dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });
        }

        function injectHistoryBookings() {
            if (!grid || !bookingHistory.length) {
                return;
            }
            qsa('.booking-card[data-generated="true"]', grid).forEach(function (node) {
                node.remove();
            });

            bookingHistory.slice(0, 12).forEach(function (entry, index) {
                if (!entry || !entry.tourId) {
                    return;
                }
                const tour = getTourById(entry.tourId);
                const bookingId = entry.reference || ('history-' + index);
                const bookingToken = entry.bookingToken || ('history-token-' + index);
                const item = document.createElement('article');
                item.className = 'booking-card';
                item.dataset.state = 'booked';
                item.dataset.bookingId = bookingId;
                item.dataset.bookingToken = bookingToken;
                item.dataset.generated = 'true';
                item.innerHTML = [
                    '<img class="media" src="', tour.image, '" alt="', tour.title, '">',
                    '<div class="booking-body">',
                    '<h2 class="h6">', tour.title, '</h2>',
                    '<div class="d-flex align-items-center gap-2 mb-2">',
                    '<img src="', tour.guideAvatar, '" alt="Guide" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">',
                    '<small>Guide: ', tour.guide, '</small>',
                    '</div>',
                    '<p class="small text-muted mb-2">Booking Date: ', formatBookingDate(entry), '</p>',
                    '<p class="small mb-2">Amount: <strong>', formatPeso(entry.total || tour.price), '</strong></p>',
                    '<span class="status-pill">Booked</span>',
                    '<div class="d-grid mt-3">',
                    '<button class="btn-soft text-center" type="button" data-view-booking-token="', bookingToken, '">View Receipt</button>',
                    '</div>',
                    '</div>'
                ].join('');
                grid.prepend(item);
            });
        }

        function renderTab() {
            const cards = qsa('.booking-card[data-state]');
            let visible = 0;
            cards.forEach(function (card) {
                const show = card.dataset.state === activeTab;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.style.display = visible === 0 ? '' : 'none';
            }
        }

        tabButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeTab = button.dataset.tab;
                tabButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                renderTab();
            });
        });

        if (grid) {
            grid.addEventListener('click', function (event) {
                const cancelBtn = event.target.closest('[data-cancel-booking]');
                if (cancelBtn) {
                    const card = cancelBtn.closest('.booking-card');
                    if (card) {
                        card.remove();
                        showToast('Booking canceled.', 'warning');
                        renderTab();
                    }
                    return;
                }

                const rateBtn = event.target.closest('[data-rate-booking]');
                if (rateBtn && reviewModal) {
                    targetBookingId = rateBtn.dataset.rateBooking;
                    selectedStars = 0;
                    qsa('[data-review-star]').forEach(function (star) {
                        star.classList.remove('text-warning');
                    });
                    bootstrap.Modal.getOrCreateInstance(reviewModal).show();
                    return;
                }

                const viewBtn = event.target.closest('[data-view-booking-token]');
                if (viewBtn) {
                    const token = viewBtn.dataset.viewBookingToken;
                    const target = bookingHistory.find(function (entry) {
                        if (!entry) {
                            return false;
                        }
                        return (entry.bookingToken && entry.bookingToken === token)
                            || (entry.reference && entry.reference === token);
                    });
                    if (target) {
                        setBookingDraft(target);
                    }
                    window.location.href = 'booking-confirmation.html';
                }
            });
        }

        qsa('[data-review-star]').forEach(function (star) {
            star.addEventListener('click', function () {
                selectedStars = Number(star.dataset.reviewStar);
                qsa('[data-review-star]').forEach(function (item) {
                    const current = Number(item.dataset.reviewStar);
                    item.classList.toggle('text-warning', current <= selectedStars);
                });
            });
        });

        if (reviewForm) {
            reviewForm.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!selectedStars) {
                    showToast('Please select your rating first.', 'danger');
                    return;
                }
                const button = qs('button[type="submit"]', reviewForm);
                setButtonLoading(button, true);
                fakeAjax({}, 900).then(function () {
                    const card = qs('[data-booking-id="' + targetBookingId + '"]');
                    if (card) {
                        const ratingText = qs('[data-review-result]', card);
                        if (ratingText) {
                            ratingText.textContent = 'Rated ' + selectedStars + '/5';
                        }
                    }
                    bootstrap.Modal.getOrCreateInstance(reviewModal).hide();
                    showToast('Review submitted successfully.', 'success');
                }).finally(function () {
                    setButtonLoading(button, false);
                    reviewForm.reset();
                });
            });
        }

        injectHistoryBookings();
        tabButtons.forEach(function (item) {
            item.classList.toggle('active', item.dataset.tab === activeTab);
        });

        renderTab();
    }

    function renderTourCardForLikes(tour) {
        return [
            '<article class="tour-card">',
            '<div class="position-relative">',
            '<img src="', tour.image, '" alt="', tour.location, '" class="w-100" style="height:190px;object-fit:cover;">',
            '<div class="position-absolute top-0 start-0 m-3 rounded-pill bg-white px-2 py-1 small fw-semibold text-warning">', tour.badge, '</div>',
            '<button class="like-save" data-like-id="', tour.id, '"></button>',
            '</div>',
            '<div class="p-3 d-flex flex-column flex-grow-1">',
            '<p class="small text-muted mb-1">', tour.location, '</p>',
            '<h3 class="h5 mb-2">', tour.title, '</h3>',
            '<p class="mb-2 small">', tour.rating.toFixed(2), ' (', tour.reviews, ') • ', tour.duration, ' • ', tour.pax, '</p>',
            '<div class="tag-row mb-2">',
            tour.tags.map(function (tag) {
                return '<span class="soft-tag">' + tag + '</span>';
            }).join(''),
            '</div>',
            '<div class="mt-auto d-flex justify-content-between align-items-center border-top pt-2">',
            '<strong style="font-size:1.5rem;">PHP ', Number(tour.price).toLocaleString(), '</strong>',
            '<button class="btn-gold" data-quick-book="', tour.id, '">Quick Book</button>',
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initLikesPage() {
        const grid = qs('#likesGrid');
        if (!grid) {
            return;
        }
        const empty = qs('#likesEmpty');
        function render() {
            const likedTours = getLikes().map(function (id) {
                return getTourById(id);
            }).filter(Boolean);

            grid.innerHTML = '';
            if (!likedTours.length) {
                empty.style.display = '';
                updateSavedCounters();
                return;
            }

            empty.style.display = 'none';
            likedTours.forEach(function (tour) {
                const item = document.createElement('div');
                item.className = 'masonry-item';
                item.innerHTML = renderTourCardForLikes(tour);
                grid.appendChild(item);
            });
            bindLikeButtons(grid);
            updateSavedCounters();
        }

        grid.addEventListener('click', function (event) {
            const likeBtn = event.target.closest('[data-like-id]');
            if (likeBtn) {
                event.preventDefault();
                event.stopPropagation();
                toggleLike(likeBtn.dataset.likeId, likeBtn);
                render();
                showToast('Likes updated.', 'success');
                return;
            }

            const quickBook = event.target.closest('[data-quick-book]');
            if (quickBook) {
                window.location.href = 'booking-details.html?tour=' + encodeURIComponent(quickBook.dataset.quickBook);
            }
        });

        qsa('[data-page-link]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                qsa('[data-page-link]').forEach(function (item) {
                    item.classList.remove('active');
                });
                btn.classList.add('active');
            });
        });

        render();
    }

    function getBookingDraft() {
        return parseJSON(localStorage.getItem(BOOKING_DRAFT_KEY), null);
    }

    function setBookingDraft(value) {
        localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(value));
    }

    function getBookingHistory() {
        const history = parseJSON(localStorage.getItem(BOOKING_HISTORY_KEY), []);
        return Array.isArray(history) ? history : [];
    }

    function setBookingHistory(history) {
        const list = Array.isArray(history) ? history : [];
        localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
    }

    function getTourById(id) {
        const fallback = TOUR_CATALOG.bohol;
        const guideTours = getGuideToursCatalog();
        const picked = TOUR_CATALOG[id] || guideTours[id] || fallback;
        const overrides = getTourOverrides();
        const merged = normalizeTourData(picked, overrides[picked.id] || {});
        return Object.assign({
            provider: merged.provider || merged.guide,
            durationHours: merged.duration,
            languages: 'English, Filipino',
            meetingPoint: 'Tourist pickup point in city center',
            description: 'From serene natural landmarks to rich local culture, this curated experience is designed for comfort and unforgettable moments.',
            gallery: [merged.image, merged.image, merged.image, merged.image]
        }, merged);
    }

    function syncExploreCardsWithCatalog() {
        if (document.body.dataset.page !== 'explore') {
            return;
        }

        qsa('a[href^="tour-preview.html?tour="]').forEach(function (link) {
            const href = link.getAttribute('href') || '';
            const query = href.split('?')[1] || '';
            const params = new URLSearchParams(query);
            const tourId = params.get('tour');
            if (!tourId) {
                return;
            }
            const card = link.closest('article');
            if (!card) {
                return;
            }
            const tour = getTourById(tourId);
            const image = qs('img.h-48.w-full.object-cover', card);
            const location = qs('p.text-xs.text-stone-500', card);
            const title = qs('h3', card);
            const guide = qs('span.font-medium', card);
            const info = qs('p.mt-2.text-sm.text-stone-600', card);
            const price = qs('p.text-3xl.font-bold', card);
            const tagsWrap = qs('div.mt-3.flex.flex-wrap.gap-1\\.5.text-xs', card) || qs('div.mt-3.flex.flex-wrap.gap-1', card);

            if (image) {
                image.src = tour.image;
                image.alt = tour.title;
            }
            if (location) {
                location.textContent = tour.location;
            }
            if (title) {
                title.textContent = tour.title;
            }
            if (guide) {
                guide.textContent = tour.guide;
            }
            if (info) {
                info.textContent = tour.rating.toFixed(2) + ' (' + tour.reviews + ') • ' + tour.duration + ' • ' + tour.pax + ' • ' + tour.difficulty;
            }
            if (tagsWrap) {
                tagsWrap.innerHTML = tour.tags.map(function (tag) {
                    return '<span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">' + escapeHtml(tag) + '</span>';
                }).join('');
            }
            if (price) {
                price.innerHTML = '₱' + Number(tour.price).toLocaleString() + ' <span class="text-sm font-medium text-stone-500">/ person</span>';
            }
        });
    }

    function formatPeso(value) {
        return 'PHP ' + Number(value || 0).toLocaleString();
    }

    function calculateBookingTotal(tour, guests) {
        const count = Math.max(1, Number(guests || 1));
        const price = Math.max(1, Number(tour && tour.price ? tour.price : 0));
        if (String(tour && tour.priceType ? tour.priceType : '').toLowerCase() === 'per group') {
            return price;
        }
        return price * count;
    }

    function initTourPreviewPage() {
        if (document.body.dataset.view !== 'tour-preview') {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const tour = getTourById(params.get('tour'));
        const guestInput = qs('#previewGuests');
        const dateInput = qs('#previewDate');
        const timeInput = qs('#previewTime');
        const checkBtn = qs('#previewCheckAvailability');
        const bookNowBtn = qs('#previewBookNow');
        const likeBtn = qs('#previewLikeBtn');
        const manualApproval = String(tour.reservationType || '').toLowerCase() === 'manual approval';

        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
            dateInput.min = today;
        }

        const setText = function (selector, value) {
            const el = qs(selector);
            if (el) {
                el.textContent = value;
            }
        };

        const setHtml = function (selector, value) {
            const el = qs(selector);
            if (el) {
                el.innerHTML = value;
            }
        };

        setText('[data-tour-title]', tour.title);
        setText('[data-tour-rating]', tour.rating.toFixed(2));
        setText('[data-tour-reviews]', String(tour.reviews));
        setText('[data-tour-provider]', tour.provider);
        setText('[data-tour-description]', tour.description);
        setText('[data-tour-duration]', tour.durationHours);
        setText('[data-tour-language]', tour.languages);
        setText('[data-tour-meeting-point]', tour.meetingPoint);
        setText('[data-tour-price]', formatPeso(tour.price));
        setText('[data-tour-price-type]', String(tour.priceType || 'Per person').toLowerCase());
        setText('[data-tour-cancellation-text]', tour.cancellationText || 'Cancel up to 24 hours in advance for a full refund');
        setText('[data-tour-includes]', Array.isArray(tour.includes) ? tour.includes.join(', ') : 'Boat transfer, Entrance fees');
        setText('[data-tour-excludes]', tour.excludes || 'Not specified');
        setText('[data-tour-requirements]', tour.requirements || 'Follow guide reminders for a safe experience.');
        setText('[data-tour-safety]', tour.safetyInfo || 'Safety briefing is provided before the activity starts.');
        setText('[data-tour-guide-name]', tour.provider || tour.guide || 'Guide Name');
        setText('[data-tour-guide-experience]', String(tour.guideExperienceYears || 1));
        setText('[data-tour-guide-contact]', tour.guideContact || 'N/A');
        setText('[data-tour-guide-social]', tour.guideSocial || 'N/A');
        const guidePhoto = qs('[data-tour-guide-photo]');
        if (guidePhoto) {
            guidePhoto.src = tour.guidePhoto || tour.guideAvatar || 'images/manila.jpg';
        }
        const guideBadge = qs('[data-tour-guide-badge]');
        if (guideBadge) {
            guideBadge.style.display = tour.guideVerified ? '' : 'none';
        }
        const cancelRow = qs('[data-row-cancel]');
        if (cancelRow) {
            cancelRow.style.display = tour.freeCancellation ? '' : 'none';
        }
        const payLaterRow = qs('[data-row-pay-later]');
        if (payLaterRow) {
            payLaterRow.style.display = tour.reserveNowPayLater ? '' : 'none';
        }

        if (guestInput) {
            const minGuests = Math.max(1, Number(tour.minGuests || 1));
            const maxGuests = Math.max(minGuests, Number(tour.maxGuests || 10));
            const guestTypes = Array.isArray(tour.guestTypes) && tour.guestTypes.length ? tour.guestTypes : ['Adult'];
            const options = [];
            for (let i = minGuests; i <= maxGuests; i += 1) {
                const guestLabel = guestTypes.join('/');
                options.push('<option value="' + i + '">' + guestLabel + ' x ' + i + '</option>');
            }
            setHtml('#previewGuests', options.join(''));
        }

        if (timeInput) {
            const slots = Array.isArray(tour.timeSlots) && tour.timeSlots.length
                ? tour.timeSlots
                : ['08:00 AM', '01:00 PM', '05:00 PM'];
            setHtml('#previewTime', slots.map(function (slot) {
                return '<option value="' + escapeHtml(slot) + '">' + escapeHtml(slot) + '</option>';
            }).join(''));
        }

        qsa('[data-tour-image]').forEach(function (img, index) {
            img.src = tour.gallery[index] || tour.image;
            img.alt = tour.title;
        });

        if (likeBtn) {
            likeBtn.dataset.likeId = tour.id;
            bindLikeButtons();
        }

        if (bookNowBtn) {
            bookNowBtn.textContent = manualApproval ? 'Request Booking' : 'Book Now';
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', function () {
                if (!dateInput || !dateInput.value) {
                    showToast('Please select a date first.', 'warning');
                    return;
                }
                const guests = Number(guestInput ? guestInput.value : 1) || 1;
                const draft = {
                    tourId: tour.id,
                    guests: guests,
                    date: dateInput.value,
                    time: timeInput ? timeInput.value : '09:00 AM',
                    total: calculateBookingTotal(tour, guests)
                };
                setBookingDraft(draft);
                window.location.href = 'booking-details.html?tour=' + encodeURIComponent(tour.id);
            });
        }

        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', function () {
                const guests = Number(guestInput ? guestInput.value : 1) || 1;
                const selectedDate = dateInput && dateInput.value ? dateInput.value : today;
                const draft = {
                    tourId: tour.id,
                    guests: guests,
                    date: selectedDate,
                    time: timeInput ? timeInput.value : '09:00 AM',
                    total: calculateBookingTotal(tour, guests)
                };
                setBookingDraft(draft);
                window.location.href = 'payment-method.html?tour=' + encodeURIComponent(tour.id);
            });
        }
    }

    function initBookingDetailsPage() {
        if (document.body.dataset.view !== 'booking-details') {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const tour = getTourById(params.get('tour'));
        const stored = getBookingDraft() || {};
        const guestInput = qs('#bookingGuests');
        const dateInput = qs('#bookingDate');
        const subtotalEl = qs('#bookingSubtotal');
        const totalEl = qs('#bookingTotal');
        const form = qs('#bookingDetailsForm');
        const today = new Date().toISOString().split('T')[0];

        setBookingDraft(Object.assign({}, stored, { tourId: tour.id }));
        qs('[data-booking-tour-title]').textContent = tour.title;
        qs('[data-booking-tour-location]').textContent = tour.location;
        qs('[data-booking-tour-price]').textContent = formatPeso(tour.price);
        if (guestInput) {
            guestInput.value = String(stored.guests || 1);
        }
        if (dateInput) {
            dateInput.min = today;
            dateInput.value = stored.date || today;
        }

        const syncTotals = function () {
            const guests = Number(guestInput ? guestInput.value : 1) || 1;
            const subtotal = calculateBookingTotal(tour, guests);
            if (subtotalEl) {
                subtotalEl.textContent = formatPeso(subtotal);
            }
            if (totalEl) {
                totalEl.textContent = formatPeso(subtotal);
            }
        };

        if (guestInput) {
            guestInput.addEventListener('input', syncTotals);
        }
        syncTotals();

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', form);
                setButtonLoading(button, true);
                fakeAjax({}, 700).then(function () {
                    const draft = getBookingDraft() || {};
                    const payload = Object.assign({}, draft, {
                        tourId: tour.id,
                        guests: Number(guestInput ? guestInput.value : 1) || 1,
                        date: dateInput ? dateInput.value : '',
                        time: qs('#bookingTime') ? qs('#bookingTime').value : '',
                        traveler: {
                            fullName: qs('#travelerFullName').value,
                            email: qs('#travelerEmail').value,
                            phone: qs('#travelerPhone').value,
                            emergency: qs('#travelerEmergency').value,
                            notes: qs('#travelerNotes').value
                        },
                        total: calculateBookingTotal(tour, Number(guestInput ? guestInput.value : 1) || 1)
                    });
                    setBookingDraft(payload);
                    window.location.href = 'payment-method.html?tour=' + encodeURIComponent(tour.id);
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }
    }

    function initPaymentMethodPage() {
        if (document.body.dataset.view !== 'payment-method') {
            return;
        }
        const draft = getBookingDraft();
        if (!draft || !draft.tourId || !draft.date || !draft.guests) {
            window.location.href = 'explore.html';
            return;
        }
        const tour = getTourById(draft.tourId);
        const options = qsa('[data-payment-option]');
        const continueBtn = qs('#continueToProcessing');
        const methodLabel = qs('#selectedMethodLabel');
        let selected = draft.paymentMethod || '';

        qs('[data-payment-tour]').textContent = tour.title;
        qs('[data-payment-total]').textContent = formatPeso(draft.total || calculateBookingTotal(tour, draft.guests || 1));

        const renderSelection = function () {
            options.forEach(function (option) {
                option.classList.toggle('active', option.dataset.paymentOption === selected);
            });
            if (methodLabel) {
                methodLabel.textContent = selected || 'Select a payment method';
            }
        };

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                selected = option.dataset.paymentOption;
                renderSelection();
            });
        });

        if (continueBtn) {
            continueBtn.addEventListener('click', function () {
                if (!selected) {
                    showToast('Please select a payment method.', 'warning');
                    return;
                }
                continueBtn.disabled = true;
                const bookingToken = draft.bookingToken || ('bk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7));
                setBookingDraft(Object.assign({}, draft, {
                    paymentMethod: selected,
                    bookingToken: bookingToken,
                    paymentStatus: 'pending'
                }));
                window.location.href = 'payment-processing.html';
            });
        }

        renderSelection();
    }

    function initPaymentProcessingPage() {
        if (document.body.dataset.view !== 'payment-processing') {
            return;
        }
        const draft = getBookingDraft() || {};
        if (!draft.tourId || !draft.date || !draft.guests || !draft.paymentMethod) {
            window.location.href = 'payment-method.html';
            return;
        }
        if (draft.reference && draft.paymentStatus === 'paid') {
            window.location.href = 'booking-confirmation.html';
            return;
        }

        const existingHistory = getBookingHistory();
        const existingBooking = existingHistory.find(function (entry) {
            return entry.bookingToken && draft.bookingToken && entry.bookingToken === draft.bookingToken;
        });
        if (existingBooking) {
            setBookingDraft(existingBooking);
            window.location.href = 'booking-confirmation.html';
            return;
        }

        localStorage.setItem(BOOKING_PROCESSING_LOCK_KEY, JSON.stringify({
            token: draft.bookingToken || '',
            startedAt: Date.now()
        }));

        const progressBar = qs('#processingProgress');
        const statusLabel = qs('#processingStatus');
        const retryBtn = qs('#processingRetry');
        const params = new URLSearchParams(window.location.search);
        const shouldFail = params.get('status') === 'fail';
        let progress = 8;
        let running = true;

        const timer = setInterval(function () {
            if (!running) {
                clearInterval(timer);
                return;
            }
            progress = Math.min(progress + 14, 100);
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.setAttribute('aria-valuenow', String(progress));
            }
            if (statusLabel) {
                statusLabel.textContent = 'Processing your payment... ' + progress + '%';
            }
            if (shouldFail && progress >= 68) {
                running = false;
                setBookingDraft(Object.assign({}, draft, { paymentStatus: 'failed' }));
                localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                if (statusLabel) {
                    statusLabel.textContent = 'Payment failed. Please retry your payment.';
                    statusLabel.classList.add('text-danger');
                }
                if (retryBtn) {
                    retryBtn.textContent = 'Back to Payment Methods';
                }
                return;
            }
            if (progress >= 100) {
                running = false;
                const latestDraft = getBookingDraft() || draft;
                const reference = 'TRBL-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
                const complete = Object.assign({}, latestDraft, {
                    reference: reference,
                    bookedAt: new Date().toISOString(),
                    paymentStatus: 'paid'
                });
                setBookingDraft(complete);
                const history = getBookingHistory();
                const duplicate = history.find(function (entry) {
                    return entry.bookingToken && complete.bookingToken && entry.bookingToken === complete.bookingToken;
                });
                if (!duplicate) {
                    history.unshift(complete);
                }
                setBookingHistory(history);
                localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                setTimeout(function () {
                    window.location.href = 'booking-confirmation.html';
                }, 700);
            }
        }, 420);

        if (retryBtn) {
            retryBtn.addEventListener('click', function () {
                if (!running && shouldFail) {
                    localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                    window.location.href = 'payment-method.html';
                    return;
                }
                if (!running) {
                    localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                    window.location.reload();
                }
            });
        }
    }

    function initBookingConfirmationPage() {
        if (document.body.dataset.view !== 'booking-confirmation') {
            return;
        }
        const draft = getBookingDraft();
        if (!draft || !draft.tourId) {
            window.location.href = 'explore.html';
            return;
        }
        const tour = getTourById(draft.tourId);
        const reference = draft.reference || 'TRBL-PENDING';

        qs('[data-confirm-ref]').textContent = reference;
        qs('[data-confirm-tour]').textContent = tour.title;
        if (qs('[data-confirm-location]')) {
            qs('[data-confirm-location]').textContent = tour.location;
        }
        qs('[data-confirm-date]').textContent = draft.date || 'To be confirmed';
        if (qs('[data-confirm-time]')) {
            qs('[data-confirm-time]').textContent = draft.time || '09:00 AM';
        }
        qs('[data-confirm-guests]').textContent = String(draft.guests || 1);
        qs('[data-confirm-total]').textContent = formatPeso(draft.total || calculateBookingTotal(tour, draft.guests || 1));
        qs('[data-confirm-method]').textContent = draft.paymentMethod || 'N/A';
        const qr = qs('#bookingQrCode');
        if (qr) {
            qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(reference);
        }

        const receiptBtn = qs('#downloadReceiptBtn');
        if (receiptBtn) {
            receiptBtn.addEventListener('click', function () {
                const receiptLines = [
                    'Tribaltours Booking Receipt',
                    '-------------------------',
                    'Reference: ' + reference,
                    'Tour: ' + tour.title,
                    'Location: ' + tour.location,
                    'Date: ' + (draft.date || 'To be confirmed'),
                    'Guests: ' + String(draft.guests || 1),
                    'Payment Method: ' + (draft.paymentMethod || 'N/A'),
                    'Total Paid: ' + formatPeso(draft.total || calculateBookingTotal(tour, draft.guests || 1)),
                    'Booked At: ' + (draft.bookedAt || new Date().toISOString())
                ].join('\n');
                const blob = new Blob([receiptLines], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = reference + '-receipt.txt';
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
            });
        }
    }

    function initMessagesPage() {
        const list = qs('#conversationList');
        const chatTitle = qs('#chatTitle');
        const chatMessages = qs('#chatMessages');
        const chatInput = qs('#chatInput');
        const chatForm = qs('#chatForm');
        const typing = qs('#typingIndicator');
        const emojiToggle = qs('#emojiToggle');
        const emojiPanel = qs('#emojiPanel');
        const params = new URLSearchParams(window.location.search);
        const convoFromRoute = params.get('conversation');

        if (!list) {
            return;
        }

        const conversations = [
            {
                id: 'maria',
                name: 'Maria Santos',
                avatar: TOUR_CATALOG.elnido.guideAvatar,
                last: 'Can we move the island hopping to Saturday?',
                time: '09:22',
                unread: 2,
                messages: [
                    { mine: false, text: 'Hello! I can prepare your El Nido itinerary.' },
                    { mine: true, text: 'Great, can we include Big Lagoon?' },
                    { mine: false, text: 'Yes, absolutely. I can include that in Package B.' }
                ]
            },
            {
                id: 'roberto',
                name: 'Roberto Lim',
                avatar: TOUR_CATALOG.mtapo.guideAvatar,
                last: 'Weather update for Mt. Apo route sent.',
                time: 'Yesterday',
                unread: 1,
                messages: [
                    { mine: false, text: 'Please bring a rain jacket. Trail may be wet.' },
                    { mine: true, text: 'Noted. Thanks for the reminder.' }
                ]
            },
            {
                id: 'domingo',
                name: 'Domingo Abad',
                avatar: TOUR_CATALOG.batanes.guideAvatar,
                last: 'Happy to host your Batanes culture trip!',
                time: 'Tue',
                unread: 0,
                messages: [
                    { mine: false, text: 'Welcome! I can customize this for photography.' }
                ]
            }
        ];

        let active = conversations.find(function (conversation) {
            return conversation.id === convoFromRoute;
        }) || conversations[0];
        if (active) {
            active.unread = 0;
        }

        function renderList() {
            list.innerHTML = '';
            conversations.forEach(function (conversation) {
                const row = document.createElement('div');
                row.className = 'conversation-item' + (conversation.id === active.id ? ' active' : '');
                row.dataset.id = conversation.id;
                row.innerHTML = [
                    '<img class="conversation-avatar" src="', conversation.avatar, '" alt="', conversation.name, '">',
                    '<div class="flex-grow-1">',
                    '<div class="d-flex justify-content-between"><strong>', conversation.name, '</strong><small class="text-muted">', conversation.time, '</small></div>',
                    '<div class="small text-muted text-truncate" style="max-width:180px;">', conversation.last, '</div>',
                    '</div>',
                    conversation.unread > 0 ? '<span class="badge rounded-pill text-bg-warning">' + conversation.unread + '</span>' : ''
                ].join('');
                list.appendChild(row);
            });
        }

        function renderConversation() {
            chatTitle.textContent = active.name;
            chatMessages.innerHTML = '';
            active.messages.forEach(function (message) {
                const row = document.createElement('div');
                row.className = 'msg-row' + (message.mine ? ' mine' : '');
                row.innerHTML = '<div class="msg-bubble">' + message.text + '</div>';
                chatMessages.appendChild(row);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        list.addEventListener('click', function (event) {
            const row = event.target.closest('.conversation-item');
            if (!row) {
                return;
            }
            const found = conversations.find(function (conversation) {
                return conversation.id === row.dataset.id;
            });
            if (!found) {
                return;
            }
            active = found;
            active.unread = 0;
            renderList();
            renderConversation();
        });

        chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const text = chatInput.value.trim();
            if (!text) {
                return;
            }
            active.messages.push({ mine: true, text: text });
            active.last = text;
            active.time = 'now';
            chatInput.value = '';
            renderConversation();
            renderList();

            typing.style.display = 'block';
            setTimeout(function () {
                typing.style.display = 'none';
                const reply = 'Sounds good. I will adjust the plan and send details.';
                active.messages.push({ mine: false, text: reply });
                active.last = reply;
                active.unread = 0;
                renderConversation();
                renderList();
            }, 1200);
        });

        emojiToggle.addEventListener('click', function () {
            emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
        });

        emojiPanel.addEventListener('click', function (event) {
            const button = event.target.closest('[data-emoji]');
            if (!button) {
                return;
            }
            chatInput.value += button.dataset.emoji;
            chatInput.focus();
        });

        document.addEventListener('click', function (event) {
            if (!emojiPanel.contains(event.target) && event.target !== emojiToggle) {
                emojiPanel.style.display = 'none';
            }
        });

        renderList();
        renderConversation();
    }

    function initProfilePage() {
        const avatarInput = qs('#avatarInput');
        const avatarPreview = qs('#avatarPreview');
        const profileForm = qs('#profileForm');
        const passwordForm = qs('#passwordForm');
        const prefsForm = qs('#prefsForm');
        const params = new URLSearchParams(window.location.search);
        const sectionFromRoute = params.get('section');

        if (avatarInput && avatarPreview) {
            avatarInput.addEventListener('change', function () {
                const file = avatarInput.files && avatarInput.files[0];
                if (!file) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = function () {
                    avatarPreview.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        [profileForm, passwordForm, prefsForm].forEach(function (form) {
            if (!form) {
                return;
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', form);
                setButtonLoading(button, true);
                fakeAjax({}, 900).then(function () {
                    showToast('Profile updated successfully.', 'success');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        });

        if (sectionFromRoute === 'preferences' && prefsForm) {
            setTimeout(function () {
                prefsForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }
    }

    function initSettingsPage() {
        const form = qs('#settingsForm');
        const deleteBtn = qs('#deleteAccountBtn');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', form);
                setButtonLoading(button, true);
                fakeAjax({}, 900).then(function () {
                    showToast('Settings saved.', 'success');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                showToast('Delete account simulation only.', 'warning');
            });
        }
    }

    function initLoginPage() {
        const loginForm = qs('#loginForm');
        if (!loginForm) {
            return;
        }

        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const button = qs('button[type="submit"]', loginForm);
            setButtonLoading(button, true);
            fakeAjax({}, 750).then(function () {
                localStorage.setItem(ROLE_KEY, 'tourist');
                const params = new URLSearchParams(window.location.search);
                const next = params.get('next') || 'explore.html';
                showToast('Signed in as tourist.', 'success');
                setTimeout(function () {
                    window.location.href = next;
                }, 600);
            }).finally(function () {
                setButtonLoading(button, false);
            });
        });
    }

    function initGlobalActions() {
        const logout = qs('#logoutBtn');
        if (logout) {
            logout.addEventListener('click', function () {
                localStorage.removeItem(ROLE_KEY);
                showToast('Session reset. Returning to Explore Tours.', 'warning');
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 500);
            });
        }

        document.addEventListener('click', function (event) {
            if (event.defaultPrevented) {
                return;
            }
            const likeBtn = event.target.closest('.like-save[data-like-id]');
            if (!likeBtn) {
                return;
            }
            const liked = toggleLike(likeBtn.dataset.likeId, likeBtn);
            showToast(liked ? 'Tour saved to likes.' : 'Tour removed from likes.', 'success');
        });

        qsa('[data-go-explore]').forEach(function (button) {
            button.addEventListener('click', function () {
                window.location.href = 'explore.html';
            });
        });
    }

    function init() {
        if (document.body.dataset.page === 'login') {
            window.location.href = 'index.html';
            return;
        }

        if (!touristGuard()) {
            return;
        }

        initSidebar();
        initTopbarScroll();
        initTopbarNotifications();
        setActiveNavigation();
        applyRoleVisibility();
        renderNotifications();
        bindLikeButtons();
        updateSavedCounters();
        initGlobalActions();

        const page = document.body.dataset.page;
        if (page === 'explore') {
            initExplorePage();
        }
        if (page === 'my-posts') {
            initMyPostsPage();
        }
        if (page === 'my-bookings') {
            initBookingsPage();
        }
        if (page === 'likes') {
            initLikesPage();
        }
        if (page === 'messages') {
            initMessagesPage();
        }
        if (page === 'profile') {
            initProfilePage();
        }
        if (page === 'settings') {
            initSettingsPage();
        }

        initTourPreviewPage();
        initBookingDetailsPage();
        initPaymentMethodPage();
        initPaymentProcessingPage();
        initBookingConfirmationPage();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
