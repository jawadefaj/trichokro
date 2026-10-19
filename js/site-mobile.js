// Site-wide helpers: in-page YouTube playback, responsive Facebook feed,
// scroll progress bar, card spotlight and capability card entrance.
(function () {
    var navigationScript = document.createElement('script');
    navigationScript.src = new URL('site-navigation.js', document.currentScript.src).href;
    navigationScript.defer = true;
    document.head.appendChild(navigationScript);

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Lets CSS hide the capability cards only when JS is here to reveal them.
    root.classList.add('tc-anim');

    function revealCapabilities() {
        var lists = document.querySelectorAll('.tc-cap-list');
        if (!lists.length) return;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            lists.forEach(function (l) { l.classList.add('is-in'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        lists.forEach(function (l) { io.observe(l); });
    }

    // Thin gradient bar at the top showing how far down the page you are.
    function initProgressBar() {
        var bar = document.createElement('div');
        bar.className = 'tc-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
        var ticking = false;
        function update() {
            var max = root.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    // Soft glow that follows the mouse across cards (desktop only).
    if (finePointer && !reduceMotion) {
        document.addEventListener('pointermove', function (e) {
            var card = e.target.closest && e.target.closest('.tc-capability, .tilt-card, .video-card');
            if (!card) return;
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }, { passive: true });
    }

    function onReady() {
        revealCapabilities();
        initProgressBar();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    // Turn a .video-lite thumbnail into a real YouTube player when tapped.
    function playVideo(btn) {
        var id = btn.getAttribute('data-video-id');
        if (!id) return;
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
            '?autoplay=1&rel=0&playsinline=1&modestbranding=1';
        iframe.title = btn.getAttribute('data-video-title') || 'YouTube video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
        btn.replaceWith(iframe);
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.video-lite');
        if (btn) {
            e.preventDefault();
            playVideo(btn);
        }
    });

    // The Facebook page plugin only lays out at the width given in its URL,
    // so size it to its container (180–500px is the plugin's allowed range).
    function sizeFacebookFeeds() {
        document.querySelectorAll('.fb-feed-wrap iframe[data-fb-page]').forEach(function (frame) {
            var wrap = frame.parentElement;
            var width = Math.max(180, Math.min(500, Math.floor(wrap.clientWidth)));
            var height = Math.round(frame.getBoundingClientRect().height) || 800;
            if (frame.dataset.renderedWidth === String(width)) return;
            frame.dataset.renderedWidth = String(width);
            frame.src = 'https://www.facebook.com/plugins/page.php?href=' +
                encodeURIComponent(frame.getAttribute('data-fb-page')) +
                '&tabs=timeline&width=' + width + '&height=' + height +
                '&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true';
        });
    }

    var resizeTimer;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sizeFacebookFeeds, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sizeFacebookFeeds);
    } else {
        sizeFacebookFeeds();
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
})();
