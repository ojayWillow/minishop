/* ==========================================================================
   Mini Me — landing.js
   Renders the "Populārākās cepures" featured strip on the home page from the
   shared catalogue (top items by popularity), linking through to the store.
   ========================================================================== */
(function () {
  function render() {
    var host = document.getElementById('featured');
    if (!host) return;

    var top = MiniMe.getProducts().slice().sort(function (a, b) {
      return b.pop - a.pop;
    }).slice(0, 4);

    host.innerHTML = top.map(function (p) {
      var price = p.oldPrice
        ? '<span class="price"><s>' + p.oldPrice + '&nbsp;€</s>' + p.price + '&nbsp;€</span>'
        : '<span class="price">' + p.price + '&nbsp;€</span>';
      return '<a class="fcard" href="store.html" style="--yarn: var(--yarn-' + p.color + ')">' +
        '<div class="ph">' + MiniMe.productArtHTML(p) + '</div>' +
        '<div class="fbody">' +
          '<h3>' + MiniMe.escapeAttr(p.name) + '</h3>' +
          '<span class="fmeta">' + MiniMe.CATS[p.cat] + '</span>' +
          price +
        '</div></a>';
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }
})();
