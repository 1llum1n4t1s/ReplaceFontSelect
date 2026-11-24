// 起動後の補填（src/background/background.js）を chrome API の模擬で検証する。
// 実行: bun test ./scripts/startup-injection.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const FILES = readJson('manifest.template.json').content_scripts[0].js;
const DEFAULT_EXCLUDES = readJson('variants/default.json').excludeMatches;
const TAB_TIMEOUT_MS = 1500;

// opts: stored（storage.local の内容）, tabs, execute(details)（executeScript の応答）, excludeMatches
function load(opts = {}) {
  const calls = [];
  const timers = [];
  const listeners = { startup: null, installed: null };
  const errors = [];
  const chrome = {
    runtime: {
      onInstalled: { addListener: (fn) => { listeners.installed = fn; } },
      onMessage: { addListener: () => {} },
      onStartup: { addListener: (fn) => { listeners.startup = fn; } },
      getManifest: () => ({ content_scripts: [{ js: FILES, exclude_matches: [] }] })
    },
    storage: {
      local: {
        get: async () => {
          if (opts.storageFails) throw new Error('storage');
          return opts.stored || {};
        },
        set: async () => {}
      },
      onChanged: { addListener: () => {} }
    },
    scripting: {
      unregisterContentScripts: async () => {},
      getRegisteredContentScripts: async () => [],
      updateContentScripts: async () => {},
      registerContentScripts: async () => {},
      executeScript: async (details) => {
        calls.push(details);
        return opts.execute(details);
      }
    },
    tabs: { query: async () => opts.tabs || [] }
  };
  const ctx = vm.createContext({
    chrome, URL, console: { error: (...a) => errors.push(a.join(' ')), log() {} },
    setTimeout: (fn, delay) => { timers.push({ fn, delay }); return timers.length; },
    clearTimeout: (id) => { if (timers[id - 1]) timers[id - 1].cleared = true; },
    importScripts: () => {}
  });
  const excludes = opts.excludeMatches || DEFAULT_EXCLUDES;
  vm.runInContext(`const VARIANT = ${JSON.stringify({ excludeMatches: excludes, lockedFonts: null })};`, ctx);
  vm.runInContext(read('src/content/font-config.js'), ctx);
  vm.runInContext(read('src/background/background.js'), ctx);
  return { ctx, calls, timers, listeners, errors };
}

const probe = (frameId, href, ready, documentId) => ({ frameId, documentId, result: { href, ready } });
const plain = (value) => JSON.parse(JSON.stringify(value));
const isProbe = (d) => typeof d.func === 'function';
const injections = (t) => t.calls.filter((d) => !isProbe(d));
const flush = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r)); };
// タブごとの待ち上限のタイマーを発火させる（模擬の setTimeout は自動では発火しない）。
const fireTabTimeouts = (t) => {
  for (const timer of t.timers) {
    if (timer.delay === TAB_TIMEOUT_MS && !timer.cleared && !timer.fired) { timer.fired = true; timer.fn(); }
  }
};

// 除外 pattern から、一致する URL と一致しない URL を作る（パターンは https://host/* か https://*.host/*）。
function samples(pattern) {
  const host = pattern.slice('https://'.length, pattern.indexOf('/', 'https://'.length));
  const wildcard = host.startsWith('*.');
  const base = wildcard ? host.slice(2) : host;
  return {
    match: [`https://${wildcard ? 'sub.' : ''}${base}/a/b?c=1`, `https://${base}/`],
    miss: [`http://${base}/`, `https://evil-${base}/`, `https://${base}.evil.example/`]
  };
}

test('match pattern: スキーム・*. ホスト・パスのワイルドカードを扱う', () => {
  const { ctx } = load();
  const m = ctx.matchesMatchPattern;
  assert.equal(m('https://discord.com/*', 'https://discord.com/channels/1'), true);
  assert.equal(m('https://discord.com/*', 'http://discord.com/'), false);
  assert.equal(m('https://discord.com/*', 'https://www.discord.com/'), false);
  assert.equal(m('https://*.figma.com/*', 'https://www.figma.com/file/1?x=1'), true);
  assert.equal(m('https://*.figma.com/*', 'https://figma.com/'), true);
  assert.equal(m('https://*.figma.com/*', 'https://evilfigma.com/'), false);
  assert.equal(m('https://*.figma.com/*', 'https://figma.com.evil.example/'), false);
  assert.equal(m('*://x.com/a/*/c', 'http://x.com/a/b/c'), true);
  assert.equal(m('*://x.com/a/*/c', 'https://x.com/a/b/d'), false);
  assert.equal(m('https://x.com/*', 'chrome://x.com/'), false);
  assert.equal(m('<all_urls>', 'https://x.com/'), true);
  assert.equal(m('https://x.com', 'https://x.com/'), false);
  assert.equal(m('https://x.com/*', 'not a url'), false);
});

