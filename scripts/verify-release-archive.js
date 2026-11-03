'use strict';
// 公開前の ZIP/XPI と入力ソースを照合する。提出結果はストアごとに独立する。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { isDeepStrictEqual } = require('util');
const root = path.resolve(__dirname, '..');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
function assert(condition, message) { if (!condition) throw new Error(message); }
function sourceFiles(source) {
  const files = new Map();
  function walk(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = prefix + entry.name;
      assert(!entry.isSymbolicLink(), `シンボリックリンク禁止: ${name}`);
      assert(entry.name !== '.amo-upload-uuid' && entry.name !== '.web-extension-id', `web-ext キャッシュ禁止: ${name}`);
      assert(!entry.name.includes('\\') && !/[\x00-\x1f\x7f]/.test(entry.name), `危険な名前: ${name}`);
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, `${name}/`);
      else { assert(entry.isFile(), `通常ファイル以外: ${name}`); files.set(name, fs.readFileSync(full)); }
    }
  }
  walk(source);
  return files;
}
function sourceSha(files) {
  return sha(JSON.stringify([...files].sort(([a], [b]) => a.localeCompare(b)).map(([name, bytes]) => [name, sha(bytes)])));
}
function validateSource(files, variant, version, platform) {
  assert(/^[a-z][a-z0-9_-]*$/.test(variant) && /^\d+\.\d+\.\d+$/.test(version), 'variant/version が不正');
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'variants', `${variant}.json`)));
  const required = ['manifest.json', 'src/content/variant.js', 'src/background/background.js', ...[16,48,128].map(n => `icons/${variant}/icon-${n}x${n}.png`), ...['footer','form','popup'].map(n => `src/shared/kagayoi-support-${n}.css`)];
  for (const name of required) assert(files.has(name) && files.get(name).length > 0, `必須ファイル不足: ${name}`);
  for (const name of files.keys()) {
    assert(name === 'manifest.json' || name.startsWith(`icons/${variant}/`) || name.startsWith('src/'), `予期しないファイル: ${name}`);
    assert(!/(?:^|\/)(?:\.DS_Store|preview\.html)$|\.swp$|~$/.test(name) && !(platform === 'firefox' && name.endsWith('.ttf')), `配布不要ファイル: ${name}`);
  }
  const m = JSON.parse(files.get('manifest.json'));
  const generatedManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  assert(isDeepStrictEqual(m, generatedManifest), '生成 manifest と配布 manifest が不一致');
  assert(cfg.version === version && m.version === version && m.name === cfg.name && m.description === cfg.description && m.browser_specific_settings?.gecko?.id === cfg.geckoId, 'manifest の variant/version が不一致');
  for (const n of [16,48,128]) assert(m.icons?.[n] === `icons/${variant}/icon-${n}x${n}.png`, 'manifest のアイコンが不一致');
  assert(platform === 'firefox' ? m.background?.scripts?.includes('src/background/background.js') : !m.background?.scripts, 'manifest の配布先が不一致');
  const generated = files.get('src/content/variant.js').toString('utf8').match(/const VARIANT = (\{[\s\S]*?\});/);
  assert(generated, 'variant.js の形式が不正');
  const data = JSON.parse(generated[1]);
  for (const key of ['version','popupTitle','popupDescription','lockedFonts','showFontSelector','excludeMatches']) assert(JSON.stringify(data[key]) === JSON.stringify(cfg[key]), `variant.js の ${key} が不一致`);
  assert(data.name === variant, 'variant.js の名前が不一致');
}
function referenceCandidates(variant, platform) {
  // ワイルドカードは variant の包装規則を適用した実ソースと照合する。
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'variants', variant + '.json')));
  const excluded = new Set(require('./package-source').getExcludedFiles(cfg));
  const names = [];
  function walk(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = prefix + entry.name;
      assert(!entry.isSymbolicLink(), 'シンボリックリンク禁止: ' + name);
      if (entry.isDirectory()) walk(path.join(dir, entry.name), name + '/');
      else {
        assert(entry.isFile(), '通常ファイル以外: ' + name);
        if (!excluded.has(name) && !/(?:\.DS_Store|\.swp|~)$|(?:^|\/)preview\.html$/.test(name) && !(platform === 'firefox' && name.endsWith('.ttf'))) names.push(name);
      }
    }
  }
  walk(path.join(root, 'src'), 'src/');
  walk(path.join(root, 'icons', variant), 'icons/' + variant + '/');
  return names;
}
function validateCandidates(files, variant, platform) {
  const candidates = referenceCandidates(variant, platform);
  const allowed = new Set(['manifest.json', ...candidates]);
  for (const name of files.keys()) assert(allowed.has(name), '予期しない配布ファイル: ' + name);
  for (const name of candidates) {
    assert(files.has(name), '配布候補ファイル不足: ' + name);
    assert(files.get(name).equals(fs.readFileSync(path.join(root, ...name.split('/')))), '配布候補の内容が不一致: ' + name);
  }
  return candidates;
}
async function verifyArchive({archive, source, variant, version, platform}) {
  const files = sourceFiles(source);
  validateSource(files, variant, version, platform);
  const candidates = validateCandidates(files, variant, platform);
  const archiveSha = sha(fs.readFileSync(archive));
  // Python 標準 zipfile は同名の各 entry を保持して検査できる。
  const texts = Object.fromEntries([...files].filter(([name]) => name === 'manifest.json' || /\.(?:html|css)$/i.test(name)).map(([name, bytes]) => [name, bytes.toString('utf8')]));
  const input = JSON.stringify({archive:path.resolve(archive),files:[...files].map(([name, bytes]) => ({name,size:bytes.length,sha256:sha(bytes)})),texts,referenceCandidates:candidates});
  const python = spawnSync(process.env.RELEASE_ZIP_PYTHON || 'python3', [path.join(__dirname, 'verify-release-zip.py')], {input,encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  if (python.error) throw python.error;
  assert(python.status === 0, 'ZIP の検証に失敗: ' + (python.stderr || python.signal || python.status));
  assert(sha(fs.readFileSync(archive)) === archiveSha, '検証中に成果物が変更されました');
  const result = { sha256: archiveSha, sourceSha256: sourceSha(files), archive: path.resolve(archive), variant, version, platform };
  console.log(`検証済み ${JSON.stringify(result)}`);
  return result;
}
async function main() {
  const [mode, variant, version, source, archive, platform, ...extra] = process.argv.slice(2);
  assert(mode === 'verify' && archive && !extra.length && ['chrome','firefox'].includes(platform), 'verify <variant> <version> <source> <archive> <platform>');
  const record = await verifyArchive({archive,source,variant,version,platform});
  if (process.env.VERIFY_RECEIPT_PATH) fs.writeFileSync(process.env.VERIFY_RECEIPT_PATH, JSON.stringify(record), {flag:'wx'});
  return record;
}
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
module.exports = { verifyArchive };
