// ===== TriChokro v2 JS =====

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

// ===== Language Switching =====
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
        throw new Error(`Failed to fetch ${lang}.json`);
      }
      const translations = await response.json();

      translatableElements.forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[key]) {
          el.innerHTML = translations[key];
        }
      });
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  languageSwitcher.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  // Set initial language
  const savedLang = localStorage.getItem('trichokro-lang') || 'en';
  setLanguage(savedLang);

  // Accordion functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      accordionItem.classList.toggle('is-open');
    });
  });
});
