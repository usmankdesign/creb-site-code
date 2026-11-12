/* ==========================================================================
   UI — Hover tabs (accordion-style)
   Each .co-tabs-wrapper holds several .co-tab-wrapper items. The hovered /
   tapped / focused tab expands its body; the last one stays open.
   First tab is open by default.

   Requires: .co-tabs-wrapper > .co-tab-wrapper (body = .co-tab-body or first <p>)
   CSS: styles/co-tabs.css
   ========================================================================== */

var HOVER_DELAY = 80; // ms — stops accidental switching while the cursor passes over

function wrapBody(tab) {
  var body = tab.querySelector('.co-tab-body') || tab.querySelector('p');
  if (!body || body.closest('.co-tab-collapse')) return;

  var outer = document.createElement('div');
  outer.className = 'co-tab-collapse';
  var inner = document.createElement('div');
  inner.className = 'co-tab-collapse-inner';

  body.parentNode.insertBefore(outer, body);
  inner.appendChild(body);
  outer.appendChild(inner);
}

export function initCoTabs() {
  document.querySelectorAll('.co-tabs-wrapper').forEach(function (container) {
    var tabs = Array.prototype.slice.call(container.querySelectorAll('.co-tab-wrapper'));
    if (!tabs.length) return;

    tabs.forEach(wrapBody);

    function activate(target) {
      if (target.classList.contains('is-active')) return;
      tabs.forEach(function (tab) {
        var on = tab === target;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }

    activate(tabs[0]);

    tabs.forEach(function (tab) {
      var timer;
      if (!tab.hasAttribute('tabindex')) tab.setAttribute('tabindex', '0');

      tab.addEventListener('mouseenter', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { activate(tab); }, HOVER_DELAY);
      });
      tab.addEventListener('mouseleave', function () { clearTimeout(timer); });
      tab.addEventListener('click', function () { activate(tab); });   // touch
      tab.addEventListener('focusin', function () { activate(tab); }); // keyboard
    });

    container.classList.add('is-ready');
  });
}
