// 実ブラウザで Shadow 初期化と遅延 CSS の競合を検証する。
// 実行: bun test ./scripts/verify-style-injection.cjs
// chrome.storage/runtime はローカル fixture。CSSOM・フォント描画は実ブラウザを使用する。
const assert = require('node:assert/strict');
const { before, after, test } = require('node:test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
let browser, origin, cdn, userDataDir, removeSeededProfile;
const servers = [];

async function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/site.css') {
      // CSS 自体には CORS を許可せず、CSSOM の SecurityError を再現する。
      res.setHeader('Content-Type', 'text/css');
      res.end('@font-face { font-family: Chirp; src: url(/src/fonts/MPLUSRounded1c-Regular.woff2); font-weight: 400; }');
    } else if (/^\/src\/fonts\/[\w-]+\.woff2$/.test(url.pathname)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'font/woff2');
      res.end(fs.readFileSync(path.join(root, url.pathname)));
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><html><head><meta charset="utf-8"></head><body><span id="probe" style="font:400 20px Chirp">日本語ABC</span></body></html>');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

before(async () => {
  origin = await serve();
  cdn = await serve();
  const { default: puppeteer } = await import('puppeteer');
  // Windows アカウントのロック防止（必須）: userDataDir 未指定だと新規プロファイルごとに空パスワード確認（LogonUser 失敗）が走るため、
  // シード済みの一時プロファイルを渡し、終了時に片付ける。理由は scripts/chrome-profile-seed.mjs を参照。
  const seed = await import('./chrome-profile-seed.mjs');
  removeSeededProfile = seed.removeSeededProfile;
  userDataDir = seed.createSeededProfile('rfs-style-injection');
  browser = await puppeteer.launch({ headless: true, userDataDir });
  console.log('検証環境:', await browser.version(), root);
});

after(async () => {
  await browser?.close();
  removeSeededProfile?.(userDataDir);
  await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
});

async function extensionStyle(page) {
  await page.evaluate(base => {
    const style = document.createElement('style');
    style.dataset.replaceFont = 'preset';
    style.textContent = `@font-face { font-family: Chirp; src: url("${base}/src/fonts/NotoSansJP-Regular.woff2"); font-weight: 400; } :host { --rfs-test: applied; }`;
    document.head.append(style);
  }, origin);
}

async function monitor(page) {
  await page.evaluate(base => {
    window.chrome = {
      runtime: { id: 'local-test', getURL: p => `${base}/${p}` },
      storage: { local: { get: async () => ({ prebuiltCSSRegistered: true }) } }
    };
  }, origin);
  await page.addScriptTag({ path: path.join(root, 'src/content/font-config.js') });
  await page.addScriptTag({ path: path.join(root, 'src/content/preload-fonts.js') });
  await page.waitForFunction(() => document.head._replaceFontApplied);
}

async function siteStyle(page, imported = false, parent = 'head') {
  return page.evaluate(async ({ cdn, imported, parent }) => {
    const node = document.createElement(imported ? 'style' : 'link');
    if (imported) node.textContent = `@import url("${cdn}/site.css");`;
    else { node.rel = 'stylesheet'; node.href = `${cdn}/site.css`; }
    const loaded = new Promise((resolve, reject) => {
      node.onload = resolve; node.onerror = () => reject(new Error('CSS 読み込み失敗'));
    });
    node.id = 'site-style';
    document[parent].append(node);
    await loaded;
    const sheet = imported ? node.sheet.cssRules[0].styleSheet : node.sheet;
    try { void sheet.cssRules; return false; } catch (error) { return error.name === 'SecurityError'; }
  }, { cdn, imported, parent });
}

async function renderedFonts(page) {
  await page.evaluate(async () => { await document.fonts.load('400 20px Chirp', '日本語ABC'); });
  const session = await page.createCDPSession();
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root: doc } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: doc.nodeId, selector: '#probe' });
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    return fonts.filter(font => font.glyphCount > 0).map(font => font.familyName);
  } finally { await session.detach(); }
}

