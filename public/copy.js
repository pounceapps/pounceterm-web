// Click-to-copy for command & code examples.
// Adds a visible "Copy" button to every example block and confirms with
// "Copied!" — so nobody has to select multi-line text by hand. Learner-friendly:
// click the button OR anywhere in the block (unless you're selecting text).
(function () {
  var SELECTORS = ['pre', '.brew code', '.brewline', '.wn-install code'];

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }
  function write(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Fall back if the async API is blocked (permissions / insecure context).
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  // Read the block's text, turning <br> into newlines and decoding entities,
  // while excluding the injected Copy button.
  function textOf(el) {
    var clone = el.cloneNode(true);
    var b = clone.querySelector('.copy-btn'); if (b) b.remove();
    var html = clone.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    return (tmp.textContent || '').replace(/ /g, ' ').trim();
  }

  function attach(el) {
    if (el.dataset.copyReady) return;
    el.dataset.copyReady = '1';
    el.classList.add('copyable');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    el.appendChild(btn);

    var timer;
    function fire() {
      write(textOf(el)).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1600);
      });
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); fire(); });
    el.addEventListener('click', function (e) {
      if (e.target.closest('.copy-btn')) return;
      if (String(window.getSelection())) return; // let people select text normally
      fire();
    });
  }

  function run() {
    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(attach);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();
