/* ==========================================================================
   Mini Me — icons.js
   Injects the shared SVG symbol definitions (knitted-product illustrations)
   into the document so any page can reference them with <use href="#beanie">.
   ========================================================================== */
(function () {
  var svg =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +

    '<symbol id="beanie" viewBox="0 0 120 118">' +
      '<g fill="var(--yarn)">' +
        '<circle cx="60" cy="20" r="13"/>' +
        '<circle cx="49" cy="16" r="5" opacity=".8"/>' +
        '<circle cx="71" cy="15" r="5" opacity=".8"/>' +
        '<circle cx="60" cy="8" r="5" opacity=".8"/>' +
      '</g>' +
      '<path d="M18 84 C18 46 36 30 60 30 C84 30 102 46 102 84 Z" fill="var(--yarn)"/>' +
      '<g stroke="var(--stitch, rgba(0,0,0,.16))" stroke-width="2.4" fill="none" stroke-linecap="round">' +
        '<path d="M34 44 C42 38 52 35 60 35 C68 35 78 38 86 44"/>' +
        '<path d="M26 58 C36 50 48 47 60 47 C72 47 84 50 94 58"/>' +
        '<path d="M22 74 C34 64 46 61 60 61 C74 61 86 64 98 74"/>' +
      '</g>' +
      '<rect x="14" y="82" width="92" height="26" rx="12" fill="var(--yarn)"/>' +
      '<rect x="14" y="82" width="92" height="26" rx="12" fill="var(--brim-shade)"/>' +
      '<g stroke="var(--stitch, rgba(0,0,0,.16))" stroke-width="2.4" stroke-linecap="round">' +
        '<line x1="28" y1="87" x2="28" y2="103"/><line x1="41" y1="87" x2="41" y2="103"/>' +
        '<line x1="54" y1="87" x2="54" y2="103"/><line x1="67" y1="87" x2="67" y2="103"/>' +
        '<line x1="80" y1="87" x2="80" y2="103"/><line x1="93" y1="87" x2="93" y2="103"/>' +
      '</g>' +
    '</symbol>' +

    '<symbol id="scarf" viewBox="0 0 120 118">' +
      '<rect x="42" y="8" width="36" height="88" rx="10" fill="var(--yarn)"/>' +
      '<rect x="42" y="8" width="36" height="16" rx="8" fill="var(--brim-shade)"/>' +
      '<g stroke="var(--stitch, rgba(0,0,0,.16))" stroke-width="2.4" stroke-linecap="round">' +
        '<line x1="48" y1="34" x2="72" y2="34"/><line x1="48" y1="48" x2="72" y2="48"/>' +
        '<line x1="48" y1="62" x2="72" y2="62"/><line x1="48" y1="76" x2="72" y2="76"/>' +
      '</g>' +
      '<g stroke="var(--yarn)" stroke-width="4" stroke-linecap="round">' +
        '<line x1="48" y1="98" x2="46" y2="110"/><line x1="57" y1="98" x2="56" y2="112"/>' +
        '<line x1="66" y1="98" x2="66" y2="111"/><line x1="74" y1="98" x2="76" y2="110"/>' +
      '</g>' +
    '</symbol>' +

    '<symbol id="mittens" viewBox="0 0 120 118">' +
      '<g>' +
        '<path d="M22 46 C22 32 32 24 44 24 C56 24 64 32 64 46 L64 74 C64 84 56 90 44 90 C32 90 22 84 22 74 Z" fill="var(--yarn)" transform="translate(-4 0) rotate(-8 43 57)"/>' +
        '<ellipse cx="16" cy="60" rx="9" ry="12" fill="var(--yarn)" transform="rotate(-30 16 60)"/>' +
        '<rect x="26" y="82" width="38" height="18" rx="9" fill="var(--yarn)" transform="rotate(-8 45 91)"/>' +
        '<rect x="26" y="82" width="38" height="18" rx="9" fill="var(--brim-shade)" transform="rotate(-8 45 91)"/>' +
      '</g>' +
      '<g>' +
        '<path d="M56 46 C56 32 66 24 78 24 C90 24 98 32 98 46 L98 74 C98 84 90 90 78 90 C66 90 56 84 56 74 Z" fill="var(--yarn)" transform="translate(4 0) rotate(8 77 57)"/>' +
        '<ellipse cx="104" cy="60" rx="9" ry="12" fill="var(--yarn)" transform="rotate(30 104 60)"/>' +
        '<rect x="60" y="82" width="38" height="18" rx="9" fill="var(--yarn)" transform="rotate(8 79 91)"/>' +
        '<rect x="60" y="82" width="38" height="18" rx="9" fill="var(--brim-shade)" transform="rotate(8 79 91)"/>' +
      '</g>' +
      '<g stroke="var(--stitch, rgba(0,0,0,.16))" stroke-width="2.2" fill="none" stroke-linecap="round">' +
        '<path d="M32 44 C38 40 48 40 54 44"/><path d="M66 44 C72 40 82 40 88 44"/>' +
      '</g>' +
    '</symbol>' +

    '<symbol id="headband" viewBox="0 0 120 118">' +
      '<path d="M14 74 C14 46 34 32 60 32 C86 32 106 46 106 74 L106 88 C106 92 102 94 98 92 C88 84 74 80 60 80 C46 80 32 84 22 92 C18 94 14 92 14 88 Z" fill="var(--yarn)"/>' +
      '<path d="M14 74 C14 46 34 32 60 32 C86 32 106 46 106 74 L106 80 C96 66 80 58 60 58 C40 58 24 66 14 80 Z" fill="var(--brim-shade)" opacity=".5"/>' +
      '<g stroke="var(--stitch, rgba(0,0,0,.16))" stroke-width="2.4" fill="none" stroke-linecap="round">' +
        '<path d="M26 62 C36 50 46 44 60 44 C74 44 84 50 94 62"/>' +
      '</g>' +
      '<circle cx="60" cy="40" r="10" fill="var(--yarn)"/>' +
      '<circle cx="52" cy="36" r="4" fill="var(--yarn)" opacity=".85"/>' +
      '<circle cx="68" cy="36" r="4" fill="var(--yarn)" opacity=".85"/>' +
    '</symbol>' +

    '</defs></svg>';

  function inject() {
    var holder = document.createElement('div');
    holder.style.display = 'none';
    holder.setAttribute('aria-hidden', 'true');
    holder.innerHTML = svg;
    document.body.insertBefore(holder, document.body.firstChild);
  }
  // Inject as soon as <body> exists. Because this script is loaded at the end
  // of <body> (before products/store/landing scripts), the body is already
  // present, so the symbols are in the DOM before anything renders <use>.
  if (document.body) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
