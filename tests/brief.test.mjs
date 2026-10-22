import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_EMAIL, normalizeBrief, validateBrief, recommend, buildBrief, makeEmailUrl } from '../src/brief.mjs';

const valid = {
  industry: 'commerce',
  goal: 'operations',
  company: 'Example business',
  name: 'A visitor',
  email: 'visitor@example.com',
  challenge: 'Our team reviews every returns request manually.',
  tools: 'Commerce platform and a shared inbox',
  budget: 'explore',
};

test('normalization trims every field and keeps multiline challenge text', () => {
  const input = Object.fromEntries(Object.entries(valid).map(([key, value]) => [key, `  ${value}  `]));
  input.challenge = '  Our return workflow\r\nneeds a review.\rPlease help.  ';
  const result = normalizeBrief(input);
  assert.equal(result.company, valid.company);
  assert.equal(result.challenge, 'Our return workflow\nneeds a review.\nPlease help.');
  assert.equal(input.company, `  ${valid.company}  `);
  assert.deepEqual(normalizeBrief(null), normalizeBrief());
  assert.equal(normalizeBrief({ company: { unsafe: true } }).company, '');
});

test('valid input returns normalized values and no errors', () => {
  const result = validateBrief(valid);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.value, valid);
});

test('empty input reports all required fields and permits optional fields', () => {
  const result = validateBrief({});
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['budget', 'challenge', 'company', 'email', 'goal', 'industry']);
  assert.equal(validateBrief({ ...valid, name: '', tools: '' }).ok, true);
});

test('selection allowlists reject unknown values and prototype properties', () => {
  for (const field of ['industry', 'goal', 'budget']) {
    for (const invalid of ['anything', '__proto__', 'constructor', 'toString', '']) {
      const result = validateBrief({ ...valid, [field]: invalid });
      assert.equal(result.ok, false);
      assert.ok(result.errors[field]);
    }
  }
});

test('text limits accept exact boundaries and reject values outside them', () => {
  for (const [field, minimum, maximum] of [['company', 2, 100], ['challenge', 20, 1600]]) {
    assert.equal(validateBrief({ ...valid, [field]: 'a'.repeat(minimum) }).ok, true);
    assert.equal(validateBrief({ ...valid, [field]: 'a'.repeat(maximum) }).ok, true);
    assert.ok(validateBrief({ ...valid, [field]: 'a'.repeat(minimum - 1) }).errors[field]);
    assert.ok(validateBrief({ ...valid, [field]: 'a'.repeat(maximum + 1) }).errors[field]);
  }
  for (const [field, maximum] of [['name', 80], ['tools', 300]]) {
    assert.equal(validateBrief({ ...valid, [field]: 'a'.repeat(maximum) }).ok, true);
    assert.ok(validateBrief({ ...valid, [field]: 'a'.repeat(maximum + 1) }).errors[field]);
  }
});

test('Unicode characters survive validation and exports without splitting surrogate pairs', () => {
  const input = { ...valid, company: 'రురుమ', name: '山田 ✨', challenge: '💡'.repeat(20) };
  assert.equal(validateBrief(input).ok, true);
  assert.ok(buildBrief(input).includes('రురుమ'));
  assert.ok(buildBrief(input).includes('山田 ✨'));
  assert.equal(validateBrief({ ...valid, name: '💡'.repeat(80) }).ok, true);
  assert.ok(validateBrief({ ...valid, name: '💡'.repeat(81) }).errors.name);
  assert.ok(validateBrief({ ...valid, challenge: '💡'.repeat(19) }).errors.challenge);
});

test('email validation rejects malformed, multiline, and overlong addresses', () => {
  for (const email of ['', 'person', '@example.com', 'a@host', 'a@.com', 'a@b..com', '.a@example.com', 'a..b@example.com', 'a@-host.com', 'a@host-.com', '<a>@example.com', 'a b@example.com', 'a@example.com\nBcc: bad@example.com']) {
    assert.ok(validateBrief({ ...valid, email }).errors.email);
  }
  const boundary = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
  assert.equal(boundary.length, 254);
  assert.equal(validateBrief({ ...valid, email: boundary }).ok, true);
  assert.ok(validateBrief({ ...valid, email: `a${boundary}` }).errors.email);
  assert.equal(validateBrief({ ...valid, email: 'name+pilot@example.co.uk' }).ok, true);
});

