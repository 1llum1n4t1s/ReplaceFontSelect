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

function main(args) {
  const [name, option, destination] = args;
  if (!name || !/^[a-z][a-z0-9_-]*$/.test(name) ||
      (args.length !== 1 && !(args.length === 3 && option === '--copy' && destination))) {
    throw new Error('使い方: node scripts/package-source.js <variant> [--copy <新規srcディレクトリ>]');
  }
  const variant = JSON.parse(fs.readFileSync(path.join(root, 'variants', `${name}.json`), 'utf8'));
  const excluded = getExcludedFiles(variant);
  if (!destination) {
    if (excluded.length) process.stdout.write(`${excluded.join('\n')}\n`);
    return;
  }
  const target = path.resolve(destination);
  // 既存内容の混入・上書きを防ぎ、コピーだけで成果物を構成する。
  if (fs.existsSync(target)) throw new Error(`コピー先は新規ディレクトリにしてください: ${target}`);
  const skipped = new Set(excluded);
  for (const file of sourceFiles(path.join(root, 'src'))) {
    if (skipped.has(file)) continue;
    const output = path.join(target, file.slice('src/'.length));
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(root, file), output);
  }
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { getExcludedFiles };
