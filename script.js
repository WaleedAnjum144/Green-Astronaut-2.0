



/* ============================================================
   GA SOLAR — MAIN.JS (CLEAN VERSION)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================
       1. NAVBAR — FIXED ON SCROLL + SHADOW (merged into ONE listener)
    ============================================================ */
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (!navbar) return;

        // Fixed state
        if (window.scrollY > 0) {
            navbar.classList.add('fixed');
        } else {
            navbar.classList.remove('fixed');
        }

        // Shadow
        navbar.style.boxShadow = window.scrollY > 8
            ? '0 8px 30px rgba(15, 23, 42, 0.06)'
            : 'none';
    });


    /* ============================================================
       2. MOBILE MENU
    ============================================================ */
    const mobileMenu = document.getElementById('mobile-menu');
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');

    function openMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Mobile products dropdown
    const mobileProductsToggle = document.getElementById('mobile-products-toggle');
    if (mobileProductsToggle) {
        mobileProductsToggle.addEventListener('click', () => {
            mobileProductsToggle.parentElement.classList.toggle('active');
        });
    }


    /* ============================================================
       3. LANGUAGE TRANSLATOR
       (FIXED: was nested in a second DOMContentLoaded → never ran)
    ============================================================ */
    (function initTranslator() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang') || 'en';

        // Active button state
        const btnEn = document.getElementById('lang-en');
        const btnZh = document.getElementById('lang-zh');
        if (btnEn && btnZh) {
            btnEn.classList.toggle('active', lang === 'en');
            btnZh.classList.toggle('active', lang === 'zh');
        }

        // Translate everything EXCEPT the language buttons
        if (lang === 'zh') {
            translateDeep('zh-CN');
        }

        async function translateDeep(target) {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode: function (node) {
                    // Skip language switcher entirely
                    if (node.parentElement.closest('.language-switcher')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip <script> and <style> content
                    const tag = node.parentElement.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }, false);

            let node;
            const nodes = [];
            while (node = walker.nextNode()) {
                if (node.nodeValue.trim().length > 0) nodes.push(node);
            }

            // Translate in parallel batches of 15
            for (let i = 0; i < nodes.length; i += 15) {
                const chunk = nodes.slice(i, i + 15);
                await Promise.all(chunk.map(async (n) => {
                    const text = n.nodeValue.trim();
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data && data[0] && data[0][0] && data[0][0][0]) {
                            n.nodeValue = data[0][0][0];
                        }
                    } catch (e) {
                        console.error('Translate error:', text);
                    }
                }));
            }
        }
    })();


    /* ============================================================
       4. HERO SLIDER — ARROWS + DOTS + AUTOPLAY
    ============================================================ */
    (function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');
        const heroPrev = document.getElementById('heroPrev');
        const heroNext = document.getElementById('heroNext');

        if (!slides.length || !dots.length) return;

        let current = 0;
        let heroTimer = null;

        function goSlide(n) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');

            current = (n + slides.length) % slides.length;

            slides[current].classList.add('active');
            dots[current].classList.add('active');
        }

        function startAutoSlide() {
            clearInterval(heroTimer);
            heroTimer = setInterval(() => goSlide(current + 1), 5000);
        }

        function resetAutoSlide() {
            startAutoSlide();
        }

        dots.forEach(dot => {
            dot.addEventListener('click', function () {
                goSlide(+this.dataset.slide);
                resetAutoSlide();
            });
        });

        if (heroPrev) heroPrev.addEventListener('click', () => { goSlide(current - 1); resetAutoSlide(); });
        if (heroNext) heroNext.addEventListener('click', () => { goSlide(current + 1); resetAutoSlide(); });

        startAutoSlide();
    })();


    /* ============================================================
       5. ACTIVE NAV LINK ON SCROLL
    ============================================================ */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + section.clientHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });


    /* ============================================================
       6. PRODUCT CATEGORY FILTER TABS
    ============================================================ */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productCards = document.querySelectorAll('#productsGrid .product-card');

    function applyFilter(filter) {
        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const show = (filter === 'all' || category === filter);

            if (show) {
                card.classList.remove('hidden-card');
                card.classList.remove('visible');
                requestAnimationFrame(() => {
                    setTimeout(() => card.classList.add('visible'), 50);
                });
            } else {
                card.classList.add('hidden-card');
            }
        });
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyFilter(this.dataset.filter);
        });
    });

    // Dropdown links that pre-select a category filter
    document.querySelectorAll('[data-filter-link]').forEach(link => {
        link.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter-link');
            const targetTab = document.querySelector(`.filter-tab[data-filter="${filter}"]`);
            if (targetTab) targetTab.click();
        });
    });


    /* ============================================================
       7. PROJECTS SWIPER
    ============================================================ */
    if (typeof Swiper !== 'undefined' && document.querySelector('.projectsSwiper')) {
        new Swiper('.projectsSwiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.projects-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.projects-next',
                prevEl: '.projects-prev',
            },
            breakpoints: {
                640: { slidesPerView: 1, spaceBetween: 24 },
                992: { slidesPerView: 2, spaceBetween: 24 }
            }
        });
    }


    /* ============================================================
       8. PARTNERSHIP HERO SLIDER — Dynamic Content Switch
       (Images matched to each partnership title)
    ============================================================ */
    (function initPartnershipSlider() {
        const heroSection = document.querySelector('.partnership-hero');
        if (!heroSection) return; // section not on page — skip safely

        const slidesData = [
            {
                // 01 — Solar Industry Wholesale (Solar PV panels / warehouse supply)
                number: "01",
                title: "Solar Industry<br>Wholesale Partnership",
                desc: "We are a direct wholesale supplier of complete solar photovoltaic (PV) systems, providing competitive pricing and reliable long-term supply for installers and contractors.",
                circle1: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop", // Solar panel farm
                circle2: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=1000&auto=format&fit=crop"  // Solar warehouse / installation
            },
            {
                // 02 — Business Referral (handshake / business deal / profit)
                number: "02",
                title: "Business Referral<br>Partnership",
                desc: "We welcome referrals from individuals and businesses with solar project opportunities. Our partners benefit from competitive wholesale pricing and attractive profit-sharing.",
                circle1: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop", // Business handshake
                circle2: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop"  // Business meeting / profit charts
            },
            {
                // 03 — Strategic Alliance & Future Growth (corporate / large scale solar)
                number: "03",
                title: "Strategic Alliance<br>& Future Growth",
                desc: "This category is reserved for future strategic partnership opportunities, customized for large-scale corporate and institutional solar energy collaborations.",
                circle1: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1000&auto=format&fit=crop", // Large solar power plant
                circle2: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"  // Corporate skyscrapers / growth
            },
            {
                // 04 — Real Estate & Construction (rooftop solar / building)
                number: "04",
                title: "Real Estate &<br>Construction Partnership",
                desc: "We work with property developers, construction companies, and builders to supply and support residential, commercial, and industrial solar PV projects.",
                circle1: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop", // Modern house / real estate
                circle2: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?q=80&w=1000&auto=format&fit=crop"  // Rooftop solar on home
            },
            {
                // 05 — Hardware & Electrical Store (electrical shop / hardware / retail)
                number: "05",
                title: "Hardware & Electrical Store Partnership",
                desc: "Hardware stores, electrical retailers, and building material suppliers are welcome to become our sales partners. We offer attractive profit margins and full support.",
                circle1: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop", // Electrician / electrical tools
                circle2: "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?q=80&w=1000&auto=format&fit=crop"  // Hardware store shelves
            }
        ];

        const AUTOPLAY_DELAY = 7000;
        const TRANSITION_DURATION = 600;

        let currentIndex = 0;
        let isAnimating = false;
        let autoPlayInterval = null;
        const totalSlides = slidesData.length;

        // DOM Elements — scoped to this section only
        const titleEl = heroSection.querySelector('#phTitle');
        const descEl = heroSection.querySelector('#phDesc');
        const numberEl = heroSection.querySelector('#phNumber');
        const currentEl = heroSection.querySelector('#phCurrent');
        const circle1El = heroSection.querySelector('#phCircle1');
        const circle2El = heroSection.querySelector('#phCircle2');
        const bgElements = heroSection.querySelectorAll('.ph-bg');
        const prevBtn = heroSection.querySelector('.ph-prev');
        const nextBtn = heroSection.querySelector('.ph-next');

        if (!titleEl || !descEl || !prevBtn || !nextBtn) return;

        function updateSlide(index) {
            if (isAnimating) return;
            isAnimating = true;

            const data = slidesData[index];

            // Fade out
            titleEl.classList.add('fade-out');
            descEl.classList.add('fade-out');
            numberEl.classList.add('fade-out');
            circle1El.parentElement.classList.add('fade-out');
            circle2El.parentElement.classList.add('fade-out');

            // Crossfade background immediately
            bgElements.forEach((bg, i) => {
                bg.classList.toggle('active', i === index);
            });

            setTimeout(() => {
                titleEl.innerHTML = data.title;
                descEl.textContent = data.desc;
                numberEl.textContent = data.number;
                currentEl.textContent = data.number;
                circle1El.src = data.circle1;
                circle2El.src = data.circle2;

                // Fade in
                titleEl.classList.remove('fade-out');
                descEl.classList.remove('fade-out');
                numberEl.classList.remove('fade-out');
                circle1El.parentElement.classList.remove('fade-out');
                circle2El.parentElement.classList.remove('fade-out');

                setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
            }, 350);
        }

        function nextSlide() {
            if (isAnimating) return;
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlide(currentIndex);
        }

        function prevSlide() {
            if (isAnimating) return;
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlide(currentIndex);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        function startAutoPlay() {
            stopAutoPlay(); // always clear first — prevents stacked timers
            autoPlayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
        }

        // Events
        nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
        prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

        heroSection.addEventListener('mouseenter', stopAutoPlay);
        heroSection.addEventListener('mouseleave', startAutoPlay);

        document.addEventListener('visibilitychange', () => {
            document.hidden ? stopAutoPlay() : startAutoPlay();
        });

        startAutoPlay();
    })();


    /* ============================================================
       9. SEA COUNTRY SVG MAP — CLICK COUNTRY TO ACTIVATE
    ============================================================ */
    (function initSeaMap() {
        const networkSection = document.querySelector('#network');
        if (!networkSection) return;

        const countries = networkSection.querySelectorAll('.sea-country');
        const chips = networkSection.querySelectorAll('.sea-country-chip');
        const infos = networkSection.querySelectorAll('.country-info');
        const tooltips = networkSection.querySelectorAll('.sea-tooltip');

        if (!countries.length || !chips.length || !infos.length) return;

        function activateCountry(country) {
            countries.forEach(item => item.classList.toggle('active', item.dataset.country === country));
            chips.forEach(chip => chip.classList.toggle('active', chip.dataset.country === country));
            infos.forEach(info => info.classList.toggle('active', info.dataset.country === country));
            tooltips.forEach(tip => tip.classList.toggle('active', tip.dataset.country === country));
        }

        countries.forEach(shape => {
            shape.addEventListener('click', function () {
                activateCountry(this.dataset.country);
            });
            shape.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateCountry(this.dataset.country);
                }
            });
        });

        chips.forEach(chip => {
            chip.addEventListener('click', function () {
                activateCountry(this.dataset.country);
            });
        });

        activateCountry('malaysia');
    })();


    /* ============================================================
   9. SEA COUNTRY SVG MAP — GEOGRAPHIC MUTUAL INTERACTION ENGINE
============================================================ */
    (function initSeaMap() {
        const wrapper = document.querySelector('.sea-map-wrapper');
        if (!wrapper) return;

        const countries = wrapper.querySelectorAll('.sea-country');
        const chips = wrapper.querySelectorAll('.sea-country-chip');
        const markers = wrapper.querySelectorAll('.flag-marker');

        function activateCountry(countryId) {
            // 1. Sync Detailed SVG Map Shapes
            countries.forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-country') === countryId);
            });

            // 2. Sync Floating 3D Flag Markers
            markers.forEach(marker => {
                marker.classList.toggle('active', marker.getAttribute('data-country') === countryId);
            });

            // 3. Sync HTML Bottom Selection Chips
            chips.forEach(chip => {
                chip.classList.toggle('active', chip.getAttribute('data-country') === countryId);
            });
        }

        // Bind event handlers
        function bindInteractions(elements) {
            elements.forEach(el => {
                const countryId = el.getAttribute('data-country');
                if (!countryId) return;

                // Click Interaction
                el.addEventListener('click', () => activateCountry(countryId));

                // Instant hover sync
                el.addEventListener('mouseenter', () => activateCountry(countryId));

                // Accessibility keyboard navigation
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activateCountry(countryId);
                    }
                });
            });
        }

        bindInteractions(countries);
        bindInteractions(markers);
        bindInteractions(chips);

        // Boot default country
        activateCountry('malaysia');
    })();


    /* ============================================================
       10. IMAGE FALLBACK — SINGLE UNIFIED SYSTEM
       (FIXED: was two conflicting blocks — merged into one)
    ============================================================ */
    (function initImageFallback() {
        const demoByCategory = {
            panels: 'https://placehold.co/400x300/fff2e8/FF7100?text=Solar+Panel',
            inverters: 'https://placehold.co/400x300/e0f2fe/0284c7?text=Inverter',
            batteries: 'https://placehold.co/400x300/dcfce7/16a34a?text=Battery',
            mounting: 'https://placehold.co/400x300/f3e8ff/7c3aed?text=Mounting',
            default: 'https://placehold.co/400x300/f8fafc/94a3b8?text=Product'
        };
        const SITE_FALLBACK = 'https://placehold.co/800x500/e2e8f0/64748b?text=GA+Solar';

        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function () {
                // Already a placeholder? stop (prevents infinite loop)
                if (this.src.includes('placehold.co')) return;

                const card = this.closest('.product-card');
                if (card) {
                    const cat = card.getAttribute('data-category');
                    this.src = demoByCategory[cat] || demoByCategory.default;
                } else {
                    this.src = SITE_FALLBACK;
                }
            }, { once: true });
        });
    })();


    /* ============================================================
       11. CONTACT FORM (EmailJS)
    ============================================================ */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const form = this;
            const btn = document.getElementById('sendBtn');
            const messageBox = document.getElementById('form-message');
            const timeField = document.getElementById('time');

            if (btn) {
                btn.innerHTML = 'Sending...';
                btn.disabled = true;
            }

            if (timeField) timeField.value = new Date().toLocaleString();

            function resetBtn() {
                if (btn) {
                    btn.innerHTML = 'Submit Inquiry';
                    btn.disabled = false;
                }
            }

            function showMessage(text, color) {
                if (messageBox) {
                    messageBox.style.display = 'block';
                    messageBox.style.color = color;
                    messageBox.innerHTML = text;
                    setTimeout(() => { messageBox.style.display = 'none'; }, 4000);
                }
            }

            if (typeof emailjs === 'undefined') {
                showMessage('❌ Email service not loaded.', 'red');
                resetBtn();
                return;
            }

            emailjs.sendForm('service_y51pehe', 'template_v5uplxe', form)
                .then(() => {
                    showMessage('✅ Inquiry sent successfully! We will contact you soon.', 'green');
                    form.reset();
                    resetBtn();
                })
                .catch((error) => {
                    showMessage('❌ Failed to send. Please try again.', 'red');
                    resetBtn();
                    console.error(error);
                });
        });
    }


    /* ============================================================
       12. FAQ ACCORDION
    ============================================================ */
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                const q = i.querySelector('.faq-question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });


    /* ============================================================
       13. REVEAL ANIMATION (Intersection Observer)
    ============================================================ */
    const revealTargets = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((el, index) => {
        el.style.transitionDelay = `${(index % 6) * 70}ms`;
        revealObserver.observe(el);
    });

});



