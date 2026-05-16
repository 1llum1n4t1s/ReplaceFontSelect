const fs = require('fs');
const path = require('path');
const {
  FONT_REGISTRY,
  getPresetFileName,
  buildPlaceholderMap: buildRuntimePlaceholderMap
} = require('../src/content/font-config');

// =============================================================================
// 多言語対応ポリシー
// =============================================================================
// unicode-range は指定しない。置換フォントが持つ全グリフ範囲を使用し、
// フォントに含まれない文字は CSS font fallback によって次の candidate
// （元サイトの指定 / システムフォント）へ自然に落ちる。

// =============================================================================
// フォントウェイト境界定数
// 100-599 → Regular woff2、600-900 → Bold woff2
// =============================================================================
const WEIGHT_REGULAR_RANGE = '100 599';
const WEIGHT_BOLD_RANGE = '600 900';

// =============================================================================
// (オプション) フォントメトリクスオーバーライド
// CLS / FOUT 緩和のため @font-face に size-adjust / ascent-override 等を付与する。
// 実測値が無い場合は no-op。実測値を入れて再ビルドすると有効化される。
// =============================================================================
const FONT_METRICS = {
  // 例: 'noto-sans-jp': { sizeAdjust: '100%', ascentOverride: '88%', descentOverride: '22%', lineGapOverride: '0%' }
};

// =============================================================================
// 置換対象フォント
// =============================================================================
// 注: 'serif' / 'sans-serif' / 'monospace' / 'system-ui' / 'ui-sans-serif' /
// 'ui-serif' / 'ui-monospace' / '-apple-system' / 'BlinkMacSystemFont' 等は
// CSS 汎用キーワード (generic family) であり、@font-face の font-family 記述子に
// 指定すると仕様上未定義動作。ブラウザに黙殺され得るため対象に含めない。
// これらへの対応は BODY_CSS_VARS / MONO_CSS_VARS の上書きで行う。
const GOTHIC_FONT_FAMILIES_RAW = [
  'MS PGothic', 'MS Pゴシック', 'ＭＳ Ｐゴシック',
  'MS UI Gothic',
  'メイリオ', 'Meiryo',
  'YuGothic', 'Yu Gothic', '游ゴシック',
  'YuGothic Medium', 'Yu Gothic Medium', '游ゴシック Medium',
  'Yu Gothic UI', 'Meiryo UI', 'Segoe UI',
  'Motiva Sans',
  'Arial', 'ArialMT', 'Roboto', 'RobotoDraft', 'Helvetica', 'Helvetica Neue', 'HelveticaNeue',
  'Trebuchet MS', 'Verdana',
  'M PLUS Rounded 1c', 'Malgun Gothic',
  'Arial Unicode MS',
  'Hiragino Sans', 'Hiragino Sans Pro',
  'Inter', 'Inter Variable', 'Inter-Regular', 'Inter-Bold', 'Inter UI',
  'Public Sans', 'Roobert', 'Geist', 'Geist Sans',
  'FK Grotesk', 'FK Grotesk Neue', 'FK Grotesk Neue Thin', 'FK Display',
  'IBM Plex Sans',
  'ABC Social', 'Graphik', 'Euclid Circular',
  'Manrope', 'Poppins', 'Outfit', 'Plus Jakarta Sans',
  'Söhne', 'Söhne-Buch', 'Söhne-Kraft',
  'Signifer',
  'Anthropic Serif Web Text',
  'Anthropic Sans Web Text',
  'pplxSans', 'pplxSerif',
  'San Francisco',
  'Segoe UI Variable',
  'Segoe UI Variable Display',
  'Segoe UI Variable Text',
  'Segoe UI Historic',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
  'Oswald',
  'Raleway',
  'Merriweather Sans',
  'Noto Sans',
  'Noto Sans CJK JP',
  'MS Mincho', 'MS PMincho', 'ＭＳ 明朝', 'ＭＳ Ｐ明朝',
  'YuMincho', 'Yu Mincho', '游明朝', '游明朝体',
  'HiraMinProN-W3', 'Hiragino Mincho ProN', 'ヒラギノ明朝 ProN',
  'Times New Roman', 'Times', 'Georgia'
];