for (const variant of ['default', 'notosans']) {
  test(`${variant} の excludeMatches の全件が、一致する URL に一致し、一致しない URL には一致しない`, () => {
    const { ctx } = load();
    const patterns = readJson(`variants/${variant}.json`).excludeMatches;
    assert.ok(patterns.length > 0);
    for (const pattern of patterns) {
      const { match, miss } = samples(pattern);
      for (const url of match) assert.equal(ctx.matchesMatchPattern(pattern, url), true, `${pattern} ${url}`);
      for (const url of miss) assert.equal(ctx.matchesMatchPattern(pattern, url), false, `${pattern} ${url}`);
      // 補填の対象判定も同じ除外を使う
      for (const url of match) assert.equal(ctx.isSupplementTarget(url, patterns), false, `${pattern} ${url}`);
    }
  });
}

test('補填の対象は http/https で除外に一致しないフレームだけ', () => {
  const { ctx } = load();
  const ex = ['https://discord.com/*'];
  assert.equal(ctx.isSupplementTarget('https://x.com/home', ex), true);
  assert.equal(ctx.isSupplementTarget('http://localhost:3000/', ex), true);
  assert.equal(ctx.isSupplementTarget('https://discord.com/channels/1', ex), false);
  assert.equal(ctx.isSupplementTarget('about:blank', ex), false);
  assert.equal(ctx.isSupplementTarget('chrome://newtab/', ex), false);
  assert.equal(ctx.isSupplementTarget(undefined, ex), false);
});

test('未初期化フレームだけに、documentId 指定でフレームごと manifest 順に注入する', async () => {
  const t = load({
    tabs: [{ id: 1, url: 'https://x.com/home' }],
    execute: (d) => isProbe(d)
      ? [probe(0, 'https://x.com/home', false, 'D0'), probe(5, 'https://x.com/f', true, 'D5'),
         probe(6, 'https://discord.com/x', false, 'D6'), probe(7, 'about:blank', false, 'D7'),
         probe(8, 'https://x.com/g', false, 'D8')]
      : []
  });
  await t.ctx.supplementStartupTabs();
  assert.equal(t.calls.length, 3);
  assert.deepEqual(plain(t.calls[0].target), { tabId: 1, allFrames: true });
  assert.deepEqual(plain(t.calls[1].target), { tabId: 1, documentIds: ['D0'] });
  assert.deepEqual(plain(t.calls[2].target), { tabId: 1, documentIds: ['D8'] });
  assert.deepEqual(plain(t.calls[1].files), FILES);
});

test('documentId が得られないフレームには注入しない', async () => {
  const t = load({
    tabs: [{ id: 1, url: 'https://x.com/' }],
    execute: (d) => isProbe(d) ? [probe(0, 'https://x.com/', false), probe(3, 'https://y.com/', false, 'D3')] : []
  });
  await t.ctx.supplementStartupTabs();
  assert.equal(injections(t).length, 1);
  assert.deepEqual(plain(injections(t)[0].target), { tabId: 1, documentIds: ['D3'] });
});

test('1フレームの注入失敗が他のフレームの注入を止めない', async () => {
  const t = load({
    tabs: [{ id: 1, url: 'https://x.com/' }],
    execute: (d) => {
      if (isProbe(d)) return [probe(0, 'https://x.com/', false, 'D0'), probe(1, 'https://x.com/f', false, 'D1'), probe(2, 'https://x.com/g', false, 'D2')];
      if (d.target.documentIds[0] === 'D1') throw new Error('Frame was removed');
      return [];
    }
  });
  await t.ctx.supplementStartupTabs();
  assert.deepEqual(plain(injections(t).map((d) => d.target.documentIds[0])), ['D0', 'D1', 'D2']);
  assert.equal(t.errors.length, 1);
});

test('全フレームが初期化済みなら注入しない', async () => {
  const t = load({ tabs: [{ id: 1, url: 'https://x.com/' }], execute: () => [probe(0, 'https://x.com/', true, 'D0')] });
  await t.ctx.supplementStartupTabs();
  assert.equal(t.calls.length, 1);
});

