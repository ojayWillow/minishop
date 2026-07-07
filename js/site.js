/* ==========================================================================
   Mini Me — site.js
   Tiny site-wide bits. The cart lives in cart.js; here we just stamp the year.
   ========================================================================== */
(function () {
  function ready() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });

    /* newsletter signup → reveals the WELCOME10 code (kept in this browser;
       a real mailing list needs a provider like Mailchimp connected) */
    var form = document.getElementById('nlForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('nlEmail').value.trim();
        var msg = document.getElementById('nlMsg');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.innerHTML = T('nl.err', 'Lūdzu ievadi derīgu e-pastu.');
          return;
        }
        try {
          var list = JSON.parse(localStorage.getItem('minime_newsletter') || '[]');
          if (list.indexOf(email) < 0) list.push(email);
          localStorage.setItem('minime_newsletter', JSON.stringify(list));
        } catch (err) {}
        msg.innerHTML = T('nl.done', 'Paldies! Tavs kods: <b>WELCOME10</b> — ievadi to apmaksas solī.');
        form.reset();
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else { ready(); }
})();
