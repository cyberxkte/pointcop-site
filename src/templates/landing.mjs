/*
 * The landing page.
 *
 * It exists for two readers: someone who heard about the app and wants to know
 * what it does before installing, and a store reviewer checking that the thing
 * being submitted is the thing described. So it claims only what ships: the
 * phone keeps score, the watch is a remote, nothing leaves the device.
 */

import { esc, page, rel, PLAY_URL, APPLE_URL } from '../layout.mjs';

export default function landing(ctx) {
  const { t, lang } = ctx;

  const features = t('landing.features')
    .map((feature) => [
      '      <article class="card">',
      '        <h3>' + esc(feature.heading) + '</h3>',
      '        <p>' + esc(feature.body) + '</p>',
      '      </article>',
    ].join('\n'))
    .join('\n');

  const steps = t('landing.steps')
    .map((step, index) => [
      '      <li>',
      '        <span class="step-n">' + (index + 1) + '</span>',
      '        <p>' + esc(step) + '</p>',
      '      </li>',
    ].join('\n'))
    .join('\n');

  const formats = t('landing.formats.items')
    .map((item) => '      <li>' + esc(item) + '</li>')
    .join('\n');

  const main = [
    '<section class="hero">',
    '  <div class="wrap">',
    '    <p class="eyebrow">' + esc(t('landing.eyebrow')) + '</p>',
    '    <h1>' + esc(t('landing.heading')) + '</h1>',
    '    <p class="lead">' + esc(t('landing.lead')) + '</p>',
    '    <div class="cta">',
    '      <a class="btn" href="' + PLAY_URL + '">' + esc(t('landing.ctaPlay')) + '</a>',
    '      <a class="btn btn-ghost" href="' + APPLE_URL + '">' + esc(t('landing.ctaApple')) + '</a>',
    '    </div>',
    '    <p class="fine">' + esc(t('landing.ctaNote')) + '</p>',
    '  </div>',
    '</section>',
    '',
    '<section>',
    '  <div class="wrap">',
    '    <h2>' + esc(t('landing.featuresHeading')) + '</h2>',
    '    <div class="cards">',
    features,
    '    </div>',
    '  </div>',
    '</section>',
    '',
    '<section class="band">',
    '  <div class="wrap">',
    '    <h2>' + esc(t('landing.stepsHeading')) + '</h2>',
    '    <ol class="steps">',
    steps,
    '    </ol>',
    '  </div>',
    '</section>',
    '',
    '<section>',
    '  <div class="wrap doc-narrow">',
    '    <h2>' + esc(t('landing.formats.heading')) + '</h2>',
    '    <p class="lead">' + esc(t('landing.formats.body')) + '</p>',
    '    <ul class="ticks">',
    formats,
    '    </ul>',
    '  </div>',
    '</section>',
    '',
    '<section class="band">',
    '  <div class="wrap doc-narrow">',
    '    <h2>' + esc(t('landing.privacyHeading')) + '</h2>',
    '    <p class="lead">' + esc(t('landing.privacyBody')) + '</p>',
    '    <div class="page-nav">',
    '      <a href="' + rel(lang, 'index', 'privacy') + '">' + esc(t('nav.privacy')) + '</a>',
    '      <a href="' + rel(lang, 'index', 'support') + '">' + esc(t('nav.support')) + '</a>',
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');

  return page(ctx, main);
}