for (const [delayedCSS, fallback, mode] of [[false, false, 'closed'], [true, false, 'closed'], [false, true, 'closed'], [false, false, 'open']]) {
  test(`G1: ${mode} Shadow の同期初期化後に CSS が残る (CSS後着=${delayedCSS}, fallback=${fallback})`, async () => {
    const page = await browser.newPage();
    try {
      await page.goto(origin);
      if (!delayedCSS) await extensionStyle(page);
      if (mode === 'open') await monitor(page);
      if (fallback) await page.evaluate(() => {
        const descriptor = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'adoptedStyleSheets');
        Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
          ...descriptor, set() { throw new Error('adopt が拒否される環境'); }
        });
      });
      await page.addScriptTag({ path: path.join(root, 'src/content/inject.js') });
      await page.evaluate(({ fallback, mode }) => {
        const host = document.createElement('div');
        document.body.append(host);
        window.testRoot = host.attachShadow({ mode });
        const siteSheet = new CSSStyleSheet();
        siteSheet.replaceSync(':host { --site-test: retained; }');
        if (!fallback) testRoot.adoptedStyleSheets = [siteSheet];
        testRoot.innerHTML = '<style>:host { --site-test: retained; }</style><span>日本語</span>';
      }, { fallback, mode });
      if (delayedCSS) await extensionStyle(page);
      const actual = await page.evaluate(() => ({
        extension: getComputedStyle(testRoot.host).getPropertyValue('--rfs-test').trim(),
        site: getComputedStyle(testRoot.host).getPropertyValue('--site-test').trim(),
        count: testRoot.adoptedStyleSheets.length
      }));
      assert.deepEqual(actual, { extension: 'applied', site: 'retained', count: fallback ? 0 : 2 });
    } finally { await page.close(); }
  });
}

test('G1: ページ破棄後は遅延した closed Shadow 注入を実行しない', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(origin);
    await extensionStyle(page);
    await page.addScriptTag({ path: path.join(root, 'src/content/inject.js') });
    await page.evaluate(() => {
      const host = document.createElement('div');
      document.body.append(host);
      window.testRoot = host.attachShadow({ mode: 'closed' });
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
    });
    assert.equal(await page.evaluate(() => testRoot.adoptedStyleSheets.length), 0);
  } finally { await page.close(); }
});

// match pattern へ変換できない規則（ホスト glob）は、preset が同期注入された後に実行時判定で外す。
for (const [rule, coexist] of [['127.0.0.*', false], ['127.0.0.1/', false], ['127.0.0.*', true]]) {
  test(`G3: 除外リストに一致したページでは preset と closed Shadow の CSS を外し、サイトのフォントを残す (${rule}, 別variant同居=${coexist})`, async () => {
    const page = await browser.newPage();
    try {
      await page.goto(origin);
      await extensionStyle(page);
      assert.equal(await siteStyle(page), true);
      // 同居する別 variant の preset（別の拡張 URL）は除外対象外なので残る
      if (coexist) await page.evaluate(() => {
        const other = document.createElement('style');
        other.dataset.replaceFont = 'preset';
        other.textContent = ':host { --rfs-other: kept; } /* chrome-extension://other-variant/ */';
        document.head.append(other);
      });
      await page.addScriptTag({ path: path.join(root, 'src/content/inject.js') });
      await page.evaluate(() => {
        const host = document.createElement('div');
        document.body.append(host);
        window.testRoot = host.attachShadow({ mode: 'closed' });
      });
      await page.waitForFunction(() => getComputedStyle(testRoot.host).getPropertyValue('--rfs-test').trim() === 'applied');
      await page.evaluate(({ base, rule }) => {
        window.chrome = {
          runtime: { id: 'local-test', getURL: p => `${base}/${p}` },
          storage: { local: { get: async () => ({ prebuiltCSSRegistered: true, siteExclusions: ['other.example', rule] }) } }
        };
      }, { base: origin, rule });
      await page.addScriptTag({ path: path.join(root, 'src/content/font-config.js') });
      await page.addScriptTag({ path: path.join(root, 'src/content/preload-fonts.js') });
      await page.waitForFunction(() => !Array.from(document.querySelectorAll('style[data-replace-font]')).some(s => s.textContent.includes('NotoSansJP')));
      const actual = await page.evaluate(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        // 除外確定後に作られた closed root にも注入しない
        const late = document.createElement('div');
        document.body.append(late);
        const lateRoot = late.attachShadow({ mode: 'closed' });
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
          styles: document.querySelectorAll('style[data-replace-font]').length,
          closed: getComputedStyle(testRoot.host).getPropertyValue('--rfs-test').trim(),
          lateAdopted: lateRoot.adoptedStyleSheets.length,
          lateOther: lateRoot.adoptedStyleSheets.some(sheet => Array.from(sheet.cssRules).some(r => r.cssText.includes('--rfs-other'))),
          applied: document.head._replaceFontApplied === true
        };
      });
      assert.deepEqual(actual, coexist
        ? { styles: 1, closed: '', lateAdopted: 1, lateOther: true, applied: false }
        : { styles: 0, closed: '', lateAdopted: 0, lateOther: false, applied: false });
      const fonts = await renderedFonts(page);
      console.log(rule, '除外ページの描画フォント:', fonts);
      assert.ok(fonts.some(name => name.includes('Rounded')), JSON.stringify(fonts));
      assert.ok(!fonts.includes('Noto Sans JP Thin'), JSON.stringify(fonts));
    } finally { await page.close(); }
  });
}

