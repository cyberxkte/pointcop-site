/*
 * Builds the site.
 *
 *   node build.mjs
 *
 * Reads one template per page and one JSON per language, and writes a real
 * HTML file for every combination. English lands at the root, because that is
 * where both stores point their privacy and support URLs; the other eight
 * languages get a directory each.
 *
 * Static output is the point. GitHub Pages serves files and runs nothing, and
 * a page that assembled itself in the browser would leave Google one indexable
 * URL for nine languages.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, pageUrl, ALL_LANGS } from './src/layout.mjs';
import landing from './src/templates/landing.mjs';
import privacy from './src/templates/privacy.mjs';
import support from './src/templates/support.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = ROOT;

/**
 * POINTCOP_LANGS=en,es narrows a build while a translation is still being
 * written. The published build always runs the full set.
 */
const LANGS = process.env.POINTCOP_LANGS
  ? process.env.POINTCOP_LANGS.split(',').map((entry) => entry.trim()).filter(Boolean)
  : ALL_LANGS;

const PAGES = { index: landing, privacy, support };

/**
 * Reads one key out of a locale, following dots.
 *
 * Throws rather than falling back to English on a missing key. A silent
 * fallback is how a page ends up half-translated without anyone noticing, and
 * on the privacy page a half-translated promise is a legal problem.
 */
function translator(locale, lang) {
  return function translate(path) {
    let current = locale;
    for (const segment of path.split('.')) {
      if (current === null || current === undefined || !(segment in current)) {
        throw new Error('Missing key "' + path + '" in locale ' + lang + '.json');
      }
      current = current[segment];
    }
    return current;
  };
}

async function loadLocale(lang) {
  const raw = await readFile(join(ROOT, 'src', 'locales', lang + '.json'), 'utf8');
  return JSON.parse(raw);
}

/** Where a built page is written on disk. */
function outputPath(lang, name) {
  const dir = lang === 'en' ? OUT : join(OUT, lang);
  return join(dir, name === 'index' ? 'index.html' : name + '.html');
}

async function main() {
  const locales = {};
  for (const lang of LANGS) {
    locales[lang] = await loadLocale(lang);
  }

  /* Every language menu shows every language in its own words. */
  const labels = {};
  for (const lang of LANGS) {
    labels[lang] = locales[lang].langName;
  }

  let written = 0;
  for (const lang of LANGS) {
    const translate = translator(locales[lang], lang);
    for (const [name, template] of Object.entries(PAGES)) {
      const html = template({ t: translate, lang, page: name, labels });
      const target = outputPath(lang, name);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html, 'utf8');
      written += 1;
    }
  }

  await writeSitemap(LANGS);
  await writeRobots();

  console.log('Wrote ' + written + ' pages for ' + LANGS.length + ' languages.');
}

async function writeSitemap(langs) {
  const urls = [];
  for (const lang of langs) {
    for (const name of Object.keys(PAGES)) {
      urls.push('  <url><loc>' + SITE + pageUrl(lang, name) + '</loc></url>');
    }
  }
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(join(OUT, 'sitemap.xml'), xml, 'utf8');
}

async function writeRobots() {
  const text = ['User-agent: *', 'Allow: /', '', 'Sitemap: ' + SITE + '/sitemap.xml', ''].join('\n');
  await writeFile(join(OUT, 'robots.txt'), text, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
