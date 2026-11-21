// 配布 stage（scripts/package-source.js の stagePackage）の選定規則を検証する。
// 実行: bun test ./scripts/package-source.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { stagePackage } = require('./package-source.js');

const NAME = 'fixture';
const LOCKED = { bodyFont: 'noto-sans-jp', monoFont: 'udev-gothic-jpdoc', bodyFontWeight: '400' };
// 期待値は実装の関数から求めず、FONT_REGISTRY の現行定義に基づく値を直書きする。
const PRESET = 'src/css/preset-noto-sans-jp-udev-gothic-jpdoc-w400.js';
const NEEDED_WOFF2 = ['NotoSansJP-Regular', 'NotoSansJP-Bold', 'UDEVGothicJPDOC-Regular', 'UDEVGothicJPDOC-Bold']
  .map(name => `src/fonts/${name}.woff2`);
let tmp;
let counter = 0;

function write(base, relative, content = 'x') {
  const file = path.join(base, ...relative.split('/'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// 実リポジトリと独立した最小のソースツリーを作る。
function makeSource(extra = []) {
  const dir = path.join(tmp, `src-${counter++}`);
  for (const file of ['manifest.json', '_locales/en/messages.json', `icons/${NAME}/icon.png`,
    'src/content/a.js', 'src/css/replacefont-extension.css', 'src/css/youtube-override.css', ...extra]) {
    write(dir, file);
  }
  return dir;
}

function listing(dir) {
  const out = [];
  (function walk(current, prefix) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(current, entry.name), `${prefix}${entry.name}/`);
      else out.push(prefix + entry.name);
    }
  })(dir, '');
  return out.sort();
}

before(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'package-source-test-')); });
after(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

test('OS残骸・エディタ残骸・preview.html は配布先を問わず除外する', () => {
  const junk = ['src/.DS_Store', 'src/shared/x.swp', 'src/shared/y.js~', 'src/preview.html',
    '_locales/.DS_Store', `icons/${NAME}/preview.html`];
  const source = makeSource([...junk, 'src/keep.html']);
  for (const platform of ['chrome', 'firefox']) {
    const stage = path.join(tmp, `out-junk-${platform}`);
    stagePackage(NAME, {}, platform, stage, source);
    const files = listing(stage);
    for (const file of junk) assert.ok(!files.includes(file), `${platform}: ${file} が残っています`);
    assert.ok(files.includes('src/keep.html'));
    assert.ok(files.includes('manifest.json'));
  }
});

test('TTF は firefox だけ除外し、chrome では残す', () => {
  const source = makeSource(['src/fonts/a.ttf', 'src/fonts/a.woff2']);
  const chrome = path.join(tmp, 'out-ttf-chrome');
  const firefox = path.join(tmp, 'out-ttf-firefox');
  stagePackage(NAME, {}, 'chrome', chrome, source);
  stagePackage(NAME, {}, 'firefox', firefox, source);
  assert.ok(listing(chrome).includes('src/fonts/a.ttf'));
  assert.ok(!listing(firefox).includes('src/fonts/a.ttf'));
  assert.ok(listing(firefox).includes('src/fonts/a.woff2'));
});

test('既存パスと不正な配布先は何も作らず拒否する', () => {
  const source = makeSource();
  const existing = path.join(tmp, 'existing');
  fs.mkdirSync(existing);
  assert.throws(() => stagePackage(NAME, {}, 'chrome', existing, source), /新規ディレクトリ/);
  assert.deepEqual(fs.readdirSync(existing), []);
  const bad = path.join(tmp, 'out-bad');
  assert.throws(() => stagePackage(NAME, {}, 'edge', bad, source), /配布先が不正/);
  assert.equal(fs.existsSync(bad), false);
});

test('同梱対象のシンボリックリンクは拒否する', t => {
  const source = makeSource();
  const outside = path.join(tmp, 'outside.js');
  fs.writeFileSync(outside, 'x');
  try { fs.symlinkSync(outside, path.join(source, 'src', 'link.js')); }
  catch (fileError) {
    // 権限のない Windows ではファイルのシンボリックリンクを作れないため、ディレクトリのジャンクションで代える。
    try { fs.symlinkSync(tmp, path.join(source, 'src', 'linkdir'), 'junction'); }
    catch { t.skip(`この環境ではリンクを作れません: ${fileError.code}`); return; }
  }
  assert.throws(() => stagePackage(NAME, {}, 'chrome', path.join(tmp, 'out-link'), source), /リンク/);
});

test('完全な固定版は一致する preset と必要な WOFF2 だけを残す', () => {
  const preset = PRESET;
  const needed = NEEDED_WOFF2;
  const source = makeSource([preset, ...needed, 'src/css/preset-other-other-500.js', 'src/fonts/unused.woff2']);
  const stage = path.join(tmp, 'out-locked');
  stagePackage(NAME, { lockedFonts: LOCKED }, 'chrome', stage, source);
  const files = listing(stage);
  assert.ok(files.includes(preset));
  for (const file of needed) assert.ok(files.includes(file), `${file} が欠けています`);
  assert.ok(!files.includes('src/css/preset-other-other-500.js'));
  assert.ok(!files.includes('src/fonts/unused.woff2'));

  // 固定されていない variant では同じ資産をすべて残す。
  const open = path.join(tmp, 'out-open');
  stagePackage(NAME, {}, 'chrome', open, source);
  assert.ok(listing(open).includes('src/css/preset-other-other-500.js'));
  assert.ok(listing(open).includes('src/fonts/unused.woff2'));
});

test('固定版でも CSS が相対 url() で参照する WOFF2 は残し、プレースホルダ・絶対 URL は無視する', () => {
  const css = [
    '@font-face { src: url("../fonts/popup-ui.woff2?v=1#x") format("woff2"); }',
    '@font-face { src: url(__REPLACE_FONT_BASE__/src/fonts/placeholder.woff2); }',
    '@font-face { src: url(https://example.com/src/fonts/remote.woff2); }',
    '@font-face { src: url(/src/fonts/rooted.woff2); }',
    '@font-face { src: url(../fonts/not-woff.ttf); }'
  ].join('\n');
  const source = makeSource([PRESET, ...NEEDED_WOFF2, 'src/popup/popup.css',
    'src/fonts/popup-ui.woff2', 'src/fonts/placeholder.woff2', 'src/fonts/remote.woff2', 'src/fonts/rooted.woff2']);
  write(source, 'src/popup/popup.css', css);
  const stage = path.join(tmp, 'out-css-refs');
  stagePackage(NAME, { lockedFonts: LOCKED }, 'chrome', stage, source);
  assert.deepEqual(listing(stage).filter(file => file.endsWith('.woff2')),
    [...NEEDED_WOFF2, 'src/fonts/popup-ui.woff2'].sort());
});

test('固定が一部のキーだけなら全 preset・WOFF2 を保持する', () => {
  const source = makeSource([PRESET, 'src/css/preset-other-other-500.js', 'src/fonts/unused.woff2']);
  const stage = path.join(tmp, 'out-partial');
  stagePackage(NAME, { lockedFonts: { bodyFont: 'noto-sans-jp' } }, 'chrome', stage, source);
  const files = listing(stage);
  assert.ok(files.includes(PRESET));
  assert.ok(files.includes('src/css/preset-other-other-500.js'));
  assert.ok(files.includes('src/fonts/unused.woff2'));
});
