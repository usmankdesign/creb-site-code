/* ==========================================================================
   Smoke test — runs dist/main.min.js in a simulated browser (jsdom)
   1. Empty page: no module may throw when its elements are missing
   2. Full page: every module initialises and responds to basic interaction
   Run: npm test   (after npm run build)
   ========================================================================== */

const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'dist', 'main.min.js'), 'utf8');

function load(html, url) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><body>' + html + '</body></html>', {
    runScripts: 'outside-only',
    virtualConsole: new VirtualConsole(), // silence jsdom's own noise (e.g. link navigation)
    url: url || 'https://www.compoundrealestatebonds.com/'
  });
  const w = dom.window;
  w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = clearTimeout;
  w.console.error = (...args) => errors.push(args.join(' '));
  w.fetch = () => Promise.resolve({ status: 202, ok: true, json: () => Promise.resolve({}) });
  w.eval(bundle);
  return { w, d: w.document, errors };
}

const FULL_PAGE = `
  <div class="w-dropdown"><a class="w-dropdown-toggle">Menu</a><div class="mega-menu"></div></div>
  <button id="mob-menu-btn"><svg><rect id="md1"/><rect id="md2"/><rect id="md3"/><rect id="md4"/></svg></button>
  <input id="amount"><input id="years">
  <button data-action="amount-plus"></button><button data-action="amount-minus"></button>
  <button data-action="years-plus"></button><button data-action="years-minus"></button>
  <span id="r-total"></span><span id="r-hys"></span><div id="bar-hys"></div>
  <button data-preset="amount" data-value="5000"></button>
  <div class="card"><input id="card-calc-investment"><span id="card-annual-result"></span>
    <button class="calc-preset" data-value="10000"></button>
    <button class="calc-step-btn" data-action="calc-amount-plus"></button></div>
  <form><input type="tel" name="phone"></form>
  <form class="klaviyo-form" data-klaviyo-list-id="TEST"><input name="email" value="a@b.co"></form>
  <div class="faq-item"><span class="faq-icon">+</span><div class="faq-answer"></div></div>
  <span class="copyright-year"></span>
  <div class="co-tabs-wrapper"><div class="co-tab-wrapper"><p>A</p></div><div class="co-tab-wrapper"><p>B</p></div></div>
  <div class="contact-cta-container"></div><a id="creb-ir-cta" href="#"></a>
  <div id="cookie-popup"></div>
  <a id="applink" href="https://app.compoundbanc.com/signup">Invest</a>
`;

(async () => {
  // 1. Empty page
  const empty = load('');
  assert.deepStrictEqual(empty.errors, [], 'Errors on empty page: ' + empty.errors.join(' | '));

  // 2. Full page
  const { w, d, errors } = load(FULL_PAGE, 'https://www.compoundrealestatebonds.com/?utm_source=google&gclid=abc123');

  d.querySelector('[data-action="amount-plus"]').click();
  assert.strictEqual(d.getElementById('amount').value, '$10,500', 'Returns calculator +500');

  d.querySelector('.calc-step-btn').click();
  assert.strictEqual(d.getElementById('card-calc-investment').value, '10500', 'Card calculator +500');

  d.querySelector('.faq-item').click();
  assert.ok(d.querySelector('.faq-item').classList.contains('open'), 'FAQ opens');

  assert.strictEqual(d.querySelector('.copyright-year').textContent, String(new Date().getFullYear()), 'Copyright year');
  assert.ok(d.querySelector('.creb-tel-wrap .creb-tel-flag'), 'Phone input enhanced');
  assert.ok(d.querySelector('.co-tabs-wrapper').classList.contains('is-ready'), 'Co-tabs ready');
  assert.ok(d.querySelector('.contact-cta-backdrop'), 'Contact CTA backdrop injected');
  assert.ok(d.getElementById('cookie-close'), 'Cookie close button injected');

  d.getElementById('applink').dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  const href = d.getElementById('applink').getAttribute('href');
  assert.ok(href.includes('gclid=abc123') && href.includes('utm_source=google'), 'Attribution appended: ' + href);

  await new Promise((r) => setTimeout(r, 50));
  assert.deepStrictEqual(errors, [], 'Errors on full page: ' + errors.join(' | '));

  console.log('✓ Smoke test passed — empty page clean, all modules initialise');
  process.exit(0);
})().catch((err) => {
  console.error('✗ Smoke test failed:', err.message);
  process.exit(1);
});
