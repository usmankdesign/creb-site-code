/* ==========================================================================
   FORMS — Bond Investment Guide form
   On submit:
   1. Subscribes the lead to the Bond Guide Klaviyo list (with UTMs/click IDs
      from hidden fields)
   2. Triggers the PDF download (URL from data-pdf-url on the wrapper)
   3. Pushes "bond_guide_download" to the dataLayer (GTM conversion)
   4. Shows Webflow's native success / fail state

   Requires: .bond-guide-form wrapper (with data-pdf-url) containing a <form>
   Expected field names: email, name, phone, utm_*, gclid, fbclid,
                         landing_page, referrer
   ========================================================================== */

import { CONFIG } from '../../config.js';
import { subscribeToList } from '../../utils/klaviyo.js';

var PDF_FILENAME = 'CREB-Bond-Investment-Guide.pdf';
var LEAD_SOURCE  = 'Bond Investment Guide';

function setButtonText(btn, text) {
  if (!btn) return;
  if (btn.tagName === 'INPUT') btn.value = text;
  else btn.textContent = text;
}

function downloadPdf(url) {
  var link = document.createElement('a');
  link.href = url;
  link.download = PDF_FILENAME;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function initBondGuideForms() {
  document.querySelectorAll('.bond-guide-form').forEach(function (formWrapper) {
    var form = formWrapper.querySelector('form') || formWrapper;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
      var originalText = submitBtn ? (submitBtn.value || submitBtn.textContent) : 'Submit';
      setButtonText(submitBtn, 'Sending…');
      if (submitBtn) submitBtn.disabled = true;

      // Collect form data
      var data = {};
      for (var pair of new FormData(form).entries()) data[pair[0]] = pair[1];

      var attributes = {
        email: data.email,
        first_name: data.name || '',
        phone_number: data.phone || '',
        properties: {
          utm_source: data.utm_source || '',
          utm_medium: data.utm_medium || '',
          utm_campaign: data.utm_campaign || '',
          utm_term: data.utm_term || '',
          utm_content: data.utm_content || '',
          gclid: data.gclid || '',
          fbclid: data.fbclid || '',
          landing_page: data.landing_page || '',
          referrer: data.referrer || '',
          lead_source: LEAD_SOURCE,
          form_submitted_at: new Date().toISOString()
        }
      };

      subscribeToList(CONFIG.klaviyo.bondGuideListId, attributes)
        .then(function (response) {
          if (!(response.status === 202 || response.ok)) {
            throw new Error('Klaviyo submission failed');
          }

          // 1. PDF download
          var pdfUrl = formWrapper.getAttribute('data-pdf-url');
          if (pdfUrl) downloadPdf(pdfUrl);

          // 2. GTM conversion event
          if (window.dataLayer) {
            window.dataLayer.push({ event: 'bond_guide_download', form_name: LEAD_SOURCE });
          }

          // 3. Webflow native success state
          var successEl = formWrapper.querySelector('.w-form-done');
          var failEl    = formWrapper.querySelector('.w-form-fail');
          if (successEl) successEl.style.display = 'block';
          if (failEl) failEl.style.display = 'none';
          form.style.display = 'none';

          // 4. Reset (in case the form is reopened)
          setButtonText(submitBtn, originalText);
          if (submitBtn) submitBtn.disabled = false;
          form.reset();
        })
        .catch(function (err) {
          console.error('Klaviyo error:', err);
          var failEl = formWrapper.querySelector('.w-form-fail');
          if (failEl) failEl.style.display = 'block';
          setButtonText(submitBtn, originalText);
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
}
