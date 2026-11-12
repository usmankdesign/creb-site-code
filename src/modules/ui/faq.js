/* ==========================================================================
   UI — FAQ accordion
   One item open at a time. Clicking an open item closes it.

   Requires: .faq-item (with a .faq-icon child showing + / −)
   CSS: .faq-item.open (styled in Webflow)
   ========================================================================== */

export function initFaq() {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  function setIcon(item, symbol) {
    var icon = item.querySelector('.faq-icon');
    if (icon) icon.textContent = symbol;
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');

      items.forEach(function (el) {
        el.classList.remove('open');
        setIcon(el, '+');
      });

      if (!wasOpen) {
        item.classList.add('open');
        setIcon(item, '−');
      }
    });
  });
}
