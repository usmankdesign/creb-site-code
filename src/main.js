/* ==========================================================================
   CREB — Site scripts (entry)
   Bundled + minified to dist/main.min.js. Load in Webflow Site settings →
   Footer code with `defer`.

   Every module checks for its own elements and exits quietly on pages that
   don't have them. Each one runs isolated, so an error in one feature can
   never stop the others.
   ========================================================================== */

import { onReady } from './utils/dom.js';

// Tracking
import { initAttribution } from './modules/tracking/attribution.js';

// Navigation
import { initMegaMenu } from './modules/nav/mega-menu.js';
import { initMobileMenu } from './modules/nav/mobile-menu.js';

// Forms
import { initPhoneInputs } from './modules/forms/phone-input.js';
import { initKlaviyoForms } from './modules/forms/klaviyo-forms.js';
import { initBondGuideForms } from './modules/forms/bond-guide-form.js';

// UI
import { initCookieBanner } from './modules/ui/cookie-banner.js';
import { initFaq } from './modules/ui/faq.js';
import { initCopyrightYear } from './modules/ui/copyright-year.js';
import { initContactCta } from './modules/ui/contact-cta.js';
import { initCoTabs } from './modules/ui/co-tabs.js';

// Calculators
import { initReturnsCalculator } from './modules/calculators/returns-calculator.js';
import { initCardCalculators } from './modules/calculators/card-calculator.js';

// Order matters only where noted: attribution first so UTMs are captured
// before anything else can fail or navigate.
var MODULES = [
  ['attribution',        initAttribution],
  ['mega-menu',          initMegaMenu],
  ['mobile-menu',        initMobileMenu],
  ['phone-inputs',       initPhoneInputs],
  ['klaviyo-forms',      initKlaviyoForms],
  ['bond-guide-forms',   initBondGuideForms],
  ['cookie-banner',      initCookieBanner],
  ['faq',                initFaq],
  ['copyright-year',     initCopyrightYear],
  ['contact-cta',        initContactCta],
  ['co-tabs',            initCoTabs],
  ['returns-calculator', initReturnsCalculator],
  ['card-calculators',   initCardCalculators]
];

function run(name, init) {
  try {
    init();
  } catch (err) {
    console.error('[CREB] ' + name + ' failed to initialise:', err);
  }
}

onReady(function () {
  MODULES.forEach(function (m) { run(m[0], m[1]); });
});
