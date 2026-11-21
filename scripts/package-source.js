const fs = require('node:fs');
const path = require('node:path');
const {
  FONT_REGISTRY, FONT_SETTINGS_VALIDATORS, buildPlaceholderMap, getPresetFileName
} = require('../src/content/font-config');

const root = path.resolve(__dirname, '..');

function sourceFiles(directory, prefix = 'src') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = `${prefix}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`リンクは同梱できません: ${relative}`);
    return entry.isDirectory()
      ? sourceFiles(path.join(directory, entry.name), relative)
      : [relative];
  });
}

function getExcludedFiles(variant, sourceRoot = root) {
  const files = sourceFiles(path.join(sourceRoot, 'src'));
  for (const file of ['src/css/replacefont-extension.css', 'src/css/youtube-override.css']) {
    if (!files.includes(file)) throw new Error(`必要な資産がありません: ${file}`);
    if (fs.statSync(path.join(sourceRoot, file)).size === 0) throw new Error(`必要な資産が空です: ${file}`);
  }
  const locked = variant.lockedFonts;
  // 一部の設定だけが固定される将来のvariantでは、選択可能な資産を削らない。
  const fullyLocked = locked && ['bodyFont', 'monoFont', 'bodyFontWeight'].every(key =>
    Object.hasOwn(locked, key) && FONT_SETTINGS_VALIDATORS[key](locked[key]));
  if (!fullyLocked) return [];

  const preset = `src/css/${getPresetFileName(locked.bodyFont, locked.monoFont, locked.bodyFontWeight)}`;
  const placeholders = buildPlaceholderMap(
    FONT_REGISTRY.body[locked.bodyFont], FONT_REGISTRY.mono[locked.monoFont],
    locked.bodyFontWeight, ''
  );
  const required = new Set(Object.values(placeholders)
    .filter(value => typeof value === 'string' && value.endsWith('.woff2'))
    .map(file => `src/fonts/${file}`));
  // popupの両テーマや共有UIなど、CSSから参照される同梱フォントも残す。
  for (const file of files.filter(file => file.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(sourceRoot, file), 'utf8');
    for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+\.woff2)(?:[?#][^'"\s)]*)?['"]?\s*\)/gi)) {
      const url = match[1];
      if (url.includes('__') || /^(?:[a-z]+:|\/)/i.test(url)) continue;
      required.add(path.posix.normalize(path.posix.join(path.posix.dirname(file), url)));
    }
  }
  for (const file of [preset, ...required]) {
    if (!files.includes(file)) throw new Error(`必要な資産がありません: ${file}`);
  }
  return files.filter(file =>
    (file.endsWith('.woff2') && !required.has(file)) ||
    (/^src\/css\/preset-.*\.js$/.test(file) && file !== preset)
  ).sort();
}

// ストア配信に不要なOS・エディタの残骸とプレビュー。firefoxはソース由来のTTFも載せない。
function isJunkFile(file, platform) {
  const base = path.posix.basename(file);
  return base.endsWith('.DS_Store') || base.endsWith('.swp') || base.endsWith('~') ||
    base === 'preview.html' || (platform === 'firefox' && base.endsWith('.ttf'));
}

// manifest.json・_locales・icons/<variant>・src を新規ディレクトリへ集約する。
// 生成済みの manifest 等を前提とし、再生成と削除は行わない。
function stagePackage(name, variant, platform, stageDir, sourceRoot = root) {
  if (platform !== 'chrome' && platform !== 'firefox') throw new Error(`配布先が不正です: ${platform}`);
  const target = path.resolve(stageDir);
  if (fs.existsSync(target)) throw new Error(`コピー先は新規ディレクトリにしてください: ${target}`);
  if (!fs.existsSync(path.join(sourceRoot, 'manifest.json'))) throw new Error('manifest.json がありません');
  const skipped = new Set(getExcludedFiles(variant, sourceRoot));
  const files = ['manifest.json'];
  for (const directory of ['_locales', `icons/${name}`, 'src']) {
    if (!fs.existsSync(path.join(sourceRoot, directory))) throw new Error(`必要なディレクトリがありません: ${directory}`);
    files.push(...sourceFiles(path.join(sourceRoot, directory), directory));
  }
  for (const file of files) {
    if (skipped.has(file) || isJunkFile(file, platform)) continue;
    const output = path.join(target, ...file.split('/'));
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, ...file.split('/')), output);
  }
}

function main(args) {
  const [name, option, platform, stageDir] = args;
  if (args.length !== 4 || !/^[a-z][a-z0-9_-]*$/.test(name) || option !== '--stage' || !platform || !stageDir) {
    throw new Error('使い方: bun scripts/package-source.js <variant> --stage <chrome|firefox> <新規ディレクトリ>');
  }
  const variant = JSON.parse(fs.readFileSync(path.join(root, 'variants', `${name}.json`), 'utf8'));
  stagePackage(name, variant, platform, stageDir);
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { getExcludedFiles, stagePackage };
