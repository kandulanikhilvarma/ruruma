import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('..', import.meta.url));
const pages = ['index.html', 'privacy.html', '404.html'];
const documents = new Map();
for (const page of pages) {
  const text = await readFile(join(root, page), 'utf8');
  const document = new JSDOM(text).window.document;
  documents.set(page, document);
  assert.ok(document.documentElement.lang, `${page} needs a language.`);
  assert.ok(document.querySelector('title')?.textContent?.trim(), `${page} needs a title.`);
  assert.ok(document.querySelector('meta[name="description"]')?.getAttribute('content'), `${page} needs a description.`);
  assert.ok(document.querySelector('meta[name="viewport"]'), `${page} needs a viewport.`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${page} needs one h1.`);
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length, `${page} contains duplicate IDs.`);
  if (page !== '404.html') {
    assert.ok(document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.startsWith('__SITE_URL__'), `${page} needs the site URL token in its canonical URL.`);
  } else {
    assert.ok(document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex'), 'The error page must not enter search indexes.');
  }
  assert.ok(!/lorem ipsum|TODO:|YOUR_API_KEY/i.test(text), `${page} contains temporary content.`);
  for (const image of document.querySelectorAll('img')) assert.ok(image.hasAttribute('alt'), `${page} has an image without alt text.`);
  for (const button of document.querySelectorAll('button')) {
    assert.ok(button.textContent?.trim() || button.getAttribute('aria-label'), `${page} has a button without a name.`);
  }
  for (const control of document.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
    assert.ok(control.labels?.length || control.getAttribute('aria-label') || control.getAttribute('aria-labelledby'), `${page} has a control without a label.`);
  }
}

for (const [page, document] of documents) {
  for (const element of document.querySelectorAll('[src], a[href], link[href]')) {
    const value = element.getAttribute('src') || element.getAttribute('href');
    if (element.getAttribute('target') === '_blank') assert.ok(element.getAttribute('rel')?.includes('noopener'), `${page} needs noopener for an external tab.`);
    if (!value || /^(?:https:|mailto:|data:|__SITE_URL__)/.test(value)) continue;
    assert.ok(!/^(?:javascript|http|file):/i.test(value), `${page} has an unsafe URL.`);
    if (value === '#') continue;
    if (value.startsWith('#')) {
      assert.ok(document.getElementById(decodeURIComponent(value.slice(1))), `${page} has a broken anchor: ${value}`);
      continue;
    }
    const path = value.split(/[?#]/)[0];
    if (!path || path === '/') continue;
    const filename = path.replace(/^\//, '');
    const target = extname(filename) ? filename : `${filename.replace(/\/$/, '')}.html`;
    await access(join(root, target));
  }
}

async function syntax(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await syntax(path);
    else if (entry.name.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      assert.equal(result.status, 0, `${relative(root, path)} has a syntax error: ${result.stderr}`);
    }
  }
}
for (const directory of ['src', 'scripts', 'tests']) await syntax(join(root, directory));
JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
JSON.parse(await readFile(join(root, 'jsconfig.json'), 'utf8'));
console.log('Static pages, labels, anchors, local resources, metadata, and JavaScript syntax passed.');
