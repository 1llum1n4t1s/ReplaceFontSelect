'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/dependabot-auto-merge.yml'), 'utf8').replace(/\r\n/g, '\n');
const marker = '          script: |\n';
assert.equal(workflow.split(marker).length, 2, 'github-script が一意に見つかりません');
const script = workflow.split(marker)[1].split('\n').map(line => line.startsWith('            ') ? line.slice(12) : line).join('\n');
const execute = new AsyncFunction('github', 'context', 'core', script);
const base = 'a'.repeat(40), newBase = 'c'.repeat(40), head = 'b'.repeat(40), otherHead = 'd'.repeat(40);
const bot = 49699333;

async function simulate(mode) {
  let currentBase = base, dispatches = [], merges = [], closed = new Set();
  const delayed = mode === 'delayed';
  const prs = (delayed ? [1, 2] : [1]).map(number => ({number, state: 'open', draft: false,
    user: {id: bot, login: 'dependabot[bot]'}, head: {sha: number === 1 ? head : otherHead, repo: {id: 1}},
    base: {ref: 'main'}, changed_files: 1, commits: 1, mergeable: true}));
  const f = {list() {}, files() {}, commits() {}, runs() {}, jobs() {}, checks() {}};
  const title = (number, b, h) => `dependency-validation pr=${number} base=${b} head=${h}`;
  const provenance = (number, b, h) => `検証基点 pr=${number} base=${b} head=${h}`;
  const rest = {
    repos: {get: async () => ({data: {id: 1, default_branch: 'main', allow_squash_merge: true}}),
      getBranch: async () => ({data: {commit: {sha: currentBase}}}),
      getCombinedStatusForRef: async () => ({data: {total_count: 0}})},
    pulls: {list: f.list, listFiles: f.files, listCommits: f.commits,
      get: async ({pull_number}) => ({data: {...prs.find(pr => pr.number === pull_number), state: closed.has(pull_number) ? 'closed' : 'open'}}),
      merge: async ({pull_number}) => { merges.push(pull_number); closed.add(pull_number); if (delayed) currentBase = newBase; return {data: {merged: true, sha: 'merged'}}; }},
    actions: {getWorkflow: async () => ({data: {id: 1, name: 'Dependency validation'}}),
      listWorkflowRuns: f.runs, listJobsForWorkflowRunAttempt: f.jobs,
      createWorkflowDispatch: async args => { dispatches.push(args.inputs); }},
    checks: {listForRef: f.checks}
  };
  const github = {rest, paginate: async (fn, args) => {
    if (fn === f.list) return prs;
    if (fn === f.files) return [{filename: 'package.json'}];
    if (fn === f.commits) return [{commit: {verification: {verified: true}}, author: {id: bot}, parents: [{}]}];
    if (fn === f.checks) return [];
    if (fn === f.runs && args.event === 'pull_request') {
      const sha = args.head_sha || head;
      return [{id: sha === head ? 10 : 12, head_sha: sha, status: 'completed', conclusion: 'success', run_attempt: 1}];
    }
    if (fn === f.runs && args.event === 'workflow_dispatch') {
      if (mode === 'missing' || delayed) return [];
      return [{id: 11, head_sha: base, head_branch: 'main', display_title: title(1, base, head), run_attempt: 1,
        status: mode === 'queued' ? 'queued' : 'completed', conclusion: mode === 'failed' ? 'failure' : 'success'}];
    }
    if (fn === f.jobs) {
      const p = args.run_id === 12 ? prs[1] : prs[0];
      const b = args.run_id === 11 && mode === 'mismatch' ? newBase : base;
      const h = args.run_id === 11 && mode === 'headMismatch' ? otherHead : p.head.sha;
      const name = args.run_id === 10 && !delayed ? '古い検証' : provenance(p.number, b, h);
      return [{name: 'validate', status: 'completed', conclusion: 'success', steps: [{name, status: 'completed', conclusion: 'success'}]}];
    }
    throw Error('予期しない API');
  }};
  const core = {info() {}, warning() {}, summary: {addHeading() { return this; }, addRaw() { return this; }, async write() {}}};
  const prior = process.env.REQUIRED_WORKFLOWS;
  process.env.REQUIRED_WORKFLOWS = '[".github/workflows/dependency-validation.yml"]';
  try { await execute(github, {repo: {owner: 'owner', repo: 'repo'}, eventName: 'workflow_dispatch', runId: 100}, core); }
  finally { if (prior === undefined) delete process.env.REQUIRED_WORKFLOWS; else process.env.REQUIRED_WORKFLOWS = prior; }
  return {dispatches, merges};
}

for (const mode of ['missing', 'queued', 'failed', 'success', 'mismatch', 'headMismatch', 'delayed']) {
  test(mode, async () => {
    const {dispatches, merges} = await simulate(mode);
    assert.equal(dispatches.length, mode === 'missing' || mode === 'delayed' ? 1 : 0);
    assert.deepEqual(merges, mode === 'success' || mode === 'delayed' ? [1] : []);
    if (mode === 'delayed') assert.deepEqual(dispatches[0], {pr: '2', base: newBase, head: otherHead});
  });
}
