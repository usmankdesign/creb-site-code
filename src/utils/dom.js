/* ==========================================================================
   DOM helpers
   ========================================================================== */

// Run fn once the DOM is parsed. Works whether the script loads sync, deferred or late.
export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

// Bind a click handler only if the element exists (avoids null errors on other pages)
export function onClick(selector, handler, root) {
  var el = (root || document).querySelector(selector);
  if (el) el.addEventListener('click', handler);
  return el;
}
