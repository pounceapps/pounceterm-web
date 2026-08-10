// PounceSim — the site's terminal simulation. Vanilla, zero deps.
// Two modes: auto-played scripted scenes (typed keystroke-by-keystroke) and a
// small playground prompt with canned commands. Everything is real DOM text;
// prefers-reduced-motion renders scenes instantly.
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SVG_REPLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
  var SVG_PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>';
  var SVG_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>';

  // The playground's canned world. Friendly, on-message, zero personal data.
  var COMMANDS = {
    help: [
      ['dim', 'commands you can try here:'],
      ['', '  ls           what PounceTERM ships'],
      ['', '  ssh demo-host   open a remote shell'],
      ['', '  start claude    launch Claude in this tab'],
      ['', '  profiles     your Claude identities'],
      ['', '  themes       the look'],
      ['', '  stats        this tab, measured'],
      ['', '  whoami · brew · clear'],
      ['LINK', 'the real manual lives in the docs → '],
    ],
    ls: [
      ['grn', 'tabs/        groups/      splits/      broadcast'],
      ['grn', 'ssh/         vault/       sftp/        known-hosts'],
      ['grn', 'claude/      profiles/    chat/        ai-control'],
      ['grn', 'themes/      fonts/       sync/        stats'],
      ['dim', '20 features, 0 subscriptions'],
    ],
    'ssh demo-host': [
      ['dim', 'connecting to demo-host (100.64.0.7)…'],
      ['', 'Welcome to demo-host — Ubuntu 24.04 LTS'],
      ['dim', 'reverse MCP tunnel up: remote 127.0.0.1:7460 → this Mac'],
      ['grn', 'steve@demo-host:~$'],
    ],
    'start claude': [
      ['dim', '╭─ Start Claude in “zsh-1” ──╮'],
      ['dim', '│ Profile: work-enterprise  │'],
      ['dim', '│ Model:   default          │'],
      ['dim', '│ [x] Connect MCP           │'],
      ['dim', '╰───────────────────────────╯'],
      ['grn', '✳ Welcome to Claude Code — logged in as work-enterprise'],
      ['amb', 'Claude wants to run: go test ./…   [Allow] [Deny]'],
      ['dim', 'you hold the gate — reads are free, running asks.'],
      ['BADGE', 'Claude · work-enterprise'],
    ],
    profiles: [
      ['', 'Default           ~/.claude — your regular login'],
      ['', 'work-enterprise   Enterprise org — same email'],
      ['', 'personal          personal plan — same email'],
      ['dim', 'one login per profile; run them side by side in different tabs'],
    ],
    themes: [
      ['grn', 'homebrew   pounce   night-prowl   rider   phosphor'],
      ['dim', '… plus every monospace font on your Mac'],
    ],
    stats: [
      ['', 'open 2h 14m · output 1.8 MB · typed 4.2 KB'],
      ['', 'processes 7 · memory 212 MB · cpu 3.1%'],
      ['grn', 'claude: running · profile work-enterprise · 41 sessions on disk'],
      ['dim', 'right-click any tab → Session Stats…'],
    ],
    whoami: [
      ['', 'a developer who wants agents in the terminal — safely'],
    ],
    brew: [
      ['grn', 'brew tap pounceapps/tap && brew install --cask pounceterm'],
      ['dim', 'notarized · no subscription · updates via brew upgrade'],
    ],
  };

  function el(tag, cls, text) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (text != null) d.textContent = text;
    return d;
  }

  function Sim(root, opts) {
    var scene = opts.scene || null;
    var playground = opts.playground !== false;
    var autoplay = opts.autoplay !== false;

    root.innerHTML = '';
    var win = el('div', 'twin');
    var bar = el('div', 'twin-bar');
    var dots = el('div', 'twin-dots');
    dots.appendChild(el('i')); dots.appendChild(el('i')); dots.appendChild(el('i'));
    var title = el('div', 'twin-title', (scene && scene.title) || 'PounceTERM — demo');
    var ctl = el('div', 'twin-ctl');
    bar.appendChild(dots); bar.appendChild(title); bar.appendChild(ctl);
    var tabs = el('div', 'twin-tabs');
    var body = el('div', 'twin-body');
    body.setAttribute('aria-live', 'polite');
    var status = el('div', 'twin-status');
    var badge = el('span', 'twin-badge', 'AI off');
    status.appendChild(el('span', '', 'local')); status.appendChild(badge);
    win.appendChild(bar); win.appendChild(tabs); win.appendChild(body); win.appendChild(status);
    root.appendChild(win);

    var paused = false, timer = null, stepIx = 0, done = !scene;

    function setTabs(names, on) {
      tabs.innerHTML = '';
      names.forEach(function (n, i) {
        tabs.appendChild(el('span', 'twin-tab' + (i === on ? ' on' : ''), n));
      });
    }
    var tabNames = (scene && scene.tabs && scene.tabs.slice()) || ['zsh-1'];
    setTabs(tabNames, 0);

    // Tiled mode: scene.tiled = ['api','frontend','infra'] renders the body as
    // side-by-side panes (the app's tiled color-group look). Steps target a
    // pane with {type:'pout', pane:'api', lines:[...]}.
    var panes = {};
    if (scene && scene.tiled) {
      tabs.style.display = 'none';
      body.classList.add('twin-split');
      scene.tiled.forEach(function (name) {
        var p = el('div', 'twin-pane');
        p.appendChild(el('div', 'twin-pane-h', name));
        var pb = el('div', 'twin-pane-b');
        p.appendChild(pb);
        body.appendChild(p);
        panes[name] = pb;
      });
    }
    function paneLine(pane, cls, text) {
      var pb = panes[pane];
      if (!pb) return;
      pb.appendChild(el('div', 'ln' + (cls ? ' ' + cls : ''), text));
    }

    function line(cls, text) {
      var ln = el('div', 'ln' + (cls ? ' ' + cls : ''), text);
      body.appendChild(ln);
      body.scrollTop = body.scrollHeight;
      return ln;
    }
    function outRow(pair) {
      if (pair[0] === 'BADGE') { badge.textContent = pair[1]; badge.className = 'twin-badge on'; return; }
      if (pair[0] === 'LINK') {
        var ln = line('dim', pair[1]);
        var a = el('a', '', 'pounceterm.com/docs'); a.href = '/docs';
        ln.appendChild(a);
        return;
      }
      line(pair[0], pair[1]);
    }

    // ---- scripted scene player ----
    function runStep() {
      if (paused || !scene) return;
      if (stepIx >= scene.steps.length) { finishScene(); return; }
      var s = scene.steps[stepIx++];
      if (s.type === 'type') {
        var ln = line(null, '');
        ln.appendChild(el('span', 'prm', '❯ '));
        var span = el('span', '', '');
        ln.appendChild(span);
        var i = 0;
        (function tick() {
          if (paused) { timer = setTimeout(tick, 120); return; }
          if (i < s.text.length) {
            span.textContent += s.text[i++];
            timer = setTimeout(tick, REDUCED ? 0 : 22 + Math.random() * 24);
          } else { timer = setTimeout(runStep, REDUCED ? 0 : 260); }
        })();
      } else if (s.type === 'out') {
        s.lines.forEach(function (l) { outRow(Array.isArray(l) ? l : ['', l]); });
        timer = setTimeout(runStep, REDUCED ? 0 : (s.ms || 420));
      } else if (s.type === 'pout') {
        s.lines.forEach(function (l) { paneLine(s.pane, l[0], l[1]); });
        timer = setTimeout(runStep, REDUCED ? 0 : (s.ms || 500));
      } else if (s.type === 'tab') {
        if (tabNames.indexOf(s.name) < 0) tabNames.push(s.name);
        setTabs(tabNames, tabNames.indexOf(s.name));
        timer = setTimeout(runStep, REDUCED ? 0 : 350);
      } else if (s.type === 'badge') {
        badge.textContent = s.text;
        badge.className = 'twin-badge' + (s.on ? ' on' : '');
        timer = setTimeout(runStep, REDUCED ? 0 : 300);
      } else { // wait
        timer = setTimeout(runStep, REDUCED ? 0 : (s.ms || 500));
      }
    }

    var inputLn = null, input = null;
    function finishScene() {
      done = true;
      if (playground) armPlayground();
    }

    // ---- playground ----
    function armPlayground() {
      if (input) return;
      inputLn = line(null, '');
      inputLn.appendChild(el('span', 'prm', 'steve@demo ❯ '));
      input = el('input', 'sim-input');
      input.setAttribute('aria-label', 'try a command — type help');
      input.autocapitalize = 'off'; input.autocomplete = 'off'; input.spellcheck = false;
      inputLn.appendChild(input);
      line('dim', 'this one’s live — type help');
      body.scrollTop = body.scrollHeight;
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var cmd = input.value.trim().toLowerCase();
        input.value = '';
        var echo = el('div', 'ln'); echo.appendChild(el('span', 'prm', 'steve@demo ❯ ')); echo.appendChild(el('span', '', cmd));
        body.insertBefore(echo, inputLn);
        if (!cmd) return;
        if (cmd === 'clear') { body.querySelectorAll('.ln').forEach(function (n) { if (n !== inputLn) n.remove(); }); return; }
        var rows = COMMANDS[cmd];
        if (!rows) {
          var known = Object.keys(COMMANDS).find(function (k) { return k.split(' ')[0] === cmd.split(' ')[0]; });
          rows = known ? COMMANDS[known] : [['dim', 'command not found — try help']];
        }
        rows.forEach(function (pair) {
          if (pair[0] === 'BADGE') { badge.textContent = pair[1]; badge.className = 'twin-badge on'; return; }
          var ln;
          if (pair[0] === 'LINK') {
            ln = el('div', 'ln dim', pair[1]);
            var a = el('a', '', 'pounceterm.com/docs'); a.href = '/docs'; ln.appendChild(a);
          } else {
            ln = el('div', 'ln' + (pair[0] ? ' ' + pair[0] : ''), pair[1]);
          }
          body.insertBefore(ln, inputLn);
        });
        body.scrollTop = body.scrollHeight;
      });
      win.addEventListener('click', function (e) { if (e.target === body || body.contains(e.target)) input.focus(); });
    }

    // ---- controls ----
    if (scene) {
      var replay = el('button'); replay.innerHTML = SVG_REPLAY; replay.title = 'Replay'; replay.setAttribute('aria-label', 'Replay the demo');
      var pause = el('button'); pause.innerHTML = SVG_PAUSE; pause.title = 'Pause'; pause.setAttribute('aria-label', 'Pause the demo');
      ctl.appendChild(pause); ctl.appendChild(replay);
      pause.addEventListener('click', function () {
        paused = !paused;
        pause.innerHTML = paused ? SVG_PLAY : SVG_PAUSE;
        if (!paused && !done) runStep();
      });
      replay.addEventListener('click', function () {
        clearTimeout(timer); paused = false; done = false; stepIx = 0;
        pause.innerHTML = SVG_PAUSE;
        body.innerHTML = ''; input = null; inputLn = null;
        tabNames = (scene.tabs && scene.tabs.slice()) || ['zsh-1'];
        setTabs(tabNames, 0);
        badge.textContent = 'AI off'; badge.className = 'twin-badge';
        runStep();
      });
      if (autoplay) runStep(); else finishScene();
    } else if (playground) {
      armPlayground();
    }
    return { replay: function () { }, root: win };
  }

  window.PounceSim = {
    mount: function (target, opts) {
      var elx = typeof target === 'string' ? document.querySelector(target) : target;
      if (!elx) return null;
      return new Sim(elx, opts || {});
    },
    // mountWhenVisible: autoplay only once scrolled into view (use-case pages).
    mountWhenVisible: function (target, opts) {
      var elx = typeof target === 'string' ? document.querySelector(target) : target;
      if (!elx) return;
      if (!('IntersectionObserver' in window)) return window.PounceSim.mount(elx, opts);
      var fired = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !fired) {
            fired = true; io.disconnect();
            window.PounceSim.mount(elx, opts);
          }
        });
      }, { threshold: 0.2, rootMargin: '200px 0px' });
      io.observe(elx);
    },
  };
})();
