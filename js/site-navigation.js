(function () {
    var siteRoot = new URL('../', document.currentScript.src);
    var isBangla = document.documentElement.lang.toLowerCase().startsWith('bn') ||
        /_bn\.html$/i.test(window.location.pathname);
    var navigationLinks = isBangla ? [
        ['হোম', 'index_bn.html#home'],
        ['আমাদের সম্পর্কে', 'index_bn.html#about'],
        ['পণ্য', 'index_bn.html#products'],
        ['সংবাদ', 'blogs_bn.html'],
        ['প্রতিষ্ঠাতা', 'founder_bn.html'],
        ['যোগাযোগ', 'contact_bn.html'],
        ['EN', 'index.html']
    ] : [
        ['Home', 'index.html#home'],
        ['About us', 'index.html#about'],
        ['Products', 'index.html#products'],
        ['News', 'blogs.html'],
        ['Founders', 'founder.html'],
        ['Contacts', 'contact.html'],
        ['বাংলা', 'index_bn.html']
    ];
    var style = document.createElement('style');
    style.textContent = `
        .tc-site-navigation {
            background-color: rgba(2, 6, 23, 0.5) !important;
            -webkit-backdrop-filter: blur(14px);
            backdrop-filter: blur(14px);
        }
        .tc-global-navigation {
            position: fixed;
            inset: 0 0 auto;
            z-index: 10001;
            color: #e2e8f0;
            background: rgba(2, 6, 23, 0.5);
            -webkit-backdrop-filter: blur(14px);
            backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-family: Inter, Arial, sans-serif;
        }
        .tc-global-navigation a {
            color: #cbd5e1;
            text-decoration: none;
            transition: color 160ms ease;
        }
        .tc-global-navigation a:hover { color: #34d399; }
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
        .tc-global-brand {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: #fff !important;
            font-weight: 700;
            font-size: 1.25rem;
            white-space: nowrap;
        }
        .tc-global-brand img { width: 2.5rem; height: 2.5rem; object-fit: contain; }
        .tc-global-links { display: flex; align-items: center; gap: 1.5rem; }
        .tc-global-links a {
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            white-space: nowrap;
        }
        .tc-global-menu-button {
            display: none;
            border: 0;
            background: transparent;
            color: #fff;
            font-size: 1.5rem;
            line-height: 1;
            padding: 0.4rem;
            cursor: pointer;
        }
        body.tc-global-navigation-page { padding-top: 4.5rem; }
        @media (max-width: 767px) {
            .tc-global-navigation-inner { min-height: 4rem; }
            .tc-global-menu-button { display: block; }
            .tc-global-links {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                padding: 0.5rem 1rem 1rem;
                flex-direction: column;
                align-items: stretch;
                gap: 0.1rem;
                background: rgba(2, 6, 23, 0.5);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .tc-global-navigation.is-open .tc-global-links { display: flex; }
            .tc-global-links a { padding: 0.65rem 0.4rem; }
        }
    `;
    document.head.appendChild(style);

    var navigation = document.getElementById('navbar') ||
        document.querySelector('body > nav, body > header.top, body > header.site-top');
    if (navigation) {
        navigation.classList.add('tc-site-navigation');
        return;
    }

    var header = document.createElement('header');
    header.className = 'tc-global-navigation';
    header.innerHTML = `
        <div class="tc-global-navigation-inner">
            <a class="tc-global-brand" href="${new URL(isBangla ? 'index_bn.html' : 'index.html', siteRoot).href}" aria-label="TriChokro home">
                <img src="${new URL('src/assets/logo_icon.webp', siteRoot).href}" alt="">
                <span>Tri<span style="color:#34d399">Chokro</span></span>
            </a>
            <button class="tc-global-menu-button" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
            <nav class="tc-global-links" aria-label="Main navigation">
                ${navigationLinks.map(function (link) {
                    return '<a href="' + new URL(link[1], siteRoot).href + '">' + link[0] + '</a>';
                }).join('')}
            </nav>
        </div>
    `;
    document.body.prepend(header);
    document.body.classList.add('tc-global-navigation-page');

    var menuButton = header.querySelector('.tc-global-menu-button');
    menuButton.addEventListener('click', function () {
        var isOpen = header.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });
})();
