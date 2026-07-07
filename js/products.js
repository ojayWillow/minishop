/* ==========================================================================
   Mini Me — products.js
   The product catalogue and the shared data layer.

   The default catalogue lives in DEFAULT_PRODUCTS below. The admin panel
   saves edited copies into localStorage; getProducts() returns those edits
   when present, otherwise the defaults. Everything reads through MiniMe.*
   so the store and the admin always agree.

   NOTE: localStorage lives in ONE browser only. Edits made in the admin are
   visible to that browser, not to your customers. To publish changes for
   everyone, use the admin's "Export" to update js/products.js in the repo
   (see README).
   ========================================================================== */
window.MiniMe = (function () {
  var STORAGE_KEY = 'minime_products_v1';

  var CATS = {
    'bernu-cepures': 'Bērnu cepures',
    'pieauguso-cepures': 'Pieaugušo cepures',
    'komplekti': 'Mini Me komplekti',
    'salles': 'Šalles',
    'cimdi': 'Cimdi',
    'lentes': 'Galvas lentes'
  };
  var SEASONS = { 'ziema': 'Ziema', 'pavasaris-rudens': 'Pavasaris / Rudens', 'vasara': 'Vasara' };
  var COLORS = {
    roza: 'Rozā', zila: 'Zila', salvija: 'Salvijas zaļa', medus: 'Medus',
    mals: 'Māla', peleka: 'Pelēka', kremkrasa: 'Krēmkrāsa', cerinu: 'Ceriņu'
  };
  var SIZES = {
    '0-6m': '0–6 mēn.', '6-12m': '6–12 mēn.', '1-2g': '1–2 gadi', '2-4g': '2–4 gadi',
    '4-8g': '4–8 gadi', '8-12g': '8–12 gadi', 'S/M': 'Pieaugušo S/M', 'L/XL': 'Pieaugušo L/XL'
  };
  var TYPES = { beanie: 'Cepure', scarf: 'Šalle', mittens: 'Cimdi', headband: 'Galvas lente', set: 'Komplekts' };

  // type: beanie | scarf | mittens | headband | set
  var DEFAULT_PRODUCTS = [
    { id: 1,  name: 'Cepure “Pūka”',        cat: 'bernu-cepures',     type: 'beanie',   season: ['ziema'],             sizes: ['6-12m','1-2g','2-4g'], color: 'roza',      price: 24, pop: 98, isNew: false },
    { id: 2,  name: 'Cepure “Rīga”',        cat: 'bernu-cepures',     type: 'beanie',   season: ['ziema'],             sizes: ['2-4g','4-8g'],         color: 'zila',      price: 26, pop: 92, isNew: false },
    { id: 3,  name: 'Cepure “Medus”',       cat: 'bernu-cepures',     type: 'beanie',   season: ['pavasaris-rudens'],  sizes: ['0-6m','6-12m'],        color: 'medus',     price: 22, pop: 74, isNew: true },
    { id: 4,  name: 'Cepure “Rudens”',      cat: 'bernu-cepures',     type: 'beanie',   season: ['pavasaris-rudens'],  sizes: ['4-8g','8-12g'],        color: 'mals',      price: 24, oldPrice: 28, pop: 81, isNew: false },
    { id: 5,  name: 'Cepure “Sniegpārsla”', cat: 'bernu-cepures',     type: 'beanie',   season: ['ziema'],             sizes: ['1-2g','2-4g','4-8g'],  color: 'kremkrasa', price: 27, pop: 88, isNew: false },
    { id: 6,  name: 'Cepure “Ceriņi”',      cat: 'bernu-cepures',     type: 'beanie',   season: ['pavasaris-rudens'],  sizes: ['1-2g','2-4g'],         color: 'cerinu',    price: 23, pop: 66, isNew: true },
    { id: 7,  name: 'Vasaras cepure “Smiltis”', cat: 'bernu-cepures', type: 'beanie',   season: ['vasara'],            sizes: ['0-6m','6-12m','1-2g'], color: 'kremkrasa', price: 16, pop: 58, isNew: true },
    { id: 8,  name: 'Vasaras cepure “Saulīte”', cat: 'bernu-cepures', type: 'beanie',   season: ['vasara'],            sizes: ['1-2g','2-4g'],         color: 'medus',     price: 16, pop: 54, isNew: false },
    { id: 9,  name: 'Cepure “Ledus”',       cat: 'pieauguso-cepures', type: 'beanie',   season: ['ziema'],             sizes: ['S/M','L/XL'],          color: 'zila',      price: 32, pop: 71, isNew: false },
    { id: 10, name: 'Cepure “Kakao”',       cat: 'pieauguso-cepures', type: 'beanie',   season: ['ziema'],             sizes: ['S/M','L/XL'],          color: 'peleka',    price: 32, pop: 65, isNew: false },
    { id: 11, name: 'Cepure “Roze”',        cat: 'pieauguso-cepures', type: 'beanie',   season: ['pavasaris-rudens'],  sizes: ['S/M'],                 color: 'roza',      price: 30, oldPrice: 34, pop: 60, isNew: false },
    { id: 12, name: 'Cepure “Piparmētra”',  cat: 'pieauguso-cepures', type: 'beanie',   season: ['pavasaris-rudens'],  sizes: ['S/M','L/XL'],          color: 'salvija',   price: 30, pop: 57, isNew: true },
    { id: 13, name: 'Mini Me “Pūka”',       cat: 'komplekti',         type: 'set',      season: ['ziema'],             sizes: ['6-12m','1-2g','S/M'],  color: 'roza',      price: 52, pop: 96, isNew: false },
    { id: 14, name: 'Mini Me “Migla”',      cat: 'komplekti',         type: 'set',      season: ['ziema'],             sizes: ['2-4g','4-8g','L/XL'],  color: 'peleka',    price: 54, pop: 90, isNew: false },
    { id: 15, name: 'Mini Me “Piparmētra”', cat: 'komplekti',         type: 'set',      season: ['pavasaris-rudens'],  sizes: ['1-2g','2-4g','S/M'],   color: 'salvija',   price: 52, pop: 85, isNew: true },
    { id: 16, name: 'Mini Me “Debesis”',    cat: 'komplekti',         type: 'set',      season: ['ziema'],             sizes: ['4-8g','8-12g','L/XL'], color: 'zila',      price: 54, oldPrice: 58, pop: 79, isNew: false },
    { id: 17, name: 'Mini Me “Vasara”',     cat: 'komplekti',         type: 'set',      season: ['vasara'],            sizes: ['1-2g','2-4g','S/M'],   color: 'medus',     price: 34, pop: 62, isNew: true },
    { id: 18, name: 'Šalle “Ziemas apskāviens”', cat: 'salles',       type: 'scarf',    season: ['ziema'],             sizes: ['2-4g','4-8g','8-12g'], color: 'mals',      price: 21, pop: 69, isNew: false },
    { id: 19, name: 'Šalle “Mākonis”',      cat: 'salles',            type: 'scarf',    season: ['ziema'],             sizes: ['S/M','L/XL'],          color: 'kremkrasa', price: 25, pop: 63, isNew: false },
    { id: 20, name: 'Šalle “Ceriņzieds”',   cat: 'salles',            type: 'scarf',    season: ['pavasaris-rudens'],  sizes: ['1-2g','2-4g','4-8g'],  color: 'cerinu',    price: 19, oldPrice: 23, pop: 55, isNew: false },
    { id: 21, name: 'Cimdi “Ķepiņas”',      cat: 'cimdi',             type: 'mittens',  season: ['ziema'],             sizes: ['1-2g','2-4g'],         color: 'roza',      price: 14, pop: 77, isNew: false },
    { id: 22, name: 'Cimdi “Sniegavīrs”',   cat: 'cimdi',             type: 'mittens',  season: ['ziema'],             sizes: ['2-4g','4-8g'],         color: 'zila',      price: 15, pop: 70, isNew: false },
    { id: 23, name: 'Cimdi “Rūķīši”',       cat: 'cimdi',             type: 'mittens',  season: ['ziema'],             sizes: ['0-6m','6-12m'],        color: 'salvija',   price: 12, pop: 61, isNew: true },
    { id: 24, name: 'Cimdi “Kastanis”',     cat: 'cimdi',             type: 'mittens',  season: ['pavasaris-rudens'],  sizes: ['4-8g','8-12g'],        color: 'mals',      price: 14, pop: 52, isNew: false },
    { id: 25, name: 'Galvas lente “Banti”', cat: 'lentes',            type: 'headband', season: ['pavasaris-rudens'],  sizes: ['6-12m','1-2g','2-4g'], color: 'roza',      price: 13, pop: 72, isNew: true },
    { id: 26, name: 'Galvas lente “Pavasaris”', cat: 'lentes',        type: 'headband', season: ['pavasaris-rudens'],  sizes: ['2-4g','4-8g'],         color: 'salvija',   price: 13, pop: 59, isNew: false },
    { id: 27, name: 'Galvas lente “Mamma”', cat: 'lentes',            type: 'headband', season: ['pavasaris-rudens','ziema'], sizes: ['S/M','L/XL'],   color: 'cerinu',    price: 17, pop: 56, isNew: false },
    { id: 28, name: 'Galvas lente “Saule”', cat: 'lentes',            type: 'headband', season: ['vasara'],            sizes: ['1-2g','2-4g'],         color: 'medus',     price: 11, oldPrice: 13, pop: 48, isNew: false }
  ];

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function getProducts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* fall back to defaults */ }
    return clone(DEFAULT_PRODUCTS);
  }

  function saveProducts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function resetProducts() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function hasEdits() {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  function nextId(list) {
    return list.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1;
  }

  /* HTML for a product's illustration: uploaded image if present, else the
     generated knit SVG (a big+small pair for "set"). */
  function productArtHTML(p) {
    if (p.image) {
      return '<img class="pimg" src="' + p.image + '" alt="' + escapeAttr(p.name) + '" loading="lazy">';
    }
    var yarn = '--yarn: var(--yarn-' + p.color + ')';
    if (p.type === 'set') {
      return '<div class="setwrap" style="' + yarn + '">' +
        '<svg width="92" height="90" role="img" aria-label="' + escapeAttr(p.name) + '"><use href="#beanie"/></svg>' +
        '<svg width="58" height="57" aria-hidden="true"><use href="#beanie"/></svg></div>';
    }
    var sym = { beanie: 'beanie', scarf: 'scarf', mittens: 'mittens', headband: 'headband' }[p.type] || 'beanie';
    return '<svg width="118" height="116" style="' + yarn + '" role="img" aria-label="' + escapeAttr(p.name) + '"><use href="#' + sym + '"/></svg>';
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    CATS: CATS, SEASONS: SEASONS, COLORS: COLORS, SIZES: SIZES, TYPES: TYPES,
    DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
    getProducts: getProducts, saveProducts: saveProducts, resetProducts: resetProducts,
    hasEdits: hasEdits, nextId: nextId, productArtHTML: productArtHTML, escapeAttr: escapeAttr,
    clone: clone
  };
})();
