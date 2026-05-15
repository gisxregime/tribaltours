<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tribaltours | Discover the Philippines</title>
    <meta name="description" content="Explore curated Philippine travel experiences with verified local guides.">
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.cdnfonts.com/css/maragsa" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            corePlugins: {
                preflight: false
            },
            theme: {
                extend: {
                    fontFamily: {
                        display: ['Sora', 'Manrope', 'sans-serif']
                    }
                }
            }
        };
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/landing.css') }}">
</head>
<body>
    <header class="landing-nav" id="landingNav">
        <div class="container nav-shell">
            <a class="brand-lockup" href="{{ route('home') }}" aria-label="Tribaltours home page">
                <span class="brand-mark" aria-hidden="true">
                    <img src="{{ asset('images/favicon.png') }}" alt="Tribaltours logo" width="34" height="34">
                </span>
                <span class="brand-name brand-asimovian">Tribaltours</span>
            </a>

            <nav class="desktop-links" aria-label="Main navigation">
                <a href="{{ route('explore') }}">Explore Tours</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#guide-program">Become a Guide</a>
            </nav>

            <div class="desktop-actions">
                <a class="btn-link" href="{{ route('sign-in') }}">Sign In</a>
                <a class="btn-gold" href="{{ route('get-started') }}">Get Started</a>
            </div>

            <button class="menu-btn" id="menuBtn" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobileMenu">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>

        <div class="mobile-menu" id="mobileMenu">
            <a href="{{ route('explore') }}">Explore Tours</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#guide-program">Become a Guide</a>
            <a href="{{ route('sign-in') }}">Sign In</a>
            <a href="{{ route('get-started') }}">Sign Up</a>
            <a href="{{ route('get-started') }}">Get Started</a>
        </div>
    </header>

    <main>
        <section class="hero" id="top">
            <img class="hero-image" src="{{ asset('images/palawan.jpg') }}" alt="Cinematic Philippine island cliffs" data-carousel="images/palawan.jpg,images/puertoprincessa.jpg,images/carousel2.jpg,images/carousel3.jpg,images/elnido.png">
            <div class="hero-overlay"></div>

            <div class="container hero-grid">
                <div class="hero-left reveal in-view">
                    <h1 class="hero-title">Find Your <span>Perfect Adventure Guide</span> in the Philippines</h1>
                    <p class="hero-copy">Browse curated tours from verified local guides, or post your custom trip request and let guides come to you. Real experiences. Real people.</p>

                    <form class="search-pill" action="{{ route('explore') }}" method="get">
                        <label class="sr-only" for="searchLanding">Search destination</label>
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                        <input id="searchLanding" name="q" type="text" placeholder="Where do you want to go?">
                        <button type="submit">Search Tours</button>
                    </form>
                    <br>

                    <div class="chip-row" aria-label="Quick categories">
                        <span>El Nido Hopping</span>
                        <span>Siargao Surfing</span>
                        <span>Bohol Tarsiers</span>
                        <span>Batanes Scenery</span>
                        <span>Coron Diving</span>
                    </div>

                    <div class="stats-row">
                        <article class="hero-stat">
                            <span class="stat-icon"><i class="fa-solid fa-users"></i></span>
                            <div>
                                <strong>2,400+</strong>
                                <small>Verified Guides</small>
                            </div>
                        </article>
                        <article class="hero-stat">
                            <span class="stat-icon"><span class="star-glyph" aria-hidden="true">★</span></span>
                            <div>
                                <strong>4.9</strong>
                                <small>Avg Rating</small>
                            </div>
                        </article>
                        <article class="hero-stat">
                            <span class="stat-icon"><i class="fa-solid fa-location-dot"></i></span>
                            <div>
                                <strong>140+</strong>
                                <small>Destinations</small>
                            </div>
                        </article>
                    </div>
                </div>

                <aside class="hero-right reveal in-view" aria-label="Featured cards preview">
                    <article class="floating-card d1">
                        <img src="{{ asset('images/pangasinan.jpg') }}" alt="Chocolate Hills and Tarsier Sanctuary">
                        <div class="floating-content">
                            <p>Bohol, Philippines</p>
                            <h3>Chocolate Hills &amp; Tarsiers</h3>
                            <small class="guide-line"><img src="{{ asset('images/39.jpg') }}" alt="Guide"> Chrishian Degaom</small>
                        </div>
                        <div class="floating-meta">
                            <span>★ 4.97</span>
                            <strong>₱ 2,500</strong>
                        </div>
                    </article>

                    <article class="floating-card d2">
                        <img src="{{ asset('images/puertoprincessa.jpg') }}" alt="Island Hopping and Hidden Lagoons">
                        <div class="floating-content">
                            <p>El Nido, Palawan</p>
                            <h3>Island Hopping &amp; Hidden Lagoons</h3>
                            <small class="guide-line"><img src="{{ asset('images/7a.jpg') }}" alt="Guide"> Gwen Diongzon</small>
                        </div>
                        <div class="floating-meta">
                            <span>★ 4.93</span>
                            <strong>₱3,800</strong>
                        </div>
                    </article>

                    <article class="floating-card d3">
                        <img src="{{ asset('images/carousel3.jpg') }}" alt="Surf lessons and Cloud 9 waves">
                        <div class="floating-content">
                            <p>Siargao, Philippines</p>
                            <h3>Surf Lessons &amp; Cloud 9 Waves</h3>
                            <small class="guide-line"><img src="{{ asset('images/caoursel1.webp') }}" alt="Guide"> Reajzedrik Dabi</small>
                        </div>
                        <div class="floating-meta">
                            <span>★ 4.91</span>
                            <strong>₱2,200</strong>
                        </div>
                    </article>
                </aside>
            </div>

            <div class="hero-scroll">SCROLL <i class="fa-solid fa-chevron-down"></i></div>
        </section>

        <section class="section section-soft" id="featured-tours">
            <div class="container">
                <div class="section-head reveal">
                    <div>
                        <p class="section-kicker">Curated Experiences</p>
                        <h2>Featured Tours</h2>
                        <p>Handpicked premium tours from verified local guides. Every experience is reviewed for quality, safety, and authenticity.</p>
                    </div>
                    <a class="outline-btn" href="{{ route('explore') }}">View All Tours</a>
                </div>

                <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/pangasinan.jpg') }}" alt="Bohol Hills" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Featured</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Bohol, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Chocolate Hills &amp; Tarsier Sanctuary</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/39.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Jethro Cabuñas</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.97 (142) • 2 days • 2-8 pax • Easy</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Nature</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Wildlife</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Scenic</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱2,500 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=bohol" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/puertoprincessa.jpg') }}" alt="El Nido" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Featured</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">El Nido, Palawan</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Island Hopping &amp; Hidden Lagoons</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/7a.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Joshua Adrian Badal</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.93 (89) • 2 days • 2-12 pax • Moderate</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Island Hopping</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Snorkeling</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Beach</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱3,800 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=elnido" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/manila.png') }}" alt="Coron" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Featured</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Coron, Palawan</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Shipwreck Diving &amp; Kayangan Lake</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/Manila-4.webp') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Joshua Duhaylungsod</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.88 (176) • 2 days • 2-10 pax • Moderate</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Diving</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Snorkeling</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Shipwreck</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱4,500 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=coron" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/davao.jpg') }}" alt="Davao" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Trekking</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Davao, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Mount Apo Summit Trek</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/intramurous.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Lance Sebastian</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.95 (63) • 3 days • 4-10 pax • Challenging</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Summit</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Trekking</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Camping</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱8,500 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=mtapo" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/carousel2.jpg') }}" alt="Batanes" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Featured</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Batanes, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Windmill Trail &amp; Ivatan Culture</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/manila.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Lloyd Viloria</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.96 (201) • 4 days • 4-12 pax • Easy</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Scenic</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Culture</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Photography</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱6,500 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=batanes" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/carousel3.jpg') }}" alt="Siargao surf" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#556B2F]">Water Sports</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Siargao, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Surf Lessons &amp; Cloud 9 Waves</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/caoursel1.webp') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Marklurence Mandalupe</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.91 (104) • 3 days • 2-8 pax • Moderate</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Surfing</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Beach</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Lessons</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱2,200 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('tour-preview') }}?tour=siargao" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/elnido.png') }}" alt="Palawan elite" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#9A742A]">Elite Pick</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Palawan, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Luxury Island Escape &amp; Lagoon Cruise</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/13.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Dianne Romero</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.90 (74) • 2 days • 2-6 pax • Moderate</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Luxury</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Cruise</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Lagoon</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱7,200 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('explore') }}" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>

                    <article class="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md reveal">
                        <div class="relative">
                            <img src="{{ asset('images/intramurous.jpg') }}" alt="Intramuros city" class="h-48 w-full object-cover">
                            <div class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#556B2F]">City Tour</div>
                        </div>
                        <div class="flex flex-1 flex-col p-4">
                            <p class="text-xs text-stone-500">Manila, Philippines</p>
                            <h3 class="mt-1 line-clamp-2 text-xl font-semibold">Historic Food Walk &amp; Intramuros Stories</h3>
                            <div class="mt-3 flex items-center gap-2 text-sm text-stone-700">
                                <img src="{{ asset('images/16.jpg') }}" alt="Guide" class="h-7 w-7 rounded-full object-cover">
                                <span class="font-medium">Carlo Madrigal</span>
                                <span class="rounded-full bg-[#C7A34A]/20 px-2 py-0.5 text-xs font-semibold text-[#9A742A]">Verified</span>
                            </div>
                            <p class="mt-2 text-sm text-stone-600">4.87 (91) • 1 day • 2-14 pax • Easy</p>
                            <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Culture</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">Food</span>
                                <span class="rounded-full bg-stone-100 px-2 py-1 text-stone-600">History</span>
                            </div>
                            <div class="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                <p class="text-3xl font-bold">₱2,200 <span class="text-sm font-medium text-stone-500">/ person</span></p>
                                <a href="{{ route('explore') }}" class="rounded-full bg-[#C7A34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8923E]">View Tour</a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section section-soft" id="how-it-works">
            <div class="container">
                <div class="center-head reveal">
                    <p class="section-kicker">Simple Process</p>
                    <h2>How Tribaltours Works</h2>
                    <p>Two distinct tracks. Whether you are discovering curated tours or posting a custom request, the process is clear and straightforward.</p>
                </div>

                <div class="process-grid">
                    <article class="process-card gold reveal">
                        <h3>For Tourists</h3>
                        <ol>
                            <li><span>01</span>Browse or Post: Find a curated listing or create a custom request.</li>
                            <li><span>02</span>Connect with Guides: Receive offers from verified guides tailored to your request.</li>
                            <li><span>03</span>Book &amp; Travel: Confirm your itinerary details and enjoy your trip.</li>
                        </ol>
                        <a class="fill-btn gold" href="{{ route('explore') }}">Browse Tours Now</a>
                    </article>

                    <article class="process-card olive reveal">
                        <h3>For Guides</h3>
                        <ol>
                            <li><span>01</span>Apply as a Guide: Set up your profile with local expertise and credentials.</li>
                            <li><span>02</span>Publish Listings: Create tours with pricing, schedules, and group options.</li>
                            <li><span>03</span>Respond to Requests: Propose personalized itineraries and close bookings.</li>
                        </ol>
                        <a class="fill-btn olive" href="{{ route('get-started') }}">Apply as a Guide</a>
                    </article>
                </div>
            </div>
        </section>

        <section class="section custom-cta">
            <div class="container reveal">
                <div class="cta-panel">
                    <div class="cta-copy">
                        <p class="section-kicker">DEMAND-LED BOOKING</p>
                        <h2>Can&apos;t find your perfect tour? <br><span>Post a custom request</span></h2>
                        <p class="cta-desc">Describe your dream trip: destination, dates, group size, and interests. Verified guides will submit tailored offers. You choose who you travel with.</p>
                        <div class="cta-meta" aria-label="CTA highlights">
                            <span>Post in under 2 minutes</span>
                            <span>Receive offers from multiple guides</span>
                        </div>
                    </div>
                    <div class="cta-actions">
                        <button class="btn-gold" type="button" data-bs-toggle="modal" data-bs-target="#createRequestModal">Post a Trip Request</button>
                        <a class="outline-light" href="{{ route('explore') }}">Browse Existing Tours</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="section section-soft" id="guide-program">
            <div class="container guide-grid">
                <div class="guide-copy reveal">
                    <p class="section-kicker">Guide Program</p>
                    <h2>Share Your World. <span>Earn Doing What You Love.</span></h2>
                    <p>Join 2,400+ verified guides on Tribaltours. Travelers are waiting to discover your world.</p>

                    <div class="feature-cards">
                        <article><h3>Set Your Own Rates</h3><p>Price competitively and keep up to 90% of every booking.</p></article>
                        <article><h3>Flexible Schedule</h3><p>Manage availability and accept experiences based on your schedule.</p></article>
                        <article><h3>Global Reach</h3><p>Connect with travelers from across the Philippines and worldwide.</p></article>
                        <article><h3>Verified Badge</h3><p>Build trust through transparent profile checks and guest reviews.</p></article>
                    </div>

                    <article class="process-note">
                        <h3>Application Process</h3>
                        <ul>
                            <li>Submit your guide application with credentials</li>
                            <li>Admin review within 48 business hours</li>
                            <li>Receive approval and unlock listing creation</li>
                            <li>Start publishing and managing your first tours</li>
                        </ul>
                    </article>

                    <a class="fill-btn olive start-guide-btn" href="{{ route('get-started') }}">Start Your Guide Application</a>
                </div>

                <div class="guide-media reveal">
                    <figure class="main-photo"><img src="{{ asset('images/26.jpg') }}" alt="ATV guide adventure"></figure>
                    <article class="earn-card">
                        <strong>P180,000</strong>
                        <small>Monthly top guide earnings</small>
                    </article>
                    <figure class="sub-photo"><img src="{{ asset('images/manila.png') }}" alt="Night bridge city lights"></figure>
                </div>
            </div>
        </section>
    </main>

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
                            <label class="form-label" for="reqTitle">Title</label>
                            <input id="reqTitle" name="title" class="form-control" required type="text" placeholder="Tagum eco-tour with family">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label" for="reqLocation">Destination</label>
                            <input id="reqLocation" name="location" class="form-control" required type="text" placeholder="Tagum City">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="reqDuration">Duration</label>
                            <input id="reqDuration" name="duration" class="form-range" type="range" min="1" max="14" value="3">
                            <small id="reqDurationValue" class="text-muted">3 days</small>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="reqRegion">Region</label>
                            <select id="reqRegion" class="form-select" name="region" required>
                                <option value="Davao del Norte" selected>Davao del Norte</option>
                                <option value="Metro Manila">Metro Manila</option>
                                <option value="Cebu">Cebu</option>
                                <option value="Davao City">Davao City</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="reqBudgetMin">Min Budget</label>
                            <input id="reqBudgetMin" name="budgetMin" class="form-control" type="number" min="100" value="3000">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="reqBudgetMax">Max Budget</label>
                            <input id="reqBudgetMax" name="budgetMax" class="form-control" type="number" min="100" value="5500">
                        </div>
                        <div class="col-12">
                            <small id="reqBudgetPreview" class="text-muted">PHP 3,000 - PHP 5,500</small>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Adults</label>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-outline-secondary" type="button" data-counter-btn="adultInput" data-counter-type="minus"><i class="fa-solid fa-minus"></i></button>
                                <input id="adultInput" name="adults" class="form-control" type="number" value="1" min="1">
                                <button class="btn btn-outline-secondary" type="button" data-counter-btn="adultInput" data-counter-type="plus"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <small class="text-muted">Adults count: <span id="adultsCount">1</span></small>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Children</label>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-outline-secondary" type="button" data-counter-btn="childInput" data-counter-type="minus"><i class="fa-solid fa-minus"></i></button>
                                <input id="childInput" name="children" class="form-control" type="number" value="0" min="0">
                                <button class="btn btn-outline-secondary" type="button" data-counter-btn="childInput" data-counter-type="plus"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <small class="text-muted">Children count: <span id="childrenCount">0</span></small>
                        </div>
                        <div class="col-12">
                            <label class="form-label">Interests</label>
                            <div class="d-flex gap-3 flex-wrap">
                                <label><input type="checkbox" name="interests[]" value="Nature"> Nature</label>
                                <label><input type="checkbox" name="interests[]" value="Culture"> Culture</label>
                                <label><input type="checkbox" name="interests[]" value="Beach"> Beach</label>
                                <label><input type="checkbox" name="interests[]" value="Adventure"> Adventure</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer mt-3 px-0 pb-0">
                        <button class="btn btn-light" type="button" data-bs-dismiss="modal">Cancel</button>
                        <button class="btn-gold" type="submit">Create Request</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <footer class="footer">
        <div class="container footer-grid">
            <div>
                <a class="brand-lockup" href="{{ route('home') }}" aria-label="Tribaltours home page">
                    <span class="brand-mark" aria-hidden="true">
                        <img src="{{ asset('images/favicon.png') }}" alt="Tribaltours logo" width="32" height="32">
                    </span>
                    <span class="brand-name brand-asimovian">Tribaltours</span>
                </a>
                <p>Connecting adventurous tourists with verified local guides through curated listings and custom trip requests.</p>
            </div>
            <div>
                <h3>Explore</h3>
                <a href="{{ route('explore') }}">Browse All Tours</a>
                <a href="{{ route('explore') }}">Popular Destinations</a>
                <a href="{{ route('explore') }}">Adventure Tours</a>
                <a href="{{ route('explore') }}">Cultural Experiences</a>
            </div>
            <div>
                <h3>Guides</h3>
                <a href="{{ route('get-started') }}">Become a Guide</a>
                <a href="{{ route('get-started') }}">Guide Application</a>
                <a href="{{ route('get-started') }}">Guide Resources</a>
                <a href="{{ route('get-started') }}">Earnings Calculator</a>
            </div>
            <div>
                <h3>Support</h3>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Cancellation Policy</a>
                <a href="#">Terms of Service</a>
            </div>
        </div>
        <div class="container footer-bottom">
            <small>© 2026 Tribaltours. All rights reserved.</small>
            <div>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Cookies</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        (function () {
            var form = document.getElementById('createRequestForm');
            if (!form) {
                return;
            }

            var durationInput = document.getElementById('reqDuration');
            var durationOutput = document.getElementById('reqDurationValue');
            var minBudget = document.getElementById('reqBudgetMin');
            var maxBudget = document.getElementById('reqBudgetMax');
            var budgetPreview = document.getElementById('reqBudgetPreview');
            var adultsInput = document.getElementById('adultInput');
            var adultsCount = document.getElementById('adultsCount');
            var childrenInput = document.getElementById('childInput');
            var childrenCount = document.getElementById('childrenCount');
            var regionInput = document.getElementById('reqRegion');

            function syncDuration() {
                if (durationInput && durationOutput) {
                    durationOutput.textContent = durationInput.value + ' days';
                }
            }

            function syncBudget() {
                if (!minBudget || !maxBudget || !budgetPreview) {
                    return;
                }
                var min = Number(minBudget.value || 0);
                var max = Number(maxBudget.value || 0);
                budgetPreview.textContent = 'PHP ' + min.toLocaleString() + ' - PHP ' + max.toLocaleString();
            }

            function syncCounts() {
                if (adultsInput && adultsCount) {
                    adultsCount.textContent = adultsInput.value || '1';
                }
                if (childrenInput && childrenCount) {
                    childrenCount.textContent = childrenInput.value || '0';
                }
            }

            if (durationInput) {
                durationInput.addEventListener('input', syncDuration);
            }
            if (minBudget) {
                minBudget.addEventListener('input', syncBudget);
            }
            if (maxBudget) {
                maxBudget.addEventListener('input', syncBudget);
            }

            document.querySelectorAll('#createRequestModal [data-counter-btn]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var target = button.getAttribute('data-counter-btn');
                    var type = button.getAttribute('data-counter-type');
                    var input = document.getElementById(target);
                    if (!input) {
                        return;
                    }
                    var current = Number(input.value || 0);
                    var minimum = target === 'adultInput' ? 1 : 0;
                    var next = type === 'minus' ? current - 1 : current + 1;
                    input.value = String(Math.max(minimum, next));
                    syncCounts();
                });
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var data = new FormData(form);
                var min = Number(data.get('budgetMin') || 0);
                var max = Number(data.get('budgetMax') || 0);
                if (max < min) {
                    window.alert('Budget max should be greater than min.');
                    return;
                }

                var region = String(data.get('region') || '').trim();
                if (!region) {
                    window.alert('Region is required.');
                    if (regionInput) {
                        regionInput.focus();
                    }
                    return;
                }

                var payload = Object.fromEntries(data.entries());
                payload.interests = Array.from(form.querySelectorAll('input[name="interests[]"]:checked')).map(function (item) {
                    return item.value;
                });
                localStorage.setItem('tribaltours_home_request_draft', JSON.stringify(payload));

                var modalEl = document.getElementById('createRequestModal');
                if (window.bootstrap && modalEl) {
                    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    modal.hide();
                }

                setTimeout(function () {
                    window.location.href = @json(route('my-posts'));
                }, 300);
            });

            syncDuration();
            syncBudget();
            syncCounts();
            if (regionInput && !String(regionInput.value || '').trim()) {
                regionInput.value = 'Davao del Norte';
            }
        })();
    </script>
    <script src="{{ asset('assets/landing.js') }}"></script>
</body>
</html>