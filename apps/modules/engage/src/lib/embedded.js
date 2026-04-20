export const EMBEDDED = (() => {
  try { return new URLSearchParams(window.location.search).get('tab') !== null; } catch { return false; }
})()
