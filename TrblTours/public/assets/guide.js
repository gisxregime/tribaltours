(function () {
    const GUIDE_TOURS_KEY = 'tribaltours_guide_tours_v1';
    const GUIDE_BOOKINGS_KEY = 'tribaltours_guide_booking_requests_v1';
    const GUIDE_REVIEWS_KEY = 'tribaltours_guide_reviews_v1';
    const GUIDE_PROFILE_KEY = 'tribaltours_guide_profile_v1';
    const GUIDE_NOTIFICATIONS_KEY = 'tribaltours_guide_notifications_v1';
    const GUIDE_CONVERSATIONS_KEY = 'tribaltours_guide_conversations_v1';
    const GUIDE_TOUR_DRAFT_KEY = 'tribaltours_guide_tour_form_draft_v1';
    const TOURIST_REQUESTS_KEY = 'tribaltours_tourist_requests_v1';
    const CHAT_PAYMENT_STATE_KEY = 'tribaltours_chat_payment_state_v1';
    const CHAT_PAYMENT_TRANSACTIONS_KEY = 'tribaltours_chat_payment_transactions_v1';
    const CHAT_SIMULATED_EVENTS_KEY = 'tribaltours_chat_simulated_events_v1';
    const ROLE_KEY = 'role';
    const STARTER_MESSAGE = "Hi! 👋 Welcome and thank you for choosing me as your guide. I'm excited to help make your trip enjoyable and memorable. Feel free to tell me your preferred destination, travel dates, group size, interests (adventure, culture, food, nature, etc.), or any questions you have. I'll help you plan the experience that fits you best.";
    const PENDING_NOTIFICATION_DELETE_DELAY = 4200;

    const pendingGuideNotificationDeletes = Object.create(null);
    let guideToursState = null;
    let profileRealtimeBound = false;

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function closestFromEventTarget(event, selector) {
        const target = event ? event.target : null;
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

    function normalizeAssetPath(path, fallback) {
        const value = String(path || '').trim();
        const defaultValue = String(fallback || '/images/manila.jpg').trim() || '/images/manila.jpg';
        if (!value) {
            return defaultValue;
        }
        if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
            return value;
        }
        if (value.startsWith('../')) {
            return '/' + value.replace(/^\.\.\//, '');
        }
        if (value.startsWith('images/') || value.startsWith('storage/')) {
            return '/' + value;
        }
        return '/storage/' + value.replace(/^\/+/, '');
    }

    function formatMessageTime(value) {
        const raw = String(value || '').trim();
        if (!raw) {
            return '';
        }

        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) {
            return raw;
        }

        return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatPeso(value) {
        return '₱' + Number(value || 0).toLocaleString('en-PH');
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
        const file = path || '/guide/dashboard';
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
            const redirectedPath = response.redirected
                ? String(new URL(response.url, window.location.origin).pathname || '')
                : '';
            const redirectedToAuth = /\/(sign-in|login)\b/i.test(redirectedPath);

            if (response.status === 401 || response.status === 419 || redirectedToAuth) {
                redirectToSignInIfRequired();
                const authError = new Error('Authentication required.');
                authError.code = 'auth';
                throw authError;
            }

            if (response.redirected) {
                throw new Error('Unexpected redirect response from server.');
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

    function loadRealtimeLibrary() {
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
        const pusherConfig = window.TRBL_PUSHER || {};
        if (!pusherConfig.key || !channelName || !eventName || typeof handler !== 'function') {
            return;
        }

        loadRealtimeLibrary().then(function () {
            if (!window.Pusher) {
                return;
            }

            if (!window.__trblGuidePusher) {
                window.__trblGuidePusher = new window.Pusher(pusherConfig.key, {
                    cluster: pusherConfig.cluster || 'ap1',
                    forceTLS: true
                });
            }

            const channels = window.__trblGuidePusherChannels || (window.__trblGuidePusherChannels = {});
            const channel = channels[channelName] || window.__trblGuidePusher.subscribe(channelName);
            channels[channelName] = channel;
            channel.bind(eventName, handler);
        }).catch(function () {
            return null;
        });
    }

    function mapGuideTourToApiPayload(tour) {
        const normalized = normalizeGuideTour(tour || {});
        const toFlag = function (value) {
            return Boolean(value);
        };

        return {
            title: normalized.title,
            short_description: normalized.description,
            description: normalized.description,
            category: normalized.category,
            province: normalized.province,
            city: normalized.city,
            meetingArea: normalized.meetingArea,
            meetingPoint: normalized.meetingPoint,
            duration: normalized.duration,
            minGuests: normalized.minGuests,
            maxGuests: normalized.maxGuests,
            price: normalized.price,
            priceType: normalized.priceType,
            reservationType: normalized.reservationType,
            time_slots_json: normalized.timeSlots,
            freeCancellation: toFlag(normalized.freeCancellation),
            reserveNowPayLater: toFlag(normalized.reserveNowPayLater),
            languages: normalized.languages,
            includes: normalized.includes,
            excludes: normalized.excludes,
            requirements: normalized.requirements,
            safetyInfo: normalized.safetyInfo,
            difficulty: normalized.difficulty,
            tags: normalized.tags,
            weatherSuitability: normalized.weatherSuitability,
            bestSeason: normalized.bestSeason,
            childFriendly: toFlag(normalized.childFriendly),
            petFriendly: toFlag(normalized.petFriendly),
            rating: normalized.rating,
            reviews: normalized.reviews,
            status: normalized.status,
            cover_image_path: normalized.coverImage || normalized.image,
            coverImage: normalized.coverImage || normalized.image,
            gallery_paths: normalized.gallery,
            gallery: normalized.gallery
        };
    }

    function mapApiListingToGuideTour(listing) {
        return normalizeGuideTour({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            province: listing.province,
            city: listing.city,
            meetingArea: listing.meetingArea,
            location: listing.location,
            duration: listing.duration,
            minGuests: listing.minGuests,
            maxGuests: listing.maxGuests,
            pax: String(listing.minGuests || 1) + '-' + String(listing.maxGuests || 10) + ' guests',
            difficulty: listing.difficulty,
            rating: listing.rating,
            reviews: listing.reviews,
            price: listing.price,
            priceType: listing.priceType,
            reservationType: listing.reservationType,
            status: String(listing.status || '').toLowerCase() === 'published' ? 'Published' : 'Draft',
            provider: listing.provider,
            languages: listing.languages,
            meetingPoint: listing.meetingPoint,
            freeCancellation: listing.freeCancellation,
            reserveNowPayLater: listing.reserveNowPayLater,
            includes: listing.includes,
            excludes: listing.excludes,
            requirements: listing.requirements,
            safetyInfo: listing.safetyInfo,
            tags: listing.tags,
            weatherSuitability: listing.weatherSuitability,
            bestSeason: listing.bestSeason,
            childFriendly: listing.childFriendly,
            petFriendly: listing.petFriendly,
            image: listing.image,
            coverImage: listing.coverImage,
            gallery: listing.gallery,
            guideAvatar: listing.guideAvatar,
            guidePhoto: listing.guideAvatar
        });
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
        const timeSlots = parseList(raw.timeSlots || raw.time_slots_json, ['08:00 AM', '01:00 PM', '05:00 PM']);
        const includes = parseList(raw.includes, ['Boat transfer', 'Entrance fees']);
        const rawGallery = Array.isArray(raw.gallery)
            ? raw.gallery
            : (Array.isArray(raw.gallery_paths) ? raw.gallery_paths : []);
        const gallery = rawGallery
            .map(function (src) {
                return String(src || '').trim();
            }).filter(Boolean).slice(0, 10)
        ;
        const fallbackImage = normalizeAssetPath(raw.coverImage || raw.cover_image_path || raw.image || gallery[0], '/images/carousel2.jpg');
        const finalGallery = gallery.length
            ? gallery.map(function (src) {
                return normalizeAssetPath(src, fallbackImage);
            })
            : [fallbackImage];

        return {
            id: String(raw.id || uid('guide-tour')),
            title: String(raw.title || '').trim(),
            category: String(raw.category || 'Island Hopping').trim(),
            province: String(raw.province || '').trim(),
            city: String(raw.city || '').trim(),
            meetingArea: String(raw.meetingArea || raw.meeting_area || '').trim(),
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
            meetingPoint: String(raw.meetingPoint || 'Main tourist pickup point').trim() || 'Main tourist pickup point',
            freeCancellation: parseBool(raw.freeCancellation != null ? raw.freeCancellation : raw.free_cancellation, true),
            cancellationText: String(raw.cancellationText || 'Cancel up to 24 hours in advance for a full refund').trim(),
            reserveNowPayLater: parseBool(raw.reserveNowPayLater != null ? raw.reserveNowPayLater : raw.reserve_now_pay_later, true),
            includes: includes,
            excludes: String(raw.excludes || '').trim(),
            requirements: String(raw.requirements || '').trim(),
            safetyInfo: String(raw.safetyInfo || raw.safety_info || '').trim(),
            guidePhoto: normalizeAssetPath(raw.guidePhoto || raw.guideAvatar || profile.avatar, '/images/manila.jpg'),
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
            image: normalizeAssetPath(finalGallery[0], '/images/carousel2.jpg'),
            coverImage: normalizeAssetPath(finalGallery[0], '/images/carousel2.jpg'),
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
            avatar: '/images/manila.jpg'
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
        if (Array.isArray(guideToursState)) {
            return guideToursState.map(normalizeGuideTour);
        }

        const tours = readStore(GUIDE_TOURS_KEY, []);
        const normalized = Array.isArray(tours) ? tours.map(normalizeGuideTour) : [];
        guideToursState = normalized;
        return normalized.slice();
    }

    function setGuideTours(tours) {
        const list = Array.isArray(tours) ? tours.map(normalizeGuideTour) : [];
        guideToursState = list;
        try {
            writeStore(GUIDE_TOURS_KEY, list);
        } catch (_error) {
            // Keep runtime state even if persistent storage quota is exceeded.
        }
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

    function normalizeGuideNotification(item) {
        const payload = item && typeof item === 'object' ? item : {};
        return {
            id: String(payload.id || uid('guide-notif')),
            type: String(payload.type || 'general'),
            text: String(payload.text || 'New notification.'),
            fullText: String(payload.fullText || payload.text || 'New notification.'),
            actorName: String(payload.actorName || ''),
            actorAvatar: String(payload.actorAvatar || ''),
            actionText: String(payload.actionText || ''),
            targetTitle: String(payload.targetTitle || ''),
            time: String(payload.time || ''),
            createdAt: String(payload.createdAt || nowISO()),
            read: Boolean(payload.read),
            payload: payload.payload && typeof payload.payload === 'object' ? payload.payload : {}
        };
    }

    function syncGuideNotificationsFromApi() {
        return apiRequest('/notifications').then(function (data) {
            if (data && data.pusher && !window.TRBL_PUSHER) {
                window.TRBL_PUSHER = data.pusher;
            }

            if (!data || !Array.isArray(data.items)) {
                return [];
            }

            const items = data.items.map(normalizeGuideNotification);
            setGuideNotifications(items);
            renderGuideNotifications();
            return items;
        }).catch(function () {
            return [];
        });
    }

    function markGuideNotificationRead(notificationId) {
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

    function markAllGuideNotificationsRead() {
        return apiRequest('/notifications/mark-all-read', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
    }

    function deleteGuideNotification(notificationId) {
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

    function clearAllGuideNotifications() {
        return apiRequest('/notifications/clear-all', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
    }

    function getConversations() {
        const conversations = readStore(GUIDE_CONVERSATIONS_KEY, []);
        return Array.isArray(conversations) ? conversations : [];
    }

    function setConversations(conversations) {
        writeStore(GUIDE_CONVERSATIONS_KEY, Array.isArray(conversations) ? conversations : []);
    }

    function getChatPaymentStateMap() {
        const parsed = readStore(CHAT_PAYMENT_STATE_KEY, {});
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {};
        }
        return parsed;
    }

    function setChatPaymentStateMap(nextState) {
        const safe = nextState && typeof nextState === 'object' && !Array.isArray(nextState)
            ? nextState
            : {};
        writeStore(CHAT_PAYMENT_STATE_KEY, safe);
    }

    function getConversationPaymentState(conversationId) {
        const key = String(conversationId || '').trim();
        if (!key) {
            return null;
        }
        const map = getChatPaymentStateMap();
        const record = map[key];
        return record && typeof record === 'object' ? record : null;
    }

    function saveConversationPaymentState(conversationId, patch) {
        const key = String(conversationId || '').trim();
        if (!key) {
            return null;
        }

        const map = getChatPaymentStateMap();
        const current = map[key] && typeof map[key] === 'object' ? map[key] : {};
        map[key] = Object.assign({}, current, patch || {}, {
            conversationId: key,
            updatedAt: nowISO(),
        });
        setChatPaymentStateMap(map);
        return map[key];
    }

    function getSimulatedPaymentTransactions() {
        const parsed = readStore(CHAT_PAYMENT_TRANSACTIONS_KEY, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    function setSimulatedPaymentTransactions(list) {
        const safeList = Array.isArray(list) ? list : [];
        writeStore(CHAT_PAYMENT_TRANSACTIONS_KEY, safeList.slice(0, 300));
    }

    function upsertSimulatedPaymentTransaction(record) {
        if (!record || typeof record !== 'object') {
            return;
        }

        const transactions = getSimulatedPaymentTransactions();
        const conversationId = String(record.conversationId || '').trim();
        const requestId = String(record.requestId || '').trim();
        const index = transactions.findIndex(function (item) {
            if (!item || typeof item !== 'object') {
                return false;
            }
            if (conversationId && String(item.conversationId || '') === conversationId) {
                return true;
            }
            if (requestId && String(item.requestId || '') === requestId) {
                return true;
            }
            return false;
        });

        const normalized = Object.assign({}, record, {
            id: String(record.id || uid('sim-txn')),
            amount: Math.max(0, Number(record.amount || 0)),
            conversationId: conversationId,
            requestId: requestId,
            updatedAt: nowISO(),
            createdAt: String(record.createdAt || nowISO())
        });

        if (index >= 0) {
            transactions[index] = Object.assign({}, transactions[index], normalized);
        } else {
            transactions.unshift(normalized);
        }

        setSimulatedPaymentTransactions(transactions);
    }

    function getSimulatedChatEvents() {
        const parsed = readStore(CHAT_SIMULATED_EVENTS_KEY, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    function setSimulatedChatEvents(list) {
        const safe = Array.isArray(list) ? list : [];
        writeStore(CHAT_SIMULATED_EVENTS_KEY, safe.slice(-400));
    }

    function addSimulatedChatEvent(eventPayload) {
        if (!eventPayload || typeof eventPayload !== 'object') {
            return null;
        }

        const event = Object.assign({}, eventPayload, {
            id: String(eventPayload.id || uid('sim-msg')),
            conversationId: String(eventPayload.conversationId || ''),
            text: String(eventPayload.text || '').trim(),
            authorRole: String(eventPayload.authorRole || 'system').trim().toLowerCase() || 'system',
            createdAt: String(eventPayload.createdAt || nowISO()),
        });

        if (!event.conversationId || !event.text) {
            return null;
        }

        const events = getSimulatedChatEvents();
        const exists = events.some(function (item) {
            return item && String(item.id || '') === event.id;
        });
        if (!exists) {
            events.push(event);
            setSimulatedChatEvents(events);
        }
        return event;
    }

    function getSimulatedChatEventsByConversation(conversationId) {
        const key = String(conversationId || '').trim();
        if (!key) {
            return [];
        }

        return getSimulatedChatEvents()
            .filter(function (item) {
                return item && String(item.conversationId || '') === key;
            })
            .sort(function (a, b) {
                const left = Date.parse(String((a && a.createdAt) || '')) || 0;
                const right = Date.parse(String((b && b.createdAt) || '')) || 0;
                return left - right;
            });
    }

    function formatSimulatedPeso(value) {
        return '₱' + Number(value || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function sanitizePaymentCopy(value) {
        return String(value || '')
            .replace(/\s*\(simulated\)/ig, '')
            .replace(/\bsimulated\b/ig, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function getGuideProfile() {
        return readStore(GUIDE_PROFILE_KEY, {});
    }

    function applyGuideWorkspaceIdentity(profile) {
        const source = profile && typeof profile === 'object' ? profile : getGuideProfile();
        const normalized = normalizeGuideProfileSnapshot(source);
        const avatarUrl = normalizeAssetPath(normalized.avatar, '/images/manila.jpg');
        const displayName = String(normalized.name || 'Tour Guide').trim() || 'Tour Guide';

        qsa('[data-guide-earnings-avatar]').forEach(function (node) {
            node.src = avatarUrl;
            node.alt = displayName + ' profile photo';
        });

        qsa('[data-guide-earnings-name]').forEach(function (node) {
            node.textContent = displayName;
        });
    }

    function syncGuideProfileIntoTours(profile) {
        const normalized = normalizeGuideProfileSnapshot(profile);
        const avatarUrl = normalizeAssetPath(normalized.avatar, '/images/manila.jpg');
        const providerName = String(normalized.name || '').trim();
        const tours = getGuideTours();
        if (!tours.length) {
            return;
        }

        let changed = false;
        const updated = tours.map(function (tour) {
            const next = Object.assign({}, tour);
            if (String(next.guideAvatar || '').trim() !== avatarUrl) {
                next.guideAvatar = avatarUrl;
                changed = true;
            }
            if (String(next.guidePhoto || '').trim() !== avatarUrl) {
                next.guidePhoto = avatarUrl;
                changed = true;
            }
            if (providerName && String(next.provider || '').trim() !== providerName) {
                next.provider = providerName;
                changed = true;
            }
            return next;
        });

        if (changed) {
            setGuideTours(updated);
        }
    }

    function setGuideProfile(profile) {
        const safeProfile = profile && typeof profile === 'object' ? profile : {};
        const normalized = normalizeGuideProfileSnapshot(safeProfile);
        writeStore(GUIDE_PROFILE_KEY, normalized);
        applyGuideWorkspaceIdentity(normalized);
        syncGuideProfileIntoTours(normalized);
    }

    function normalizeGuideProfileSnapshot(payload) {
        const source = payload && typeof payload === 'object' ? payload : {};
        const fallback = defaultProfile();

        return {
            id: String(source.id || ''),
            name: String(source.name || fallback.name),
            location: String(source.location || fallback.location),
            bio: String(source.bio || fallback.bio),
            phone: String(source.phone || fallback.phone),
            email: String(source.email || fallback.email),
            specialties: String(source.specialties || fallback.specialties),
            languages: String(source.languages || fallback.languages),
            certifications: String(source.certifications || fallback.certifications),
            social: String(source.social || fallback.social),
            avatar: normalizeAssetPath(source.avatar || fallback.avatar, '/images/manila.jpg'),
            yearsOfExperience: Number(source.yearsOfExperience || 0)
        };
    }

    function syncGuideProfileFromApi() {
        return apiRequest('/guide/account/profile').then(function (data) {
            const profilePayload = data && data.profile ? data.profile : {};
            if (data && data.pusher && !window.TRBL_PUSHER) {
                window.TRBL_PUSHER = data.pusher;
            }
            const normalized = normalizeGuideProfileSnapshot(profilePayload);
            setGuideProfile(normalized);
            return normalized;
        }).catch(function () {
            const fallback = normalizeGuideProfileSnapshot(getGuideProfile());
            applyGuideWorkspaceIdentity(fallback);
            return fallback;
        });
    }

    function updateGuideProfileInApi(formData) {
        return apiRequest('/guide/account/profile', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: formData
        }).then(function (data) {
            const profilePayload = data && data.profile ? data.profile : {};
            const normalized = normalizeGuideProfileSnapshot(profilePayload);
            setGuideProfile(normalized);
            return normalized;
        });
    }

    function initProfileRealtimeSync() {
        if (profileRealtimeBound) {
            return;
        }

        const bindChannels = function () {
            if (profileRealtimeBound) {
                return;
            }

            profileRealtimeBound = true;

            subscribeRealtime('guide-profiles', 'guide-profile.updated', function (payload) {
                const incoming = normalizeGuideProfileSnapshot(payload && payload.guide ? payload.guide : payload);
                const current = normalizeGuideProfileSnapshot(getGuideProfile());
                const currentGuideId = String(current.id || '').trim();
                const incomingGuideId = String(incoming.id || '').trim();

                if (currentGuideId && incomingGuideId && currentGuideId !== incomingGuideId) {
                    return;
                }

                setGuideProfile(incoming);
                syncGuideNotificationsFromApi();
            });

            subscribeRealtime('tourist-profiles', 'tourist-profile.updated', function () {
                syncGuideNotificationsFromApi();
            });
        };

        if (window.TRBL_PUSHER && window.TRBL_PUSHER.key) {
            bindChannels();
            return;
        }

        syncGuideNotificationsFromApi().finally(function () {
            if (window.TRBL_PUSHER && window.TRBL_PUSHER.key) {
                bindChannels();
            }
        });
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
            if (String(button.getAttribute('data-bs-toggle') || '').toLowerCase() === 'dropdown') {
                return;
            }

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
        if (notification.type === 'guide-selected' || notification.type === 'guide.selected') {
            return '/guide/messages?conversation=' + encodeURIComponent(payload.conversationId || '') + '&starter=1';
        }
        if (notification.type === 'message.received') {
            return '/guide/messages?conversation=' + encodeURIComponent(payload.conversationId || '');
        }
        if (
            notification.type === 'booking-request'
            || notification.type === 'booking.requested'
            || notification.type === 'booking.submitted'
            || notification.type === 'booking.updated'
            || notification.type === 'booking.accepted'
            || notification.type === 'booking.rejected'
            || notification.type === 'booking.cancelled'
            || notification.type === 'booking.completed'
        ) {
            return '/guide/booking-requests';
        }
        if (notification.type === 'tour-request.created' || notification.type === 'tour-request.updated') {
            return '/guide/request-post-feed';
        }
        return '/guide/dashboard';
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

        function buildNotificationText(item) {
            const actorName = String(item.actorName || '').trim();
            const actionText = String(item.actionText || '').trim();
            const targetTitle = String(item.targetTitle || '').trim();
            const fullText = String(item.fullText || item.text || '').trim();
            if (fullText) {
                return fullText;
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

        list.forEach(function (item) {
            const id = String(item.id || '');
            const actorName = String(item.actorName || 'System').trim() || 'System';
            const avatar = normalizeAssetPath(
                item.actorAvatar
                || (item.payload && (item.payload.actorAvatar || item.payload.senderAvatar || item.payload.avatar))
                || '/images/manila.jpg',
                '/images/manila.jpg'
            );
            const time = item.time || relativeTime(item.createdAt);

            const row = document.createElement('div');
            row.className = 'notification-entry' + (item.read ? '' : ' unread');
            row.dataset.notificationId = id;
            row.innerHTML = [
                '<span class="notification-entry__dot"', (item.read ? ' hidden' : ''), '></span>',
                '<img class="notification-entry__avatar" src="', escapeHtml(avatar), '" alt="', escapeHtml(actorName), ' avatar">',
                '<button type="button" class="notification-entry__main" data-notification-open="', escapeHtml(id), '">',
                '<span class="notification-entry__text">', escapeHtml(buildNotificationText(item)), '</span>',
                '<small class="notification-entry__time">', escapeHtml(time), '</small>',
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

            const listHost = qs('#guideNotificationList', menu);
            if (listHost) {
                listHost.classList.add('notification-dropdown-list');
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
                markAllGuideNotificationsRead().then(function () {
                    return syncGuideNotificationsFromApi();
                }).catch(function () {
                    const updated = getGuideNotifications().map(function (item) {
                        return Object.assign({}, item, { read: true });
                    });
                    setGuideNotifications(updated);
                    renderGuideNotifications();
                });
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
                clearAllGuideNotifications().catch(function () {
                    setGuideNotifications(current);
                    renderGuideNotifications();
                    showToast('Unable to clear notifications right now.', 'danger');
                });
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
                        deleteGuideNotification(deleteId).catch(function () {
                            const restored = getGuideNotifications();
                            const insertAt = Math.min(deleteIndex, restored.length);
                            restored.splice(insertAt, 0, removedItem);
                            setGuideNotifications(restored);
                            renderGuideNotifications();
                            showToast('Unable to delete notification right now.', 'danger');
                        }).finally(function () {
                            delete pendingGuideNotificationDeletes[deleteId];
                        });
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
                markGuideNotificationRead(id).catch(function () {
                    return null;
                });
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
        syncGuideNotificationsFromApi();
    }

    function closeDropdownByButtonId(buttonId) {
        const trigger = qs('#' + String(buttonId || ''));
        if (!trigger || !window.bootstrap || !window.bootstrap.Dropdown) {
            return;
        }

        const instance = window.bootstrap.Dropdown.getInstance(trigger) || window.bootstrap.Dropdown.getOrCreateInstance(trigger);
        instance.hide();
    }

    function closeContainingDropdown(element) {
        const target = element && element.closest ? element.closest('.dropdown') : null;
        const trigger = target ? qs('[data-bs-toggle="dropdown"]', target) : null;
        if (!trigger || !window.bootstrap || !window.bootstrap.Dropdown) {
            return;
        }

        const instance = window.bootstrap.Dropdown.getInstance(trigger) || window.bootstrap.Dropdown.getOrCreateInstance(trigger);
        instance.hide();
    }

    function dismissAllOpenDropdowns() {
        qsa('[data-bs-toggle="dropdown"][aria-expanded="true"]').forEach(function (trigger) {
            if (window.bootstrap && window.bootstrap.Dropdown) {
                const instance = window.bootstrap.Dropdown.getInstance(trigger);
                if (instance) {
                    instance.hide();
                    return;
                }
            }
            trigger.setAttribute('aria-expanded', 'false');
        });

        qsa('.dropdown.show').forEach(function (dropdown) {
            dropdown.classList.remove('show');
        });

        qsa('.dropdown-menu.show').forEach(function (menu) {
            menu.classList.remove('show');
        });
    }

    function bindDropdownDismissOnNavigation() {
        if (window.__trblGuideDropdownDismissBound) {
            return;
        }
        window.__trblGuideDropdownDismissBound = true;

        window.addEventListener('popstate', dismissAllOpenDropdowns);
        window.addEventListener('beforeunload', dismissAllOpenDropdowns);
        window.addEventListener('pageshow', function (event) {
            if (event && event.persisted) {
                dismissAllOpenDropdowns();
            }
        });
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
        let realtimeSubscribed = false;
        let requestFeedPollingId = null;

        function isFeedVisibleRequest(request) {
            const payload = request && typeof request === 'object' ? request : {};
            const normalized = String(payload.status || '').trim().toLowerCase();
            const isActive = payload.isActive !== false;
            const hasSelectedGuide = !!payload.selectedGuideId;

            return normalized === 'open' && isActive && !hasSelectedGuide;
        }

        function statusBadgeClass(status) {
            const normalized = String(status || '').trim().toLowerCase();
            if (normalized === 'negotiating') {
                return 'badge-negotiating';
            }
            if (normalized === 'selected' || normalized === 'closed') {
                return 'badge-selected';
            }
            return 'badge-open';
        }

        function statusBadgeLabel(status) {
            const normalized = String(status || '').trim().toLowerCase();
            if (normalized === 'negotiating') {
                return 'Negotiating';
            }
            if (normalized === 'selected' || normalized === 'closed') {
                return 'Selected Guide';
            }
            return 'Open';
        }

        function upsertIncomingRequest(request) {
            if (!request || !request.id) {
                return;
            }
            const current = getTouristRequests();
            const existingIndex = current.findIndex(function (item) {
                return String(item.id) === String(request.id);
            });

            if (!isFeedVisibleRequest(request)) {
                if (existingIndex !== -1) {
                    current.splice(existingIndex, 1);
                    setTouristRequests(current.slice(0, 120));
                }
                return;
            }

            const merged = Object.assign({
                comments: []
            }, request);

            if (existingIndex === -1) {
                current.unshift(merged);
            } else {
                current[existingIndex] = Object.assign({}, current[existingIndex], merged);
            }
            setTouristRequests(current.slice(0, 120));
        }

        function syncRequestsFromApi() {
            return apiRequest('/guide/request-feed').then(function (data) {
                if (data && data.pusher && !window.TRBL_PUSHER) {
                    window.TRBL_PUSHER = data.pusher;
                }
                if (!data || !Array.isArray(data.requests)) {
                    return;
                }
                setTouristRequests(data.requests.filter(function (item) {
                    return isFeedVisibleRequest(item);
                }).map(function (item) {
                    return Object.assign({ comments: [] }, item, {
                        comments: Array.isArray(item.comments) ? item.comments : []
                    });
                }));
                render();
            }).catch(function () {
                return null;
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

        function initRealtimeRequestFeed() {
            if (realtimeSubscribed) {
                return;
            }
            const pusherConfig = window.TRBL_PUSHER || {};
            if (!pusherConfig.key) {
                return;
            }

            loadPusherScript().then(function () {
                if (!window.Pusher) {
                    return;
                }
                const pusher = new window.Pusher(pusherConfig.key, {
                    cluster: pusherConfig.cluster || 'ap1',
                    forceTLS: true
                });
                const channel = pusher.subscribe('guide-request-feed');
                channel.bind('tour-request.created', function (payload) {
                    const request = payload && payload.request ? payload.request : null;
                    if (!request) {
                        return;
                    }
                    upsertIncomingRequest(request);
                    render();
                    syncGuideNotificationsFromApi();
                    showToast('New tourist request received.', 'success');
                });
                channel.bind('tour-request.updated', function (payload) {
                    const request = payload && payload.request ? payload.request : null;
                    if (!request) {
                        return;
                    }
                    upsertIncomingRequest(request);
                    render();
                    syncGuideNotificationsFromApi();
                });
                realtimeSubscribed = true;
            }).catch(function () {
                return null;
            });
        }

        function initRequestFeedPolling() {
            if (requestFeedPollingId !== null) {
                return;
            }

            requestFeedPollingId = window.setInterval(function () {
                if (document.visibilityState && document.visibilityState !== 'visible') {
                    return;
                }
                syncRequestsFromApi();
            }, 15000);
        }

        function normalizeComments(comments) {
            if (!Array.isArray(comments)) {
                return [];
            }
            return comments.map(function (entry) {
                const item = entry && typeof entry === 'object' ? entry : {};
                return {
                    id: String(item.id || uid('guide-comment')),
                    parentCommentId: item.parentCommentId ? String(item.parentCommentId) : null,
                    authorId: item.authorId ? String(item.authorId) : '',
                    authorRole: String(item.authorRole || '').toLowerCase() || 'guide',
                    authorName: String(item.authorName || item.guideName || activeGuideName).trim() || activeGuideName,
                    authorAvatar: String(item.authorAvatar || item.guideAvatar || '/images/manila.jpg'),
                    text: String(item.text || '').trim(),
                    offerAmount: item.offerAmount !== null && item.offerAmount !== undefined ? Number(item.offerAmount) : null,
                    createdAt: String(item.createdAt || nowISO()),
                    replies: normalizeComments(Array.isArray(item.replies) ? item.replies : [])
                };
            }).filter(function (entry) {
                return entry.text;
            });
        }

        function renderCommentNode(request, entry, depth) {
            const isTouristAuthor = String(entry.authorRole || '').toLowerCase() === 'tourist';
            const replies = Array.isArray(entry.replies) ? entry.replies : [];
            const offerAmount = entry.offerAmount;
            const openMessageButton = isTouristAuthor && request && request.touristId
                ? '<button type="button" class="btn-soft btn-xs" data-open-comment-message="' + escapeHtml(String(request.touristId)) + '" data-request-id="' + escapeHtml(String(request.id || '')) + '"><i class="fa-regular fa-comments me-1"></i>Open Message</button>'
                : '';

            return [
                '<article class="thread-comment" data-comment-id="', escapeHtml(String(entry.id || '')), '" data-comment-depth="', String(depth), '">',
                '<div class="thread-comment-head">',
                '<img class="thread-avatar" src="', escapeHtml(entry.authorAvatar || '/images/manila.jpg'), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';" alt="', escapeHtml(entry.authorName || 'User'), '">',
                '<div class="thread-meta">',
                '<div class="thread-name-row"><strong>', escapeHtml(entry.authorName || 'User'), '</strong><span class="thread-role-pill">', escapeHtml(isTouristAuthor ? 'Tourist' : 'Guide'), '</span></div>',
                '<small class="text-muted">', escapeHtml(relativeTime(entry.createdAt)), '</small>',
                '</div>',
                '</div>',
                '<p class="small mb-1">', escapeHtml(entry.text || ''), '</p>',
                offerAmount ? '<div class="offer-meta-line">Offer: <strong>' + escapeHtml(formatPeso(offerAmount)) + '</strong></div>' : '',
                '<div class="thread-actions">',
                openMessageButton,
                '<button type="button" class="btn-ghost btn-xs" data-toggle-reply-form="', escapeHtml(String(entry.id || '')), '"><i class="fa-solid fa-reply me-1"></i>Reply</button>',
                '</div>',
                '<form class="thread-reply-form" data-request-comment-form="', escapeHtml(String(request && request.id ? request.id : '')), '" data-parent-comment-id="', escapeHtml(String(entry.id || '')), '">',
                '<textarea class="input-soft" rows="2" data-comment-text placeholder="Write your reply..." required></textarea>',
                '<div class="d-flex justify-content-end gap-2 mt-2">',
                '<button type="button" class="btn-ghost btn-xs" data-cancel-reply="', escapeHtml(String(entry.id || '')), '">Cancel</button>',
                '<button class="btn-charcoal btn-xs" type="submit">Reply</button>',
                '</div>',
                '</form>',
                replies.length
                    ? '<div class="thread-replies">' + replies.map(function (reply) {
                        return renderCommentNode(request, reply, depth + 1);
                    }).join('') + '</div>'
                    : '',
                '</article>'
            ].join('');
        }

        function commentMarkup(request) {
            const safeComments = normalizeComments(Array.isArray(request && request.comments) ? request.comments : []);
            const rendered = safeComments.length
                ? safeComments.map(function (entry) {
                    return renderCommentNode(request, entry, 0);
                }).join('')
                : '<p class="small text-muted mb-2">No comments yet. Be the first guide to comment.</p>';

            return [
                '<div class="mt-3 pt-2 border-top">',
                '<h3 class="h6 mb-2">Request Comments</h3>',
                '<div class="thread-list mb-2">', rendered, '</div>',
                '<form data-request-comment-form="', escapeHtml(String(request && request.id ? request.id : '')), '">',
                '<div class="position-relative">',
                '<textarea class="input-soft" rows="2" data-comment-text placeholder="Write your comment for this request..." required></textarea>',
                '<div class="comment-timer-display" data-comment-timer style="display:none; position:absolute; bottom:5px; right:5px; font-size:0.75rem; color:#999;"></div>',
                '</div>',
                '<div class="d-flex justify-content-end mt-2">',
                '<button class="btn-charcoal" type="submit"><i class="fa-regular fa-paper-plane me-1"></i>Post Comment</button>',
                '</div>',
                '</form>',
                '</div>'
            ].join('');
        }

        function startConversationWithTourist(requestId, touristId) {
            return apiRequest('/guide/messages/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    tour_request_id: requestId || null,
                    tourist_id: touristId
                })
            });
        }

        function render() {
            const requests = getTouristRequests().filter(function (item) {
                return isFeedVisibleRequest(item);
            }).slice().sort(function (a, b) {
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
                    '<span class="badge-status ', statusBadgeClass(item.status), '">', statusBadgeLabel(item.status), '</span>',
                    '</div>',
                    '<div class="request-body">',
                    '<h2 class="h5 mb-1">', escapeHtml(item.title || 'Tour request'), '</h2>',
                    '<p class="small text-muted mb-2">Location: ', escapeHtml(item.location || 'Philippines'), '</p>',
                    '<div class="row g-2 small text-muted">',
                    '<div class="col-md-4">Budget: <strong class="text-dark">', formatPeso(item.budgetMin), ' - ', formatPeso(item.budgetMax), '</strong></div>',
                    '<div class="col-md-4">Duration: <strong class="text-dark">', escapeHtml(item.duration || 'Flexible'), '</strong></div>',
                    '<div class="col-md-4">Travelers: <strong class="text-dark">', escapeHtml(item.travelers || '1 traveler'), '</strong></div>',
                    '</div>',
                    '<p class="small text-muted mt-2 mb-2">', escapeHtml(String(item.description || 'No additional trip details provided yet.')), '</p>',
                    '<div class="tag-row">',
                    (Array.isArray(item.interests) ? item.interests : []).map(function (tag) {
                        return '<span class="soft-tag">' + escapeHtml(tag) + '</span>';
                    }).join(''),
                    '</div>',
                    commentMarkup(item),
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
            const parentCommentId = form.dataset.parentCommentId ? String(form.dataset.parentCommentId) : null;
            const textarea = qs('[data-comment-text]', form);
            const message = String(textarea ? textarea.value : '').trim();
            if (!message) {

                    // Clear timer on submit
                    const timerDisplay = qs('[data-comment-timer]', form);
                    if (timerDisplay && timerDisplay.dataset.timerId) {
                        clearInterval(Number(timerDisplay.dataset.timerId));
                        timerDisplay.dataset.timerId = '';
                        timerDisplay.style.display = 'none';
                    }
                return;
            }

            apiRequest('/guide/request-feed/' + encodeURIComponent(String(requestId)) + '/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({
                    text: message,
                    parent_comment_id: parentCommentId
                })
            }).then(function (data) {
                const updatedRequest = data && data.request ? data.request : null;
                if (updatedRequest) {
                    upsertIncomingRequest(updatedRequest);
                } else {
                    syncRequestsFromApi();
                }
                if (textarea) {
                    textarea.value = '';
                }
                render();
                syncGuideNotificationsFromApi();
                showToast('Comment posted to request.', 'success');
            }).catch(function () {
                showToast('Unable to post comment right now.', 'danger');
            });
        });

        host.addEventListener('click', function (event) {
            const toggleReplyBtn = event.target.closest('[data-toggle-reply-form]');
            if (toggleReplyBtn) {
                const commentId = String(toggleReplyBtn.dataset.toggleReplyForm || '').trim();
                if (!commentId) {
                    return;
                }

                const card = toggleReplyBtn.closest('.request-manage-card');
                const form = qs('[data-parent-comment-id="' + commentId + '"]', card || host);
                if (!form) {
                    return;
                }

                qsa('.thread-reply-form.open', card || host).forEach(function (node) {
                    if (node !== form) {
                        node.classList.remove('open');
                    }
                });

                form.classList.toggle('open');
                if (form.classList.contains('open')) {
                    const input = qs('[data-comment-text]', form);
                    if (input) {
                        input.focus();
                    }
                }
                return;
            }

            const cancelReplyBtn = event.target.closest('[data-cancel-reply]');
            if (cancelReplyBtn) {
                const commentId = String(cancelReplyBtn.dataset.cancelReply || '').trim();
                const card = cancelReplyBtn.closest('.request-manage-card');
                const form = qs('[data-parent-comment-id="' + commentId + '"]', card || host);
                if (form) {
                    form.classList.remove('open');
                }
                return;
            }

            const openMessageBtn = event.target.closest('[data-open-comment-message]');
            if (openMessageBtn) {
                const touristId = String(openMessageBtn.dataset.openCommentMessage || '').trim();
                const requestId = String(openMessageBtn.dataset.requestId || '').trim();
                if (!touristId) {
                    return;
                }

                startConversationWithTourist(requestId || null, touristId).then(function (result) {
                    const conversationId = result && result.conversationId ? String(result.conversationId) : '';
                    const redirect = result && result.redirect
                        ? String(result.redirect)
                        : '/guide/messages' + (conversationId ? '?conversation=' + encodeURIComponent(conversationId) : '');
                    window.location.href = redirect;
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to open private chat right now.', 'danger');
                });
            }
        });

        window.addEventListener('storage', function (event) {
            if (!event || event.key === TOURIST_REQUESTS_KEY) {
                render();
            }
        });

        render();
        syncRequestsFromApi();
        initRealtimeRequestFeed();
        initRequestFeedPolling();

            // Add timer tracking for comment input
            function trackCommentInput() {
                const textareas = qsa('[data-comment-text]', host);
                textareas.forEach(function (textarea) {
                    textarea.addEventListener('input', function () {
                        const form = textarea.closest('form[data-request-comment-form]');
                        if (!form) {
                            return;
                        }
                        const timerDisplay = qs('[data-comment-timer]', form);
                        if (!timerDisplay) {
                            return;
                        }
                        const hasContent = textarea.value.trim().length > 0;
                        if (!hasContent) {
                            if (timerDisplay.dataset.timerId) {
                                clearInterval(Number(timerDisplay.dataset.timerId));
                                timerDisplay.dataset.timerId = '';
                            }
                            timerDisplay.style.display = 'none';
                            return;
                        }
                        timerDisplay.style.display = '';
                        timerDisplay.textContent = 'Timer active...';
                    });
                });
            }
            trackCommentInput();
            window.addEventListener('storage', function (event) {
                if (!event || event.key === TOURIST_REQUESTS_KEY) {
                    trackCommentInput();
                }
            });
    }

    function initBookingRequestsPage() {
        if (document.body.dataset.page !== 'guide-booking-requests') {
            return;
        }

        const listHost = qs('#guideBookingList');
        const empty = qs('#guideBookingEmpty');
        const filterButtons = qsa('[data-booking-filter]');
        let activeFilter = 'All';
        let realtimeBound = false;

        function getTourMap() {
            return getGuideTours().reduce(function (acc, tour) {
                acc[tour.id] = tour;
                return acc;
            }, {});
        }

        function toStatusLabel(value) {
            const normalized = String(value || '').trim().toLowerCase();
            if (!normalized) {
                return 'Pending';
            }
            return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }

        function toPaymentStatusLabel(value) {
            const normalized = String(value || '').trim().toLowerCase();
            if (normalized === 'paid') {
                return 'Paid';
            }
            if (normalized === 'partial') {
                return 'Partially Paid';
            }
            if (normalized === 'refunded') {
                return 'Refunded';
            }
            return 'Unpaid';
        }

        function normalizeBooking(item) {
            const source = item && typeof item === 'object' ? item : {};
            const rawStatus = String(source.statusRaw || source.status || 'pending').trim().toLowerCase();

            return Object.assign({}, source, {
                id: String(source.id || uid('booking')),
                tourId: source.tourId ? String(source.tourId) : '',
                tourTitle: String(source.tourTitle || ''),
                tourImage: normalizeAssetPath(source.tourImage, '/images/pangasinan.jpg'),
                touristName: String(source.touristName || 'Tourist'),
                touristAvatar: normalizeAssetPath(source.touristAvatar, '/images/manila.jpg'),
                bookingDate: source.bookingDate || null,
                tourStartDate: source.tourStartDate || null,
                confirmedBookingDate: source.confirmedBookingDate || null,
                paymentReceivedAt: source.paymentReceivedAt || null,
                paymentStatus: String(source.paymentStatus || 'unpaid'),
                paymentMethod: String(source.paymentMethod || ''),
                total: Number(source.total || 0),
                guests: String(source.guests || (source.guestCount ? String(source.guestCount) + ' guests' : '1 guest')),
                statusRaw: rawStatus,
                status: toStatusLabel(rawStatus)
            });
        }

        function syncBookingsFromApi() {
            return apiRequest('/guide/booking-requests').then(function (data) {
                if (data && data.pusher && !window.TRBL_PUSHER) {
                    window.TRBL_PUSHER = data.pusher;
                }

                if (!data || !Array.isArray(data.bookings)) {
                    return;
                }

                setGuideBookings(data.bookings.map(normalizeBooking));
                render();
            }).catch(function () {
                return null;
            });
        }

        function updateBookingStatus(bookingId, action) {
            // Map action to new endpoint
            const endpoint = action === 'accepted' ? '/guide/booking-requests/' + encodeURIComponent(String(bookingId)) + '/accept'
                           : action === 'declined' ? '/guide/booking-requests/' + encodeURIComponent(String(bookingId)) + '/decline'
                           : '/guide/booking-requests/' + encodeURIComponent(String(bookingId));
            
            return apiRequest(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: action === 'accepted' || action === 'declined' ? undefined : JSON.stringify({ action: action })
            });
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
                    const bookingStatus = String(item.bookingStatus || item.statusRaw || item.status || 'pending').toLowerCase();
                    return bookingStatus === activeFilter.toLowerCase() || item.status === activeFilter;
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
                const tour = tourMap[booking.tourId] || null;
                const image = booking.tourImage || (tour ? tour.image : 'images/pangasinan.jpg');
                const title = booking.tourTitle || (tour ? tour.title : 'Custom Tour Booking');
                const bookingStatus = String(booking.bookingStatus || booking.statusRaw || booking.status || 'pending').toLowerCase();
                const canAccept = bookingStatus === 'pending' && Boolean(booking.canAccept);
                const canDecline = bookingStatus === 'pending' && Boolean(booking.canDecline);
                const hasConfirmedDate = Boolean(booking.tourDate && booking.tourDate !== 'Date not set');
                const isPaid = String(booking.paymentStatus || '').toLowerCase() === 'paid';
                const canComplete = Boolean(booking.canMarkCompleted) && hasConfirmedDate && isPaid;
                const tourSchedule = booking.tourDate || booking.confirmedBookingDate || booking.tourStartDate || booking.bookingDate;
                const statusDisplay = 
                    bookingStatus === 'schedule_confirmed' ? 'Awaiting Payment' :
                    bookingStatus === 'waiting_payment' ? 'Awaiting Payment' :
                    bookingStatus === 'paid' ? 'Payment Received' :
                    String(booking.status || 'Pending');
                const card = document.createElement('article');
                card.className = 'booking-card';
                card.dataset.bookingId = booking.id;
                card.innerHTML = [
                    '<img class="media" src="', escapeHtml(image), '" alt="', escapeHtml(title), '">',
                    '<div class="booking-body">',
                    '<div class="d-flex justify-content-between align-items-start gap-2">',
                    '<h2 class="h6 mb-0">', escapeHtml(title), '</h2>',
                    '<span class="status-pill ', bookingStatus === 'completed' ? 'completed' : bookingStatus === 'declined' || bookingStatus === 'cancelled' ? 'cancelled' : '', '">', escapeHtml(statusDisplay), '</span>',
                    '</div>',
                    '<div class="d-flex align-items-center gap-2 mt-2">',
                    '<img src="', escapeHtml(booking.touristAvatar || '../images/manila.jpg'), '" alt="', escapeHtml(booking.touristName), '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">',
                    '<small>', escapeHtml(booking.touristName), '</small>',
                    '</div>',
                    '<p class="small text-muted mb-1 mt-2">Tour scheduled: ', escapeHtml(tourSchedule || 'Date not set'), '</p>',
                    '<p class="small text-muted mb-1">Payment: ', escapeHtml(toPaymentStatusLabel(booking.paymentStatus)), booking.paymentMethod ? (' via ' + escapeHtml(booking.paymentMethod)) : '', ' • ', escapeHtml(formatSimulatedPeso(Number(booking.total || 0))), '</p>',
                    booking.paymentReceivedAt ? '<p class="small text-muted mb-1">Payment received: ' + escapeHtml(formatDate(booking.paymentReceivedAt)) + '</p>' : (isPaid ? '' : '<p class="small text-warning mb-1">Payment not received yet.</p>'),
                    '<p class="small text-muted mb-2">Guests: ', escapeHtml(booking.guests || '1 guest'), '</p>',
                    bookingStatus === 'pending'
                        ? '<div class="d-flex gap-2"><button class="btn-charcoal flex-fill" type="button" data-accept-booking="' + escapeHtml(booking.id) + '"' + (canAccept ? '' : ' disabled') + '>Accept</button><button class="btn-danger flex-fill" type="button" data-decline-booking="' + escapeHtml(booking.id) + '"' + (canDecline ? '' : ' disabled') + '>Decline</button></div>'
                        : bookingStatus === 'accepted'
                        ? '<p class="small text-success mt-2">Booking accepted. Waiting for tourist to confirm schedule.</p>'
                        : bookingStatus === 'schedule_confirmed'
                        ? '<p class="small text-muted mt-2">Schedule confirmed. Waiting for payment...</p>'
                        : bookingStatus === 'waiting_payment'
                        ? '<p class="small text-muted mt-2">Waiting for payment confirmation...</p>'
                        : bookingStatus === 'paid'
                        ? '<div><button class="btn-gold w-100 mt-2" type="button" data-complete-booking="' + escapeHtml(booking.id) + '"' + (canComplete ? '' : ' disabled') + '>Mark Completed</button></div>'
                        : '',
                    (bookingStatus === 'completed' ? '<p class="small text-success mt-2">Tour completed ✓</p>' : ''),
                    (bookingStatus === 'declined' || bookingStatus === 'cancelled' ? '<p class="small text-danger mt-2">Booking cancelled</p>' : ''),
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
                const completeBtn = event.target.closest('[data-complete-booking]');

                if (!acceptBtn && !declineBtn && !completeBtn) {
                    return;
                }
                const id = (acceptBtn || declineBtn || completeBtn).dataset.acceptBooking
                    || (acceptBtn || declineBtn || completeBtn).dataset.declineBooking
                    || (acceptBtn || declineBtn || completeBtn).dataset.completeBooking;
                const action = acceptBtn ? 'accepted' : (declineBtn ? 'declined' : 'completed');

                updateBookingStatus(id, action).then(function (data) {
                    const updatedBooking = data && data.booking ? normalizeBooking(data.booking) : null;
                    if (updatedBooking) {
                        const current = getGuideBookings();
                        const next = current.map(function (booking) {
                            return String(booking.id) === String(updatedBooking.id) ? updatedBooking : booking;
                        });
                        setGuideBookings(next);
                    }
                    render();
                    syncGuideNotificationsFromApi();
                    const message = action === 'accepted' ? 'Booking accepted! Waiting for tourist to confirm schedule.'
                                  : action === 'declined' ? 'Booking declined.'
                                  : 'Booking marked as completed.';
                    showToast(message, 'success');
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to update booking request.', 'danger');
                });
            });
        }

        function bindRealtime() {
            if (realtimeBound) {
                return;
            }

            subscribeRealtime('tourist-bookings', 'booking.updated', function () {
                syncBookingsFromApi();
                syncGuideNotificationsFromApi();
            });
            realtimeBound = true;
        }

        filterButtons.forEach(function (button) {
            button.classList.toggle('active', button.dataset.bookingFilter === activeFilter);
        });
        render();
        syncBookingsFromApi().then(function () {
            bindRealtime();
        });
    }

    function initToursPage() {
        if (document.body.dataset.page !== 'guide-tours') {
            return;
        }

        const form = qs('#tourForm');
        const listHost = qs('#guideToursList');
        const empty = qs('#guideToursEmpty');
        const resetBtn = qs('#tourFormReset');
        const clearImagesBtn = qs('#tourClearImages');
        const imageMeta = qs('#tourImageMeta');

        const fields = {
            id: qs('#tourId'),
            title: qs('#tourTitle'),
            shortDescription: qs('#tourShortDescription'),
            category: qs('#tourCategory'),
            duration: qs('#tourDuration'),
            region: qs('#tourRegion'),
            city: qs('#tourCity'),
            meetingArea: qs('#tourMeetingArea'),
            meetingPoint: qs('#tourMeetingPoint'),
            price: qs('#tourPrice'),
            priceType: qs('#tourPriceType'),
            minGuests: qs('#tourMinGuests'),
            maxGuests: qs('#tourMaxGuests'),
            timeSlots: qs('#tourTimeSlots'),
            reservationType: qs('#tourReservationType'),
            languages: qs('#tourLanguages'),
            includes: qs('#tourIncludes'),
            excludes: qs('#tourExcludes'),
            requirements: qs('#tourRequirements'),
            safetyInfo: qs('#tourSafetyInfo'),
            images: qs('#tourImages'),
            imagePreview: qs('#tourImagePreview'),
            imageMeta: qs('#tourImageMeta'),
            clearImagesBtn: qs('#tourClearImages')
        };
        const saveDraftBtn = qs('#tourSaveDraft');
        const dropzone = qs('#tourDropzone');
        const uploadProgress = qs('#tourUploadProgress');

        let previewGallery = [];
        let imageTouched = false;
        let draftTimer = null;

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
            const region = String(fields.region ? fields.region.value : '').trim();
            if (city && region) {
                return city + ', ' + region;
            }
            return city || region || '';
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
            renderGallery(fields.imagePreview, [], 'Tour', true);
            updateImageMeta();
            setUploadProgress(0);
            writeStore(GUIDE_TOUR_DRAFT_KEY, null);
        }

        function updateImageMeta() {
            if (!imageMeta) {
                return;
            }

            const count = previewGallery.length;
            if (!count) {
                imageMeta.textContent = 'No images selected yet.';
                return;
            }

            imageMeta.textContent = String(count) + ' image' + (count > 1 ? 's' : '') + ' selected.';
        }

        function isImageFile(file) {
            if (!file) {
                return false;
            }

            const mime = String(file.type || '').toLowerCase();
            if (mime && mime.indexOf('image/') === 0) {
                return true;
            }

            const name = String(file.name || '').toLowerCase();
            return /\.(png|jpe?g|webp|gif|bmp|svg|heic|heif)$/.test(name);
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
                ? previewGallery.slice(0, 5)
                : (
                    existing && Array.isArray(existing.gallery_paths)
                        ? existing.gallery_paths.slice(0, 5)
                        : (
                            existing && Array.isArray(existing.gallery)
                                ? existing.gallery.slice(0, 5)
                                : previewGallery.slice(0, 5)
                        )
                );
            const gallery = galleryBase.filter(Boolean);
            const minGuests = Math.max(1, Number(fields.minGuests ? fields.minGuests.value : 1));
            const maxGuests = Math.max(minGuests, Number(fields.maxGuests ? fields.maxGuests.value : 10));
            const title = String(fields.title ? fields.title.value : '').trim();

            return {
                id: fields.id && fields.id.value ? fields.id.value : uid('guide-tour'),
                title: title,
                short_description: String(fields.shortDescription ? fields.shortDescription.value : '').trim(),
                category: String(fields.category ? fields.category.value : '').trim(),
                province: String(fields.region ? fields.region.value : '').trim(),
                region: String(fields.region ? fields.region.value : '').trim(),
                city: String(fields.city ? fields.city.value : '').trim(),
                meeting_area: String(fields.meetingArea ? fields.meetingArea.value : '').trim(),
                meeting_point: String(fields.meetingPoint ? fields.meetingPoint.value : '').trim(),
                duration_label: String(fields.duration ? fields.duration.value : '').trim(),
                min_guests: minGuests,
                max_guests: maxGuests,
                price: Math.max(1, Number(fields.price ? fields.price.value : 0)),
                price_type: String(fields.priceType ? fields.priceType.value : 'per_person').trim(),
                reservation_type: String(fields.reservationType ? fields.reservationType.value : 'instant').trim(),
                time_slots_json: parseListValue(fields.timeSlots ? fields.timeSlots.value : ''),
                languages: String(fields.languages ? fields.languages.value : '').trim(),
                includes: parseListValue(fields.includes ? fields.includes.value : ''),
                excludes: String(fields.excludes ? fields.excludes.value : '').trim(),
                requirements: String(fields.requirements ? fields.requirements.value : '').trim(),
                safety_info: String(fields.safetyInfo ? fields.safetyInfo.value : '').trim(),
                status: String(forcedStatus || '').trim().toLowerCase() === 'published' ? 'published' : 'draft',
                is_active: true,
                cover_image_path: gallery[0] || (existing && existing.cover_image_path) || null,
                gallery_paths: gallery
            };
        }

        function validatePayload(payload) {
            const errors = [];
            if (!payload.title || payload.title.length < 5) {
                errors.push({ field: fields.title, message: 'Tour title is required (at least 5 characters).' });
            }
            if (!payload.short_description || payload.short_description.length < 20) {
                errors.push({ field: fields.shortDescription, message: 'Short description must be at least 20 characters.' });
            }
            if (!payload.category) {
                errors.push({ field: fields.category, message: 'Tour category is required.' });
            }
            if (!payload.duration_label) {
                errors.push({ field: fields.duration, message: 'Tour duration is required.' });
            }
            if (!payload.province) {
                errors.push({ field: fields.region, message: 'Region is required.' });
            }
            if (!payload.city) {
                errors.push({ field: fields.city, message: 'City / Municipality is required.' });
            }
            if (!payload.meeting_area) {
                errors.push({ field: fields.meetingArea, message: 'Specific meeting area is required.' });
            }
            if (!payload.meeting_point) {
                errors.push({ field: fields.meetingPoint, message: 'Meeting point is required.' });
            }
            if (Number(payload.price) < 1) {
                errors.push({ field: fields.price, message: 'Base price must be at least ₱1.' });
            }
            if (!payload.time_slots_json || !Array.isArray(payload.time_slots_json) || !payload.time_slots_json.length) {
                errors.push({ field: fields.timeSlots, message: 'Add at least one available time slot.' });
            }
            if (!payload.languages) {
                errors.push({ field: fields.languages, message: 'Languages spoken is required.' });
            }
            if (!Array.isArray(payload.gallery_paths) || payload.gallery_paths.length < 3 || payload.gallery_paths.length > 5) {
                errors.push({ field: fields.images, message: 'Please upload 3 to 5 images.' });
            }
            if (Number(payload.max_guests) < Number(payload.min_guests)) {
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
                fields.title.value = tour.title || '';
            }
            if (fields.shortDescription) {
                fields.shortDescription.value = tour.short_description || tour.description || '';
            }
            if (fields.category) {
                fields.category.value = tour.category || '';
            }
            if (fields.region) {
                fields.region.value = tour.region || tour.province || '';
            }
            if (fields.city) {
                fields.city.value = tour.city || '';
            }
            if (fields.meetingArea) {
                fields.meetingArea.value = tour.meeting_area || '';
            }
            if (fields.duration) {
                fields.duration.value = tour.duration_label || tour.duration || '';
            }
            if (fields.meetingPoint) {
                fields.meetingPoint.value = tour.meeting_point || '';
            }
            if (fields.price) {
                fields.price.value = String(tour.price || 0);
            }
            if (fields.priceType) {
                fields.priceType.value = tour.price_type || tour.priceType || 'per_person';
            }
            if (fields.minGuests) {
                fields.minGuests.value = String(Math.max(1, Number(tour.min_guests || tour.minGuests || 1)));
            }
            if (fields.maxGuests) {
                fields.maxGuests.value = String(Math.max(1, Number(tour.max_guests || tour.maxGuests || 10)));
            }
            if (fields.timeSlots) {
                const slots = tour.time_slots_json || tour.timeSlots || [];
                fields.timeSlots.value = Array.isArray(slots) ? slots.join(', ') : '';
            }
            if (fields.reservationType) {
                fields.reservationType.value = tour.reservation_type || tour.reservationType || 'instant';
            }
            if (fields.languages) {
                fields.languages.value = tour.languages || '';
            }
            if (fields.includes) {
                const includes = tour.includes || [];
                fields.includes.value = Array.isArray(includes) ? includes.join('\n') : '';
            }
            if (fields.excludes) {
                fields.excludes.value = tour.excludes || '';
            }
            if (fields.requirements) {
                fields.requirements.value = tour.requirements || '';
            }
            if (fields.safetyInfo) {
                fields.safetyInfo.value = tour.safety_info || tour.safetyInfo || '';
            }
            if (fields.images) {
                fields.images.value = '';
            }
            const existingGallery = Array.isArray(tour.gallery_paths)
                ? tour.gallery_paths
                : (Array.isArray(tour.gallery) ? tour.gallery : []);
            const existingCover = tour.cover_image_path || tour.coverImage || tour.image || '';
            previewGallery = (existingGallery.length ? existingGallery : [existingCover]).filter(Boolean).slice(0, 5);
            imageTouched = false;
            renderGallery(fields.imagePreview, previewGallery, tour.title, true);
            updateImageMeta();
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
                return isImageFile(file);
            });
            if (!files.length) {
                showToast('Please select valid image files (png, jpg, webp, gif, svg, heic).', 'warning');
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
                updateImageMeta();
                if (files.length > availableSlots) {
                    showToast('Only ' + String(availableSlots) + ' image(s) were added. Limit is 10.', 'warning');
                }
            }).catch(function () {
                showToast('Unable to load selected image files.', 'danger');
            });
        }

        function syncToursFromApi() {
            return apiRequest('/guide/tours').then(function (data) {
                const listings = data && Array.isArray(data.listings) ? data.listings : [];
                setGuideTours(listings.map(mapApiListingToGuideTour));
                render();
            }).catch(function () {
                return null;
            });
        }

        function saveTourToApi(payload, existingId) {
            const endpoint = existingId
                ? '/guide/tours/' + encodeURIComponent(String(existingId))
                : '/guide/tours';
            const method = existingId ? 'PUT' : 'POST';
            return apiRequest(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(mapGuideTourToApiPayload(payload))
            });
        }

        function removeTourFromApi(tourId) {
            return apiRequest('/guide/tours/' + encodeURIComponent(String(tourId)), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
        }

        function deleteTourListingById(tourId) {
            const id = String(tourId || '').trim();
            if (!id) {
                return Promise.reject(new Error('Unable to identify listing for deletion.'));
            }

            const removeFromLocalState = function () {
                const tours = getGuideTours().filter(function (tour) {
                    return String(tour.id) !== id;
                });
                setGuideTours(tours);
                setGuideBookings(getGuideBookings().filter(function (booking) {
                    return String(booking.tourId) !== id;
                }));
                setGuideReviews(getGuideReviews().filter(function (review) {
                    return String(review.tourId) !== id;
                }));
                render();
            };

            // Locally-seeded tours can have non-numeric ids and are not persisted in DB.
            if (!/^\d+$/.test(id)) {
                removeFromLocalState();
                return Promise.resolve({ ok: true, local: true });
            }

            return removeTourFromApi(id).then(function (result) {
                removeFromLocalState();
                return syncToursFromApi().catch(function () {
                    return null;
                }).then(function () {
                    return result;
                });
            }).catch(function (error) {
                // Reconcile with server state in case local cache drifted from backend state.
                return syncToursFromApi().then(function () {
                    const stillExists = getGuideTours().some(function (tour) {
                        return String(tour.id) === id;
                    });
                    if (!stillExists) {
                        return { ok: true, reconciled: true };
                    }
                    throw error;
                }).catch(function () {
                    throw error;
                });
            });
        }

        window.TRBL_GUIDE_DELETE_TOUR = deleteTourListingById;

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
                    '<form method="POST" action="/guide/tours/', encodeURIComponent(String(tour.id)), '/delete" data-delete-form="', escapeHtml(tour.id), '" class="d-inline">',
                    '<input type="hidden" name="_token" value="', escapeHtml(getCsrfToken()), '">',
                    '<button class="btn-danger" type="submit" data-delete-tour="', escapeHtml(tour.id), '">Delete</button>',
                    '</form>',
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
                const payload = buildPayload(existing, 'published');
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

                const submitButton = qs('button[type="submit"]', form);
                if (submitButton) {
                    submitButton.disabled = true;
                }

                saveTourToApi(payload, existing ? existing.id : null).then(function (result) {
                    const listing = result && result.listing ? mapApiListingToGuideTour(result.listing) : payload;
                    const listingId = String((listing && listing.id) || (payload && payload.id) || '').trim();
                    const localTours = getGuideTours();
                    const index = localTours.findIndex(function (tour) {
                        return String(tour.id) === String(listing.id);
                    });
                    if (index >= 0) {
                        localTours[index] = listing;
                        showToast('Tour listing updated.', 'success');
                    } else {
                        localTours.unshift(listing);
                        showToast('Tour listing created.', 'success');
                    }
                    setGuideTours(localTours);
                    writeStore(GUIDE_TOUR_DRAFT_KEY, null);
                    clearForm();
                    render();

                    // Ensure freshly published listing is visible in the listings section.
                    syncToursFromApi().finally(function () {
                        focusListingCard(listingId);
                    });
                }).catch(function (error) {
                    if (error && error.code === 'auth') {
                        showToast('Please sign in as a guide to manage tours.', 'warning');
                    } else {
                        showToast(error && error.message ? error.message : 'Unable to save tour listing.', 'danger');
                    }
                }).finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                });
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
                    updateImageMeta();
                    if (!previewGallery.length) {
                        setUploadProgress(0);
                    }
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
                    updateImageMeta();
                    scheduleDraftSave();
                }
            });
        }

        if (clearImagesBtn) {
            clearImagesBtn.addEventListener('click', function () {
                if (!previewGallery.length) {
                    return;
                }
                previewGallery = [];
                imageTouched = true;
                renderGallery(fields.imagePreview, previewGallery, fields.title ? fields.title.value : 'Tour', true);
                updateImageMeta();
                setUploadProgress(0);
                if (fields.images) {
                    fields.images.value = '';
                }
                scheduleDraftSave();
            });
        }

        if (listHost) {
            listHost.addEventListener('click', function (event) {
                const editBtn = closestFromEventTarget(event, '[data-edit-tour]');
                if (editBtn) {
                    event.preventDefault();
                    event.stopPropagation();
                    const id = editBtn.dataset.editTour;
                    const tour = getGuideTours().find(function (item) {
                        return item.id === id;
                    });
                    applyPayloadToForm(tour, true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const deleteBtn = closestFromEventTarget(event, '[data-delete-tour]');
                if (!deleteBtn) {
                    return;
                }

                // Use native form submit when available for a deterministic delete path.
                if (deleteBtn.form) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                const id = deleteBtn.dataset.deleteTour;
                if (!id) {
                    showToast('Unable to identify listing for deletion.', 'danger');
                    return;
                }

                deleteTourListingById(id).then(function () {
                    showToast('Tour listing deleted.', 'warning');
                }).catch(function (error) {
                    const message = error && error.message
                        ? error.message
                        : 'Unable to delete listing right now.';
                    showToast(message, 'danger');
                });
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

        setGuideTours([]);
        render();
        syncToursFromApi();
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
        const paymentCardHost = qs('#chatPaymentCardHost');
        const conversationPanel = qs('.conversation-list');
        const chatWindow = qs('.chat-window');
        const chatBackBtn = qs('#chatBackBtn');
        const chatRefreshBtn = qs('[data-chat-refresh]');
        const chatShowListBtn = qs('[data-chat-show-list]');
        const emojiToggle = qs('#emojiToggle');
        const emojiPanel = qs('#emojiPanel');
        const params = new URLSearchParams(window.location.search);

        if (!list || !chatTitle || !chatMessages || !chatForm || !chatInput) {
            return;
        }

        let activeSearch = '';
        let conversations = [];
        let activeConversation = null;
        const routeConversationId = params.get('conversation');
        const routeRequestId = params.get('request');
        let mobileChatOpen = Boolean(routeConversationId);
        const messagesByConversation = {};
        let positionEmojiPanel = function () {};

        function isCompactViewport() {
            return window.matchMedia('(max-width: 992px)').matches;
        }

        function setConversationVisibility(showChat) {
            if (!conversationPanel || !chatWindow) {
                return;
            }

            if (!isCompactViewport()) {
                conversationPanel.style.display = '';
                chatWindow.style.display = '';
                return;
            }

            conversationPanel.style.display = showChat ? 'none' : '';
            chatWindow.style.display = showChat ? '' : 'none';
        }

        function normalizeConversation(item) {
            const source = item && typeof item === 'object' ? item : {};

            return {
                id: String(source.id || uid('conversation')),
                touristName: String(source.name || source.touristName || 'Tourist'),
                avatar: normalizeAssetPath(source.avatar, '/images/manila.jpg'),
                tourTitle: String(source.tourTitle || 'Travel planning thread'),
                budgetMin: Number(source.budgetMin || 0),
                budgetMax: Number(source.budgetMax || 0),
                unread: Number(source.unread || 0),
                lastTime: String(source.time || nowISO()),
                last: String(source.last || ''),
                tourRequestId: source.tourRequestId ? String(source.tourRequestId) : '',
                guideId: source.guideId ? String(source.guideId) : '',
                touristId: source.touristId ? String(source.touristId) : ''
            };
        }

        function normalizeMessage(item) {
            const source = item && typeof item === 'object' ? item : {};
            return {
                id: String(source.id || uid('msg')),
                mine: Boolean(source.mine),
                text: String(source.text || source.body || ''),
                senderId: String(source.senderId || ''),
                senderAvatar: normalizeAssetPath(source.senderAvatar, '/images/manila.jpg'),
                isRead: Boolean(source.isRead),
                createdAt: String(source.createdAt || nowISO())
            };
        }

        function paymentStatusLabel(status) {
            const value = String(status || '').toLowerCase();
            if (value === 'paid') {
                return 'PAID';
            }
            if (value === 'pending_cash_on_tour') {
                return 'Pending (Cash on Tour)';
            }
            return 'Not set';
        }

        function findPaymentStateForConversation(conversation) {
            if (!conversation || typeof conversation !== 'object') {
                return null;
            }

            const conversationId = String(conversation.id || '').trim();
            const direct = conversationId ? getConversationPaymentState(conversationId) : null;
            return direct && typeof direct === 'object' ? direct : null;
        }

        function parsePaymentAmountFromText(text) {
            const source = String(text || '').trim();
            if (!source) {
                return 0;
            }

            const pesoMatch = source.match(/₱\s*([\d,]+(?:\.\d{1,2})?)/i);
            const plainMatch = source.match(/payment(?:\s+successful)?[:\s]*([\d,]+(?:\.\d{1,2})?)/i);
            const match = pesoMatch || plainMatch;
            if (!match || !match[1]) {
                return 0;
            }

            const amount = Number(String(match[1]).replace(/,/g, ''));
            return Number.isFinite(amount) && amount > 0 ? amount : 0;
        }

        function parsePaymentMethodFromText(text) {
            const source = String(text || '').trim();
            if (!source) {
                return '';
            }

            const lower = source.toLowerCase();
            if (lower.includes('cash on tour') || lower.includes('pay during the tour')) {
                return 'Cash on Tour';
            }

            const viaMatch = source.match(/via\s+([A-Za-z][A-Za-z\s-]{1,40})/i);
            if (!viaMatch || !viaMatch[1]) {
                return '';
            }

            return String(viaMatch[1] || '').replace(/[\s.!,;:]+$/g, '').trim();
        }

        function inferPaymentStateFromMessages(messages) {
            const source = Array.isArray(messages) ? messages : [];

            for (let index = source.length - 1; index >= 0; index -= 1) {
                const message = source[index];
                const text = String((message && message.text) || '').trim();
                if (!text) {
                    continue;
                }

                const lower = text.toLowerCase();
                if (lower.includes('payment successful') || (lower.includes('payment of') && lower.includes('received from tourist'))) {
                    return {
                        status: 'paid',
                        amount: parsePaymentAmountFromText(text),
                        paymentMethod: parsePaymentMethodFromText(text) || 'N/A',
                        updatedAt: String((message && message.createdAt) || nowISO())
                    };
                }

                if (lower.includes('pay during the tour') || lower.includes('cash on tour is pending completion')) {
                    return {
                        status: 'pending_cash_on_tour',
                        amount: parsePaymentAmountFromText(text),
                        paymentMethod: 'Cash on Tour',
                        updatedAt: String((message && message.createdAt) || nowISO())
                    };
                }
            }

            return null;
        }

        function resolveConversationPaymentState(conversation, messages) {
            const state = findPaymentStateForConversation(conversation);
            const normalizedStatus = String(state && state.status ? state.status : '').toLowerCase();
            if (normalizedStatus === 'paid' || normalizedStatus === 'pending_cash_on_tour') {
                return state;
            }

            return null;
        }

        function renderConversationPaymentMeta(conversation, messages) {
            const state = resolveConversationPaymentState(conversation, messages);
            const status = String(state && state.status ? state.status : '').toLowerCase();
            if (status !== 'paid' && status !== 'pending_cash_on_tour') {
                return '';
            }

            const paid = status === 'paid';
            const amount = Number(state && state.amount ? state.amount : 0);
            const badgeClass = paid ? 'paid' : 'pending';
            const badgeText = paid ? 'Paid' : 'Payment Pending';
            const amountText = amount > 0
                ? formatSimulatedPeso(amount) + (paid ? ' paid' : ' pending')
                : (paid ? 'Payment received' : 'Awaiting payment');

            return [
                '<div class="conversation-payment-meta">',
                '<span class="conversation-payment-badge ', badgeClass, '">', escapeHtml(badgeText), '</span>',
                '<span class="conversation-payment-amount ', badgeClass, '">', escapeHtml(amountText), '</span>',
                '</div>'
            ].join('');
        }

        function toSimulatedThreadMessage(event) {
            const source = event && typeof event === 'object' ? event : {};
            const role = String(source.authorRole || 'system').toLowerCase();
            return {
                id: 'sim-' + String(source.id || uid('sim-msg')),
                mine: role === 'guide',
                text: sanitizePaymentCopy(source.text),
                senderId: role,
                senderAvatar: role === 'guide'
                    ? normalizeAssetPath((getGuideProfile() && getGuideProfile().avatar) || '/images/manila.jpg', '/images/manila.jpg')
                    : '',
                isRead: true,
                createdAt: String(source.createdAt || nowISO())
            };
        }

        function getMergedConversationMessages(conversationId) {
            const key = String(conversationId || '').trim();
            if (!key) {
                return [];
            }

            const persisted = (messagesByConversation[key] || []).slice();
            const simulated = getSimulatedChatEventsByConversation(key).map(toSimulatedThreadMessage);
            const merged = persisted.concat(simulated);

            const convo = conversations.find(function (item) {
                return item && String(item.id || '') === key;
            });
            const paymentState = findPaymentStateForConversation(convo || { id: key });
            const paymentStatus = String(paymentState && paymentState.status ? paymentState.status : '').toLowerCase();
            if ((paymentStatus === 'paid' || paymentStatus === 'pending_cash_on_tour') && Number(paymentState.amount || 0) > 0) {
                const syntheticText = paymentStatus === 'paid'
                    ? 'Payment of ' + formatSimulatedPeso(Number(paymentState.amount || 0)) + ' received from Tourist'
                    : 'Cash on Tour is pending completion.';
                const hasExistingPaymentLine = merged.some(function (message) {
                    const text = String((message && message.text) || '').trim().toLowerCase();
                    if (!text) {
                        return false;
                    }

                    if (paymentStatus === 'paid') {
                        return text.includes('payment of') || text.includes('payment successful');
                    }

                    return text.includes('cash on tour is pending completion') || text.includes('pay during the tour');
                });

                if (!hasExistingPaymentLine) {
                    const syntheticId = 'pay-state-' + key + '-' + String(paymentState.updatedAt || paymentState.paidAt || paymentState.pendingAt || 'now');
                    merged.push({
                        id: syntheticId,
                        mine: false,
                        text: syntheticText,
                        senderId: 'system',
                        senderAvatar: '',
                        isRead: true,
                        createdAt: String(paymentState.updatedAt || paymentState.paidAt || paymentState.pendingAt || nowISO())
                    });
                }
            }

            const seen = new Set();

            return merged
                .filter(function (item) {
                    const id = String(item && item.id ? item.id : '');
                    if (!id || seen.has(id)) {
                        return false;
                    }
                    seen.add(id);
                    return true;
                })
                .sort(function (a, b) {
                    const left = Date.parse(String((a && a.createdAt) || '')) || 0;
                    const right = Date.parse(String((b && b.createdAt) || '')) || 0;
                    return left - right;
                });
        }

        function sortConversationsByLatest(items) {
            const source = Array.isArray(items) ? items.slice() : [];
            return source.sort(function (a, b) {
                return new Date(b.lastTime || nowISO()).getTime() - new Date(a.lastTime || nowISO()).getTime();
            });
        }

        function sortedConversations() {
            return conversations.slice().sort(function (a, b) {
                return new Date(b.lastTime || nowISO()).getTime() - new Date(a.lastTime || nowISO()).getTime();
            });
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

            return '/images/manila.jpg';
        }

        function renderPaymentCard() {
            if (!paymentCardHost) {
                return;
            }

            if (!activeConversation) {
                paymentCardHost.innerHTML = '';
                return;
            }

            const conversationId = String(activeConversation.id || '');
            if (!conversationId) {
                paymentCardHost.innerHTML = '';
                return;
            }

            const mergedMessages = getMergedConversationMessages(conversationId);
            const state = resolveConversationPaymentState(activeConversation, mergedMessages);

            const suggestedBudget = Number(activeConversation.budgetMax || 0) > 0
                ? formatSimulatedPeso(Number(activeConversation.budgetMax || 0))
                : (Number(activeConversation.budgetMin || 0) > 0 ? formatSimulatedPeso(Number(activeConversation.budgetMin || 0)) : '');

            if (!state) {
                paymentCardHost.innerHTML = [
                    '<article class="chat-payment-card">',
                    '<h2 class="chat-payment-title">Payment for tour request: ', escapeHtml(activeConversation.tourTitle || 'Tour request'), '</h2>',
                    '<p class="chat-payment-tour">Tourist sets amount and method in this conversation.</p>',
                    suggestedBudget ? '<p class="chat-payment-help">Budget price from request: ' + escapeHtml(suggestedBudget) + '</p>' : '',
                    '<p class="chat-payment-summary">No payment submitted yet.</p>',
                    '</article>'
                ].join('');
                return;
            }

            const status = String(state.status || '').toLowerCase();
            const amount = Number(state.amount || 0);
            const method = String(state.paymentMethod || 'N/A');
            const tourStartDate = String(state.tourStartDate || '');
            const tourStartTime = String(state.tourStartTime || '');
            const isPendingCash = status === 'pending_cash_on_tour';

            paymentCardHost.innerHTML = [
                '<article class="chat-payment-card">',
                '<h2 class="chat-payment-title">Payment for tour request: ', escapeHtml(state.tourTitle || activeConversation.tourTitle || 'Tour request'), '</h2>',
                '<p class="chat-payment-tour">Tourist: ', escapeHtml(activeConversation.touristName || 'Tourist'), '</p>',
                '<div class="chat-payment-status">',
                '<span class="chat-payment-badge ', status === 'paid' ? 'paid' : 'pending', '">', escapeHtml(paymentStatusLabel(status)), '</span>',
                '<p class="chat-payment-summary">', escapeHtml(formatSimulatedPeso(amount) + ' via ' + method), '</p>',
                '</div>',
                (tourStartDate && tourStartTime) ? '<div class="chat-payment-schedule"><p class="small text-muted"><strong>Tour Start:</strong> ' + escapeHtml(tourStartDate + ' at ' + tourStartTime) + '</p></div>' : '',
                suggestedBudget ? '<p class="chat-payment-help">Budget price from request: ' + escapeHtml(suggestedBudget) + '</p>' : '',
                isPendingCash ? '<div class="mt-2"><button type="button" class="btn-charcoal" data-complete-cash-tour>Complete Tour</button></div>' : '',
                '</article>'
            ].join('');

            const completeBtn = qs('[data-complete-cash-tour]', paymentCardHost);
            if (!completeBtn) {
                return;
            }

            completeBtn.addEventListener('click', function () {
                const latest = getConversationPaymentState(conversationId);
                if (!latest || String(latest.status || '').toLowerCase() !== 'pending_cash_on_tour') {
                    return;
                }

                const settled = saveConversationPaymentState(conversationId, {
                    status: 'paid',
                    paidAt: nowISO(),
                });

                upsertSimulatedPaymentTransaction({
                    conversationId: conversationId,
                    requestId: String(settled && settled.requestId ? settled.requestId : ''),
                    guideId: String(settled && settled.guideId ? settled.guideId : (activeConversation.guideId || '')),
                    guideName: String(settled && settled.guideName ? settled.guideName : 'Guide'),
                    touristName: String(activeConversation.touristName || 'Tourist'),
                    tourTitle: String(settled && settled.tourTitle ? settled.tourTitle : (activeConversation.tourTitle || 'Tour request')),
                    amount: Number(settled && settled.amount ? settled.amount : 0),
                    paymentMethod: String(settled && settled.paymentMethod ? settled.paymentMethod : 'Cash on Tour'),
                    status: 'paid',
                    paidAt: nowISO(),
                    date: nowISO(),
                });

                addSimulatedChatEvent({
                    conversationId: conversationId,
                    authorRole: 'system',
                    text: 'Payment of ' + formatSimulatedPeso(Number(settled && settled.amount ? settled.amount : 0)) + ' received from Tourist',
                    createdAt: nowISO(),
                });

                addSimulatedChatEvent({
                    conversationId: conversationId,
                    authorRole: 'guide',
                    text: 'Cash on Tour marked as paid. Tour completed.',
                    createdAt: nowISO(),
                });

                showToast('Tour marked complete and payment settled.', 'success');
                renderMessages();
                renderList();
            });
        }

        function renderList() {
            list.innerHTML = '';
            const visibleConversations = sortedConversations().filter(function (conversation) {
                if (!activeSearch) {
                    return true;
                }
                const merged = getMergedConversationMessages(conversation.id);
                const tail = merged.length ? merged[merged.length - 1].text : conversation.last;
                const blob = [
                    conversation.touristName,
                    conversation.tourTitle,
                    tail || ''
                ].join(' ').toLowerCase();
                return blob.includes(activeSearch);
            });

            if (!visibleConversations.length) {
                list.innerHTML = '<div class="px-3 py-3 small text-muted">No conversations found.</div>';
                return;
            }

            visibleConversations.forEach(function (conversation) {
                const merged = getMergedConversationMessages(conversation.id);
                const tailMessage = merged.length ? merged[merged.length - 1] : null;
                const tail = tailMessage ? tailMessage.text : conversation.last;
                const tailTime = tailMessage ? tailMessage.createdAt : conversation.lastTime;
                const paymentMeta = renderConversationPaymentMeta(conversation, merged);
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'conversation-item' + (activeConversation && activeConversation.id === conversation.id ? ' active' : '');
                row.dataset.conversationId = conversation.id;
                row.innerHTML = [
                    '<img class="conversation-avatar" src="', escapeHtml(normalizeAssetPath(conversation.avatar, '/images/manila.jpg')), '" alt="', escapeHtml(conversation.touristName || 'Tourist'), '">',
                    '<div class="conversation-card-content">',
                    '<div class="d-flex justify-content-between"><strong>', escapeHtml(conversation.touristName || 'Tourist'), '</strong><small class="text-muted">', relativeTime(tailTime), '</small></div>',
                    paymentMeta,
                    '<div class="small text-muted text-truncate" style="max-width:180px;">', escapeHtml(tail || 'No messages yet.'), '</div>',
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
                setConversationVisibility(false);
                renderPaymentCard();
                return;
            }

            setConversationVisibility(Boolean(mobileChatOpen));
            chatTitle.textContent = activeConversation.touristName || 'Tourist';
            if (chatSubTitle) {
                chatSubTitle.textContent = activeConversation.tourTitle || 'Travel planning thread';
            }

            chatMessages.innerHTML = '';
            const threadMessages = getMergedConversationMessages(activeConversation.id);
            const lastMineMessage = threadMessages.slice().reverse().find(function (message) {
                return message.mine;
            });
            const lastMineId = lastMineMessage ? String(lastMineMessage.id) : '';

            threadMessages.forEach(function (message) {
                const row = document.createElement('div');
                row.className = 'msg-row' + (message.mine ? ' mine' : '');

                const metaParts = [formatMessageTime(message.createdAt)].filter(Boolean);
                if (message.mine && String(message.id) === lastMineId) {
                    metaParts.push(message.isRead ? 'Read' : 'Delivered');
                }

                const avatar = normalizeAssetPath(
                    message.senderAvatar || (message.mine ? findMineAvatar(activeConversation.id) : activeConversation.avatar),
                    '/images/manila.jpg'
                );

                if (message.mine) {
                    row.innerHTML = [
                        '<div class="msg-content">',
                        '<div class="msg-bubble">', escapeHtml(message.text), '</div>',
                        '<div class="msg-meta">', escapeHtml(metaParts.join(' • ')), '</div>',
                        '</div>',
                        '<img class="msg-avatar" src="', escapeHtml(avatar), '" alt="You">'
                    ].join('');
                } else {
                    row.innerHTML = [
                        '<img class="msg-avatar" src="', escapeHtml(avatar), '" alt="', escapeHtml(activeConversation.touristName || 'Tourist'), '">',
                        '<div class="msg-content">',
                        '<div class="msg-bubble">', escapeHtml(message.text), '</div>',
                        '<div class="msg-meta">', escapeHtml(metaParts.join(' • ')), '</div>',
                        '</div>'
                    ].join('');
                }

                chatMessages.appendChild(row);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
            renderPaymentCard();
        }

        function syncThreads() {
            return apiRequest('/guide/messages/threads').then(function (data) {
                if (data && data.pusher && !window.TRBL_PUSHER) {
                    window.TRBL_PUSHER = data.pusher;
                }

                const incoming = data && Array.isArray(data.conversations) ? data.conversations : [];
                conversations = sortConversationsByLatest(incoming.map(normalizeConversation));

                if (!activeConversation && conversations.length) {
                    if (routeConversationId) {
                        activeConversation = conversations.find(function (item) {
                            return item.id === routeConversationId;
                        }) || conversations[0];
                    } else {
                        activeConversation = conversations[0];
                    }
                } else if (activeConversation) {
                    const match = conversations.find(function (item) {
                        return item.id === activeConversation.id;
                    });
                    if (match) {
                        activeConversation = match;
                    }
                }

                if (activeConversation && routeRequestId) {
                    activeConversation.tourRequestId = String(routeRequestId);
                    const activeIndex = conversations.findIndex(function (item) {
                        return item.id === String(activeConversation.id || '');
                    });
                    if (activeIndex >= 0) {
                        conversations[activeIndex] = Object.assign({}, conversations[activeIndex], {
                            tourRequestId: String(routeRequestId)
                        });
                    }
                }

                renderList();
                if (activeConversation) {
                    return loadConversation(activeConversation.id);
                }

                renderMessages();
                return null;
            }).catch(function () {
                return null;
            });
        }

        function loadConversation(conversationId) {
            if (!conversationId) {
                return Promise.resolve(null);
            }

            return apiRequest('/guide/messages/threads/' + encodeURIComponent(String(conversationId))).then(function (data) {
                if (data && data.pusher && !window.TRBL_PUSHER) {
                    window.TRBL_PUSHER = data.pusher;
                }

                const summary = data && data.conversation ? normalizeConversation(data.conversation) : null;
                const messages = data && Array.isArray(data.messages) ? data.messages.map(normalizeMessage) : [];
                if (summary) {
                    if (routeRequestId) {
                        summary.tourRequestId = String(routeRequestId);
                    }
                    const index = conversations.findIndex(function (item) {
                        return item.id === summary.id;
                    });
                    if (index === -1) {
                        conversations.unshift(summary);
                    } else {
                        conversations[index] = Object.assign({}, conversations[index], summary, { unread: 0 });
                    }
                    conversations = sortConversationsByLatest(conversations);
                    activeConversation = conversations.find(function (item) {
                        return item.id === summary.id;
                    }) || summary;
                }

                const key = String(activeConversation && activeConversation.id ? activeConversation.id : conversationId);
                messagesByConversation[key] = messages;
                if (activeConversation) {
                    activeConversation.unread = 0;
                }

                renderList();
                renderMessages();
                return messages;
            }).catch(function () {
                return null;
            });
        }

        list.addEventListener('click', function (event) {
            const row = event.target.closest('[data-conversation-id]');
            if (!row) {
                return;
            }

            const id = String(row.dataset.conversationId || '');
            const found = conversations.find(function (conversation) {
                return conversation.id === id;
            });
            if (!found) {
                return;
            }

            activeConversation = found;
            mobileChatOpen = true;
            activeConversation.unread = 0;
            renderList();
            loadConversation(id);
        });

        if (chatBackBtn) {
            chatBackBtn.addEventListener('click', function () {
                if (activeConversation && activeConversation.id) {
                    const paymentStateMap = getChatPaymentStateMap();
                    if (paymentStateMap[activeConversation.id]) {
                        delete paymentStateMap[activeConversation.id];
                        localStorage.setItem(CHAT_PAYMENT_STATE_KEY, JSON.stringify(paymentStateMap));
                    }
                }
                mobileChatOpen = false;
                setConversationVisibility(false);
                if (conversationPanel) {
                    conversationPanel.scrollIntoView({ block: 'start', behavior: 'smooth' });
                }
            });
        }

        if (chatShowListBtn) {
            chatShowListBtn.addEventListener('click', function () {
                if (activeConversation && activeConversation.id) {
                    const paymentStateMap = getChatPaymentStateMap();
                    if (paymentStateMap[activeConversation.id]) {
                        delete paymentStateMap[activeConversation.id];
                        localStorage.setItem(CHAT_PAYMENT_STATE_KEY, JSON.stringify(paymentStateMap));
                    }
                }
                mobileChatOpen = false;
                setConversationVisibility(false);
                if (conversationPanel) {
                    conversationPanel.scrollIntoView({ block: 'start', behavior: 'smooth' });
                }
            });
        }

        if (chatRefreshBtn) {
            chatRefreshBtn.addEventListener('click', function () {
                if (activeConversation && activeConversation.id) {
                    loadConversation(activeConversation.id).then(function () {
                        syncThreads();
                    });
                    return;
                }

                syncThreads();
            });
        }

        if (emojiToggle && emojiPanel) {
            positionEmojiPanel = function () {
                const toggleRect = emojiToggle.getBoundingClientRect();
                const panelRect = emojiPanel.getBoundingClientRect();
                const panelWidth = Number(panelRect.width || 190);

                let left = toggleRect.left;
                left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
                const top = toggleRect.bottom + 8;

                emojiPanel.style.position = 'fixed';
                emojiPanel.style.left = Math.round(left) + 'px';
                emojiPanel.style.top = Math.round(top) + 'px';
                emojiPanel.style.right = 'auto';
                emojiPanel.style.bottom = 'auto';
            };

            emojiToggle.addEventListener('click', function () {
                const opening = emojiPanel.style.display !== 'block';
                emojiPanel.style.display = opening ? 'block' : 'none';
                if (opening) {
                    positionEmojiPanel();
                }
            });

            emojiPanel.addEventListener('click', function (event) {
                const button = event.target.closest('[data-emoji]');
                if (!button) {
                    return;
                }
                chatInput.value += String(button.dataset.emoji || '');
                chatInput.focus();
            });

            document.addEventListener('click', function (event) {
                const target = event.target;
                const clickedToggle = target && target.closest ? target.closest('#emojiToggle') : null;
                if (!emojiPanel.contains(target) && !clickedToggle) {
                    emojiPanel.style.display = 'none';
                }
            });
        }

        chatForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!activeConversation) {
                return;
            }

            const text = String(chatInput.value || '').trim();
            if (!text) {
                return;
            }

            const conversationId = String(activeConversation.id);
            const current = messagesByConversation[conversationId] || [];
            const draft = {
                id: 'draft-' + Date.now(),
                mine: true,
                text: text,
                senderAvatar: findMineAvatar(conversationId),
                isRead: false,
                createdAt: nowISO()
            };
            messagesByConversation[conversationId] = current.concat([draft]);
            activeConversation.last = text;
            activeConversation.lastTime = draft.createdAt;
            chatInput.value = '';
            renderMessages();
            renderList();

            apiRequest('/guide/messages/threads/' + encodeURIComponent(conversationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ body: text })
            }).then(function (data) {
                const sent = data && data.message ? normalizeMessage(data.message) : null;
                const fresh = (messagesByConversation[conversationId] || []).filter(function (message) {
                    return !String(message.id || '').startsWith('draft-');
                });
                if (sent) {
                    const alreadyExists = fresh.some(function (message) {
                        return String(message.id) === String(sent.id);
                    });
                    if (!alreadyExists) {
                        fresh.push(sent);
                    }
                }
                messagesByConversation[conversationId] = fresh;
                activeConversation.last = sent && sent.text ? sent.text : text;
                activeConversation.lastTime = sent && sent.createdAt ? sent.createdAt : nowISO();
                renderMessages();
                syncThreads();
                syncGuideNotificationsFromApi();
            }).catch(function () {
                showToast('Unable to send message right now.', 'danger');
                syncThreads();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                activeSearch = String(searchInput.value || '').trim().toLowerCase();
                renderList();
            });
        }

        window.addEventListener('resize', function () {
            setConversationVisibility(Boolean(activeConversation) && Boolean(mobileChatOpen));
            if (emojiPanel && emojiPanel.style.display === 'block') {
                positionEmojiPanel();
            }
        });

        setConversationVisibility(Boolean(activeConversation) && Boolean(mobileChatOpen));

        window.addEventListener('storage', function (event) {
            if (!event) {
                return;
            }

            if (
                event.key === CHAT_PAYMENT_STATE_KEY
                || event.key === CHAT_PAYMENT_TRANSACTIONS_KEY
                || event.key === CHAT_SIMULATED_EVENTS_KEY
            ) {
                renderList();
                renderMessages();
                renderPaymentCard();
            }
        });

        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        let realtimeSubscribed = false;

        function bindRealtime() {
            if (realtimeSubscribed) {
                return;
            }

            subscribeRealtime('tourist-messages', 'message.sent', function (payload) {
                const incoming = payload && payload.message ? payload.message : null;
                if (!incoming || !incoming.conversationId) {
                    return;
                }

                const key = String(incoming.conversationId);
                const existingConversation = conversations.find(function (item) {
                    return item.id === key;
                });

                if (!existingConversation) {
                    syncThreads();
                    syncGuideNotificationsFromApi();
                    return;
                }

                const threadKey = String(existingConversation.id || key);
                const listForConversation = messagesByConversation[threadKey] || [];
                const alreadyExists = listForConversation.some(function (message) {
                    return String(message.id) === String(incoming.id);
                });

                const mine = existingConversation.guideId && String(existingConversation.guideId) === String(incoming.senderId || '');
                if (!alreadyExists) {
                    listForConversation.push(normalizeMessage({
                        id: incoming.id,
                        mine: mine,
                        text: incoming.body || '',
                        senderId: incoming.senderId,
                        senderAvatar: incoming.senderAvatar,
                        isRead: Boolean(incoming.isRead),
                        createdAt: incoming.createdAt
                    }));
                    messagesByConversation[threadKey] = listForConversation;
                }

                existingConversation.last = String(incoming.body || '');
                existingConversation.lastTime = String(incoming.createdAt || nowISO());
                if ((!activeConversation || activeConversation.id !== threadKey) && !mine) {
                    existingConversation.unread = Number(existingConversation.unread || 0) + 1;
                }

                conversations = sortConversationsByLatest(conversations);

                if (activeConversation && activeConversation.id === threadKey) {
                    loadConversation(threadKey);
                } else {
                    renderList();
                }

                syncGuideNotificationsFromApi();
            });

            realtimeSubscribed = true;
        }

        if (params.get('starter') === '1') {
            chatInput.value = STARTER_MESSAGE;
        }

        syncThreads().then(function () {
            bindRealtime();
        });
    }

    function initProfilePage() {
        if (document.body.dataset.page !== 'guide-profile') {
            return;
        }

        const form = qs('#guideProfileForm');
        const avatarInput = qs('#guideAvatarInput');
        const avatarPreview = qs('#guideAvatarPreview');
        let profile = normalizeGuideProfileSnapshot(getGuideProfile());

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
                avatarPreview.src = normalizeAssetPath(profile.avatar, '/images/manila.jpg');
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
                const submitButton = qs('button[type="submit"]', form);
                const previousLabel = submitButton ? submitButton.innerHTML : '';
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Saving...';
                }

                const formData = new FormData();
                formData.append('name', fields.name ? fields.name.value.trim() : profile.name);
                formData.append('location', fields.location ? fields.location.value.trim() : profile.location);
                formData.append('bio', fields.bio ? fields.bio.value.trim() : profile.bio);
                formData.append('phone', fields.phone ? fields.phone.value.trim() : profile.phone);
                formData.append('email', fields.email ? fields.email.value.trim() : profile.email);
                formData.append('specialties', fields.specialties ? fields.specialties.value.trim() : profile.specialties);
                formData.append('languages', fields.languages ? fields.languages.value.trim() : profile.languages);
                formData.append('certifications', fields.certifications ? fields.certifications.value.trim() : profile.certifications);
                formData.append('social', fields.social ? fields.social.value.trim() : profile.social);

                const years = profile && profile.yearsOfExperience ? Number(profile.yearsOfExperience) : 0;
                formData.append('years_of_experience', String(Number.isFinite(years) ? years : 0));

                if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                    formData.append('avatar', avatarInput.files[0]);
                }

                updateGuideProfileInApi(formData).then(function (updated) {
                    profile = normalizeGuideProfileSnapshot(updated);
                    showToast('Guide profile saved.', 'success');
                    fillProfileView();
                    if (avatarInput) {
                        avatarInput.value = '';
                    }
                }).catch(function (error) {
                    showToast(error && error.message ? error.message : 'Unable to save profile right now.', 'danger');
                }).finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = previousLabel;
                    }
                });
            });
        }

        fillProfileView();
        syncGuideProfileFromApi().then(function (freshProfile) {
            profile = normalizeGuideProfileSnapshot(freshProfile);
            fillProfileView();
        });
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
            host.innerHTML = '<div class="dash-empty-state"><i class="fa-regular fa-star"></i><p>No reviews yet.</p></div>';
            return;
        }

        const latestReviews = reviews.slice().sort(function (a, b) {
            return (Date.parse(String(b.bookedDate || '')) || 0) - (Date.parse(String(a.bookedDate || '')) || 0);
        }).slice(0, 5);

        host.classList.add('d-grid', 'gap-2');
        latestReviews.forEach(function (review) {
            const tour = tours[review.tourId];
            const relatedBooking = bookings.find(function (booking) {
                return booking.tourId === review.tourId && String(booking.touristName || '').trim().toLowerCase() === String(review.reviewer || '').trim().toLowerCase();
            });
            const reviewerAvatar = normalizeAssetPath(
                review.reviewerAvatar || review.touristAvatar || (relatedBooking && relatedBooking.touristAvatar),
                '/images/manila.jpg'
            );
            const listingTitle = tour ? tour.title : String(review.listingTitle || 'Tour Listing');
            const stars = '★'.repeat(Math.max(1, Math.min(5, Number(review.rating || 0)))) + '☆'.repeat(5 - Math.max(1, Math.min(5, Number(review.rating || 0))));
            const commentPreview = String(review.comment || '').length > 100 ? String(review.comment).slice(0, 97) + '…' : String(review.comment || '');
            const row = document.createElement('article');
            row.className = 'settings-card';
            row.style.cssText = 'padding:12px 14px;';
            row.innerHTML = [
                '<div class="d-flex align-items-center gap-2 mb-1">',
                '<img src="', escapeHtml(reviewerAvatar), '" alt="', escapeHtml(review.reviewer), '" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';">',
                '<div>',
                '<strong class="d-block" style="font-size:0.9rem;">', escapeHtml(review.reviewer), '</strong>',
                '<span class="text-muted" style="font-size:0.78rem;">', escapeHtml(listingTitle), '</span>',
                '</div>',
                '<span class="ms-auto" style="color:#d97706;font-size:0.85rem;letter-spacing:1px;">', escapeHtml(stars), '</span>',
                '</div>',
                commentPreview ? '<p class="mb-0 small text-muted" style="padding-left:46px;">' + escapeHtml(commentPreview) + '</p>' : ''
            ].join('');
            host.appendChild(row);
        });
    }

    function collectTourRequestTransactions() {
        const transactions = getSimulatedPaymentTransactions().filter(function (item) {
            return item && typeof item === 'object';
        });
        const paymentStateMap = getChatPaymentStateMap();
        Object.keys(paymentStateMap).forEach(function (key) {
            const state = paymentStateMap[key];
            if (!state || typeof state !==  'object' || !(Number(state.amount || 0) > 0)) { return; }
            const status = String(state.status || '').toLowerCase();
            if (status !== 'paid' && status !== 'pending_cash_on_tour') { return; }
            const requestId = String(state.requestId || '').trim();
            const conversationId = String(state.conversationId || key || '').trim();
            const matchIndex = transactions.findIndex(function (item) {
                if (!item || typeof item !== 'object') { return false; }
                if (requestId && String(item.requestId || '').trim() === requestId) { return true; }
                if (conversationId && String(item.conversationId || '').trim() === conversationId) { return true; }
                return false;
            });
            const normalized = {
                id: String(state.id || ('pay-state-' + conversationId)),
                conversationId: conversationId,
                requestId: requestId,
                guideId: String(state.guideId || ''),
                guideName: String(state.guideName || 'Guide'),
                touristName: String(state.touristName || 'Tourist'),
                touristAvatar: (function () {
                    // Prefer avatar from matched transaction (set by tourist during payment)
                    if (matchIndex >= 0 && transactions[matchIndex] && transactions[matchIndex].touristAvatar) {
                        return normalizeAssetPath(transactions[matchIndex].touristAvatar, '/images/manila.jpg');
                    }
                    // Fall back to conversation avatar
                    const convos = readStore(GUIDE_CONVERSATIONS_KEY, []);
                    const convo = (Array.isArray(convos) ? convos : []).find(function (c) {
                        if (conversationId && String(c.id || '') === conversationId) { return true; }
                        if (requestId && String(c.tourRequestId || '') === requestId) { return true; }
                        return false;
                    });
                    return normalizeAssetPath((convo && convo.avatar) || (state.touristAvatar || ''), '/images/manila.jpg');
                })(),
                tourTitle: String(state.tourTitle || 'Tour request'),
                amount: Math.max(0, Number(state.amount || 0)),
                paymentMethod: String(state.paymentMethod || 'N/A'),
                status: status,
                paidAt: status === 'paid' ? String(state.paidAt || state.updatedAt || nowISO()) : null,
                date: String(state.updatedAt || state.paidAt || state.pendingAt || nowISO()),
                updatedAt: String(state.updatedAt || nowISO()),
                createdAt: String(state.createdAt || state.updatedAt || nowISO())
            };
            if (matchIndex >= 0) {
                transactions[matchIndex] = Object.assign({}, transactions[matchIndex], normalized);
            } else {
                transactions.push(normalized);
            }
        });
        transactions.sort(function (a, b) {
            const left = Date.parse(String((a && (a.paidAt || a.date || a.updatedAt || a.createdAt)) || '')) || 0;
            const right = Date.parse(String((b && (b.paidAt || b.date || b.updatedAt || b.createdAt)) || '')) || 0;
            return right - left;
        });
        return transactions;
    }

    function collectAllEarningsTransactions() {
        // Tour request payments (chat-based custom tour requests)
        const requestTxs = collectTourRequestTransactions();

        // Tour listing booking transactions (synthesized from bookings × tour price)
        const tours = getGuideTours();
        const tourMap = tours.reduce(function (acc, t) { acc[t.id] = t; return acc; }, {});
        const bookings = getGuideBookings();
        const listingTxs = bookings
            .filter(function (bk) {
                const booking = bk && typeof bk === 'object' ? bk : {};
                const lifecycle = String(booking.bookingStatus || booking.statusRaw || booking.status || '').trim().toLowerCase();
                const payment = String(booking.paymentStatus || '').trim().toLowerCase();
                const isCancelled = lifecycle === 'cancelled' || lifecycle === 'declined';

                return payment === 'paid' && !isCancelled;
            })
            .map(function (bk) {
                const tour = tourMap[bk.tourId];
                const price = tour ? Number(tour.price || 0) : 0;
                const guests = parseGuestCount(bk.guests);
                // Prefer DB-stored total_amount (captured from API); fall back to price × guests
                const amount = Number(bk.amount || 0) || (price * guests);
                // Prefer booking.tourTitle from API; fall back to tour.title or default
                const bookingTourTitle = String(bk.tourTitle || '').trim();
                const tourTitle = bookingTourTitle || (tour ? String(tour.title || 'Tour Listing') : 'Tour Listing');
                return {
                    id: 'listing-' + String(bk.id),
                    type: 'listing',
                    touristName: String(bk.touristName || 'Tourist'),
                    touristAvatar: normalizeAssetPath(bk.touristAvatar, '/images/manila.jpg'),
                    tourTitle: tourTitle,
                    amount: amount,
                    paymentMethod: 'Tour Booking',
                    status: 'paid',
                    paidAt: bk.paymentReceivedAt || bk.paidAt || bk.bookingDate || null,
                    date: bk.paymentReceivedAt || bk.paidAt || bk.bookingDate || nowISO(),
                    updatedAt: bk.updatedAt || bk.paymentReceivedAt || bk.paidAt || bk.bookingDate || nowISO(),
                    createdAt: bk.createdAt || bk.bookingDate || nowISO()
                };
            });

        const all = listingTxs.concat(requestTxs);
        all.sort(function (a, b) {
            const left = Date.parse(String((a && (a.paidAt || a.date || a.updatedAt || a.createdAt)) || '')) || 0;
            const right = Date.parse(String((b && (b.paidAt || b.date || b.updatedAt || b.createdAt)) || '')) || 0;
            return right - left;
        });
        return all;
    }

    function normalizeDashboardBooking(item) {
        const source = item && typeof item === 'object' ? item : {};
        const guestCount = Math.max(1, Number(source.guestCount || source.guests || 1));
        return {
            id: String(source.id || uid('booking')),
            tourId: source.tourId ? String(source.tourId) : '',
            tourTitle: String(source.tourTitle || ''),
            touristName: String(source.touristName || 'Tourist'),
            touristAvatar: normalizeAssetPath(source.touristAvatar, '/images/manila.jpg'),
            bookingDate: source.bookingDate || null,
            guests: String(source.guests || (guestCount + ' guest' + (guestCount > 1 ? 's' : ''))),
            status: String(source.statusRaw || source.status || 'pending').trim().toLowerCase(),
            amount: Math.max(0, Number(source.total || source.amount || 0))
        };
    }

    function normalizeDashboardReview(item) {
        const source = item && typeof item === 'object' ? item : {};
        return {
            id: String(source.id || uid('review')),
            tourId: String(source.tourId || ''),
            listingTitle: String(source.listingTitle || 'Tour Listing'),
            reviewer: String(source.reviewer || 'Tourist'),
            reviewerAvatar: normalizeAssetPath(source.reviewerAvatar || source.touristAvatar || source.avatar, '/images/manila.jpg'),
            rating: Math.max(1, Math.min(5, Number(source.rating || 0))),
            comment: String(source.comment || ''),
            bookedDate: source.bookedDate || null,
            guests: String(source.guests || '1 guest')
        };
    }

    function initDashboardPage() {
        if (document.body.dataset.page !== 'guide-dashboard') {
            return;
        }

        function renderStatsFromSnapshot(statsSnapshot) {
            const tours = getGuideTours();
            const bookings = getGuideBookings();
            const reviews = getGuideReviews();

            // Total earnings = ALL paid transactions (tour listings + tour requests)
            const totalEarnings = collectAllEarningsTransactions()
                .filter(function (t) { return String(t.status || '').toLowerCase() === 'paid'; })
                .reduce(function (sum, t) { return sum + Math.max(0, Number(t.amount || 0)); }, 0);

            const fallback = {
                my_tours: tours.length,
                pending_requests: bookings.filter(function (booking) {
                    return String(booking.status || '').trim().toLowerCase() === 'pending';
                }).length,
                accepted: bookings.filter(function (booking) {
                    return isBookedStatus(booking.status);
                }).length,
                total_earnings: totalEarnings,
                average_rating: reviews.length
                    ? Number((reviews.reduce(function (sum, review) {
                        return sum + Number(review.rating || 0);
                    }, 0) / reviews.length).toFixed(1))
                    : 0,
            };

            const stats = statsSnapshot && typeof statsSnapshot === 'object'
                ? Object.assign({}, fallback, statsSnapshot, {
                    // Always use our computed total (both listing + request) — DB value is incomplete
                    total_earnings: totalEarnings
                  })
                : fallback;

            const statTours = qs('#statTours');
            const statPending = qs('#statPending');
            const statAccepted = qs('#statAccepted');
            const statEarnings = qs('#statEarnings');
            const statRating = qs('#statRating');

            if (statTours) {
                statTours.textContent = String(stats.my_tours || 0);
            }
            if (statPending) {
                statPending.textContent = String(stats.pending_requests || 0);
            }
            if (statAccepted) {
                statAccepted.textContent = String(stats.accepted || 0);
            }
            if (statEarnings) {
                statEarnings.textContent = formatPeso(Number(stats.total_earnings || 0));
            }
            if (statRating) {
                statRating.textContent = Number(stats.average_rating || 0).toFixed(1);
            }
        }

        function renderSimulatedEarningsPanel() {
            const totalNode = qs('#simulatedEarningsValue');
            const listNode = qs('#simulatedTransactionList');
            const metaNode = qs('#simulatedTransactionMeta');
            if (!totalNode && !listNode) {
                return;
            }

            const transactions = collectTourRequestTransactions();

            const paidTransactions = transactions.filter(function (item) {
                return String(item.status || '').toLowerCase() === 'paid';
            });

            const total = paidTransactions.reduce(function (sum, item) {
                return sum + Math.max(0, Number(item.amount || 0));
            }, 0);

            if (totalNode) {
                totalNode.textContent = formatSimulatedPeso(total);
            }

            if (!listNode) {
                return;
            }

            if (!transactions.length) {
                if (metaNode) {
                    metaNode.textContent = 'No tour request payments to show yet.';
                }
                listNode.innerHTML = '<div class="dash-empty-state"><i class="fa-solid fa-receipt"></i><p>No tour request payments yet.</p></div>';
                return;
            }

            const overviewTransactions = transactions.slice(0, 3);

            if (metaNode) {
                const shown = overviewTransactions.length;
                if (transactions.length > shown) {
                    metaNode.textContent = 'Showing latest ' + shown + ' of ' + transactions.length + ' records. Click View More for full list.';
                } else {
                    metaNode.textContent = 'Showing all ' + shown + ' record' + (shown === 1 ? '' : 's') + '.';
                }
            }

            const conversationAvatarById = new Map();
            const storedConversations = readStore(GUIDE_CONVERSATIONS_KEY, []);
            (Array.isArray(storedConversations) ? storedConversations : []).forEach(function (conversation) {
                if (!conversation || typeof conversation !== 'object') { return; }
                const cid = String(conversation.id || '').trim();
                if (cid) { conversationAvatarById.set(cid, normalizeAssetPath(conversation.avatar, '/images/manila.jpg')); }
            });

            listNode.innerHTML = overviewTransactions.map(function (item) {
                const amount = formatSimulatedPeso(Number(item.amount || 0));
                const method = String(item.paymentMethod || 'N/A');
                const tourist = String(item.touristName || 'Tourist');
                const title = String(item.tourTitle || 'Tour request');
                const isPaid = String(item.status || '').toLowerCase() === 'paid';
                const status = isPaid ? 'PAID' : 'Pending (Cash on Tour)';
                const statusClass = isPaid ? 'paid' : 'pending';
                const cid = String(item.conversationId || '').trim();
                const avatarSrc = item.touristAvatar || item.avatar || (cid ? conversationAvatarById.get(cid) : null) || '/images/manila.jpg';
                const avatar = normalizeAssetPath(avatarSrc, '/images/manila.jpg');
                const rawDate = String(item.paidAt || item.date || item.updatedAt || item.createdAt || '');
                const parsedDate = rawDate ? new Date(rawDate) : null;
                const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'Unknown time';

                return [
                    '<article class="simulated-transaction-row">',
                    '<div class="simulated-transaction-main">',
                    '<img class="simulated-transaction-avatar" src="', escapeHtml(avatar), '" alt="', escapeHtml(tourist), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';">',
                    '<div class="simulated-transaction-content">',
                    '<strong class="simulated-transaction-name">', escapeHtml(tourist), '</strong>',
                    '<div class="simulated-transaction-title meta">', escapeHtml(title), '</div>',
                    '<div class="simulated-transaction-status-line"><span class="chat-payment-badge ', statusClass, '">', escapeHtml(status), '</span></div>',
                    '<div class="simulated-transaction-date meta">', escapeHtml(dateLabel), '</div>',
                    '<div class="simulated-transaction-amount-line"><span class="amount">', escapeHtml(amount), '</span><span class="meta"> · </span><span class="method">', escapeHtml(method), '</span></div>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function renderDashboard(statsSnapshot) {
            renderStatsFromSnapshot(statsSnapshot);
            renderSimulatedEarningsPanel();
            renderPendingBookingsSummary(qs('#dashboardPendingList'));
            renderReviewsSummary(qs('#dashboardReviewList'));
        }

        renderDashboard();

        qsa('[data-stat-href]').forEach(function (card) {
            card.addEventListener('click', function () {
                window.location.href = card.dataset.statHref;
            });
            card.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.location.href = card.dataset.statHref;
                }
            });
        });

        Promise.allSettled([
            apiRequest('/guide/tours'),
            apiRequest('/guide/booking-requests'),
            apiRequest('/guide/dashboard')
        ]).then(function (results) {
            const toursResult = results[0];
            const bookingsResult = results[1];
            const dashboardResult = results[2];

            const toursPayload = toursResult && toursResult.status === 'fulfilled' ? toursResult.value : null;
            const bookingsPayload = bookingsResult && bookingsResult.status === 'fulfilled' ? bookingsResult.value : null;
            const dashboardPayload = dashboardResult && dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;

            if (toursPayload && Array.isArray(toursPayload.listings)) {
                setGuideTours(toursPayload.listings.map(mapApiListingToGuideTour));
            }
            if (bookingsPayload && Array.isArray(bookingsPayload.bookings)) {
                setGuideBookings(bookingsPayload.bookings.map(normalizeDashboardBooking));
            }
            if (dashboardPayload && Array.isArray(dashboardPayload.reviews)) {
                setGuideReviews(dashboardPayload.reviews.map(normalizeDashboardReview));
            }

            renderDashboard(dashboardPayload && dashboardPayload.stats ? dashboardPayload.stats : null);
        });

        window.addEventListener('storage', function (event) {
            if (event && (event.key === CHAT_PAYMENT_TRANSACTIONS_KEY || event.key === CHAT_PAYMENT_STATE_KEY)) {
                renderDashboard();
            }
        });

        window.setInterval(renderDashboard, 30000);
    }

    function initEarningsBreakdownPage() {
        if (document.body.dataset.page !== 'guide-earnings-breakdown') { return; }
        const listNode = qs('#earningsBreakdownList');
        const totalNode = qs('#earningsBreakdownTotal');

        function render() {
            const transactions = collectAllEarningsTransactions();
            const conversationAvatarById = new Map();
            const storedConversations = readStore(GUIDE_CONVERSATIONS_KEY, []);
            (Array.isArray(storedConversations) ? storedConversations : []).forEach(function (c) {
                if (!c || typeof c !== 'object') { return; }
                const cid = String(c.id || '').trim();
                if (cid) { conversationAvatarById.set(cid, normalizeAssetPath(c.avatar, '/images/manila.jpg')); }
            });

            const paidTotal = transactions.filter(function (t) {
                return String(t.status || '').toLowerCase() === 'paid';
            }).reduce(function (sum, t) { return sum + Math.max(0, Number(t.amount || 0)); }, 0);

            if (totalNode) { totalNode.textContent = formatSimulatedPeso(paidTotal); }

            if (!listNode) { return; }
            if (!transactions.length) {
                listNode.innerHTML = '<div class="dash-empty-state"><i class="fa-solid fa-coins"></i><p>No earnings yet.</p></div>';
                return;
            }

            listNode.innerHTML = transactions.map(function (item) {
                const amount = formatSimulatedPeso(Number(item.amount || 0));
                const method = String(item.paymentMethod || 'N/A');
                const tourist = String(item.touristName || 'Tourist');
                const title = String(item.tourTitle || 'Tour request');
                const isPaid = String(item.status || '').toLowerCase() === 'paid';
                const statusLabel = isPaid ? 'PAID' : 'Pending (Cash on Tour)';
                const statusClass = isPaid ? 'paid' : 'pending';
                const cid = String(item.conversationId || '').trim();
                const avatarSrc = item.touristAvatar || item.avatar || (cid ? conversationAvatarById.get(cid) : null) || '/images/manila.jpg';
                const avatar = normalizeAssetPath(avatarSrc, '/images/manila.jpg');
                const rawDate = String(item.paidAt || item.date || item.updatedAt || item.createdAt || '');
                const parsedDate = rawDate ? new Date(rawDate) : null;
                const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'Unknown time';
                const isListing = item.type === 'listing';

                return [
                    '<article class="simulated-transaction-row">',
                    '<div class="simulated-transaction-main">',
                    '<img class="simulated-transaction-avatar" src="', escapeHtml(avatar), '" alt="', escapeHtml(tourist), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';">',
                    '<div class="simulated-transaction-content">',
                    '<strong class="simulated-transaction-name">', escapeHtml(tourist), '</strong>',
                    '<div class="simulated-transaction-title meta"><strong>', escapeHtml(title), '</strong>',
                    isListing ? ' <span class="meta">(Tour Listing)</span>' : ' <span class="meta">(Tour Request)</span>',
                    '</div>',
                    '<div class="simulated-transaction-status-line"><span class="chat-payment-badge ', statusClass, '">', escapeHtml(statusLabel), '</span></div>',
                    '<div class="simulated-transaction-date meta">', escapeHtml(dateLabel), '</div>',
                    '<div class="simulated-transaction-amount-line"><span class="amount">', escapeHtml(amount), '</span><span class="meta"> · </span><span class="method">', escapeHtml(method), '</span></div>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        // Show cached data immediately, then refresh from API so listing amounts are accurate
        render();
        Promise.allSettled([
            apiRequest('/guide/tours'),
            apiRequest('/guide/booking-requests')
        ]).then(function (results) {
            const toursPayload = results[0] && results[0].status === 'fulfilled' ? results[0].value : null;
            const bookingsPayload = results[1] && results[1].status === 'fulfilled' ? results[1].value : null;
            if (toursPayload && Array.isArray(toursPayload.listings)) {
                setGuideTours(toursPayload.listings.map(mapApiListingToGuideTour));
            }
            if (bookingsPayload && Array.isArray(bookingsPayload.bookings)) {
                setGuideBookings(bookingsPayload.bookings.map(normalizeDashboardBooking));
            }
            render();
        });

        window.addEventListener('storage', function (event) {
            if (event && (event.key === CHAT_PAYMENT_TRANSACTIONS_KEY || event.key === CHAT_PAYMENT_STATE_KEY)) { render(); }
        });
        window.setInterval(render, 30000);
    }

    function initTourRequestPaymentsPage() {
        if (document.body.dataset.page !== 'guide-request-payments') { return; }
        const listNode = qs('#requestPaymentsList');

        function render() {
            const transactions = collectTourRequestTransactions();
            const conversationAvatarById = new Map();
            const storedConversations = readStore(GUIDE_CONVERSATIONS_KEY, []);
            (Array.isArray(storedConversations) ? storedConversations : []).forEach(function (c) {
                if (!c || typeof c !== 'object') { return; }
                const cid = String(c.id || '').trim();
                if (cid) { conversationAvatarById.set(cid, normalizeAssetPath(c.avatar, '/images/manila.jpg')); }
            });

            if (!listNode) { return; }
            if (!transactions.length) {
                listNode.innerHTML = '<div class="dash-empty-state"><i class="fa-solid fa-file-invoice-dollar"></i><p>No tour request payments yet.</p></div>';
                return;
            }

            listNode.innerHTML = transactions.map(function (item) {
                const amount = formatSimulatedPeso(Number(item.amount || 0));
                const method = String(item.paymentMethod || 'N/A');
                const tourist = String(item.touristName || 'Tourist');
                const title = String(item.tourTitle || 'Tour request');
                const isPaid = String(item.status || '').toLowerCase() === 'paid';
                const statusLabel = isPaid ? 'PAID' : 'Pending (Cash on Tour)';
                const statusClass = isPaid ? 'paid' : 'pending';
                const cid = String(item.conversationId || '').trim();
                const avatarSrc = item.touristAvatar || item.avatar || (cid ? conversationAvatarById.get(cid) : null) || '/images/manila.jpg';
                const avatar = normalizeAssetPath(avatarSrc, '/images/manila.jpg');
                const rawDate = String(item.paidAt || item.date || item.updatedAt || item.createdAt || '');
                const parsedDate = rawDate ? new Date(rawDate) : null;
                const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : 'Unknown time';

                return [
                    '<article class="simulated-transaction-row">',
                    '<div class="simulated-transaction-main">',
                    '<img class="simulated-transaction-avatar" src="', escapeHtml(avatar), '" alt="', escapeHtml(tourist), '" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';">',
                    '<div class="simulated-transaction-content">',
                    '<strong class="simulated-transaction-name">', escapeHtml(tourist), '</strong>',
                    '<div class="simulated-transaction-title meta"><strong>', escapeHtml(title), '</strong></div>',
                    '<div class="simulated-transaction-status-line"><span class="chat-payment-badge ', statusClass, '">', escapeHtml(statusLabel), '</span></div>',
                    '<div class="simulated-transaction-date meta">', escapeHtml(dateLabel), '</div>',
                    '<div class="simulated-transaction-amount-line"><span class="amount">', escapeHtml(amount), '</span><span class="meta"> · </span><span class="method">', escapeHtml(method), '</span></div>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        render();
        window.addEventListener('storage', function (event) {
            if (event && (event.key === CHAT_PAYMENT_TRANSACTIONS_KEY || event.key === CHAT_PAYMENT_STATE_KEY)) { render(); }
        });
        window.setInterval(render, 30000);
    }

    function initGuideReviewsPage() {
        if (document.body.dataset.page !== 'guide-reviews') { return; }
        const listNode = qs('#guideReviewsFullList');

        function render() {
            const tours = getGuideTours().reduce(function (acc, tour) { acc[tour.id] = tour; return acc; }, {});
            const bookings = getGuideBookings();
            const reviews = getGuideReviews();
            if (!listNode) { return; }
            if (!reviews.length) {
                listNode.innerHTML = '<div class="dash-empty-state"><i class="fa-regular fa-star"></i><p>No reviews yet.</p></div>';
                return;
            }

            const sorted = reviews.slice().sort(function (a, b) {
                return (Date.parse(String(b.bookedDate || '')) || 0) - (Date.parse(String(a.bookedDate || '')) || 0);
            });

            listNode.innerHTML = '<div class="d-grid gap-2">' + sorted.map(function (review) {
                const tour = tours[review.tourId];
                const relatedBooking = bookings.find(function (bk) {
                    return bk.tourId === review.tourId && String(bk.touristName || '').trim().toLowerCase() === String(review.reviewer || '').trim().toLowerCase();
                });
                const reviewerAvatar = normalizeAssetPath(
                    review.reviewerAvatar || review.touristAvatar || (relatedBooking && relatedBooking.touristAvatar),
                    '/images/manila.jpg'
                );
                const listingTitle = tour ? tour.title : String(review.listingTitle || 'Tour Listing');
                const stars = '★'.repeat(Math.max(1, Math.min(5, Number(review.rating || 0)))) + '☆'.repeat(5 - Math.max(1, Math.min(5, Number(review.rating || 0))));
                const bookedDateText = relatedBooking
                    ? escapeHtml(formatDate(relatedBooking.bookingDate)) + ' · ' + escapeHtml(relatedBooking.guests || '1 guest')
                    : (review.bookedDate ? escapeHtml(formatDate(review.bookedDate)) : 'N/A');
                return [
                    '<article class="settings-card" style="padding:14px 16px;">',
                    '<div class="d-flex align-items-center gap-2 mb-2">',
                    '<img src="', escapeHtml(reviewerAvatar), '" alt="', escapeHtml(review.reviewer), '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.onerror=null;this.src=\'/images/manila.jpg\';">',
                    '<div class="flex-1">',
                    '<strong class="d-block">', escapeHtml(review.reviewer), '</strong>',
                    '<span class="text-muted small">', escapeHtml(listingTitle), '</span>',
                    '</div>',
                    '<div class="ms-auto text-end">',
                    '<div style="color:#d97706;font-size:0.9rem;">', escapeHtml(stars), '</div>',
                    '<div class="text-muted small">', bookedDateText, '</div>',
                    '</div>',
                    '</div>',
                    review.comment ? '<p class="mb-0 small" style="padding-left:52px;">' + escapeHtml(String(review.comment)) + '</p>' : '',
                    '</article>'
                ].join('');
            }).join('') + '</div>';
        }

        render();
        window.setInterval(render, 30000);
    }

    function initGlobalActions() {
        qsa('.hamburger-dropdown').forEach(function (menu) {
            if (!qs('[data-hamburger-logout]', menu)) {
                const divider = document.createElement('li');
                divider.innerHTML = '<hr class="dropdown-divider">';

                const logoutItem = document.createElement('li');
                logoutItem.innerHTML = '<button class="dropdown-item text-danger" type="button" data-hamburger-logout><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</button>';

                menu.appendChild(divider);
                menu.appendChild(logoutItem);
            }

            if (menu.dataset.boundLogoutAction === 'true') {
                return;
            }

            menu.addEventListener('click', function (event) {
                const clickedItem = event.target.closest('.dropdown-item');
                if (clickedItem) {
                    document.body.classList.remove('sidebar-open');
                }

                const logoutItem = event.target.closest('[data-hamburger-logout]');
                if (!logoutItem) {
                    return;
                }

                event.preventDefault();
                closeContainingDropdown(logoutItem);
                logoutToAuthPage();
            });

            menu.dataset.boundLogoutAction = 'true';
        });

        const logout = qs('#logoutBtn');
        if (logout) {
            logout.addEventListener('click', function (event) {
                event.preventDefault();
                logoutToAuthPage();
            });
        }
    }

    function runInitStep(label, action) {
        try {
            action();
        } catch (error) {
            console.error('Guide init step failed:', label, error);
        }
    }

    function init() {
        runInitStep('dropdown-dismiss-on-navigation', bindDropdownDismissOnNavigation);

        // Bind global actions first so critical controls (like logout) keep working even if other modules fail.
        runInitStep('global-actions', initGlobalActions);
        runInitStep('seed-data', ensureSeedData);
        runInitStep('workspace-profile', function () {
            applyGuideWorkspaceIdentity(getGuideProfile());
        });
        runInitStep('sync-guide-profile', syncGuideProfileFromApi);
        runInitStep('profile-realtime-sync', initProfileRealtimeSync);
        runInitStep('sidebar', initSidebar);
        runInitStep('topbar-scroll', initTopbarScroll);
        runInitStep('active-navigation', setActiveNavigation);
        runInitStep('notifications', initGuideNotifications);

        runInitStep('dashboard-page', initDashboardPage);
        runInitStep('earnings-breakdown-page', initEarningsBreakdownPage);
        runInitStep('request-payments-page', initTourRequestPaymentsPage);
        runInitStep('guide-reviews-page', initGuideReviewsPage);
        runInitStep('request-feed-page', initRequestPostFeedPage);
        runInitStep('booking-requests-page', initBookingRequestsPage);
        runInitStep('tours-page', initToursPage);
        runInitStep('messages-page', initMessagesPage);
        runInitStep('profile-page', initProfilePage);

        runInitStep('notifications-polling', function () {
            window.setInterval(syncGuideNotificationsFromApi, 30000);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();