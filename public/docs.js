// Docs search — same spirit as the in-app wiki: title/tag hits rank above
// body hits; non-matching articles (and their TOC links) hide.
(function () {
  var input = document.getElementById('search');
  var count = document.getElementById('doc-count');
  var arts = Array.prototype.slice.call(document.querySelectorAll('article.doc'));
  var toc = Array.prototype.slice.call(document.querySelectorAll('.docs-side a'));
  var heads = Array.prototype.slice.call(document.querySelectorAll('.docs-side h5'));
  if (!input) return;

  function apply() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      arts.forEach(function (a) { a.style.display = ''; });
      toc.forEach(function (a) { a.style.display = ''; });
      heads.forEach(function (h) { h.style.display = ''; });
      count.textContent = '';
      return;
    }
    var shown = 0;
    var vis = {};
    arts.forEach(function (a) {
      var title = (a.querySelector('h2') || {}).textContent || '';
      var tags = a.getAttribute('data-tags') || '';
      var hit = title.toLowerCase().indexOf(q) >= 0 || tags.toLowerCase().indexOf(q) >= 0 ||
        a.textContent.toLowerCase().indexOf(q) >= 0;
      a.style.display = hit ? '' : 'none';
      vis['#' + a.id] = hit;
      if (hit) shown++;
    });
    toc.forEach(function (a) { a.style.display = vis[a.getAttribute('href')] ? '' : 'none'; });
    heads.forEach(function (h) {
      var any = false, n = h.nextElementSibling;
      while (n && n.tagName === 'A') { if (n.style.display !== 'none') any = true; n = n.nextElementSibling; }
      h.style.display = any ? '' : 'none';
    });
    count.textContent = shown + ' of ' + arts.length + ' articles';
  }
  input.addEventListener('input', apply);
})();
