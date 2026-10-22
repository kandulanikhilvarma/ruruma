import { validateBrief, recommend, buildBrief, makeEmailUrl } from './brief.mjs';

/** @param {string} id */
function element(id) {
  const found = document.getElementById(id);
  if (!found) throw new Error(`The page element ${id} is absent.`);
  return found;
}

const form = /** @type {HTMLFormElement} */ (element('brief-form'));
const saveChoice = /** @type {HTMLInputElement} */ (element('save-draft'));
const submitButton = /** @type {HTMLButtonElement} */ (form.querySelector('[type="submit"]'));
const result = element('brief-result');
const errorSummary = element('error-summary');
const draftStatus = element('draft-status');
const storageKey = 'ruruma-project-brief-v1';
const fields = ['company', 'name', 'email', 'industry', 'goal', 'challenge', 'tools', 'budget'];
let chosenIndustry = 'saas';
let chosenGoal = 'revenue';
let submitted = false;
let currentBrief = '';
let currentCompany = '';

/** @param {string} name */
function field(name) {
  return /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} */ (element(name));
}

function readForm() {
  return Object.fromEntries(fields.map(name => [name, field(name).value]));
}

function populateForm(value) {
  for (const name of fields) {
    if (typeof value[name] === 'string') field(name).value = value[name];
  }
}

function saveDraft() {
  if (!saveChoice.checked) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, at: Date.now(), value: readForm() }));
    draftStatus.textContent = 'Draft saved on this device. It expires after 30 days.';
  } catch {
    draftStatus.textContent = 'This browser cannot save your draft. Keep this tab open, or download the completed brief.';
  }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const draft = JSON.parse(raw);
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (draft.version !== 1 || typeof draft.at !== 'number' || draft.at > Date.now() || Date.now() - draft.at > maxAge || !draft.value || typeof draft.value !== 'object') {
      localStorage.removeItem(storageKey);
      return;
    }
    const safeValue = validateBrief(draft.value).value;
    populateForm(safeValue);
    saveChoice.checked = true;
    draftStatus.textContent = 'Your saved draft is restored. You can edit it or clear it below.';
  } catch {
    draftStatus.textContent = 'This browser cannot restore a saved draft. You can create a new brief here.';
  }
}

function removeSavedDraft() {
  try {
    localStorage.removeItem(storageKey);
    draftStatus.textContent = 'Your draft is not saved on this device.';
  } catch {
    draftStatus.textContent = 'The browser cannot remove saved data. Clear site data in your browser settings.';
  }
}

