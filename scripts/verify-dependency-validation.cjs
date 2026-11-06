'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const base = 'a'.repeat(40), newBase = 'c'.repeat(40), head = 'b'.repeat(40), otherHead = 'd'.repeat(40);
const bot = 49699333;

// 実 workflow の入力 guard を実行し、手動 main 検証と PR 証跡を混同しないことを確認する。
const validation = require('js-yaml').load(fs.readFileSync(path.join(__dirname, '../.github/workflows/dependency-validation.yml'), 'utf8'));
const validationSteps = validation.jobs.validate.steps;
const guard = new AsyncFunction('github', 'context', validationSteps[0].with.script);

async function validateDispatch(overrides = {}) {
  const env = { VALIDATION_MODE: 'pr', PR_NUMBER: '1', BASE_SHA: base, HEAD_SHA: head, ...overrides.env };
  const context = { repo: { owner: 'owner', repo: 'repo' }, ref: 'refs/heads/main', sha: base, ...overrides.context };
  const pr = { state: 'open', user: { id: bot }, head: { sha: head, repo: { id: 1 } }, base: { ref: 'main' }, ...overrides.pr };
  let prRequests = 0;
  const github = { rest: {
    repos: {
      get: async () => ({ data: { id: 1, default_branch: 'main' } }),
      getBranch: async ({ branch }) => {
        assert.equal(branch, 'main');
        return { data: { commit: { sha: overrides.currentBase || base } } };
      },
    },
    pulls: { get: async ({ pull_number }) => { assert.equal(pull_number, 1); prRequests++; return { data: pr }; } },
  } };
  const prior = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
  Object.assign(process.env, env);
  try { await guard(github, context); }
  finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  return prRequests;
}

test('main モードは現在の既定ブランチ SHA のみ受け付け、PR API を呼ばない', async () => {
  assert.equal(await validateDispatch({ env: { VALIDATION_MODE: 'main', PR_NUMBER: '', BASE_SHA: '', HEAD_SHA: '' } }), 0);
  for (const overrides of [
    { context: { ref: 'refs/heads/topic' } },
    { context: { ref: 'refs/tags/main' } },
    { context: { sha: head } },
    { currentBase: newBase },
    { env: { PR_NUMBER: '1' } },
    { env: { BASE_SHA: base } },
    { env: { HEAD_SHA: head } },
  ]) {
    await assert.rejects(validateDispatch({ ...overrides, env: { VALIDATION_MODE: 'main', PR_NUMBER: '', BASE_SHA: '', HEAD_SHA: '', ...overrides.env } }));
  }
});

test('PR モードは本人性・同一 repo・最新 base/head・open と入力形式の guard を維持する', async () => {
  assert.equal(await validateDispatch(), 1);
  for (const overrides of [
    { env: { VALIDATION_MODE: 'unknown' } },
    { env: { PR_NUMBER: '' } },
    { env: { PR_NUMBER: '1;echo unsafe' } },
    { env: { BASE_SHA: '' } },
    { env: { HEAD_SHA: 'invalid' } },
    { context: { sha: newBase } },
    { currentBase: newBase },
    { pr: { state: 'closed' } },
    { pr: { user: { id: 2 } } },
    { pr: { head: { sha: head, repo: { id: 2 } } } },
    { pr: { head: { sha: otherHead, repo: { id: 1 } } } },
    { pr: { base: { ref: 'topic' } } },
  ]) await assert.rejects(validateDispatch(overrides));
});

test('main 検証の checkout は SHA 固定で PR merge-parent 証跡を生成しない', () => {
  const inputs = validation.on.workflow_dispatch.inputs;
  assert.deepEqual(inputs.mode.options, ['pr', 'main']);
  assert.equal(inputs.mode.default, 'pr');
  for (const key of ['pr', 'base', 'head']) assert.equal(inputs[key].required, false);
  assert.match(validation['run-name'], /format\('dependency-main-validation sha=\{0\}', github.sha\)/);
  const checkout = validationSteps.find(step => step.uses?.startsWith('actions/checkout@'));
  assert.match(checkout.with.ref, /inputs.mode == 'main'\) && github.sha/);
  const provenance = validationSteps.find(step => step.name?.startsWith('検証基点 pr='));
  assert.equal(provenance.if, "github.event_name != 'workflow_dispatch' || inputs.mode != 'main'");
  assert.match(provenance.run, /HEAD\^1/);
  assert.match(provenance.run, /HEAD\^2/);
});
