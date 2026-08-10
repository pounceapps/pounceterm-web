// The flagship home-page scene: a fix ships while you hold the gate.
window.PT_HOME_SCENE = {
  title: 'PounceTERM — zsh-1',
  tabs: ['zsh-1'],
  steps: [
    { type: 'type', text: 'ssh demo-host' },
    {
      type: 'out', lines: [
        ['dim', 'connecting to demo-host (100.64.0.7)…'],
        ['', 'Welcome to demo-host — Ubuntu 24.04 LTS'],
        ['dim', 'reverse MCP tunnel up: remote 127.0.0.1:7460 → this Mac'],
      ],
    },
    { type: 'wait', ms: 600 },
    { type: 'out', lines: [['dim', 'right-click the tab → Start Claude here…']], ms: 700 },
    {
      type: 'out', lines: [
        ['dim', '╭─ Start Claude in “zsh-1” ─────────────────╮'],
        ['dim', '│  Profile:  work-enterprise              │'],
        ['dim', '│  Model:    default                      │'],
        ['dim', '│  [x] Connect PounceTERM MCP             │'],
        ['dim', '╰─────────────────────────────────────────╯'],
      ], ms: 900,
    },
    { type: 'tab', name: 'claude-1' },
    { type: 'badge', text: 'Claude · work-enterprise', on: true },
    {
      type: 'out', lines: [
        ['grn', '✳ Welcome to Claude Code'],
        ['dim', 'logged in as work-enterprise — your personal profile stays untouched'],
      ], ms: 700,
    },
    { type: 'type', text: 'fix the flaky retry test and run the suite' },
    {
      type: 'out', lines: [
        ['dim', '✳ editing internal/retry/backoff_test.go…'],
        ['amb', 'Claude wants to run: go test ./…        [Allow] [Deny]'],
      ], ms: 1100,
    },
    {
      type: 'out', lines: [
        ['dim', 'you hold the gate — reads are free, running asks. Allow ⏎'],
        ['grn', 'ok  internal/retry  2.41s  (12 tests)'],
        ['', 'done. tab pinged you because it finished in the background.'],
      ], ms: 400,
    },
  ],
};