/* ===================== TIMELINE SCROLL ANIMATION ===================== */

document.addEventListener('DOMContentLoaded', function () {

    const timeline = document.getElementById('historyTimeline');
    const progressBar = document.getElementById('timelineProgress');
    const items = document.querySelectorAll('.history-item');

    if (!timeline || !progressBar || items.length === 0) return;

    function updateTimeline() {
        const timelineRect = timeline.getBoundingClientRect();
        const timelineTop = timelineRect.top;
        const timelineHeight = timelineRect.height;

        // Calculate viewport trigger point (center of screen)
        const triggerPoint = window.innerHeight * 0.6;

        // Calculate how much of the timeline has been scrolled past
        const scrolledPast = triggerPoint - timelineTop;
        const scrollPercentage = Math.max(0, Math.min(scrolledPast / timelineHeight, 1));

        // Update the progress bar height
        progressBar.style.height = (scrollPercentage * 100) + '%';

        // Activate each item when it reaches the trigger point
        items.forEach(function (item) {
            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top;

            if (itemTop < triggerPoint) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Run on scroll
    window.addEventListener('scroll', updateTimeline, { passive: true });

    // Run once on page load
    updateTimeline();

});


/* ===================== COUNTER ANIMATION ===================== */

document.addEventListener('DOMContentLoaded', function () {

    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;

    if (counters.length === 0) return;

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out effect for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeOut * target);

            el.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(updateCount);
    }

    // Use Intersection Observer to trigger when visible
    const statsSection = document.querySelector('.improved-network-stats');

    if (!statsSection) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                // Stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the section is visible
    });

    observer.observe(statsSection);

});


