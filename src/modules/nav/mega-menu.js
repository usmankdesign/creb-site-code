/* ==========================================================================
   NAV — Mega menu
   Desktop (>= 992px): opens on hover with a short close delay.
   Tablet/mobile (< 992px): toggles on tap.

   Requires: .w-dropdown > .w-dropdown-toggle + .mega-menu
   CSS: .mega-menu.is-open (styled in Webflow)

   Note: the old footer had TWO mega-menu scripts. The first bound hover at
   every screen size, which clashed with the tap toggle on mobile (tap fired
   mouseenter → opened, then click → closed). Merged into this one version.
   ========================================================================== */

import { CONFIG } from '../../config.js';

var CLOSE_DELAY = 100;  // ms before closing after mouse leaves
var FADE_DURATION = 250; // ms — should match the .mega-menu transition in Webflow

export function initMegaMenu() {
  var dropdowns = document.querySelectorAll('.w-dropdown');
  if (!dropdowns.length) return;

  var isDesktop = function () { return window.innerWidth >= CONFIG.breakpoints.desktop; };

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector('.w-dropdown-toggle');
    var menu   = dropdown.querySelector('.mega-menu');
    if (!toggle || !menu) return;

    var timer;

    function open() {
      menu.style.display = 'block';
      void menu.offsetWidth; // force reflow so the transition runs
      menu.classList.add('is-open');
    }

    function close() {
      menu.classList.remove('is-open');
      setTimeout(function () {
        if (!menu.classList.contains('is-open')) menu.style.display = 'none';
      }, FADE_DURATION);
    }

    // ── Desktop hover ─────────────────────────────────────
    dropdown.addEventListener('mouseenter', function () {
      if (!isDesktop()) return;
      clearTimeout(timer);
      open();
    });

    dropdown.addEventListener('mouseleave', function () {
      if (!isDesktop()) return;
      timer = setTimeout(close, CLOSE_DELAY);
    });

    // ── Tablet/mobile tap toggle ──────────────────────────
    toggle.addEventListener('click', function (e) {
      if (isDesktop()) return;
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains('is-open')) close();
      else open();
    });
  });
}
