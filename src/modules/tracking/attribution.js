/* ==========================================================================
   TRACKING — Attribution capture + propagation to app.compoundbanc.com
   1. Captures click IDs + UTMs from the landing URL into localStorage
      - gclid / fbclid: always overwrite (last paid click wins)
      - UTMs / ref: first-touch (never overwritten)
   2. Expires everything after TTL_DAYS
   3. At click time, appends stored values to any link pointing at the app
      (works for static, CMS, dynamic and lazy-loaded links)

   Storage keys are unchanged from the old inline version, so existing
   visitors keep their attribution.
   ========================================================================== */

import { CONFIG } from '../../config.js';
import { safeGet, safeSet, safeRemove } from '../../utils/storage.js';

var KEYS     = CONFIG.attribution.trackedKeys;
var APP_HOST = CONFIG.attribution.appHost;
var TTL_DAYS = CONFIG.attribution.ttlDays;
var TS_KEY   = CONFIG.attribution.timestampKey;

function isValidValue(val) {
  if (typeof val !== 'string') return false;
  var trimmed = val.trim();
  if (trimmed.length === 0 || trimmed.length > 255) return false;
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false;
  if (/^(test|undefined|null|none|n\/a|placeholder|example|demo|sample)/i.test(trimmed)) return false;
  return true;
}

function checkExpiry() {
  var ts = parseInt(safeGet(TS_KEY) || '0', 10);
  if (!ts) return;
  var ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  if (ageDays > TTL_DAYS) {
    KEYS.forEach(safeRemove);
    safeRemove(TS_KEY);
  }
}

function capture() {
  var params = new URLSearchParams(window.location.search);
  var didWrite = false;
  KEYS.forEach(function (key) {
    var val = params.get(key);
    if (!isValidValue(val)) return;

    var isClickId = (key === 'gclid' || key === 'fbclid');
    if (isClickId || !safeGet(key)) {
      safeSet(key, val.trim());
      didWrite = true;
    }
  });
  if (didWrite) safeSet(TS_KEY, String(Date.now()));
}

function decorateUrl(href) {
  try {
    var url = new URL(href, window.location.origin);
    if (url.hostname !== APP_HOST) return href;

    KEYS.forEach(function (key) {
      var stored = safeGet(key);
      if (isValidValue(stored)) url.searchParams.set(key, stored);
      else url.searchParams.delete(key);
    });
    return url.toString();
  } catch (e) {
    return href;
  }
}

function handleClick(e) {
  var link = e.target.closest && e.target.closest('a[href]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (!href || href.indexOf(APP_HOST) === -1) return;
  var decorated = decorateUrl(href);
  if (decorated !== href) link.setAttribute('href', decorated);
}

export function initAttribution() {
  checkExpiry();
  capture();
  document.addEventListener('click', handleClick, true);
  document.addEventListener('auxclick', handleClick, true); // middle-click, cmd-click
}