function renderErrors(errors) {
  const list = /** @type {HTMLUListElement} */ (errorSummary.querySelector('ul'));
  list.replaceChildren();
  for (const name of fields) {
    const control = field(name);
    const message = errors[name] || '';
    element(`${name}-error`).textContent = message;
    const descriptions = [];
    const hint = control.parentElement?.querySelector('.field-hint');
    if (hint) {
      hint.id ||= `${name}-hint`;
      descriptions.push(hint.id);
    }
    if (message) {
      control.setAttribute('aria-invalid', 'true');
      descriptions.push(`${name}-error`);
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${name}`;
      link.textContent = message;
      item.append(link);
      list.append(item);
    } else {
      control.removeAttribute('aria-invalid');
    }
    if (descriptions.length) control.setAttribute('aria-describedby', descriptions.join(' '));
    else control.removeAttribute('aria-describedby');
  }
  errorSummary.hidden = Object.keys(errors).length === 0;
}

function renderSolution() {
  const plan = recommend({ industry: chosenIndustry, goal: chosenGoal });
  element('solution-name').textContent = plan.title;
  element('solution-summary').textContent = plan.summary;
  element('solution-metrics').textContent = plan.metrics.join(' · ');
  element('solution-integrations').textContent = plan.integrations.join(' · ');
  element('solution-caution').textContent = plan.caution;
  const steps = element('solution-steps');
  steps.replaceChildren();
  for (const step of plan.steps) {
    const li = document.createElement('li');
    li.textContent = step;
    steps.append(li);
  }
  document.querySelectorAll('[data-goal]').forEach(button => {
    const selected = button.getAttribute('data-goal') === chosenGoal;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('active', selected);
  });
  document.querySelectorAll('[data-industry]').forEach(button => {
    const selected = button.getAttribute('data-industry') === chosenIndustry;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('active', selected);
  });
}

document.querySelectorAll('[data-goal]').forEach(button => button.addEventListener('click', () => {
  chosenGoal = button.getAttribute('data-goal') || 'revenue';
  renderSolution();
}));
document.querySelectorAll('[data-industry]').forEach(button => button.addEventListener('click', () => {
  chosenIndustry = button.getAttribute('data-industry') || 'saas';
  renderSolution();
}));
document.querySelectorAll('[data-goal-link]').forEach(link => link.addEventListener('click', () => {
  chosenGoal = link.getAttribute('data-goal-link') || 'revenue';
  renderSolution();
}));
element('use-plan').addEventListener('click', () => {
  field('industry').value = chosenIndustry;
  field('goal').value = chosenGoal;
  if (!result.hidden) {
    result.hidden = true;
    form.hidden = false;
  }
  saveDraft();
});

saveChoice.addEventListener('change', () => {
  if (saveChoice.checked) saveDraft();
  else removeSavedDraft();
});
form.addEventListener('input', () => {
  if (submitted) renderErrors(validateBrief(readForm()).errors);
  saveDraft();
});
form.addEventListener('change', saveDraft);
element('clear-draft').addEventListener('click', () => {
  form.reset();
  saveChoice.checked = false;
  submitted = false;
  currentBrief = '';
  currentCompany = '';
  renderErrors({});
  removeSavedDraft();
  field('company').focus();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  submitted = true;
  const checked = validateBrief(readForm());
  renderErrors(checked.errors);
  if (!checked.ok) {
    errorSummary.focus();
    return;
  }
  const buttonContents = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Create brief…';
  form.setAttribute('aria-busy', 'true');
  try {
    currentBrief = buildBrief(checked.value);
    currentCompany = checked.value.company;
    element('brief-preview').textContent = currentBrief;
    element('brief-result-title').textContent = recommend(checked.value).title;
    /** @type {HTMLAnchorElement} */ (element('email-brief')).href = makeEmailUrl(checked.value);
    saveDraft();
    form.hidden = true;
    result.hidden = false;
    result.focus();
  } catch {
    draftStatus.textContent = 'The brief could not be created. Try again, or email the founder directly.';
    draftStatus.focus();
  } finally {
    submitButton.innerHTML = buttonContents;
    submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
});

element('edit-brief').addEventListener('click', () => {
  form.hidden = false;
  result.hidden = true;
  element('export-status').textContent = '';
  field('company').focus();
});
element('download-brief').addEventListener('click', () => {
  if (!currentBrief) return;
  try {
    const url = URL.createObjectURL(new Blob([currentBrief], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    const name = currentCompany.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'project';
    anchor.href = url;
    anchor.download = `ruruma-${name.toLowerCase()}-brief.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    element('export-status').textContent = 'Download requested. Check your browser downloads. Your brief has not been sent.';
  } catch {
    element('export-status').textContent = 'The browser could not download the file. Use Copy brief text, or select the text above.';
  }
});
element('copy-brief').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentBrief);
    element('export-status').textContent = 'Brief copied. Paste it into your email and review it before you send it.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(element('brief-preview'));
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    element('export-status').textContent = 'The browser blocked clipboard access. The brief text is selected. Use your device’s Copy command.';
  }
});

const header = document.querySelector('.site-header');
const menu = /** @type {HTMLButtonElement | null} */ (document.querySelector('.menu-toggle'));
if (header && menu) {
  header.classList.add('menu-ready');
  menu.hidden = false;
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    header.classList.toggle('menu-open', open);
  });
  element('navigation').querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      header.classList.remove('menu-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
}

renderErrors({});
restoreDraft();
renderSolution();
/** @type {HTMLElement} */ (document.querySelector('.solution-explorer')).hidden = false;
/** @type {HTMLElement} */ (document.querySelector('.brief-tool')).hidden = false;
