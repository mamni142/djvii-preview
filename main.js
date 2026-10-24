// VII TORIA — page behaviour. Everything here is an enhancement: without it the page reads in full.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
if (!reduce) document.documentElement.classList.add('anim');

// ---------- smooth scroll ----------
let lenis = null;
addEventListener('DOMContentLoaded', () => {
  if (!reduce && window.Lenis && !location.search.includes('static')) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
});
const scrollToEl = (el) => {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -84, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  scrollToEl(el);
  history.replaceState(null, '', id);
});

// ---------- reveal on scroll, staggered per group ----------
(() => {
  const els = $$('[data-up]');
  const groups = new Map();
  els.forEach((el) => {
    const g = el.parentElement;
    const i = groups.get(g) || 0;
    el.style.setProperty('--d', `${Math.min(i, 6) * 90}ms`);
    groups.set(g, i + 1);
  });
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-up')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-up'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => els.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-up');
  }), 1800));
})();

// ---------- nav ----------
(() => {
  const nav = $('[data-nav]');
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 30);
    if (y > 700 && y > last + 4) nav.classList.add('is-hidden');
    else if (y < last - 4 || y < 700) nav.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  // highlight the section in view
  const links = $$('.nav__links a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-on', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'look', 'watch', 'gallery', 'listen', 'book'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  const btn = $('[data-menu-toggle]'), menu = $('[data-menu]');
  const set = (open) => {
    menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) set(false); });
})();