const MONO_FONT_FAMILIES_RAW = [
  'MS Gothic', 'MS ゴシック', 'ＭＳ ゴシック',
  'Consolas', 'Monaco', 'Courier New', 'Courier', 'Menlo',
  'Ubuntu Mono', 'Source Code Pro',
  'Cascadia Code', 'Cascadia Mono',
  'Berkeley Mono',
  'IBM Plex Mono',
  'Geist Mono',
  'Fira Code', 'Fira Mono',
  'JetBrains Mono',
  'Roboto Mono',
  'Inconsolata',
  'SFMono-Regular', 'SF Mono',
  'Söhne Mono',
  'pplxSansMono'
];

// ASCII case-insensitive で重複排除。全角は別キーとして残す。
// CSS の font-family マッチは ASCII case-insensitive 仕様 (CSS Fonts L4 §3.2)。
function dedupeAscii(list) {
  const seen = new Set();
  const out = [];
  for (const name of list) {
    const ascii = /^[\x00-\x7F]+$/.test(name);
    const key = ascii ? name.toLowerCase() : name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

const GOTHIC_FONT_FAMILIES = dedupeAscii(GOTHIC_FONT_FAMILIES_RAW);
const MONO_FONT_FAMILIES = dedupeAscii(MONO_FONT_FAMILIES_RAW);

// ヒラギノシリーズのバリエーション生成
const HIRAGINO_BASES = ['Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ ProN', 'ヒラギノ角ゴ Pro'];
const HIRAGINO_VARIANTS = [
  ...HIRAGINO_BASES,
  ...Array.from({ length: 9 }, (_, i) => i + 1).flatMap(w => HIRAGINO_BASES.map(b => `${b} W${w}`))
];

const GOTHIC_FAMILIES = dedupeAscii([...GOTHIC_FONT_FAMILIES, ...HIRAGINO_VARIANTS]);

// =============================================================================
// フォント設定 (プレースホルダーを使用)
// =============================================================================
const GOTHIC_CONFIGS = [
  { weight: 'Regular', localFonts: '__BODY_LOCAL_REGULAR__', webFont: '__BODY_WOFF2_REGULAR__', fontWeight: WEIGHT_REGULAR_RANGE },
  { weight: 'Bold',    localFonts: '__BODY_LOCAL_BOLD__',    webFont: '__BODY_WOFF2_BOLD__',    fontWeight: WEIGHT_BOLD_RANGE }
];

const MONO_CONFIGS = [
  { weight: 'Regular', localFonts: '__MONO_LOCAL_REGULAR__', webFont: '__MONO_WOFF2_REGULAR__', fontWeight: WEIGHT_REGULAR_RANGE },
  { weight: 'Bold',    localFonts: '__MONO_LOCAL_BOLD__',    webFont: '__MONO_WOFF2_BOLD__',    fontWeight: WEIGHT_BOLD_RANGE }
];

const OUTPUT_CONFIGS = [
  {
    fileName: 'replacefont-extension.css',
    title: 'Regular & Bold',
    configs: [
      { families: GOTHIC_FAMILIES, config: GOTHIC_CONFIGS[0] },
      { families: GOTHIC_FAMILIES, config: GOTHIC_CONFIGS[1] },
      { families: MONO_FONT_FAMILIES, config: MONO_CONFIGS[0] },
      { families: MONO_FONT_FAMILIES, config: MONO_CONFIGS[1] }
    ]
  }
];

// =============================================================================
// CSS 変数・セレクタの単一の真実の源泉
// =============================================================================
const BODY_CSS_VARS = [
  '--font-sans', '--font-inter', '--font-geist-sans',
  '--font-fk-grotesk', '--font-fkgrotesk',
  '--font-fk-grotesk-neue', '--font-fkgrotesk-neue',
  '--font-body', '--font-sans-brand', '--font-family-sans', '--tw-font-sans',
  '--font-anthropic-serif', '--font-anthropic-sans',
  '--font-ui', '--font-ui-serif',
  '--font-user-message', '--font-claude-response',
  '--font-sans-serif', '--font-serif',
  // Bootstrap 5 系: --bs-* 変数。 Bootstrap は body に var(--bs-body-font-family) を当てる設計のため、
  // これらが system-ui のままだと拡張機能の置換が見えない。
  '--bs-font-sans-serif', '--bs-body-font-family',
];

const MONO_CSS_VARS = [
  '--font-mono', '--font-berkeley-mono', '--font-geist-mono', '--font-code',
  '--font-family-mono', '--font-family-code', '--tw-font-mono',
  '--mono-font', '--code-font', '--monospace-font', '--pplx-font-mono',
  // Bootstrap 5 系
  '--bs-font-monospace',
];

const EDITABLE_SELECTORS = [
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[contenteditable="plaintext-only"]',
  'input',
  'textarea',
  '[role="textbox"]',
  '.ProseMirror',
  '.ql-editor',
  '.mce-content-body',
  '.cke_editable',
  '.CodeMirror',
  '.cm-editor',
  '.monaco-editor',
  '.ace_editor',
];

const VAR_OVERRIDE_CLASS_SELECTORS = [
  '[class*="prose"]', '[class*="markdown"]',
];

const VAR_OVERRIDE_SELECTORS = [
  ':root', ':host', 'html', 'body',
  ...VAR_OVERRIDE_CLASS_SELECTORS,
];

const MONO_FORCE_TARGETS = [
  'pre', 'code', 'kbd', 'samp', '.mono',
  '[class*="font-mono"]',
  '[class*="codeblock"]',
  '[class*="shiki"]',
  '[class*="hljs"]',
  '[class*="prism"]',
  '[class*="language-"]',
];

// =============================================================================
// CSS ジェネレータ (cascade 戦略)
// =============================================================================
// 旧: `:not(:where([contenteditable=true] *, .monaco-editor *, ...))` で子孫ユニバーサル相当を
//      14 個並列評価 → Style recalc per-event を 4.7 倍に膨張させていた。
// 新: 通常ルール (negation なし) を先に書き、 編集領域には separate ルールで revert を当てて
//      cascade 後勝ちで戻す。 全要素を毎回探索しないので Style/Layout 計算が大幅に軽くなる。

function buildVariableOverrides() {
  const selector = VAR_OVERRIDE_SELECTORS.join(', ');
  const bodyVarsSet = BODY_CSS_VARS
    .map(v => `  ${v}: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;`)
    .join('\n');
  const monoVarsSet = MONO_CSS_VARS
    .map(v => `  ${v}: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;`)
    .join('\n');
  const monoForceCompound = MONO_FORCE_TARGETS.join(', ');

  return `
${selector} {
${bodyVarsSet}

${monoVarsSet}
}

/* 等幅置換 (negation なし、 通常 specificity) */
:root :is(${monoForceCompound}),
:host :is(${monoForceCompound}),
[style*="monospace"],
[style*="ui-monospace"] {
  font-family: "__MONO_FONT_NAME__", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", __MONO_FONT_FALLBACK__ !important;
}
`;
}

function buildExclusionZone() {
  const editableCompound = EDITABLE_SELECTORS.join(', ');
  const monoForceCompound = MONO_FORCE_TARGETS.join(', ');
  const bodyVarsReset = BODY_CSS_VARS.map(v => `  ${v}: revert !important;`).join('\n');
  const monoVarsReset = MONO_CSS_VARS.map(v => `  ${v}: revert !important;`).join('\n');

  return `
/* 編集領域 (RTE / input / Monaco / CodeMirror / Quill / ProseMirror) は revert で
   author origin の前ルールへ戻す。 サイトが明示指定なら戻る、 未指定なら UA font に戻る。 */
:is(${editableCompound}) {
${bodyVarsReset}

${monoVarsReset}
  font-family: revert !important;
}

/* 編集領域内の monospace 要素もリセット */
:is(${editableCompound}) :is(${monoForceCompound}) {
  font-family: revert !important;
}
`;
}

/**
 * @font-face ルールを生成 (プレースホルダー版、 optional font metrics override)
 * family 名の " は CSS 構造破壊防止のため除去する。
 */
function generateFontFace(fontFamily, config, metrics) {
  const sanitized = String(fontFamily).replace(/"/g, '');
  const quotedFontFamily = `"${sanitized}"`;
  const localSources = config.localFonts;
  const webFontUrl = `url('__REPLACE_FONT_BASE__src/fonts/${config.webFont}') format('woff2')`;
  const srcParts = [localSources, webFontUrl];

  const lines = [
    '@font-face {',
    `  font-family: ${quotedFontFamily};`,
    `  src:  ${srcParts.join(',\n        ')};`
  ];
  if (config.fontWeight) lines.push(`  font-weight: ${config.fontWeight};`);
  lines.push('  font-display: swap;');
  // optional metrics override (CLS 緩和)
  if (metrics) {
    if (metrics.sizeAdjust) lines.push(`  size-adjust: ${metrics.sizeAdjust};`);
    if (metrics.ascentOverride) lines.push(`  ascent-override: ${metrics.ascentOverride};`);
    if (metrics.descentOverride) lines.push(`  descent-override: ${metrics.descentOverride};`);
    if (metrics.lineGapOverride) lines.push(`  line-gap-override: ${metrics.lineGapOverride};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function generateCSS(outputConfig) {
  const header = `@charset "UTF-8";
/* ============================================================================
 * DO NOT EDIT — このファイルは scripts/generate-css.js により自動生成されます。
 * 変更は scripts/generate-css.js か src/content/font-config.js を編集し、
 * npm run generate-css を実行してください。
 * ============================================================================ */`;

  const variableOverrides = buildVariableOverrides();
  const exclusionZone = buildExclusionZone();

  // 置換フォント自体の @font-face 定義 (metrics override 適用)
  const replacementFontFaces = `
/* 置換フォント自体の @font-face 定義 */
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_REGULAR__') format('woff2');
  font-weight: ${WEIGHT_REGULAR_RANGE};
  font-display: swap;
  /* __BODY_METRICS_REGULAR__ */
}
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_BOLD__') format('woff2');
  font-weight: ${WEIGHT_BOLD_RANGE};
  font-display: swap;
  /* __BODY_METRICS_BOLD__ */
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_REGULAR__') format('woff2');
  font-weight: ${WEIGHT_REGULAR_RANGE};
  font-display: swap;
  /* __MONO_METRICS_REGULAR__ */
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_BOLD__') format('woff2');
  font-weight: ${WEIGHT_BOLD_RANGE};
  font-display: swap;
  /* __MONO_METRICS_BOLD__ */
}
`;

  const sections = outputConfig.configs.map(item =>
    item.families.map(family => generateFontFace(family, item.config)).join('\n')
  );

  return `${header}\n${variableOverrides}\n${exclusionZone}\n${replacementFontFaces}\n${sections.join('\n')}\n`;
}

// =============================================================================
// 整合検証
// =============================================================================
function validateConsistency() {
  const bodyNames = Object.values(FONT_REGISTRY.body).map(f => f.name);
  const monoNames = Object.values(FONT_REGISTRY.mono).map(f => f.name);
  const conflicts = [];
  for (const name of bodyNames) {
    if (GOTHIC_FAMILIES.includes(name)) {
      conflicts.push(`body name '${name}' は GOTHIC_FAMILIES にも含まれています (自己参照になります)`);
    }
  }
  for (const name of monoNames) {
    if (MONO_FONT_FAMILIES.includes(name)) {
      conflicts.push(`mono name '${name}' は MONO_FONT_FAMILIES にも含まれています (自己参照になります)`);
    }
  }
  if (conflicts.length) {
    console.warn('⚠️  整合性警告:');
    conflicts.forEach(c => console.warn(`   - ${c}`));
  }
}

// =============================================================================
// CSS minify (preset JS 埋め込み用)
// =============================================================================
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')         // ブロックコメント
    .replace(/\s+/g, ' ')                      // 連続空白
    .replace(/\s*([{}:;,>])\s*/g, '$1')        // 記号周辺
    .replace(/;}/g, '}')                       // 末尾セミコロン
    .trim();
}

// プレースホルダー検出: build 時の完全置換に使う
let _placeholderRegexCache = null;
function getPlaceholderRegex(keys) {
  if (_placeholderRegexCache) return _placeholderRegexCache;
  const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
  _placeholderRegexCache = new RegExp(escaped.join('|'), 'g');
  return _placeholderRegexCache;
}

function resolveTemplate(templateCSS, placeholderMap) {
  const regex = getPlaceholderRegex(Object.keys(placeholderMap));
  return templateCSS.replace(regex, match => placeholderMap[match]);
}

// テンプレートリテラル安全化: `${` / ` / \ をエスケープ
function escapeForTemplateLiteral(css) {
  return css.replace(/[\\`]|\$\{/g, (m) => {
    if (m === '\\') return '\\\\';
    if (m === '`') return '\\`';
    return '\\${';
  });
}

// =============================================================================
// preset JS の出力
// =============================================================================
// (P1-1) `__REPLACE_FONT_BASE__` を runtime の `.replace(/.../g, ...)` で展開する旧方式は廃止。
// ビルド時に CSS 文字列を 2 つに split し、 ランタイムでは ${B} (= chrome.runtime.getURL(''))
// を 1 回だけ string concat で組み立てる → V8 のテンプレートリテラル最適化に乗る。
// (P3-6) 2 ステージ注入: critical (置換 @font-face + 変数オーバーライド) を最初に同期注入し、
// 拡張機能対象の全 @font-face (240+) は deferred で requestIdleCallback 経由で注入する。
function buildPresetSource(resolvedCSS, fileName, bodyKey, monoKey, weight) {
  // (P1-1) `__REPLACE_FONT_BASE__` を runtime の `.replace(/.../g, ...)` で展開する旧方式は廃止。
  // ビルド時にテンプレートリテラル `${B}` (= chrome.runtime.getURL('')) に補間。
  // 1 回の string concat で組み立てる → V8 のテンプレートリテラル最適化に乗る。
  const minified = minifyCSS(resolvedCSS);

  // テンプレートリテラル形式に組み立て: ${B} 補間
  // 1. CSS を escape (バックスラッシュ・バックティック・${ を escape)
  // 2. その後 __REPLACE_FONT_BASE__ を ${B} に置換
  //    (escape 対象の文字は __REPLACE_FONT_BASE__ プレースホルダーに含まれないので順序逆でも安全)
  // 旧実装は不可視 ASCII 制御文字 (\x01) を marker として split/join していたが、
  // 「目視で空文字に見える」「エディタ自動正規化で剥がれると 36 preset 全壊」のリスクがあったため廃止。
  const escaped = escapeForTemplateLiteral(minified);
  const literalBody = escaped.replace(/__REPLACE_FONT_BASE__/g, '${B}');

  // sanity check: ${B} 補間が必要な箇所に正しく入っているか
  // (preset JS は最低 4 個の woff2 url + 数十の CSS 変数を含むので、 0 個は明らかなビルドバグ)
  if (!literalBody.includes('${B}')) {
    throw new Error(`[generate-css] preset ${fileName}: \${B} 補間が 0 個。 __REPLACE_FONT_BASE__ プレースホルダーが入力 CSS に含まれていない可能性`);
  }

  return `// DO NOT EDIT — auto-generated by scripts/generate-css.js
// ${fileName} (body=${bodyKey}, mono=${monoKey}, weight=${weight})
(()=>{
const B=chrome.runtime.getURL('');
const s=document.createElement('style');
s.dataset.replaceFont='preset';
s.textContent=\`${literalBody}\`;
(document.head||document.documentElement).appendChild(s);
})();
`;
}

function generatePresets(templateCSS, cssDir) {
  const bodyKeys = Object.keys(FONT_REGISTRY.body);
  const monoKeys = Object.keys(FONT_REGISTRY.mono);
  const weights = ['400', '500'];
  let count = 0;
  let totalBytes = 0;

  for (const bodyKey of bodyKeys) {
    for (const monoKey of monoKeys) {
      for (const weight of weights) {
        const fileName = getPresetFileName(bodyKey, monoKey, weight);
        const placeholderMap = buildRuntimePlaceholderMap(
          FONT_REGISTRY.body[bodyKey],
          FONT_REGISTRY.mono[monoKey],
          weight,
          '__REPLACE_FONT_BASE__'   // __REPLACE_FONT_BASE__ は preset 出力時にテンプレートリテラル化
        );

        // (optional) font metrics コメント部の置換 (空文字 = no-op、 metrics 未提供時)
        const bodyMetrics = FONT_METRICS[bodyKey] || null;
        const monoMetrics = FONT_METRICS[monoKey] || null;
        const renderMetrics = (m) => m ? Object.entries(m).map(([k, v]) => {
          const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase(); // sizeAdjust → size-adjust
          return `${cssKey}: ${v};`;
        }).join(' ') : '';
        placeholderMap['__BODY_METRICS_REGULAR__'] = renderMetrics(bodyMetrics);
        placeholderMap['__BODY_METRICS_BOLD__'] = renderMetrics(bodyMetrics);
        placeholderMap['__MONO_METRICS_REGULAR__'] = renderMetrics(monoMetrics);
        placeholderMap['__MONO_METRICS_BOLD__'] = renderMetrics(monoMetrics);

        const resolvedCSS = resolveTemplate(templateCSS, placeholderMap);
        const jsContent = buildPresetSource(resolvedCSS, fileName, bodyKey, monoKey, weight);
        const outputPath = path.join(cssDir, fileName);
        fs.writeFileSync(outputPath, jsContent, 'utf8');
        totalBytes += Buffer.byteLength(jsContent, 'utf8');
        count++;
      }
    }
  }

  const avgKB = (totalBytes / count / 1024).toFixed(1);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
  console.log(`✅ プリセット JS ${count} ファイルを生成しました (avg ${avgKB} KB / total ${totalMB} MB)`);
}

function main() {
  console.log('🎨 CSS ファイル生成を開始します...\n');

  validateConsistency();

  const cssDir = path.join(__dirname, '../src/css');
  fs.mkdirSync(cssDir, { recursive: true });

  for (const outputConfig of OUTPUT_CONFIGS) {
    const outputPath = path.join(cssDir, outputConfig.fileName);
    try {
      const templateCSS = generateCSS(outputConfig);
      fs.writeFileSync(outputPath, templateCSS, 'utf8');
      const totalFonts = outputConfig.configs.reduce((acc, curr) => acc + curr.families.length, 0);
      const sizeKB = (Buffer.byteLength(templateCSS, 'utf8') / 1024).toFixed(1);
      console.log(`✅ ${outputConfig.title} テンプレート CSS を生成しました: ${outputConfig.fileName} (${totalFonts} 定義 / ${sizeKB} KB)`);

      generatePresets(templateCSS, cssDir);
    } catch (error) {
      console.error(`❌ CSS の生成に失敗しました:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 CSS ファイル生成が完了しました！');
}

main();
