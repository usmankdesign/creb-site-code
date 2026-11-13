/* ==========================================================================
   UI — Hover tabs (accordion-style)
   Each .co-tabs-wrapper holds several .co-tab-wrap items. The hovered /
   tapped / focused tab expands its body; the last one stays open.
   First tab is open by default.

   Requires: .co-tabs-wrapper > .co-tab-wrap
             body = .co-tab-body-copy, else .co-tab-body, else the tab's first <p>
   CSS: styles/co-tabs.css
   ========================================================================== */

var HOVER_DELAY = 80; // ms — stops accidental switching while the cursor passes over
var TAB = '.co-tab-wrap';
var BODY = ['.co-tab-body-copy', '.co-tab-body', 'p'];

function findBody(tab) {
  for (var i = 0; i < BODY.length; i++) {
    var el = tab.querySelector(BODY[i]);
    if (el) return el;
  }
  return null;
}

function wrapBody(tab) {
  var body = findBody(tab);
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
    // Direct children only, so a nested tab set can't be picked up twice
    var tabs = Array.prototype.filter.call(container.children, function (el) {
      return el.matches(TAB);
    });
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
