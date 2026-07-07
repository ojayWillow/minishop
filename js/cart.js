/* ==========================================================================
   Mini Me — cart.js
   The shopping basket: a localStorage-backed line-item cart plus a slide-in
   drawer shared by every shop page. Line items carry the chosen size and
   quantity. Includes the live free-shipping progress bar and keeps the
   announcement ribbon in sync ("add X € more for free delivery").

   Front-end only: the cart lives in the browser. Checkout collects the order
   and (for bank transfer) shows payment details; card payment needs a payment
   provider to be connected before it can actually charge.
   ========================================================================== */
window.MiniMeCart = (function () {
  var KEY = 'minime_cart_v1';
  var FREE_FROM = 40;
  var listeners = [];

  function money(n) { return (n % 1 === 0 ? String(n) : n.toFixed(2).replace('.', ',')) + ' €'; }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    emit();
  }
  function emit() {
    paintBadges();
    paintRibbon();
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  function items() { return read(); }
  function count() { return read().reduce(function (n, it) { return n + it.qty; }, 0); }

  function detailed() {
    return read().map(function (it) {
      var p = MiniMe.findById(it.id);
      return { id: it.id, size: it.size, qty: it.qty, product: p, lineTotal: p ? p.price * it.qty : 0 };
    }).filter(function (r) { return r.product; });
  }
  function subtotal() {
    return detailed().reduce(function (s, r) { return s + r.lineTotal; }, 0);
  }

  function add(id, size, qty) {
    id = parseInt(id, 10);
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var list = read();
    var found = list.find(function (it) { return it.id === id && it.size === size; });
    if (found) found.qty += qty;
    else list.push({ id: id, size: size, qty: qty });
    write(list);
  }
  function setQty(index, qty) {
    var list = read();
    if (!list[index]) return;
    qty = parseInt(qty, 10);
    if (qty <= 0) list.splice(index, 1);
    else list[index].qty = qty;
    write(list);
  }
  function removeAt(index) {
    var list = read();
    list.splice(index, 1);
    write(list);
  }
  function clear() { write([]); }
  function onChange(fn) { listeners.push(fn); }

  /* ---------- badges + live ribbon ---------- */
  function paintBadges() {
    var n = count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; });
  }
  function paintRibbon() {
    var el = document.querySelector('[data-ribbon]');
    if (!el) return;
    var s = subtotal();
    if (s <= 0) {
      el.innerHTML = T('ribbon.default', 'Bezmaksas piegāde Omniva pakomātā pasūtījumiem virs 40&nbsp;€ · Adīts ar rokām Rīgā');
    } else if (s >= FREE_FROM) {
      el.innerHTML = T('ribbon.free', 'Tavam pasūtījumam piegāde ir bez maksas ✓ · Adīts ar rokām Rīgā');
    } else {
      el.innerHTML = TF('ribbon.progress',
        'Vēl {x} līdz bezmaksas piegādei · Adīts ar rokām Rīgā', { x: money(FREE_FROM - s) });
    }
  }

  /* ---------- free-shipping progress (drawer) ---------- */
  function progressHTML() {
    var s = subtotal();
    var pct = Math.min(100, Math.round(s / FREE_FROM * 100));
    var label = s >= FREE_FROM
      ? T('cart.free', '✓ Piegāde bez maksas')
      : TF('cart.progress', 'Pievieno vēl {x}, un piegāde būs bez maksas', { x: money(FREE_FROM - s) });
    return '<div class="ship-progress' + (s >= FREE_FROM ? ' done' : '') + '">' +
      '<p>' + label + '</p>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<span style="width:' + pct + '%"></span></div></div>';
  }

  /* ---------- drawer ---------- */
  var drawer, backdrop, bodyEl, footEl;

  function buildDrawer() {
    if (drawer) return;
    backdrop = document.createElement('div');
    backdrop.className = 'cart-backdrop';
    backdrop.addEventListener('click', close);

    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', T('cart.title', 'Iepirkumu grozs'));
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.innerHTML =
      '<div class="cart-head"><h2>' + T('cart.title', 'Grozs') + '</h2><button class="cart-x" aria-label="Aizvērt">✕</button></div>' +
      '<div class="cart-body" data-cart-body></div>' +
      '<div class="cart-foot" data-cart-foot></div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    bodyEl = drawer.querySelector('[data-cart-body]');
    footEl = drawer.querySelector('[data-cart-foot]');

    drawer.querySelector('.cart-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    bodyEl.addEventListener('click', function (e) {
      var row = e.target.closest('[data-idx]');
      if (!row) return;
      var idx = +row.getAttribute('data-idx');
      if (e.target.closest('[data-inc]')) setQty(idx, (read()[idx].qty + 1));
      else if (e.target.closest('[data-dec]')) setQty(idx, (read()[idx].qty - 1));
      else if (e.target.closest('[data-remove]')) removeAt(idx);
    });
  }

  function renderDrawer() {
    if (!drawer) return;
    var rows = detailed();
    if (!rows.length) {
      bodyEl.innerHTML = '<div class="cart-empty"><p>' + T('cart.empty', 'Tavs grozs ir tukšs.') + '</p>' +
        '<a class="btn" href="store.html">' + T('cart.toShop', 'Uz veikalu') + '</a></div>';
      footEl.innerHTML = '';
      return;
    }
    bodyEl.innerHTML = progressHTML() + rows.map(function (r, i) {
      return '<div class="cart-line" data-idx="' + i + '">' +
        '<a class="cart-thumb" href="product.html?id=' + r.id + '" style="--yarn: var(--yarn-' + r.product.color + ')">' + MiniMe.productArtHTML(r.product) + '</a>' +
        '<div class="cart-info">' +
          '<h3>' + MiniMe.escapeAttr(r.product.name) + '</h3>' +
          '<p class="cart-size">' + T('cart.sizeLbl', 'Izmērs') + ': <b>' + (MiniMe.SIZES[r.size] || r.size) + '</b></p>' +
          '<div class="cart-qty">' +
            '<button data-dec aria-label="−">−</button>' +
            '<span>' + r.qty + '</span>' +
            '<button data-inc aria-label="+">+</button>' +
            '<button class="cart-remove" data-remove>' + T('cart.remove', 'Noņemt') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-price">' + money(r.lineTotal) + '</div>' +
      '</div>';
    }).join('');
    footEl.innerHTML =
      '<div class="cart-sub"><span>' + T('cart.subtotal', 'Starpsumma') + '</span><b>' + money(subtotal()) + '</b></div>' +
      '<p class="cart-note">' + T('cart.note', 'Piegāde tiek aprēķināta apmaksas solī.') + '</p>' +
      '<a class="btn cart-checkout" href="checkout.html">' + T('cart.checkout', 'Uz apmaksu →') + '</a>' +
      '<a class="cart-continue" href="store.html">' + T('cart.continue', 'Turpināt iepirkšanos') + '</a>';
  }

  function open() {
    buildDrawer();
    renderDrawer();
    document.body.classList.add('cart-open');
    backdrop.classList.add('show');
    drawer.classList.add('show');
  }
  function close() {
    if (!drawer) return;
    document.body.classList.remove('cart-open');
    backdrop.classList.remove('show');
    drawer.classList.remove('show');
  }

  onChange(renderDrawer);

  function ready() {
    paintBadges();
    paintRibbon();
    document.querySelectorAll('[data-cart-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  return {
    items: items, detailed: detailed, count: count, subtotal: subtotal,
    add: add, setQty: setQty, removeAt: removeAt, clear: clear,
    onChange: onChange, open: open, close: close, FREE_FROM: FREE_FROM
  };
})();
