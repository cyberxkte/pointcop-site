# The PointCop site

The public site for PointCop, a padel scoreboard for playing with friends.
Meant to be served by GitHub Pages.

Two of these pages are not marketing. `privacy.html` and `support.html` are the
URLs registered with Google Play and the App Store, so **their filenames must
not change** and they must never 404 — a dead privacy policy is grounds for
removal from both stores.

## How it is built

One template per page, one JSON per language, and a Node script that writes a
real HTML file for every combination. You edit two kinds of file and never
touch the generated HTML.

```
src/locales/*.json     the words — nine files, en.json is the reference
src/templates/*.mjs    the three page layouts
src/layout.mjs         head, header and footer, shared by every page
assets/css/site.css    all styling
build.mjs              writes the pages
```

```sh
node build.mjs                         # all nine languages
POINTCOP_LANGS=en,es node build.mjs    # just these two, while drafting
```

The generated files (`index.html`, `privacy.html`, `support.html`, the eight
language directories, `sitemap.xml` and `robots.txt`) are committed, because
GitHub Pages serves files and runs nothing.

## Before the first submission

Two constants in `src/layout.mjs` are still placeholders, and both stores will
check them:

- `SITE` — where the built pages actually live. A project site
  (`https://<user>.github.io/pointcop-site`) works; an owned domain is better,
  and then add a `CNAME` file here carrying it.
- `CONTACT` — an address that receives mail. Apple has been known to write to
  it during review, so a bouncing mailbox is worse than no mailbox.

Rebuild after changing either: they are baked into every canonical URL,
`hreflang` link and mail link.

## Why it is static

GitHub Pages runs nothing, and a page that assembled itself in the browser
would leave Google one indexable URL for nine languages. Every language gets a
real file, `hreflang` tells crawlers the other eight exist, and the root page
redirects a first-time visitor to their own language exactly once.

The redirect never fires on `privacy.html` or `support.html`: those are the
URLs the stores have on file, and a reviewer opening one must land on exactly
it, in the language they asked for.

## No web fonts, no third-party requests

The pages load nothing from anyone else's server. A request to
`fonts.googleapis.com` would hand every visitor's IP address to Google before
they had agreed to anything, which is a strange thing to do on a site whose
privacy policy says nothing leaves your device.
