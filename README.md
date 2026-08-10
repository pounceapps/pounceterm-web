# pounceterm-web — pounceterm.com

The dedicated PounceTERM site: a full terminal-concept design (the site IS a
terminal), an interactive simulation, and the complete wiki — positioned for
developers doing agentic coding with Claude Code.

**Status: the `pounceterm.com` custom domain is NOT attached yet.** The site
serves from the workers.dev preview URL until the domain attach is approved.

## Layout

- `public/` — static site (Cloudflare Worker assets). Pages: `index`,
  `claude`, `use-cases`, `terminal`, `docs` (the wiki), `whatsnew`,
  `privacy`, `terms`.
- `public/sim.js` — the terminal simulation: scripted scenes + a playground
  prompt (`help`, `ls`, `start claude`, …). Scenes are data files in
  `public/scenes/`.
- `public/style.css` — the terminal design system (phosphor green tokens,
  `.twin` window chrome, tab-strip nav, prompt headings).
- `tools/sync-content.mjs` — regenerates `/docs` and `/whatsnew` from the
  app's OWN sources (`frontend/src/wiki.js`, `core/whatsnew.go`) so site and
  app can never drift:

      node tools/sync-content.mjs ~/dev/pounceterm

  Run it during full-distribution updates (see the release playbook in the
  pounceterm repo), then review the diff and deploy.

## Dev & deploy

    npx wrangler dev          # local preview
    git push                  # history
    npx wrangler deploy       # LIVE — Workers Builds on-push is not firing;
                              # always deploy manually, then curl-check.

Content rules: no emojis (inline SVG only); no personal hostnames, vaults,
or emails anywhere (demo-host / build-box / work-enterprise are the fixtures);
screenshots only from the sanitized demo-profile rig.
