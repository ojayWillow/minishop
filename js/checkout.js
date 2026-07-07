/* ==========================================================================
   Mini Me — checkout.js
   One-page checkout: order summary, contact + delivery + payment, then an
   order-confirmation screen.

   Front-end prototype: the order is assembled and confirmed in the browser and
   the cart is cleared, but nothing is charged or sent to a server. Bank
   transfer shows real payment instructions; card checkout would need a payment
   provider (e.g. Stripe) connected to actually take money.
   ========================================================================== */
(function () {
  var host = document.getElementById('checkout');
  var FREE_FROM = 40;

  var DELIVERY = [
    { id: 'omniva', name: 'Omniva pakomāts', desc: 'Piegāde 2–3 darba dienās', price: 2.99, field: 'locker', fieldLabel: 'Omniva pakomāta adrese' },
    { id: 'dpd',    name: 'DPD Pickup pakomāts', desc: 'Piegāde 2–3 darba dienās', price: 2.99, field: 'locker', fieldLabel: 'DPD pakomāta adrese' },
    { id: 'pasts',  name: 'Latvijas Pasts', desc: 'Piegāde 3–5 darba dienās', price: 3.49, field: 'address', fieldLabel: 'Piegādes adrese' },
    { id: 'pickup', name: 'Saņemšana Rīgā', desc: 'Bez maksas · Rīgas centrs', price: 0, field: null }
  ];
  var PAYMENT = [
    { id: 'bank', name: 'Bankas pārskaitījums', desc: 'Rēķinu ar rekvizītiem saņemsi e-pastā' },
    { id: 'card', name: 'Maksājumu karte', desc: 'Visa / Mastercard — drošu apmaksas saiti nosūtām e-pastā' }
  ];

  var money = function (n) { return n.toFixed(2).replace('.', ',') + ' €'; };

  function shippingFor(deliveryId, subtotal) {
    var d = DELIVERY.find(function (x) { return x.id === deliveryId; });
    if (!d) return 0;
    if (d.price === 0) return 0;
    return subtotal >= FREE_FROM ? 0 : d.price;
  }

  function renderEmpty() {
    host.innerHTML = '<div class="co-empty"><h1>Grozs ir tukšs</h1>' +
      '<p>Pievieno kādu cepuri, un tā parādīsies šeit.</p>' +
      '<a class="btn" href="store.html">Uz veikalu</a></div>';
  }

  function summaryHTML(rows, subtotal, deliveryId) {
    var ship = shippingFor(deliveryId, subtotal);
    var lines = rows.map(function (r) {
      return '<div class="sum-line">' +
        '<div class="st" style="--yarn: var(--yarn-' + r.product.color + ')">' + MiniMe.productArtHTML(r.product) + '</div>' +
        '<div class="sm"><h3>' + MiniMe.escapeAttr(r.product.name) + '</h3>' +
          '<p>Izmērs: ' + (MiniMe.SIZES[r.size] || r.size) + ' · ×' + r.qty + '</p></div>' +
        '<div class="sp">' + money(r.lineTotal) + '</div>' +
      '</div>';
    }).join('');

    var toFree = FREE_FROM - subtotal;
    var freeHint = (shippingFor(deliveryId, subtotal) === 0)
      ? '<p class="free-hint ok">✓ Piegāde bez maksas</p>'
      : (toFree > 0 ? '<p class="free-hint">Pievieno vēl ' + money(toFree) + ', lai piegāde būtu bez maksas.</p>' : '');

    return '<h2>Tavs pasūtījums</h2>' + lines +
      '<div class="sum-totals">' +
        '<div class="r"><span>Starpsumma</span><b>' + money(subtotal) + '</b></div>' +
        '<div class="r"><span>Piegāde</span><b id="sumShip">' + (ship === 0 ? 'Bezmaksas' : money(ship)) + '</b></div>' +
        '<div class="r grand"><span>Kopā</span><b id="sumGrand">' + money(subtotal + ship) + '</b></div>' +
      '</div>' + freeHint;
  }

  function deliveryOptsHTML() {
    return DELIVERY.map(function (d, i) {
      return '<label class="opt-card' + (i === 0 ? ' sel' : '') + '" data-delivery="' + d.id + '">' +
        '<input type="radio" name="delivery" value="' + d.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="oc-main"><b>' + d.name + '</b><p>' + d.desc + '</p></span>' +
        '<span class="oc-price">' + (d.price === 0 ? 'Bezmaksas' : money(d.price)) + '</span>' +
      '</label>';
    }).join('');
  }
  function paymentOptsHTML() {
    return PAYMENT.map(function (pm, i) {
      return '<label class="opt-card' + (i === 0 ? ' sel' : '') + '" data-payment="' + pm.id + '">' +
        '<input type="radio" name="payment" value="' + pm.id + '"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="oc-main"><b>' + pm.name + '</b><p>' + pm.desc + '</p></span>' +
      '</label>';
    }).join('');
  }

  function renderCheckout() {
    var rows = MiniMeCart.detailed();
    var subtotal = MiniMeCart.subtotal();

    host.innerHTML =
      '<h1 class="co-title">Apmaksa</h1>' +
      '<ol class="steps">' +
        '<li><span class="num">1</span> Grozs</li>' +
        '<li aria-current="step"><span class="num">2</span> Dati un piegāde</li>' +
        '<li><span class="num">3</span> Apmaksa</li>' +
        '<li><span class="num">4</span> Apstiprinājums</li>' +
      '</ol>' +
      '<form class="checkout" id="coForm" novalidate>' +
        '<div>' +
          '<section class="co-section">' +
            '<h2>Kontaktinformācija</h2>' +
            '<p class="sub">Uz e-pastu nosūtīsim pasūtījuma apstiprinājumu.</p>' +
            '<div class="field"><label for="c-name">Vārds, uzvārds</label><input id="c-name" name="name" autocomplete="name"><div class="err" data-err="name"></div></div>' +
            '<div class="grid2">' +
              '<div class="field"><label for="c-email">E-pasts</label><input id="c-email" name="email" type="email" autocomplete="email"><div class="err" data-err="email"></div></div>' +
              '<div class="field"><label for="c-phone">Telefons</label><input id="c-phone" name="phone" type="tel" autocomplete="tel"><div class="err" data-err="phone"></div></div>' +
            '</div>' +
          '</section>' +

          '<section class="co-section">' +
            '<h2>Piegāde</h2>' +
            '<p class="sub">Izvēlies piegādes veidu.</p>' +
            '<div class="opts" id="deliveryOpts">' + deliveryOptsHTML() + '</div>' +
            '<div class="field" id="deliveryField" style="margin-top:14px">' +
              '<label for="c-loc" id="deliveryFieldLabel">Omniva pakomāta adrese</label>' +
              '<input id="c-loc" name="locator"><div class="err" data-err="locator"></div>' +
            '</div>' +
          '</section>' +

          '<section class="co-section">' +
            '<h2>Apmaksas veids</h2>' +
            '<div class="opts">' + paymentOptsHTML() + '</div>' +
            '<label class="terms"><input type="checkbox" id="c-terms" name="terms">' +
              '<span>Piekrītu <a href="#" onclick="return false">pirkuma noteikumiem</a> un privātuma politikai.</span></label>' +
            '<div class="err" data-err="terms"></div>' +
            '<button type="submit" class="btn place">Apstiprināt pasūtījumu · <span id="placeTotal"></span></button>' +
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
      var ship = shippingFor(d.id, subtotal);
      document.getElementById('summary').innerHTML = summaryHTML(rows, subtotal, d.id);
      document.getElementById('placeTotal').textContent = money(subtotal + ship);
      // dynamic address/locker field
      var field = document.getElementById('deliveryField');
      if (!d.field) { field.style.display = 'none'; }
      else {
        field.style.display = '';
        document.getElementById('deliveryFieldLabel').textContent = d.fieldLabel;
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
        locator: d.field ? form.locator.value.trim() : 'Saņemšana Rīgā',
        payment: PAYMENT.find(function (x) { return x.id === pm; }),
        rows: rows, subtotal: subtotal, ship: ship, total: subtotal + ship
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

    if (name.length < 2) { setErr(form, 'name', 'Ievadi vārdu un uzvārdu.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(form, 'email', 'Ievadi derīgu e-pastu.'); ok = false; }
    if (phone.replace(/\D/g, '').length < 8) { setErr(form, 'phone', 'Ievadi derīgu tālruņa numuru.'); ok = false; }

    var d = DELIVERY.find(function (x) { return x.id === (form.querySelector('input[name="delivery"]:checked') || {}).value; });
    if (d && d.field) {
      if (form.locator.value.trim().length < 3) { setErr(form, 'locator', 'Norādi ' + (d.field === 'locker' ? 'pakomātu' : 'adresi') + '.'); ok = false; }
    }
    if (!form.terms.checked) { setErr(form, 'terms', 'Lūdzu apstiprini noteikumus.'); ok = false; }

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
      ? '<div class="pay-instructions"><b>Apmaksa ar pārskaitījumu</b><br>' +
          'Saņēmējs: SIA Mini Me<br>IBAN: LV00 HABA 0000 0000 0000 0<br>' +
          'Summa: <b>' + money(o.total) + '</b><br>Maksājuma mērķis: <b>' + o.no + '</b><br>' +
          'Rēķinu ar precīziem rekvizītiem nosūtīsim uz ' + MiniMe.escapeAttr(o.email) + '.</div>'
      : '<div class="pay-instructions"><b>Apmaksa ar karti</b><br>' +
          'Uz ' + MiniMe.escapeAttr(o.email) + ' nosūtīsim drošu apmaksas saiti pasūtījuma summai <b>' + money(o.total) + '</b>. ' +
          'Pasūtījums tiek adīts pēc apmaksas saņemšanas.</div>';

    host.innerHTML =
      '<div class="confirm">' +
        '<div class="tick">✓</div>' +
        '<h1>Paldies par pasūtījumu!</h1>' +
        '<p class="lead">' + MiniMe.escapeAttr(o.name) + ', tavs pasūtījums ir saņemts.</p>' +
        '<p class="orderno">Pasūtījuma Nr. ' + o.no + '</p>' +

        '<div class="confirm-card">' +
          '<h2>Kopsavilkums</h2>' +
          '<div class="r"><span>Preces (' + itemsCount + ')</span><b>' + money(o.subtotal) + '</b></div>' +
          '<div class="r"><span>Piegāde — ' + o.delivery.name + '</span><b>' + (o.ship === 0 ? 'Bezmaksas' : money(o.ship)) + '</b></div>' +
          '<div class="r"><span>Kopā</span><b>' + money(o.total) + '</b></div>' +
          '<div class="r"><span>Piegādes vieta</span><b>' + MiniMe.escapeAttr(o.locator) + '</b></div>' +
          '<div class="r"><span>Apmaksa</span><b>' + o.payment.name + '</b></div>' +
        '</div>' +

        payBlock +
        '<p style="margin:22px 0 0"><a class="btn" href="store.html">Turpināt iepirkšanos</a></p>' +
      '</div>';
  }

  /* boot */
  if (MiniMeCart.detailed().length === 0) renderEmpty();
  else renderCheckout();
})();
