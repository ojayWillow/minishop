/* ==========================================================================
   Mini Me — admin.js
   Prototype admin panel: login gate + product CRUD + image upload, all kept
   in localStorage via the MiniMe data layer.

   SECURITY / SCOPE NOTE
   ---------------------
   This is a front-end-only prototype. The credentials below live in the page
   source, so this login is a convenience gate, NOT real protection. Edits and
   uploaded images are stored in THIS browser's localStorage — customers do not
   see them until you Export the catalogue and commit it to the repo. For a real
   shop (secure login, shared data, media hosting, orders) use a backend or a
   platform such as Shopify or a git-based CMS (Decap). See README.
   ========================================================================== */
(function () {
  var AUTH_KEY = 'minime_admin_auth';
  var CREDENTIALS = { user: 'admin', pass: 'admin' }; // TODO: replace before real use

  var loginView = document.getElementById('loginView');
  var appView = document.getElementById('appView');
  var logoutBtn = document.getElementById('logout');
  var viewShop = document.getElementById('viewShop');

  /* ---------------- auth ---------------- */
  function isAuthed() { return sessionStorage.getItem(AUTH_KEY) === '1'; }

  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
    logoutBtn.hidden = false;
    viewShop.hidden = false;
    buildFormControls();
    renderRows();
  }
  function showLogin() {
    loginView.hidden = false;
    appView.hidden = true;
    logoutBtn.hidden = true;
    viewShop.hidden = true;
  }

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = document.getElementById('user').value.trim();
    var p = document.getElementById('pass').value;
    var err = document.getElementById('loginError');
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
      sessionStorage.setItem(AUTH_KEY, '1');
      err.textContent = '';
      showApp();
    } else {
      err.textContent = 'Nepareizs lietotājvārds vai parole.';
    }
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem(AUTH_KEY);
    document.getElementById('pass').value = '';
    showLogin();
  });

  /* ---------------- toast ---------------- */
  var toastEl = document.getElementById('toast');
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 1900);
  }

  /* ---------------- product list ---------------- */
  var rowsEl = document.getElementById('rows');
  var pcountEl = document.getElementById('pcount');

  function renderRows() {
    var list = MiniMe.getProducts();
    pcountEl.textContent = list.length + ' produkti' + (MiniMe.hasEdits() ? ' · nesaglabātas repozitorijā' : '');
    rowsEl.innerHTML = list.map(function (p) {
      var price = p.oldPrice
        ? '<span class="rprice"><s>' + p.oldPrice + '&nbsp;€</s>' + p.price + '&nbsp;€</span>'
        : '<span class="rprice">' + p.price + '&nbsp;€</span>';
      var pills = '';
      if (p.oldPrice) pills += '<span class="pill">Akcija</span> ';
      if (p.isNew) pills += '<span class="pill">Jauns</span> ';
      return '<div class="row" style="--yarn: var(--yarn-' + p.color + ')">' +
        '<div class="thumb" style="--yarn: var(--yarn-' + p.color + ')">' + MiniMe.productArtHTML(p) + '</div>' +
        '<div class="rmain">' +
          '<h3>' + MiniMe.escapeAttr(p.name) + '</h3>' +
          '<p>' + MiniMe.CATS[p.cat] + ' · ' + p.sizes.join(', ') + '</p>' +
          '<p>' + price + '&nbsp;&nbsp;' + pills + '</p>' +
        '</div>' +
        '<div class="ractions">' +
          '<button class="btn sm mut" data-edit="' + p.id + '">Rediģēt</button>' +
          '<button class="btn sm danger" data-del="' + p.id + '">Dzēst</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  rowsEl.addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]');
    var dl = e.target.closest('[data-del]');
    if (ed) openEditor(+ed.getAttribute('data-edit'));
    if (dl) deleteProduct(+dl.getAttribute('data-del'));
  });

  function deleteProduct(id) {
    var list = MiniMe.getProducts();
    var p = list.find(function (x) { return x.id === id; });
    if (!p) return;
    if (!confirm('Dzēst produktu “' + p.name + '”?')) return;
    list = list.filter(function (x) { return x.id !== id; });
    MiniMe.saveProducts(list);
    renderRows();
    toast('Produkts dzēsts');
  }

  /* ---------------- editor modal ---------------- */
  var modal = document.getElementById('modal');
  var editForm = document.getElementById('editForm');
  var sheetTitle = document.getElementById('sheetTitle');
  var editingId = null;
  var currentImage = null; // data URL or null

  function optionList(map) {
    return Object.keys(map).map(function (k) {
      return '<option value="' + k + '">' + map[k] + '</option>';
    }).join('');
  }
  function checkList(map, name) {
    return Object.keys(map).map(function (k) {
      return '<label><input type="checkbox" name="' + name + '" value="' + k + '"> ' + map[k] + '</label>';
    }).join('');
  }

  function buildFormControls() {
    if (document.getElementById('f-cat').children.length) return; // once
    document.getElementById('f-cat').innerHTML = optionList(MiniMe.CATS);
    document.getElementById('f-type').innerHTML = optionList(MiniMe.TYPES);
    document.getElementById('f-color').innerHTML = optionList(MiniMe.COLORS);
    document.getElementById('f-season').innerHTML = checkList(MiniMe.SEASONS, 'season');
    document.getElementById('f-sizes').innerHTML = checkList(MiniMe.SIZES, 'sizes');
  }

  function setChecks(name, values) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (cb) {
      cb.checked = values.indexOf(cb.value) >= 0;
    });
  }
  function getChecks(name) {
    return Array.prototype.slice.call(document.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (cb) { return cb.value; });
  }

  function setPreview(dataUrl) {
    currentImage = dataUrl || null;
    var box = document.getElementById('f-preview');
    var removeBtn = document.getElementById('f-removeimg');
    if (currentImage) {
      box.innerHTML = '<img src="' + currentImage + '" alt="Priekšskatījums">';
      removeBtn.hidden = false;
    } else {
      box.innerHTML = '<span class="ph-empty">Nav attēla — tiks rādīts adījuma zīmējums</span>';
      removeBtn.hidden = true;
    }
  }

  function openEditor(id) {
    buildFormControls();
    var list = MiniMe.getProducts();
    var p = id != null ? list.find(function (x) { return x.id === id; }) : null;
    editingId = p ? p.id : null;
    sheetTitle.textContent = p ? 'Rediģēt produktu' : 'Jauns produkts';

    document.getElementById('f-name').value = p ? p.name : '';
    document.getElementById('f-cat').value = p ? p.cat : 'bernu-cepures';
    document.getElementById('f-type').value = p ? p.type : 'beanie';
    document.getElementById('f-color').value = p ? p.color : 'roza';
    document.getElementById('f-pop').value = p ? (p.pop != null ? p.pop : 50) : 50;
    document.getElementById('f-price').value = p ? p.price : '';
    document.getElementById('f-oldprice').value = p && p.oldPrice ? p.oldPrice : '';
    document.getElementById('f-new').checked = p ? !!p.isNew : false;
    setChecks('season', p ? p.season : ['ziema']);
    setChecks('sizes', p ? p.sizes : []);
    setPreview(p ? p.image : null);

    document.getElementById('f-image').value = '';
    modal.classList.add('open');
    document.getElementById('f-name').focus();
  }

  function closeEditor() {
    modal.classList.remove('open');
    editingId = null;
  }

  document.getElementById('addBtn').addEventListener('click', function () { openEditor(null); });
  document.getElementById('cancelBtn').addEventListener('click', closeEditor);
  modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeEditor(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeEditor(); });
  document.getElementById('f-removeimg').addEventListener('click', function () { setPreview(null); });

  /* image upload — downscale so it fits comfortably in localStorage */
  document.getElementById('f-image').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('Lūdzu izvēlies attēla failu'); return; }
    var reader = new FileReader();
    reader.onload = function (ev) {
      downscale(ev.target.result, 900, 0.82, function (dataUrl) { setPreview(dataUrl); });
    };
    reader.readAsDataURL(file);
  });

  function downscale(src, maxSide, quality, cb) {
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height;
      var scale = Math.min(1, maxSide / Math.max(w, h));
      var cw = Math.round(w * scale), ch = Math.round(h * scale);
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
      try { cb(canvas.toDataURL('image/jpeg', quality)); }
      catch (err) { cb(src); }
    };
    img.onerror = function () { cb(src); };
    img.src = src;
  }

  editForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var price = parseInt(document.getElementById('f-price').value, 10);
    var seasons = getChecks('season');
    var sizes = getChecks('sizes');
    if (!name) { toast('Ievadi nosaukumu'); return; }
    if (isNaN(price) || price < 0) { toast('Ievadi derīgu cenu'); return; }
    if (!seasons.length) { toast('Izvēlies vismaz vienu sezonu'); return; }
    if (!sizes.length) { toast('Izvēlies vismaz vienu izmēru'); return; }

    var oldPrice = parseInt(document.getElementById('f-oldprice').value, 10);
    var list = MiniMe.getProducts();
    var data = {
      name: name,
      cat: document.getElementById('f-cat').value,
      type: document.getElementById('f-type').value,
      color: document.getElementById('f-color').value,
      season: seasons,
      sizes: sizes,
      price: price,
      pop: parseInt(document.getElementById('f-pop').value, 10) || 50,
      isNew: document.getElementById('f-new').checked
    };
    if (!isNaN(oldPrice) && oldPrice > price) data.oldPrice = oldPrice;
    if (currentImage) data.image = currentImage;

    if (editingId != null) {
      var idx = list.findIndex(function (x) { return x.id === editingId; });
      if (idx >= 0) {
        data.id = editingId;
        list[idx] = data;
      }
    } else {
      data.id = MiniMe.nextId(list);
      list.push(data);
    }

    try {
      MiniMe.saveProducts(list);
    } catch (err) {
      toast('Neizdevās saglabāt — attēls, iespējams, pārāk liels');
      return;
    }
    closeEditor();
    renderRows();
    toast(editingId != null ? 'Produkts atjaunināts' : 'Produkts pievienots');
  });

  /* ---------------- export / import / reset ---------------- */
  document.getElementById('exportBtn').addEventListener('click', function () {
    var data = JSON.stringify(MiniMe.getProducts(), null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'minime-products.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Eksportēts: minime-products.json');
  });

  document.getElementById('importFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed) || !parsed.length) throw new Error('bad');
        MiniMe.saveProducts(parsed);
        renderRows();
        toast('Importēti ' + parsed.length + ' produkti');
      } catch (err) {
        toast('Nederīgs JSON fails');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!confirm('Atiestatīt uz sākotnējo katalogu? Visas izmaiņas šajā pārlūkā tiks dzēstas.')) return;
    MiniMe.resetProducts();
    renderRows();
    toast('Atiestatīts uz noklusējumu');
  });

  /* ---------------- boot ---------------- */
  if (isAuthed()) showApp(); else showLogin();
})();
