/* ==========================================================================
   Mini Me — checkout.js
   One-page checkout: order summary, contact + delivery + payment, discount
   codes, then an order-confirmation screen. Localised via I18N/T().

   Front-end prototype: the order is assembled and confirmed in the browser and
   the cart is cleared, but nothing is charged or sent to a server. Bank
   transfer shows real payment instructions; card checkout would need a payment
   provider (e.g. Stripe) connected to actually take money.
   ========================================================================== */
(function () {
  var host = document.getElementById('checkout');
  var FREE_FROM = MiniMeCart.FREE_FROM;

  /* Discount codes: percent (0–1) or fixed € amount. */
  var CODES = {
    'WELCOME10': { type: 'pct', value: 0.10, label: 'WELCOME10 (−10%)' },
    'MINIME5': { type: 'fix', value: 5, label: 'MINIME5 (−5 €)' }
  };

  var DELIVERY = [
    { id: 'omniva', name: 'Omniva pakomāts', descKey: 'd.omniva.d', desc: 'Piegāde 2–3 darba dienās', price: 2.99, field: 'locker', fieldKey: 'd.omniva.f', fieldLabel: 'Omniva pakomāta adrese' },
    { id: 'dpd', name: 'DPD Pickup pakomāts', descKey: 'd.dpd.d', desc: 'Piegāde 2–3 darba dienās', price: 2.99, field: 'locker', fieldKey: 'd.dpd.f', fieldLabel: 'DPD pakomāta adrese' },
    { id: 'pasts', name: 'Latvijas Pasts', descKey: 'd.pasts.d', desc: 'Piegāde 3–5 darba dienās', price: 3.49, field: 'address', fieldKey: 'd.pasts.f', fieldLabel: 'Piegādes adrese' },
    { id: 'pickup', nameKey: 'd.pickup.n', name: 'Saņemšana Rīgā', descKey: 'd.pickup.d', desc: 'Bez maksas · Rīgas centrs', price: 0, field: null }
  ];
  var PAYMENT = [
    { id: 'bank', nameKey: 'p.bank.n', name: 'Bankas pārskaitījums', descKey: 'p.bank.d', desc: 'Rēķinu ar rekvizītiem saņemsi e-pastā' },
    { id: 'card', nameKey: 'p.card.n', name: 'Maksājumu karte', descKey: 'p.card.d', desc: 'Visa / Mastercard — drošu apmaksas saiti nosūtām e-pastā' }
  ];

  function dName(d) { return d.nameKey ? T(d.nameKey, d.name) : d.name; }
  function money(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

  var discount = null; // { code, type, value, label }

  function discountAmount(subtotal) {
    if (!discount) return 0;
    var a = discount.type === 'pct' ? subtotal * discount.value : discount.value;
    return Math.min(a, subtotal);
  }
  function shippingFor(deliveryId, subtotal) {
    var d = DELIVERY.find(function (x) { return x.id === deliveryId; });
    if (!d || d.price === 0) return 0;
    return subtotal >= FREE_FROM ? 0 : d.price;
  }
  function grandTotal(subtotal, deliveryId) {
    return Math.max(0, subtotal - discountAmount(subtotal)) + shippingFor(deliveryId, subtotal);
  }

  function renderEmpty() {
    host.innerHTML = '<div class="co-empty"><h1>' + T('co.empty.h', 'Grozs ir tukšs') + '</h1>' +
      '<p>' + T('co.empty.p', 'Pievieno kādu cepuri, un tā parādīsies šeit.') + '</p>' +
      '<a class="btn" href="store.html">' + T('co.empty.btn', 'Uz veikalu') + '</a></div>';
  }

  function summaryHTML(rows, subtotal, deliveryId) {
    var ship = shippingFor(deliveryId, subtotal);
    var disc = discountAmount(subtotal);
    var lines = rows.map(function (r) {
      return '<div class="sum-line">' +
        '<div class="st" style="--yarn: var(--yarn-' + r.product.color + ')">' + MiniMe.productArtHTML(r.product) + '</div>' +
        '<div class="sm"><h3>' + MiniMe.escapeAttr(r.product.name) + '</h3>' +
          '<p>' + T('cart.sizeLbl', 'Izmērs') + ': ' + (MiniMe.SIZES[r.size] || r.size) + ' · ×' + r.qty + '</p></div>' +
        '<div class="sp">' + money(r.lineTotal) + '</div>' +
      '</div>';
    }).join('');

    var toFree = FREE_FROM - subtotal;
    var freeHint = ship === 0
      ? '<p class="free-hint ok">' + T('co.freeOk', '✓ Piegāde bez maksas') + '</p>'
      : (toFree > 0 ? '<p class="free-hint">' + TF('co.freeHint', 'Pievieno vēl {x}, lai piegāde būtu bez maksas.', { x: money(toFree) }) + '</p>' : '');

    var discRow = disc > 0
      ? '<div class="r"><span>' + T('co.sum.discount', 'Atlaide') + ' (' + discount.code + ')</span><b>−' + money(disc) + '</b></div>'
      : '';

    return '<h2>' + T('co.sum.h', 'Tavs pasūtījums') + '</h2>' + lines +
      '<div class="sum-totals">' +
        '<div class="r"><span>' + T('co.sum.subtotal', 'Starpsumma') + '</span><b>' + money(subtotal) + '</b></div>' +
        discRow +
        '<div class="r"><span>' + T('co.sum.delivery', 'Piegāde') + '</span><b id="sumShip">' + (ship === 0 ? T('co.free', 'Bezmaksas') : money(ship)) + '</b></div>' +
        '<div class="r grand"><span>' + T('co.sum.total', 'Kopā') + '</span><b id="sumGrand">' + money(grandTotal(subtotal, deliveryId)) + '</b></div>' +
      '</div>' + freeHint;
  }

  function deliveryOptsHTML() {
    return DELIVERY.map(function (d, i) {
      return '<label class="opt-card' + (i === 0 ? ' sel' : '') + '" data-delivery="' + d.id + '">' +
        '<input type="radio" name="delivery" value="' + d.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="oc-main"><b>' + dName(d) + '</b><p>' + T(d.descKey, d.desc) + '</p></span>' +
        '<span class="oc-price">' + (d.price === 0 ? T('co.free', 'Bezmaksas') : money(d.price)) + '</span>' +
      '</label>';
    }).join('');
  }
  function paymentOptsHTML() {
    return PAYMENT.map(function (pm, i) {
      return '<label class="opt-card' + (i === 0 ? ' sel' : '') + '" data-payment="' + pm.id + '">' +
        '<input type="radio" name="payment" value="' + pm.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="oc-main"><b>' + T(pm.nameKey, pm.name) + '</b><p>' + T(pm.descKey, pm.desc) + '</p></span>' +
      '</label>';
    }).join('');
  }

  function renderCheckout() {
    var rows = MiniMeCart.detailed();
    var subtotal = MiniMeCart.subtotal();

    host.innerHTML =
      '<h1 class="co-title">' + T('co.title', 'Apmaksa') + '</h1>' +
      '<ol class="steps">' +
        '<li><span class="num">1</span> ' + T('co.step1', 'Grozs') + '</li>' +
        '<li aria-current="step"><span class="num">2</span> ' + T('co.step2', 'Dati un piegāde') + '</li>' +
        '<li><span class="num">3</span> ' + T('co.step3', 'Apmaksa') + '</li>' +
        '<li><span class="num">4</span> ' + T('co.step4', 'Apstiprinājums') + '</li>' +
      '</ol>' +
      '<form class="checkout" id="coForm" novalidate>' +
        '<div>' +
          '<section class="co-section">' +
            '<h2>' + T('co.contact.h', 'Kontaktinformācija') + '</h2>' +
            '<p class="sub">' + T('co.contact.sub', 'Uz e-pastu nosūtīsim pasūtījuma apstiprinājumu.') + '</p>' +
            '<div class="field"><label for="c-name">' + T('co.name', 'Vārds, uzvārds') + '</label><input id="c-name" name="name" autocomplete="name"><div class="err" data-err="name"></div></div>' +
            '<div class="grid2">' +
              '<div class="field"><label for="c-email">' + T('co.email', 'E-pasts') + '</label><input id="c-email" name="email" type="email" autocomplete="email"><div class="err" data-err="email"></div></div>' +
              '<div class="field"><label for="c-phone">' + T('co.phone', 'Telefons') + '</label><input id="c-phone" name="phone" type="tel" autocomplete="tel"><div class="err" data-err="phone"></div></div>' +
            '</div>' +
          '</section>' +

          '<section class="co-section">' +
            '<h2>' + T('co.delivery.h', 'Piegāde') + '</h2>' +
            '<p class="sub">' + T('co.delivery.sub', 'Izvēlies piegādes veidu.') + '</p>' +
            '<div class="opts" id="deliveryOpts">' + deliveryOptsHTML() + '</div>' +
            '<div class="field" id="deliveryField" style="margin-top:14px">' +
              '<label for="c-loc" id="deliveryFieldLabel">' + T('d.omniva.f', 'Omniva pakomāta adrese') + '</label>' +
              '<input id="c-loc" name="locator"><div class="err" data-err="locator"></div>' +
            '</div>' +
          '</section>' +

          '<section class="co-section">' +
            '<h2>' + T('co.discount.h', 'Atlaides kods') + '</h2>' +
            '<div class="grid2" style="align-items:end">' +
              '<div class="field" style="margin-bottom:0"><input id="c-code" placeholder="' + T('co.discount.ph', 'piem. WELCOME10') + '" aria-label="' + T('co.discount.h', 'Atlaides kods') + '"></div>' +
              '<button type="button" class="btn mut" id="applyCode" style="border:1px solid var(--line);background:var(--ground);color:var(--ink)">' + T('co.discount.apply', 'Pielietot') + '</button>' +
            '</div>' +
            '<div class="err" id="codeMsg" style="margin-top:8px"></div>' +
          '</section>' +

          '<section class="co-section">' +
            '<h2>' + T('co.pay.h', 'Apmaksas veids') + '</h2>' +
            '<div class="opts">' + paymentOptsHTML() + '</div>' +
            '<label class="terms"><input type="checkbox" id="c-terms" name="terms">' +
              '<span>' + T('co.terms', 'Piekrītu <a href="#" onclick="return false">pirkuma noteikumiem</a> un privātuma politikai.') + '</span></label>' +
            '<div class="err" data-err="terms"></div>' +
            '<button type="submit" class="btn place">' + T('co.place', 'Apstiprināt pasūtījumu') + ' · <span id="placeTotal"></span></button>' +
          '</section>' +
        '</div>' +

        '<aside class="summary" id="summary">' + summaryHTML(rows, subtotal, DELIVERY[0].id) + '</aside>' +
      '</form>';

    bind(rows, subtotal);
  }

  function bind(rows, subtotal) {
    var form = document.getElementById('coForm');

    function currentDelivery() {
      var el = form.querySelector('input[name="delivery"]:checked');
      return el ? el.value : DELIVERY[0].id;
    }
    function refreshTotals() {
      var d = DELIVERY.find(function (x) { return x.id === currentDelivery(); });
      document.getElementById('summary').innerHTML = summaryHTML(rows, subtotal, d.id);
      document.getElementById('placeTotal').textContent = money(grandTotal(subtotal, d.id));
      var field = document.getElementById('deliveryField');
      if (!d.field) { field.style.display = 'none'; }
      else {
        field.style.display = '';
        document.getElementById('deliveryFieldLabel').textContent = T(d.fieldKey, d.fieldLabel);
      }
    }

    form.querySelectorAll('input[name="delivery"]').forEach(function (r) {
      r.addEventListener('change', function () {
        form.querySelectorAll('[data-delivery]').forEach(function (c) {
          c.classList.toggle('sel', c.getAttribute('data-delivery') === r.value);
        });
        refreshTotals();
      });
    });
    form.querySelectorAll('input[name="payment"]').forEach(function (r) {
      r.addEventListener('change', function () {
        form.querySelectorAll('[data-payment]').forEach(function (c) {
          c.classList.toggle('sel', c.getAttribute('data-payment') === r.value);
        });
      });
    });

    /* discount code */
    document.getElementById('applyCode').addEventListener('click', function () {
      var input = document.getElementById('c-code');
      var msg = document.getElementById('codeMsg');
      var code = input.value.trim().toUpperCase();
      var def = CODES[code];
      if (def) {
        discount = { code: code, type: def.type, value: def.value, label: def.label };
        msg.style.color = '';
        msg.textContent = TF('co.discount.ok', 'Kods pielietots: {x}', { x: def.label });
        refreshTotals();
      } else {
        discount = null;
        msg.textContent = T('co.discount.bad', 'Šāds kods nav derīgs.');
        refreshTotals();
      }
    });

    refreshTotals();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var d = DELIVERY.find(function (x) { return x.id === currentDelivery(); });
      var pm = form.querySelector('input[name="payment"]:checked').value;
      var ship = shippingFor(d.id, subtotal);
      var order = {
        no: orderNumber(),
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        delivery: d,
        locator: d.field ? form.locator.value.trim() : dName(d),
        payment: PAYMENT.find(function (x) { return x.id === pm; }),
        rows: rows, subtotal: subtotal, ship: ship,
        discount: discount, discountAmt: discountAmount(subtotal),
        total: grandTotal(subtotal, d.id)
      };
      MiniMeCart.clear();
      renderConfirmation(order);
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  function setErr(form, key, msg) {
    var box = form.querySelector('[data-err="' + key + '"]');
    if (box) box.textContent = msg || '';
    var field = box ? box.closest('.field') : null;
    if (field) field.classList.toggle('invalid', !!msg);
  }

  function validate(form) {
    var ok = true;
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    setErr(form, 'name', ''); setErr(form, 'email', ''); setErr(form, 'phone', '');
    setErr(form, 'locator', ''); setErr(form, 'terms', '');

    if (name.length < 2) { setErr(form, 'name', T('e.name', 'Ievadi vārdu un uzvārdu.')); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(form, 'email', T('e.email', 'Ievadi derīgu e-pastu.')); ok = false; }
    if (phone.replace(/\D/g, '').length < 8) { setErr(form, 'phone', T('e.phone', 'Ievadi derīgu tālruņa numuru.')); ok = false; }

    var d = DELIVERY.find(function (x) { return x.id === (form.querySelector('input[name="delivery"]:checked') || {}).value; });
    if (d && d.field) {
      if (form.locator.value.trim().length < 3) {
        setErr(form, 'locator', d.field === 'locker' ? T('e.locker', 'Norādi pakomātu.') : T('e.address', 'Norādi adresi.'));
        ok = false;
      }
    }
    if (!form.terms.checked) { setErr(form, 'terms', T('e.terms', 'Lūdzu apstiprini noteikumus.')); ok = false; }

    if (!ok) {
      var firstInvalid = form.querySelector('.field.invalid input, [data-err="terms"]');
      if (firstInvalid && firstInvalid.scrollIntoView) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  function orderNumber() {
    var t = new Date();
    var ymd = '' + t.getFullYear() + pad(t.getMonth() + 1) + pad(t.getDate());
    var rnd = Math.floor(1000 + Math.random() * 9000);
    return 'MM-' + ymd + '-' + rnd;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function renderConfirmation(o) {
    var itemsCount = o.rows.reduce(function (n, r) { return n + r.qty; }, 0);
    var payBlock = o.payment.id === 'bank'
      ? '<div class="pay-instructions">' + TF('cf.bank',
          '<b>Apmaksa ar pārskaitījumu</b><br>Saņēmējs: SIA Mini Me<br>IBAN: LV00 HABA 0000 0000 0000 0<br>Summa: <b>{x}</b><br>Maksājuma mērķis: <b>{y}</b><br>Rēķinu ar precīziem rekvizītiem nosūtīsim uz {z}.',
          { x: money(o.total), y: o.no, z: MiniMe.escapeAttr(o.email) }) + '</div>'
      : '<div class="pay-instructions">' + TF('cf.card',
          '<b>Apmaksa ar karti</b><br>Uz {z} nosūtīsim drošu apmaksas saiti pasūtījuma summai <b>{x}</b>. Pasūtījums tiek adīts pēc apmaksas saņemšanas.',
          { x: money(o.total), z: MiniMe.escapeAttr(o.email) }) + '</div>';

    var discRow = o.discountAmt > 0
      ? '<div class="r"><span>' + TF('cf.discount', 'Atlaide ({x})', { x: o.discount.code }) + '</span><b>−' + money(o.discountAmt) + '</b></div>'
      : '';

    host.innerHTML =
      '<div class="confirm">' +
        '<div class="tick">✓</div>' +
        '<h1>' + T('cf.h', 'Paldies par pasūtījumu!') + '</h1>' +
        '<p class="lead">' + TF('cf.lead', '{x}, tavs pasūtījums ir saņemts.', { x: MiniMe.escapeAttr(o.name) }) + '</p>' +
        '<p class="orderno">' + T('cf.no', 'Pasūtījuma Nr. ') + o.no + '</p>' +

        '<div class="confirm-card">' +
          '<h2>' + T('cf.sum', 'Kopsavilkums') + '</h2>' +
          '<div class="r"><span>' + TF('cf.items', 'Preces ({x})', { x: itemsCount }) + '</span><b>' + money(o.subtotal) + '</b></div>' +
          discRow +
          '<div class="r"><span>' + TF('cf.delivery', 'Piegāde — {x}', { x: dName(o.delivery) }) + '</span><b>' + (o.ship === 0 ? T('co.free', 'Bezmaksas') : money(o.ship)) + '</b></div>' +
          '<div class="r"><span>' + T('cf.total', 'Kopā') + '</span><b>' + money(o.total) + '</b></div>' +
          '<div class="r"><span>' + T('cf.place', 'Piegādes vieta') + '</span><b>' + MiniMe.escapeAttr(o.locator) + '</b></div>' +
          '<div class="r"><span>' + T('cf.pay', 'Apmaksa') + '</span><b>' + T(o.payment.nameKey, o.payment.name) + '</b></div>' +
        '</div>' +

        payBlock +
        '<p style="margin:22px 0 0"><a class="btn" href="store.html">' + T('cf.continue', 'Turpināt iepirkšanos') + '</a></p>' +
      '</div>';
  }

  /* boot */
  if (MiniMeCart.detailed().length === 0) renderEmpty();
  else renderCheckout();
})();
