const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const profile = require('../assets/js/relationship_profile.js');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/test_engine.js'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/friendship-villain-test-v2.json')));

async function harness(quiz) {
  class Element {
    constructor() { this.style = {}; this.children = []; this.disabled = false; this.textContent = ''; }
    set innerHTML(value) { this.children = []; }
    appendChild(child) { this.children.push(child); }
    addEventListener(name, callback) { this[name] = callback; }
    querySelectorAll() { return this.children; }
    scrollIntoView() {}
  }
  const ids = Object.fromEntries(['question-text', 'options-container', 'progress-bar', 'current-q', 'total-q', 'back-btn'].map(id => [id, new Element()]));
  let onReady;
  const timers = [];
  const window = { TEST_ID: 'fixture', RESULTS_PATH: '/result/', RelationshipProfile: profile, location: {} };
  const document = {
    addEventListener(name, callback) { onReady = callback; },
    getElementById(id) { return ids[id]; },
    createElement() { return new Element(); },
    querySelector() { return new Element(); },
  };
  vm.runInNewContext(source, {
    window, document, console,
    fetch: async () => ({ ok: true, json: async () => quiz }),
    setTimeout(callback) { timers.push(callback); },
  });
  onReady();
  await new Promise(setImmediate);
  return {
    ids, window,
    click(index) { ids['options-container'].children[index].onclick(); },
    back() { ids['back-btn'].click(); },
    flush() { while (timers.length) timers.shift()(); },
  };
}

function choicesFor(code) {
  const signs = Object.fromEntries(data.axisOrder.map((axis, i) => [axis, code[i] === '1' ? 1 : -1]));
  return data.questions.map(question => question.options.findIndex(option =>
    Object.entries(option.scores).every(([axis, value]) => Math.sign(value) === signs[axis])));
}

for (const [code, slug] of Object.entries(data.resultMap)) {
  test(`actual browser engine routes 12 answers to profile ${code}`, async () => {
    const app = await harness(data);
    const choices = choicesFor(code);
    assert.equal(app.ids['total-q'].textContent, 12);
    choices.forEach((choice, index) => {
      assert.equal(app.ids['current-q'].textContent, index + 1);
      app.click(choice);
    });
    assert.equal(app.window.location.href, undefined, 'wait until final transition');
    app.flush();
    assert.equal(app.window.location.href, `/result/${slug}.html`);
    assert.ok(fs.existsSync(path.join(root, 'friendship-villain-test/result', `${slug}.md`)));
  });
}

test('back edits replace all previous answers, not merely add a new score', async () => {
  const app = await harness(data);
  const original = choicesFor('1111');
  original.slice(0, 11).forEach(choice => app.click(choice));
  for (let i = 0; i < 11; i++) app.back();
  assert.equal(app.ids['current-q'].textContent, 1);
  choicesFor('0000').forEach(choice => app.click(choice));
  app.flush();
  assert.equal(app.window.location.href, `/result/${data.resultMap['0000']}.html`);
});

test('a stale answer button cannot answer the next question', async () => {
  const app = await harness(data);
  const stale = app.ids['options-container'].children[0];
  stale.onclick();
  stale.onclick();
  assert.equal(app.ids['current-q'].textContent, 2);
});

test('final answer is locked until the single result transition completes', async () => {
  const app = await harness(data);
  const choices = choicesFor('1010');
  choices.slice(0, 11).forEach(choice => app.click(choice));
  const finalButton = app.ids['options-container'].children[choices[11]];
  finalButton.onclick();
  finalButton.onclick();
  app.back();
  assert.equal(app.ids['back-btn'].disabled, true);
  app.flush();
  assert.equal(app.window.location.href, `/result/${data.resultMap['1010']}.html`);
});

test('profile model rejects incomplete input instead of inventing a result', () => {
  assert.throws(() => profile.calculate({ axisOrder: data.axisOrder, resultMap: data.resultMap, questionCount: 12 }, []));
});

test('existing score-mode quiz still routes to its original result', async () => {
  const old = JSON.parse(fs.readFileSync(path.join(root, 'data/clown-stage-role-test.json')));
  const app = await harness(old);
  old.questions.forEach(question => app.click(question.options.findIndex(option => option.type === 'laugh-trigger-ringmaster')));
  app.flush();
  assert.equal(app.window.location.href, '/result/laugh-trigger-ringmaster.html');
});

test('existing dimension mode restores earlier selections when going back', async () => {
  const old = {
    resultMode: 'mbti16', resultMap: { ESTP: 'expected-legacy-result' },
    questions: ['EI', 'SN', 'TF', 'PJ'].map(dimension => ({ text: dimension, dimension, options: [...dimension].map(axis => ({ text: axis, axis })) })),
  };
  const app = await harness(old);
  app.click(1);
  app.back();
  for (let i = 0; i < 4; i++) app.click(0);
  app.flush();
  assert.equal(app.window.location.href, '/result/expected-legacy-result.html');
});
