/* ==========================================================================
   CREB — Shared configuration
   Single source of truth for IDs, rates and breakpoints used across modules.
   Change values here, rebuild, and tag a new release.
   ========================================================================== */

export const CONFIG = {
  // Viewport breakpoints (match Webflow's tablet / mobile-landscape breakpoints)
  breakpoints: {
    desktop: 992, // >= 992px = desktop (mega menu hover)
    mobile: 767   // <= 767px = mobile (contact CTA sheet)
  },

  // Klaviyo (public client API — company ID is safe to expose)
  klaviyo: {
    companyId: 'WucAEj',
    revision: '2023-08-15',
    bondGuideListId: 'VqWaeL'
  },

  // Attribution capture + propagation to the app
  attribution: {
    appHost: 'app.compoundbanc.com',
    ttlDays: 30,
    timestampKey: '_creb_attr_ts',
    trackedKeys: [
      'fbclid', 'gclid',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'referral_code'
    ]
  },

  // Calculator rates (nominal annual rates)
  rates: {
    creb: 0.085,     // CREB headline rate — used by both calculators
    hys: 0.044,      // High-yield savings comparison
    national: 0.005  // National average savings comparison
  }
};
