(function () {
    var nav = document.getElementById('landingNav');
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');

    function setScrolledState() {
        if (!nav) {
            return;
        }
        nav.classList.toggle('scrolled', window.scrollY > 20);
    }

    function bindMobileMenu() {
        if (!menuBtn || !mobileMenu) {
            return;
        }

        menuBtn.addEventListener('click', function () {
            var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            mobileMenu.classList.toggle('open', !expanded);
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('open');
            });
        });
    }

    function bindReveal() {
        var revealItems = Array.from(document.querySelectorAll('.reveal'));
        if (!revealItems.length) {
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -50px 0px'
        });

        revealItems.forEach(function (item) {
            observer.observe(item);
        });
    }

    function smoothAnchorFallback() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (event) {
                var targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') {
                    return;
                }
                var target = document.querySelector(targetId);
                if (!target) {
                    return;
                }
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function initHeroCarousel() {
        var heroSection = document.querySelector('.hero');
        var primaryImage = document.querySelector('.hero-image');

        if (!heroSection || !primaryImage) {
            return;
        }

        var imageList = (primaryImage.getAttribute('data-carousel') || '')
            .split(',')
            .map(function (item) { return item.trim(); })
            .filter(Boolean);

        if (!imageList.length && primaryImage.getAttribute('src')) {
            imageList = [primaryImage.getAttribute('src')];
        }

        if (imageList.length < 2) {
            return;
        }

        var secondaryImage = primaryImage.cloneNode(false);
        secondaryImage.removeAttribute('data-carousel');
        secondaryImage.setAttribute('aria-hidden', 'true');

        primaryImage.classList.add('carousel-layer', 'is-active');
        secondaryImage.classList.add('hero-image', 'carousel-layer');

        var overlay = heroSection.querySelector('.hero-overlay');
        heroSection.insertBefore(secondaryImage, overlay || null);

        var activeImage = primaryImage;
        var inactiveImage = secondaryImage;
        var currentIndex = 0;

        function swapToImage(nextSrc) {
            var preload = new Image();
            preload.onload = function () {
                inactiveImage.setAttribute('src', nextSrc);
                requestAnimationFrame(function () {
                    inactiveImage.classList.add('is-active');
                    activeImage.classList.remove('is-active');

                    var temp = activeImage;
                    activeImage = inactiveImage;
                    inactiveImage = temp;
                });
            };
            preload.src = nextSrc;
        }

        setInterval(function () {
            currentIndex = (currentIndex + 1) % imageList.length;
            swapToImage(imageList[currentIndex]);
        }, 5200);
    }

    setScrolledState();
    window.addEventListener('scroll', setScrolledState, { passive: true });
    bindMobileMenu();
    bindReveal();
    smoothAnchorFallback();
    initHeroCarousel();
})();
