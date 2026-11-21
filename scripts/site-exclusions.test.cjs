// 置換除外リストの判定（src/content/font-config.js の SiteExclusions）を検証する。
// 実行: bun test ./scripts/site-exclusions.test.cjs
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { SiteExclusions } = require('../src/content/font-config.js');

test('normalize は行分割・trim・重複除去・上限を適用する', () => {
  assert.deepEqual(SiteExclusions.normalize(' x.com \r\n\nx.com\n192.168.*'), ['x.com', '192.168.*']);
  assert.deepEqual(SiteExclusions.normalize(['a.com\nb.com', 42, null, 'a.com']), ['a.com', 'b.com']);
  assert.deepEqual(SiteExclusions.normalize(undefined), []);
  assert.deepEqual(SiteExclusions.normalize(['x'.repeat(1001), 'ok.com']), ['ok.com']);
  const many = Array.from({ length: 600 }, (_, i) => `h${i}.example`).join('\n');
  assert.equal(SiteExclusions.normalize(many).length, 500);
});

test('ホスト glob と URL 前方一致で判定する', () => {
  const rules = ['192.168.*', 'https://photos.google.com/', 'x.com'];
  assert.equal(SiteExclusions.matches('http://192.168.10.20/admin', rules), true);
  assert.equal(SiteExclusions.matches('https://photos.google.com/u/0/', rules), true);
  assert.equal(SiteExclusions.matches('https://x.com/home', rules), true);
  assert.equal(SiteExclusions.matches('https://X.COM/home', rules), true);
  assert.equal(SiteExclusions.matches('https://sub.x.com/home', rules), false);
  assert.equal(SiteExclusions.matches('https://photos.google.com.evil.example/', rules), false);
  assert.equal(SiteExclusions.matches('http://photos.google.com/', rules), false);
  assert.equal(SiteExclusions.matches('not a url', rules), false);
});

test('ホスト+パス規則・ワイルドカード URL 規則・正規表現の記号を扱う', () => {
  assert.equal(SiteExclusions.matches('https://example.com/Docs/a?b', ['example.com/docs']), true);
  assert.equal(SiteExclusions.matches('https://example.com/blog', ['example.com/docs']), false);
  assert.equal(SiteExclusions.matches('https://a.example.com/x/edit', ['*.example.com/*/edit']), true);
  assert.equal(SiteExclusions.matches('https://example.com/x/edit/more', ['*.example.com/*/edit']), false);
  assert.equal(SiteExclusions.matches('https://www.example.com/p', ['https://*.example.com/*']), true);
  assert.equal(SiteExclusions.matches('http://www.example.com/p', ['https://*.example.com/*']), false);
  // `.` `?` `(` などは文字そのものとして扱い、正規表現として解釈しない
  assert.equal(SiteExclusions.matches('https://exampleXcom/', ['example.com']), false);
  assert.equal(SiteExclusions.matches('https://example.com/a(b)?c', ['example.com/a(b)?c']), true);
  assert.equal(SiteExclusions.matches('https://example.com/', ['(']), false);
});

test('toMatchPatterns は意味が一致する素のホスト名だけを変換する', () => {
  assert.deepEqual(
    SiteExclusions.toMatchPatterns(['X.com', 'x.com', '192.168.1.10', 'localhost', '*.example.com', '192.168.*',
      'example.com/docs', 'https://photos.google.com/', 'host:8080', '-bad.com', 'a..b', 'xn--eckwd4c7c.xn--zckzah']),
    ['*://x.com/*', '*://192.168.1.10/*', '*://localhost/*', '*://xn--eckwd4c7c.xn--zckzah/*']
  );
  // URL としてのホスト名が規則と変わる・無効になる規則は、実行時判定と一致しないため変換しない
  assert.deepEqual(SiteExclusions.toMatchPatterns(['example.123', '1.2.3.4.5', '192.168.1.300', '1.2.3', '123']), []);
});
