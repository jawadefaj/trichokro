// ============================================
// TriChokro Optimized JavaScript v2
// - Better touch handling
// - Efficient DOM manipulation
// - Mobile optimizations
// ============================================

(function() {
    'use strict';

    // Prevent default touch behaviors that cause issues
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('#mobile-menu')) {
            e.stopPropagation();
        }
    }, { passive: true });

    // Mobile menu toggle
    const initMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!mobileMenuBtn || !mobileMenu) return;
        
        // Toggle menu
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.toggle('show');
        }, { passive: false });
        
        // Close menu on link click
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('show');
            }, { passive: true });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('show');
            }
        }, { passive: true });
    };

    // Smooth scroll to sections
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, { passive: false });
        });
    };

    // Optimize touch interactions
    const optimizeTouchTargets = () => {
        const touches = document.querySelectorAll('a, button, .interactive');
        touches.forEach(element => {
            // Add touch feedback
            element.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.style.opacity = '1';
            }, { passive: true });
        });
    };

    // Lazy load images
    const lazyLoadImages = () => {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    };

    // Add entrance animations
    const addEntranceAnimations = () => {
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                        animationObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('[data-animate]').forEach(el => {
                animationObserver.observe(el);
            });
        }
    };

    // Optimize scroll performance
    const optimizeScrollPerformance = () => {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Update active nav link
                    updateActiveNavLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    };

    // Update active navigation link
    const updateActiveNavLink = () => {
        const sections = document.querySelectorAll('[id]');
        let scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                document.querySelectorAll('#navbar a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + section.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    // Performance: Debounce window resize
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Initialize on DOM ready
    const init = () => {
        initMobileMenu();
        initSmoothScroll();
        optimizeTouchTargets();
        lazyLoadImages();
        addEntranceAnimations();
        optimizeScrollPerformance();
    };

    // Wait for DOM if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
