/* ==========================================================================
   Mini Me — product.js
   Product detail page: reads ?id, renders the buy box (size + quantity),
   adds the line to the cart, wishlist heart, related items, and JSON-LD
   structured data for SEO. Localised via I18N/T().
   ========================================================================== */
(function () {
  var host = document.getElementById('pdp');

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  var p = MiniMe.findById(param('id'));

  if (!p) {
    host.innerHTML = '<div class="notfound"><h1>' + T('pdp.nf.h', 'Produkts nav atrasts') + '</h1>' +
      '<p>' + T('pdp.nf.p', 'Iespējams, tas ir noņemts vai saite ir novecojusi.') + '</p>' +
      '<a class="btn" href="store.html">' + T('pdp.nf.btn', 'Atpakaļ uz veikalu') + '</a></div>';
    document.title = T('pdp.nf.h', 'Produkts nav atrasts') + ' — Mini Me';
    return;
  }

  document.title = p.name + ' — Mini Me';

  var state = { size: null, qty: 1 };

  function media() {
    var badge = p.oldPrice ? '<span class="badge sale">' + T('badge.sale', 'Akcija') + '</span>'
      : (p.isNew ? '<span class="badge">' + T('badge.new', 'Jaunums') + '</span>' : '');
    return '<div class="pdp-media" style="--yarn: var(--yarn-' + p.color + ')">' + badge +
      '<button class="wish-heart" data-wish="' + p.id + '" aria-label="♡" style="top:14px;right:14px">♡</button>' +
      bigArt() + '</div>';
  }
  function bigArt() {
    if (p.image) return '<img class="pimg" src="' + p.image + '" alt="' + MiniMe.escapeAttr(p.name) + '">';
    if (p.type === 'set') {
      return '<div class="setwrap">' +
        '<svg width="180" height="177" role="img" aria-label="' + MiniMe.escapeAttr(p.name) + '"><use href="#beanie"/></svg>' +
        '<svg width="115" height="113" aria-hidden="true"><use href="#beanie"/></svg></div>';
    }
    var sym = { beanie: 'beanie', scarf: 'scarf', mittens: 'mittens', headband: 'headband' }[p.type] || 'beanie';
    return '<svg width="230" height="226" role="img" aria-label="' + MiniMe.escapeAttr(p.name) + '"><use href="#' + sym + '"/></svg>';
  }

  function priceBlock() {
    if (p.oldPrice) {
      return '<div class="pdp-price"><s>' + p.oldPrice + '&nbsp;€</s>' + p.price + '&nbsp;€' +
        '<span class="save">−' + (p.oldPrice - p.price) + '&nbsp;€</span></div>';
    }
    return '<div class="pdp-price">' + p.price + '&nbsp;€</div>';
  }

  function sizeButtons() {
    return p.sizes.map(function (s) {
      return '<button class="size-btn" data-size="' + s + '" aria-pressed="false">' + (MiniMe.SIZES[s] || s) + '</button>';
    }).join('');
  }

  function specs() {
    var seasonTxt = (p.season || []).map(function (x) { return MiniMe.SEASONS[x]; }).join(', ');
    return '<dl class="specs">' +
      row(T('spec.cat', 'Kategorija'), MiniMe.CATS[p.cat]) +
      row(T('spec.material', 'Materiāls'), MiniMe.material(p) === 'kokvilna' ? T('mat.cotton', 'Kokvilna') : T('mat.wool', 'Merīnvilna')) +
      row(T('spec.season', 'Sezona'), seasonTxt) +
      row(T('spec.color', 'Krāsa'), MiniMe.COLORS[p.color]) +
      row(T('spec.sizes', 'Pieejamie izmēri'), p.sizes.map(function (s) { return MiniMe.SIZES[s] || s; }).join(', ')) +
    '</dl>';
  }
  function row(k, v) { return '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }

  host.innerHTML =
    '<p class="crumbs"><a href="index.html">' + T('store.crumb', 'Sākums') + '</a> / <a href="store.html">' + T('store.h1', 'Veikals') + '</a> / ' +
      '<a href="store.html">' + MiniMe.CATS[p.cat] + '</a> / <b>' + MiniMe.escapeAttr(p.name) + '</b></p>' +
    '<div class="pdp">' +
      media() +
      '<div class="pdp-info">' +
        '<p class="pdp-cat">' + MiniMe.CATS[p.cat] + '</p>' +
        '<h1>' + MiniMe.escapeAttr(p.name) + '</h1>' +
        priceBlock() +
        '<p class="pdp-desc">' + MiniMe.description(p) + '</p>' +
        '<p class="buy-label">' + T('pdp.size', 'Izvēlies izmēru') + ' <span class="req" id="reqNote"></span></p>' +
        '<div class="sizes" id="sizes">' + sizeButtons() + '</div>' +
        '<div class="buy-row">' +
          '<div class="stepper"><button id="qminus" aria-label="−">−</button>' +
            '<span id="qval">1</span>' +
            '<button id="qplus" aria-label="+">+</button></div>' +
          '<button class="btn add-cart" id="addCart">' + T('pdp.add', 'Pievienot grozam') + '</button>' +
        '</div>' +
        '<p class="buy-error" id="buyError" role="alert"></p>' +
        specs() +
        '<div class="ship-note"><span>📦</span><span>' +
          T('pdp.ship', '<b>Piegāde 2–4 darba dienās</b> ar Omniva, DPD vai Latvijas Pastu. Bezmaksas piegāde pasūtījumiem virs 40&nbsp;€. Katra cepure tiek adīta pēc pasūtījuma.') +
        '</span></div>' +
      '</div>' +
    '</div>';

  MiniMeWish.bind(host);

  /* size selection */
  document.getElementById('sizes').addEventListener('click', function (e) {
    var b = e.target.closest('.size-btn');
    if (!b) return;
    state.size = b.getAttribute('data-size');
    document.querySelectorAll('.size-btn').forEach(function (x) {
      x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
    });
    document.getElementById('buyError').textContent = '';
  });

  /* quantity */
  var qval = document.getElementById('qval');
  document.getElementById('qminus').addEventListener('click', function () {
    state.qty = Math.max(1, state.qty - 1); qval.textContent = state.qty;
  });
  document.getElementById('qplus').addEventListener('click', function () {
    state.qty = Math.min(20, state.qty + 1); qval.textContent = state.qty;
  });

  /* add to cart */
  document.getElementById('addCart').addEventListener('click', function () {
    if (!state.size) {
      document.getElementById('buyError').textContent = T('pdp.err', 'Lūdzu izvēlies izmēru.');
      document.getElementById('reqNote').textContent = T('pdp.req', '· obligāti');
      return;
    }
    MiniMeCart.add(p.id, state.size, state.qty);
    MiniMeCart.open();
  });

  /* related — same category, else same season */
  var related = MiniMe.getProducts().filter(function (x) {
    return x.id !== p.id && (x.cat === p.cat || x.season.some(function (s) { return p.season.indexOf(s) >= 0; }));
  }).slice(0, 4);

  if (related.length) {
    document.getElementById('related').hidden = false;
    document.getElementById('relGrid').innerHTML = related.map(function (r) {
      var price = r.oldPrice
        ? '<span class="price"><s>' + r.oldPrice + '&nbsp;€</s>' + r.price + '&nbsp;€</span>'
        : '<span class="price">' + r.price + '&nbsp;€</span>';
      return '<a class="rel-card" href="product.html?id=' + r.id + '" style="--yarn: var(--yarn-' + r.color + ')">' +
        '<div class="ph">' + MiniMe.productArtHTML(r) + '</div>' +
        '<div class="rbody"><h3>' + MiniMe.escapeAttr(r.name) + '</h3>' + price + '</div></a>';
    }).join('');
  }

  /* JSON-LD structured data (SEO) */
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: MiniMe.description(p),
    category: MiniMe.CATS[p.cat],
    material: MiniMe.material(p) === 'kokvilna' ? 'Cotton' : 'Merino wool',
    brand: { '@type': 'Brand', name: 'Mini Me' },
    offers: {
      '@type': 'Offer',
      price: String(p.price),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: location.href
    }
  };
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
})();
