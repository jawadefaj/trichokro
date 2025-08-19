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
    if(window.scrollY > 24){
      nav.style.background = 'rgba(15,23,42,.75)';
      nav.style.boxShadow = '0 8px 24px rgba(0,0,0,.35)';
    }else{
      nav.style.background = 'rgba(15,23,42,.55)';
      nav.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// Simple ripple on .btn clicks
document.addEventListener('click', (e) => {
  const target = e.target.closest('.btn, .cta');
  if(!target) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position:absolute; left:${e.clientX-rect.left-size/2}px; top:${e.clientY-rect.top-size/2}px;
    width:${size}px; height:${size}px; border-radius:50%;
    background: rgba(255,255,255,.35); transform: scale(0); pointer-events:none;
    animation: tri-ripple .6s linear;
  `;
  target.style.position = 'relative';
  target.style.overflow = 'hidden';
  target.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 650);
});

// Inject ripple keyframes
(() => {
  const style = document.createElement('style');
  style.textContent = `@keyframes tri-ripple{ to{ transform:scale(4); opacity:0; } }`;
  document.head.appendChild(style);
})();

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
