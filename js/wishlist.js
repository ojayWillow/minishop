/* ==========================================================================
   Mini Me — wishlist.js
   Saved-items list in localStorage. Pages render ♡ buttons with
   [data-wish="<id>"]; call MiniMeWish.bind(container) after (re)rendering to
   sync their state and clicks. Header badges use [data-wish-count].
   ========================================================================== */
window.MiniMeWish = (function () {
  var KEY = 'minime_wishlist_v1';
  var listeners = [];

  function read() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function write(ids) {
    localStorage.setItem(KEY, JSON.stringify(ids));
    paint();
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  function ids() { return read(); }
  function has(id) { return read().indexOf(parseInt(id, 10)) >= 0; }
  function toggle(id) {
    id = parseInt(id, 10);
    var list = read();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    write(list);
    return i < 0; // true = now saved
  }
  function count() { return read().length; }
  function onChange(fn) { listeners.push(fn); }

  function paint() {
    var n = count();
    document.querySelectorAll('[data-wish-count]').forEach(function (el) {
      el.textContent = n;
      el.toggleAttribute('data-some', n > 0);
    });
    document.querySelectorAll('[data-wish]').forEach(function (btn) {
      var saved = has(btn.getAttribute('data-wish'));
      btn.classList.toggle('saved', saved);
      btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      btn.innerHTML = saved ? '♥' : '♡';
    });
  }

  /* Delegate clicks once per container so re-rendered buttons keep working. */
  function bind(container) {
    container = container || document;
    if (container.__wishBound) { paint(); return; }
    container.__wishBound = true;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wish]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggle(btn.getAttribute('data-wish'));
    });
    paint();
  }

  function ready() { paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  return { ids: ids, has: has, toggle: toggle, count: count, onChange: onChange, bind: bind, paint: paint };
})();
