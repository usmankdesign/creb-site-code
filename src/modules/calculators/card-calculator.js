/* ==========================================================================
   CALCULATORS — Card calculator (single amount, 1-year simple interest)
   Supports multiple instances on a page (live + A/B test variant). Each
   instance is scoped to its own card so presets / step buttons never leak
   between variants. Results use a rolling-digit effect with measured,
   slightly tightened digit widths.

   Instances: see CALCULATORS below (add a new entry for a new variant).
   Per card:  .calc-preset[data-value], .calc-step-btn[data-action="calc-amount-plus|minus"]
   CSS:       styles/card-calculator.css
   ========================================================================== */

import { CONFIG } from '../../config.js';

var STEP          = 500;
var DEFAULT_VALUE = 10000;
var MIN           = 500;
var KERN_TIGHTEN  = 0.92; // 1.0 = exact measured width, lower = tighter digit spacing
var DURATION      = 650;  // ms

var CALCULATORS = [
  { // A — live calculator
    input:   'card-calc-investment',
    daily:   'card-daily-result',
    monthly: 'card-monthly-result',
    annual:  'card-annual-result',
    balance: 'card-balance-result'
  },
  { // B — test variant
    input:   'co-card-calc-investment',
    annual:  'co-card-annual-result',
    balance: 'co-card-balance-result'
  }
];

