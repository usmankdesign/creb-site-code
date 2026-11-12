/* ==========================================================================
   UI — Copyright year
   Fills every .copyright-year with the current year.
   ========================================================================== */

export function initCopyrightYear() {
  var year = String(new Date().getFullYear());
  document.querySelectorAll('.copyright-year').forEach(function (el) {
    el.textContent = year;
  });
}
