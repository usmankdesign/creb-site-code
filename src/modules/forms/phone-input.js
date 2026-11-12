/* ==========================================================================
   FORMS — US phone input formatter
   Applies to every input[type="tel"]:
   - Adds a US flag + "+1" prefix
   - Masks input as (XXX) XXX-XXXX while typing
   - On submit, converts to E.164 (+1XXXXXXXXXX) for Klaviyo / Webflow / CRM
     (capture phase, so it runs before Webflow's and Klaviyo's handlers)

   CSS: styles/phone-input.css
   ========================================================================== */

var FLAG_SVG =
  '<svg viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet">' +
    '<rect width="7410" height="3900" fill="#B31942"/>' +
    '<path fill="#fff" d="M0,450H7410v300H0zM0,1050H7410v300H0zM0,1650H7410v300H0zM0,2250H7410v300H0zM0,2850H7410v300H0zM0,3450H7410v300H0z"/>' +
    '<rect width="2964" height="2100" fill="#0A3161"/>' +
  '</svg>';

function formatDisplay(digits) {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '(' + digits;
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 10);
}

export function initPhoneInputs() {
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    if (input.closest('.creb-tel-wrap')) return; // already enhanced

    // Wrap the input
    var wrap = document.createElement('span');
    wrap.className = 'creb-tel-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    // Flag + country code prefix
    var flag = document.createElement('span');
    flag.className = 'creb-tel-flag';
    flag.innerHTML = FLAG_SVG + '<span class="creb-tel-code">+1</span>';
    wrap.insertBefore(flag, input);

    // Mobile keyboard + autofill hints
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel-national');
    input.setAttribute('placeholder', '(555) 555-5555');
    input.setAttribute('maxlength', '14'); // "(XXX) XXX-XXXX"

    // Live mask
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '').slice(0, 10);
      input.value = formatDisplay(digits);
    });

    // Convert to E.164 before any other submit handler reads the value
    var form = input.closest('form');
    if (form) {
      form.addEventListener('submit', function () {
        var digits = input.value.replace(/\D/g, '');
        if (digits.length === 10) input.value = '+1' + digits;
      }, true);
    }
  });
}
