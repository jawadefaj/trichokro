/* ত্রিচক্র বাংলা সাইট — interactions. No dependencies. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var bnDigits = '০১২৩৪৫৬৭৮৯';
  function toBn(n) { return String(n).replace(/\d/g, function (d) { return bnDigits[d]; }); }
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  /* ---------- Header state + reading progress ---------- */
  var hdr = $('.hdr'), bar = $('#progress'), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0, h = root.scrollHeight - innerHeight;
      if (hdr) hdr.classList.toggle('is-scrolled', y > 16);
      if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
      timelines.forEach(updateTimeline);
      ticking = false;
    });
  }

  /* ---------- Mobile menu (closed = hidden and untappable) ---------- */
  var burger = $('.burger'), mnav = $('#mnav');
  function setMenu(open) {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
    mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    $$('.m-link', mnav).forEach(function (a, i) { a.style.transitionDelay = open ? (60 + i * 45) + 'ms' : '0ms'; });
    if (open) { var f = $('.m-link', mnav); if (f) f.focus({ preventScroll: true }); }
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (innerWidth > 1020) setMenu(false); });
  }

  /* ---------- Reveal on scroll + counters + bars ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', t0 = null, dur = 1600;
    if (reduce) { el.textContent = pre + toBn(target.toFixed(dec)) + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + toBn((target * e).toFixed(dec)) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function splitWords(el) {
    if (el.dataset.split) return; el.dataset.split = '1';
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
            var s = doc.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.classList.contains('grad')) {
          // gradient text is clipped to its own glyphs, so animate it as one unit
          var wrap = doc.createElement('span'); wrap.className = 'w'; wrap.style.setProperty('--i', i++);
          n.parentNode.replaceChild(wrap, n); wrap.appendChild(n);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) { walk(n); }
      });
    })(el);
  }
  $$('.split-words').forEach(splitWords);
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; el.classList.add('is-in'); io.unobserve(el);
      if (el.hasAttribute('data-count') && !el.dataset.done) { el.dataset.done = 1; countUp(el); }
      $$('[data-count]', el).forEach(function (c) { if (!c.dataset.done) { c.dataset.done = 1; countUp(c); } });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  $$('[data-reveal], .split-words, [data-count], .bars, .stats').forEach(function (el, i) {
    if (el.hasAttribute('data-reveal') && !el.style.getPropertyValue('--d')) {
      var sib = el.parentElement ? $$(':scope > [data-reveal]', el.parentElement) : [];
      var idx = sib.indexOf(el); if (idx > 0) el.style.setProperty('--d', Math.min(idx, 6) * 0.08 + 's');
    }
    if (io) io.observe(el); else { el.classList.add('is-in'); if (el.hasAttribute('data-count')) countUp(el); }
  });

  /* ---------- Timeline fill ---------- */
  var timelines = $$('.tl');
  function updateTimeline(tl) {
    var r = tl.getBoundingClientRect(), vh = innerHeight;
    var p = (vh * 0.75 - r.top) / Math.max(1, r.height);
    tl.style.setProperty('--tp', Math.max(0, Math.min(1, p)).toFixed(3));
  }

  /* ---------- Cursor spotlight, magnetic buttons, tilt (mouse only) ---------- */
  if (finePointer && !reduce) {
    doc.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card');
      if (c) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.22) + 'px');
        b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.3) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
    $$('[data-tilt]').forEach(function (f) {
      f.addEventListener('pointermove', function (e) {
        var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        f.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); f.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      f.addEventListener('pointerleave', function () { f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });
    var heroVis = $('.hero-visual'), car = $('.hero-car');
    if (heroVis && car) {
      heroVis.addEventListener('pointermove', function (e) {
        var r = heroVis.getBoundingClientRect();
        car.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1) + 'px');
        car.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 16).toFixed(1) + 'px');
      });
      heroVis.addEventListener('pointerleave', function () { car.style.setProperty('--tx', '0px'); car.style.setProperty('--ty', '0px'); });
    }
  }

  /* ---------- Rotating words ---------- */
  $$('[data-rotate]').forEach(function (rot) {
    var items = $$(':scope > span', rot), i = 0;
    if (items.length < 2) return;
    items[0].classList.add('is-on');
    if (reduce) return;
    setInterval(function () {
      var cur = items[i]; cur.classList.remove('is-on'); cur.classList.add('is-out');
      setTimeout(function () { cur.classList.remove('is-out'); }, 700);
      i = (i + 1) % items.length; items[i].classList.add('is-on');
    }, 2600);
  });

  /* ---------- Tabs (team tabs, product explorer) ---------- */
  $$('[data-tabs]').forEach(function (group) {
    var tabs = $$('[role="tab"]', group);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = doc.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (panel) {
          panel.hidden = !on;
          if (on) { panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in'); $$('[data-reveal]', panel).forEach(function (el) { el.classList.add('is-in'); }); }
        }
      });
      if (focus) tab.focus();
      if (tab.scrollIntoView && group.getAttribute('data-tabs') === 'scroll' && innerWidth < 860) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0]; if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lb');
  if (lb) {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb), list = [], at = 0, lastFocus = null;
    lbImg.addEventListener('error', function () { if (list.length > 1) { list.splice(at, 1); show(at); } });
    function show(k) {
      at = (k + list.length) % list.length; var it = list[at];
      lbImg.src = it.src; lbImg.alt = it.alt; lbCap.textContent = it.alt + '  ·  ' + toBn(at + 1) + '/' + toBn(list.length);
    }
    function open(group, src) {
      list = []; var seen = {};
      $$('[data-lightbox="' + group + '"]').forEach(function (b) {
        var s = b.getAttribute('data-src'); if (seen[s]) return; seen[s] = 1;
        list.push({ src: s, alt: b.getAttribute('data-alt') || '' });
      });
      var k = 0; list.forEach(function (it, i) { if (it.src === src) k = i; });
      lastFocus = doc.activeElement; show(k); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); body.classList.add('menu-open');
      $('.lb-close', lb).focus();
    }
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); body.classList.remove('menu-open'); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
    doc.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lightbox]');
      if (b) { e.preventDefault(); open(b.getAttribute('data-lightbox'), b.getAttribute('data-src')); }
    });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', function () { show(at - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- Lite YouTube ---------- */
  doc.addEventListener('click', function (e) {
    var y = e.target.closest && e.target.closest('[data-yt]');
    if (!y) return; e.preventDefault();
    var id = y.getAttribute('data-yt');
    var f = doc.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    f.title = y.getAttribute('aria-label') || 'YouTube video'; f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
    var holder = doc.createElement('div'); holder.className = 'yt'; holder.appendChild(f);
    y.replaceWith(holder);
  });

  /* ---------- Click-to-reveal contact details ---------- */
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-show]');
    if (!b) return;
    var box = doc.createElement('div'); box.innerHTML = b.getAttribute('data-show'); b.replaceWith(box);
  });

  /* ---------- Horizontal rail arrows ---------- */
  $$('[data-rail-prev],[data-rail-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = doc.getElementById(btn.getAttribute('data-rail-prev') || btn.getAttribute('data-rail-next'));
      if (!rail) return; var dir = btn.hasAttribute('data-rail-next') ? 1 : -1;
      rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.85, 420), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- News helpers (shared with the newsroom pages) ---------- */
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var catColor = { 'Recognition': 'rgba(251,191,36,.38)', 'In the Press': 'rgba(56,189,248,.38)', 'Competition': 'rgba(167,139,250,.38)', 'Partnership': 'rgba(52,224,161,.38)', 'Archive': 'rgba(148,163,184,.3)', 'Video Interviews': 'rgba(251,113,133,.38)' };
  var monthsBn = { Jan: 'জানুয়ারি', Feb: 'ফেব্রুয়ারি', Mar: 'মার্চ', Apr: 'এপ্রিল', May: 'মে', Jun: 'জুন', Jul: 'জুলাই', Aug: 'আগস্ট', Sep: 'সেপ্টেম্বর', Oct: 'অক্টোবর', Nov: 'নভেম্বর', Dec: 'ডিসেম্বর' };
  function bnDate(d) {
    if (!d) return '';
    if (/unconfirmed/i.test(d)) return 'তারিখ অনিশ্চিত';
    return toBn(d.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/g, function (m, k) { return monthsBn[k]; }));
  }
  function newsItems() {
    var raw = window.TC_NEWS || [], tr = window.TC_NEWS_BN || {};
    return raw.map(function (x) { var t = tr[x.id] || {}; var o = {}; for (var k in x) o[k] = x[k]; for (var j in t) o[j] = t[j]; o._cat = x.category; return o; });
  }
  function catName(c) { return (window.TC_CATEGORIES_BN || {})[c] || c; }
  function newsCard(x) {
    var big = catName(x._cat).split(' ')[0];
    return '<a class="card lift news-card edge" href="blog_bn.html?post=' + encodeURIComponent(x.id) + '">' +
      '<div class="news-art" style="--na:' + (catColor[x._cat] || 'rgba(52,224,161,.35)') + '"><span class="chip">' + esc(catName(x._cat)) + '</span>' +
      (x.metric ? '<span class="metric">' + esc(toBn(x.metric)) + '</span>' : '') + '<b>' + esc(big) + '</b></div>' +
      '<div class="in"><time>' + esc(bnDate(x.date)) + '</time><h3>' + esc(x.title) + '</h3><p>' + esc(x.excerpt) + '</p>' +
      '<span class="link-arrow">পড়ুন <svg class="ic"><use href="#i-arrow-up-right"/></svg></span></div></a>';
  }
  window.TCBN = { esc: esc, toBn: toBn, bnDate: bnDate, newsItems: newsItems, newsCard: newsCard, catName: catName };

  var rail = $('[data-news-rail]');
  if (rail && window.TC_NEWS) {
    var items = newsItems().filter(function (x) { return x._cat !== 'Source Review' && !x.external; })
      .sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || String(b.dateSort || '').localeCompare(String(a.dateSort || '')); })
      .slice(0, parseInt(rail.getAttribute('data-news-rail'), 10) || 8);
    if (items.length) rail.innerHTML = items.map(newsCard).join('');
  }

  /* ---------- Latest YouTube uploads (same feed as the English page) ---------- */
  var feed = $('[data-yt-feed]');
  if (feed && 'fetch' in window && location.protocol !== 'file:') {
    var ctl = 'AbortController' in window ? new AbortController() : null, timer = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    fetch('youtube-feed.php', { signal: ctl ? ctl.signal : undefined, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        if (!d || !d.ok || !d.videos || !d.videos.length) return;
        var have = {}; $$('[data-yt]', feed).forEach(function (n) { have[n.getAttribute('data-yt')] = 1; });
        var add = d.videos.filter(function (v) { return /^[\w-]{11}$/.test(v.id) && !have[v.id]; }).slice(0, 6 - Object.keys(have).length);
        add.forEach(function (v) {
          var a = doc.createElement('article'); a.className = 'vid-card'; a.setAttribute('data-reveal', ''); a.classList.add('is-in');
          a.innerHTML = '<button class="yt" type="button" data-yt="' + v.id + '" aria-label="ভিডিও চালু করুন: ' + esc(v.title) + '"><img loading="lazy" decoding="async" alt="" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg"><span class="play"><svg class="ic"><use href="#i-play"/></svg></span></button><h3>' + esc(v.title) + '</h3><p class="muted">' + esc(bnDate((v.published || '').slice(0, 10))) + '</p>';
          feed.appendChild(a);
        });
      }).catch(function () {}).then(function () { clearTimeout(timer); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = toBn(new Date().getFullYear()); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
