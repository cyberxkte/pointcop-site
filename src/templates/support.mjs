/*
 * Support / FAQ.
 *
 * This page is one of the two the stores require, and it is the one a reviewer
 * opens when something in the app does not behave. Everything here is a real
 * answer to a real failure, not a contact form.
 */

import { esc, page, rel, CONTACT } from '../layout.mjs';

export default function support(ctx) {
  const { t, lang } = ctx;

  const questions = t('support.questions')
    .map((question) => {
      const body = question.body ? '      <p>' + esc(question.body) + '</p>' : '';
      const list = question.list
        ? '      <ul>' +
          question.list.map((entry) => '<li>' + esc(entry) + '</li>').join('') +
          '</ul>'
        : '';
      // The watch questions get the amber callout: a watch that will not pair
      // is the failure users actually hit, and the answer is a setup step
      // rather than a bug.
      const cls = question.callout ? 'qa callout' : 'qa';
      return ['    <div class="' + cls + '">', '      <h2>' + esc(question.heading) + '</h2>', body, list, '    </div>']
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const main = [
    '<section>',
    '  <div class="wrap doc">',
    '    <p class="eyebrow">' + esc(t('nav.support')) + '</p>',
    '    <h1>' + esc(t('support.heading')) + '</h1>',
    '    <p class="lead">' + esc(t('support.intro')) + '</p>',
    '  </div>',
    '</section>',
    '',
    '<section class="tight-top">',
    '  <div class="wrap doc">',
    questions,
    '  </div>',
    '</section>',
    '',
    '<section class="band">',
    '  <div class="wrap doc">',
    '    <h2>' + esc(t('support.contactHeading')) + '</h2>',
    '    <p class="lead">' + esc(t('support.contactBody')) + '</p>',
    '    <a class="btn" href="mailto:' + CONTACT + '">' + CONTACT + '</a>',
    '  </div>',
    '</section>',
    '',
    '<section>',
    '  <div class="wrap doc">',
    '    <div class="page-nav">',
    '      <a href="' + rel(lang, 'support', 'index') + '">' + esc(t('nav.home')) + '</a>',
    '      <a href="' + rel(lang, 'support', 'privacy') + '">' + esc(t('nav.privacy')) + '</a>',
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');

  return page(ctx, main);
}
