/* ==========================================================================
   Mini Me — store.js
   Catalogue page: filtering, sorting, search, chips, mobile filter drawer,
   quick-add (size picker) and wishlist hearts. Localised via I18N/T().
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

  /* sync filter option labels with the (possibly localised) taxonomy */
  document.querySelectorAll('[data-cat-label]').forEach(function (el) { el.textContent = CATS[el.getAttribute('data-cat-label')]; });
  document.querySelectorAll('[data-season-label]').forEach(function (el) { el.textContent = SEASONS[el.getAttribute('data-season-label')]; });
  document.querySelectorAll('[data-size-label]').forEach(function (el) { el.textContent = MiniMe.SIZES[el.getAttribute('data-size-label')]; });
  document.querySelectorAll('.swatch').forEach(function (sw) {
    var c = COLORS[sw.getAttribute('data-color')];
    sw.title = c; sw.setAttribute('aria-label', c);
  });

  /* category counts in the filter list */
  document.querySelectorAll('[data-n]').forEach(function (el) {
    var c = el.getAttribute('data-n');
    el.textContent = P.filter(function (p) { return p.cat === c; }).length;
  });

  function badgeFor(p) {
    if (p.oldPrice) return '<span class="badge sale">' + T('badge.sale', 'Akcija') + '</span>';
    if (p.isNew) return '<span class="badge">' + T('badge.new', 'Jaunums') + '</span>';
    if (p.type === 'set') return '<span class="badge alt">' + T('badge.set', 'Komplekts') + '</span>';
    if (p.pop >= 90) return '<span class="badge">' + T('badge.pop', 'Populārs') + '</span>';
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
    state.size.forEach(function (v) { out.push({ k: 'size', v: v, label: T('chip.size', 'Izmērs: ') + (MiniMe.SIZES[v] || v) }); });
    state.color.forEach(function (v) { out.push({ k: 'color', v: v, label: COLORS[v] }); });
    if (state.maxPrice < PRICE_MAX) out.push({ k: 'maxPrice', v: '', label: T('f.upto', 'Līdz') + ' ' + state.maxPrice + ' €' });
    if (state.sale) out.push({ k: 'sale', v: '', label: T('f.sale', 'Akcijā') });
    if (state.isNew) out.push({ k: 'new', v: '', label: T('f.new', 'Jaunumi') });
    if (state.q) out.push({ k: 'q', v: '', label: '“' + state.q + '”' });
    chipsEl.innerHTML = out.map(function (c, i) {
      return '<button class="chip" data-i="' + i + '">' + c.label + '</button>';
    }).join('');
    chipsEl._data = out;
    var n = out.length;
    document.getElementById('fbadge').textContent = n ? '(' + n + ')' : '';
  }

  function countLine(n) {
    if (I18N.lang === 'en') {
      return 'Found <b>' + n + '</b> ' + (n === 1 ? 'product' : 'products') + ' of ' + P.length;
    }
    var one = n % 10 === 1 && n % 100 !== 11;
    return (one ? 'Atrasts' : 'Atrasti') + ' <b>' + n + '</b> ' + (one ? 'produkts' : 'produkti') + ' no ' + P.length;
  }

  function render() {
    var items = P.filter(matches).sort(sortFn);
    grid.innerHTML = items.map(function (p) {
      var price = p.oldPrice
        ? '<span class="price"><s>' + p.oldPrice + '&nbsp;€</s>' + p.price + '&nbsp;€</span>'
        : '<span class="price">' + p.price + '&nbsp;€</span>';
      var href = 'product.html?id=' + p.id;
      return '<article class="product" style="--yarn: var(--yarn-' + p.color + ')">' +
        '<button class="wish-heart" data-wish="' + p.id + '" aria-label="♡">♡</button>' +
        '<a class="plink" href="' + href + '">' +
          '<div class="ph">' + badgeFor(p) + MiniMe.productArtHTML(p) + '</div>' +
          '<div class="pinfo"><h3>' + MiniMe.escapeAttr(p.name) + '</h3>' +
          '<p class="meta">' + CATS[p.cat] + ' · ' + p.sizes.map(function (s) { return MiniMe.SIZES[s] || s; }).join(', ') + '</p></div>' +
        '</a>' +
        '<div class="buy">' + price +
          '<button class="qa-btn" data-qa="' + p.id + '">' + T('quick.add', 'Ātri grozā') + '</button>' +
        '</div>' +
        '</article>';
    }).join('');
    countEl.innerHTML = countLine(items.length);
    emptyEl.hidden = items.length > 0;
    chips();
    MiniMeWish.bind(grid);
  }

  /* When a filter shrinks the catalogue the page gets shorter and the browser
     clamps the scroll — which can dump the user at the very bottom. If the
     results have scrolled up out of view, bring them back under the header. */
  function keepResultsInView() {
    var top = shopEl.getBoundingClientRect().top;
    if (top < 70) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 70), behavior: 'auto' });
    }
  }

  /* ---------- quick add (size picker) ---------- */
  var qaModal = document.getElementById('qaModal');
  var qaSizes = document.getElementById('qaSizes');
  var qaName = document.getElementById('qaName');

  function openQuickAdd(id) {
    var p = MiniMe.findById(id);
    if (!p) return;
    qaName.textContent = p.name + ' · ' + p.price + ' €';
    qaSizes.innerHTML = p.sizes.map(function (s) {
      return '<button class="size-btn" data-add-size="' + s + '" data-add-id="' + p.id + '">' + (MiniMe.SIZES[s] || s) + '</button>';
    }).join('');
    qaModal.hidden = false;
  }
  function closeQuickAdd() { qaModal.hidden = true; }

  grid.addEventListener('click', function (e) {
    var qa = e.target.closest('[data-qa]');
    if (qa) { e.preventDefault(); openQuickAdd(qa.getAttribute('data-qa')); }
  });
  qaSizes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-size]');
    if (!b) return;
    MiniMeCart.add(b.getAttribute('data-add-id'), b.getAttribute('data-add-size'), 1);
    closeQuickAdd();
    MiniMeCart.open();
  });
  document.getElementById('qaClose').addEventListener('click', closeQuickAdd);
  qaModal.addEventListener('mousedown', function (e) { if (e.target === qaModal) closeQuickAdd(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !qaModal.hidden) closeQuickAdd(); });

  /* ---------- filter events ---------- */
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
