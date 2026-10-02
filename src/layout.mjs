/*
 * The shell every page shares: head, header, footer.
 *
 * There is one of each, for every language. A page template supplies its own
 * <main>; everything around it comes from here, so a change to the footer or
 * the language menu happens once.
 */

/*
 * The two constants below are the only things on this site that are not yet
 * real. Both stores reject a listing whose privacy URL 404s, and Apple has
 * been known to mail the support address during review, so SET THESE BEFORE
 * THE FIRST SUBMISSION:
 *
 *   SITE     where the built pages are served from. A GitHub Pages project
 *            site works ("https://<user>.github.io/pointcop-site"); an owned
 *            domain is better, and then site/CNAME must carry it too.
 *   CONTACT  an address that receives mail. A forwarder is fine. A bouncing
 *            mailbox is worse than no mailbox.
 */
export const SITE = 'https://cyberxkte.github.io/pointcop-site';
export const CONTACT = 'support@afinora.app';

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.pointcop';

/*
 * No country code and no name slug on purpose: a regional link shows "not
 * available in your country" to everyone outside it, and a slug taken from the
 * app's name breaks the day the name changes. The bare id lets Apple send each
 * visitor to their own storefront.
 */
export const APPLE_URL = 'https://apps.apple.com/app/id6818139139';

/** The order of the language menu. English first, because English is the root. */
export const ALL_LANGS = ['en', 'es', 'it', 'fr', 'pt', 'de', 'ja', 'zh', 'ru'];

const LANG_NAMES = {
  en: 'English',
  es: 'Espanol',
  it: 'Italiano',
  fr: 'Francais',
  pt: 'Portugues',
  de: 'Deutsch',
  ja: 'Nihongo',
  zh: 'Zhongwen',
  ru: 'Russkiy',
};

/*
 * The menu labels above are deliberately plain ASCII: they are overwritten at
 * build time from each locale's own "langName", so the Japanese entry says
 * what Japanese readers call Japanese rather than a romanisation.
 */
export function langLabel(lang, labels) {
  return (labels && labels[lang]) || LANG_NAMES[lang] || lang;
}

/** Escape for HTML text and double-quoted attributes. */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The mark, inlined so it paints with the first frame and costs no request.
 *
 * A padel court seen from above - the two halves the app splits the screen
 * into - with the net across it and the ball above the serve.
 */
export const MARK = [
  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
  '  <rect x="14" y="8" width="72" height="84" rx="6" fill="none" stroke="currentColor" stroke-width="7"/>',
  '  <path d="M14 50 L86 50" fill="none" stroke="currentColor" stroke-width="7"/>',
  '  <path d="M28 27 L72 27 M28 73 L72 73" fill="none" stroke="currentColor" stroke-width="4" opacity="0.5"/>',
  '  <circle cx="50" cy="31" r="7" fill="#FFD000" stroke="currentColor" stroke-width="3"/>',
  '</svg>',
].join('\n');

/** Where a page lives for a given language. English sits at the root. */
export function pageUrl(lang, page) {
  const dir = lang === 'en' ? '' : lang + '/';
  return page === 'index' ? '/' + dir : '/' + dir + page + '.html';
}

/**
 * A link from one page to another, as a path relative to the page doing the
 * linking. Relative on purpose: the same build then works at the root of a
 * domain and inside a GitHub Pages project path, which is what lets the site
 * go up before the domain is bought.
 */
export function rel(fromLang, fromPage, toPage) {
  void fromPage;
  if (toPage === 'index') {
    return fromLang === 'en' ? './' : '../';
  }
  return './' + toPage + '.html';
}

/** The same URL, but marked as a deliberate choice of language. */
export function chosenLangUrl(lang, page) {
  return pageUrl(lang, page) + '?hl=' + lang;
}

/**
 * Sends a first-time visitor to their own language, once, from the root only.
 *
 * Runs inline and synchronously in <head> so the English page never paints
 * before the redirect. Deliberately narrow:
 *
 *  - privacy.html and support.html redirect no one. They are the URLs both
 *    stores have on file, and a reviewer opening one must land on exactly it.
 *  - A reader who picks a language is obeyed from then on, via ?hl= and a
 *    remembered flag; otherwise the English link would bounce a Spanish
 *    browser straight back to /es/.
 *  - Crawlers are left alone. Google asks for hreflang, not for redirects.
 *  - replace(), not assign(), so Back leaves the site instead of ping-ponging.
 */
