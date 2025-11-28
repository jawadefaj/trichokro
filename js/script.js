// ===== TriChokro v3 JS =====

// Smooth scroll to section by ID
function scrollToSection(id){
  const el = document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
}

// Navbar subtle change on scroll
(() => {
  const nav = document.querySelector('.navbar');
  const onScroll = () => {
    if (window.scrollY > 24) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Set initial state
})();

// Simple ripple on .btn clicks
document.addEventListener('click', (e) => {
  const target = e.target.closest('.btn, .cta');
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);

  ripple.className = 'ripple';
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  ripple.style.width = ripple.style.height = `${size}px`;

  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

// ===== Language Switching & Animations =====
document.addEventListener('DOMContentLoaded', () => {
  const languageSwitcher = document.getElementById('language-switcher');
  const translatableElements = document.querySelectorAll('[data-lang]');

  const setLanguage = async (lang) => {
    document.documentElement.lang = lang;
    localStorage.setItem('trichokro-lang', lang);
    languageSwitcher.value = lang;

    try {
      const response = await fetch(`language/${lang}.json`);
      if (!response.ok) {
        // If fetch fails (e.g. local file system without server), just log it
        console.warn(`Failed to fetch ${lang}.json. This is expected if running locally without a server.`);
        return;
      }
      const translations = await response.json();

      translatableElements.forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[key]) {
          el.innerHTML = translations[key];
        }
      });
    } catch (error) {
      console.warn('Language file not loaded:', error);
    }
  };

  if(languageSwitcher){
      languageSwitcher.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
      // Set initial language
      const savedLang = localStorage.getItem('trichokro-lang') || 'en';
      setLanguage(savedLang);
  }

  // Accordion functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      accordionItem.classList.toggle('is-open');
    });
  });

  // ===== Scroll Animations =====
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Handle Bar Chart Animations
        // If the observed element contains bars (like .chart-container)
        const bars = entry.target.querySelectorAll('.bar[data-height]');
        bars.forEach(bar => {
            // Apply the height from data attribute
            bar.style.height = bar.getAttribute('data-height');
        });

        // Stop observing once visible
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => observer.observe(el));
});