test('無効時・設定の読込失敗時・discarded タブでは何もしない', async () => {
  const exec = (d) => (isProbe(d) ? [probe(0, 'https://x.com/', false, 'D0')] : []);
  const disabled = load({ tabs: [{ id: 1, url: 'https://x.com/' }], execute: exec, stored: { fontSettings: { enabled: false } } });
  await disabled.ctx.supplementStartupTabs();
  assert.equal(disabled.calls.length, 0);

  const failing = load({ tabs: [{ id: 1, url: 'https://x.com/' }], execute: exec, storageFails: true });
  await failing.ctx.supplementStartupTabs();
  assert.equal(failing.calls.length, 0);

  const discarded = load({ tabs: [{ id: 1, url: 'https://x.com/', discarded: true }, { id: undefined, url: 'https://x.com/' }], execute: exec });
  await discarded.ctx.supplementStartupTabs();
  assert.equal(discarded.calls.length, 0);
});

test('http/https でない・url が無いタブはプローブも送らず、pendingUrl だけのタブは対象にする', async () => {
  const t = load({
    tabs: [
      { id: 1, url: 'chrome://newtab/' }, { id: 2, url: 'about:blank' }, { id: 3 }, { id: 4, url: '' },
      { id: 5, url: 'https://x.com/' }, { id: 6, url: '', pendingUrl: 'http://localhost:3000/' }
    ],
    execute: () => []
  });
  await t.ctx.supplementStartupTabs();
  assert.deepEqual(plain(t.calls.map((d) => d.target.tabId)), [5, 6]);
  assert.equal(t.errors.length, 0);
});

test('1タブの失敗・結果なしが他のタブを止めない', async () => {
  const t = load({
    tabs: [{ id: 1, url: 'https://a.com/' }, { id: 2, url: 'https://b.com/' }, { id: 3, url: 'https://c.com/' }],
    execute: (d) => {
      if (d.target.tabId === 1) throw new Error('Cannot access');
      if (isProbe(d)) return d.target.tabId === 2 ? undefined : [probe(0, 'https://c.com/', false, 'D')];
      return [];
    }
  });
  await t.ctx.supplementStartupTabs();
  assert.equal(injections(t).length, 1);
  assert.equal(injections(t)[0].target.tabId, 3);
  assert.equal(t.errors.length, 1);
});

test('解決しないプローブのタブがあっても、同じ回の他タブと後続の回が処理され、そのタブは再試行できる', async () => {
  let hang = true;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const t = load({
    tabs: [{ id: 1, url: 'https://a.com/' }, { id: 2, url: 'https://b.com/' }],
    execute: (d) => {
      if (isProbe(d)) {
        if (d.target.tabId === 1 && hang) return gate;
        return [probe(0, 'https://x.com/', false, `D${d.target.tabId}`)];
      }
      return [];
    }
  });
  const first = t.ctx.supplementStartupTabs();
  await flush();
  assert.deepEqual(plain(injections(t).map((d) => d.target.tabId)), [2]);

  // 進行中のタブは重ねて処理せず、他のタブは後続の回で処理される
  await t.ctx.supplementStartupTabs();
  assert.equal(t.calls.filter((d) => isProbe(d) && d.target.tabId === 1).length, 1);
  assert.equal(t.calls.filter((d) => isProbe(d) && d.target.tabId === 2).length, 2);

  // 上限を過ぎた後に遅れて解決したプローブからも注入する
  fireTabTimeouts(t);
  await first;
  release([probe(0, 'https://a.com/', false, 'Dlate')]);
  await flush();
  assert.deepEqual(plain(injections(t).filter((d) => d.target.tabId === 1).map((d) => d.target.documentIds)), [['Dlate']]);

  // 次の回では同じタブを再試行できる
  hang = false;
  await t.ctx.supplementStartupTabs();
  assert.equal(t.calls.filter((d) => isProbe(d) && d.target.tabId === 1).length, 2);
  assert.equal(injections(t).filter((d) => d.target.tabId === 1).length, 2);
});

test('onStartup は登録失敗でも3回の補填を予約し、onInstalled は予約しない', async () => {
  const t = load({ execute: () => [] });
  t.listeners.installed();
  assert.equal(t.timers.length, 0);
  t.listeners.startup();
  assert.deepEqual(plain(t.timers.map((x) => x.delay)), [0, 2000, 8000]);
});