// document.fonts.size が同じまま @font-face が入れ替わっても、新しい動的 family を見逃さない。
test('G4: 件数が同じまま入れ替わった動的 family にも置換が割り当てられる', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(origin);
    await monitor(page);
    // replace を指定すると、その family の face を同じ同期区間で外して件数を変えずに入れ替える
    const addFace = (family, replace) => page.evaluate(async ({ family, base, replace }) => {
      if (replace) {
        document.getElementById(`face-${replace}`).remove();
        document.getElementById(`use-${replace}`).remove();
      }
      const style = document.createElement('style');
      style.id = `face-${family}`;
      style.textContent = `@font-face { font-family: ${family}; src: url("${base}/src/fonts/MPLUSRounded1c-Regular.woff2"); }`;
      document.head.append(style);
      const span = document.createElement('span');
      span.id = `use-${family}`;
      span.style.fontFamily = family;
      span.textContent = '日本語ABC';
      document.body.append(span);
      // 入替直後（拡張が置換を足す前）の件数
      const sizeAtSwap = document.fonts.size;
      await document.fonts.load(`16px ${family}`, '日本語ABC');
      return sizeAtSwap;
    }, { family, base: origin, replace });
    const dynamicCss = () => page.evaluate(() => Array.from(document.querySelectorAll('style[data-replace-font="dynamic"]')).map(s => s.textContent).join(''));
    const settle = () => page.evaluate(() => new Promise(resolve => setTimeout(resolve, 700)));

    await addFace('__Old_abc123');
    await page.waitForFunction(() => document.querySelector('style[data-replace-font="dynamic"]')?.textContent.includes('__Old_abc123'), { timeout: 5000 });
    await settle();
    // 動的でない face を読み込み、件数が落ち着いた状態の走査を1回挟んで件数キャッシュを確定させる
    await addFace('Settled');
    await settle();
    const sizeBefore = await page.evaluate(() => document.fonts.size);

    const sizeAfter = await addFace('__New_def456', '__Old_abc123');
    assert.equal(sizeAfter, sizeBefore, '入替前後で document.fonts.size が等しい前提');
    await settle();
    assert.ok((await dynamicCss()).includes('__New_def456'), '入れ替わった新しい動的 family に置換が割り当てられていない');
  } finally { await page.close(); }
});

for (const mode of ['initial', 'late-link', 'late-import', 'late-body-link', 'bfcache']) {
  test(`G2: 読めない CSS より拡張フォントが優先される (${mode})`, async () => {
    const page = await browser.newPage();
    try {
      await page.goto(origin);
      await extensionStyle(page);
      if (mode === 'initial') assert.equal(await siteStyle(page), true);
      await monitor(page);
      await page.evaluate(() => {
        window.extensionMoves = 0;
        new MutationObserver(records => {
          for (const record of records) for (const node of record.addedNodes) {
            if (node.dataset?.replaceFont === 'preset') extensionMoves++;
          }
        }).observe(document.documentElement, { subtree: true, childList: true });
      });
      if (mode === 'bfcache') await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
      if (mode !== 'initial') assert.equal(await siteStyle(page, mode === 'late-import', mode === 'late-body-link' ? 'body' : 'head'), true);
      if (mode === 'bfcache') await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      const actual = await renderedFonts(page);
      console.log(mode, '実際の描画フォント:', actual);
      // 同梱 Regular の内部 family 名は Noto Sans JP Thin。
      assert.ok(actual.includes('Noto Sans JP Thin'), JSON.stringify(actual));
      assert.ok(!actual.some(name => name.includes('Rounded')), JSON.stringify(actual));
      const moves = await page.evaluate(async () => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const before = extensionMoves;
        for (let i = 0; i < 50; i++) document.body.append(document.createElement('div'));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return { before, after: extensionMoves };
      });
      assert.ok(moves.before <= 3, JSON.stringify(moves));
      assert.equal(moves.after, moves.before, '通常の DOM 更新で CSS を再移動しない');
    } finally { await page.close(); }
  });
}
