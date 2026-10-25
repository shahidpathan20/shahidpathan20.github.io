(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- falling numbers (green on black) ---------- */
  var canvas = document.getElementById('rain');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var size = 16, cols = [], w = 0, h = 0, dpr = 1, last = 0;
    var glyphs = '01010101234567890123456789';
    function pick() { return glyphs.charAt((Math.random() * glyphs.length) | 0); }

    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = size + 'px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      var n = Math.ceil(w / size);
      cols = [];
      for (var i = 0; i < n; i++) {
        var len = 10 + ((Math.random() * 18) | 0);
        var chars = [];
        for (var k = 0; k < len; k++) chars.push(pick());
        cols.push({
          x: i * size,
          y: -Math.random() * h,
          speed: 40 + Math.random() * 90,
          len: len,
          chars: chars,
          on: Math.random() < 0.55
        });
      }
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (t - last < 40) return;               /* about 25 fps */
      var dt = Math.min((t - last) / 1000, 0.1); last = t;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < cols.length; i++) {
        var c = cols[i];
        if (!c.on) { if (Math.random() < 0.002) c.on = true; continue; }
        c.y += c.speed * dt;
        if (c.y - c.len * size > h) {
          c.y = -Math.random() * 200;
          c.speed = 40 + Math.random() * 90;
          c.on = Math.random() < 0.7;
        }
        if (Math.random() < 0.25) c.chars[(Math.random() * c.len) | 0] = pick();
        for (var k = 0; k < c.len; k++) {
          var y = c.y - k * size;
          if (y < -size || y > h) continue;
          var a = (1 - k / c.len);
          if (k === 0) ctx.fillStyle = 'rgba(190,255,215,' + (0.9) + ')';
          else ctx.fillStyle = 'rgba(57,255,122,' + (a * 0.55).toFixed(3) + ')';
          ctx.fillText(c.chars[k], c.x, y);
        }
      }
    }

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setup, 200); });
    setup();
    requestAnimationFrame(frame);
  }

  /* ---------- tab bar: shadow line + active tab ---------- */
  var bar = document.querySelector('.navbar');
  function onScroll() { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var links = document.querySelectorAll('.nav nav a');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
        var a = byId[e.target.id];
        if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('section[id]').forEach(function (s) { spy.observe(s); });

    /* ---------- reveal on scroll ---------- */
    var targets = document.querySelectorAll('.block > *, .card, .step, .cert, .goal-card');
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; seen.unobserve(el);
        el.classList.add('in');
        var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
        setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 900 + d * 1000);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el, i) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (el.classList.contains('card') || el.classList.contains('step')) el.style.setProperty('--d', (sib % 6) * 0.08 + 's');
      el.classList.add('reveal');
      seen.observe(el);
    });
  }
})();
