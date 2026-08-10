// Scenes for the /claude page — each one SHOWS the feature it sits beside.
window.PT_CLAUDE_SCENES = {
  gate: {
    title: 'PounceTERM — the gate',
    tabs: ['claude-1'],
    steps: [
      { type: 'badge', text: 'Claude · work-enterprise', on: true },
      { type: 'type', text: 'clean up the failing migration and rerun it' },
      { type: 'out', lines: [['dim', '✳ reading db/migrations/0142_backfill.sql… (reads are free)'], ['dim', '✳ typing a fix into the editor… (typing is free — Enter is yours)']], ms: 900 },
      { type: 'out', lines: [['amb', 'Claude wants to run: make migrate-dev    [Allow] [Deny]']], ms: 1000 },
      { type: 'out', lines: [['dim', 'executing needs THIS tab’s AI-control — a human-only switch, off by default.'], ['grn', 'Allow ⏎  →  migrate-dev: ok (0142 applied)']], ms: 400 },
    ],
  },
  chat: {
    title: 'PounceTERM — chat panel (⇧⌘J)',
    tabs: ['zsh-1'],
    steps: [
      { type: 'out', lines: [['prm', 'you ❯ why did that build fail?']], ms: 700 },
      { type: 'out', lines: [['dim', 'claude · sees your focused terminal, frozen at send time']], ms: 700 },
      { type: 'out', lines: [['grn', 'The linker error at the bottom of your screen says the arm64'], ['grn', 'slice is missing — your Makefile only builds x86_64. Want me'], ['grn', 'to type the fixed build flags into the terminal?']], ms: 900 },
      { type: 'out', lines: [['amb', 'send_text: types the command — never presses Enter for you.']], ms: 400 },
    ],
  },
  relay: {
    title: 'PounceTERM — Claude-to-Claude relay',
    tabs: ['local: claude-1', 'demo-host: claude'],
    steps: [
      { type: 'out', lines: [['prm', 'claude-1 → demo-host: "tests pass locally — pull branch fix/retry and verify on your side"']], ms: 900 },
      { type: 'out', lines: [['dim', 'relay: you see every message; nothing passes without you watching']], ms: 700 },
      { type: 'tab', name: 'demo-host: claude' },
      { type: 'out', lines: [['grn', 'demo-host → claude-1: "pulled. 40 runs, 0 flakes on linux/arm64 — ship it"']], ms: 400 },
    ],
  },
};
