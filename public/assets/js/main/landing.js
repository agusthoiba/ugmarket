(function () {
  'use strict';

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Rupiah tween ---------- */
  function fmt(v) {
    return 'Rp ' + Math.round(Math.max(0, v)).toLocaleString('id-ID');
  }

  function tween(el, to, prefix) {
    if (!el) return;
    var from = el._v || 0;
    var start = null;
    var dur = 350;
    if (el._raf) cancelAnimationFrame(el._raf);
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (to - from) * eased;
      el.textContent = (prefix || '') + fmt(Math.abs(val));
      if (p < 1) { el._raf = requestAnimationFrame(step); } else { el._v = to; }
    }
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- Calculator ---------- */
  var priceEl = document.getElementById('calc-price');
  var discEl = document.getElementById('calc-discount');
  var feeEl = document.getElementById('calc-fee');

  function recalc() {
    if (!priceEl) return;
    var price = parseFloat(priceEl.value) || 0;
    var disc = Math.min(parseFloat(discEl.value) || 0, 90);
    var feePct = parseFloat(feeEl.value) || 0;

    var sell = price * (1 - disc / 100);
    var admin = sell * (feePct / 100);
    var otherNet = sell - admin;

    document.getElementById('calc-fee-value').textContent = feePct + '%';
    document.getElementById('calc-fee-echo').textContent = feePct;
    tween(document.getElementById('calc-ugsync-price'), sell);
    tween(document.getElementById('calc-other-price'), sell);
    tween(document.getElementById('calc-other-fee'), admin, '-');
    tween(document.getElementById('calc-ugsync-net'), sell);
    tween(document.getElementById('calc-other-net'), otherNet);
    tween(document.getElementById('calc-savings'), admin);
  }

  if (priceEl && discEl && feeEl) {
    [priceEl, discEl, feeEl].forEach(function (el) {
      el.addEventListener('input', recalc);
    });
    recalc();
  }

  /* ---------- Catalog filter ---------- */
  var tabs = document.querySelectorAll('.tab-ugs');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      document.querySelectorAll('.product-col').forEach(function (col) {
        var show = filter === 'Semua' || col.getAttribute('data-cat') === filter;
        col.classList.toggle('hide', !show);
      });
    });
  });
})();
