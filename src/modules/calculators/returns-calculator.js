/* ==========================================================================
   CALCULATORS — Returns calculator (amount + years, vs HYS / national avg)
   Compounds daily at CREB's rate and compares against a high-yield savings
   account and the national average. Results animate with a rolling-digit
   effect.

   Requires (only runs if #amount and #years exist):
   - Inputs:   #amount (text, raw value in data-raw), #years
   - Buttons:  [data-action="amount-minus|amount-plus|years-minus|years-plus"]
   - Presets:  [data-preset="amount|years"][data-value]
   - Results:  #r-total, #r-chart-total, #r-daily, #r-year-profit,
               #r-year-total, #r-hys, #r-national
   - Bars:     #bar-primary, #bar-hys, #bar-national
   - Labels:   #l-daily, #l-year-profit, #l-year-total
   Duplicate IDs (desktop/mobile copies) are supported via querySelectorAll.
   ========================================================================== */

import { CONFIG } from '../../config.js';
import { onClick } from '../../utils/dom.js';

var LIMITS = {
  amount: { min: 500, max: 10000000 },
  years:  { min: 1,   max: 50 }
};
var DEFAULT_AMOUNT = 10000;
var DEFAULT_YEARS  = 1;
var DURATION = 650; // digit roll, ms

var animationTargets = {};

// ---------- Formatting ----------
function fmtCurrency(n) {
  if (n >= 0.01) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + n.toFixed(6);
}

function setLabel(id, text) {
  document.querySelectorAll('#' + id).forEach(function (el) {
    var inner = el.querySelector('span');
    if (inner) inner.textContent = text;
    else el.textContent = text;
  });
}

// ---------- Rolling digits ----------
function buildDigitSpans(el, formatted) {
  var cs         = window.getComputedStyle(el);
  var fontSize   = cs.fontSize;
  var fontWeight = cs.fontWeight;
  var color      = cs.color;
  var fontFamily = cs.fontFamily;
  var lineHeight = parseFloat(cs.lineHeight);
  if (isNaN(lineHeight)) lineHeight = parseFloat(fontSize) * 1.2;

  el.innerHTML        = '';
  el.style.display    = 'inline-flex';
  el.style.alignItems = 'flex-end';
  el.style.overflow   = 'hidden';
  el.style.height     = lineHeight + 'px';
  el.setAttribute('data-line-height', lineHeight);

  for (var i = 0; i < formatted.length; i++) {
    var ch  = formatted[i];
    var col = document.createElement('span');
    col.style.cssText = [
      'display:inline-block', 'overflow:hidden', 'height:' + lineHeight + 'px',
      'line-height:' + lineHeight + 'px', 'position:relative', 'vertical-align:top'
    ].join(';');

    if (ch === '$' || ch === ',' || ch === '.') {
      col.style.fontFamily = fontFamily;
      col.style.fontSize   = fontSize;
      col.style.fontWeight = fontWeight;
      col.style.color      = color;
      col.textContent      = ch;
      col.setAttribute('data-static', ch);
    } else {
      col.setAttribute('data-digit', ch);
      col.style.width = '0.58em';
      var strip = document.createElement('span');
      strip.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:0;left:0;width:100%';
      for (var d = 0; d <= 9; d++) {
        var digit = document.createElement('span');
        digit.style.cssText = [
          'display:block', 'height:' + lineHeight + 'px', 'line-height:' + lineHeight + 'px',
          'font-family:' + fontFamily, 'font-size:' + fontSize, 'font-weight:' + fontWeight,
          'color:' + color, 'text-align:center', 'white-space:nowrap'
        ].join(';');
        digit.textContent = d;
        strip.appendChild(digit);
      }
      col.appendChild(strip);
      strip.style.transform = 'translateY(-' + (parseInt(ch, 10) * lineHeight) + 'px)';
    }
    el.appendChild(col);
  }
}

function animateValue(id, targetValue) {
  document.querySelectorAll('#' + id).forEach(function (el) {
    var elId = el.id + '_' + Array.from(el.parentNode.children).indexOf(el);
    if (animationTargets[elId]) {
      cancelAnimationFrame(animationTargets[elId]);
      animationTargets[elId] = null;
    }

    var newFormatted = fmtCurrency(targetValue);
    var oldFormatted = el.getAttribute('data-formatted') || '';

    // Length changed (e.g. $999 → $1,000) — rebuild instead of animating
    if (newFormatted.length !== oldFormatted.length || !el.querySelector('[data-digit]')) {
      buildDigitSpans(el, newFormatted);
      el.setAttribute('data-formatted', newFormatted);
      return;
    }

    var lineHeight = parseFloat(el.getAttribute('data-line-height')) || 20;
    var cols       = el.querySelectorAll('[data-digit]');
    var staticCols = el.querySelectorAll('[data-static]');
    var digitIdx = 0, staticIdx = 0;

    for (var i = 0; i < newFormatted.length; i++) {
      var ch = newFormatted[i];
      if (ch === '$' || ch === ',' || ch === '.') {
        if (staticCols[staticIdx]) staticCols[staticIdx].textContent = ch;
        staticIdx++;
        continue;
      }

      var col = cols[digitIdx++];
      if (!col) continue;
      var strip       = col.querySelector('span');
      var startOffset = parseFloat(strip.style.transform.replace('translateY(', '').replace('px)', '')) || 0;
      var endOffset   = -(parseInt(ch, 10) * lineHeight);

      (function (strip, startOffset, endOffset) {
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var progress = Math.min((ts - t0) / DURATION, 1);
          var ease = 1 - Math.pow(1 - progress, 4);
          strip.style.transform = 'translateY(' + (startOffset + (endOffset - startOffset) * ease) + 'px)';
          if (progress < 1) animationTargets[elId] = requestAnimationFrame(step);
        }
        animationTargets[elId] = requestAnimationFrame(step);
      })(strip, startOffset, endOffset);
    }

    el.setAttribute('data-formatted', newFormatted);
  });
}

