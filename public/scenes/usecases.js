// Use-case scenes. Demo data only — never real hostnames, vaults, or emails.
window.PT_SCENES = {
  fix: {
    title: 'PounceTERM — claude-1',
    tabs: ['claude-1'],
    steps: [
      { type: 'badge', text: 'Claude · work-enterprise', on: true },
      { type: 'type', text: 'the retry test is flaky on CI — find it and fix it' },
      { type: 'out', lines: [['dim', '✳ reading internal/retry/backoff_test.go…'], ['dim', '✳ the jitter bound is off by one at the window edge'], ['amb', 'Claude wants to run: go test ./internal/retry   [Allow] [Deny]']], ms: 900 },
      { type: 'out', lines: [['dim', 'Allow ⏎ — running still asks; reads never did.'], ['grn', 'ok  internal/retry  2.41s  (12 tests, 40 runs, 0 flakes)']], ms: 500 },
      { type: 'out', lines: [['', 'switched to another tab meanwhile? the finish pinged you.']] },
    ],
  },
  orgs: {
    title: 'PounceTERM — two identities',
    tabs: ['work-repo', 'side-project'],
    steps: [
      { type: 'tab', name: 'work-repo' },
      { type: 'badge', text: 'Claude · work-enterprise', on: true },
      { type: 'out', lines: [['grn', '✳ Claude Code — org: Enterprise'], ['dim', 'reviewing the release branch…']], ms: 700 },
      { type: 'tab', name: 'side-project' },
      { type: 'badge', text: 'Claude · personal', on: true },
      { type: 'out', lines: [['grn', '✳ Claude Code — org: personal plan'], ['dim', 'same email, different profile, different org — zero relogging'], ['', 'both run at the same time; the status bar always says which.']], ms: 400 },
    ],
  },
  remote: {
    title: 'PounceTERM — build-box',
    tabs: ['build-box'],
    steps: [
      { type: 'type', text: 'ssh build-box' },
      { type: 'out', lines: [['dim', 'connected over Tailscale (100.64.0.7) — reverse MCP tunnel up'], ['grn', 'steve@build-box:~$']], ms: 600 },
      { type: 'type', text: 'claude' },
      { type: 'badge', text: 'Claude · remote', on: true },
      { type: 'out', lines: [['grn', '✳ Claude Code on build-box'], ['dim', 'it reaches PounceTERM through the tunnel: 127.0.0.1:7460 → your Mac'], ['amb', 'run_command still gates on THIS tab’s AI-control. Off by default.']], ms: 400 },
    ],
  },
  fleet: {
    title: 'PounceTERM — agents group (tiled)',
    tabs: ['api', 'frontend', 'infra'],
    steps: [
      { type: 'out', lines: [['dim', 'color group "agents" — 3 terminals, tiled 1×3']], ms: 500 },
      { type: 'tab', name: 'api' },
      { type: 'out', lines: [['grn', 'api      ✳ refactoring handlers… (claude · work)']], ms: 450 },
      { type: 'tab', name: 'frontend' },
      { type: 'out', lines: [['grn', 'frontend ✳ writing tests… (claude · work)']], ms: 450 },
      { type: 'tab', name: 'infra' },
      { type: 'out', lines: [['amb', 'infra    ⚠ needs you: approve terraform plan   [Allow] [Deny]'], ['dim', 'that one raised a banner — the other two keep working.'], ['', 'Session Stats on any tab shows who’s been busiest.']], ms: 400 },
    ],
  },
  files: {
    title: 'PounceTERM — SFTP: demo-host',
    tabs: ['demo-host', 'sftp: demo-host'],
    steps: [
      { type: 'tab', name: 'sftp: demo-host' },
      { type: 'out', lines: [['dim', 'local ~/projects/app        remote /var/www/app'], ['', 'drag  build/  →  releases/2026-08-10/   (recursive, queued)'], ['grn', '▮▮▮▮▮▮▮▮▮▮ 100%  42 files · 18.3 MB'], ['dim', 'space = Quick-Look preview: text, images, video, PDF — streamed'], ['', 'same SSH connection as the shell tab. No second login.']], ms: 500 },
    ],
  },
};
