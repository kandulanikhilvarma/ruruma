import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const storageKey = 'ruruma-project-brief-v1';
const fixture = {
  company: 'Isolated test company',
  name: 'Test visitor',
  email: 'visitor@example.com',
  industry: 'commerce',
  goal: 'operations',
  challenge: 'Our team manually reviews every return and needs a clear review queue.',
  tools: 'A test catalogue and shared inbox',
  budget: 'explore',
};
let sequence = 0;
let active;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
}

async function loadApp({ storage = memoryStorage(), copy = async () => {} } = {}) {
  active?.close();
  const dom = new JSDOM(html, { url: 'https://ruruma.test/', pretendToBeVisual: true });
  const previous = new Map();
  const requests = [];
  const noRemoteRequest = (...args) => {
    requests.push(args);
    throw new Error('Remote requests are not allowed in this isolated test.');
  };
  const replacements = {
    window: dom.window,
    document: dom.window.document,
    localStorage: storage,
    navigator: { clipboard: { writeText: copy } },
    fetch: noRemoteRequest,
  };
  for (const [name, value] of Object.entries(replacements)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  dom.window.fetch = noRemoteRequest;
  active = {
    storage,
    requests,
    window: dom.window,
    document: dom.window.document,
    element: (id) => dom.window.document.getElementById(id),
    fill(values = fixture) {
      for (const [name, value] of Object.entries(values)) this.element(name).value = value;
    },
    input(id) { this.element(id).dispatchEvent(new dom.window.Event('input', { bubbles: true })); },
    submit() { this.element('brief-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); },
    chooseSave(checked) {
      this.element('save-draft').checked = checked;
      this.element('save-draft').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    },
    close() {
      dom.window.close();
      for (const [name, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
      if (active === this) active = undefined;
    },
  };
  const module = new URL('../src/app.mjs', import.meta.url);
  module.searchParams.set('isolated-test', String(++sequence));
  await import(module.href);
  return active;
}

afterEach(() => active?.close());

test('invalid submission exposes field errors and focuses the error summary', async () => {
  const app = await loadApp();
  app.submit();
  assert.equal(app.element('error-summary').hidden, false);
  assert.equal(app.document.activeElement.id, 'error-summary');
  for (const field of ['company', 'email', 'challenge']) {
    assert.equal(app.element(field).getAttribute('aria-invalid'), 'true');
    assert.ok(app.element(`${field}-error`).textContent.length > 0);
    assert.ok(app.element(field).getAttribute('aria-describedby').includes(`${field}-error`));
  }
  assert.equal(app.element('brief-result').hidden, true);
  assert.equal(app.element('brief-form').hidden, false);
  app.fill();
  app.input('company');
  assert.equal(app.element('error-summary').hidden, true);
  assert.equal(app.element('company').hasAttribute('aria-invalid'), false);
});

test('valid submission creates a local brief and an encoded email draft without persistence', async () => {
  const app = await loadApp();
  app.fill({ ...fixture, company: 'Test <company> & partners' });
  app.submit();
  assert.equal(app.element('brief-result').hidden, false);
  assert.equal(app.element('brief-form').hidden, true);
  assert.equal(app.document.activeElement.id, 'brief-result');
  assert.match(app.element('brief-preview').textContent, /Test <company> & partners/);
  assert.equal(app.element('brief-preview').querySelector('company'), null);
  assert.match(app.element('brief-preview').textContent, /does not submit an inquiry/);
  const url = app.element('email-brief').getAttribute('href');
  assert.ok(url.startsWith('mailto:kandulanikhilvarma@gmail.com?subject='));
  const query = new URLSearchParams(url.split('?')[1]);
  assert.equal(query.get('body'), app.element('brief-preview').textContent);
  assert.equal(app.storage.getItem(storageKey), null);
  assert.equal(app.element('brief-form').querySelector('[type="submit"]').disabled, false);
  assert.equal(app.element('brief-form').hasAttribute('aria-busy'), false);
  assert.deepEqual(app.requests, []);
  app.element('edit-brief').click();
  assert.equal(app.element('brief-form').hidden, false);
  assert.equal(app.element('brief-result').hidden, true);
  assert.equal(app.document.activeElement.id, 'company');
});

test('draft storage needs opt-in and restores values in a fresh document', async () => {
  const storage = memoryStorage();
  let app = await loadApp({ storage });
  app.fill();
  app.input('company');
  assert.equal(storage.getItem(storageKey), null);
  app.chooseSave(true);
  const saved = JSON.parse(storage.getItem(storageKey));
  assert.equal(saved.version, 1);
  assert.equal(saved.value.challenge, fixture.challenge);
  app.element('company').value = 'Edited saved company';
  app.input('company');
  app = await loadApp({ storage });
  assert.equal(app.element('company').value, 'Edited saved company');
  assert.equal(app.element('email').value, fixture.email);
  assert.equal(app.element('save-draft').checked, true);
  assert.match(app.element('draft-status').textContent, /restored/);
  app.chooseSave(false);
  assert.equal(storage.getItem(storageKey), null);
  assert.equal(app.element('company').value, 'Edited saved company');
});

test('clear draft removes stored values, resets the form, and permits a new brief', async () => {
  const app = await loadApp();
  app.fill();
  app.chooseSave(true);
  app.element('clear-draft').click();
  assert.equal(app.storage.getItem(storageKey), null);
  for (const name of ['company', 'name', 'email', 'challenge', 'tools']) assert.equal(app.element(name).value, '');
  assert.equal(app.element('save-draft').checked, false);
  assert.equal(app.document.activeElement.id, 'company');
  assert.equal(app.element('error-summary').hidden, true);
  app.fill();
  app.submit();
  assert.equal(app.element('brief-result').hidden, false);
});

test('denied storage exposes recovery text without blocking a valid brief', async () => {
  const deny = () => { throw new Error('Storage denied in isolated test.'); };
  const app = await loadApp({ storage: { getItem: deny, setItem: deny, removeItem: deny } });
  assert.match(app.element('draft-status').textContent, /cannot restore/);
  app.fill();
  app.chooseSave(true);
  assert.match(app.element('draft-status').textContent, /cannot save/);
  app.submit();
  assert.equal(app.element('brief-result').hidden, false);
  app.element('edit-brief').click();
  app.element('clear-draft').click();
  assert.match(app.element('draft-status').textContent, /cannot remove saved data/);
});

test('expired and incompatible drafts are discarded before form recovery', async () => {
  for (const draft of [
    { version: 1, at: Date.now() - 31 * 24 * 60 * 60 * 1000, value: fixture },
    { version: 2, at: Date.now(), value: fixture },
    { version: 1, at: Date.now() + 100000, value: fixture },
    { version: 1, at: 'wrong type', value: fixture },
  ]) {
    const storage = memoryStorage({ [storageKey]: JSON.stringify(draft) });
    const app = await loadApp({ storage });
    assert.equal(storage.getItem(storageKey), null);
    assert.equal(app.element('company').value, '');
    assert.equal(app.element('save-draft').checked, false);
    assert.equal(app.document.querySelector('.brief-tool').hidden, false);
  }
});

test('malformed saved JSON leaves a usable blank form and permits replacement', async () => {
  const app = await loadApp({ storage: memoryStorage({ [storageKey]: '{bad json' }) });
  assert.match(app.element('draft-status').textContent, /cannot restore/);
  assert.equal(app.element('company').value, '');
  app.fill();
  app.chooseSave(true);
  assert.equal(JSON.parse(app.storage.getItem(storageKey)).value.company, fixture.company);
  app.submit();
  assert.equal(app.element('brief-result').hidden, false);
});

test('clipboard rejection selects the brief and explains the manual copy recovery', async () => {
  const app = await loadApp({ copy: async () => { throw new Error('Clipboard denied in isolated test.'); } });
  app.fill();
  app.submit();
  app.element('copy-brief').click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(app.element('export-status').textContent, /blocked clipboard access/);
  assert.match(app.element('export-status').textContent, /Copy command/);
  assert.equal(app.window.getSelection().toString(), app.element('brief-preview').textContent);
  assert.deepEqual(app.requests, []);
});

test('industry and goal controls update the plan and transfer it to the brief without remote calls', async () => {
  const app = await loadApp();
  app.document.querySelector('[data-industry="finance"]').click();
  app.document.querySelector('[data-goal="cost"]').click();
  assert.match(app.element('solution-caution').textContent, /Exclude payments and credit decisions/);
  assert.equal(app.document.querySelector('[data-goal="cost"]').getAttribute('aria-pressed'), 'true');
  app.element('use-plan').click();
  assert.equal(app.element('industry').value, 'finance');
  assert.equal(app.element('goal').value, 'cost');
  assert.deepEqual(app.requests, []);
});
