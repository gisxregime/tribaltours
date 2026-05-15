(function () {
    const ROLE_KEY = 'role';
    const LIKES_KEY = 'tribaltours_likes';
    const NOTIFICATIONS_KEY = 'tribaltours_notifications';
    const ACTIVE_PAGE_KEY = 'tribaltours_active_page';
    const BOOKING_DRAFT_KEY = 'tribaltours_booking_draft';
    const BOOKING_HISTORY_KEY = 'tribaltours_booking_history';
    const TOUR_OVERRIDES_KEY = 'tribaltours_tour_overrides';
    const ACCOUNT_CACHE_KEY = 'tribaltours_account_cache_v1';
    const GUIDE_TOURS_KEY = 'tribaltours_guide_tours_v1';
    const BOOKING_PROCESSING_LOCK_KEY = 'tribaltours_booking_processing_lock';
    const TOURIST_REQUESTS_KEY = 'tribaltours_tourist_requests_v1';
    const GUIDE_NOTIFICATIONS_KEY = 'tribaltours_guide_notifications_v1';
    const GUIDE_CONVERSATIONS_KEY = 'tribaltours_guide_conversations_v1';
    const GUIDE_STARTER_MESSAGE = 'You have been selected as the tour guide. Start discussing plans and arrangements.';
    const PENDING_NOTIFICATION_DELETE_DELAY = 4200;
    const REQUEST_DEFAULT_REGION = 'Davao del Norte';

    const pendingNotificationDeletes = Object.create(null);

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

        const legacyModal = qs('#topNotificationModal');
        if (legacyModal) {
            legacyModal.remove();
        }

        if (!qs('#topNotificationDropdown', topbarRight)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'dropdown notification-dropdown';
            wrapper.id = 'topNotificationDropdown';
            wrapper.innerHTML = [
                '<button type="button" id="topNotificationBtn" class="icon-btn" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" aria-label="Open notifications">',
                '<i class="fa-solid fa-bell"></i><span id="topNotificationBadge" class="unread-badge">0</span>',
                '</button>',
                '<div class="dropdown-menu dropdown-menu-end notification-dropdown-menu" id="topNotificationMenu">',
                '<div class="notification-dropdown-header">',
                '<strong>Notifications</strong>',
                '<div class="notification-dropdown-actions">',
                '<button id="topMarkAllRead" class="btn-soft py-1 px-2" type="button">Mark all read</button>',
                '</div>',
                '</div>',
                '<div id="topNotificationList" class="notification-dropdown-list"></div>',
                '<div class="notification-dropdown-footer">',
                '<button id="topClearAllNotifications" class="btn-soft py-1 px-2" type="button">Clear all notifications</button>',
                '</div>',
                '</div>'
            ].join('');
            topbarRight.prepend(wrapper);
        }

        const markAll = qs('#topMarkAllRead');
        if (markAll && !markAll.dataset.boundClick) {
            markAll.addEventListener('click', function () {
                markAllNotificationsRead().then(function () {
                    return syncNotificationsFromApi();
                }).catch(function () {
                    const updated = getNotifications().map(function (item) {
                        return Object.assign({}, item, { read: true });
                    });
                    setNotifications(updated);
                    renderNotifications();
                });
            });
            markAll.dataset.boundClick = 'true';
        }

        const clearAll = qs('#topClearAllNotifications');
        if (clearAll && !clearAll.dataset.boundClick) {
            clearAll.addEventListener('click', function () {
                const current = getNotifications();
                if (!current.length) {
                    showToast('No notifications to clear.', 'secondary');
                    return;
                }

                setNotifications([]);
                renderNotifications();
                closeDropdownByButtonId('topNotificationBtn');
                clearAllNotifications().catch(function () {
                    setNotifications(current);
                    renderNotifications();
                    showToast('Unable to clear notifications right now.', 'danger');
                });
            });
            clearAll.dataset.boundClick = 'true';
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
            guidePhoto: String(merged.guideAvatar || merged.guidePhoto || (baseTour && baseTour.guidePhoto) || ''),
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

    function upsertGuideTourCatalogEntries(entries) {
        if (!Array.isArray(entries) || !entries.length) {
            return;
        }

        const existing = parseJSON(localStorage.getItem(GUIDE_TOURS_KEY), []);
        const list = Array.isArray(existing) ? existing.slice() : [];

        entries.forEach(function (entry) {
            if (!entry || typeof entry !== 'object' || !entry.id) {
                return;
            }
            const id = String(entry.id);
            const normalized = Object.assign({}, entry, { id: id });
            const index = list.findIndex(function (item) {
                return item && String(item.id) === id;
            });
            if (index >= 0) {
                list[index] = Object.assign({}, list[index], normalized);
            } else {
                list.unshift(normalized);
            }
        });

        localStorage.setItem(GUIDE_TOURS_KEY, JSON.stringify(list.slice(0, 250)));
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
                guidePhoto: normalizeTourAssetPath(item.guideAvatar || item.guidePhoto || 'images/manila.jpg'),
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

    function syncGuideTourCatalogFromApi() {
        return apiRequest('/tourist/tours/feed').then(function (data) {
            const tours = data && Array.isArray(data.tours) ? data.tours : [];
            upsertGuideTourCatalogEntries(tours.map(function (tour) {
                return Object.assign({}, tour, {
                    id: String(tour.id || ''),
                });
            }));
            return tours;
        }).catch(function () {
            return [];
        });
    }

    function dispatchGuideProfileUpdatedEvent(payload) {
        const guide = payload && payload.guide ? payload.guide : null;
        window.dispatchEvent(new CustomEvent('trbl:guide-profile-updated', {
            detail: guide,
        }));
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
            const rawId = item && item.id != null ? String(item.id) : '';
            const fallback = NOTIFICATION_TEMPLATE_BY_ID[rawId] || DEFAULT_NOTIFICATIONS[index] || DEFAULT_NOTIFICATIONS[0];
            return Object.assign({}, fallback, item, {
                id: String((item && item.id != null) ? item.id : fallback.id),
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

    function normalizeApiNotification(item) {
        const payload = item && typeof item === 'object' ? item : {};
        return {
            id: String(payload.id || 'notif-' + Date.now()),
            type: String(payload.type || 'general'),
            text: String(payload.text || 'New notification.'),
            fullText: String(payload.fullText || payload.text || 'New notification.'),
            actorName: String(payload.actorName || ''),
            actorAvatar: String(payload.actorAvatar || ''),
            actionText: String(payload.actionText || ''),
            targetTitle: String(payload.targetTitle || ''),
            time: String(payload.time || 'just now'),
            read: Boolean(payload.read),
            payload: payload.payload && typeof payload.payload === 'object' ? payload.payload : {},
            createdAt: String(payload.createdAt || new Date().toISOString())
        };
    }

    function syncNotificationsFromApi() {
        return apiRequest('/notifications').then(function (data) {
            if (data && data.pusher && !window.TRBL_PUSHER) {
                window.TRBL_PUSHER = data.pusher;
            }

            if (!data || !Array.isArray(data.items)) {
                return [];
            }

            const normalized = data.items.map(normalizeApiNotification);
            setNotifications(normalized);
            renderNotifications();
            return normalized;
        }).catch(function () {
            return [];
        });
    }

    function markNotificationRead(notificationId) {
        if (!notificationId) {
            return Promise.resolve(null);
        }

        return apiRequest('/notifications/' + encodeURIComponent(String(notificationId)) + '/read', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
    }

    function markAllNotificationsRead() {
        return apiRequest('/notifications/mark-all-read', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
    }

    function deleteNotification(notificationId) {
        if (!notificationId) {
            return Promise.resolve(null);
        }

        return apiRequest('/notifications/' + encodeURIComponent(String(notificationId)), {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
    }

    function clearAllNotifications() {
        return apiRequest('/notifications/clear-all', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
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
            touristId: payload.touristId ? String(payload.touristId) : null,
            touristName: String(payload.touristName || 'Tourist').trim(),
            touristAvatar: normalizeGuideAssetPath(payload.touristAvatar || 'images/manila.jpg'),
            title: String(payload.title || 'Tourist request').trim(),
            description: String(payload.description || '').trim(),
            location: String(payload.location || 'Philippines').trim(),
            budgetMin: Math.max(0, Number(payload.budgetMin || 0)),
            budgetMax: Math.max(0, Number(payload.budgetMax || 0)),
            duration: String(payload.duration || payload.duration_label || 'Flexible').trim(),
            travelers: String(payload.travelers || payload.travelers_label || '1 traveler').trim(),
            interests: Array.isArray(payload.interests) ? payload.interests : [],
            status: String(payload.status || 'open').trim().toLowerCase() || 'open',
            isActive: payload.isActive !== false,
            selectedGuideId: payload.selectedGuideId ? String(payload.selectedGuideId) : null,
            comments: Array.isArray(payload.comments) ? payload.comments : [],
            createdAt: String(payload.createdAt || new Date().toISOString())
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
        if (item.type === 'message.received') {
            const conversationId = payload.conversationId || '';
            return '/messages' + (conversationId ? '?conversation=' + encodeURIComponent(conversationId) : '');
        }
        if (
            item.type === 'booking.created'
            || item.type === 'booking.updated'
            || item.type === 'booking.submitted'
            || item.type === 'booking.accepted'
            || item.type === 'booking.rejected'
            || item.type === 'booking.cancelled'
            || item.type === 'booking.completed'
            || item.type === 'payment.successful'
        ) {
            return '/my-bookings';
        }
        if (item.type === 'tour-request.updated') {
            return '/my-posts' + (payload.requestId ? '?request=' + encodeURIComponent(payload.requestId) : '');
        }
        if (item.type === 'tour-listing.created' || item.type === 'tour-listing.updated') {
            return '/explore' + (payload.tourId ? '?tour=' + encodeURIComponent(payload.tourId) : '');
        }
        if (item.type === 'tour-listing.deleted') {
            return '/explore';
        }
        if (item.type === 'message') {
            const conversationId = payload.conversationId || 'maria';
            return '/messages?conversation=' + encodeURIComponent(conversationId);
        }
        if (item.type === 'booking-confirmation') {
            const tourId = payload.tourId || 'bohol';
            return '/booking/details?tour=' + encodeURIComponent(tourId);
        }
        if (item.type === 'offer') {
            const requestId = payload.requestId || 'tagum-1';
            return '/my-posts?request=' + encodeURIComponent(requestId) + '&openThread=1';
        }
        if (item.type === 'price-alert') {
            const tourId = payload.tourId || 'bohol';
            return '/tour-preview?tour=' + encodeURIComponent(tourId);
        }
        if (item.type === 'profile-update') {
            const section = payload.section || 'preferences';
            return '/profile?section=' + encodeURIComponent(section);
        }
        return '';
    }

    function renderNotifications() {
        const list = getNotifications();
        const sidebarContainer = qs('#notificationList');
        const topbarContainer = qs('#topNotificationList');
        const sidebarBadge = qs('#notificationBadge');
        const topbarBadge = qs('#topNotificationBadge');
        if (!sidebarContainer && !topbarContainer && !sidebarBadge && !topbarBadge) {
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

        function buildNotificationText(item) {
            const actorName = String(item.actorName || '').trim();
            const actionText = String(item.actionText || '').trim();
            const targetTitle = String(item.targetTitle || '').trim();
            const fallback = String(item.fullText || item.text || 'New notification.').trim();

            if (fallback) {
                return fallback;
            }

            const parts = [];
            if (actorName && actorName !== 'System') {
                parts.push(actorName);
            }
            if (actionText) {
                parts.push(actionText);
            }
            let label = parts.join(' ').trim();
            if (targetTitle) {
                label = (label ? label + ' ' : '') + '"' + targetTitle + '"';
            }
            return label || 'New notification.';
        }

        function resolveAvatar(item) {
            const payload = item.payload && typeof item.payload === 'object' ? item.payload : {};
            const source = item.actorAvatar || payload.actorAvatar || payload.senderAvatar || payload.avatar || 'images/manila.jpg';
            return normalizeTourAssetPath(source);
        }

        function renderList(container) {
            if (!container) {
                return;
            }
            container.innerHTML = '';
            if (!list.length) {
                container.innerHTML = '<p class="small text-muted mb-0 px-2 py-2">No notifications yet.</p>';
                return;
            }

            list.forEach(function (item) {
                const id = String(item.id || '');
                const actorName = String(item.actorName || 'System').trim() || 'System';
                const row = document.createElement('div');
                row.className = 'notification-entry' + (item.read ? '' : ' unread');
                row.dataset.notificationId = id;
                row.innerHTML = [
                    '<span class="notification-entry__dot"', (item.read ? ' hidden' : ''), '></span>',
                    '<img class="notification-entry__avatar" src="', escapeHtml(resolveAvatar(item)), '" alt="', escapeHtml(actorName), ' avatar">',
                    '<button type="button" class="notification-entry__main" data-notification-open="', escapeHtml(id), '">',
                    '<span class="notification-entry__text">', escapeHtml(buildNotificationText(item)), '</span>',
                    '<small class="notification-entry__time">', escapeHtml(item.time || 'just now'), '</small>',
                    '</button>',
                    '<button type="button" class="notification-entry__delete" data-notification-delete="', escapeHtml(id), '" aria-label="Delete notification">',
                    '<i class="fa-solid fa-xmark"></i>',
                    '</button>'
                ].join('');
                container.appendChild(row);
            });
        }

        function bindListClick(container) {
            if (!container || container.dataset.boundClick) {
                return;
            }
            container.addEventListener('click', function (event) {
                const deleteTarget = event.target.closest('[data-notification-delete]');
                if (deleteTarget) {
                    const deleteId = String(deleteTarget.getAttribute('data-notification-delete') || '');
                    if (!deleteId || pendingNotificationDeletes[deleteId]) {
                        return;
                    }

                    const currentList = getNotifications();
                    const deleteIndex = currentList.findIndex(function (item) {
                        return String(item.id) === deleteId;
                    });
                    if (deleteIndex < 0) {
                        return;
                    }

                    const removedItem = currentList[deleteIndex];
                    const nextList = currentList.filter(function (item) {
                        return String(item.id) !== deleteId;
                    });
                    setNotifications(nextList);
                    renderNotifications();

                    const timer = window.setTimeout(function () {
                        deleteNotification(deleteId).catch(function () {
                            const restored = getNotifications();
                            const insertAt = Math.min(deleteIndex, restored.length);
                            restored.splice(insertAt, 0, removedItem);
                            setNotifications(restored);
                            renderNotifications();
                            showToast('Unable to delete notification right now.', 'danger');
                        }).finally(function () {
                            delete pendingNotificationDeletes[deleteId];
                        });
                    }, PENDING_NOTIFICATION_DELETE_DELAY);

                    pendingNotificationDeletes[deleteId] = {
                        item: removedItem,
                        index: deleteIndex,
                        timerId: timer,
                    };

                    showActionToast('Notification removed.', 'Undo', function () {
                        const pending = pendingNotificationDeletes[deleteId];
                        if (!pending) {
                            return;
                        }
                        window.clearTimeout(pending.timerId);
                        const restored = getNotifications();
                        const insertAt = Math.min(pending.index, restored.length);
                        restored.splice(insertAt, 0, pending.item);
                        setNotifications(restored);
                        renderNotifications();
                        delete pendingNotificationDeletes[deleteId];
                    }, 'dark', 4200);
                    return;
                }

                const target = event.target.closest('[data-notification-open]');
                if (!target) {
                    return;
                }
                const id = String(target.getAttribute('data-notification-open') || '');
                const currentList = getNotifications();
                const selectedItem = currentList.find(function (item) {
                    return String(item.id) === id;
                });
                const updated = currentList.map(function (item) {
                    if (String(item.id) === id) {
                        return Object.assign({}, item, { read: true });
                    }
                    return item;
                });
                setNotifications(updated);
                renderNotifications();
                markNotificationRead(id).catch(function () {
                    return null;
                });
                closeDropdownByButtonId('topNotificationBtn');
                const route = getNotificationRoute(selectedItem);
                if (route) {
                    window.location.href = route;
                }
            });
            container.dataset.boundClick = 'true';
        }

        renderList(sidebarContainer);
        renderList(topbarContainer);
        bindListClick(sidebarContainer);
        bindListClick(topbarContainer);
    }

    function closeDropdownByButtonId(buttonId) {
        const trigger = qs('#' + String(buttonId || ''));
        if (!trigger || !window.bootstrap || !window.bootstrap.Dropdown) {
            return;
        }

        const instance = window.bootstrap.Dropdown.getInstance(trigger) || window.bootstrap.Dropdown.getOrCreateInstance(trigger);
        instance.hide();
    }

    function getLikes() {
        const likes = parseJSON(localStorage.getItem(LIKES_KEY), []);
        return Array.isArray(likes) ? likes : [];
    }

    function getCachedAccountData() {
        const data = parseJSON(localStorage.getItem(ACCOUNT_CACHE_KEY), null);
        return data && typeof data === 'object' ? data : null;
    }

    function setCachedAccountData(data) {
        if (!data || typeof data !== 'object') {
            localStorage.removeItem(ACCOUNT_CACHE_KEY);
            return;
        }
        localStorage.setItem(ACCOUNT_CACHE_KEY, JSON.stringify(data));
    }

    function syncAccountFromApi() {
        return apiRequest('/tourist/account/profile').then(function (data) {
            setCachedAccountData(data || null);
            if (data && data.pusher && !window.TRBL_PUSHER) {
                window.TRBL_PUSHER = data.pusher;
            }
            return data;
        });
    }

    function setLikes(likes) {
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    }

    function getCsrfToken() {
        const csrfMeta = qs('meta[name="csrf-token"]');
        return csrfMeta ? String(csrfMeta.getAttribute('content') || '') : '';
    }

    function getXsrfCookieToken() {
        const xsrfCookie = document.cookie
            .split(';')
            .map(function (part) {
                return part.trim();
            })
            .find(function (part) {
                return part.indexOf('XSRF-TOKEN=') === 0;
            });

        return xsrfCookie ? decodeURIComponent(xsrfCookie.slice('XSRF-TOKEN='.length)) : '';
    }

    function logoutToAuthPage() {
        const csrfToken = getCsrfToken();
        const xsrfToken = getXsrfCookieToken();
        const headers = {
            'Accept': 'application/json'
        };

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        } else if (xsrfToken) {
            headers['X-XSRF-TOKEN'] = xsrfToken;
        }

        return fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers
        }).finally(function () {
            localStorage.removeItem(ROLE_KEY);
            window.location.href = '/sign-in';
        });
    }

    function redirectToSignInIfRequired() {
        const body = document.body;
        if (!body || body.dataset.requireAuth !== 'true') {
            return;
        }
        if (body.dataset.authRedirecting === 'true') {
            return;
        }

        body.dataset.authRedirecting = 'true';

        const path = String(window.location.pathname || '/').replace(/^\/+/, '');
        const file = path || '/explore';
        const next = file + String(window.location.search || '') + String(window.location.hash || '');
        window.location.href = '/sign-in?next=' + encodeURIComponent(next);
    }

    function apiRequest(url, options) {
        const init = Object.assign({
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        }, options || {});

        const headers = Object.assign({}, init.headers || {});
        if (!headers['X-CSRF-TOKEN'] && !headers['X-XSRF-TOKEN']) {
            const csrfToken = getCsrfToken();
            const xsrfToken = getXsrfCookieToken();
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            } else if (xsrfToken) {
                headers['X-XSRF-TOKEN'] = xsrfToken;
            }
        }
        init.headers = headers;

        return fetch(url, init).then(function (response) {
            if (response.redirected || response.status === 401 || response.status === 403 || response.status === 419) {
                redirectToSignInIfRequired();
                const authError = new Error('Authentication required.');
                authError.code = 'auth';
                throw authError;
            }

            const contentType = String(response.headers.get('content-type') || '').toLowerCase();
            if (contentType.indexOf('application/json') === -1) {
                if (!response.ok) {
                    throw new Error('Request failed.');
                }
                return {};
            }

            return response.json().then(function (data) {
                if (!response.ok) {
                    const message = data && data.message ? String(data.message) : 'Request failed.';
                    throw new Error(message);
                }
                return data;
            });
        });
    }

    function loadPusherScript() {
        if (window.Pusher) {
            return Promise.resolve();
        }

        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function subscribeRealtime(channelName, eventName, handler) {
        const config = window.TRBL_PUSHER || {};
        if (!config.key || !channelName || !eventName || typeof handler !== 'function') {
            return;
        }

        loadPusherScript().then(function () {
            if (!window.Pusher) {
                return;
            }

            if (!window.__trblPusher) {
                window.__trblPusher = new window.Pusher(config.key, {
                    cluster: config.cluster || 'ap1',
                    forceTLS: true
                });
            }

            const registry = window.__trblPusherChannels || (window.__trblPusherChannels = {});
            const key = channelName;
            const channel = registry[key] || window.__trblPusher.subscribe(channelName);
            registry[key] = channel;
            channel.bind(eventName, handler);
        }).catch(function () {
            return null;
        });
    }

    function syncLikesFromApi() {
        return apiRequest('/tourist/favorites/mine').then(function (data) {
            const apiLikes = data && Array.isArray(data.likes) ? data.likes.map(String) : [];
            const localOnlyLikes = getLikes().filter(function (item) {
                return Number.isNaN(Number(item));
            });
            const likes = Array.from(new Set(localOnlyLikes.concat(apiLikes)));
            setLikes(likes);
            bindLikeButtons();
            updateSavedCounters();
            return likes;
        }).catch(function () {
            return null;
        });
    }

    function toggleLike(tourId, triggerButton) {
        const id = String(tourId || '').trim();
        if (!id) {
            return false;
        }

        const likes = getLikes();
        const previousLikes = likes.slice();
        const exists = likes.includes(id);
        const nextLikes = exists ? likes.filter(function (item) {
            return item !== id;
        }) : likes.concat([id]);

        setLikes(nextLikes);
        if (!Number.isNaN(Number(id))) {
            apiRequest('/tourist/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    tour_listing_id: Number(id)
                })
            }).catch(function () {
                setLikes(previousLikes);
                bindLikeButtons();
                updateSavedCounters();
                showToast('Unable to update likes right now.', 'danger');
            });
        }

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

    function showActionToast(message, actionLabel, onAction, kind, delay) {
        const host = qs('#toastHost') || createToastHost();
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
        const budgetInput = qs('#reqBudget') || qs('#reqBudgetMin');
        const maxBudget = qs('#reqBudgetMax');
        const budgetPreview = qs('#reqBudgetPreview');
        const adultsDisplay = qs('#adultsCount');
        const childrenDisplay = qs('#childrenCount');
        const createForm = qs('#createRequestForm');
        const regionInput = qs('#reqRegion', createForm || document);
        const interestOptions = qs('#interestOptions', createForm || document);
        const customInterestInput = qs('#customInterestInput', createForm || document);
        const addInterestBtn = qs('#addInterestBtn', createForm || document);
        const visibleCounter = qs('#visibleCounter');
        let dbTours = [];

        if (regionInput && !String(regionInput.value || '').trim()) {
            regionInput.value = REQUEST_DEFAULT_REGION;
        }

        function mapLegacyCardToDbTour(card, tours) {
            if (!card || !Array.isArray(tours) || !tours.length) {
                return null;
            }

            const previewLink = qs('a[href*="/tour-preview?tour="]', card);
            const queryTour = (function () {
                if (!previewLink) {
                    return '';
                }
                const href = previewLink.getAttribute('href') || '';
                const query = href.split('?')[1] || '';
                const params = new URLSearchParams(query);
                return String(params.get('tour') || '').trim();
            })();
            const title = normalizeTourLookupKey((qs('h3', card) || {}).textContent || '');
            const location = normalizeTourLookupKey((qs('p.text-xs.text-stone-500', card) || {}).textContent || '');

            return tours.find(function (tour) {
                const tourId = String(tour && tour.id ? tour.id : '').trim();
                const slug = String(tour && tour.slug ? tour.slug : '').trim().toLowerCase();
                const legacyKey = String(tour && tour.legacyKey ? tour.legacyKey : '').trim().toLowerCase();
                if (queryTour) {
                    const key = queryTour.toLowerCase();
                    if (key === tourId || key === slug || key === legacyKey) {
                        return true;
                    }
                }

                const tourTitle = normalizeTourLookupKey(tour && tour.title ? tour.title : '');
                if (!title || !tourTitle || title !== tourTitle) {
                    return false;
                }

                const tourLocation = normalizeTourLookupKey(tour && tour.location ? tour.location : '');
                if (!location || !tourLocation) {
                    return true;
                }

                return location === tourLocation
                    || location.indexOf(tourLocation) !== -1
                    || tourLocation.indexOf(location) !== -1;
            }) || null;
        }

        function hydrateLegacyExploreCardsWithDbTours(tours) {
            qsa('.feed-item[data-type="tour"]:not(.feed-item-db)', feed).forEach(function (card) {
                const match = mapLegacyCardToDbTour(card, tours);
                if (!match || !/^\d+$/.test(String(match.id || ''))) {
                    return;
                }

                card.dataset.dbTour = String(match.id);
                card.dataset.price = String(Number(match.price || card.dataset.price || 0));
                card.dataset.latest = String(Number(match.latest || Date.now()));

                const previewLink = qs('a[href*="/tour-preview?tour="]', card);
                if (previewLink) {
                    previewLink.setAttribute('href', '/tour-preview?tour=' + encodeURIComponent(String(match.id)));
                }

                const likeBtn = qs('.like-save[data-like-id]', card);
                if (likeBtn) {
                    likeBtn.dataset.likeId = String(match.id);
                }
            });

            bindLikeButtons(feed);
        }

        let activeType = 'all';
        let activeRegion = 'all';

        function inferRegionFromTour(tour) {
            const blob = String((tour.location || '') + ' ' + (tour.region || '')).toLowerCase();
            if (blob.indexOf('davao') !== -1 || blob.indexOf('mindanao') !== -1) {
                return 'davao';
            }
            if (blob.indexOf('cebu') !== -1 || blob.indexOf('bohol') !== -1 || blob.indexOf('palawan') !== -1 || blob.indexOf('visayas') !== -1) {
                return 'cebu';
            }
            return 'manila';
        }

        function dbTourCardMarkup(tour) {
            const tags = Array.isArray(tour.tags) ? tour.tags : [];
            return [
                '<article class="tour-card feed-item feed-item-db" data-db-tour="', escapeHtml(String(tour.id || '')), '" data-type="tour" data-region="', escapeHtml(inferRegionFromTour(tour)), '" data-price="', Number(tour.price || 0), '" data-latest="', Number(tour.latest || Date.now()), '" data-search="',
                escapeHtml(String((tour.title || '') + ' ' + (tour.location || '') + ' ' + tags.join(' ')).toLowerCase()),
                '">',
                '<div class="relative">',
                '<img src="', escapeHtml(tour.image || 'images/pangasinan.jpg'), '" alt="', escapeHtml(tour.title || 'Tour'), '" class="h-48 w-full object-cover">',
                '<div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">', escapeHtml(tour.badge || 'Guide Listing'), '</div>',
                '<button class="like-save" type="button" data-like-id="', escapeHtml(String(tour.id || '')), '" aria-label="Save tour"></button>',
                '</div>',
                '<div class="flex flex-1 flex-col p-4">',
                '<p class="text-xs text-stone-500">', escapeHtml(tour.location || 'Philippines'), '</p>',
                '<h3 class="mt-1 line-clamp-2 text-xl font-semibold">', escapeHtml(tour.title || 'Custom Tour'), '</h3>',
                '<div class="mt-3 flex items-center gap-2 text-sm text-stone-700">',
                '<img src="', escapeHtml(tour.guideAvatar || 'images/manila.jpg'), '" alt="Guide" class="h-7 w-7 rounded-full object-cover">',
                '<span class="font-medium">', escapeHtml(tour.guide || tour.provider || 'Guide'), '</span>',
                '</div>',
                '<p class="mt-2 text-sm text-stone-600">', Number(tour.rating || 0).toFixed(2), ' (', String(tour.reviews || 0), ') • ', escapeHtml(tour.duration || 'Flexible'), ' • ', escapeHtml(tour.pax || '1-10 pax'), ' • ', escapeHtml(tour.difficulty || 'Moderate'), '</p>',
                '<div class="mt-3 flex flex-wrap gap-1.5 text-xs">',
                tags.slice(0, 4).map(function (tag) {
                    return '<span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">' + escapeHtml(tag) + '</span>';
                }).join(''),
                '</div>',
                '<div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">',
                '<p class="text-3xl font-bold">₱', Number(tour.price || 0).toLocaleString(), ' <span class="text-sm font-medium text-stone-500">/ person</span></p>',
                '<a href="/tour-preview?tour=', encodeURIComponent(String(tour.id || '')), '" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>',
                '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function renderDbTours() {
            qsa('.feed-item-db', feed).forEach(function (node) {
                node.remove();
            });

            dbTours.forEach(function (tour) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = dbTourCardMarkup(tour);
                const card = wrapper.firstElementChild;
                if (card) {
                    feed.prepend(card);
                }
            });
            bindLikeButtons(feed);
            applyFilters();
        }

        function syncToursFromApi() {
            return apiRequest('/tourist/tours/feed').then(function (data) {
                const tours = data && Array.isArray(data.tours) ? data.tours : [];
                dbTours = tours.map(function (tour) {
                    return Object.assign({}, tour, {
                        id: String(tour.id || ''),
                        latest: Number(tour.latest || Date.now())
                    });
                });
                upsertGuideTourCatalogEntries(dbTours);
                hydrateLegacyExploreCardsWithDbTours(dbTours);

                const requiredLegacyKeys = ['bohol', 'elnido', 'coron', 'mtapo', 'batanes', 'siargao'];
                const availableKeys = dbTours.map(function (tour) {
                    return String(tour.legacyKey || tour.slug || '').trim().toLowerCase();
                });
                const hasCanonicalCatalog = requiredLegacyKeys.every(function (key) {
                    return availableKeys.includes(key);
                });
                if (hasCanonicalCatalog) {
                    qsa('.tour-card.feed-item:not(.feed-item-db)', feed).forEach(function (node) {
                        node.remove();
                    });
                }

                renderDbTours();
                syncExploreCardsWithCatalog();
            }).catch(function () {
                return null;
            });
        }

        function upsertDbTourFromRealtime(tour) {
            if (!tour || !tour.id) {
                return;
            }
            const id = String(tour.id);
            if (String(tour.action || '').toLowerCase() === 'deleted' || tour.isActive === false || String(tour.status || '').toLowerCase() !== 'published') {
                dbTours = dbTours.filter(function (item) {
                    return String(item.id) !== id;
                });
                renderDbTours();
                return;
            }

            const next = Object.assign({}, tour, { id: id, latest: Number(tour.latest || Date.now()) });
            const index = dbTours.findIndex(function (item) {
                return String(item.id) === id;
            });

            if (index >= 0) {
                dbTours[index] = Object.assign({}, dbTours[index], next);
            } else {
                dbTours.unshift(next);
            }

            upsertGuideTourCatalogEntries([next]);
            renderDbTours();
            syncExploreCardsWithCatalog();
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
            if (!budgetPreview) {
                return;
            }
            const min = Number((budgetInput && budgetInput.value) || 0);
            const max = Number((maxBudget && maxBudget.value) || min);
            budgetPreview.textContent = 'PHP ' + min.toLocaleString() + ' - PHP ' + max.toLocaleString();
        }

        if (budgetInput || maxBudget) {
            syncModalBudget();
            if (budgetInput) {
                budgetInput.addEventListener('input', syncModalBudget);
            }
            if (maxBudget) {
                maxBudget.addEventListener('input', syncModalBudget);
            }
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

        function addCustomInterestOption(rawValue) {
            if (!interestOptions) {
                return;
            }
            const value = String(rawValue || '').trim();
            if (!value) {
                return;
            }
            const normalized = value.toLowerCase();
            const exists = qsa('input[name="interests[]"]', interestOptions).some(function (input) {
                return String(input.value || '').trim().toLowerCase() === normalized;
            });
            if (exists) {
                return;
            }

            const label = document.createElement('label');
            label.dataset.customInterest = 'true';
            label.innerHTML = '<input type="checkbox" name="interests[]" value="' + escapeHtml(value) + '" checked> ' + escapeHtml(value);
            interestOptions.appendChild(label);
        }

        function collectSelectedInterests() {
            if (!createForm) {
                return [];
            }
            return qsa('input[name="interests[]"]:checked', createForm).map(function (item) {
                return String(item.value || '').trim();
            }).filter(Boolean);
        }

        function submitTourRequest(payload) {
            return apiRequest('/tourist/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });
        }

        if (addInterestBtn) {
            addInterestBtn.addEventListener('click', function () {
                addCustomInterestOption(customInterestInput ? customInterestInput.value : '');
                if (customInterestInput) {
                    customInterestInput.value = '';
                    customInterestInput.focus();
                }
            });
        }

        if (customInterestInput) {
            customInterestInput.addEventListener('keydown', function (event) {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                addCustomInterestOption(customInterestInput.value);
                customInterestInput.value = '';
            });
        }

        if (createForm) {
            createForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const submitBtn = qs('button[type="submit"]', createForm);
                const formData = new FormData(createForm);
                const payload = Object.fromEntries(formData.entries());
                const budgetValue = Number(payload.budget || payload.budgetMin || 0);
                const low = budgetValue;
                const high = Number(payload.budgetMax || payload.budget || payload.budgetMin || 0);
                const selectedInterests = collectSelectedInterests();
                const destinationText = String(payload.location || 'Philippines').trim();
                const regionText = String(payload.region || REQUEST_DEFAULT_REGION).trim();
                const durationText = String(payload.duration || (durationInput ? durationInput.value : '3')).trim();
                const detailText = String(payload.details || '').trim();
                const adultsCount = Math.max(1, Number(payload.adults || 1));
                const childrenCount = Math.max(0, Number(payload.children || 0));
                const budgetMinValue = Number(payload.budget || payload.budgetMin || (budgetInput ? budgetInput.value : 0));
                const budgetMaxValue = Number(payload.budget || payload.budgetMax || (maxBudget ? maxBudget.value : payload.budgetMin || 0));
                const durationLabel = /day/i.test(durationText) ? durationText : durationText + ' days';
                const travelersLabel = adultsCount + ' adults' + (childrenCount > 0 ? ' / ' + childrenCount + ' children' : '');
                const summaryText = [
                    'Destination: ' + destinationText + (regionText ? ', ' + regionText : '') + '.',
                    'Duration: ' + durationLabel + '.',
                    'Travelers: ' + travelersLabel + '.',
                    'Budget: PHP ' + budgetMinValue.toLocaleString() + ' - PHP ' + budgetMaxValue.toLocaleString() + '.',
                    selectedInterests.length ? 'Interests: ' + selectedInterests.join(', ') + '.' : ''
                ].filter(Boolean).join(' ');

                if (high < low) {
                    showToast('Budget max should be greater than min.', 'danger');
                    return;
                }

                if (!selectedInterests.length) {
                    showToast('Select at least one interest.', 'warning');
                    return;
                }

                if (!regionText) {
                    showToast('Region is required.', 'warning');
                    if (regionInput) {
                        regionInput.focus();
                    }
                    return;
                }

                const requestPayload = {
                    title: payload.title || 'New Tourist Request',
                    description: detailText || summaryText,
                    location: destinationText,
                    region: regionText,
                    duration: durationText,
                    duration_label: durationLabel,
                    budget: payload.budget || (budgetInput ? budgetInput.value : payload.budgetMin || 0),
                    budgetMin: budgetMinValue,
                    budgetMax: budgetMaxValue,
                    adults: adultsCount,
                    children: childrenCount,
                    travelers_label: travelersLabel,
                    interests: selectedInterests
                };

                setButtonLoading(submitBtn, true);
                submitTourRequest(requestPayload).then(function (result) {
                    const created = result && result.request ? result.request : requestPayload;
                    addTouristRequestForGuide(created);
                    createForm.reset();
                    qsa('[data-custom-interest="true"]', interestOptions || createForm).forEach(function (item) {
                        item.remove();
                    });
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
                    showToast('Request created and posted to guide feed.', 'success');
                    const requestId = created && created.id ? String(created.id) : '';
                    setTimeout(function () {
                        window.location.href = '/my-posts' + (requestId ? '?request=' + encodeURIComponent(requestId) : '');
                    }, 450);
                }).catch(function (error) {
                    if (error && error.code === 'auth') {
                        showToast('Please sign in to create a request.', 'warning');
                        setTimeout(function () {
                            window.location.href = '/sign-in?next=' + encodeURIComponent('/explore');
                        }, 600);
                        return;
                    }
                    showToast('Unable to create request right now.', 'danger');
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
        bindLikeButtons(feed);
        applyFilters();
        syncLikesFromApi();
        syncToursFromApi();
        window.setInterval(syncToursFromApi, 30000);
        subscribeRealtime('tour-listings', 'tour-listing.updated', function (payload) {
            const tour = payload && payload.tour ? payload.tour : null;
            if (!tour) {
                return;
            }
            upsertDbTourFromRealtime(tour);
            syncNotificationsFromApi();
        });
        window.addEventListener('trbl:guide-profile-updated', function () {
            syncToursFromApi();
        });
    }

    function initMyPostsPage() {
        const editModal = qs('#editRequestModal');
        const editForm = qs('#editRequestForm');
        const selectGuideModal = qs('#selectGuideConfirmModal');
        const confirmSelectGuideBtn = qs('#confirmSelectGuideBtn');
        const selectGuideConfirmName = qs('#selectGuideConfirmName');
        const selectGuideConfirmRequest = qs('#selectGuideConfirmRequest');
        const selectGuideConfirmAmount = qs('#selectGuideConfirmAmount');
        const requestGrid = qs('.request-manage-grid');
        let requestFilterBar = qs('[data-request-filters]');
        if (!requestFilterBar && requestGrid && requestGrid.parentElement) {
            requestFilterBar = document.createElement('section');
            requestFilterBar.className = 'booking-tabs request-filter-tabs';
            requestFilterBar.dataset.requestFilters = 'true';
            requestFilterBar.innerHTML = [
                '<button type="button" class="tab-btn active" data-request-filter="all">All <span class="request-filter-count" data-request-filter-count="all">0</span></button>',
                '<button type="button" class="tab-btn" data-request-filter="open">Open <span class="request-filter-count" data-request-filter-count="open">0</span></button>',
                '<button type="button" class="tab-btn" data-request-filter="selected">Selected Guides <span class="request-filter-count" data-request-filter-count="selected">0</span></button>'
            ].join('');
            requestGrid.parentElement.insertBefore(requestFilterBar, requestGrid);
        }
        qsa('[data-request-filter="cancelled"], [data-request-filter="negotiating"], [data-request-filter="completed"]', requestFilterBar || document).forEach(function (node) {
            node.remove();
        });
        if (requestGrid) {
            qsa('.request-manage-card:not([data-db-request="true"])', requestGrid).forEach(function (node) {
                node.remove();
            });
        }
        const cards = qsa('.request-manage-card[data-db-request="true"]');
        const editModalInstance = editModal ? bootstrap.Modal.getOrCreateInstance(editModal) : null;
        const selectGuideModalInstance = selectGuideModal ? bootstrap.Modal.getOrCreateInstance(selectGuideModal) : null;
        const params = new URLSearchParams(window.location.search);
        const requestFromRoute = params.get('request');
        const openThreadFromRoute = params.get('openThread') === '1';
        let shouldOpenThreadFromRoute = openThreadFromRoute && !!requestFromRoute;
        let pendingGuideSelection = null;
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
        let dbRequestMap = {};
        let activeRequestFilter = 'all';
        let latestRequestRows = [];
        const statsElements = {
            total_requests: qs('[data-request-stats="total_requests"]'),
            open_requests: qs('[data-request-stats="open_requests"]'),
            selected_guides: qs('[data-request-stats="selected_guides"]')
        };
        const filterButtons = qsa('[data-request-filter]', requestFilterBar || document);
        const filterCountElements = {
            all: qs('[data-request-filter-count="all"]', requestFilterBar || document),
            open: qs('[data-request-filter-count="open"]', requestFilterBar || document),
            selected: qs('[data-request-filter-count="selected"]', requestFilterBar || document)
        };

        function applyRequestStats(stats) {
            const source = stats && typeof stats === 'object' ? stats : {};
            Object.keys(statsElements).forEach(function (key) {
                const target = statsElements[key];
                if (!target) {
                    return;
                }
                const value = Number(source[key] || 0);
                target.textContent = String(Math.max(0, Number.isFinite(value) ? value : 0));
            });
        }

        function setRequestStatsLoading() {
            Object.keys(statsElements).forEach(function (key) {
                const target = statsElements[key];
                if (target) {
                    target.textContent = '...';
                }
            });
        }

        function deriveRequestBucketCounts(requests) {
            const base = {
                all: 0,
                open: 0,
                selected: 0
            };

            (Array.isArray(requests) ? requests : []).forEach(function (request) {
                const bucket = requestStatusKey(request);
                if (bucket === 'open' || bucket === 'selected') {
                    base.all += 1;
                    base[bucket] += 1;
                }
            });

            return base;
        }

        function applyRequestFilterCounts(stats, requests) {
            const source = stats && typeof stats === 'object' ? stats : {};
            const derived = deriveRequestBucketCounts(requests);
            const resolved = {
                all: Number(source.total_requests),
                open: Number(source.open_requests),
                selected: Number(source.selected_guides)
            };

            Object.keys(filterCountElements).forEach(function (key) {
                const target = filterCountElements[key];
                if (!target) {
                    return;
                }

                const fallback = Number(derived[key] || 0);
                const value = Number.isFinite(resolved[key]) ? resolved[key] : fallback;
                target.textContent = String(Math.max(0, value));
            });
        }

        function renderFilterEmptyState(message) {
            if (!requestGrid) {
                return;
            }

            let emptyNode = qs('[data-request-filter-empty]', requestGrid);
            if (!message) {
                if (emptyNode) {
                    emptyNode.remove();
                }
                return;
            }

            if (!emptyNode) {
                emptyNode = document.createElement('div');
                emptyNode.className = 'empty-state';
                emptyNode.dataset.requestFilterEmpty = 'true';
                requestGrid.appendChild(emptyNode);
            }

            emptyNode.textContent = message;
        }

        function applyRequestFilter(bucket) {
            activeRequestFilter = bucket || 'all';

            filterButtons.forEach(function (button) {
                const key = String(button.dataset.requestFilter || 'all');
                button.classList.toggle('active', key === activeRequestFilter);
            });

            if (!requestGrid) {
                return;
            }

            let visibleCount = 0;
            qsa('.request-manage-card[data-db-request="true"]', requestGrid).forEach(function (card) {
                const cardBucket = String(card.dataset.requestBucket || 'open');
                const visible = activeRequestFilter === 'all' || cardBucket === activeRequestFilter;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            const activeLabel = activeRequestFilter.charAt(0).toUpperCase() + activeRequestFilter.slice(1);
            renderFilterEmptyState(visibleCount === 0
                ? 'No ' + activeLabel + ' requests to show right now.'
                : '');
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                applyRequestFilter(String(button.dataset.requestFilter || 'all'));
            });
        });

        function requestStatusKey(request) {
            const bucketFromApi = String(request && request.statusBucket ? request.statusBucket : '').toLowerCase();
            const hasSelectedGuide = !!(request && request.selectedGuideId);
            const isActive = !(request && request.isActive === false);

            if (hasSelectedGuide || bucketFromApi === 'selected') {
                return 'selected';
            }

            if ((bucketFromApi === 'open' || bucketFromApi === 'negotiating') && isActive) {
                return 'open';
            }

            const rawStatus = String(request && request.status ? request.status : '').toLowerCase();
            if ((rawStatus === 'open' || rawStatus === 'negotiating') && isActive) {
                return 'open';
            }

            return 'hidden';
        }

        function requestBadgeClass(request) {
            const value = requestStatusKey(request);
            if (value === 'selected') {
                return 'badge-selected';
            }
            return 'badge-open';
        }

        function requestStatusLabel(request) {
            const value = requestStatusKey(request);
            if (value === 'selected') {
                return 'Selected Guide';
            }
            return 'Open';
        }

        function formatCommentTimestamp(value) {
            if (!value) {
                return 'Unknown time';
            }

            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) {
                return String(value);
            }

            return parsed.toLocaleString([], {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function canSelectGuideFromRequest(request) {
            const key = requestStatusKey(request);
            return key === 'open';
        }

        function collectGuideCandidates(comments, acc) {
            const list = Array.isArray(comments) ? comments : [];
            const target = Array.isArray(acc) ? acc : [];

            list.forEach(function (entry) {
                if (!entry || typeof entry !== 'object') {
                    return;
                }
                const role = String(entry.authorRole || '').toLowerCase();
                const guideId = String(entry.authorId || entry.guideId || '').trim();
                if (role === 'guide' && guideId) {
                    target.push({
                        guideId: guideId,
                        commentId: String(entry.id || ''),
                        guideName: String(entry.authorName || entry.guideName || 'Guide').trim() || 'Guide',
                        offerAmount: entry.offerAmount != null ? Number(entry.offerAmount) : null,
                    });
                }
                collectGuideCandidates(entry.replies, target);
            });

            return target;
        }

        function getPrimaryGuideCandidate(request) {
            const candidates = collectGuideCandidates(request && request.comments, []);
            if (!candidates.length) {
                return null;
            }
            return candidates[0];
        }

        function renderCommentNode(request, comment, depth) {
            const item = comment && typeof comment === 'object' ? comment : {};
            const authorRole = String(item.authorRole || '').toLowerCase() || 'guide';
            const authorId = String(item.authorId || item.guideId || '').trim();
            const selectedGuideId = String(request && request.selectedGuideId ? request.selectedGuideId : '').trim();
            const isGuide = authorRole === 'guide';
            const isSelectedGuide = isGuide && selectedGuideId !== '' && selectedGuideId === authorId;
            const offerAmount = item.offerAmount ? Number(item.offerAmount) : null;
            const canSelect = isGuide && canSelectGuideFromRequest(request);
            const replies = Array.isArray(item.replies) ? item.replies : [];

            const selectButton = canSelect
                ? '<button type="button" class="btn-gold btn-xs" data-select-comment-guide="' + escapeHtml(authorId) + '" data-comment-id="' + escapeHtml(String(item.id || '')) + '" data-guide-name="' + escapeHtml(String(item.authorName || item.guideName || 'Guide')) + '" data-offer-amount="' + escapeHtml(String(offerAmount || '')) + '"' + (isSelectedGuide ? ' disabled' : '') + '><i class="fa-solid fa-user-check me-1"></i>' + (isSelectedGuide ? 'Selected' : 'Select Guide') + '</button>'
                : '';

            const openMessageButton = isGuide && authorId
                ? '<button type="button" class="btn-soft btn-xs" data-open-comment-message="' + escapeHtml(authorId) + '" data-comment-id="' + escapeHtml(String(item.id || '')) + '"><i class="fa-regular fa-comments me-1"></i>Open Message</button>'
                : '';

            const replyButton = '<button type="button" class="btn-ghost btn-xs" data-toggle-reply-form="' + escapeHtml(String(item.id || '')) + '"><i class="fa-solid fa-reply me-1"></i>Reply</button>';
            const amountLine = offerAmount
                ? '<div class="offer-meta-line">Offer: <strong>' + escapeHtml(formatPeso(offerAmount)) + '</strong></div>'
                : '';
            const repliesMarkup = replies.length
                ? '<div class="thread-replies">' + replies.map(function (reply) {
                    return renderCommentNode(request, reply, depth + 1);
                }).join('') + '</div>'
                : '';

            return [
                '<article class="thread-comment" data-comment-id="', escapeHtml(String(item.id || '')), '" data-comment-depth="', String(depth), '">',
                '<div class="thread-comment-head">',
                '<img class="thread-avatar" src="', escapeHtml(item.authorAvatar || item.guideAvatar || '/images/manila.jpg'), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';" alt="', escapeHtml(item.authorName || item.guideName || 'User'), '">',
                '<div class="thread-meta">',
                '<div class="thread-name-row"><strong>', escapeHtml(item.authorName || item.guideName || 'User'), '</strong><span class="thread-role-pill">', escapeHtml(authorRole === 'tourist' ? 'Tourist' : 'Guide'), '</span></div>',
                '<small class="text-muted">', escapeHtml(formatCommentTimestamp(item.createdAt)), '</small>',
                '</div>',
                '</div>',
                '<p class="small mb-1">', escapeHtml(item.text || ''), '</p>',
                amountLine,
                '<div class="thread-actions">',
                selectButton,
                openMessageButton,
                replyButton,
                '</div>',
                '<form class="thread-reply-form" data-comment-reply-form="', escapeHtml(String(item.id || '')), '" data-request-id="', escapeHtml(String(request && request.id ? request.id : '')), '">',
                '<textarea class="input-soft" rows="2" data-reply-text placeholder="Write a reply..." required></textarea>',
                '<div class="d-flex justify-content-end gap-2 mt-2">',
                '<button type="button" class="btn-ghost btn-xs" data-cancel-reply="', escapeHtml(String(item.id || '')), '">Cancel</button>',
                '<button type="submit" class="btn-charcoal btn-xs">Reply</button>',
                '</div>',
                '</form>',
                repliesMarkup,
                '</article>'
            ].join('');
        }

        function renderRequestComments(request) {
            const list = Array.isArray(request && request.comments) ? request.comments : [];
            const selectedGuideId = request && request.selectedGuideId ? String(request.selectedGuideId) : '';
            const statusKey = requestStatusKey(request);
            const statusClass = statusKey === 'completed'
                ? 'completed'
                : (statusKey === 'cancelled'
                    ? 'cancelled'
                    : (statusKey === 'selected'
                        ? 'selected'
                        : (statusKey === 'negotiating' ? 'negotiating' : '')));

            const statusMarkup = [
                '<div class="negotiation-status-row">',
                '<span class="negotiation-status-pill ' + escapeHtml(statusClass) + '">',
                '<i class="fa-solid fa-scale-balanced"></i>',
                escapeHtml(requestStatusLabel(request)),
                '</span>',
                '</div>'
            ].join('');

            const selectedGuideMarkup = selectedGuideId
                ? '<div class="selected-guide-callout"><i class="fa-solid fa-user-check me-1"></i>Selected guide: ' + escapeHtml(String(request.selectedGuideName || 'Guide')) + '<button type="button" class="btn btn-sm btn-light ms-2" data-unselect-db-guide="' + escapeHtml(String(request.id || '')) + '">Unselect Guide</button></div>'
                : '';

            const commentMarkup = list.length
                ? list.map(function (comment) {
                    return renderCommentNode(request, comment, 0);
                }).join('')
                : '<p class="small text-muted mb-2">No comments yet. Start the discussion below.</p>';

            return statusMarkup + selectedGuideMarkup + '<div class="thread-list">' + commentMarkup + '</div>';
        }

        function submitRequestComment(requestId, text, parentCommentId) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId)) + '/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    text: text,
                    parent_comment_id: parentCommentId || null
                })
            });
        }

        function submitGuideSelection(requestId, guideId, offerAmount, commentId) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId)) + '/select-guide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    guide_id: guideId,
                    comment_id: commentId || null,
                    offer_amount: offerAmount || null
                })
            });
        }

        function startGuideMessage(requestId, guideId) {
            return apiRequest('/tourist/messages/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    tour_request_id: requestId || null,
                    guide_id: guideId
                })
            });
        }

        function submitGuideUnselection(requestId) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId)) + '/unselect-guide', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
        }

        function updateRequestStatus(requestId, status) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId)), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ status: status })
            });
        }

        function deleteRequest(requestId) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId)), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
        }

        function renderStoredRequests(requests) {
            if (!requestGrid) {
                return;
            }

            latestRequestRows = Array.isArray(requests) ? requests.slice() : [];
            dbRequestMap = {};

            qsa('.request-manage-card, [data-request-filter-empty]', requestGrid).forEach(function (node) {
                node.remove();
            });

            latestRequestRows.forEach(function (request) {
                const id = String(request.id || '');
                const bucket = requestStatusKey(request);
                if (bucket !== 'open' && bucket !== 'selected') {
                    return;
                }

                dbRequestMap[id] = request;
                const primaryCandidate = getPrimaryGuideCandidate(request);
                const canSelectCardGuide = bucket === 'open';
                const openMessageButton = canSelectCardGuide && primaryCandidate
                    ? '<button class="btn-soft" data-open-comment-message="' + escapeHtml(primaryCandidate.guideId) + '" data-request-id="' + escapeHtml(id) + '"><i class="fa-regular fa-comments me-1"></i>Open Message</button>'
                    : '';

                const card = document.createElement('article');
                card.className = 'request-manage-card';
                card.dataset.dbRequest = 'true';
                card.dataset.requestId = id;
                card.dataset.requestBucket = bucket;
                card.innerHTML = [
                    '<div class="request-top">',
                    '<div class="post-identity">',
                    '<img class="tourist-avatar" src="', escapeHtml(request.touristAvatar || '/images/manila.jpg'), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';" alt="', escapeHtml(request.touristName || 'Tourist'), '">',
                    '<div>',
                    '<p class="tourist-name mb-0"><strong>', escapeHtml(request.touristName || 'Tourist'), '</strong></p>',
                    '<p class="small text-muted mb-0">', escapeHtml(String(request.createdAt || '').replace('T', ' ').slice(0, 16)), '</p>',
                    '</div>',
                    '</div>',
                    '<span class="badge-status ', requestBadgeClass(request), '">', escapeHtml(requestStatusLabel(request)), '</span>',
                    '</div>',
                    '<div class="request-body">',
                    '<h2 class="h5 mb-1">', escapeHtml(request.title || 'Tour request'), '</h2>',
                    '<p class="small text-muted mb-2">Location: ', escapeHtml(request.location || 'Philippines'), '</p>',
                    '<div class="row g-2 small text-muted">',
                    '<div class="col-md-4">Budget: <strong class="text-dark">', formatPeso(request.budgetMin), ' - ', formatPeso(request.budgetMax), '</strong></div>',
                    '<div class="col-md-4">Duration: <strong class="text-dark">', escapeHtml(request.duration || 'Flexible'), '</strong></div>',
                    '<div class="col-md-4">Travelers: <strong class="text-dark">', escapeHtml(request.travelers || '1 traveler'), '</strong></div>',
                    '</div>',
                    '<p class="small text-muted mt-2 mb-2">', escapeHtml(String(request.description || 'No additional trip details provided yet.')), '</p>',
                    '<div class="tag-row">',
                    (Array.isArray(request.interests) ? request.interests : []).map(function (interest) {
                        return '<span class="soft-tag">' + escapeHtml(interest) + '</span>';
                    }).join(''),
                    '</div>',
                    '<div class="negotiation-box">',
                    renderRequestComments(request),
                    '<form data-db-comment-form="', escapeHtml(id), '">',
                    '<label class="field-label">Add Comment</label>',
                    '<textarea class="input-soft" rows="2" data-comment-text placeholder="Write a comment for this request..." required></textarea>',
                    '<div class="d-flex gap-2 mt-2">',
                    '<button type="submit" class="btn-charcoal">Post Comment</button>',
                    '</div>',
                    '</form>',
                    '</div>',
                    '<div class="d-flex gap-2 mt-3 flex-wrap">',
                    '<button class="btn-ghost" data-toggle-thread><i class="fa-regular fa-comments me-1"></i>View Comments</button>',
                    openMessageButton,
                    (String(request.status || '').toLowerCase() !== 'completed'
                        ? '<button class="btn-danger" data-delete-request><i class="fa-solid fa-trash me-1"></i>Delete Request</button>'
                        : ''),
                    '</div>',
                    '</div>'
                ].join('');
                requestGrid.appendChild(card);
            });

            applyRequestFilterCounts(null, latestRequestRows);
            applyRequestFilter(activeRequestFilter);
        }

        function setNegotiationOpenState(requestId, open) {
            if (!requestId) {
                return;
            }

            const card = qs('.request-manage-card[data-request-id="' + requestId + '"]');
            if (!card) {
                return;
            }

            const box = qs('.negotiation-box', card);
            const btn = qs('[data-toggle-thread]', card);
            if (!box || !btn) {
                return;
            }

            box.classList.toggle('open', Boolean(open));
            btn.innerHTML = Boolean(open)
                ? '<i class="fa-regular fa-comments me-1"></i>Hide Comments'
                : '<i class="fa-regular fa-comments me-1"></i>View Comments';
        }

        function focusRequestCard(requestId) {
            if (!requestId) {
                return;
            }

            const card = qs('.request-manage-card[data-request-id="' + requestId + '"]');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function refreshSingleRequest(requestId) {
            return apiRequest('/tourist/requests/' + encodeURIComponent(String(requestId))).then(function (data) {
                if (!data || !data.request || !requestGrid) {
                    return null;
                }

                const requestData = data.request;
                dbRequestMap[String(requestData.id)] = requestData;
                const ordered = Object.values(dbRequestMap).sort(function (a, b) {
                    const left = Date.parse(String((a && a.createdAt) || '')) || 0;
                    const right = Date.parse(String((b && b.createdAt) || '')) || 0;
                    return right - left;
                });
                renderStoredRequests(ordered);
                return requestData;
            });
        }

        function syncMyRequestsFromApi() {
            return apiRequest('/tourist/requests/mine').then(function (data) {
                const requestRows = data && Array.isArray(data.requests) ? data.requests : [];
                const stats = data && data.stats ? data.stats : null;
                renderStoredRequests(requestRows);
                applyRequestStats(stats);
                applyRequestFilterCounts(stats, requestRows);
                if (requestFromRoute) {
                    focusRequestCard(requestFromRoute);
                }
                if (shouldOpenThreadFromRoute && requestFromRoute) {
                    setNegotiationOpenState(requestFromRoute, true);
                    shouldOpenThreadFromRoute = false;
                }
            }).catch(function () {
                applyRequestStats(null);
                applyRequestFilterCounts(null, latestRequestRows);
                return null;
            });
        }

        setRequestStatsLoading();
        syncMyRequestsFromApi();
        if (params.get('created') === '1') {
            showToast('Request created successfully.', 'success');
        }

        if (requestGrid) {
            requestGrid.addEventListener('submit', function (event) {
                const topLevelForm = event.target.closest('[data-db-comment-form]');
                const replyForm = event.target.closest('[data-comment-reply-form]');
                if (!topLevelForm && !replyForm) {
                    return;
                }

                event.preventDefault();

                if (topLevelForm) {
                    const requestId = String(topLevelForm.dataset.dbCommentForm || '');
                    const textarea = qs('[data-comment-text]', topLevelForm);
                    const text = String(textarea ? textarea.value : '').trim();
                    if (!requestId || !text) {
                        return;
                    }

                    submitRequestComment(requestId, text, null).then(function () {
                        if (textarea) {
                            textarea.value = '';
                        }
                        showToast('Comment posted.', 'success');
                        syncMyRequestsFromApi().then(function () {
                            setNegotiationOpenState(requestId, true);
                        });
                    }).catch(function () {
                        showToast('Unable to post comment right now.', 'danger');
                    });
                    return;
                }

                const requestId = String(replyForm.dataset.requestId || '');
                const parentCommentId = String(replyForm.dataset.commentReplyForm || '');
                const textarea = qs('[data-reply-text]', replyForm);
                const text = String(textarea ? textarea.value : '').trim();
                if (!requestId || !parentCommentId || !text) {
                    return;
                }

                submitRequestComment(requestId, text, parentCommentId).then(function () {
                    if (textarea) {
                        textarea.value = '';
                    }
                    showToast('Reply posted.', 'success');
                    syncMyRequestsFromApi().then(function () {
                        setNegotiationOpenState(requestId, true);
                    });
                }).catch(function () {
                    showToast('Unable to post reply right now.', 'danger');
                });
            });

            requestGrid.addEventListener('click', function (event) {
                const toggleBtn = event.target.closest('[data-toggle-thread]');
                if (toggleBtn) {
                    const card = toggleBtn.closest('[data-request-id]');
                    const requestId = card ? String(card.dataset.requestId || '') : '';
                    const box = card ? qs('.negotiation-box', card) : null;
                    if (!requestId || !box) {
                        return;
                    }

                    if (box.classList.contains('open')) {
                        setNegotiationOpenState(requestId, false);
                        return;
                    }

                    const previous = toggleBtn.innerHTML;
                    toggleBtn.disabled = true;
                    toggleBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...';
                    refreshSingleRequest(requestId).then(function () {
                        setNegotiationOpenState(requestId, true);
                        focusRequestCard(requestId);
                    }).catch(function () {
                        showToast('Unable to load negotiation details right now.', 'danger');
                    }).finally(function () {
                        const freshBtn = qs('.request-manage-card[data-request-id="' + requestId + '"] [data-toggle-thread]');
                        if (freshBtn) {
                            freshBtn.disabled = false;
                            if (!freshBtn.innerHTML || freshBtn.innerHTML.indexOf('Loading...') !== -1) {
                                freshBtn.innerHTML = previous;
                            }
                        }
                    });
                    return;
                }

                const replyToggleBtn = event.target.closest('[data-toggle-reply-form]');
                if (replyToggleBtn) {
                    const commentId = String(replyToggleBtn.dataset.toggleReplyForm || '').trim();
                    if (!commentId) {
                        return;
                    }

                    const card = replyToggleBtn.closest('[data-request-id]');
                    const requestId = card ? String(card.dataset.requestId || '') : '';
                    const form = qs('[data-comment-reply-form="' + commentId + '"]', card || requestGrid);
                    if (!form) {
                        return;
                    }

                    qsa('.thread-reply-form.open', card || requestGrid).forEach(function (node) {
                        if (node !== form) {
                            node.classList.remove('open');
                        }
                    });

                    form.classList.toggle('open');
                    if (form.classList.contains('open')) {
                        const field = qs('[data-reply-text]', form);
                        if (field) {
                            field.focus();
                        }
                        if (requestId) {
                            setNegotiationOpenState(requestId, true);
                        }
                    }
                    return;
                }

                const cancelReplyBtn = event.target.closest('[data-cancel-reply]');
                if (cancelReplyBtn) {
                    const commentId = String(cancelReplyBtn.dataset.cancelReply || '').trim();
                    const form = qs('[data-comment-reply-form="' + commentId + '"]', requestGrid);
                    if (form) {
                        form.classList.remove('open');
                    }
                    return;
                }

                const openMessageBtn = event.target.closest('[data-open-comment-message]');
                if (openMessageBtn) {
                    const guideId = String(openMessageBtn.dataset.openCommentMessage || '').trim();
                    const card = openMessageBtn.closest('[data-request-id]');
                    const requestId = card ? String(card.dataset.requestId || '') : '';
                    if (!guideId) {
                        showToast('Unable to identify the guide for this comment.', 'warning');
                        return;
                    }

                    startGuideMessage(requestId || null, guideId).then(function (result) {
                        const conversationId = result && result.conversationId ? String(result.conversationId) : '';
                        const redirect = result && result.redirect
                            ? String(result.redirect)
                            : '/messages' + (conversationId ? '?conversation=' + encodeURIComponent(conversationId) : '');
                        window.location.href = redirect;
                    }).catch(function (error) {
                        showToast(error && error.message ? error.message : 'Unable to open private chat right now.', 'danger');
                    });
                    return;
                }

                const selectBtn = event.target.closest('[data-select-comment-guide]');
                if (selectBtn) {
                    const card = selectBtn.closest('[data-request-id]');
                    const requestId = card ? String(card.dataset.requestId || '') : '';
                    const guideId = String(selectBtn.dataset.selectCommentGuide || '');
                    const commentId = String(selectBtn.dataset.commentId || '');
                    const offerAmount = selectBtn.dataset.offerAmount ? Number(selectBtn.dataset.offerAmount) : null;
                    if (!requestId || !guideId) {
                        return;
                    }

                    const requestData = dbRequestMap[requestId] || {};
                    pendingGuideSelection = {
                        requestId: requestId,
                        guideId: guideId,
                        commentId: commentId || null,
                        guideName: String(selectBtn.dataset.guideName || 'Guide').trim() || 'Guide',
                        offerAmount: offerAmount,
                        requestTitle: String(requestData.title || 'this request')
                    };

                    if (selectGuideConfirmName) {
                        selectGuideConfirmName.textContent = pendingGuideSelection.guideName || 'this guide';
                    }
                    if (selectGuideConfirmRequest) {
                        selectGuideConfirmRequest.textContent = pendingGuideSelection.requestTitle || 'your request';
                    }
                    if (selectGuideConfirmAmount) {
                        selectGuideConfirmAmount.textContent = pendingGuideSelection.offerAmount
                            ? 'Offer amount: ' + formatPeso(pendingGuideSelection.offerAmount) + '. This will lock negotiation offers and move communication to private chat.'
                            : 'This will lock negotiation offers and move communication to private chat.';
                    }

                    if (selectGuideModalInstance) {
                        selectGuideModalInstance.show();
                    }
                    return;
                }

                const unselectGuideBtn = event.target.closest('[data-unselect-db-guide]');
                if (unselectGuideBtn) {
                    const requestId = String(unselectGuideBtn.dataset.unselectDbGuide || '').trim();
                    if (!requestId) {
                        return;
                    }

                    submitGuideUnselection(requestId).then(function () {
                        showToast('Selected guide removed. Request is open for negotiation again.', 'warning');
                        syncMyRequestsFromApi();
                    }).catch(function (error) {
                        showToast(error && error.message ? error.message : 'Unable to unselect guide right now.', 'danger');
                    });
                    return;
                }

                const deleteBtn = event.target.closest('[data-delete-request]');
                if (deleteBtn) {
                    const card = deleteBtn.closest('[data-request-id]');
                    const requestId = card ? String(card.dataset.requestId || '') : '';
                    if (!requestId || !card || card.dataset.dbRequest !== 'true') {
                        return;
                    }

                    deleteRequest(requestId).then(function () {
                        showToast('Request deleted.', 'warning');
                        syncMyRequestsFromApi();
                    }).catch(function (error) {
                        showToast(error && error.message ? error.message : 'Unable to delete request.', 'danger');
                    });
                }
            });
        }

        if (confirmSelectGuideBtn && selectGuideModal) {
            confirmSelectGuideBtn.addEventListener('click', function () {
                if (!pendingGuideSelection) {
                    return;
                }

                const selection = pendingGuideSelection;
                setButtonLoading(confirmSelectGuideBtn, true);
                submitGuideSelection(selection.requestId, selection.guideId, selection.offerAmount, selection.commentId).then(function (result) {
                    showToast('Guide selected. Booking and private chat created.', 'success');
                    if (selectGuideModalInstance) {
                        selectGuideModalInstance.hide();
                    }
                    const conversationId = result && result.conversationId ? String(result.conversationId) : '';
                    const redirect = result && result.redirect
                        ? String(result.redirect)
                        : '/messages' + (conversationId ? '?conversation=' + encodeURIComponent(conversationId) : '');
                    setTimeout(function () {
                        window.location.href = redirect;
                    }, 320);
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to select guide.', 'danger');
                }).finally(function () {
                    setButtonLoading(confirmSelectGuideBtn, false);
                });
            });

            selectGuideModal.addEventListener('hidden.bs.modal', function () {
                pendingGuideSelection = null;
            });
        }

        subscribeRealtime('guide-request-feed', 'tour-request.updated', function (payload) {
            const updatedRequest = payload && payload.request ? payload.request : null;
            if (!updatedRequest || !updatedRequest.id) {
                return;
            }
            if (!dbRequestMap[String(updatedRequest.id)]) {
                return;
            }
            syncMyRequestsFromApi();
            syncNotificationsFromApi();
        });

        subscribeRealtime('tourist-requests', 'tour-request.updated', function () {
            syncMyRequestsFromApi();
            syncNotificationsFromApi();
        });

        subscribeRealtime('tourist-bookings', 'booking.updated', function () {
            syncMyRequestsFromApi();
            syncNotificationsFromApi();
        });

        window.addEventListener('trbl:guide-profile-updated', function () {
            syncMyRequestsFromApi();
        });

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
                previewLink.setAttribute('href', '/tour-preview?tour=' + encodeURIComponent(tour.id));
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
                    toggleBtn.textContent = box.classList.contains('open') ? 'Hide Comments' : 'View Comments';
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
                    setTimeout(function () {
                        window.location.href = '/messages';
                    }, 300);
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
                    setNegotiationOpenState(requestFromRoute, true);
                    shouldOpenThreadFromRoute = false;
                }
                focusRequestCard(requestFromRoute);
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
        const reviewPrompt = qs('[data-review-prompt]');
        const reviewText = qs('#reviewText');
        const cancelModal = qs('#bookingCancelModal');
        const cancelConfirmBtn = qs('#confirmCancelBookingBtn');
        const receiptModal = qs('#bookingReceiptModal');
        const receiptTourName = qs('#receiptTourName');
        const receiptBookingDate = qs('#receiptBookingDate');
        const receiptGuestCount = qs('#receiptGuestCount');
        const receiptTotalPaid = qs('#receiptTotalPaid');
        const receiptPaymentMethod = qs('#receiptPaymentMethod');
        const receiptReference = qs('#receiptReference');
        const receiptBookingStatus = qs('#receiptBookingStatus');
        const receiptAvailabilityMessage = qs('#receiptAvailabilityMessage');
        const bookingHistory = [];
        let activeTab = 'pending';
        let targetBookingId = null;
        let selectedStars = 0;
        let dbBookings = [];
        let pendingCancelBookingId = null;
        let countdownIntervalId = null;

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

        function mapStateLabel(state) {
            if (state === 'completed') {
                return 'Completed';
            }
            if (state === 'booked') {
                return 'Booked';
            }
            if (state === 'cancelled') {
                return 'Cancelled';
            }
            return 'Pending Confirmation';
        }

        function openPendingReceipt(booking) {
            if (!receiptModal || !booking) {
                return;
            }

            const paymentStatus = String(booking.paymentStatus || '').toLowerCase();
            const isPaid = paymentStatus === 'paid';
            const statusValue = String(booking.state || 'pending').toLowerCase();

            if (receiptTourName) {
                receiptTourName.textContent = booking.tourTitle || 'Tour Booking';
            }
            if (receiptBookingDate) {
                receiptBookingDate.textContent = booking.bookingDate || 'To be confirmed';
            }
            if (receiptGuestCount) {
                receiptGuestCount.textContent = String(booking.guestCount || 1);
            }
            if (receiptTotalPaid) {
                receiptTotalPaid.textContent = formatPeso(isPaid ? booking.total || 0 : 0);
            }
            if (receiptPaymentMethod) {
                receiptPaymentMethod.textContent = booking.paymentMethod || 'N/A';
            }
            if (receiptReference) {
                receiptReference.textContent = booking.paymentReference || booking.reference || 'N/A';
            }
            if (receiptBookingStatus) {
                receiptBookingStatus.textContent = statusValue === 'pending' ? 'Pending' : mapStateLabel(statusValue);
            }

            if (receiptAvailabilityMessage) {
                let helperMessage = '';
                let helperTone = 'alert-info';

                if (statusValue === 'pending') {
                    helperMessage = 'Pending booking. Please wait for the guide to accept it.';
                    helperTone = 'alert-warning';
                } else if (statusValue === 'completed') {
                    helperMessage = 'Booking completed. Your receipt details are final.';
                    helperTone = 'alert-success';
                } else if (statusValue === 'cancelled') {
                    helperMessage = 'This booking was cancelled.';
                    helperTone = 'alert-secondary';
                } else if (!isPaid) {
                    helperMessage = 'Receipt will be available once payment is confirmed.';
                }

                receiptAvailabilityMessage.classList.remove('alert-info', 'alert-warning', 'alert-success', 'alert-secondary');
                receiptAvailabilityMessage.classList.add(helperTone);

                if (!helperMessage) {
                    receiptAvailabilityMessage.style.display = 'none';
                } else {
                    receiptAvailabilityMessage.style.display = '';
                    receiptAvailabilityMessage.textContent = helperMessage;
                }
            }

            bootstrap.Modal.getOrCreateInstance(receiptModal).show();
        }

        function renderDbBookings() {
            if (!grid) {
                return;
            }

            qsa('.booking-card:not([data-db-booking="true"])', grid).forEach(function (node) {
                node.remove();
            });

            qsa('.booking-card[data-db-booking="true"]', grid).forEach(function (node) {
                node.remove();
            });

            dbBookings.forEach(function (booking) {
                const state = String(booking.state || 'pending');
                const rawPaymentStatus = String(booking.paymentStatus || '').toLowerCase();
                const isBookedUnpaid = state === 'booked' && rawPaymentStatus === 'unpaid';
                const paymentMethod = String(booking.paymentMethod || '').trim();
                const reviewSummary = booking.review && typeof booking.review === 'object' ? booking.review : null;
                const hasReview = Boolean(booking.hasReview || reviewSummary);
                const paymentLine = isBookedUnpaid
                    ? '<p class="small text-muted mb-2">Payment: <strong>' + escapeHtml(paymentMethod ? ('via ' + paymentMethod) : 'Via meetup') + '</strong></p>'
                    : '<p class="small text-muted mb-2">Payment: <strong>' + escapeHtml(formatPaymentStatusLabel(booking.paymentStatus)) + '</strong>' + (paymentMethod ? ' via ' + escapeHtml(paymentMethod) : '') + '</p>';
                const card = document.createElement('article');
                card.className = 'booking-card';
                card.dataset.state = state;
                card.dataset.bookingId = String(booking.id || '');
                card.dataset.dbBooking = 'true';
                card.innerHTML = [
                    '<img class="media" src="', escapeHtml(booking.image || 'images/pangasinan.jpg'), '" onerror="this.onerror=null;this.src=\'images/pangasinan.jpg\';" alt="', escapeHtml(booking.tourTitle || 'Tour Booking'), '">',
                    '<div class="booking-body">',
                    '<h2 class="h6">', escapeHtml(booking.tourTitle || 'Tour Booking'), '</h2>',
                    '<div class="d-flex align-items-center gap-2 mb-2">',
                    '<img src="', escapeHtml(booking.guideAvatar || 'images/manila.jpg'), '" onerror="this.onerror=null;this.src=\'images/manila.jpg\';" alt="Guide" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">',
                    '<small>Guide: ', escapeHtml(booking.guideName || 'Guide'), '</small>',
                    '</div>',
                    '<p class="small text-muted mb-2">Booking Date: ', escapeHtml(booking.bookingDate || 'To be confirmed'), '</p>',
                    '<p class="small mb-2">Amount: <strong>', formatPeso(booking.total || 0), '</strong></p>',
                    paymentLine,
                    '<span class="status-pill', state === 'completed' ? ' completed' : '', state === 'cancelled' ? ' cancelled' : '', '">', mapStateLabel(state), '</span>',
                    state === 'pending' && booking.isCancellable
                        ? '<p class="small text-muted mt-2" data-cancel-countdown data-seconds-left="' + escapeHtml(String(booking.cancellationSecondsLeft || 0)) + '">Cancel window: ' + escapeHtml(formatCountdown(booking.cancellationSecondsLeft || 0)) + '</p>'
                        : '',
                    state === 'pending' && !booking.isCancellable
                        ? '<p class="small text-danger mt-2">Cancellation window expired.</p>'
                        : '',
                    state === 'pending'
                        ? '<div class="booking-action-row d-flex flex-column flex-sm-row gap-2 mt-3"><button class="btn-soft flex-fill" type="button" data-view-receipt-booking="' + escapeHtml(String(booking.id || '')) + '"><i class="fa-solid fa-file-invoice me-1"></i>View Receipt</button><button class="btn-danger flex-fill" data-transition-booking="' + escapeHtml(String(booking.id || '')) + '" data-transition-action="cancel"' + (booking.isCancellable ? '' : ' disabled') + '><i class="fa-solid fa-ban me-1"></i>Cancel Booking</button></div>'
                        : '',
                    state === 'booked'
                        ? '<button class="btn-gold w-100 mt-3" data-transition-booking="' + escapeHtml(String(booking.id || '')) + '" data-transition-action="mark_completed"><i class="fa-solid fa-check me-1"></i>Mark Completed</button>'
                        : '',
                    state === 'completed'
                        ? (hasReview
                            ? '<p class="small mt-2 text-muted" data-review-result>Rated ' + escapeHtml(String(Math.max(1, Math.min(5, Number(reviewSummary && reviewSummary.rating ? reviewSummary.rating : 0))))) + '/5' + ((reviewSummary && reviewSummary.comment) ? ' - ' + escapeHtml(String(reviewSummary.comment)) : '') + '</p>'
                            : '<button class="btn-gold w-100 mt-3" type="button" data-rate-booking="' + escapeHtml(String(booking.id || '')) + '"><i class="fa-solid fa-star me-1"></i>Rate & Review</button><p class="small mt-2 text-muted" data-review-result>Awaiting your review</p>')
                        : '',
                    '</div>'
                ].join('');
                grid.prepend(card);
            });

            if (countdownIntervalId) {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
            }
            countdownIntervalId = window.setInterval(refreshCountdowns, 1000);

            renderTab();
        }

        function syncBookingsFromApi() {
            return apiRequest('/tourist/bookings/mine').then(function (data) {
                dbBookings = data && Array.isArray(data.bookings) ? data.bookings : [];
                if (!dbBookings.some(function (item) {
                    return String(item.state || 'pending') === activeTab;
                })) {
                    activeTab = dbBookings.some(function (item) {
                        return String(item.state || 'pending') === 'pending';
                    })
                        ? 'pending'
                        : (dbBookings.some(function (item) {
                            return String(item.state || 'pending') === 'booked';
                        }) ? 'booked' : (dbBookings.some(function (item) {
                            return String(item.state || 'pending') === 'completed';
                        }) ? 'completed' : 'cancelled'));
                    tabButtons.forEach(function (item) {
                        item.classList.toggle('active', item.dataset.tab === activeTab);
                    });
                }
                renderDbBookings();
            }).catch(function () {
                return null;
            });
        }

        function transitionBooking(bookingId, action) {
            return apiRequest('/tourist/bookings/' + encodeURIComponent(String(bookingId)) + '/transition', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ action: action })
            });
        }

        function submitBookingReview(bookingId, payload) {
            return apiRequest('/tourist/bookings/' + encodeURIComponent(String(bookingId)) + '/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload || {})
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

        function refreshCountdowns() {
            qsa('[data-cancel-countdown]', grid).forEach(function (row) {
                const next = Math.max(0, Number(row.dataset.secondsLeft || 0) - 1);
                row.dataset.secondsLeft = String(next);
                row.textContent = next > 0
                    ? 'Cancel window: ' + formatCountdown(next)
                    : 'Cancel window expired';

                if (next <= 0) {
                    const card = row.closest('.booking-card');
                    const cancelBtn = card ? qs('[data-transition-action="cancel"]', card) : null;
                    if (cancelBtn) {
                        cancelBtn.disabled = true;
                    }
                    row.classList.add('text-danger');
                }
            });
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
                const transitionBtn = event.target.closest('[data-transition-booking]');
                if (transitionBtn) {
                    const bookingId = transitionBtn.dataset.transitionBooking;
                    const action = transitionBtn.dataset.transitionAction;
                    if (action === 'cancel' && cancelModal && cancelConfirmBtn) {
                        pendingCancelBookingId = bookingId;
                        bootstrap.Modal.getOrCreateInstance(cancelModal).show();
                        return;
                    }

                    transitionBooking(bookingId, action).then(function () {
                        showToast(action === 'cancel' ? 'Booking canceled.' : 'Booking marked completed.', 'success');
                        syncBookingsFromApi();
                    }).catch(function (error) {
                        showToast(error && error.message ? error.message : 'Unable to update booking.', 'danger');
                    });
                    return;
                }

                const rateBtn = event.target.closest('[data-rate-booking]');
                if (rateBtn && reviewModal) {
                    targetBookingId = rateBtn.dataset.rateBooking;
                    const booking = dbBookings.find(function (entry) {
                        return String(entry && entry.id ? entry.id : '') === String(targetBookingId || '');
                    });
                    selectedStars = 0;
                    if (reviewText) {
                        reviewText.value = '';
                    }
                    if (reviewPrompt) {
                        reviewPrompt.textContent = booking && booking.tourTitle
                            ? 'How was your ' + booking.tourTitle + ' experience?'
                            : 'How was your trip experience?';
                    }
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
                    window.location.href = '/booking/confirmation';
                    return;
                }

                const pendingReceiptBtn = event.target.closest('[data-view-receipt-booking]');
                if (pendingReceiptBtn) {
                    const bookingId = String(pendingReceiptBtn.dataset.viewReceiptBooking || '');
                    const booking = dbBookings.find(function (entry) {
                        return String(entry && entry.id ? entry.id : '') === bookingId;
                    });

                    if (!booking) {
                        showToast('Unable to load receipt for this booking.', 'danger');
                        return;
                    }

                    openPendingReceipt(booking);
                }
            });
        }

        if (cancelConfirmBtn && cancelModal) {
            cancelConfirmBtn.addEventListener('click', function () {
                if (!pendingCancelBookingId) {
                    return;
                }

                const bookingId = pendingCancelBookingId;
                setButtonLoading(cancelConfirmBtn, true);
                transitionBooking(bookingId, 'cancel').then(function () {
                    bootstrap.Modal.getOrCreateInstance(cancelModal).hide();
                    pendingCancelBookingId = null;
                    showToast('Booking canceled.', 'success');
                    syncBookingsFromApi();
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to cancel booking.', 'danger');
                }).finally(function () {
                    setButtonLoading(cancelConfirmBtn, false);
                });
            });

            cancelModal.addEventListener('hidden.bs.modal', function () {
                pendingCancelBookingId = null;
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
                if (!targetBookingId) {
                    showToast('Please select a completed booking first.', 'danger');
                    return;
                }
                const button = qs('button[type="submit"]', reviewForm);
                const comment = String(reviewText ? reviewText.value : '').trim();
                setButtonLoading(button, true);
                submitBookingReview(targetBookingId, {
                    rating: selectedStars,
                    comment: comment,
                    is_public: true
                }).then(function (data) {
                    if (data && data.booking) {
                        const payload = data.booking;
                        dbBookings = dbBookings.map(function (entry) {
                            return String(entry && entry.id ? entry.id : '') === String(payload.id || '')
                                ? payload
                                : entry;
                        });
                        renderDbBookings();
                    } else {
                        syncBookingsFromApi();
                    }
                    bootstrap.Modal.getOrCreateInstance(reviewModal).hide();
                    syncGuideTourCatalogFromApi();
                    showToast('Review submitted successfully.', 'success');
                    targetBookingId = null;
                    selectedStars = 0;
                }).finally(function () {
                    setButtonLoading(button, false);
                    reviewForm.reset();
                    qsa('[data-review-star]').forEach(function (item) {
                        item.classList.remove('text-warning');
                    });
                });
            });
        }

        syncBookingsFromApi();
        subscribeRealtime('tourist-bookings', 'booking.updated', function () {
            syncBookingsFromApi();
            syncNotificationsFromApi();
        });
        window.addEventListener('trbl:guide-profile-updated', function () {
            syncBookingsFromApi();
        });
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

        function syncLikeCatalogFromApi() {
            return apiRequest('/tourist/tours/feed').then(function (data) {
                const tours = data && Array.isArray(data.tours) ? data.tours : [];
                upsertGuideTourCatalogEntries(tours.map(function (tour) {
                    return Object.assign({}, tour, {
                        id: String(tour.id || ''),
                    });
                }));
                return tours;
            }).catch(function () {
                return [];
            });
        }

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
                window.location.href = '/booking/details?tour=' + encodeURIComponent(quickBook.dataset.quickBook);
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

        window.addEventListener('trbl:guide-profile-updated', function () {
            syncLikeCatalogFromApi().then(function () {
                render();
            });
        });

        Promise.allSettled([syncLikesFromApi(), syncLikeCatalogFromApi()]).finally(function () {
            render();
        });
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

    function formatPaymentStatusLabel(status) {
        const value = String(status || 'unpaid').trim().toLowerCase();
        if (value === 'paid') {
            return 'Paid';
        }
        if (value === 'partial') {
            return 'Partially Paid';
        }
        if (value === 'refunded') {
            return 'Refunded';
        }
        return 'Unpaid';
    }

    function formatCountdown(seconds) {
        const total = Math.max(0, Number(seconds || 0));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const secs = Math.floor(total % 60);

        if (hours > 0) {
            return hours + 'h ' + String(minutes).padStart(2, '0') + 'm';
        }
        return minutes + 'm ' + String(secs).padStart(2, '0') + 's';
    }

    function normalizeTourLookupKey(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/&amp;/g, '&')
            .replace(/[^a-z0-9\s&-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function createBookingFromDraft(draft, tour) {
        const source = draft && typeof draft === 'object' ? draft : {};
        const listingId = String(source.tourListingId || (tour && tour.id) || '').trim();
        const normalizedDraftTitle = String((tour && tour.title) || source.title || '').trim().toLowerCase();
        const normalizedDraftLocation = String((tour && tour.location) || source.location || '').trim().toLowerCase();
        const legacyKey = String(
            source.tourLegacyKey
            || source.tourSlug
            || (source.tourId && !/^\d+$/.test(String(source.tourId)) ? source.tourId : '')
            || (tour && (tour.legacyKey || tour.slug || (!/^\d+$/.test(String(tour.id || '')) ? tour.id : '')))
            || ''
        ).trim().toLowerCase();

        const resolveListingId = function () {
            if (/^\d+$/.test(listingId)) {
                return Promise.resolve(Number(listingId));
            }

            return apiRequest('/tourist/tours/feed').then(function (data) {
                const tours = data && Array.isArray(data.tours) ? data.tours : [];
                const match = tours.find(function (item) {
                    const itemId = String(item && item.id ? item.id : '').trim().toLowerCase();
                    const slug = String(item && item.slug ? item.slug : '').trim().toLowerCase();
                    const itemLegacy = String(item && item.legacyKey ? item.legacyKey : '').trim().toLowerCase();
                    if (legacyKey && (legacyKey === itemId || legacyKey === slug || legacyKey === itemLegacy)) {
                        return true;
                    }

                    const title = String(item && item.title ? item.title : '').trim().toLowerCase();
                    const location = String(item && item.location ? item.location : '').trim().toLowerCase();
                    if (!title || !normalizedDraftTitle || title !== normalizedDraftTitle) {
                        return false;
                    }

                    if (!normalizedDraftLocation || !location) {
                        return true;
                    }

                    return location === normalizedDraftLocation
                        || location.indexOf(normalizedDraftLocation) !== -1
                        || normalizedDraftLocation.indexOf(location) !== -1;
                });

                if (!match || !/^\d+$/.test(String(match.id || ''))) {
                    throw new Error('This listing is unavailable for direct booking. Please select a published guide listing.');
                }

                return Number(match.id);
            });
        };

        const paymentMethod = String(source.paymentMethod || '').trim();
        const paymentStatus = paymentMethod === 'Pay on meetup' || paymentMethod === 'Pay at tour location'
            ? 'unpaid'
            : 'paid';
        return resolveListingId().then(function (resolvedListingId) {
            const payload = {
                tour_listing_id: resolvedListingId,
                booked_for_date: source.date || null,
                booked_for_time: source.time || null,
                guest_count: Math.max(1, Number(source.guests || 1)),
                notes: source.traveler && source.traveler.notes ? String(source.traveler.notes) : null,
                payment_method: paymentMethod || null,
                payment_status: paymentStatus,
                payment_reference: source.reference || null,
                client_token: source.bookingToken || null,
            };

            return apiRequest('/tourist/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });
        });
    }

    function getTourById(id) {
        const fallback = TOUR_CATALOG.bohol;
        const guideTours = getGuideToursCatalog();
        const key = String(id || '').trim();
        let picked = TOUR_CATALOG[key] || guideTours[key] || null;

        if (!picked && key) {
            const lowered = key.toLowerCase();
            picked = Object.values(guideTours).find(function (item) {
                if (!item || typeof item !== 'object') {
                    return false;
                }
                const slug = String(item.slug || '').trim().toLowerCase();
                const legacy = String(item.legacyKey || '').trim().toLowerCase();
                return lowered === slug || lowered === legacy;
            }) || null;
        }

        picked = picked || fallback;
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

        qsa('a[href^="/tour-preview?tour="]').forEach(function (link) {
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
        const reviewListHost = qs('#tourPreviewReviewList');
        const reviewEmpty = qs('#tourPreviewReviewEmpty');
        const similarListHost = qs('#tourPreviewSimilarList');
        const similarEmpty = qs('#tourPreviewSimilarEmpty');
        const guestInput = qs('#previewGuests');
        const dateInput = qs('#previewDate');
        const timeInput = qs('#previewTime');
        const checkBtn = qs('#previewCheckAvailability');
        const bookNowBtn = qs('#previewBookNow');
        const bookNowHint = qs('#previewBookNowHint');
        const likeBtn = qs('#previewLikeBtn');
        const manualApproval = String(tour.reservationType || '').toLowerCase() === 'manual approval';
        const availabilitySessionKey = 'tribaltours_availability_checked_' + String(tour.id || '');
        const routeTourRef = String(params.get('tour') || '').trim().toLowerCase();
        const currentTourId = String(tour.id || '').trim().toLowerCase();
        const currentTourSlug = String(tour.slug || '').trim().toLowerCase();
        const currentTourLegacy = String(tour.legacyKey || '').trim().toLowerCase();
        const currentTourTitle = normalizeTourLookupKey(tour.title || '');
        const currentTourLocation = normalizeTourLookupKey(tour.location || '');
        const currentTourRegion = resolveRequestRegionKey(String(tour.region || '') + ' ' + String(tour.location || ''));
        const currentTourPrice = Number(tour.price || 0);
        const currentTourTagSet = new Set((Array.isArray(tour.tags) ? tour.tags : []).map(function (tag) {
            return String(tag || '').trim().toLowerCase();
        }).filter(Boolean));
        let similarFeedRows = [];

        const hasCheckedAvailability = function () {
            return sessionStorage.getItem(availabilitySessionKey) === '1';
        };

        const markCheckedAvailability = function () {
            sessionStorage.setItem(availabilitySessionKey, '1');
        };

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const minFutureDate = new Date(todayDate.getTime() + (24 * 60 * 60 * 1000));
        const minFutureDateIso = minFutureDate.toISOString().split('T')[0];
        const today = todayDate.toISOString().split('T')[0];
        if (dateInput) {
            dateInput.min = minFutureDateIso;
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

        const renderTourReviews = function (items) {
            if (!reviewListHost) {
                return;
            }

            const reviews = Array.isArray(items) ? items : [];
            reviewListHost.innerHTML = '';
            if (!reviews.length) {
                if (reviewEmpty) {
                    reviewEmpty.style.display = '';
                }
                return;
            }

            if (reviewEmpty) {
                reviewEmpty.style.display = 'none';
            }

            reviews.forEach(function (item) {
                const name = String((item && (item.touristName || item.reviewer)) || 'Tourist').trim() || 'Tourist';
                const rating = Math.max(1, Math.min(5, Number(item && item.rating ? item.rating : 0)));
                const title = String(item && item.title ? item.title : '').trim();
                const comment = String(item && item.comment ? item.comment : '').trim();
                const row = document.createElement('article');
                row.className = 'settings-card dashboard-review-card';
                row.innerHTML = [
                    '<p class="small mb-1"><strong>', escapeHtml(name), '</strong> • ', '★'.repeat(rating), '</p>',
                    title ? '<p class="small text-muted mb-1">' + escapeHtml(title) + '</p>' : '',
                    comment ? '<p class="small text-muted mb-0">' + escapeHtml(comment) + '</p>' : '<p class="small text-muted mb-0">No written comment provided.</p>'
                ].join('');
                reviewListHost.appendChild(row);
            });
        };

        const normalizeSimilarTour = function (item) {
            const raw = item && typeof item === 'object' ? item : {};
            const rawId = String(raw.id || '').trim();
            const rawSlug = String(raw.slug || '').trim();
            const rawLegacy = String(raw.legacyKey || '').trim();

            let base = null;
            if (rawId) {
                base = getTourById(rawId);
            }
            if (!base && rawSlug) {
                base = getTourById(rawSlug);
            }
            if (!base && rawLegacy) {
                base = getTourById(rawLegacy);
            }
            base = base && typeof base === 'object' ? base : {};

            const tags = (Array.isArray(raw.tags) ? raw.tags : (Array.isArray(base.tags) ? base.tags : []))
                .map(function (tag) {
                    return String(tag || '').trim();
                })
                .filter(Boolean)
                .slice(0, 6);

            return {
                id: rawId || String(base.id || rawSlug || rawLegacy || '').trim(),
                slug: rawSlug || String(base.slug || '').trim(),
                legacyKey: rawLegacy || String(base.legacyKey || '').trim(),
                title: String(raw.title || base.title || 'Tour listing').trim(),
                location: String(raw.location || base.location || 'Philippines').trim(),
                rating: Math.max(0, Math.min(5, Number(raw.rating || base.rating || 0))),
                reviews: Math.max(0, Math.round(Number(raw.reviews || base.reviews || 0))),
                duration: String(raw.duration || raw.durationHours || base.duration || base.durationHours || 'Flexible').trim(),
                pax: String(raw.pax || base.pax || '1-10 pax').trim(),
                price: Math.max(0, Number(raw.price || base.price || 0)),
                image: normalizeTourAssetPath(raw.image || raw.coverImage || base.image || 'images/pangasinan.jpg'),
                tags: tags,
                latest: Number(raw.latest || base.latest || Date.now()),
                regionText: String(raw.region || base.region || '').trim()
            };
        };

        const isCurrentTourEntry = function (entry) {
            const target = entry && typeof entry === 'object' ? entry : {};
            const id = String(target.id || '').trim().toLowerCase();
            const slug = String(target.slug || '').trim().toLowerCase();
            const legacy = String(target.legacyKey || '').trim().toLowerCase();

            if (routeTourRef && (routeTourRef === id || routeTourRef === slug || routeTourRef === legacy)) {
                return true;
            }
            if (currentTourId && currentTourId === id) {
                return true;
            }
            if (currentTourSlug && currentTourSlug === slug) {
                return true;
            }
            if (currentTourLegacy && currentTourLegacy === legacy) {
                return true;
            }

            const title = normalizeTourLookupKey(target.title || '');
            const location = normalizeTourLookupKey(target.location || '');
            if (title && currentTourTitle && title === currentTourTitle) {
                if (!location || !currentTourLocation) {
                    return true;
                }
                return location === currentTourLocation
                    || location.indexOf(currentTourLocation) !== -1
                    || currentTourLocation.indexOf(location) !== -1;
            }

            return false;
        };

        const computeSimilarityScore = function (entry) {
            const region = resolveRequestRegionKey(String(entry.regionText || '') + ' ' + String(entry.location || ''));
            const tagOverlap = (Array.isArray(entry.tags) ? entry.tags : []).reduce(function (sum, tag) {
                const key = String(tag || '').trim().toLowerCase();
                return currentTourTagSet.has(key) ? sum + 1 : sum;
            }, 0);
            const priceDelta = Math.abs(Number(entry.price || 0) - currentTourPrice);

            let score = 0;
            if (region === currentTourRegion) {
                score += 90;
            }
            score += tagOverlap * 24;
            score += Math.min(Number(entry.rating || 0) * 2, 10);
            score += Math.min(Number(entry.reviews || 0) / 40, 10);
            score -= Math.min(priceDelta / 120, 35);
            return score;
        };

        const renderSimilarTours = function () {
            if (!similarListHost) {
                return;
            }

            const sourceRows = [];
            if (Array.isArray(similarFeedRows)) {
                sourceRows.push.apply(sourceRows, similarFeedRows);
            }

            Object.keys(TOUR_CATALOG).forEach(function (key) {
                sourceRows.push(Object.assign({
                    id: key,
                    legacyKey: key,
                }, TOUR_CATALOG[key] || {}));
            });

            const guideCatalog = getGuideToursCatalog();
            Object.keys(guideCatalog).forEach(function (key) {
                sourceRows.push(Object.assign({
                    id: key,
                }, guideCatalog[key] || {}));
            });

            const seen = Object.create(null);
            const candidates = sourceRows.map(normalizeSimilarTour).filter(function (entry) {
                const key = String(
                    entry.id
                    || entry.slug
                    || entry.legacyKey
                    || normalizeTourLookupKey(String(entry.title || '') + ' ' + String(entry.location || ''))
                ).trim().toLowerCase();

                if (!key || seen[key] || isCurrentTourEntry(entry)) {
                    return false;
                }

                seen[key] = true;
                return true;
            });

            const ranked = candidates.sort(function (a, b) {
                const scoreDiff = computeSimilarityScore(b) - computeSimilarityScore(a);
                if (scoreDiff !== 0) {
                    return scoreDiff;
                }
                return Number(b.latest || 0) - Number(a.latest || 0);
            }).slice(0, 4);

            similarListHost.innerHTML = '';
            if (!ranked.length) {
                if (similarEmpty) {
                    similarEmpty.style.display = '';
                }
                return;
            }

            if (similarEmpty) {
                similarEmpty.style.display = 'none';
            }

            ranked.forEach(function (entry) {
                const tourRef = String(entry.id || entry.slug || entry.legacyKey || '').trim();
                if (!tourRef) {
                    return;
                }

                const card = document.createElement('article');
                card.className = 'tour-preview-similar-card';
                card.innerHTML = [
                    '<a class="tour-preview-similar-card__media" href="/tour-preview?tour=', encodeURIComponent(tourRef), '">',
                    '<img src="', escapeHtml(entry.image || 'images/pangasinan.jpg'), '" alt="', escapeHtml(entry.title || 'Tour listing'), '">',
                    '</a>',
                    '<div class="tour-preview-similar-card__body">',
                    '<p class="tour-preview-similar-card__location">', escapeHtml(entry.location || 'Philippines'), '</p>',
                    '<h3 class="tour-preview-similar-card__title"><a href="/tour-preview?tour=', encodeURIComponent(tourRef), '">', escapeHtml(entry.title || 'Tour listing'), '</a></h3>',
                    '<p class="tour-preview-similar-card__meta">', Number(entry.rating || 0).toFixed(2), ' (', String(entry.reviews || 0), ') • ', escapeHtml(entry.duration || 'Flexible'), ' • ', escapeHtml(entry.pax || '1-10 pax'), '</p>',
                    '<div class="tour-preview-similar-card__footer">',
                    '<strong>', formatPeso(entry.price), '</strong>',
                    '<a href="/tour-preview?tour=', encodeURIComponent(tourRef), '" class="btn-soft py-1 px-2">View Tour</a>',
                    '</div>',
                    '</div>'
                ].join('');
                similarListHost.appendChild(card);
            });
        };

        const syncSimilarToursFromApi = function () {
            return apiRequest('/tourist/tours/feed').then(function (data) {
                const tours = data && Array.isArray(data.tours) ? data.tours : [];
                similarFeedRows = tours.slice();
                upsertGuideTourCatalogEntries(tours.map(function (item) {
                    return Object.assign({}, item, {
                        id: String(item && item.id ? item.id : ''),
                    });
                }));
                renderSimilarTours();
                return tours;
            }).catch(function () {
                renderSimilarTours();
                return [];
            });
        };

        const setBookNowState = function (enabled, message) {
            if (!bookNowBtn) {
                return;
            }

            const hintMessage = String(message || (enabled
                ? 'Slot available! You can now proceed to Book Now.'
                : 'Please check availability first'));

            bookNowBtn.disabled = !enabled;
            bookNowBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
            bookNowBtn.title = enabled ? '' : hintMessage;

            if (bookNowHint) {
                bookNowHint.textContent = hintMessage;
                bookNowHint.classList.toggle('text-muted', !enabled);
                bookNowHint.classList.toggle('text-success', enabled);
            }
        };

        const invalidateAvailability = function () {
            setBookNowState(false, 'Please check availability first');
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
        renderTourReviews(tour.recentReviews || []);
        renderSimilarTours();
        const guidePhoto = qs('[data-tour-guide-photo]');
        if (guidePhoto) {
            guidePhoto.src = tour.guideAvatar || tour.guidePhoto || 'images/manila.jpg';
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
            const options = ['<option value="">Select guests</option>'];
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
            const timeOptions = ['<option value="">Select time slot</option>'].concat(slots.map(function (slot) {
                return '<option value="' + escapeHtml(slot) + '">' + escapeHtml(slot) + '</option>';
            }));
            setHtml('#previewTime', timeOptions.join(''));
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
            if (hasCheckedAvailability()) {
                setBookNowState(true, 'Availability checked. You can continue to Book Now.');
            } else {
                invalidateAvailability();
            }
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', function () {
                const selectedGuests = guestInput ? String(guestInput.value || '').trim() : '';
                const selectedDate = dateInput ? String(dateInput.value || '').trim() : '';
                const selectedTime = timeInput ? String(timeInput.value || '').trim() : '';

                if (!selectedGuests || !selectedDate || !selectedTime) {
                    showToast('Please select guests, date, and time before checking availability.', 'warning');
                    invalidateAvailability();
                    return;
                }

                if (selectedDate <= today) {
                    showToast('Please select a valid future date.', 'warning');
                    invalidateAvailability();
                    return;
                }

                const listingId = /^\d+$/.test(String(tour.id || '')) ? Number(tour.id) : null;
                if (!listingId) {
                    setBookNowState(false, 'Please check availability first');
                    showToast('Selected slot is not available. Please choose another date/time.', 'danger');
                    return;
                }

                const guests = Number(selectedGuests);
                const draft = {
                    tourId: tour.id,
                    tourListingId: /^\d+$/.test(String(tour.id || '')) ? String(tour.id) : null,
                    tourSlug: String(tour.slug || (!/^\d+$/.test(String(tour.id || '')) ? tour.id : '') || ''),
                    title: tour.title,
                    location: tour.location,
                    guests: guests,
                    date: selectedDate,
                    time: selectedTime,
                    total: calculateBookingTotal(tour, guests)
                };

                setBookingDraft(draft);
                markCheckedAvailability();
                setBookNowState(true, 'Availability checked. Redirecting to Booking Details...');
                window.location.href = '/booking/details?tour=' + encodeURIComponent(tour.id);
            });
        }

        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', function () {
                if (!hasCheckedAvailability() || bookNowBtn.disabled) {
                    showToast('Please check availability first.', 'warning');
                    return;
                }

                const selectedGuests = guestInput ? String(guestInput.value || '').trim() : '';
                const selectedDate = dateInput ? String(dateInput.value || '').trim() : '';
                const selectedTime = timeInput ? String(timeInput.value || '').trim() : '';
                if (!selectedGuests || !selectedDate || !selectedTime) {
                    showToast('Please select guests, date, and time before checking availability.', 'warning');
                    invalidateAvailability();
                    return;
                }

                const guests = Number(selectedGuests) || 1;
                const draft = {
                    tourId: tour.id,
                    tourListingId: /^\d+$/.test(String(tour.id || '')) ? String(tour.id) : null,
                    tourSlug: String(tour.slug || (!/^\d+$/.test(String(tour.id || '')) ? tour.id : '') || ''),
                    title: tour.title,
                    location: tour.location,
                    guests: guests,
                    date: selectedDate,
                    time: selectedTime,
                    total: calculateBookingTotal(tour, guests)
                };
                setBookingDraft(draft);
                window.location.href = '/booking/details?tour=' + encodeURIComponent(tour.id);
            });
        }

        (function syncPreviewTourDetails() {
            const routeTour = String(params.get('tour') || '').trim();
            const knownId = String(tour.id || '').trim();

            const resolveListingId = function () {
                if (/^\d+$/.test(routeTour)) {
                    return Promise.resolve(routeTour);
                }
                if (/^\d+$/.test(knownId)) {
                    return Promise.resolve(knownId);
                }

                return apiRequest('/tourist/tours/feed').then(function (data) {
                    const tours = data && Array.isArray(data.tours) ? data.tours : [];
                    const loweredRoute = routeTour.toLowerCase();
                    const match = tours.find(function (item) {
                        const id = String(item && item.id ? item.id : '').toLowerCase();
                        const slug = String(item && item.slug ? item.slug : '').toLowerCase();
                        const legacy = String(item && item.legacyKey ? item.legacyKey : '').toLowerCase();
                        return loweredRoute && (loweredRoute === id || loweredRoute === slug || loweredRoute === legacy);
                    });
                    return match && /^\d+$/.test(String(match.id || '')) ? String(match.id) : null;
                }).catch(function () {
                    return null;
                });
            };

            resolveListingId().then(function (resolvedId) {
                if (!resolvedId) {
                    return;
                }
                return apiRequest('/tourist/tours/feed/' + encodeURIComponent(resolvedId)).then(function (data) {
                    const liveTour = data && data.tour ? data.tour : null;
                    if (!liveTour) {
                        return;
                    }
                    setText('[data-tour-rating]', Number(liveTour.rating || 0).toFixed(2));
                    setText('[data-tour-reviews]', String(Math.max(0, Number(liveTour.reviews || 0))));
                    renderTourReviews(liveTour.recentReviews || []);
                }).catch(function () {
                    return null;
                });
            });
        })();

        syncSimilarToursFromApi();
        window.setInterval(syncSimilarToursFromApi, 30000);
        subscribeRealtime('tour-listings', 'tour-listing.updated', function (payload) {
            const liveTour = payload && payload.tour ? payload.tour : null;
            if (!liveTour || !liveTour.id) {
                return;
            }

            const liveId = String(liveTour.id);
            const remove = String(liveTour.action || '').toLowerCase() === 'deleted'
                || liveTour.isActive === false
                || String(liveTour.status || '').toLowerCase() !== 'published';
            const index = similarFeedRows.findIndex(function (entry) {
                return String(entry && entry.id ? entry.id : '') === liveId;
            });

            if (remove) {
                if (index >= 0) {
                    similarFeedRows.splice(index, 1);
                }
                renderSimilarTours();
                return;
            }

            if (index >= 0) {
                similarFeedRows[index] = Object.assign({}, similarFeedRows[index], liveTour, {
                    id: liveId,
                });
            } else {
                similarFeedRows.unshift(Object.assign({}, liveTour, {
                    id: liveId,
                }));
            }

            upsertGuideTourCatalogEntries([Object.assign({}, liveTour, {
                id: liveId,
            })]);
            renderSimilarTours();

            if (isCurrentTourEntry(liveTour)) {
                setText('[data-tour-rating]', Number(liveTour.rating || 0).toFixed(2));
                setText('[data-tour-reviews]', String(Math.max(0, Number(liveTour.reviews || 0))));
                renderTourReviews(liveTour.recentReviews || []);
            }
        });
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

        setBookingDraft(Object.assign({}, stored, {
            tourId: tour.id,
            tourListingId: /^\d+$/.test(String(tour.id || '')) ? String(tour.id) : (stored.tourListingId || null),
            tourSlug: String(tour.slug || stored.tourSlug || (!/^\d+$/.test(String(tour.id || '')) ? tour.id : '') || ''),
            title: tour.title,
            location: tour.location
        }));
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
                    window.location.href = '/booking/payment-method?tour=' + encodeURIComponent(tour.id);
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
            window.location.href = '/explore';
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
                    tourListingId: /^\d+$/.test(String(tour.id || '')) ? String(tour.id) : null,
                    tourSlug: String(tour.slug || draft.tourSlug || (!/^\d+$/.test(String(tour.id || '')) ? tour.id : '') || ''),
                    title: tour.title,
                    location: tour.location,
                    paymentMethod: selected,
                    bookingToken: bookingToken,
                    paymentStatus: 'pending'
                }));
                window.location.href = '/booking/payment-processing';
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
            window.location.href = '/booking/payment-method';
            return;
        }
        if (draft.reference && draft.paymentStatus === 'paid') {
            window.location.href = '/booking/confirmation';
            return;
        }

        const tour = getTourById(draft.tourId);
        const bookingToken = draft.bookingToken || ('bk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7));
        if (!draft.bookingToken) {
            setBookingDraft(Object.assign({}, draft, { bookingToken: bookingToken }));
        }

        localStorage.setItem(BOOKING_PROCESSING_LOCK_KEY, JSON.stringify({
            token: bookingToken,
            startedAt: Date.now()
        }));

        const progressBar = qs('#processingProgress');
        const statusLabel = qs('#processingStatus');
        const retryBtn = qs('#processingRetry');
        const params = new URLSearchParams(window.location.search);
        const shouldFail = params.get('status') === 'fail';
        let progress = 8;
        let running = true;
        let persisted = false;

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
                if (statusLabel) {
                    statusLabel.textContent = 'Finalizing booking in database...';
                }

                const latestDraft = getBookingDraft() || draft;
                createBookingFromDraft(Object.assign({}, latestDraft, {
                    bookingToken: bookingToken
                }), tour).then(function (data) {
                    const booking = data && data.booking ? data.booking : null;
                    if (!booking || !booking.id) {
                        throw new Error('Booking was processed but no booking record was returned.');
                    }

                    const complete = Object.assign({}, latestDraft, {
                        bookingToken: bookingToken,
                        bookingId: booking.id,
                        reference: booking.reference || latestDraft.reference,
                        bookedAt: booking.createdAt || new Date().toISOString(),
                        paymentStatus: booking.paymentStatus || latestDraft.paymentStatus || 'paid',
                        paymentMethod: booking.paymentMethod || latestDraft.paymentMethod || '',
                        tourListingId: booking.tourId || latestDraft.tourListingId || latestDraft.tourId
                    });
                    setBookingDraft(complete);
                    persisted = true;
                    localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                    setTimeout(function () {
                        window.location.href = '/booking/confirmation';
                    }, 500);
                }).catch(function (error) {
                    localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                    if (statusLabel) {
                        statusLabel.textContent = error && error.message
                            ? error.message
                            : 'Unable to save booking right now. Please retry payment processing.';
                        statusLabel.classList.add('text-danger');
                    }
                    if (retryBtn) {
                        retryBtn.textContent = 'Retry Save';
                    }
                    showToast(error && error.message ? error.message : 'Unable to save booking.', 'danger');
                });
            }
        }, 420);

        if (retryBtn) {
            retryBtn.addEventListener('click', function () {
                if (!running && shouldFail) {
                    localStorage.removeItem(BOOKING_PROCESSING_LOCK_KEY);
                    window.location.href = '/booking/payment-method';
                    return;
                }
                if (!running) {
                    if (persisted) {
                        window.location.href = '/booking/confirmation';
                        return;
                    }
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
            window.location.href = '/explore';
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

        const searchInput = qs('.conversation-search input');
        let conversations = [];
        let messagesByConversation = {};
        let active = null;

        function dedupeConversationsByGuide(items) {
            const source = Array.isArray(items) ? items : [];
            const seen = new Map();

            source.forEach(function (conversation) {
                if (!conversation || typeof conversation !== 'object') {
                    return;
                }

                const key = String(conversation.guideId || '').trim() || ('name:' + String(conversation.name || '').trim().toLowerCase());
                if (!key) {
                    return;
                }

                const existing = seen.get(key);
                if (!existing) {
                    seen.set(key, conversation);
                    return;
                }

                const existingTime = Date.parse(String(existing.time || '')) || 0;
                const currentTime = Date.parse(String(conversation.time || '')) || 0;
                if (currentTime >= existingTime) {
                    seen.set(key, conversation);
                }
            });

            return Array.from(seen.values()).sort(function (left, right) {
                const leftTime = Date.parse(String((left && left.time) || '')) || 0;
                const rightTime = Date.parse(String((right && right.time) || '')) || 0;
                return rightTime - leftTime;
            });
        }

        function normalizeConversation(item) {
            const source = item && typeof item === 'object' ? item : {};
            return {
                id: String(source.id || uid('conversation')),
                guideId: source.guideId ? String(source.guideId) : '',
                name: String(source.name || 'Guide'),
                avatar: normalizeGuideAssetPath(source.avatar || 'images/manila.jpg'),
                last: String(source.last || ''),
                time: String(source.time || nowISO()),
                unread: Number(source.unread || 0),
                tourRequestId: source.tourRequestId ? String(source.tourRequestId) : ''
            };
        }

        function normalizeMessage(item) {
            const source = item && typeof item === 'object' ? item : {};
            return {
                id: String(source.id || uid('msg')),
                mine: Boolean(source.mine),
                text: String(source.text || source.body || ''),
                senderId: String(source.senderId || ''),
                senderAvatar: normalizeGuideAssetPath(source.senderAvatar || 'images/manila.jpg'),
                isRead: Boolean(source.isRead),
                createdAt: String(source.createdAt || nowISO())
            };
        }

        function findMineAvatar(conversationId) {
            const key = String(conversationId || '');
            const messages = messagesByConversation[key] || [];
            for (let index = messages.length - 1; index >= 0; index -= 1) {
                const message = messages[index];
                if (message && message.mine && message.senderAvatar) {
                    return message.senderAvatar;
                }
            }

            return normalizeGuideAssetPath('images/manila.jpg');
        }

        function formatShortTime(value) {
            if (!value) {
                return '';
            }
            const dt = new Date(value);
            if (Number.isNaN(dt.getTime())) {
                return String(value);
            }
            const now = new Date();
            const sameDay = dt.toDateString() === now.toDateString();
            return sameDay
                ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        function syncThreads() {
            return apiRequest('/tourist/messages/threads').then(function (data) {
                const incoming = data && Array.isArray(data.conversations) ? data.conversations : [];
                conversations = dedupeConversationsByGuide(incoming.map(normalizeConversation));
                if (!active) {
                    active = conversations.find(function (conversation) {
                        return String(conversation.id) === String(convoFromRoute || '');
                    }) || conversations[0] || null;
                } else {
                    const match = conversations.find(function (conversation) {
                        return String(conversation.id) === String(active.id)
                            || (conversation.guideId && active.guideId && String(conversation.guideId) === String(active.guideId));
                    });
                    if (match) {
                        active = match;
                    }
                }

                renderList();
                if (active) {
                    loadConversation(active.id);
                } else {
                    chatTitle.textContent = 'No conversations yet';
                    chatMessages.innerHTML = '<div class="small text-muted p-3">Start by selecting a guide from My Posts.</div>';
                }
            }).catch(function () {
                chatTitle.textContent = 'Messages unavailable';
                chatMessages.innerHTML = '<div class="small text-muted p-3">Unable to load messages right now.</div>';
            });
        }

        function loadConversation(conversationId) {
            return apiRequest('/tourist/messages/threads/' + encodeURIComponent(String(conversationId))).then(function (data) {
                const conversation = data && data.conversation ? normalizeConversation(data.conversation) : null;
                const messages = data && Array.isArray(data.messages) ? data.messages.map(normalizeMessage) : [];
                if (!conversation) {
                    return;
                }

                messagesByConversation[String(conversation.id)] = messages;
                const idx = conversations.findIndex(function (item) {
                    return String(item.id) === String(conversation.id)
                        || (item.guideId && conversation.guideId && String(item.guideId) === String(conversation.guideId));
                });
                if (idx >= 0) {
                    conversations[idx] = Object.assign({}, conversations[idx], conversation, { unread: 0 });
                } else {
                    conversations.unshift(conversation);
                    conversations = dedupeConversationsByGuide(conversations);
                }
                active = Object.assign({}, conversation, { unread: 0 });
                renderList();
                renderConversation();
            }).catch(function () {
                return null;
            });
        }

        function renderList() {
            const query = String(searchInput ? searchInput.value : '').trim().toLowerCase();
            list.innerHTML = '';
            conversations.forEach(function (conversation) {
                const haystack = String((conversation.name || '') + ' ' + (conversation.last || '')).toLowerCase();
                if (query && haystack.indexOf(query) === -1) {
                    return;
                }
                const row = document.createElement('div');
                row.className = 'conversation-item' + (active && String(conversation.id) === String(active.id) ? ' active' : '');
                row.dataset.id = conversation.id;
                row.innerHTML = [
                    '<img class="conversation-avatar" src="', escapeHtml(normalizeGuideAssetPath(conversation.avatar || 'images/manila.jpg')), '" alt="', escapeHtml(conversation.name || 'Guide'), '">',
                    '<div class="flex-grow-1">',
                    '<div class="d-flex justify-content-between"><strong>', escapeHtml(conversation.name || 'Guide'), '</strong><small class="text-muted">', escapeHtml(formatShortTime(conversation.time)), '</small></div>',
                    '<div class="small text-muted text-truncate" style="max-width:180px;">', escapeHtml(conversation.last || ''), '</div>',
                    '</div>',
                    Number(conversation.unread || 0) > 0 ? '<span class="badge rounded-pill text-bg-warning">' + String(conversation.unread) + '</span>' : ''
                ].join('');
                list.appendChild(row);
            });
        }

        function renderConversation() {
            if (!active) {
                chatTitle.textContent = 'Select a conversation';
                chatMessages.innerHTML = '';
                return;
            }

            chatTitle.textContent = active.name || 'Guide';
            chatMessages.innerHTML = '';
            const messages = messagesByConversation[String(active.id)] || [];
            const lastMine = messages.slice().reverse().find(function (message) {
                return message.mine;
            });
            const lastMineId = lastMine ? String(lastMine.id) : '';
            messages.forEach(function (message) {
                const row = document.createElement('div');
                row.className = 'msg-row' + (message.mine ? ' mine' : '');

                const meta = [formatShortTime(message.createdAt)].filter(Boolean);
                if (message.mine && String(message.id) === lastMineId) {
                    meta.push(message.isRead ? 'Read' : 'Delivered');
                }

                const avatar = normalizeGuideAssetPath(
                    message.senderAvatar || (message.mine ? findMineAvatar(active.id) : active.avatar || 'images/manila.jpg')
                );

                row.innerHTML = [
                    message.mine
                        ? '<div class="msg-content"><div class="msg-bubble">' + escapeHtml(message.text || '') + '</div><div class="msg-meta">' + escapeHtml(meta.join(' • ')) + '</div></div><img class="msg-avatar" src="' + escapeHtml(avatar) + '" alt="You">'
                        : '<img class="msg-avatar" src="' + escapeHtml(avatar) + '" alt="' + escapeHtml(active.name || 'Guide') + '"><div class="msg-content"><div class="msg-bubble">' + escapeHtml(message.text || '') + '</div><div class="msg-meta">' + escapeHtml(meta.join(' • ')) + '</div></div>'
                ].join('');
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
                return String(conversation.id) === String(row.dataset.id);
            });
            if (!found) {
                return;
            }
            active = found;
            renderList();
            loadConversation(active.id);
        });

        chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!active) {
                return;
            }
            const text = chatInput.value.trim();
            if (!text) {
                return;
            }

            const activeKey = String(active.id);
            const draftMessage = {
                id: 'draft-' + Date.now(),
                mine: true,
                text: text,
                senderAvatar: findMineAvatar(activeKey),
                isRead: false,
                createdAt: new Date().toISOString()
            };

            const current = messagesByConversation[activeKey] || [];
            messagesByConversation[activeKey] = current.concat([draftMessage]);
            active.last = text;
            active.time = draftMessage.createdAt;
            chatInput.value = '';
            renderConversation();
            renderList();

            apiRequest('/tourist/messages/threads/' + encodeURIComponent(activeKey), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ body: text })
            }).then(function (data) {
                const sentMessage = data && data.message ? normalizeMessage(data.message) : null;
                if (!sentMessage) {
                    return;
                }
                const updatedList = messagesByConversation[activeKey] || [];
                messagesByConversation[activeKey] = updatedList.filter(function (message) {
                    return !String(message.id || '').startsWith('draft-');
                }).concat([sentMessage]);
                active.last = sentMessage.text || text;
                active.time = sentMessage.createdAt || new Date().toISOString();
                renderConversation();
                syncThreads();
            }).catch(function () {
                showToast('Unable to send message.', 'danger');
                syncThreads();
            });
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

        if (searchInput) {
            searchInput.addEventListener('input', debounce(renderList, 180));
        }

        subscribeRealtime('tourist-messages', 'message.sent', function (payload) {
            const incoming = payload && payload.message ? payload.message : null;
            if (!incoming || !incoming.conversationId) {
                return;
            }

            const key = String(incoming.conversationId);
            const current = messagesByConversation[key] || [];
            const exists = current.some(function (item) {
                return String(item.id) === String(incoming.id);
            });
            if (!exists) {
                const thread = conversations.find(function (conversation) {
                    return String(conversation.id) === key;
                });
                const mine = thread && thread.guideId
                    ? String(thread.guideId) !== String(incoming.senderId || '')
                    : false;
                current.push({
                    id: incoming.id,
                    mine: mine,
                    text: incoming.body || '',
                    senderId: incoming.senderId,
                    senderAvatar: normalizeGuideAssetPath(incoming.senderAvatar || 'images/manila.jpg'),
                    isRead: Boolean(incoming.isRead),
                    createdAt: incoming.createdAt
                });
                messagesByConversation[key] = current;
            }

            syncThreads().then(function () {
                if (active && String(active.id) === key) {
                    loadConversation(key);
                    if (typing) {
                        typing.style.display = 'none';
                    }
                }
                syncNotificationsFromApi();
            });
        });

        window.addEventListener('trbl:guide-profile-updated', function () {
            syncThreads().then(function () {
                if (active && active.id) {
                    loadConversation(active.id);
                }
            });
        });

        syncThreads();
    }

    function initProfilePage() {
        const avatarInput = qs('#avatarInput');
        const avatarPreview = qs('#avatarPreview');
        const profileForm = qs('#profileForm');
        const nameInput = qs('#nameInput');
        const emailInput = qs('#emailInput');
        const phoneInput = qs('#phoneInput');
        const bioInput = qs('#bioInput');
        const passwordForm = qs('#passwordForm');
        const prefsForm = qs('#prefsForm');
        const oldPass = qs('#oldPass');
        const newPass = qs('#newPass');
        const confirmPass = qs('#confirmPass');
        const notif1 = qs('#notif1');
        const notif2 = qs('#notif2');
        const notif3 = qs('#notif3');
        const params = new URLSearchParams(window.location.search);
        const sectionFromRoute = params.get('section');

        function applyAccountData(snapshot) {
            const account = snapshot && snapshot.account ? snapshot.account : {};
            const preferences = snapshot && snapshot.preferences ? snapshot.preferences : {};

            if (nameInput) {
                nameInput.value = account.name || '';
            }
            if (emailInput) {
                emailInput.value = account.email || '';
            }
            if (phoneInput) {
                phoneInput.value = account.phone || '';
            }
            if (bioInput) {
                bioInput.value = account.bio || '';
            }
            if (avatarPreview && account.avatar) {
                avatarPreview.src = account.avatar;
            }

            const selectedInterests = Array.isArray(preferences.interests) ? preferences.interests.map(function (item) {
                return String(item || '').trim().toLowerCase();
            }) : [];

            qsa('input[name="interest_preferences[]"]', prefsForm || document).forEach(function (checkbox) {
                const value = String(checkbox.value || '').trim().toLowerCase();
                checkbox.checked = selectedInterests.includes(value);
            });

            if (notif1) {
                notif1.checked = Boolean(preferences.notify_booking_updates);
            }
            if (notif2) {
                notif2.checked = Boolean(preferences.notify_messages);
            }
            if (notif3) {
                notif3.checked = Boolean(preferences.notify_weekly_suggestions);
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
                    avatarPreview.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        qsa('[data-toggle-password]').forEach(function (toggleButton) {
            toggleButton.addEventListener('click', function () {
                const targetSelector = toggleButton.dataset.togglePassword || '';
                const targetInput = qs(targetSelector);
                if (!targetInput) {
                    return;
                }
                const nextType = targetInput.type === 'password' ? 'text' : 'password';
                targetInput.type = nextType;
                const icon = qs('i', toggleButton);
                if (icon) {
                    icon.classList.toggle('fa-eye', nextType === 'password');
                    icon.classList.toggle('fa-eye-slash', nextType === 'text');
                }
            });
        });

        if (profileForm) {
            profileForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', profileForm);
                setButtonLoading(button, true);

                const formData = new FormData();
                formData.append('name', nameInput ? nameInput.value.trim() : '');
                formData.append('email', emailInput ? emailInput.value.trim() : '');
                formData.append('phone', phoneInput ? phoneInput.value.trim() : '');
                formData.append('bio', bioInput ? bioInput.value.trim() : '');
                if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                    formData.append('avatar', avatarInput.files[0]);
                }

                apiRequest('/tourist/account/profile', {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: formData
                }).then(function (data) {
                    const next = Object.assign({}, getCachedAccountData() || {}, {
                        account: data && data.account ? data.account : {},
                    });
                    setCachedAccountData(next);
                    applyAccountData(next);
                    if (avatarInput) {
                        avatarInput.value = '';
                    }
                    showToast('Profile updated successfully.', 'success');
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to update profile.', 'danger');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const currentPassword = oldPass ? oldPass.value : '';
                const nextPassword = newPass ? newPass.value : '';
                const confirmPassword = confirmPass ? confirmPass.value : '';

                if (nextPassword.length < 8) {
                    showToast('New password must be at least 8 characters.', 'warning');
                    return;
                }
                if (nextPassword !== confirmPassword) {
                    showToast('Password confirmation does not match.', 'warning');
                    return;
                }

                const button = qs('button[type="submit"]', passwordForm);
                setButtonLoading(button, true);

                apiRequest('/tourist/account/password', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        password: nextPassword,
                        password_confirmation: confirmPassword
                    })
                }).then(function () {
                    passwordForm.reset();
                    showToast('Password updated successfully.', 'success');
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to update password.', 'danger');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }

        if (prefsForm) {
            prefsForm.addEventListener('submit', function (event) {
                event.preventDefault();

                const selectedInterests = qsa('input[name="interest_preferences[]"]:checked', prefsForm).map(function (item) {
                    return String(item.value || '').trim();
                }).filter(Boolean);

                const button = qs('button[type="submit"]', prefsForm);
                setButtonLoading(button, true);

                apiRequest('/tourist/account/preferences', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({
                        interests: selectedInterests,
                        notify_booking_updates: Boolean(notif1 && notif1.checked),
                        notify_messages: Boolean(notif2 && notif2.checked),
                        notify_weekly_suggestions: Boolean(notif3 && notif3.checked)
                    })
                }).then(function (data) {
                    const next = Object.assign({}, getCachedAccountData() || {}, {
                        preferences: data && data.preferences ? data.preferences : {},
                    });
                    setCachedAccountData(next);
                    showToast('Preferences saved successfully.', 'success');
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to save preferences.', 'danger');
                }).finally(function () {
                    setButtonLoading(button, false);
                });
            });
        }

        const cached = getCachedAccountData();
        if (cached) {
            applyAccountData(cached);
        }
        syncAccountFromApi().then(function (data) {
            applyAccountData(data || {});
        }).catch(function () {
            return null;
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
        const accountName = qs('#accountNameValue');
        const accountEmail = qs('#accountEmailValue');
        const accountRole = qs('#accountRoleValue');
        const accountJoinedDate = qs('#accountJoinedDateValue');
        const accountStatus = qs('#accountStatusValue');
        const emailNotificationsToggle = qs('#settingEmailNotifications');
        const privateProfileToggle = qs('#settingPrivateProfile');

        function applyAccountInfo(data) {
            const account = data && data.account ? data.account : null;
            const settings = data && data.settings ? data.settings : null;
            if (!account) {
                return;
            }

            if (accountName) {
                accountName.textContent = account.name || 'Tourist';
            }
            if (accountEmail) {
                accountEmail.textContent = account.email || '-';
            }
            if (accountRole) {
                accountRole.textContent = account.role || 'tourist';
            }
            if (accountJoinedDate) {
                accountJoinedDate.textContent = account.joinedDate || '-';
            }
            if (accountStatus) {
                accountStatus.textContent = account.status || 'Active';
                accountStatus.classList.toggle('text-success', String(account.status || '').toLowerCase() === 'active');
            }

            if (settings) {
                if (emailNotificationsToggle) {
                    emailNotificationsToggle.checked = Boolean(settings.email_notifications);
                }
                if (privateProfileToggle) {
                    privateProfileToggle.checked = Boolean(settings.private_profile);
                }
            }
        }

        function refreshAccountInfo() {
            return syncAccountFromApi().then(function (data) {
                applyAccountInfo(data || {});
            }).catch(function () {
                return null;
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const button = qs('button[type="submit"]', form);
                setButtonLoading(button, true);
                apiRequest('/tourist/account/settings', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({
                        email_notifications: Boolean(emailNotificationsToggle && emailNotificationsToggle.checked),
                        private_profile: Boolean(privateProfileToggle && privateProfileToggle.checked)
                    })
                }).then(function (data) {
                    const next = Object.assign({}, getCachedAccountData() || {}, {
                        settings: data && data.settings ? data.settings : {},
                    });
                    setCachedAccountData(next);
                    showToast('Settings saved.', 'success');
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to save settings.', 'danger');
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

        const cached = getCachedAccountData();
        if (cached) {
            applyAccountInfo(cached);
        }
        refreshAccountInfo();
        window.setInterval(refreshAccountInfo, 30000);
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
                const next = params.get('next') || '/explore';
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
            logout.addEventListener('click', function (event) {
                event.preventDefault();
                logoutToAuthPage();
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
                window.location.href = '/explore';
            });
        });
    }

    function init() {
        if (document.body.dataset.page === 'login') {
            window.location.href = '/';
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
        syncNotificationsFromApi();
        syncGuideTourCatalogFromApi();
        bindLikeButtons();
        updateSavedCounters();
        initGlobalActions();

        subscribeRealtime('guide-profiles', 'guide-profile.updated', function (payload) {
            syncGuideTourCatalogFromApi().then(function () {
                syncExploreCardsWithCatalog();
            });
            dispatchGuideProfileUpdatedEvent(payload || {});
            syncNotificationsFromApi();
        });

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

        window.setInterval(syncNotificationsFromApi, 30000);
        window.setInterval(syncGuideTourCatalogFromApi, 90000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
