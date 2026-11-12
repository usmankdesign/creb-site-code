/* ==========================================================================
   Safe localStorage wrappers
   localStorage throws in some privacy modes / embedded browsers — never let
   that break the page.
   ========================================================================== */

export function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

export function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

export function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