test('control characters fail validation but challenge line breaks remain valid', () => {
  for (const field of ['company', 'name', 'email', 'challenge', 'tools']) {
    assert.ok(validateBrief({ ...valid, [field]: `${valid[field]}\u0000` }).errors[field]);
  }
  assert.ok(validateBrief({ ...valid, company: 'Company\nBcc: other' }).errors.company);
  assert.equal(validateBrief({ ...valid, challenge: 'Review this long workflow.\nKeep the useful context.' }).ok, true);
});

test('recommendations cover all industries and goals with concrete steps and measures', () => {
  for (const industry of ['saas', 'commerce', 'professional', 'manufacturing', 'finance', 'education']) {
    for (const goal of ['revenue', 'operations', 'cost']) {
      const input = { industry, goal };
      const result = recommend(input);
      assert.deepEqual(result, recommend(input));
      assert.equal(result.steps.length, 5);
      assert.equal(result.metrics.length, 4);
      assert.equal(result.integrations.length, 3);
      assert.ok(result.steps.some((step) => /baseline|current time/.test(step)));
      assert.ok(result.steps.some((step) => /human approval/.test(step)));
      for (const value of [result.title, result.summary, result.caution, ...result.steps, ...result.metrics, ...result.integrations]) {
        assert.equal(typeof value, 'string');
        assert.ok(value.length > 0);
        assert.ok(!value.includes('undefined'));
      }
    }
  }
  assert.deepEqual(recommend({ industry: 'bad', goal: 'bad' }), recommend({ industry: 'saas', goal: 'operations' }));
});

test('recommendations return independent arrays and include regulated-use limits', () => {
  const first = recommend(valid);
  first.metrics.push('Changed');
  first.integrations.length = 0;
  assert.equal(recommend(valid).metrics.length, 4);
  assert.equal(recommend(valid).integrations.length, 3);
  assert.match(recommend({ industry: 'finance' }).caution, /Exclude payments and credit decisions/);
  assert.match(recommend({ industry: 'education' }).caution, /grading and admissions/);
  assert.match(recommend({ industry: 'manufacturing' }).caution, /inspector/);
});

test('plain-text export includes visitor context, pilot, limits, and no submission claim', () => {
  const brief = buildBrief(valid);
  for (const value of [valid.company, valid.name, valid.email, valid.challenge, valid.tools, 'Exploratory', 'PILOT STEPS', 'MEASURES TO AGREE', 'not a Ruruma service price', 'does not submit an inquiry']) {
    assert.ok(brief.includes(value), value);
  }
  const optional = buildBrief({ ...valid, name: '', tools: '' });
  assert.ok(optional.includes('Not supplied'));
  assert.ok(optional.includes('To discuss during discovery.'));
  assert.equal(buildBrief(valid), brief);
  assert.throws(() => buildBrief({}), { name: 'TypeError', message: 'The project brief has invalid fields.' });
  assert.throws(() => makeEmailUrl({}), TypeError);
});

test('email URL encodes reserved characters and preserves only subject and body parameters', () => {
  const input = { ...valid, company: 'A & B? # Lab', challenge: 'Review <returns> & route them? Keep + labels.\nDo not lose # IDs.' };
  const address = makeEmailUrl(input);
  const [destination, query] = address.split('?');
  assert.equal(destination, `mailto:${CONTACT_EMAIL}`);
  const params = new URLSearchParams(query);
  assert.deepEqual([...params.keys()], ['subject', 'body']);
  assert.equal(params.get('subject'), `Ruruma project inquiry — ${input.company}`);
  assert.equal(params.get('body'), buildBrief(input));
  assert.ok(address.includes('%26'));
  assert.ok(address.includes('%0A'));
  assert.ok(!address.includes('<returns>'));
});
