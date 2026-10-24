// VII TORIA — next level: intro, cursor, gold dust, letter titles, lookbook, stories, marquee speed.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  // photos of her that have a living (video) version, made from the same frame
  const LIVE = { 'hero-portrait.jpg': 'hero-loop', 'yacht-party.jpg': 'yacht-loop', 'sea-fu.jpg': 'seafu-loop', 'frank.jpg': 'frank-loop', 'anwa.jpg': 'anwa-loop', 'sls.jpg': 'sls-loop', 'sky-view.jpg': 'skyview-loop', 'boho-salon.jpg': 'boho-loop', 'waldorf-yas.jpg': 'waldorf-loop', 'one-and-only.jpg': 'oneandonly-loop', 'vii-club.jpg': 'viiclub-loop', 'f1-abu-dhabi.jpg': 'f1-loop', 'bellagio.jpg': 'bellagio-loop', 'elfe-gallery.jpg': 'elfe-loop', 'rove-expo.jpg': 'roveexpo-loop', 'mysk.jpg': 'mysk-loop' };
  const quiet = reduce || (navigator.connection && navigator.connection.saveData);
  // H.264 is decoded by the graphics chip almost everywhere; VP9 often falls back to the processor
  const webm = !document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"');
  const liveSrc = (src, small) => { if (quiet || !src) return null; const k = Object.keys(LIVE).find((f) => src.endsWith(f)); return k ? `img/${LIVE[k]}${small && !webm ? '-sm' : ''}.${webm ? 'webm' : 'mp4'}` : null; };
  const smooth = () => (typeof lenis !== 'undefined' ? lenis : null); // eslint-disable-line no-undef

  // ---------- intro: the monogram draws itself, then the curtain lifts ----------
  const loader = $('[data-loader]');
  if (root.classList.contains('is-loading')) {
    const n = $('[data-loader-n]'), t0 = performance.now(), dur = 1750;
    const count = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      n.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      if (k < 1) return requestAnimationFrame(count);
      try { sessionStorage.setItem('vii-intro', '1'); } catch (e) { /* private mode */ }
      loader.classList.add('is-out');
      root.classList.remove('is-loading');
      // replay the hero entrance now that it can be seen
      $$('.hero__word .ch, .hero__portrait, .hero__side').forEach((el) => el.getAnimations().forEach((a) => { if (a.effect && a.effect.getTiming().iterations === 1) { a.currentTime = 0; a.play(); } }));
      setTimeout(() => loader.remove(), 1300);
    };
    requestAnimationFrame(count);
  } else if (loader) loader.remove();

  // ---------- section titles rise letter by letter ----------
  $$('.title').forEach((t) => {
    let i = 0;
    t.innerHTML = t.textContent.trim().split(/\s+/).map((w) => `<span class="w">${[...w].map((c) => `<span class="c" style="--ci:${i++}">${c}</span>`).join('')}</span>`).join(' ');
  });

  // ---------- a gold cursor that names what you can do ----------
  if (fine && !reduce) {
    const cur = $('[data-cursor]'), ring = $('.cursor__ring', cur), dot = $('.cursor__dot', cur), label = $('[data-cursor-label]', cur);
    root.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('pointermove', (e) => { cur.style.opacity = '1'; x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px, ${y}px, 0)`; }, { passive: true });
    const tick = () => { rx = lerp(rx, x, 0.18); ry = lerp(ry, y, 0.18); ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; requestAnimationFrame(tick); };
    tick();
    document.addEventListener('pointerover', (e) => {
      const named = e.target.closest('[data-cursor]:not(.cursor)');
      const link = e.target.closest('a, button, label, [role="button"], input[type="range"]');
      cur.classList.toggle('is-label', !!named);
      cur.classList.toggle('is-link', !named && !!link);
      if (named) label.textContent = named.getAttribute('data-cursor');
    });
    document.addEventListener('pointerleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { cur.style.opacity = '1'; });
  }

  // ---------- gold dust drifting through the spotlight ----------
  (() => {
    const cv = $('[data-dust]');
    if (!cv || reduce) return;
    const ctx = cv.getContext('2d');
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    const sg = sprite.getContext('2d'), grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 236, 200, 1)'); grad.addColorStop(0.18, 'rgba(240, 210, 160, 0.9)'); grad.addColorStop(0.45, 'rgba(240, 200, 140, 0.25)'); grad.addColorStop(1, 'rgba(240, 200, 140, 0)');
    sg.fillStyle = grad; sg.fillRect(0, 0, 32, 32);
    let w, h, dpr, parts = [], on = true, mx = -9999, my = -9999;
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = cv.offsetWidth; h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(clamp(w * h / 22000, 30, 70));
      parts = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.3, vy: -(Math.random() * 0.25 + 0.05), vx: (Math.random() - 0.5) * 0.12, p: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.006 }));
    };
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    new IntersectionObserver((en) => { on = en[0].isIntersecting; if (on) requestAnimationFrame(draw); }).observe(cv);
    function draw() {
      if (!on) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.p += p.s; p.x += p.vx; p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (14000 - d2) / 14000 * 1.4; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const a = 0.25 + Math.sin(p.p) * 0.25 + 0.2;
        const s = p.r * 7;
        ctx.globalAlpha = a; ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  // ---------- the look: vertical scroll moves the lookbook sideways ----------
  (() => {
    const sec = $('[data-look]');
    if (!sec) return;
    const head = $('.look__head', sec), track = $('[data-look-track]', sec), ghost = $('[data-look-ghost]', sec), bar = $('[data-look-bar]', sec);
    const imgs = $$('.look__img img', sec);
    const wide = matchMedia('(min-width: 861px)');
    let dist = 0, centres = [], lastShift = 0, ticking = false;
    const size = () => {
      centres = imgs.map((im) => { const li = im.closest('li'); return li.offsetLeft + li.offsetWidth / 2; });
      if (!wide.matches) { sec.style.removeProperty('--look-h'); return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.setProperty('--look-h', `${dist + innerHeight}px`);
    };
    const update = () => {
      if (wide.matches) {
        const r = sec.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, sec.offsetHeight - innerHeight), 0, 1);
        lastShift = p * dist;
        track.style.transform = `translate3d(${-lastShift}px, 0, 0)`;
        ghost.style.transform = `translate3d(${-p * dist * 0.35}px, 0, 0)`;
        bar.style.transform = `scaleX(${p})`;
        head.style.opacity = String(clamp(1 - p * 7, 0, 1));
        head.style.transform = `translate3d(${-p * 260}px, 0, 0)`;
      } else {
        head.style.opacity = ''; head.style.transform = '';
        const max = track.scrollWidth - track.clientWidth;
        bar.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
      }
      const c = innerWidth / 2, shift = wide.matches ? lastShift : track.scrollLeft;
      imgs.forEach((im, k) => { const x = centres[k] - shift - c; if (Math.abs(x) < innerWidth) im.parentElement.style.setProperty('--px', `${(x * -0.06).toFixed(1)}px`); });
    };
    size(); update();
    addEventListener('resize', () => { size(); update(); });
    addEventListener('load', () => { size(); update(); });
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
    addEventListener('scroll', queue, { passive: true });
    track.addEventListener('scroll', queue, { passive: true });
  })();

  // ---------- stories: her nights full screen, tap through ----------
  (() => {
    const box = $('[data-stories]');
    const items = $$('.look__card').map((c) => ({ img: c.dataset.storyImg, cap: c.dataset.storyCap, place: c.dataset.storyPlace }));
    if (!box || !items.length) return;
    const bars = $('[data-st-bars]', box), img = $('[data-st-img]', box), bg = $('[data-st-bg]', box);
    const cap = $('[data-st-cap]', box), place = $('[data-st-place]', box), phone = $('[data-st-phone]', box);
    const DUR = 5200;
    const sv = document.createElement('video');
    sv.className = 'stories__img stories__vid'; sv.muted = true; sv.loop = true; sv.playsInline = true; sv.setAttribute('aria-hidden', 'true');
    img.after(sv);
    sv.addEventListener('playing', () => sv.classList.add('is-on'));
    let i = 0, t = 0, last = 0, paused = false, open = false, raf = 0, opener = null;
    bars.innerHTML = items.map(() => '<i></i>').join('');
    const marks = $$('i', bars);
    items.forEach((it) => { new Image().src = it.img; });
    const show = (k) => {
      i = (k + items.length) % items.length; t = 0;
      img.classList.remove('is-run'); void img.offsetWidth;
      img.src = items[i].img; bg.src = items[i].img; img.alt = `VII TORIA, ${items[i].cap}, ${items[i].place}`;
      if (!reduce) img.classList.add('is-run');
      const vs = liveSrc(items[i].img);
      sv.classList.remove('is-on');
      if (vs) { if (!sv.src.endsWith(vs)) sv.src = vs; sv.currentTime = 0; sv.play().catch(() => {}); } else sv.pause();
      cap.textContent = items[i].cap; place.textContent = items[i].place;
      cap.style.animation = 'none'; void cap.offsetWidth; cap.style.animation = '';
      marks.forEach((m, n) => m.style.setProperty('--f', n < i ? 1 : 0));
    };
    const frame = (now) => {
      if (!open) return;
      const dt = now - last; last = now;
      if (!paused) {
        t += dt;
        marks[i].style.setProperty('--f', Math.min(1, t / DUR));
        if (t >= DUR) { if (i === items.length - 1) { marks[i].style.setProperty('--f', 1); paused = true; } else show(i + 1); }
      }
      raf = requestAnimationFrame(frame);
    };
    const openAt = (k, from) => {
      opener = from; open = true; paused = false; box.hidden = false;
      document.body.style.overflow = 'hidden'; const s = smooth(); if (s) s.stop();
      show(k); last = performance.now(); raf = requestAnimationFrame(frame);
      $('[data-st-close]', box).focus();
    };
    const close = () => {
      open = false; cancelAnimationFrame(raf); box.hidden = true; sv.pause();
      document.body.style.overflow = ''; const s = smooth(); if (s) s.start();
      if (opener) opener.focus();
    };
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-story-open]');
      if (o) { e.preventDefault(); openAt(+o.dataset.storyOpen || 0, o); }
    });
    document.addEventListener('keydown', (e) => {
      const o = e.target.closest && e.target.closest('[role="button"][data-story-open]');
      if (o && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openAt(+o.dataset.storyOpen || 0, o); return; }
      if (!open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { paused = false; show(i + 1); }
      if (e.key === 'ArrowLeft') { paused = false; show(i - 1); }
    });
    $('[data-st-next]', box).addEventListener('click', () => { paused = false; if (i === items.length - 1) close(); else show(i + 1); });
    $('[data-st-prev]', box).addEventListener('click', () => { paused = false; show(i - 1); });
    $('[data-st-close]', box).addEventListener('click', close);
    $('[data-st-book]', box).addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.stories__bg')) close(); });
    // hold to pause, swipe down to close
    let sy = 0, held = 0;
    phone.addEventListener('pointerdown', (e) => { sy = e.clientY; held = setTimeout(() => { paused = true; }, 180); });
    phone.addEventListener('pointerup', (e) => {
      clearTimeout(held);
      if (e.clientY - sy > 90) { close(); return; }
      if (paused && i !== items.length - 1) { paused = false; e.stopPropagation(); }
    });
  })();

  // ---------- living photos: wherever one of her animated photos appears, the loop fades in over it ----------
  (() => {
    if (quiet) return;
    const pics = $$('img').filter((im) => liveSrc(im.getAttribute('src')) && !im.closest('.stories, .nav, .stories__top'));
    const start = (v) => {
      if (document.hidden) return;
      if (!v.src) v.src = v.dataset.src;
      const go = () => v.play().catch(() => {});
      root.classList.contains('is-loading') ? setTimeout(go, 1700) : go();
    };
    const visible = new Set();
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target._live;
      if (!v) return;
      if (e.isIntersecting) { visible.add(v); start(v); } else { visible.delete(v); v.pause(); }
    }), { rootMargin: '60px 0px', threshold: 0.15 });
    // in the gallery only the picture in front moves; the ones behind stay still
    const flowVids = [], optVids = [];
    // in the planner only the chosen occasion and the one under the pointer move
    const optSync = () => optVids.forEach((v) => {
      const label = v.closest('label'), on = label.querySelector('input').checked || label.matches(':hover');
      if (on && plannerOn) start(v); else v.pause();
    });
    let plannerOn = false;
    const planner = $('[data-wizard]');
    if (planner) {
      new IntersectionObserver((en) => { plannerOn = en[0].isIntersecting; optSync(); }, { threshold: 0.1 }).observe(planner);
      planner.addEventListener('change', optSync);
      planner.addEventListener('pointerover', (e) => { if (e.target.closest('.opts--photo label')) optSync(); });
      planner.addEventListener('pointerout', (e) => { if (e.target.closest('.opts--photo label')) setTimeout(optSync, 0); });
    }
    addEventListener('flow:front', (e) => {
      const front = e.detail && e.detail._live;
      flowVids.forEach((v) => { if (v !== front) v.pause(); });
      if (front && flowOn) start(front);
    });
    let flowOn = false;
    const flow = $('[data-flow]');
    if (flow) new IntersectionObserver((en) => {
      flowOn = en[0].isIntersecting;
      if (!flowOn) flowVids.forEach((v) => v.pause());
      else { const f = flowVids.find((v) => v.parentElement.style.zIndex === '100'); if (f) start(f); }
    }, { threshold: 0.2 }).observe(flow);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) $$('.live-video').forEach((v) => v.pause()); else visible.forEach(start);
    });
    pics.forEach((im) => {
      const v = document.createElement('video');
      v.className = 'live-video';
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.dataset.src = liveSrc(im.getAttribute('src'), !!im.closest('.hero__side, .about__avatar, .tt__label, .opts'));
      v.style.objectPosition = getComputedStyle(im).objectPosition;
      v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
      im.after(v);
      im._live = v; v._live = v;
      im.parentElement._live = v;
      if (im.closest('.flow__track')) flowVids.push(v);
      else if (im.closest('.opts')) optVids.push(v);
      else io.observe(im.parentElement);
      // the ticket swaps its picture with the chosen occasion: its loop follows
      if (im.closest('.ticket')) new MutationObserver(() => {
        const s = liveSrc(im.getAttribute('src'));
        v.classList.remove('is-on'); v.pause();
        if (!s) { v.removeAttribute('src'); v.dataset.src = ''; return; }
        v.dataset.src = s; v.src = s;
        v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
        if (visible.has(v)) start(v);
      }).observe(im, { attributes: true, attributeFilter: ['src'] });
    });
  })();

  // ---------- the names band speeds up with the scroll ----------
  (() => {
    const track = $('.marquee__track');
    if (!track || reduce || !track.getAnimations) return;
    let lastY = scrollY, rate = 1;
    const tick = () => {
      const anim = track.getAnimations()[0];
      const v = Math.abs(scrollY - lastY); lastY = scrollY;
      rate = lerp(rate, 1 + Math.min(v / 6, 6), 0.08);
      if (anim) anim.playbackRate = rate;
      requestAnimationFrame(tick);
    };
    tick();
  })();
})();
