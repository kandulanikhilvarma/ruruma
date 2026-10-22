export const CONTACT_EMAIL = 'kandulanikhilvarma@gmail.com';

const INDUSTRIES = {
  saas: {
    label: 'SaaS and technology',
    workflow: 'support questions and product signals',
    scope: 'a support queue with approved knowledge sources',
    integrations: ['Help desk', 'Product analytics', 'Approved knowledge base'],
    caution: 'Keep customer secrets out of prompts. Require approval before account changes or customer messages.',
  },
  commerce: {
    label: 'Commerce and retail',
    workflow: 'catalogue questions, orders, and returns',
    scope: 'one product category or returns queue',
    integrations: ['Commerce platform', 'Product catalogue', 'Order management system'],
    caution: 'Require a person to approve refunds, price changes, and outbound messages. Check every product claim against source data.',
  },
  professional: {
    label: 'Professional services',
    workflow: 'lead intake and document-heavy client work',
    scope: 'one intake or document review workflow',
    integrations: ['CRM', 'Document store', 'Email drafts'],
    caution: 'Protect confidential client data. A qualified person must approve client advice and external documents.',
  },
  manufacturing: {
    label: 'Manufacturing and industrial',
    workflow: 'inspection records, service requests, and operating data',
    scope: 'one part family or service queue',
    integrations: ['Inspection records', 'ERP or maintenance system', 'Approved technical documents'],
    caution: 'Keep the inspector responsible for the final decision. Do not use a pilot to control machinery or claim certification.',
  },
  finance: {
    label: 'Finance operations',
    workflow: 'document checks and review queues',
    scope: 'one internal document review queue',
    integrations: ['Approved document store', 'Review queue', 'Audit records'],
    caution: 'Keep access read-only during the pilot. A qualified person must approve decisions. Exclude payments and credit decisions.',
  },
  education: {
    label: 'Education and training',
    workflow: 'course questions and administrative requests',
    scope: 'one course knowledge base or administrative queue',
    integrations: ['Learning management system', 'Approved course content', 'Administrative queue'],
    caution: 'Exclude student identifiers unless access is approved. Keep grading and admissions decisions with qualified staff.',
  },
};

const GOALS = {
  revenue: {
    label: 'Grow revenue',
    title: 'A better-qualified opportunity pipeline',
    summary: 'Find where a useful answer or a faster handoff can remove friction before a sale.',
    metrics: ['Qualified opportunities from the selected workflow', 'Conversion rate against the baseline', 'Time to the first useful response', 'Cost per qualified opportunity'],
  },
  operations: {
    label: 'Improve operations',
    title: 'A reviewed workflow that saves manual effort',
    summary: 'Draft the repeatable work, route uncertain cases to a person, and keep the source evidence.',
    metrics: ['Manual minutes per completed task', 'Completion and rework rates', 'Human override rate', 'Cost per completed task'],
  },
  cost: {
    label: 'Reduce costs',
    title: 'A lower-cost workflow with quality checks',
    summary: 'Test simpler rules, retrieval, and smaller models against the same quality standard before wider use.',
    metrics: ['Total operating cost per completed task', 'Model and infrastructure spend', 'Quality against an agreed test set', 'Latency and retry rate'],
  },
};

const BUDGETS = {
  explore: 'Exploratory',
  under5k: 'Under USD 5,000',
  '5to15k': 'USD 5,000–15,000',
  '15kplus': 'USD 15,000+',
};

const FIELDS = ['industry', 'goal', 'company', 'name', 'email', 'challenge', 'tools', 'budget'];
const owns = (record, key) => Object.prototype.hasOwnProperty.call(record, key);
const count = (text) => Array.from(text).length;

function validEmail(email) {
  if (email.length > 254 || email.split('@').length !== 2) return false;
  const [local, domain] = email.split('@');
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/u.test(local)) return false;
  const labels = domain.split('.');
  return labels.length > 1 && labels.every((label) => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/u.test(label));
}

export function normalizeBrief(input = {}) {
  const record = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(FIELDS.map((field) => [
    field,
    typeof record[field] === 'string' ? record[field].replace(/\r\n?/g, '\n').trim() : '',
  ]));
}