// ---------- ambient glow and magnetic buttons ----------
(() => {
  const glow = $('[data-glow]');
  if (reduce || !fine) { glow.style.display = 'none'; return; }
  let tx = innerWidth / 2, ty = innerHeight * 0.3, x = tx, y = ty;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const tick = () => { x = lerp(x, tx, 0.08); y = lerp(y, ty, 0.08); glow.style.transform = `translate3d(${x}px, ${y}px, 0)`; requestAnimationFrame(tick); };
  tick();
  $$('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();

// ---------- hero: entrance, depth on scroll, tilt towards the pointer ----------
(() => {
  const hero = $('[data-hero]');
  // the name, letter by letter, with one gold sheen running across the whole word
  const wordEl = $('[data-word]', hero);
  wordEl.innerHTML = [...wordEl.textContent].map((c) => (c === ' ' ? '<span class="sp"></span>' : `<span class="ch">${c}</span>`)).join('');
  const word = $$('.ch', wordEl);
  const measure = () => {
    const W = wordEl.scrollWidth, left = word[0].offsetLeft;
    wordEl.style.setProperty('--W', W);
    word.forEach((c) => c.style.setProperty('--off', c.offsetLeft - left));
  };
  measure(); addEventListener('resize', measure); document.fonts && document.fonts.ready.then(measure);
  const portrait = $('.hero__portrait', hero);
  const sides = $$('.hero__side', hero);
  if (!reduce && portrait.animate) {
    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    word.forEach((w, i) => w.animate([{ opacity: 0, transform: 'translateY(45%) rotateX(-85deg)', filter: 'blur(16px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: i * 50, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }));
    portrait.animate([{ opacity: 0, transform: 'translateY(60px) scale(0.92)', clipPath: 'inset(30% 0 0 0 round 200px)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 0px)' }], { duration: 1100, delay: 120, easing: ease, fill: 'backwards' });
    sides.forEach((s, i) => s.animate([{ opacity: 0, translate: `${i ? 80 : -80}px 40px` }, { opacity: 1, translate: '0 0' }], { duration: 1100, delay: 260, easing: ease, fill: 'backwards' }));
  }
  if (reduce) return;
  let px = 0, py = 0, cx = 0, cy = 0;
  if (fine) hero.addEventListener('pointermove', (e) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; });
  hero.addEventListener('pointerleave', () => { px = 0; py = 0; });
  let heroOn = true, lastKey = '';
  new IntersectionObserver((en) => { heroOn = en[0].isIntersecting; hero.classList.toggle('is-off', !heroOn); if (heroOn) requestAnimationFrame(tick); }).observe(hero);
  const tick = () => {
    if (!heroOn) return;
    cx = lerp(cx, px, 0.07); cy = lerp(cy, py, 0.07);
    const s = clamp(scrollY / innerHeight, 0, 1.2);
    const key = `${cx.toFixed(3)}|${cy.toFixed(3)}|${s.toFixed(3)}`;
    if (key !== lastKey && s < 1.2) {
      lastKey = key;
      portrait.style.transform = `translateY(${s * -40}px) rotateY(${cx * 10}deg) rotateX(${cy * -8}deg)`;
      sides[0].style.transform = `translate3d(${cx * -30}px, ${s * -160 + cy * -20}px, 0)`;
      sides[1].style.transform = `translate3d(${cx * -30}px, ${s * -110 + cy * -20}px, 0)`;
      word.forEach((w, i) => { const side = i < 3 ? -1 : 1, k = i - 3.5; w.style.transform = `translate3d(${side * s * 140 + cx * k * -10}px, ${s * 30 + cy * Math.abs(k) * -4}px, 0) rotateY(${cx * k * 3}deg)`; w.style.opacity = String(1 - s * 0.7); });
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

// ---------- counters ----------
(() => {
  if (reduce) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = (t) => { const k = clamp((t - t0) / dur, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => io.observe(el));
})();

// ---------- watch: real footage, silent loop until asked for sound ----------
const screen = (() => {
  const root = $('[data-screen]');
  const frame = $('[data-screen-frame]', root), poster = $('[data-screen-poster]', root);
  const title = $('[data-screen-title]', root), tag = $('[data-screen-tag]', root);
  let id = '9eEc-ZT8o7g', started = false;
  const src = (vid, sound) => `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=${sound ? 0 : 1}&controls=${sound ? 1 : 0}&loop=1&playlist=${vid}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}${sound ? '' : '&start=90'}`;
  const bg = () => {
    root.classList.remove('is-playing', 'is-live'); root.classList.add('is-bg');
    frame.innerHTML = `<iframe title="${title.textContent} — silent preview" tabindex="-1" allow="autoplay; encrypted-media" src="${src(id)}"></iframe>`;
    listen(frame.querySelector('iframe'));
  };
  const withSound = () => {
    window.dispatchEvent(new CustomEvent('media:video'));
    root.classList.remove('is-bg'); root.classList.add('is-playing', 'is-live');
    frame.innerHTML = `<iframe title="${title.textContent}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen src="${src(id, true)}"></iframe>`;
  };
  // the poster stays until YouTube reports that the clip is really playing
  function listen(ifr) {
    ifr.addEventListener('load', () => {
      let n = 0;
      const t = setInterval(() => { if (++n > 20 || root.classList.contains('is-live')) return clearInterval(t); ifr.contentWindow && ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); }, 300);
    });
  }
  addEventListener('message', (e) => {
    if (!/youtube/.test(e.origin)) return;
    let d; try { d = JSON.parse(e.data); } catch { return; }
    const state = d.event === 'onStateChange' ? d.info : d.info && d.info.playerState;
    if (state === 1) root.classList.add('is-live');
  });
  const cmd = (func) => { const f = frame.querySelector('iframe'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); };
  if (!reduce) new IntersectionObserver((en) => {
    const on = en[0].isIntersecting;
    if (on && !started) { started = true; bg(); return; }
    if (root.classList.contains('is-bg')) cmd(on ? 'playVideo' : 'pauseVideo');
  }, { rootMargin: '100px' }).observe(root);
  $('[data-screen-play]', root).addEventListener('click', withSound);
  $$('[data-reels] .reel').forEach((r) => r.addEventListener('click', () => {
    $$('[data-reels] .reel').forEach((x) => x.classList.toggle('is-on', x === r));
    id = r.dataset.yt; poster.src = r.querySelector('img').src; title.textContent = r.dataset.title; tag.textContent = r.dataset.tag;
    const sound = root.classList.contains('is-playing');
    if (sound) withSound(); else { started = true; reduce ? null : bg(); }
  }));
  return { quiet: () => { if (root.classList.contains('is-playing')) bg(); } };
})();

// ---------- every room so far: a 3D coverflow ----------
(() => {
  const root = $('[data-flow]');
  const items = $$('[data-flow-track] li', root);
  const cap = $('[data-flow-cap]', root);
  const n = items.length;
  let pos = 0, target = 0, dragging = false, startX = 0, startPos = 0, moved = 0, lastInteract = 0, visible = false;
  const width = () => items[0].offsetWidth;
  const wrap = (d) => { d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; };
  const render = () => {
    const w = width(), gap = w * 0.66;
    items.forEach((li, i) => {
      const d = wrap(i - pos), a = Math.abs(d);
      li.style.transform = `translateX(${d * gap}px) translateZ(${-a * 200}px) rotateY(${clamp(-d * 32, -60, 60)}deg) scale(${1 - Math.min(a, 3) * 0.04})`;
      li.style.zIndex = String(100 - Math.round(a * 10));
      li.style.opacity = a > 3.2 ? '0' : String(1 - Math.max(0, a - 2.2) * 0.8);
      li.style.setProperty('--dim', (Math.min(a, 2.5) * 0.24).toFixed(2));
    });
  };
  const setCap = () => {
    const i = ((Math.round(target) % n) + n) % n; cap.textContent = items[i].dataset.cap;
    window.dispatchEvent(new CustomEvent('flow:front', { detail: items[i] }));
  };
  let running = false;
  const loop = () => {
    if (!visible && !dragging) { pos = target; render(); running = false; return; }
    if (!dragging) pos = lerp(pos, target, reduce ? 1 : 0.09);
    render();
    if (dragging || Math.abs(pos - target) > 0.0005) requestAnimationFrame(loop);
    else { pos = target; render(); running = false; }
  };
  const wake = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
  render(); setCap();
  const go = (t) => { target = t; lastInteract = performance.now(); setCap(); wake(); };
  $('[data-flow-prev]', root).addEventListener('click', () => go(Math.round(target) - 1));
  $('[data-flow-next]', root).addEventListener('click', () => go(Math.round(target) + 1));
  root.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(Math.round(target) - 1); if (e.key === 'ArrowRight') go(Math.round(target) + 1); });
  const track = $('[data-flow-track]', root);
  track.addEventListener('pointerdown', (e) => { wake(); dragging = true; moved = 0; startX = e.clientX; startPos = pos; track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
    pos = startPos - dx / (width() * 0.66); target = pos;
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6) { // a tap on a side picture brings it to the front
      const li = e.target.closest('li');
      if (li) { const i = items.indexOf(li); go(Math.round(pos) + wrap(i - Math.round(pos))); return; }
    }
    go(Math.round(pos));
  };
  track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(root);
  if (!reduce) setInterval(() => { if (visible && !dragging && performance.now() - lastInteract > 5000) { target = Math.round(target) + 1; setCap(); wake(); } }, 3800);
})();

// ---------- tiles lean towards the pointer ----------
(() => {
  if (reduce || !fine) return;
  $$('[data-tilt-card]').forEach((t) => {
    t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-6px)`;
    });
    t.addEventListener('pointerleave', () => { t.style.transform = ''; });
  });
})();

// ---------- listen: turntable and her SoundCloud, in our own player ----------
(() => {
  const deck = $('[data-deck]'), body = $('[data-deck-body]'), vinyl = $('[data-platter]'), disc = $('[data-record]');
  const player = $('[data-player]'), embed = $('[data-pl-embed]');
  const titleEl = $('[data-pl-title]'), subEl = $('[data-pl-sub]'), prog = $('[data-pl-progress]');
  const posEl = $('[data-pl-pos]'), durEl = $('[data-pl-dur]'), labelImg = null;
  const mini = $('[data-mini]'), miniTitle = $('[data-mini-title]'), miniK = $('[data-mini-k]'), miniArt = $('[data-mini-art]'), miniProg = $('[data-mini-progress]');
  const SC = 'https://soundcloud.com/victoria-graham-554728684';
  let widget = null, loading = null, playing = false, sounds = [], duration = 0, wantPlay = false;
  // the night opens with her RnB throwback mix
  const START = /rnb throwback/i;
  let startAt = -1;
  // the music fades up over a few seconds instead of hitting at full volume
  let fadeNext = false, fadeT = 0, gestured = false;
  const fadeIn = () => {
    let v = 0; widget.setVolume(0); clearInterval(fadeT);
    fadeT = setInterval(() => { v = Math.min(100, v + 3); widget.setVolume(v); if (v >= 100) clearInterval(fadeT); }, 110);
  };

  // record physics
  let angle = 0, vel = 0, drag = false, lastA = 0, lastT = 0, moved = 0, prev = performance.now();
  const RPM = 200;
  let deckOn = false, spinning = false;
  const spin = (t) => {
    const dt = Math.min(0.05, (t - prev) / 1000); prev = t;
    if (!drag) { vel = lerp(vel, playing ? RPM : 0, Math.min(1, dt * (playing ? 1.4 : 0.9))); angle += vel * dt; }
    disc.style.transform = `rotate(${angle}deg)`;
    if (deckOn && (playing || drag || Math.abs(vel) > 0.5)) requestAnimationFrame(spin); else spinning = false;
  };
  const spinUp = () => { if (!spinning) { spinning = true; prev = performance.now(); requestAnimationFrame(spin); } };
  new IntersectionObserver((en) => { deckOn = en[0].isIntersecting; if (deckOn) spinUp(); }).observe(deck);
  const ang = (e) => { const r = vinyl.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 57.2958; };
  vinyl.addEventListener('pointerdown', (e) => { spinUp(); drag = true; moved = 0; lastA = ang(e); lastT = performance.now(); vinyl.setPointerCapture(e.pointerId); });
  vinyl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    let d = ang(e) - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
    const now = performance.now(); angle += d; moved += Math.abs(d); vel = d / Math.max(0.008, (now - lastT) / 1000); lastA = ang(e); lastT = now;
  });
  const up = () => { if (!drag) return; drag = false; if (moved < 4) toggle(); };
  vinyl.addEventListener('pointerup', up); vinyl.addEventListener('pointercancel', up);
  if (fine && !reduce) {
    deck.addEventListener('pointermove', (e) => {
      if (drag) return;
      const r = deck.getBoundingClientRect();
      body.style.transform = `rotateX(${((e.clientY - r.top) / r.height - 0.5) * -8}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 8}deg)`;
    });
    deck.addEventListener('pointerleave', () => { body.style.transform = ''; });
  }
  new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { if (!playing) vel = 520; spinUp(); io.disconnect(); } }, { threshold: 0.5 }).observe(deck);

  const fmt = (ms) => { const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
  const clean = (t) => (t || '').replace(/^\s*DJ\s*VII\s*TORIA\s*[-–|:]\s*/i, '').replace(/Lastest/g, 'Latest').replace(/\s*\|\s*/g, ' · ').trim();
  // the bar's title rolls like a ticker when it does not fit
  const setMiniTitle = (txt) => {
    if (miniTitle.dataset.t === txt) return;
    miniTitle.dataset.t = txt;
    miniTitle.innerHTML = `<span></span>`; miniTitle.firstChild.textContent = txt;
    miniTitle.classList.remove('is-long', 'is-swap'); void miniTitle.offsetWidth; miniTitle.classList.add('is-swap');
    if (miniTitle.firstChild.offsetWidth > miniTitle.clientWidth + 4) { miniTitle.innerHTML = `<span></span><span></span>`; miniTitle.children[0].textContent = txt; miniTitle.children[1].textContent = txt; miniTitle.classList.add('is-long'); }
  };
  const setState = (v) => {
    playing = v; if (v) spinUp();
    deck.classList.toggle('is-playing', v); player.classList.toggle('is-playing', v);
    $('[data-pl-toggle]').setAttribute('aria-label', v ? 'Pause' : 'Play');
    mini.classList.toggle('is-playing', v);
    $$('[data-mini-play]').forEach((b) => b.setAttribute('aria-label', v ? 'Pause' : 'Play'));
    miniK.textContent = v ? 'Now playing' : (widget && miniTitle.dataset.started ? 'Paused' : 'Tap to play');
    if (v) miniTitle.dataset.started = '1';
  };
  const showSound = () => {
    if (!widget) return;
    widget.getCurrentSound((s) => {
      if (!s) return;
      titleEl.textContent = clean(s.title); setMiniTitle(clean(s.title));
      duration = s.duration || 0; durEl.textContent = duration ? fmt(duration) : '—';
      const i = sounds.findIndex((x) => x.id === s.id);
      subEl.textContent = i >= 0 && s.playback_count ? `${s.playback_count.toLocaleString('en')} plays on SoundCloud` : 'On SoundCloud';
      if (s.artwork_url) miniArt.src = s.artwork_url;
    });
  };
  // before the first play, show the opening mix instead of the newest upload
  const showStart = () => {
    const s = sounds[startAt];
    if (!s || miniTitle.dataset.started) return showSound();
    titleEl.textContent = clean(s.title); setMiniTitle(clean(s.title));
    duration = s.duration || 0; durEl.textContent = duration ? fmt(duration) : '—';
    subEl.textContent = s.playback_count ? `${s.playback_count.toLocaleString('en')} plays on SoundCloud` : 'On SoundCloud';
    if (s.artwork_url) miniArt.src = s.artwork_url;
  };
  const load = () => loading || (loading = new Promise((res) => {
    embed.innerHTML = `<iframe title="VII TORIA on SoundCloud" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(SC)}&color=%23e6c590&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>`;
    const s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.onload = () => {
      widget = window.SC.Widget(embed.querySelector('iframe'));
      const E = window.SC.Widget.Events;
      widget.bind(E.READY, () => { widget.getSounds((l) => { sounds = l || []; startAt = sounds.findIndex((x) => START.test(x.title || '')); showStart(); res(); tryAuto(); }); });
      widget.bind(E.PLAY, () => { if (fadeNext) { fadeNext = false; fadeIn(); } setState(true); showSound(); screen.quiet(); });
      widget.bind(E.PAUSE, () => {
        // a pause before any tap means the browser blocked the arrival start: wait for the first tap and fade in then
        if (!gestured) { clearInterval(fadeT); widget.setVolume(0); fadeNext = true; delete miniTitle.dataset.started; }
        setState(false);
      });
      widget.bind(E.FINISH, () => setState(false));
      widget.bind(E.PLAY_PROGRESS, (p) => { prog.style.width = `${(p.relativePosition || 0) * 100}%`; miniProg.style.transform = `scaleX(${p.relativePosition || 0})`; posEl.textContent = fmt(p.currentPosition || 0); });
    };
    s.onerror = () => { embed.classList.add('is-visible'); res(); };
    document.head.append(s);
  }));
  const start = () => {
    if (!miniTitle.dataset.started) { fadeNext = true; widget.setVolume(0); }
    if (!miniTitle.dataset.started && startAt > 0) widget.skip(startAt); else widget.play();
  };
  // try to start on arrival; browsers that block sound before a tap start it on the first tap instead
  const tryAuto = () => { if (!soundOff && !playing && !miniTitle.dataset.started) start(); };
  const play = async () => {
    wantPlay = true;
    if (!widget) { titleEl.textContent = 'Loading her mixes…'; await load(); }
    if (!widget) return;
    start();
    setTimeout(() => { if (wantPlay && !playing) { embed.classList.add('is-visible'); subEl.textContent = 'Press play in the player below to start'; showSound(); } }, 3500);
  };
  const toggle = () => {
    gestured = true;
    if (playing) { wantPlay = false; widget && widget.pause(); try { sessionStorage.setItem('vii-sound', 'off'); } catch (e) { /* private mode */ } }
    else play();
  };
  // before anything has played, next and previous step from the opening mix
  const fresh = () => !miniTitle.dataset.started && startAt > 0;
  const nextMix = async () => { gestured = true; await load(); if (!widget) return; if (fresh()) widget.skip(startAt + 1); else { widget.next(); if (!playing) widget.play(); } setTimeout(showSound, 600); };
  const prevMix = async () => { gestured = true; await load(); if (!widget) return; if (fresh()) widget.skip(startAt - 1); else { widget.prev(); if (!playing) widget.play(); } setTimeout(showSound, 600); };
  $('[data-pl-toggle]').addEventListener('click', toggle);
  $('[data-deck-start]').addEventListener('click', toggle);
  $('[data-pl-next]').addEventListener('click', nextMix);
  $('[data-pl-prev]').addEventListener('click', prevMix);
  $('[data-pl-bar]').addEventListener('click', (e) => {
    if (!widget || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    widget.seekTo(duration * clamp((e.clientX - r.left) / r.width, 0, 1));
  });
  window.addEventListener('media:video', () => { if (playing && widget) widget.pause(); });

  // a discreet bar that is always there: what is playing, pause, previous, next
  $$('[data-mini-play]').forEach((b) => b.addEventListener('click', toggle));
  $('[data-mini-prev]').addEventListener('click', prevMix);
  $('[data-mini-next]').addEventListener('click', nextMix);
  const showBar = () => { mini.hidden = false; void mini.offsetWidth; mini.classList.add('is-in'); };
  // her music starts with the visitor's first tap or key (browsers do not allow sound before that)
  let soundOff = false; try { soundOff = sessionStorage.getItem('vii-sound') === 'off'; } catch (e) { /* private mode */ }
  const first = (e) => {
    if (e.target.closest && e.target.closest('[data-mini], .player, .tt, .screen, .reels, .stories')) return stop();
    stop(); gestured = true;
    if (!playing && !soundOff) play();
  };
  const stop = () => { removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true); };
  addEventListener('pointerdown', first, true);
  addEventListener('keydown', first, true);
  if (soundOff) miniK.textContent = 'Press play';
  // the player loads quietly in the background so the first tap starts the music at once
  setTimeout(showBar, document.documentElement.classList.contains('is-loading') ? 2300 : 1200);
  load();
})();

// ---------- plan your night: a seven-step planner that writes the message ----------
(() => {
  const form = $('[data-wizard]');
  const steps = $$('[data-step]', form);
  const back = $('[data-w-back]', form), next = $('[data-w-next]', form);
  const dots = $('[data-w-dots]', form), count = $('[data-w-count]', form), progress = $('[data-w-progress]', form);
  const T = {
    yacht:     { title: 'Yacht party',       img: 'img/yacht-party.jpg', like: 'A night like Big Daddy Yacht',          music: ['Lounge house', 'Afrobeats', 'Amapiano', '80s to 2000s hits'] },
    hotel:     { title: 'Hotel or pool day', img: 'img/sky-view.jpg',        like: 'A day like Address Sky View, pool side', music: ['Lounge house', 'R&B and hip-hop', 'House'] },
    club:      { title: 'Club night',        img: 'img/vii-club.jpg',        like: 'A night like VII, Conrad Dubai',         music: ['Club hits', 'Afrobeats', 'Amapiano', 'House'] },
    corporate: { title: 'Company party',     img: 'img/one-and-only.jpg',    like: 'A night like One&Only, 300 guests',      music: ['80s to 2000s hits', 'Club hits', 'Arabic', 'Afrobeats'] },
    launch:    { title: 'Launch party',      img: 'img/waldorf-yas.jpg',     like: 'A night like the Waldorf Astoria launch', music: ['Lounge house', 'House', 'Disco house'] },
    private:   { title: 'Private party',     img: 'img/bellagio.jpg',        like: 'A party like Lake Como, 2021',           music: ['Disco house', 'R&B and hip-hop', 'Latin', '80s to 2000s hits'] },
    wedding:   { title: 'Wedding',           img: 'img/sea-fu.jpg',          like: 'Dinner into dancing, like Sea Fu',       music: ['R&B and hip-hop', 'Arabic', 'Bollywood', '80s to 2000s hits'] },
    lesson:    { title: 'DJ lessons',        img: 'img/crank.jpg',           like: 'Lessons at Smart Gate DJ School',        music: [] },
  };
  const ENERGY = { 'Lounge house': 1, 'R&B and hip-hop': 2, 'Disco house': 2, 'Latin': 3, 'Arabic': 3, 'Bollywood': 3, 'Afrobeats': 3, 'House': 4, 'Amapiano': 4, '80s to 2000s hits': 4, 'Club hits': 5 };
  const HITS = '80s to 2000s hits';
  let index = 0, musicTouched = false, lastType = null, lastArc = [];

  dots.innerHTML = steps.map(() => '<i></i>').join('');
  const go = (i, dir = 1) => {
    index = clamp(i, 0, steps.length - 1);
    steps.forEach((s, k) => { s.classList.toggle('is-active', k === index); s.classList.toggle('is-back', k === index && dir < 0); });
    $$('i', dots).forEach((d, k) => { d.classList.toggle('is-on', k === index); d.classList.toggle('is-done', k < index); });
    const two = (n) => String(n).padStart(2, '0');
    count.innerHTML = `<b>${two(index + 1)}</b><span>/ ${two(steps.length)}</span>`;
    count.setAttribute('aria-label', `Step ${index + 1} of ${steps.length}`);
    progress.style.width = `${((index + 1) / steps.length) * 100}%`;
    back.disabled = index === 0;
    form.classList.toggle('is-last', index === steps.length - 1);
    $('span', next).textContent = index === steps.length - 2 ? 'Review' : 'Next';
  };
  next.addEventListener('click', () => go(index + 1, 1));
  back.addEventListener('click', () => go(index - 1, -1));
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { e.preventDefault(); go(index + 1, 1); } });
  form.addEventListener('submit', (e) => e.preventDefault());

  const guests = $('[data-guests]', form), guestsOut = $('[data-guests-out]', form);
  const hours = $('[data-hours]', form), hoursOut = $('[data-hours-out]', form);
  const date = $('[data-date]', form);
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  date.min = today.toISOString().slice(0, 10);
  $$('[data-hstep]', form).forEach((b) => b.addEventListener('click', () => { hours.value = clamp(+hours.value + +b.dataset.hstep, 1, 12); update(); }));

  const lower = (s) => (/^(R&B|Afrobeats|Arabic|Bollywood|Latin)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
  const list = (a) => (a.length < 2 ? a[0] || '' : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const sentence = (a) => { const t = list(a.map(lower)); return t.charAt(0).toUpperCase() + t.slice(1); };
  const arcFor = (type, music) => {
    if (type === 'lesson') return [['First lesson', 'Controller and beatmatching'], ['Then', 'Phrasing, reading a floor'], ['Goal', 'Your first recorded mix']];
    if (!music.length) return [['Arrival', 'Open format'], ['Peak', 'Whatever fills the floor'], ['Last hour', 'Songs everyone sings']];
    const s = [...music].sort((a, b) => ENERGY[a] - ENERGY[b]);
    const arrival = s[0], lastHour = music.includes(HITS) ? HITS : s[s.length - 1];
    let peak = s.filter((m) => m !== arrival && m !== lastHour).slice(-2);
    if (!peak.length) peak = [lastHour];
    return [['Arrival', sentence([arrival])], ['Peak', sentence(peak)], ['Last hour', sentence([lastHour])]];
  };
  const fmtDate = (v) => (v ? new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const ui = { tag: $('[data-t-tag]'), img: $('[data-t-img]'), title: $('[data-t-title]'), when: $('[data-t-when]'), arc: $('[data-t-arc]'), gear: $('[data-t-gear]'), like: $('[data-t-like]'), msg: $('[data-message]'), wa: $('[data-send-wa]'), mail: $('[data-send-mail]') };
  // pictures cross-fade: the old one stays on top as a ghost and dissolves while the new one settles
  const fadeTo = (src) => {
    if (ui.img.getAttribute('src') === src) return;
    if (reduce) { ui.img.src = src; return; }
    const box = ui.img.parentElement, old = box.querySelector('.ticket__ghost');
    if (old) old.remove();
    const ghost = ui.img.cloneNode();
    ghost.removeAttribute('data-t-img'); ghost.className = 'ticket__ghost';
    const vid = box.querySelector('.live-video.is-on');
    if (vid && vid.readyState >= 2) {
      try { const c = document.createElement('canvas'); c.width = vid.videoWidth; c.height = vid.videoHeight; c.getContext('2d').drawImage(vid, 0, 0); ghost.src = c.toDataURL('image/jpeg', 0.8); } catch (e) { /* keep the still */ }
    }
    box.insertBefore(ghost, ui.tag);
    ui.img.src = src;
    ghost.animate([{ opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(10px)', transform: 'scale(1.04)' }], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = () => ghost.remove();
    ui.img.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1400, easing: 'cubic-bezier(.2,.7,.2,1)' });
  };
  const setTag = (html) => {
    if (!ui.tag || ui.tag.innerHTML === html) return;
    ui.tag.innerHTML = html;
    if (!reduce) ui.tag.animate([{ opacity: 0, transform: 'translate(-50%, 8px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translate(-50%, 0)', filter: 'blur(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
  };
  let text = '';
  function update() {
    const f = new FormData(form);
    const type = f.get('type') || 'yacht', t = T[type];
    const music = f.getAll('music');
    const g = +guests.value, h = +hours.value;
    guestsOut.textContent = g >= 500 ? '500+' : g;
    hoursOut.textContent = h;
    guests.style.setProperty('--p', `${((g - 10) / 490) * 100}%`);
    const day = fmtDate(f.get('date')), time = f.get('time') || '';
    const speakers = f.get('speakers') === 'yes', consoleOn = f.get('console') === 'yes';
    const crowd = (f.get('crowd') || '').trim(), who = (f.get('name') || '').trim();
    const lesson = type === 'lesson';

    if (type !== lastType) {
      if (lastType) fadeTo(t.img); else ui.img.src = t.img;
      ui.title.textContent = t.title; ui.like.textContent = t.like;
      if (lastType && !reduce) [ui.title, ui.like].forEach((el) => el.animate([{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(8px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' }));
      const pick = $$('input[name="type"]', form).find((r) => r.value === type);
      if (pick) setTag(`<i>${String($$('input[name="type"]', form).indexOf(pick) + 1).padStart(2, '0')}</i>${esc($('b', pick.closest('label')).textContent)}`);
      lastType = type;
    }
    const people = lesson ? (g <= 10 ? 'private lesson' : `${g} students`) : `${g >= 500 ? '500+' : g} guests`;
    ui.when.textContent = [day || 'Pick a day', time, `${h} hour${h > 1 ? 's' : ''}`, people].join(' · ');
    const arc = arcFor(type, music);
    ui.arc.innerHTML = arc.map(([k, v], i) => `<li class="${lastArc[i] && lastArc[i][1] !== v ? 'is-new' : ''}"><span>${k}</span><b>${esc(v)}</b></li>`).join('');
    lastArc = arc;
    ui.gear.textContent = lesson ? 'Lessons on pro Pioneer gear, or on your own controller.'
      : speakers && consoleOn ? 'Your speakers and console; VII brings the music.'
      : speakers ? 'Your speakers, her own controller.'
      : consoleOn ? 'VII brings speakers and plays your console.'
      : 'VII brings speakers and her own controller.';

    text = [
      lesson ? "Hi VII! I'd like to ask about DJ lessons." : "Hi VII! I'd like to book you.",
      `Occasion: ${t.title}`,
      `Date: ${day || 'to be decided'}${time ? ', ' + time : ''}, ${h} hour${h > 1 ? 's' : ''}`,
      `${lesson ? 'Students' : 'Guests'}: about ${g >= 500 ? '500+' : g}${crowd ? ' (' + crowd + ')' : ''}`,
      lesson ? null : `Music: ${music.length ? music.join(', ') : 'open format'}`,
      lesson ? null : `Speakers on site: ${speakers ? 'yes' : 'no'} · DJ console on site: ${consoleOn ? 'yes' : 'no'}`,
      who ? `From: ${who}` : null,
    ].filter(Boolean).join('\n');
    ui.msg.textContent = text;
    ui.wa.href = `https://wa.me/971502375736?text=${encodeURIComponent(text)}`;
    ui.mail.href = `mailto:Djviitoria@gmail.com?subject=${encodeURIComponent(`Booking request: ${t.title}${day ? ', ' + day : ''}`)}&body=${encodeURIComponent(text)}`;
  }
  const defaults = (type) => {
    if (musicTouched) return;
    const want = new Set(T[type].music);
    $$('input[name="music"]', form).forEach((c) => { c.checked = want.has(c.value); });
  };
  form.addEventListener('input', (e) => {
    if (e.target.name === 'music') musicTouched = true;
    if (e.target.name === 'type') defaults(e.target.value);
    update();
  });
  // the arch previews an occasion while the pointer rests on it, and returns to the chosen one after
  const occ = $('.opts--photo', form);
  const showImg = fadeTo;
  const tagFor = (input) => { const n = $$('input[name="type"]', form).indexOf(input) + 1; return `<i>${String(n).padStart(2, '0')}</i>${esc($('b', input.closest('label')).textContent)}`; };
  occ.addEventListener('pointerover', (e) => { const l = e.target.closest('label'); if (!l || e.pointerType !== 'mouse') return; showImg($('img', l).getAttribute('src')); setTag(tagFor($('input', l))); });
  occ.addEventListener('pointerleave', () => { const c = $('input[name="type"]:checked', form); if (!c) return; showImg(T[c.value].img); setTag(tagFor(c)); });
  // choosing an occasion moves straight on to the music
  $$('input[name="type"]', form).forEach((r) => r.addEventListener('click', () => setTimeout(() => go(1, 1), 380)));

  $('[data-copy]').addEventListener('click', async (e) => {
    const b = e.currentTarget, s = $('span', b);
    try { await navigator.clipboard.writeText(text); s.textContent = 'Copied'; } catch { s.textContent = 'Select the text above'; }
    setTimeout(() => { s.textContent = 'Copy text'; }, 2000);
  });

  // cards across the page pick the occasion, then the planner opens on the music
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-pick]');
    if (!a) return;
    const r = $(`input[name="type"][value="${a.dataset.pick}"]`, form);
    if (!r) return;
    r.checked = true; musicTouched = false; defaults(r.value); update();
    go(a.dataset.pick === 'lesson' ? 2 : 1, 1);
  });

  defaults('yacht'); update(); go(0);
})();

// ---------- the time in Dubai ----------
(() => {
  const el = $('[data-dubai-time]');
  const tick = () => { el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' }).format(new Date()); };
  tick(); setInterval(tick, 30000);
})();
