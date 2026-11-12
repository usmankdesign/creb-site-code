/* ==========================================================================
   UI — Mobile contact CTA sheet
   On mobile (<= 767px), clicking #creb-ir-cta slides .contact-cta-container
   up from the bottom with a blurred backdrop.
   Closes on: close button, backdrop tap, [data-cta-close], Escape.

   Requires: .contact-cta-container, one or more #creb-ir-cta triggers
             (duplicate IDs across nav variants are supported)
   CSS: styles/contact-cta.css
   ========================================================================== */

import { CONFIG } from '../../config.js';

var CLOSE_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12"/></svg>';

export function initContactCta() {
  var container = document.querySelector('.contact-cta-container');
  if (!container) return;

  var isMobile = function () { return window.innerWidth <= CONFIG.breakpoints.mobile; };

  // Close button (inject if not built in Webflow)
  if (!container.querySelector('.contact-cta-close')) {
    var closeBtn = document.createElement('button');
    closeBtn.className = 'contact-cta-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = CLOSE_ICON;
    container.appendChild(closeBtn);
  }

  // Backdrop
  var backdrop = document.createElement('div');
  backdrop.className = 'contact-cta-backdrop';
  document.body.appendChild(backdrop);

  function openCta() {
    if (!isMobile()) return;
    container.classList.remove('is-closing');
    container.classList.add('is-visible');
    backdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCta() {
    container.classList.remove('is-visible');
    container.classList.add('is-closing');
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // Triggers
  document.querySelectorAll('[id="creb-ir-cta"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openCta();
    });
  });

  backdrop.addEventListener('click', closeCta);

  container.addEventListener('click', function (e) {
    if (e.target.closest('.contact-cta-close, [data-cta-close]')) {
      e.preventDefault();
      e.stopPropagation();
      closeCta();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && container.classList.contains('is-visible')) closeCta();
  });
}
