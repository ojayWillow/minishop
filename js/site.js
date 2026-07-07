/* ==========================================================================
   Mini Me — site.js
   Small behaviours shared by every page: the footer year and the cart badge.
   The cart is a front-end demo (a counter kept in localStorage) — it stands
   in for a real basket until a checkout backend is added.
   ========================================================================== */
(function () {
  var CART_KEY = 'minime_cart_count';

  function readCount() {
    var n = parseInt(localStorage.getItem(CART_KEY) || '0', 10);
    return isNaN(n) ? 0 : n;
  }
  function paint() {
    var n = readCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; });
  }

  window.MiniMeCart = {
    add: function () {
      localStorage.setItem(CART_KEY, String(readCount() + 1));
      paint();
    },
    count: readCount
  };

  function ready() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
    paint();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else { ready(); }
})();