function redirectScript(lang, page) {
  const langs = JSON.stringify(ALL_LANGS);
  const isRoot = lang === 'en' && page === 'index';
  const redirect = isRoot
    ? [
      'if(/bot|crawl|spider|slurp|bingpreview/i.test(navigator.userAgent))return;',
      'var saved=null;try{saved=localStorage.getItem(K)}catch(e){}',
      'var want=saved||(navigator.language||"en").slice(0,2).toLowerCase();',
      'if(L.indexOf(want)>-1&&want!=="en")location.replace("./"+want+"/");',
    ].join('')
    : '';

  return [
    '<script>(function(){try{',
    'var L=' + langs + ',K="pointcop-lang";',
    'var q=new URLSearchParams(location.search).get("hl");',
    'if(q&&L.indexOf(q)>-1){try{localStorage.setItem(K,q)}catch(e){}return}',
    redirect,
    '}catch(e){}})()</script>',
  ].join('');
}

/** hreflang tells Google the other eight versions exist, instead of guessing. */
function alternates(page) {
  const links = ALL_LANGS.map(
    (l) => '<link rel="alternate" hreflang="' + l + '" href="' + SITE + pageUrl(l, page) + '">',
  );
  links.push('<link rel="alternate" hreflang="x-default" href="' + SITE + pageUrl('en', page) + '">');
  return links.join('\n  ');
}

function header(ctx) {
  const { t, lang, page, labels } = ctx;
  const menu = ALL_LANGS.map((l) => {
    if (l === lang) {
      return '<li><span aria-current="true">' + esc(langLabel(l, labels)) + '</span></li>';
    }
    return (
      '<li><a href="' + SITE + chosenLangUrl(l, page) + '" hreflang="' + l + '" lang="' + l + '">' +
      esc(langLabel(l, labels)) +
      '</a></li>'
    );
  }).join('');

  return [
    '<header class="site-head">',
    '  <div class="wrap head-row">',
    '    <a class="brand" href="' + rel(lang, page, 'index') + '">',
    '      <span class="brand-mark">' + MARK + '</span>',
    '      <span class="brand-name">PointCop</span>',
    '    </a>',
    '    <nav class="head-nav" aria-label="' + esc(t('nav.label')) + '">',
    '      <a href="' + rel(lang, page, 'support') + '">' + esc(t('nav.support')) + '</a>',
    '      <a href="' + rel(lang, page, 'privacy') + '">' + esc(t('nav.privacy')) + '</a>',
    '      <details class="lang">',
    '        <summary>' + esc(langLabel(lang, labels)) + '</summary>',
    '        <ul>' + menu + '</ul>',
    '      </details>',
    '    </nav>',
    '  </div>',
    '</header>',
  ].join('\n');
}

function footer(ctx) {
  const { t, lang, page } = ctx;
  return [
    '<footer class="site-foot">',
    '  <div class="wrap foot-row">',
    '    <p class="fine">' + esc(t('footer.tagline')) + '</p>',
    '    <nav aria-label="' + esc(t('footer.label')) + '">',
    '      <a href="' + rel(lang, page, 'index') + '">' + esc(t('nav.home')) + '</a>',
    '      <a href="' + rel(lang, page, 'support') + '">' + esc(t('nav.support')) + '</a>',
    '      <a href="' + rel(lang, page, 'privacy') + '">' + esc(t('nav.privacy')) + '</a>',
    '    </nav>',
    '  </div>',
    '</footer>',
  ].join('\n');
}

/** Wraps a page's <main> in the document every page shares. */
export function page(ctx, main) {
  const { t, lang, page: name } = ctx;
  const key = name === 'index' ? 'landing' : name;
  const title = t(key + '.title');
  const description = t(key + '.description');
  const cssHref = lang === 'en' ? './assets/css/site.css' : '../assets/css/site.css';
  const iconHref = lang === 'en' ? './brand/icon.svg' : '../brand/icon.svg';

  return [
    '<!doctype html>',
    '<html lang="' + lang + '">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <title>' + esc(title) + '</title>',
    '  <meta name="description" content="' + esc(description) + '">',
    '  <link rel="canonical" href="' + SITE + pageUrl(lang, name) + '">',
    '  ' + alternates(name),
    '  <meta property="og:title" content="' + esc(title) + '">',
    '  <meta property="og:description" content="' + esc(description) + '">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:url" content="' + SITE + pageUrl(lang, name) + '">',
    '  <meta name="theme-color" content="#0E1013">',
    '  <link rel="icon" href="' + iconHref + '" type="image/svg+xml">',
    '  <link rel="stylesheet" href="' + cssHref + '">',
    '  ' + redirectScript(lang, name),
    '</head>',
    '<body>',
    header(ctx),
    '<main>',
    main,
    '</main>',
    footer(ctx),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
