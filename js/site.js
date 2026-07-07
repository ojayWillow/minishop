/* ==========================================================================
   Mini Me — site.js
   Tiny site-wide bits. The cart lives in cart.js; here we just stamp the year.
   ========================================================================== */
(function () {
  function ready() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else { ready(); }
})();
