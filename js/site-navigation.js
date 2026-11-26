(function () {
    var siteRoot = new URL('../', document.currentScript.src);
    var file = (window.location.pathname.split('/').pop() || 'index.html');
    var isBangla = document.documentElement.lang.toLowerCase().startsWith('bn') || /_bn\.html$/i.test(file);

    // Pages that exist in both languages: the language link opens the same page in the other language.
    var bilingual = ['index', 'blog', 'blogs', 'contact', 'engineering_excellence', 'founder', 'metadata',
        'pathfinder', 'privacy', 'resources', 'trambulance'];
    function otherLanguageHref() {
        var base = file.replace(/\.html$/i, '').replace(/_bn$/i, '');
        if (bilingual.indexOf(base) === -1) return isBangla ? 'index.html' : 'index_bn.html';
        return (isBangla ? base + '.html' : base + '_bn.html') + window.location.search;
    }

    // Same links, same order as the homepage banner.
    var navigationLinks = isBangla ? [
        ['হোম', 'index_bn.html#home'],
        ['আমাদের সম্পর্কে', 'index_bn.html#about'],
        ['খবর', 'blogs_bn.html'],
        ['ট্রাম্বুলেন্স', 'trambulance_bn.html'],
        ['পণ্য', 'index_bn.html#products']
    ] : [
        ['Home', 'index.html#home'],
        ['About us', 'index.html#about'],
        ['News', 'blogs.html'],
        ['Trambulance', 'trambulance.html'],
        ['Products', 'index.html#products']
    ];
    var contactLink = isBangla ? ['যোগাযোগ', 'contact_bn.html?id=rownak'] : ['Contacts', 'contact.html?id=rownak'];
    var languageLabel = isBangla ? 'EN' : 'BN';

    // Brand fonts (Cinzel wordmark, JetBrains Mono strapline) for pages that don't load them yet.
    var hasBrandFonts = Array.prototype.some.call(document.querySelectorAll('link[href*="fonts.googleapis.com"]'), function (l) {
        return /Cinzel/.test(l.href) && /JetBrains/.test(l.href);
    });
    if (!hasBrandFonts) {
        var fonts = document.createElement('link');
        fonts.rel = 'stylesheet';
        fonts.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap';
        document.head.appendChild(fonts);
    }

    var style = document.createElement('style');
    style.textContent = `
        .tc-site-navigation {
            background-color: rgba(2, 6, 23, 0.5) !important;
            -webkit-backdrop-filter: blur(14px);
            backdrop-filter: blur(14px);
        }
        .tc-brand-lockup { display: inline-flex; align-items: center; gap: 0.75rem; color: #fff; text-decoration: none; }
        .tc-brand-logo { height: 3rem; width: auto; filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.5)); }
        .tc-brand-wordmark { display: inline-flex; flex-direction: column; line-height: 1.05; text-align: left; }
        .tc-brand-main, .tc-brand-main * { font-family: 'Cinzel', serif !important; }
        .tc-brand-main { font-weight: 800; font-size: 1.35rem; color: #fff; letter-spacing: 0.02em; white-space: nowrap; }
        .tc-brand-accent { color: #34d399; }
        .tc-brand-sub { font-family: 'JetBrains Mono', monospace !important; font-size: 0.62rem; letter-spacing: 0.32em; text-transform: uppercase; color: #6ee7b7; }
        @media (max-width: 380px) { .tc-brand-sub { display: none; } }
        /* Compact lockup where a page header also carries buttons (achievement pages). */
        header.top .tc-brand-logo { height: 2.25rem; }
        header.top .tc-brand-lockup { flex-shrink: 0; }
        @media (max-width: 560px) {
            header.top .tc-brand-sub { display: none; }
            header.top .tc-brand-main { font-size: 1.05rem; }
            header.top .tc-brand-logo { height: 2rem; }
            header.top .tc-brand-lockup { gap: 0.5rem; }
        }

        .tc-global-navigation {
            position: fixed;
            inset: 0 0 auto;
            z-index: 10001;
            color: #e2e8f0;
            background: rgba(2, 6, 23, 0.88);
            -webkit-backdrop-filter: blur(14px);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-family: Inter, Arial, sans-serif;
            text-align: left;
        }
        .tc-global-navigation *, .tc-global-navigation *::before, .tc-global-navigation *::after { box-sizing: border-box; }
        .tc-global-navigation a { text-decoration: none; }
        .tc-global-navigation-inner {
            max-width: 80rem;
            min-height: 4.5rem;
            margin: 0 auto;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
        }
        @media (min-width: 640px) { .tc-global-navigation-inner { padding-left: 1.5rem; padding-right: 1.5rem; } }
        @media (min-width: 1024px) { .tc-global-navigation-inner { padding-left: 2rem; padding-right: 2rem; } }
        .tc-global-links { display: flex; align-items: center; gap: 2rem; }
        .tc-global-links a { font-family: 'Cinzel', serif !important; }
        .tc-global-links a {
            position: relative;
            color: #cbd5e1;
            font-size: 0.875rem;
            font-weight: 500;
            letter-spacing: 0.025em;
            text-transform: uppercase;
            white-space: nowrap;
            transition: color 160ms ease;
        }
        .tc-global-links a:hover { color: #34d399; }
        .tc-global-links a.tc-global-contact {
            color: #fff;
            font-weight: 700;
            padding: 0.5rem 1.5rem;
            border-radius: 9999px;
            background-image: linear-gradient(to right, #065f46, #34d399);
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
            transition: transform 0.3s ease, background-image 0.3s ease;
        }
        .tc-global-links a.tc-global-contact:hover { color: #fff; transform: scale(1.05); background-image: linear-gradient(to right, #047857, #6ee7b7); }
        .tc-global-menu-button {
            display: none;
            border: 0;
            background: transparent;
            color: #fff;
            padding: 0.25rem;
            cursor: pointer;
            line-height: 0;
        }
        .tc-global-menu-button:hover { color: #34d399; }
        body.tc-global-navigation-page { padding-top: 4.5rem; }
        body.tc-global-navigation-page[data-tc-nav-overlay] { padding-top: 0; }
        @media (max-width: 767px) {
            .tc-global-navigation-inner { min-height: 4rem; }
            .tc-global-menu-button { display: block; }
            .tc-global-links {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                max-height: calc(100vh - 4rem);
                overflow-y: auto;
                padding: 1rem;
                flex-direction: column;
                align-items: stretch;
                gap: 0.75rem;
                background: #0f172a;
                border-top: 1px solid #1e293b;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
                font-family: Inter, Arial, sans-serif;
            }
            .tc-global-navigation.is-open .tc-global-links { display: flex; }
            .tc-global-links a, .tc-global-links a.tc-global-contact {
                font-family: Inter, Arial, sans-serif !important;
                display: block;
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                font-weight: 500;
                color: #cbd5e1;
                background: transparent;
                box-shadow: none;
                transform: none;
            }
            .tc-global-links a:hover, .tc-global-links a.tc-global-contact:hover { color: #34d399; background: #1e293b; transform: none; }
        }
    `;
    document.head.appendChild(style);

    function brandLockupHTML() {
        return '<img class="tc-brand-logo" src="' + new URL('src/assets/logo_icon.webp', siteRoot).href + '" alt="TriChokro Logo" width="1600" height="1600" decoding="async">' +
            '<span class="tc-brand-wordmark"><span class="tc-brand-main">Tri<span class="text-emerald-400 tc-brand-accent">Chokro</span></span>' +
            '<span class="tc-brand-sub"> Automotives</span></span>';
    }

    var navigation = document.getElementById('navbar') ||
        document.querySelector('body > nav, body > header.top, body > header.site-top');
    if (navigation) {
        navigation.classList.add('tc-site-navigation');
        unifyBrand(navigation);
        fixPageMobileMenu();
        return;
    }

    // A page's own banner shows the same logo + wordmark as the homepage.
    // (Sister-concern pages keep their own brand.)
    function unifyBrand(nav) {
        if (nav.querySelector('.tc-brand-wordmark')) return;
        if (nav.querySelector('img[src*="triborigen"], img[src*="Trimateria"], img[src*="trimateria"]')) return;
        var logo = nav.querySelector('img[src*="logo_icon"], img[src*="logo_new"]');
        if (logo) {
            var text = logo.nextElementSibling;
            if (text && /TriChokro/i.test(text.textContent.replace(/\s/g, ''))) {
                var holder = document.createElement('span');
                holder.innerHTML = brandLockupHTML();
                logo.replaceWith(holder.firstChild);
                text.replaceWith(holder.firstChild);
            }
            return;
        }
        var brandLink = nav.querySelector('a.brand');
        if (brandLink && /TriChokro/i.test(brandLink.textContent)) {
            brandLink.classList.add('tc-brand-lockup');
            brandLink.innerHTML = brandLockupHTML();
        }
    }

    // Pages with their own navbar (#mobile-menu + #mobile-menu-btn).
    // The closed menu must never catch taps (see css/site-mobile.css; repeated
    // here for pages that do not load that stylesheet), and the menu closes
    // after a link is chosen or when the visitor taps elsewhere.
    function fixPageMobileMenu() {
        var menu = document.getElementById('mobile-menu');
        var button = document.getElementById('mobile-menu-btn');
        if (!menu || !button) return;

        var menuStyle = document.createElement('style');
        menuStyle.textContent =
            '#mobile-menu.max-h-0{max-height:0!important;visibility:hidden;pointer-events:none}' +
            '#mobile-menu.opacity-100{visibility:visible;pointer-events:auto;max-height:calc(100vh - 4rem);' +
            'max-height:calc(100dvh - 4rem);overflow-y:auto;overscroll-behavior:contain}';
        document.head.appendChild(menuStyle);

        function isOpen() { return menu.classList.contains('opacity-100'); }
        function syncExpanded() { button.setAttribute('aria-expanded', String(isOpen())); }

        button.setAttribute('aria-controls', 'mobile-menu');
        if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', isBangla ? 'মেনু' : 'Menu');
        syncExpanded();
        new MutationObserver(syncExpanded).observe(menu, { attributes: true, attributeFilter: ['class'] });

        // Close through the page's own toggle so its open/closed state stays in step.
        function close() { if (isOpen()) button.click(); }
        menu.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('a[href]')) close();
        });
        document.addEventListener('click', function (e) {
            if (!isOpen()) return;
            if (menu.contains(e.target) || button.contains(e.target)) return;
            close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    // Pages without a banner of their own get the homepage banner.
    function link(label, href, cls) {
        var url = /^[a-z]+:/i.test(href) ? href : new URL(href, siteRoot).href;
        return '<a href="' + url + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + label + '</a>';
    }
    var header = document.createElement('header');
    header.className = 'tc-global-navigation';
    header.innerHTML =
        '<div class="tc-global-navigation-inner">' +
            '<a class="tc-brand-lockup" href="' + new URL(isBangla ? 'index_bn.html' : 'index.html', siteRoot).href + '" aria-label="TriChokro home">' +
                brandLockupHTML() +
            '</a>' +
            '<button class="tc-global-menu-button" type="button" aria-label="' + (isBangla ? 'মেনু' : 'Menu') + '" aria-expanded="false" aria-controls="tc-global-links">' +
                '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
            '</button>' +
            '<nav class="tc-global-links" id="tc-global-links" aria-label="Main navigation">' +
                navigationLinks.map(function (l) { return link(l[0], l[1]); }).join('') +
                link(languageLabel, otherLanguageHref()) +
                link(contactLink[0], contactLink[1], 'tc-global-contact') +
            '</nav>' +
        '</div>';
    document.body.prepend(header);
    document.body.classList.add('tc-global-navigation-page');

    var menuButton = header.querySelector('.tc-global-menu-button');
    function setOpen(open) {
        header.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
    }
    menuButton.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    header.querySelector('.tc-global-links').addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
        if (header.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
