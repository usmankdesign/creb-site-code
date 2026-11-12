/* ==========================================================================
   FORMS — Generic Klaviyo form handler
   Any form with class "klaviyo-form" and a data-klaviyo-list-id attribute
   subscribes to that Klaviyo list instead of submitting to Webflow.

   Field mapping:
   - Standard Klaviyo profile fields (email, phone_number, first_name…) → profile
   - Location fields (city, zip…) → profile.location
   - Checkboxes → true/false
   - Anything else → profile.properties

   Optional children: .custom-success / .custom-error (shown on result)
   ========================================================================== */

import { subscribeToList } from '../../utils/klaviyo.js';

var STANDARD_ATTRIBUTES = [
  'email', 'phone_number', 'external_id', 'anonymous_id', '_kx',
  'first_name', 'last_name', 'organization', 'title', 'image'
];
var NESTED_OBJECTS = {
  location: ['address1', 'address2', 'city', 'country', 'region', 'zip', 'timezone', 'ip']
};

function buildAttributes(form) {
  var formData = new FormData(form);
  var attributes = {};

  for (var [key, value] of formData.entries()) {
    var field = form.querySelector('[name="' + key + '"]');

    if (field && field.type === 'checkbox') {
      attributes[key] = field.checked;
      continue;
    }
    if (STANDARD_ATTRIBUTES.indexOf(key) !== -1) {
      attributes[key] = value;
      continue;
    }

    var addedToNested = false;
    for (var objectName in NESTED_OBJECTS) {
      if (NESTED_OBJECTS[objectName].indexOf(key) !== -1) {
        attributes[objectName] = attributes[objectName] || {};
        attributes[objectName][key] = value;
        addedToNested = true;
        break;
      }
    }
    if (!addedToNested) {
      attributes.properties = attributes.properties || {};
      attributes.properties[key] = value;
    }
  }
  return attributes;
}

export function initKlaviyoForms() {
  document.querySelectorAll('.klaviyo-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var listId = form.getAttribute('data-klaviyo-list-id');

      subscribeToList(listId, buildAttributes(form))
        .then(function (response) {
          if (response.status === 202) {
            var successEl = form.querySelector('.custom-success');
            if (successEl) successEl.style.display = 'block';
          } else if (!response.ok) {
            return response.json().then(function (err) { return Promise.reject(err); });
          }
        })
        .catch(function (err) {
          console.error('Klaviyo error:', err);
          var errorEl = form.querySelector('.custom-error');
          if (errorEl) errorEl.style.display = 'block';
        });
    });
  });
}
