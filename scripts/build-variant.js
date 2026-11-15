#!/usr/bin/env bun
// バリアント設定を読み込み、manifest.json と src/content/variant.js を生成する。
// 使い方: bun scripts/build-variant.js <variant-name> [--firefox]
//   例:   bun scripts/build-variant.js default
//         bun scripts/build-variant.js notosans
//         bun scripts/build-variant.js default --firefox  # Firefox AMO 向け
//
// --firefox を付けると background.scripts を併記する (AMO MV3 validator が
// service_worker 単独を reject するため Firefox-compatible fallback として追加)。
// 付けない (デフォルト) は Chrome / Edge 互換で background.service_worker のみ出力。

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VARIANTS_DIR = path.join(ROOT, 'variants');
const TEMPLATE_PATH = path.join(ROOT, 'manifest.template.json');
const MANIFEST_OUT = path.join(ROOT, 'manifest.json');
const VARIANT_JS_OUT = path.join(ROOT, 'src', 'content', 'variant.js');
// 9 言語共通の UI 文言（正本）と、variant ごとに合成して出力する _locales。
const SHARED_MESSAGES_DIR = path.join(ROOT, 'l10n', 'shared');
const LOCALES_OUT = path.join(ROOT, '_locales');
const LOCALES = ['en', 'ja', 'zh_CN', 'zh_TW', 'ko', 'es', 'fr', 'de', 'pt_BR'];
// variant 固有の文言。locales.<code> に持ち、_locales の同名キーとして出力する。
const LOCALE_FIELDS = [
  ['name', 'appName'],
  ['description', 'appDescription'],
  ['popupTitle', 'popupTitle'],
  ['popupDescription', 'popupDescription']
];

const REQUIRED_KEYS = [
  'locales', 'version', 'geckoId',
  'lockedFonts', 'showFontSelector', 'excludeMatches',
  'zipBaseName', 'secretsKey'
];

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function loadVariant(name) {
  const file = path.join(VARIANTS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) {
    fail(`バリアント設定が見つかりません: ${file}`);
  }
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`バリアント設定の JSON が不正です (${file}): ${e.message}`);
  }
  for (const k of REQUIRED_KEYS) {
    if (!(k in json)) fail(`variants/${name}.json に必須キー "${k}" がありません`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(json.version)) {
    fail(`バリアントの version は X.Y.Z 形式である必要があります: "${json.version}"`);
  }
  if (json.lockedFonts !== null && typeof json.lockedFonts !== 'object') {
    fail('lockedFonts は null またはオブジェクトである必要があります');
  }
  if (!Array.isArray(json.excludeMatches)) {
    fail('excludeMatches は配列である必要があります');
  }
  // 拡張名・説明・popup 文言は全 9 言語ぶん必須（空文字不可）。
  for (const code of LOCALES) {
    const entry = json.locales && json.locales[code];
    if (!entry) fail(`variants/${name}.json の locales.${code} がありません`);
    for (const [field] of LOCALE_FIELDS) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) {
        fail(`variants/${name}.json の locales.${code}.${field} が空です`);
      }
    }
    // Chrome Web Store の上限（name 45 字 / description 132 字）
    if ([...entry.name].length > 45) fail(`locales.${code}.name は 45 字以内にしてください`);
    if ([...entry.description].length > 132) fail(`locales.${code}.description は 132 字以内にしてください`);
  }
  return json;
}

function buildManifest(variant, variantName) {
  const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  // プレースホルダー差し替え（深いコピー後に直接置換）
  // 名前・説明は _locales の appName / appDescription を参照し、ブラウザの言語で表示させる。
  template.name = '__MSG_appName__';
  template.version = variant.version;
  template.description = '__MSG_appDescription__';
  template.default_locale = 'en';
  template.browser_specific_settings.gecko.id = variant.geckoId;

  // icons パスを variant ごとに振り分け (例: icons/default/icon-128x128.png)
  // 各 variant ディレクトリは別ブランド SVG/PNG を持ち、ZIP には該当 variant のみを同梱する。
  const iconBase = `icons/${variantName}`;
  template.icons = {
    "16": `${iconBase}/icon-16x16.png`,
    "48": `${iconBase}/icon-48x48.png`,
    "128": `${iconBase}/icon-128x128.png`
  };

  if (variant.excludeMatches && variant.excludeMatches.length > 0) {
    for (const cs of template.content_scripts) {
      cs.exclude_matches = variant.excludeMatches.slice();
    }
  }
  return template;
}

