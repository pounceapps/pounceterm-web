#!/usr/bin/env node
// sync-content.mjs — regenerate /docs and /whatsnew from the app's own sources
// so the site can never drift from the in-app wiki and changelog.
//
//   node tools/sync-content.mjs [path-to-pounceterm-repo]   (default ~/dev/pounceterm)
//
// It imports the app's REAL wiki module (ARTICLES + renderArticleHtml) via a
// temp copy with the import path fixed for Node, parses core/whatsnew.go's
// Changelog literal, and rewrites the fragments between GEN markers in
// public/docs.html and public/whatsnew.html.
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = process.argv[2] || join(process.env.HOME, 'dev/pounceterm');

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- load the app's wiki module in Node --------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'ptwiki-'));
cpSync(join(APP, 'frontend/src/shortcuts.js'), join(tmp, 'shortcuts.js'));
const wikiSrc = readFileSync(join(APP, 'frontend/src/wiki.js'), 'utf8')
  .replace("from '/src/shortcuts.js'", "from './shortcuts.js'");
writeFileSync(join(tmp, 'wiki.js'), wikiSrc);
const { ARTICLES, renderArticleHtml } = await import(pathToFileURL(join(tmp, 'wiki.js')).href);

// ---- docs fragment ------------------------------------------------------
// Sidebar groups (every article must appear exactly once — verified below).
const GROUPS = [
  ['Claude & agents', ['start-claude', 'claude-profiles', 'ai-control', 'chat', 'session-stats', 'relay', 'notifications']],
  ['Remote & connections', ['remote-mcp', 'tailscale', 'hosts-identities', 'host-keys', 'sftp', 'copy-remote']],
  ['AI setup', ['ai-provider', 'import-ai', 'mcp-security']],
  ['Settings & sync', ['settings', 'appearance', 'sync-1password']],
  ['Reference', ['tab-groups', 'shortcuts']],
];
const grouped = GROUPS.flatMap(([, ids]) => ids);
const missing = ARTICLES.filter(a => !grouped.includes(a.id)).map(a => a.id);
const unknown = grouped.filter(id => !ARTICLES.some(a => a.id === id));
if (missing.length || unknown.length) {
  console.error('GROUPS out of date. missing:', missing, 'unknown:', unknown);
  process.exit(1);
}

const byId = Object.fromEntries(ARTICLES.map(a => [a.id, a]));
let toc = '';
for (const [label, ids] of GROUPS) {
  toc += `<h5>${esc(label)}</h5>` + ids.map(id => `<a href="#${id}">${esc(byId[id].title)}</a>`).join('');
}
let arts = '';
for (const [, ids] of GROUPS) {
  for (const id of ids) {
    const a = byId[id];
    arts += `<article class="doc" id="${a.id}" data-tags="${esc(a.tags.join(' '))}">
<h2>${esc(a.title)}</h2>
${renderArticleHtml(a.body, esc)}
<div class="doc-tags">${a.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
</article>\n`;
  }
}

// ---- whatsnew fragment ---------------------------------------------------
const go = readFileSync(join(APP, 'core/whatsnew.go'), 'utf8');
const entries = [];
const relRe = /\{\s*Version:\s*"([^"]+)",\s*Date:\s*"([^"]+)",\s*(?:Major:\s*(true|false),\s*)?Notes:\s*\[\]string\{([\s\S]*?)\},\s*\}/g;
let m;
while ((m = relRe.exec(go))) {
  const notes = [...m[4].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => JSON.parse('"' + x[1] + '"'));
  entries.push({ version: m[1], date: m[2], major: m[3] === 'true', notes });
}
if (!entries.length) { console.error('no releases parsed from whatsnew.go'); process.exit(1); }
let wn = '';
entries.forEach((r, i) => {
  wn += `<section class="wn${i === 0 ? ' wn-latest' : ''}" id="v${r.version.replaceAll('.', '-')}">
<h2>v${esc(r.version)}<span class="d">${esc(r.date)}</span>${i === 0 ? '<span class="wn-badge">LATEST</span>' : ''}</h2>
<ul>${r.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
</section>\n`;
});

// ---- splice into pages -----------------------------------------------------
function splice(file, marker, frag) {
  const p = join(SITE, 'public', file);
  const html = readFileSync(p, 'utf8');
  const re = new RegExp(`(<!-- GEN:${marker} -->)[\\s\\S]*?(<!-- /GEN:${marker} -->)`);
  if (!re.test(html)) { console.error(`${file}: missing GEN:${marker} markers`); process.exit(1); }
  writeFileSync(p, html.replace(re, `$1\n${frag}$2`));
}
splice('docs.html', 'toc', toc);
splice('docs.html', 'articles', arts);
splice('whatsnew.html', 'releases', wn);
console.log(`synced ${ARTICLES.length} articles, ${entries.length} releases from ${APP}`);
