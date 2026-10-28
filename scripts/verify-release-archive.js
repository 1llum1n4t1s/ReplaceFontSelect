'use strict';
// 公開前の ZIP/XPI と入力ソースを照合する。提出結果はストアごとに独立する。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { isDeepStrictEqual } = require('util');
const { pathToFileURL } = require('url');
const root = path.resolve(__dirname, '..');
const webExtRoot = path.dirname(require.resolve('web-ext'));
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const checks = {
  'lib/program.js': 'ad78334f0c2952cfe3c5d7122cd779f423288687b71ebd410df502585be1b129',
  'lib/cmd/index.js': 'fb5e78393ff261052006004ae1c2b6bb1fc560301f53ef59a5c026f8ac33369e',
  'lib/cmd/sign.js': '19ea0162fd17e8907dbb1635fa2b0a25368fbaddf2f711cbeb48b5ca0c36f65e',
  'lib/util/submit-addon.js': '37ac56146a52b5918d757819b2ac3bb756598fb4b50165741ceeb17bec40377d'
};
function assert(condition, message) { if (!condition) throw new Error(message); }
function checkWebExt() {
  const pkg = JSON.parse(fs.readFileSync(path.join(webExtRoot, 'package.json')));
  assert(pkg.version === '10.8.0', `未対応の web-ext: ${pkg.version}`);
  for (const [file, digest] of Object.entries(checks)) {
    assert(sha(fs.readFileSync(path.join(webExtRoot, file))) === digest, `web-ext 注入契約の変更: ${file}`);
  }
}
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
  const archiveBytes = fs.readFileSync(archive);
  // Python 標準 zipfile は同名の各 entry を保持して検査できる。
  const texts = Object.fromEntries([...files].filter(([name]) => name === 'manifest.json' || /\.(?:html|css)$/i.test(name)).map(([name, bytes]) => [name, bytes.toString('utf8')]));
  const input = JSON.stringify({archive:path.resolve(archive),files:[...files].map(([name, bytes]) => ({name,size:bytes.length,sha256:sha(bytes)})),texts,referenceCandidates:candidates});
  const python = spawnSync(process.env.RELEASE_ZIP_PYTHON || 'python3', [path.join(__dirname, 'verify-release-zip.py')], {input,encoding:'utf8',env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  if (python.error) throw python.error;
  assert(python.status === 0, 'ZIP の検証に失敗: ' + (python.stderr || python.signal || python.status));
  assert(sha(fs.readFileSync(archive)) === sha(archiveBytes), '検証中に成果物が変更されました');
  const result = { sha256: sha(archiveBytes), sourceSha256: sourceSha(files), archive: path.resolve(archive), variant, version, platform };
  console.log(`検証済み ${JSON.stringify(result)}`);
  return result;
}
async function runFirefox({ variant, version, argv, submit, expectedSource }) {
  checkWebExt();
  const webExt = (await import(pathToFileURL(require.resolve('web-ext')).href)).default;
  const { signAddon, default: Client } = await import('web-ext/util/submit-addon');
  let invoked = false, verified = false, submitted = false;
  const commands = { ...webExt.cmd, sign: async args => {
    assert(!invoked, 'sign が複数回実行されました'); invoked = true;
    assert(!expectedSource || path.resolve(args.sourceDir) === path.resolve(expectedSource), 'Firefox ソースパスが不一致');
    const initial = sourceFiles(args.sourceDir); validateSource(initial, variant, version, 'firefox');
    const initialSha = sourceSha(initial); let record;
    return webExt.cmd.sign(args, {
      build: async (...buildArgs) => {
        const result = await webExt.cmd.build(...buildArgs);
        record = await verifyArchive({archive:result.extensionPath,source:args.sourceDir,variant,version,platform:'firefox'});
        assert(record.sourceSha256 === initialSha, 'build 中にソースが変更されました'); verified = true;
        return result;
      },
      submitAddon: async options => {
        // AMO の version メタデータは実 upload UUID を上書きできない。
        const metadata = options.metaDataJson;
        if (metadata !== undefined) {
          assert(metadata && typeof metadata === 'object' && !Array.isArray(metadata), 'AMO metadata の形式が不正');
          if (metadata.version != null) {
            assert(typeof metadata.version === 'object' && !Array.isArray(metadata.version), 'AMO version metadata の形式が不正');
            assert(!Object.hasOwn(metadata.version, 'upload'), 'AMO metadata.version.upload の指定は禁止です');
          }
        }
        assert(verified && record && path.resolve(options.xpiPath) === record.archive, '未検証の XPI');
        const currentSource = sourceFiles(args.sourceDir);
        validateSource(currentSource, variant, version, 'firefox');
        validateCandidates(currentSource, variant, 'firefox');
        assert(sourceSha(currentSource) === initialSha, '提出前にソースが変更されました');
        assert(sha(fs.readFileSync(options.xpiPath)) === record.sha256, '提出前に XPI が変更されました');
        // web-ext が FormData を組み立てる際に読み込んだ bytes 自体を照合する。
        // UUID が後から作られても既存 upload を再利用せず、新しい実物を送る。
        class VerifiedClient extends Client {
          async fetchJson(url, method, ...args) {
            const result = await super.fetchJson(url, method, ...args);
            if (method === 'POST' && url.pathname.endsWith('/upload/') && result.uuid) {
              console.log('AMO upload ' + JSON.stringify({variant, version, sha256:record.sha256, uuid:result.uuid}));
            }
            return result;
          }
          async doNewAddonOrVersionSubmit(addonId, uuid, metadata) {
            const result = await super.doNewAddonOrVersionSubmit(addonId, uuid, metadata);
            console.log('AMO submission ' + JSON.stringify({variant, version, sha256:record.sha256, uuid, addonId, versionId:result.version?.id, editUrl:result.version?.edit_url}));
            return result;
          }
          async getPreviousUuidOrUploadXpi(xpiPath, channel, savedUploadUuidPath) {
            assert(!fs.existsSync(savedUploadUuidPath), '提出前に upload UUID が現れました');
            return super.getPreviousUuidOrUploadXpi(xpiPath, channel, savedUploadUuidPath, undefined,
              async () => ({ uploadUuid: '', channel: '', xpiCrcHash: '' }));
          }
          fileFromSync(filePath) {
            if (path.resolve(filePath) !== record.archive) return super.fileFromSync(filePath);
            const bytes = fs.readFileSync(filePath);
            assert(sha(bytes) === record.sha256, '送信時に XPI が変更されました');
            return new File([bytes], path.basename(filePath));
          }
        }
        submitted = true;
        return submit ? submit(options) : signAddon({ ...options, SubmitClient: VerifiedClient });
      }
    });
  }};
  await webExt.main(webExtRoot, { commands, argv, runOptions: { shouldExitProgram: false } });
  assert(invoked && verified && submitted, 'web-ext の検証・提出フックが実行されませんでした');
}
async function main() {
  const [mode, variant, version, source, ...rest] = process.argv.slice(2);
  if (mode === 'firefox') return runFirefox({variant,version,expectedSource:source,argv:['sign', ...rest]});
  assert(mode === 'chrome' && rest.length === 1, '使い方: chrome <variant> <version> <source> <zip> / firefox <variant> <version> <source> [web-ext options]');
  const record = await verifyArchive({archive:rest[0],source,variant,version,platform:'chrome'});
  const currentSource = sourceFiles(source);
  validateSource(currentSource, variant, version, 'chrome');
  validateCandidates(currentSource, variant, 'chrome');
  assert(sha(fs.readFileSync(record.archive)) === record.sha256 && sourceSha(currentSource) === record.sourceSha256, '提出前に成果物またはソースが変更されました');
  const child = spawnSync('pnpm', ['exec','chrome-webstore-upload','--source',record.archive], {stdio:'inherit',shell:process.platform === 'win32'});
  if (child.error) throw child.error;
  assert(child.status === 0, 'Chrome upload が失敗: ' + (child.status ?? child.signal));
}
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
module.exports = { verifyArchive, runFirefox };
