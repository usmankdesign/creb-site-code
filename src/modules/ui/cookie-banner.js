/* ==========================================================================
   UI — Cookie notice
   Shows #cookie-popup after a short delay unless already accepted.
   Injects a close (✕) button; #cookie-btn ("I Understand") also dismisses.

   Storage key "cookieAccepted" is unchanged, so visitors who already
   accepted won't see it again.
   CSS: #cookie-popup.is-visible / .is-hidden (styled in Webflow)
   ========================================================================== */

import { safeGet, safeSet } from '../../utils/storage.js';

var STORAGE_KEY = 'cookieAccepted';
var SHOW_DELAY = 2500; // ms

export function initCookieBanner() {
  if (safeGet(STORAGE_KEY)) return;

  var popup = document.getElementById('cookie-popup');
  if (!popup) return;

  popup.style.position = 'fixed';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'cookie-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close cookie notice');
  closeBtn.innerHTML = '&#x2715;';
  popup.appendChild(closeBtn);

  function hide() {
    popup.classList.remove('is-visible');
    popup.classList.add('is-hidden');
    safeSet(STORAGE_KEY, 'true');
  }

  setTimeout(function () { popup.classList.add('is-visible'); }, SHOW_DELAY);

  closeBtn.addEventListener('click', hide);
  var understandBtn = document.getElementById('cookie-btn');
  if (understandBtn) understandBtn.addEventListener('click', hide);
}