// 共通 UI 文言 (l10n/shared/<code>.json) に variant 固有の 4 キーを先頭へ合成し、
// _locales/<code>/messages.json を生成する（キー順は全言語で同一）。
function buildLocales(variant) {
  for (const code of LOCALES) {
    const sharedFile = path.join(SHARED_MESSAGES_DIR, `${code}.json`);
    if (!fs.existsSync(sharedFile)) fail(`共通メッセージがありません: ${sharedFile}`);
    const shared = JSON.parse(fs.readFileSync(sharedFile, 'utf8'));
    const entry = variant.locales[code];
    const out = {};
    for (const [field, key] of LOCALE_FIELDS) {
      out[key] = { message: entry[field] };
      // description (開発者向けメモ) は en にだけ付ける
      if (code === 'en') out[key].description = `Variant-specific text: ${field}`;
    }
    Object.assign(out, shared);
    const dir = path.join(LOCALES_OUT, code);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'messages.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
  }
}

function buildVariantJs(variant) {
  // ISOLATED world / Service Worker / popup の全コンテキストから参照可能な形で出力。
  // CommonJS export は scripts/ や Node テストからの参照用フォールバック。
  const payload = {
    name: path.basename(process.argv[2] || 'default'),
    version: variant.version,
    lockedFonts: variant.lockedFonts,
    showFontSelector: variant.showFontSelector,
    // background.js の chrome.scripting.registerContentScripts / updateContentScripts に
    // excludeMatches として渡すため、 variant 設定をそのまま VARIANT に焼き込む。
    // manifest.json の content_scripts.exclude_matches は宣言的登録分にしか効かないので、
    // 動的登録のプリセット JS と MAIN world フックにも同じ除外を流し込む。
    excludeMatches: Array.isArray(variant.excludeMatches) ? variant.excludeMatches.slice() : []
  };
  const serialized = JSON.stringify(payload, null, 2);
  return `// DO NOT EDIT — auto-generated by scripts/build-variant.js
// バリアント設定（manifest 名と version は manifest.json と一致）。
// content scripts (ISOLATED world)・popup・background (Service Worker via importScripts)
// から参照される。lockedFonts が non-null なら mergeFontSettings がそれで上書きする。
const VARIANT = ${serialized};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VARIANT };
}
`;
}

function main() {
  const args = process.argv.slice(2);
  const variantName = args[0];
  const isFirefox = args.includes('--firefox');
  if (!variantName) {
    fail('使い方: bun scripts/build-variant.js <variant-name> [--firefox]');
  }
  if (!/^[a-z][a-z0-9_-]*$/.test(variantName)) {
    fail(`バリアント名は [a-z][a-z0-9_-]* の形式: "${variantName}"`);
  }
  const variant = loadVariant(variantName);

  const manifest = buildManifest(variant, variantName);
  // Firefox AMO の MV3 validator は service_worker 単独を reject するため、
  // Firefox build 時のみ background.scripts を併記する。 Chrome / Edge は
  // 両方併記を拒否 ('background.scripts' requires manifest version of 2 or
  // lower) するため、 Chrome 互換ではこのキーを出力せず service_worker のみ。
  if (isFirefox) {
    manifest.background.scripts = [
      'src/content/variant.js',
      'src/content/font-config.js',
      'src/background/background.js'
    ];
  }
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`✅ manifest.json を生成 (variant=${variantName}, version=${variant.version}, target=${isFirefox ? 'firefox' : 'chrome'})`);

  buildLocales(variant);
  console.log(`✅ _locales/<${LOCALES.length}言語>/messages.json を生成 (variant=${variantName})`);

  const variantJs = buildVariantJs(variant);
  fs.writeFileSync(VARIANT_JS_OUT, variantJs, 'utf8');
  console.log(`✅ src/content/variant.js を生成 (lockedFonts=${variant.lockedFonts ? 'on' : 'off'}, showFontSelector=${variant.showFontSelector})`);
}

main();
