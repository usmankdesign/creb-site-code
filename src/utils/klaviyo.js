/* ==========================================================================
   Klaviyo client subscription request
   Shared by the generic Klaviyo form handler and the Bond Guide form.
   Returns the fetch Promise so each caller handles success/error its own way.
   ========================================================================== */

import { CONFIG } from '../config.js';

export function subscribeToList(listId, profileAttributes) {
  return fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + CONFIG.klaviyo.companyId, {
    method: 'POST',
    headers: {
      'revision': CONFIG.klaviyo.revision,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        type: 'subscription',
        attributes: { profile: { data: { type: 'profile', attributes: profileAttributes } } },
        relationships: { list: { data: { type: 'list', id: listId } } }
      }
    })
  });
}
