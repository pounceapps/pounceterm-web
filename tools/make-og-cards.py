#!/usr/bin/env python3
"""Generate the site's social cards (1200x630) as SVG, rasterised with sips.

Why SVG and not a browser screenshot: the card has to be pixel-exact and
reproducible from the command line. Text is laid out explicitly — SVG has no
auto-wrap, so each card lists its headline lines.

Usage: python3 tools/make-og-cards.py [path-to-strip.png]
Strips are app screenshots already cropped to a wide band (see public/og/).
"""
import base64, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OG = os.path.join(HERE, '..', 'public', 'og')

GREEN, AMBER, BLUE, INK, MUTE = '#4fd68c', '#e0a552', '#6aa9ff', '#eaf2ec', '#9fb3a6'

CARDS = [
    dict(out='og-home.png', strip='strip-home.png',
         lines=['The macOS terminal built', 'for <em>agentic coding</em>'],
         chips=['reads are free', 'running asks first', 'one profile per org']),
    dict(out='og-claude.png', strip='strip-home.png',
         lines=['Start <em>Claude Code</em> in', 'any tab — even remote'],
         chips=['permission modes', 'profiles per org', 'MCP in one click']),
    dict(out='og-terminal.png', strip='strip-tiled.png',
         lines=['Tabs, SSH, SFTP —', 'and <em>every path is a link</em>'],
         chips=['encrypted vault', 'tiled groups', 'right-click a path']),
    dict(out='og-usecases.png', strip='strip-claude.png',
         lines=['Real workflows,', 'played out <em>in the terminal</em>'],
         chips=['ship a fix', 'two orgs, one email', 'babysit three agents']),
    dict(out='og-docs.png', strip='strip-tiled.png',
         lines=['The whole manual —', '<em>in the app</em> and on the web'],
         chips=['23 articles', 'searchable', 'no account needed']),
    dict(out='og-whatsnew.png', strip='strip-claude.png',
         lines=['What’s new in', '<em>PounceTERM</em>'],
         chips=['shipped often', 'brew upgrade', 'release notes']),
]


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def headline(line, x, y):
    """One headline line; <em>…</em> switches to the accent colour."""
    out, cur, accent = [], '', False
    for part in line.replace('<em>', '\x01').replace('</em>', '\x01').split('\x01'):
        if part:
            out.append(f'<tspan fill="{GREEN if accent else INK}">{esc(part)}</tspan>')
        accent = not accent
    return (f'<text x="{x}" y="{y}" font-family="JetBrains Mono, SF Mono, Menlo, monospace" '
            f'font-size="42" font-weight="700">{"".join(out)}</text>')


def chip(text, x, y, color):
    w = 22 + len(text) * 10.2
    return (f'<g><rect x="{x}" y="{y}" width="{w:.0f}" height="36" rx="18" fill="{color}18" '
            f'stroke="{color}" stroke-opacity=".45"/>'
            f'<text x="{x + w / 2:.0f}" y="{y + 24}" text-anchor="middle" fill="{color}" '
            f'font-family="JetBrains Mono, SF Mono, Menlo, monospace" font-size="16">{esc(text)}</text></g>'), w


def build(card):
    strip = os.path.join(OG, card['strip'])
    b64 = base64.b64encode(open(strip, 'rb').read()).decode()
    chips, x = [], 54
    for i, t in enumerate(card['chips']):
        s, w = chip(t, x, 250, [GREEN, AMBER, BLUE][i % 3])
        chips.append(s)
        x += w + 12
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c1611"/><stop offset="55%" stop-color="#080d0a"/>
      <stop offset="100%" stop-color="#060a08"/>
    </linearGradient>
    <radialGradient id="g1" cx="10%" cy="0%" r="60%">
      <stop offset="0%" stop-color="{GREEN}" stop-opacity=".22"/>
      <stop offset="100%" stop-color="{GREEN}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="95%" cy="8%" r="55%">
      <stop offset="0%" stop-color="{BLUE}" stop-opacity=".20"/>
      <stop offset="100%" stop-color="{BLUE}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="shot"><rect x="54" y="330" width="1180" height="320" rx="14"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g font-family="JetBrains Mono, SF Mono, Menlo, monospace">
    <path d="M52 62 l16 14 -16 14" fill="none" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>
    <line x1="76" y1="90" x2="98" y2="90" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>
    <text x="112" y="92" font-size="26" font-weight="700" fill="{INK}">Pounce<tspan fill="{GREEN}">TERM</tspan></text>
    <text x="1146" y="92" font-size="18" fill="{GREEN}" text-anchor="end">pounceterm.com</text>
    {headline(card['lines'][0], 54, 168)}
    {headline(card['lines'][1], 54, 216)}
    {''.join(chips)}
  </g>
  <g clip-path="url(#shot)">
    <image xlink:href="data:image/png;base64,{b64}" x="54" y="330" width="1180" preserveAspectRatio="xMinYMin slice" height="369"/>
  </g>
  <rect x="54" y="330" width="1180" height="320" rx="14" fill="none" stroke="{GREEN}" stroke-opacity=".35"/>
</svg>'''
    tmp = os.path.join(OG, '_card.svg')
    open(tmp, 'w').write(svg)
    out = os.path.join(OG, card['out'])
    subprocess.run(['sips', '-s', 'format', 'png', tmp, '--out', out],
                   check=True, capture_output=True)
    os.remove(tmp)
    print(f"{card['out']:20s} {subprocess.run(['sips','-g','pixelWidth','-g','pixelHeight',out],capture_output=True,text=True).stdout.split()[-3::2]}")


if __name__ == '__main__':
    for c in CARDS:
        if os.path.exists(os.path.join(OG, c['strip'])):
            build(c)
        else:
            print('missing strip, skipped:', c['strip'])