// ---------- Init ----------
export function initReturnsCalculator() {
  var amountEl = document.getElementById('amount');
  var yearsEl  = document.getElementById('years');
  if (!amountEl || !yearsEl) return; // not on this page

  function apy(nominal) { return Math.pow(1 + nominal / 365, 365) - 1; }

  function calculateReturn() {
    var principal = parseFloat(amountEl.getAttribute('data-raw')) || 0;
    var years     = parseFloat(yearsEl.value) || 0;

    var total           = principal * Math.pow(1 + apy(CONFIG.rates.creb), years);
    var earnings        = total - principal;
    var daily           = earnings / (years * 365);
    var monthly         = earnings / (years * 12);
    var monthlyHYS      = (principal * Math.pow(1 + apy(CONFIG.rates.hys), years) - principal) / (years * 12);
    var monthlyNational = (principal * Math.pow(1 + apy(CONFIG.rates.national), years) - principal) / (years * 12);

    animateValue('r-total',       monthly);
    animateValue('r-chart-total', monthly);
    animateValue('r-daily',       daily);
    animateValue('r-year-profit', earnings);
    animateValue('r-year-total',  total);
    animateValue('r-hys',         monthlyHYS);
    animateValue('r-national',    monthlyNational);

    document.querySelectorAll('#bar-primary').forEach(function (el)  { el.style.width = '100%'; });
    document.querySelectorAll('#bar-hys').forEach(function (el)      { el.style.width = ((monthlyHYS / monthly) * 100).toFixed(2) + '%'; });
    document.querySelectorAll('#bar-national').forEach(function (el) { el.style.width = ((monthlyNational / monthly) * 100).toFixed(2) + '%'; });

    var yearLabel = years + 'Y';
    setLabel('l-daily',       'Daily Income');
    setLabel('l-year-profit', yearLabel + ' Interest');
    setLabel('l-year-total',  yearLabel + ' Total');
  }

  function clearPresets(inputId, selectedBtn) {
    document.querySelectorAll('[data-preset="' + inputId + '"]').forEach(function (btn) {
      btn.classList.remove('is-active');
    });
    if (selectedBtn) selectedBtn.classList.add('is-active');
  }

  function setAmount(raw) {
    amountEl.setAttribute('data-raw', raw);
    amountEl.value = '$' + raw.toLocaleString('en-US');
  }

  function adjustValue(inputId, delta) {
    var el  = inputId === 'amount' ? amountEl : yearsEl;
    var val = inputId === 'amount'
      ? parseFloat(el.getAttribute('data-raw')) || 0
      : parseFloat(el.value) || 0;
    var newVal = Math.min(LIMITS[inputId].max, Math.max(LIMITS[inputId].min, val + delta));
    if (inputId === 'amount') setAmount(newVal);
    else el.value = newVal;
    clearPresets(inputId, null);
    calculateReturn();
  }

  // Amount input — digits only, shown with $ prefix
  amountEl.type = 'text';

  amountEl.addEventListener('keydown', function (e) {
    var allowed = [8, 9, 13, 27, 46, 37, 38, 39, 40, 35, 36]; // backspace, tab, enter, esc, delete, arrows, home, end
    if (allowed.indexOf(e.keyCode) !== -1) return;
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].indexOf(e.keyCode) !== -1) return; // Cmd/Ctrl + A C V X
    if (e.key < '0' || e.key > '9') e.preventDefault();
  });

  amountEl.addEventListener('focus', function () {
    var len = amountEl.value.length;
    setTimeout(function () { amountEl.setSelectionRange(len, len); }, 0);
  });

  amountEl.addEventListener('input', function () {
    var clean = amountEl.value.replace(/[^0-9]/g, '');
    amountEl.setAttribute('data-raw', parseFloat(clean) || 0);
    amountEl.value = '$' + clean;
    clearPresets('amount', null);
    calculateReturn();
  });

  amountEl.addEventListener('blur', function () {
    setAmount(parseFloat(amountEl.getAttribute('data-raw')) || 0);
    calculateReturn();
  });

  yearsEl.addEventListener('input', function () {
    clearPresets('years', null);
    calculateReturn();
  });

  // Plus / minus
  onClick('[data-action="amount-minus"]', function () { adjustValue('amount', -500); });
  onClick('[data-action="amount-plus"]',  function () { adjustValue('amount',  500); });
  onClick('[data-action="years-minus"]',  function () { adjustValue('years',  -1); });
  onClick('[data-action="years-plus"]',   function () { adjustValue('years',   1); });

  // Presets
  document.querySelectorAll('[data-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inputId = btn.getAttribute('data-preset');
      var val     = btn.getAttribute('data-value');
      if (inputId === 'amount') setAmount(parseFloat(val) || 0);
      else {
        var target = document.getElementById(inputId);
        if (target) target.value = val;
      }
      clearPresets(inputId, btn);
      calculateReturn();
    });
  });

  // Defaults
  setAmount(DEFAULT_AMOUNT);
  yearsEl.value = DEFAULT_YEARS;
  calculateReturn();
}