document.addEventListener('DOMContentLoaded', function () {
    /* ===================== PROJECT PORTFOLIO FILTER ===================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    if (filterBtns.length > 0 && portfolioCards.length > 0) {
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');

                portfolioCards.forEach(function (card, index) {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = 'fadeInUp 0.5s ease forwards';
                        card.style.animationDelay = (index * 0.05) + 's';
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    /* ===================== GALLERY LIGHTBOX ===================== */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const portfolioZooms = document.querySelectorAll('.portfolio-zoom');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentImages = [];
    let currentIndex = 0;

    function collectGalleryImages() {
        currentImages = [];
        galleryItems.forEach(function (item) {
            const src = item.getAttribute('data-img');
            if (src) currentImages.push(src);
        });
    }

    function openLightbox(src) {
        collectGalleryImages();
        currentIndex = currentImages.indexOf(src);
        if (currentIndex === -1) currentIndex = 0;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        lightboxImg.src = currentImages[currentIndex];
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        lightboxImg.src = currentImages[currentIndex];
    }

    galleryItems.forEach(function (item) {
        item.addEventListener('click', function () {
            const src = item.getAttribute('data-img');
            if (src) openLightbox(src);
        });
    });

    portfolioZooms.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const src = btn.getAttribute('data-img');
            if (src) openLightbox(src);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    /* ===================== FAQ ACCORDION ===================== */
    // const faqItems = document.querySelectorAll('.faq-item');
    // faqItems.forEach(function (item) {
    //     const question = item.querySelector('.faq-question');
    //     question.addEventListener('click', function () {
    //         const isActive = item.classList.contains('active');
    //         faqItems.forEach(function (faq) { faq.classList.remove('active'); });
    //         if (!isActive) item.classList.add('active');
    //     });
    // });
});