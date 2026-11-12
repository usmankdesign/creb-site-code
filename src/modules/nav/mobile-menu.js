/* ==========================================================================
   NAV — Mobile "four dots" menu button
   Animates 4 SVG <rect> dots outward when the menu opens, and proxies the
   click to Webflow's native .w-nav-button.

   Requires: #mob-menu-btn, #md1–#md4 (SVG rects), .w-nav-button
   ========================================================================== */

var EXPAND = 2;      // dot spread on open — lower = subtler, higher = more dramatic
var DURATION = 300;  // ms

var CLOSED = [{ x: 6, y: 6 }, { x: 17, y: 6 }, { x: 6, y: 17 }, { x: 17, y: 17 }];
var OPENED = [
  { x: 6 - EXPAND,  y: 6 - EXPAND },
  { x: 17 + EXPAND, y: 6 - EXPAND },
  { x: 6 - EXPAND,  y: 17 + EXPAND },
  { x: 17 + EXPAND, y: 17 + EXPAND }
];

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function initMobileMenu() {
  var btn   = document.getElementById('mob-menu-btn');
  var dots  = ['md1', 'md2', 'md3', 'md4'].map(function (id) { return document.getElementById(id); });
  var wfBtn = document.querySelector('.w-nav-button');

  if (!btn || dots.some(function (d) { return !d; })) return;

  var open = false;
  var raf;
  var prog = 0;

  function setDots(p) {
    for (var i = 0; i < 4; i++) {
      var x = CLOSED[i].x + (OPENED[i].x - CLOSED[i].x) * p;
      var y = CLOSED[i].y + (OPENED[i].y - CLOSED[i].y) * p;
      dots[i].setAttribute('x', String(x));
      dots[i].setAttribute('y', String(y));
    }
  }

  function animate(target) {
    cancelAnimationFrame(raf);
    var startProg = prog;
    var startTime = performance.now();
    function step(now) {
      var t = Math.min((now - startTime) / DURATION, 1);
      prog = startProg + (target - startProg) * ease(t);
      setDots(prog);
      if (t < 1) raf = requestAnimationFrame(step);
      else prog = target;
    }
    raf = requestAnimationFrame(step);
  }

  btn.addEventListener('click', function () {
    open = !open;
    animate(open ? 1 : 0);
    if (wfBtn) wfBtn.click();
  });

  // Sync dots when Webflow closes the menu itself (link click, outside tap)
  if (wfBtn) {
    new MutationObserver(function () {
      if (!wfBtn.classList.contains('w--open') && open) {
        open = false;
        animate(0);
      }
    }).observe(wfBtn, { attributes: true, attributeFilter: ['class'] });
  }
}
