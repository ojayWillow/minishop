/* ==========================================================================
   Mini Me — i18n.js
   Lightweight LV/EN switcher. Latvian is the source language baked into the
   HTML; when EN is active, elements marked with data-i18n / data-i18n-ph get
   replaced from the dictionary below, and JS templates ask T(key, lvDefault).
   The chosen language persists in localStorage; switching reloads the page.
   ========================================================================== */
window.I18N = (function () {
  var KEY = 'minime_lang';
  var lang = 'lv';
  try { lang = localStorage.getItem(KEY) || 'lv'; } catch (e) {}
  if (lang !== 'en') lang = 'lv';

  var EN = {
    /* nav + chrome */
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.about': 'About us',
    'nav.contact': 'Contact',
    'ribbon.default': 'Free delivery to an Omniva parcel locker for orders over 40&nbsp;€ · Hand-knitted in Riga',
    'ribbon.progress': 'You are {x} away from free delivery · Hand-knitted in Riga',
    'ribbon.free': 'Your order qualifies for free delivery ✓ · Hand-knitted in Riga',
    'ribbon.checkout': 'Secure checkout · Hand-knitted in Riga',
    'logo.sub': 'hats · Riga',
    'cart.btn': 'Basket',
    'wish.aria': 'Wishlist',

    /* landing */
    'hero.eyebrow': 'Hand-knitted in Riga',
    'hero.title': 'Matching hats for you and your <em>mini&nbsp;me</em>',
    'hero.lead': 'Soft, hand-knitted hats for children from 0 to 12 years — and exactly the same ones for mom and dad. Every hat is made in Riga from natural yarn.',
    'hero.cta1': 'Shop the collection',
    'hero.cta2': 'Mini Me sets',
    'trust.1': 'Hand-knitted',
    'trust.2': 'Merino wool & cotton',
    'trust.3': 'Sizes 0–12 yrs + adults',
    'hero.caption': '“Pūka” set — for mom and daughter',
    'cat1.t': 'Kids’ hats', 'cat1.d': '0–12 years, with or without a pompom',
    'cat2.t': 'Mini Me sets', 'cat2.d': 'One design — two sizes',
    'cat3.t': 'Adult hats', 'cat3.d': 'Just like the little ones, only bigger',
    'sec.popular': 'Most popular hats',
    'sec.all': 'All hats →',
    'duo.eyebrow': 'Our special offer',
    'duo.title': 'Mini Me sets — one design, two sizes',
    'duo.text': 'Pick a colour and yarn, and we will knit two matching hats: one for you, one for your little one. The perfect gift for new parents and family photo sessions.',
    'duo.cta': 'Build your set',
    'vals.h': 'Why Mini Me?',
    'val1.t': 'Hand-knitted in Riga', 'val1.d': 'Every hat is made in our Riga workshop — no production lines, with care in every stitch.',
    'val2.t': 'Natural, soft yarn', 'val2.d': 'Merino wool and cotton that never itches and is safe even for the most delicate skin.',
    'val3.t': 'Made to your measure', 'val3.d': 'Tell us the head circumference and your favourite colour — we will adapt any model just for you.',
    'quotes.h': 'What parents say',
    'quotes.fb': 'Reviews on Facebook →',
    'quote1.text': '“We ordered a Mini Me set for a family photo session — great quality, and our daughter refuses to take the hat off even at home.”',
    'quote1.name': '— Laura, Riga',
    'quote2.text': '“Fast delivery, soft yarn and very responsive communication. The best gift we have given to friends with a baby.”',
    'quote2.name': '— Kristaps, Jelgava',

    /* newsletter */
    'nl.h': 'Get −10% off your first order',
    'nl.p': 'Subscribe to our news and receive a welcome code right away.',
    'nl.ph': 'Your e-mail',
    'nl.btn': 'Subscribe',
    'nl.done': 'Thank you! Your code: <b>WELCOME10</b> — enter it at checkout.',
    'nl.err': 'Please enter a valid e-mail.',

    /* footer */
    'footer.about': 'Hand-knitted hats for children and parents. Knitted with love in Riga, shipping across Latvia and Europe.',
    'footer.follow': 'Follow us',
    'footer.useful': 'Useful',
    'footer.shop': 'Shop',
    'footer.home': 'Home',
    'footer.delivery': 'Delivery: Omniva, DPD, Latvijas Pasts',
    'footer.payment': 'Payment: card, bank transfer',
    'footer.sizes': 'Size chart',
    'footer.admin': 'Admin',
    'footer.back': 'Back to shop',
    'footer.note': 'E-store design concept',

    /* store */
    'store.crumb': 'Home',
    'store.h1': 'Shop',
    'store.sub': 'Hand-knitted hats, scarves, mittens and Mini Me sets. Pick a season or use the filters to find the right one.',
    's1.t': 'Winter collection', 's1.d': 'Warm merino wool, lined hats',
    's2.t': 'Spring / Autumn', 's2.d': 'Lighter hats and headbands',
    's3.t': 'Summer collection', 's3.d': 'Thin cotton, breathable knits',
    'f.h': 'Filters',
    'f.close': 'Close ✕',
    'f.cat': 'Category',
    'f.season': 'Season',
    'f.size': 'Size',
    'f.color': 'Colour',
    'f.price': 'Price',
    'f.upto': 'Up to',
    'f.offers': 'Offers',
    'f.sale': 'On sale',
    'f.new': 'New in',
    'f.clear': 'Clear all filters',
    'f.open': '☰ Filters',
    'sort.label': 'Sort:',
    'sort.pop': 'Most popular',
    'sort.new': 'Newest',
    'sort.asc': 'Price: low to high',
    'sort.desc': 'Price: high to low',
    'search.ph': 'Search: hat, scarf, set…',
    'empty.h': 'Nothing found',
    'empty.p': 'Try removing a filter or changing the search term.',
    'empty.btn': 'Clear filters',
    'chip.size': 'Size: ',
    'card.choose': 'Choose →',
    'quick.add': 'Quick add',
    'quick.title': 'Choose a size',
    'badge.sale': 'Sale',
    'badge.new': 'New',
    'badge.set': 'Set',
    'badge.pop': 'Popular',

    /* pdp */
    'pdp.size': 'Choose a size',
    'pdp.req': '· required',
    'pdp.add': 'Add to basket',
    'pdp.err': 'Please choose a size.',
    'spec.cat': 'Category',
    'spec.material': 'Material',
    'spec.season': 'Season',
    'spec.color': 'Colour',
    'spec.sizes': 'Available sizes',
    'mat.wool': 'Merino wool',
    'mat.cotton': 'Cotton',
    'pdp.ship': '<b>Delivery in 2–4 working days</b> via Omniva, DPD or Latvijas Pasts. Free delivery for orders over 40&nbsp;€. Every hat is knitted to order.',
    'pdp.related': 'You may also like',
    'pdp.nf.h': 'Product not found',
    'pdp.nf.p': 'It may have been removed, or the link is out of date.',
    'pdp.nf.btn': 'Back to shop',

    /* cart drawer */
    'cart.title': 'Basket',
    'cart.empty': 'Your basket is empty.',
    'cart.toShop': 'Go to the shop',
    'cart.sizeLbl': 'Size',
    'cart.remove': 'Remove',
    'cart.subtotal': 'Subtotal',
    'cart.note': 'Delivery is calculated at checkout.',
    'cart.checkout': 'Checkout →',
    'cart.continue': 'Continue shopping',
    'cart.free': '✓ Free delivery unlocked',
    'cart.progress': 'Add {x} more for free delivery',

    /* wishlist */
    'wl.title': 'Wishlist — Mini Me',
    'wl.h1': 'Wishlist',
    'wl.sub': 'Items you have saved. They stay in this browser.',
    'wl.empty.h': 'Your wishlist is empty',
    'wl.empty.p': 'Tap the ♡ on any product to save it here.',
    'wl.empty.btn': 'Go to the shop',
    'wl.view': 'View →',

    /* checkout */
    'co.title': 'Checkout',
    'co.step1': 'Basket', 'co.step2': 'Details & delivery', 'co.step3': 'Payment', 'co.step4': 'Confirmation',
    'co.contact.h': 'Contact details',
    'co.contact.sub': 'We will send the order confirmation to your e-mail.',
    'co.name': 'Full name',
    'co.email': 'E-mail',
    'co.phone': 'Phone',
    'co.delivery.h': 'Delivery',
    'co.delivery.sub': 'Choose a delivery method.',
    'co.pay.h': 'Payment method',
    'co.terms': 'I agree to the <a href="#" onclick="return false">terms of purchase</a> and the privacy policy.',
    'co.place': 'Place order',
    'co.discount.h': 'Discount code',
    'co.discount.ph': 'e.g. WELCOME10',
    'co.discount.apply': 'Apply',
    'co.discount.ok': 'Code applied: {x}',
    'co.discount.bad': 'That code is not valid.',
    'co.sum.h': 'Your order',
    'co.sum.subtotal': 'Subtotal',
    'co.sum.delivery': 'Delivery',
    'co.sum.discount': 'Discount',
    'co.sum.total': 'Total',
    'co.free': 'Free',
    'co.freeHint': 'Add {x} more for free delivery.',
    'co.freeOk': '✓ Free delivery',
    'd.omniva.d': 'Delivery in 2–3 working days',
    'd.dpd.d': 'Delivery in 2–3 working days',
    'd.pasts.n': 'Latvijas Pasts', 'd.pasts.d': 'Delivery in 3–5 working days',
    'd.pickup.n': 'Pick up in Riga', 'd.pickup.d': 'Free · central Riga',
    'd.omniva.f': 'Omniva parcel locker address',
    'd.dpd.f': 'DPD locker address',
    'd.pasts.f': 'Delivery address',
    'p.bank.n': 'Bank transfer', 'p.bank.d': 'You will receive an invoice with payment details by e-mail',
    'p.card.n': 'Payment card', 'p.card.d': 'Visa / Mastercard — we will e-mail you a secure payment link',
    'e.name': 'Enter your full name.',
    'e.email': 'Enter a valid e-mail.',
    'e.phone': 'Enter a valid phone number.',
    'e.locker': 'Please specify the parcel locker.',
    'e.address': 'Please specify the address.',
    'e.terms': 'Please accept the terms.',
    'co.empty.h': 'Your basket is empty',
    'co.empty.p': 'Add a hat and it will appear here.',
    'co.empty.btn': 'Go to the shop',
    'cf.h': 'Thank you for your order!',
    'cf.lead': '{x}, your order has been received.',
    'cf.no': 'Order No. ',
    'cf.sum': 'Summary',
    'cf.items': 'Items ({x})',
    'cf.delivery': 'Delivery — {x}',
    'cf.total': 'Total',
    'cf.place': 'Delivery point',
    'cf.pay': 'Payment',
    'cf.discount': 'Discount ({x})',
    'cf.bank': '<b>Payment by bank transfer</b><br>Recipient: SIA Mini Me<br>IBAN: LV00 HABA 0000 0000 0000 0<br>Amount: <b>{x}</b><br>Payment reference: <b>{y}</b><br>An invoice with exact details will be sent to {z}.',
    'cf.card': '<b>Payment by card</b><br>We will send a secure payment link for <b>{x}</b> to {z}. Your order is knitted once payment is received.',
    'cf.continue': 'Continue shopping'
  };

  function t(key, lvDefault) {
    if (lang === 'en' && EN[key] != null) return EN[key];
    return lvDefault != null ? lvDefault : (EN[key] != null ? EN[key] : key);
  }
  /* simple {x}/{y}/{z} interpolation */
  function tf(key, lvDefault, vars) {
    var s = t(key, lvDefault);
    Object.keys(vars || {}).forEach(function (k) {
      s = s.split('{' + k + '}').join(vars[k]);
    });
    return s;
  }

  function apply() {
    document.documentElement.lang = lang;
    if (lang !== 'en') return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = EN[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var v = EN[el.getAttribute('data-i18n-ph')];
      if (v != null) el.placeholder = v.replace(/<[^>]+>/g, '');
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var v = EN[el.getAttribute('data-i18n-title')];
      if (v != null) { el.title = v; el.setAttribute('aria-label', v); }
    });
  }

  function set(l) {
    try { localStorage.setItem(KEY, l === 'en' ? 'en' : 'lv'); } catch (e) {}
    location.reload();
  }

  function bindSwitchers() {
    document.querySelectorAll('[data-lang-switch]').forEach(function (btn) {
      btn.textContent = lang === 'en' ? 'LV' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Pārslēgt uz latviešu valodu' : 'Switch to English');
      btn.addEventListener('click', function () { set(lang === 'en' ? 'lv' : 'en'); });
    });
  }

  function ready() { apply(); bindSwitchers(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  return { lang: lang, t: t, tf: tf, set: set };
})();

/* global shorthand for JS templates */
window.T = window.I18N.t;
window.TF = window.I18N.tf;
