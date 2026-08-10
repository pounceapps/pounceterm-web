// Click any screenshot to zoom it in place — overlay, no navigation.
// Esc, click, or the close button dismisses. Keyboard reachable.
(function () {
  var ov = null;
  function close() { if (ov) { ov.remove(); ov = null; document.body.style.overflow = ''; } }
  function open(img) {
    close();
    ov = document.createElement('div');
    ov.className = 'lb';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', img.alt || 'screenshot, enlarged');
    var big = document.createElement('img');
    big.src = img.getAttribute("data-full") || img.src; big.alt = img.alt || '';
    var x = document.createElement('button');
    x.className = 'lb-x'; x.setAttribute('aria-label', 'Close');
    x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    var cap = document.createElement('div');
    cap.className = 'lb-cap';
    var fig = img.closest('figure');
    var fc = fig && fig.querySelector('figcaption');
    cap.textContent = fc ? fc.textContent : '';
    ov.appendChild(big); ov.appendChild(x); if (cap.textContent) ov.appendChild(cap);
    ov.addEventListener('click', close);
    x.addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    x.focus();
  }
  document.querySelectorAll('figure.shot img').forEach(function (img) {
    img.style.cursor = 'zoom-in';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt || 'screenshot') + ' — press Enter to enlarge');
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
})();