export function validateBrief(input) {
  const value = normalizeBrief(input);
  const errors = {};

  if (!owns(INDUSTRIES, value.industry)) errors.industry = 'Choose an industry.';
  if (!owns(GOALS, value.goal)) errors.goal = 'Choose a business outcome.';
  if (!owns(BUDGETS, value.budget)) errors.budget = 'Choose a budget range.';

  if (count(value.company) < 2 || count(value.company) > 100) {
    errors.company = 'Enter a company name with 2 to 100 characters.';
  }
  if (count(value.name) > 80) errors.name = 'Use 80 characters or fewer for your name.';

  if (!validEmail(value.email)) {
    errors.email = 'Enter a valid email address with 254 characters or fewer.';
  }
  if (count(value.challenge) < 20 || count(value.challenge) > 1600) {
    errors.challenge = 'Describe the workflow in 20 to 1,600 characters.';
  }
  if (count(value.tools) > 300) errors.tools = 'Use 300 characters or fewer for your tools.';

  for (const field of ['company', 'name', 'email']) {
    if (/[\u0000-\u001f\u007f]/u.test(value[field])) errors[field] = 'Remove line breaks and control characters from this field.';
  }
  for (const field of ['challenge', 'tools']) {
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value[field])) {
      errors[field] = 'Remove control characters from this field.';
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function recommend(input = {}) {
  const value = normalizeBrief(input);
  const industry = INDUSTRIES[owns(INDUSTRIES, value.industry) ? value.industry : 'saas'];
  const goal = GOALS[owns(GOALS, value.goal) ? value.goal : 'operations'];
  return {
    title: goal.title,
    summary: `${goal.summary} Start with ${industry.workflow}.`,
    steps: [
      `Choose ${industry.scope}. Name the owner and the success measure.`,
      'Record the current time, cost, and quality before any change.',
      'Agree on permitted data, tool access, a cost limit, and a human approval step.',
      'Build a bounded pilot. Test normal cases, uncertain answers, and provider failures.',
      'Compare the pilot with the baseline. Expand only after the owner reviews the evidence.',
    ],
    metrics: [...goal.metrics],
    integrations: [...industry.integrations],
    caution: industry.caution,
  };
}

function checked(input) {
  const result = validateBrief(input);
  if (!result.ok) {
    const error = Object.assign(new TypeError('The project brief has invalid fields.'), { fields: result.errors });
    throw error;
  }
  return result.value;
}

export function buildBrief(input) {
  const value = checked(input);
  const plan = recommend(value);
  return [
    'RURUMA — PROJECT BRIEF',
    '',
    `Company: ${value.company}`,
    `Contact: ${value.name || 'Not supplied'}`,
    `Email: ${value.email}`,
    `Industry: ${INDUSTRIES[value.industry].label}`,
    `Primary outcome: ${GOALS[value.goal].label}`,
    `Visitor budget: ${BUDGETS[value.budget]}`,
    '',
    'THE WORKFLOW',
    value.challenge,
    '',
    'CURRENT TOOLS',
    value.tools || 'To discuss during discovery.',
    '',
    'SUGGESTED STARTING POINT',
    plan.title,
    plan.summary,
    '',
    'PILOT STEPS',
    ...plan.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    'MEASURES TO AGREE',
    ...plan.metrics.map((metric) => `- ${metric}`),
    '',
    'POSSIBLE INTEGRATIONS TO REVIEW',
    ...plan.integrations.map((integration) => `- ${integration}`),
    '',
    'REVIEW AND LIMITS',
    plan.caution,
    'This brief uses fixed planning rules. It is not an AI assessment, quote, or promise of results.',
    'The budget is a visitor constraint, not a Ruruma service price.',
    'No business tools are connected. Discovery must confirm access, scope, price, and data handling.',
    '',
    `Prepared for a conversation with Ruruma: ${CONTACT_EMAIL}`,
    'This file does not submit an inquiry. Send it through your email application when you are ready.',
  ].join('\n');
}

export function makeEmailUrl(input) {
  const value = checked(input);
  const subject = `Ruruma project inquiry — ${value.company}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBrief(value))}`;
}
