// ============================================
// TriChokro Mobile & Dynamic Script v2.5
// - Mobile menu toggle with outdoor click closing
// - Smooth scrollSpy and active link highlighting
// - Dynamic animated numbers for .counter elements
// - Touch swipe gestures for gallery sliders
// - IntersectionObserver for entrance animations
// ============================================

(function() {
    'use strict';

    // 1. Mobile Menu Toggle
    const initMobileMenu = () => {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!menuBtn || !mobileMenu) return;

        let isOpen = false;

        const toggleMenu = (show) => {
            isOpen = typeof show === 'boolean' ? show : !isOpen;
            if (isOpen) {
                mobileMenu.classList.add('show');
                mobileMenu.classList.remove('max-h-0', 'opacity-0');
                mobileMenu.classList.add('max-h-[85vh]', 'opacity-100');
            } else {
                mobileMenu.classList.remove('show');
                mobileMenu.classList.add('max-h-0', 'opacity-0');
                mobileMenu.classList.remove('max-h-[85vh]', 'opacity-100');
            }
        };

        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        }, { passive: false });

        // Close when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false), { passive: true });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (isOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        }, { passive: true });
    };

    // 2. Animated Counters
    const initCounters = () => {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target') || el.innerText, 10);
            if (isNaN(target)) return;
            
            const duration = 1500; // ms
            const stepTime = 20; // ms
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.innerText = target;
                    clearInterval(timer);
                } else {
                    el.innerText = Math.floor(current);
                }
            }, stepTime);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            counters.forEach(c => observer.observe(c));
        } else {
            counters.forEach(c => animateCounter(c));
        }
    };

    // 3. Smooth Scroll for Anchor Links
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, { passive: false });
        });
    };

    // 4. ScrollSpy Active Link Tracking
    const initScrollSpy = () => {
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        if (!navLinks.length) return;

        const sections = Array.from(navLinks)
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        let ticking = false;

        const updateActiveLink = () => {
            const scrollPos = window.scrollY + 120;
            sections.forEach(sec => {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                const id = sec.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active', 'text-emerald-400');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    // 5. Entrance Animations on Scroll
    const addEntranceAnimations = () => {
        const animatedElements = document.querySelectorAll('[data-animate], .reveal-on-scroll');
        if (!animatedElements.length) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed', 'animate-fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            animatedElements.forEach(el => observer.observe(el));
        } else {
            animatedElements.forEach(el => el.classList.add('revealed', 'animate-fade-in'));
        }
    };

    // 6. Touch Target Feedback
    const optimizeTouchTargets = () => {
        const interactiveElements = document.querySelectorAll('a, button, .interactive, .card');
        interactiveElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.opacity = '0.85';
            }, { passive: true });

            el.addEventListener('touchend', function() {
                this.style.opacity = '1';
            }, { passive: true });
        });
    };

    // 7. Gallery Touch Swipe
    const initGalleryTouch = () => {
        const sliders = document.querySelectorAll('.gallery-slider, .marquee-container');
        sliders.forEach(slider => {
            let startX = 0;
            let endX = 0;

            slider.addEventListener('touchstart', e => {
                startX = e.changedTouches[0].screenX;
            }, { passive: true });

            slider.addEventListener('touchend', e => {
                endX = e.changedTouches[0].screenX;
                const diff = endX - startX;
                if (Math.abs(diff) > 40) {
                    const prevBtn = slider.querySelector('#gallery-prev');
                    const nextBtn = slider.querySelector('#gallery-next');
                    if (diff < 0 && nextBtn) nextBtn.click();
                    if (diff > 0 && prevBtn) prevBtn.click();
                }
            }, { passive: true });
        });
    };

    // Initialize all enhancements on DOMReady
    const init = () => {
        initMobileMenu();
        initCounters();
        initSmoothScroll();
        initScrollSpy();
        addEntranceAnimations();
        optimizeTouchTargets();
        initGalleryTouch();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
