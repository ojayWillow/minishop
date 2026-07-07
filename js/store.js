/* ==========================================================================
   Mini Me — store.js
   Catalogue page: filtering, sorting, search, chips, mobile filter drawer.
   Reads the catalogue through MiniMe.getProducts() so admin edits show here.
   ========================================================================== */
(function () {
  var CATS = MiniMe.CATS, SEASONS = MiniMe.SEASONS, COLORS = MiniMe.COLORS;
  var P = MiniMe.getProducts();

  /* price ceiling adapts to the catalogue so admin-added pricier items aren't
     hidden by a hardcoded slider max. */
  var PRICE_MAX = Math.max(60, P.reduce(function (m, p) { return Math.max(m, p.price); }, 0));

  var state = { cat: [], season: [], size: [], color: [], maxPrice: PRICE_MAX, sale: false, isNew: false, q: '', sort: 'pop' };

  var grid = document.getElementById('grid');
  var chipsEl = document.getElementById('chips');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var shopEl = document.getElementById('veikals');

  /* category counts in the filter list */
  document.querySelectorAll('[data-n]').forEach(function (el) {
    var c = el.getAttribute('data-n');
    el.textContent = P.filter(function (p) { return p.cat === c; }).length;
  });

  function badgeFor(p) {
    if (p.oldPrice) return '<span class="badge sale">Akcija</span>';
    if (p.isNew) return '<span class="badge">Jaunums</span>';
    if (p.type === 'set') return '<span class="badge alt">Komplekts</span>';
    if (p.pop >= 90) return '<span class="badge">Populārs</span>';
    return '';
  }

  function matches(p) {
    if (state.cat.length && state.cat.indexOf(p.cat) < 0) return false;
    if (state.season.length && !p.season.some(function (s) { return state.season.indexOf(s) >= 0; })) return false;
    if (state.size.length && !p.sizes.some(function (s) { return state.size.indexOf(s) >= 0; })) return false;
    if (state.color.length && state.color.indexOf(p.color) < 0) return false;
    if (p.price > state.maxPrice) return false;
    if (state.sale && !p.oldPrice) return false;
    if (state.isNew && !p.isNew) return false;
    if (state.q) {
      var hay = (p.name + ' ' + CATS[p.cat] + ' ' + COLORS[p.color]).toLowerCase();
      if (hay.indexOf(state.q) < 0) return false;
    }
    return true;
  }

  function sortFn(a, b) {
    switch (state.sort) {
      case 'asc': return a.price - b.price;
      case 'desc': return b.price - a.price;
      case 'new': return (b.isNew - a.isNew) || (b.id - a.id);
      default: return b.pop - a.pop;
    }
  }

  function chips() {
    var out = [];
    state.cat.forEach(function (v) { out.push({ k: 'cat', v: v, label: CATS[v] }); });
    state.season.forEach(function (v) { out.push({ k: 'season', v: v, label: SEASONS[v] }); });
    state.size.forEach(function (v) { out.push({ k: 'size', v: v, label: 'Izmērs: ' + v }); });
    state.color.forEach(function (v) { out.push({ k: 'color', v: v, label: COLORS[v] }); });
    if (state.maxPrice < PRICE_MAX) out.push({ k: 'maxPrice', v: '', label: 'Līdz ' + state.maxPrice + ' €' });
    if (state.sale) out.push({ k: 'sale', v: '', label: 'Akcijā' });
    if (state.isNew) out.push({ k: 'new', v: '', label: 'Jaunumi' });
    if (state.q) out.push({ k: 'q', v: '', label: '“' + state.q + '”' });
    chipsEl.innerHTML = out.map(function (c, i) {
      return '<button class="chip" data-i="' + i + '">' + c.label + '</button>';
    }).join('');
    chipsEl._data = out;
    var n = out.length;
    document.getElementById('fbadge').textContent = n ? '(' + n + ')' : '';
  }

  function render() {
    var items = P.filter(matches).sort(sortFn);
    grid.innerHTML = items.map(function (p) {
      var price = p.oldPrice
        ? '<span class="price"><s>' + p.oldPrice + '&nbsp;€</s>' + p.price + '&nbsp;€</span>'
        : '<span class="price">' + p.price + '&nbsp;€</span>';
      var href = 'product.html?id=' + p.id;
      return '<article class="product" style="--yarn: var(--yarn-' + p.color + ')">' +
        '<a class="plink" href="' + href + '">' +
          '<div class="ph">' + badgeFor(p) + MiniMe.productArtHTML(p) + '</div>' +
          '<div class="pinfo"><h3>' + MiniMe.escapeAttr(p.name) + '</h3>' +
          '<p class="meta">' + CATS[p.cat] + ' · ' + p.sizes.join(', ') + '</p></div>' +
        '</a>' +
        '<div class="buy">' + price + '<a class="add" href="' + href + '">Izvēlēties →</a></div>' +
        '</article>';
    }).join('');
    var n = items.length;
    var one = n % 10 === 1 && n % 100 !== 11;
    countEl.innerHTML = (one ? 'Atrasts' : 'Atrasti') + ' <b>' + n + '</b> ' + (one ? 'produkts' : 'produkti') + ' no ' + P.length;
    emptyEl.hidden = items.length > 0;
    chips();
  }

  /* When a filter shrinks the catalogue the page gets shorter and the browser
     clamps the scroll — which can dump the user at the very bottom. If the
     results have scrolled up out of view, bring them back under the header.
     No-ops when the shop is already visible (e.g. filtering from the top). */
  function keepResultsInView() {
    var top = shopEl.getBoundingClientRect().top;
    if (top < 70) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 70), behavior: 'auto' });
    }
  }

  /* ---------- events ---------- */
  document.querySelectorAll('fieldset[data-filter="cat"] input, fieldset[data-filter="season"] input, fieldset[data-filter="size"] input').forEach(function (input) {
    input.addEventListener('change', function () {
      var key = input.closest('fieldset').getAttribute('data-filter');
      var arr = state[key];
      if (input.checked) { if (arr.indexOf(input.value) < 0) arr.push(input.value); }
      else { arr.splice(arr.indexOf(input.value), 1); }
      if (key === 'season') syncSeasonCards();
      render();
      keepResultsInView();
    });
  });

  document.querySelectorAll('.swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      var c = sw.getAttribute('data-color');
      var i = state.color.indexOf(c);
      if (i < 0) state.color.push(c); else state.color.splice(i, 1);
      sw.setAttribute('aria-pressed', i < 0 ? 'true' : 'false');
      render();
      keepResultsInView();
    });
  });

  var priceIn = document.getElementById('maxPrice');
  priceIn.max = PRICE_MAX;
  priceIn.value = PRICE_MAX;
  document.getElementById('priceOut').textContent = PRICE_MAX + ' €';
  priceIn.addEventListener('input', function () {
    state.maxPrice = +priceIn.value;
    document.getElementById('priceOut').textContent = priceIn.value + ' €';
    render();
    keepResultsInView();
  });

  document.getElementById('fSale').addEventListener('change', function (e) { state.sale = e.target.checked; render(); keepResultsInView(); });
  document.getElementById('fNew').addEventListener('change', function (e) { state.isNew = e.target.checked; render(); keepResultsInView(); });
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
  document.getElementById('q').addEventListener('input', function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });

  /* season collection cards toggle the season filter */
  function syncSeasonCards() {
    document.querySelectorAll('.season').forEach(function (b) {
      b.setAttribute('aria-pressed', state.season.indexOf(b.getAttribute('data-season')) >= 0 ? 'true' : 'false');
    });
    document.querySelectorAll('fieldset[data-filter="season"] input').forEach(function (i) {
      i.checked = state.season.indexOf(i.value) >= 0;
    });
  }
  document.querySelectorAll('.season').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = b.getAttribute('data-season');
      var i = state.season.indexOf(s);
      if (i < 0) state.season.push(s); else state.season.splice(i, 1);
      syncSeasonCards();
      render();
      shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* chips remove */
  chipsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    var c = chipsEl._data[+btn.getAttribute('data-i')];
    if (c.k === 'maxPrice') { state.maxPrice = PRICE_MAX; priceIn.value = PRICE_MAX; document.getElementById('priceOut').textContent = PRICE_MAX + ' €'; }
    else if (c.k === 'sale') { state.sale = false; document.getElementById('fSale').checked = false; }
    else if (c.k === 'new') { state.isNew = false; document.getElementById('fNew').checked = false; }
    else if (c.k === 'q') { state.q = ''; document.getElementById('q').value = ''; }
    else {
      var arr = state[c.k];
      arr.splice(arr.indexOf(c.v), 1);
      document.querySelectorAll('fieldset[data-filter="' + c.k + '"] input').forEach(function (i) {
        if (i.value === c.v) i.checked = false;
      });
      if (c.k === 'color') {
        document.querySelectorAll('.swatch[data-color="' + c.v + '"]').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      }
      if (c.k === 'season') syncSeasonCards();
    }
    render();
  });

  function clearAll() {
    state = { cat: [], season: [], size: [], color: [], maxPrice: PRICE_MAX, sale: false, isNew: false, q: '', sort: state.sort };
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(function (i) { i.checked = false; });
    document.querySelectorAll('.swatch').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
    priceIn.value = PRICE_MAX; document.getElementById('priceOut').textContent = PRICE_MAX + ' €';
    document.getElementById('q').value = '';
    syncSeasonCards();
    render();
  }
  document.getElementById('clearAll').addEventListener('click', clearAll);
  document.getElementById('emptyClear').addEventListener('click', clearAll);

  /* mobile filter drawer */
  var filters = document.getElementById('filters');
  document.getElementById('fopen').addEventListener('click', function () { filters.classList.add('open'); });
  document.getElementById('fclose').addEventListener('click', function () { filters.classList.remove('open'); });

  /* deep link: store.html#komplekti preselects the Mini Me sets category */
  if (location.hash === '#komplekti') {
    var cb = document.querySelector('fieldset[data-filter="cat"] input[value="komplekti"]');
    if (cb) { cb.checked = true; state.cat.push('komplekti'); }
  }

  render();
})();
