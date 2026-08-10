// The flagship home-page scene — faithful to what PounceTERM actually does.
// A LOCAL tab (profiles are local; the status bar's "local" stays true), the
// real command Start Claude types, the real profile banner the app prints,
// and Claude Code's real permission-prompt shape. Narration = shell comments.
window.PT_HOME_SCENE = {
  title: 'PounceTERM — zsh-1',
  tabs: ['zsh-1'],
  steps: [
    { type: 'out', lines: [['dim', '# right-click this tab → Start Claude here…']], ms: 1100 },
    { type: 'dialog', profile: 'work-enterprise', ms: 2400 },
    {
      type: 'out', lines: [
        ['prm', '❯ ( export CLAUDE_CONFIG_DIR=~/.claude-profiles/work-enterprise ; claude )'],
      ], ms: 700,
    },
    { type: 'out', lines: [['dim', '── PounceTERM · Claude profile: work-enterprise — if asked to log in, sign in as the account/org THIS profile is for ──']], ms: 700 },
    { type: 'tab', name: 'claude-1' },
    { type: 'badge', text: 'Claude · work-enterprise', on: true },
    { type: 'out', lines: [['grn', '✳ Welcome to Claude Code']], ms: 800 },
    { type: 'type', text: 'fix the flaky retry test and run the suite' },
    {
      type: 'out', lines: [
        ['dim', '✳ Reading internal/retry/backoff_test.go…'],
        ['dim', '✳ The jitter bound is off by one at the window edge — editing…'],
      ], ms: 1100,
    },
    {
      type: 'out', lines: [
        ['amb', '  Bash(go test ./internal/retry/…)'],
        ['amb', '  Do you want to proceed?   ❯ 1. Yes   2. No'],
      ], ms: 1200,
    },
    {
      type: 'out', lines: [
        ['dim', '# reads and edits were free — running asked first. That gate is yours.'],
        ['grn', 'ok      demo/app/internal/retry      2.41s'],
      ], ms: 600,
    },
    { type: 'out', lines: [['dim', '# switch away while it runs — the tab notifies you when it finishes.']], ms: 400 },
  ],
};