// ---------- Formatting + measurement ----------
function fmtCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function measureWidth(ch, fontFamily, fontSize, fontWeight) {
  var t = document.createElement('span');
  t.style.cssText = [
    'position:fixed', 'top:-9999px', 'left:-9999px', 'visibility:hidden', 'pointer-events:none',
    'font-family:' + fontFamily, 'font-size:' + fontSize, 'font-weight:' + fontWeight,
    'white-space:nowrap', 'letter-spacing:0', 'padding:0', 'margin:0'
  ].join(';');
  t.textContent = ch;
  document.body.appendChild(t);
  var w = t.getBoundingClientRect().width;
  document.body.removeChild(t);
  return w;
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

  el.innerHTML           = '';
  el.style.display       = 'inline-flex';
  el.style.alignItems    = 'flex-end';
  el.style.overflow      = 'hidden';
  el.style.height        = lineHeight + 'px';
  el.style.letterSpacing = '0';
  el.style.gap           = '0';
  el.setAttribute('data-line-height', lineHeight);

  for (var i = 0; i < formatted.length; i++) {
    var ch  = formatted[i];
    var col = document.createElement('span');
    var w   = measureWidth(ch, fontFamily, fontSize, fontWeight) * KERN_TIGHTEN;
    col.style.cssText = [
      'display:inline-block', 'overflow-y:hidden', 'height:' + lineHeight + 'px',
      'line-height:' + lineHeight + 'px', 'position:relative', 'vertical-align:top',
      'letter-spacing:0', 'padding:0', 'margin:0', 'width:' + w + 'px'
    ].join(';');

    if (ch === '$' || ch === ',' || ch === '.') {
      col.style.fontFamily = fontFamily;
      col.style.fontSize   = fontSize;
      col.style.fontWeight = fontWeight;
      col.style.color      = color;
      col.style.lineHeight = lineHeight + 'px';
      col.textContent = ch;
      col.setAttribute('data-static', ch);
    } else {
      col.setAttribute('data-digit', ch);
      var strip = document.createElement('span');
      strip.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:0;left:0';
      for (var d = 0; d <= 9; d++) {
        var digit = document.createElement('span');
        digit.style.cssText = [
          'display:block', 'height:' + lineHeight + 'px', 'line-height:' + lineHeight + 'px',
          'font-family:' + fontFamily, 'font-size:' + fontSize, 'font-weight:' + fontWeight,
          'color:' + color, 'white-space:nowrap'
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

function animateValue(el, targetValue) {
  if (!el) return;

  var newFormatted = fmtCurrency(targetValue);
  var oldFormatted = el.getAttribute('data-formatted') || '';

  if (newFormatted.length !== oldFormatted.length || !el.querySelector('[data-digit]')) {
    buildDigitSpans(el, newFormatted);
    el.setAttribute('data-formatted', newFormatted);
    return;
  }

  var lineHeight = parseFloat(el.getAttribute('data-line-height')) || 20;
  var cols       = el.querySelectorAll('[data-digit]');
  var staticCols = el.querySelectorAll('[data-static]');
  var cs         = window.getComputedStyle(el);
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
    var targetDigit = parseInt(ch, 10);
    var strip      = col.querySelector('span');
    var startY     = parseFloat((strip.style.transform || 'translateY(0px)').replace('translateY(', '').replace('px)', '')) || 0;
    var endY       = -(targetDigit * lineHeight);
    var startWidth = col.getBoundingClientRect().width;
    var endWidth   = measureWidth(String(targetDigit), cs.fontFamily, cs.fontSize, cs.fontWeight) * KERN_TIGHTEN;

    (function (strip, col, startY, endY, startWidth, endWidth) {
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var progress = Math.min((ts - t0) / DURATION, 1);
        var ease = 1 - Math.pow(1 - progress, 4);
        strip.style.transform = 'translateY(' + (startY + (endY - startY) * ease) + 'px)';
        col.style.width = (startWidth + (endWidth - startWidth) * ease) + 'px';
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    })(strip, col, startY, endY, startWidth, endWidth);
  }

  el.setAttribute('data-formatted', newFormatted);
}

// Smallest ancestor of the input that also contains the result element
// = that calculator's own card, so buttons never leak across variants.
function findScope(input, anchor) {
  if (!anchor) return input.parentElement || document.body;
  var node = input.parentElement;
  while (node && node !== document.body) {
    if (node.contains(anchor)) return node;
    node = node.parentElement;
  }
  return document.body;
}

// ---------- One calculator instance ----------
function initInstance(cfg) {
  var input = document.getElementById(cfg.input);
  if (!input || input.getAttribute('data-calc-init') === 'true') return;
  input.setAttribute('data-calc-init', 'true');

  var byId = function (id) { return id ? document.getElementById(id) : null; };
  var els = {
    daily:   byId(cfg.daily),
    monthly: byId(cfg.monthly),
    annual:  byId(cfg.annual),
    balance: byId(cfg.balance)
  };

  var scope    = findScope(input, els.annual || els.balance || els.monthly || els.daily);
  var presets  = scope.querySelectorAll('.calc-preset');
  var stepBtns = scope.querySelectorAll('.calc-step-btn');

  function resizeInputToContent() {
    var len = String(input.value).length || 1;
    input.style.width = (len + 1) + 'ch';
  }

  function addDollarPrefix() {
    var computed = window.getComputedStyle(input);
    var wrapper = document.createElement('span');
    wrapper.className = 'calc-currency-wrap';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    var dollar = document.createElement('span');
    dollar.className = 'calc-currency-prefix';
    dollar.textContent = '$';
    dollar.style.fontSize   = computed.fontSize;
    dollar.style.fontFamily = computed.fontFamily;
    dollar.style.fontWeight = computed.fontWeight;
    dollar.style.color      = computed.color;
    wrapper.insertBefore(dollar, input);

    input.style.textAlign = 'left';
    input.style.width     = 'auto';
    input.style.minWidth  = '0';
    input.style.flex      = 'none';
    input.style.padding   = '0';
    resizeInputToContent();
  }

  function calculate() {
    var principal = parseFloat(input.value) || 0;
    var annual    = principal * CONFIG.rates.creb;

    animateValue(els.daily,   annual / 365);
    animateValue(els.monthly, annual / 12);
    animateValue(els.annual,  annual);
    animateValue(els.balance, principal + annual);
    resizeInputToContent();
  }

  function setActivePreset(btn) {
    presets.forEach(function (b) { b.classList.remove('is-active'); });
    if (btn) btn.classList.add('is-active');
  }

  input.addEventListener('input', function () { setActivePreset(null); calculate(); });
  input.addEventListener('blur', function () {
    if ((parseFloat(input.value) || 0) < MIN) input.value = MIN;
    calculate();
  });

  presets.forEach(function (btn) {
    btn.addEventListener('click', function () {
      input.value = btn.getAttribute('data-value');
      setActivePreset(btn);
      calculate();
    });
  });

  stepBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = parseFloat(input.value) || 0;
      var action = btn.getAttribute('data-action');
      if (action === 'calc-amount-plus') current += STEP;
      else if (action === 'calc-amount-minus') current = Math.max(MIN, current - STEP);
      input.value = current;
      setActivePreset(null);
      calculate();
    });
  });

  // Defaults
  addDollarPrefix();
  input.value = DEFAULT_VALUE;
  presets.forEach(function (btn) {
    if (Number(btn.getAttribute('data-value')) === DEFAULT_VALUE) setActivePreset(btn);
  });
  calculate();
}

export function initCardCalculators() {
  CALCULATORS.forEach(initInstance);
}
