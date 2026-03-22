const fs = require('fs');
const path = require('path');
const { FONT_REGISTRY } = require('../font-config');

// ---------------------------------------------
// 置換対象フォント
// ---------------------------------------------
const GOTHIC_FONT_FAMILIES = [
  // --- 既存のゴシック系 ---
  'MS PGothic', 'ms pgothic', 'MS Pゴシック', 'ms pゴシック', 'ＭＳ Ｐゴシック',
  'MS UI Gothic',
  'メイリオ', 'Meiryo',
  'YuGothic', 'Yu Gothic', '游ゴシック',
  'YuGothic Medium', 'Yu Gothic Medium', '游ゴシック Medium',
  'Yu Gothic UI', 'Meiryo UI', 'Segoe UI',
  'Motiva Sans', 'MotivaSans',
  'Arial', 'ArialMT', 'Roboto', 'RobotoDraft', 'Helvetica', 'Helvetica Neue', 'HelveticaNeue',
  'Trebuchet MS', 'TrebuchetMS', 'Verdana',
  'M PLUS Rounded 1c', 'Malgun Gothic',
  'Arial Unicode MS',
  'Hiragino Sans', 'Hiragino Sans Pro',
  'Inter', 'Inter Variable', 'Inter-Regular', 'Inter-Bold', 'Inter UI',
  'Public Sans', 'Roobert', 'Geist', 'Geist Sans',
  'FK Grotesk', 'FK Grotesk Neue', 'FK Grotesk Neue Thin', 'FK Display',
  'FKGrotesk', 'FKGroteskNeue', 'FKGroteskNeueThin', 'FKDisplay',
  'IBM Plex Sans', 'IBMPlexSans',
  'ABC Social',   'Graphik', 'Euclid Circular',
  'Manrope', 'Poppins', 'Outfit', 'Plus Jakarta Sans',
  'Söhne', 'Söhne-Buch', 'Söhne-Kraft',
  'Signifer',
  'Anthropic Serif Web Text',
  'Anthropic Sans Web Text',
  'Noto Sans JP',

  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  '-apple-system',
  'BlinkMacSystemFont',
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
  'Noto Sans', // Webフォント版をローカル版で上書き
  'Noto Sans CJK JP',

  'MS Mincho', 'ms mincho', 'MS PMincho', 'ＭＳ 明朝', 'ＭＳ Ｐ明朝',
  'YuMincho', 'Yu Mincho', '游明朝', '游明朝体',
  'HiraMinProN-W3', 'Hiragino Mincho ProN', 'ヒラギノ明朝 ProN',
  'Times New Roman', 'Times', 'Georgia',
  'serif', // 一部のブラウザで有効
  'sans-serif' // 汎用サンセリフ
];

// 置換対象フォントの定義（等幅系）
const MONO_FONT_FAMILIES = [
  'MS Gothic', 'ms gothic', 'MS ゴシック', 'ms ゴシック', 'ＭＳ ゴシック',
  'Consolas', 'Monaco', 'Courier New', 'Courier', 'Menlo',
  'Ubuntu Mono', 'source-code-pro', 'Source Code Pro',
  'Cascadia Code', 'Cascadia Mono',
  'Berkeley Mono', 'BerkeleyMono',
  'IBM Plex Mono', 'IBMPlexMono',
  'Geist Mono',
  'Fira Code', 'Fira Mono',
  'JetBrains Mono',
  'Roboto Mono',
  'Inconsolata',
  'SFMono-Regular', 'SF Mono',
  'Söhne Mono',
  'UDEV Gothic JPDOC',
  'ui-monospace',
  'monospace' // 汎用等幅
];

// ヒラギノシリーズのバリエーション生成
const HIRAGINO_BASES = ['Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ ProN', 'ヒラギノ角ゴ Pro'];
const HIRAGINO_VARIANTS = [
  ...HIRAGINO_BASES,
  ...Array.from({ length: 9 }, (_, i) => i + 1).flatMap(w => HIRAGINO_BASES.map(b => `${b} W${w}`))
];

// 最終的なフォントファミリー配列
const GOTHIC_FAMILIES = [...new Set([...GOTHIC_FONT_FAMILIES, ...HIRAGINO_VARIANTS])]; // 重複排除を追加

// フォント設定（プレースホルダーを使用）
// リダイレクトルール: 範囲指定で全ウェイトをカバーする
// 100-599 → Regular woff2、600-900 → Bold woff2
// これにより font-weight: 500 (Medium) や 600 (SemiBold) もマッチする
const GOTHIC_CONFIGS = [
  {
    weight: 'Regular',
    localFonts: '__BODY_LOCAL_REGULAR__',
    webFont: '__BODY_WOFF2_REGULAR__',
    fontWeight: '100 599'
  },
  {
    weight: 'Bold',
    localFonts: '__BODY_LOCAL_BOLD__',
    webFont: '__BODY_WOFF2_BOLD__',
    fontWeight: '600 900'
  }
];

const MONO_CONFIGS = [
  {
    weight: 'Regular',
    localFonts: '__MONO_LOCAL_REGULAR__',
    webFont: '__MONO_WOFF2_REGULAR__',
    fontWeight: '100 599'
  },
  {
    weight: 'Bold',
    localFonts: '__MONO_LOCAL_BOLD__',
    webFont: '__MONO_WOFF2_BOLD__',
    fontWeight: '600 900'
  }
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

/**
 * @font-face ルールを生成（プレースホルダー版）
 */
function generateFontFace(fontFamily, config) {
  const quotedFontFamily = `"${fontFamily}"`;

  // localFonts がプレースホルダー文字列の場合はそのまま使用
  const localSources = config.localFonts;
  // 拡張機能IDが動的なため、プレースホルダーを使用し、Content Script側で置換する
  const webFontUrl = `url('__REPLACE_FONT_BASE__fonts/${config.webFont}') format('woff2')`;
  const srcParts = [localSources, webFontUrl];

  let rule = `@font-face {
  font-family: ${quotedFontFamily};
  src:  ${srcParts.join(',\n        ')};`;

  if (config.fontWeight) {
    rule += `\n  font-weight: ${config.fontWeight};`;
  }

  // display: swap は必須
  rule += `\n  font-display: swap;\n}`;

  return rule;
}

/**
 * CSS ファイルを生成するためのメインロジック
 * @param {object} outputConfig - 出力設定（ファイル名、タイトル、設定リスト）
 * @returns {string} 生成された CSS 内容
 */
function generateCSS(outputConfig) {
  /** @type {string} CSSファイルのヘッダー */
  const header = `@charset "UTF-8";`;

  /** @type {string} 共通のCSS変数によるフォント指定を上書きするスタイル定義（プレースホルダー版） */
  const variableOverrides = `
:root, :host, html, body, .prose, [class*="prose"], [class*="markdown"], [class*="content"], [class*="answer"], [class*="light"], [class*="dark"] {
  /* Sans-serif 系 CSS 変数 */
  --font-sans: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-inter: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-geist-sans: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-fk-grotesk: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-fkgrotesk: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-fk-grotesk-neue: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-fkgrotesk-neue: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-body: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-sans-brand: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-family-sans: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --tw-font-sans: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-anthropic-serif: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-anthropic-sans: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-ui: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-ui-serif: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-user-message: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-claude-response: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-sans-serif: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;
  --font-serif: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;

  /* Monospace 系 CSS 変数 */
  --font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-berkeley-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-geist-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-code: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-family-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-family-code: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --tw-font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --mono-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --code-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --monospace-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --pplx-font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
}

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播） */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
[style*="monospace"], [style*="ui-monospace"] {
  font-family: "__MONO_FONT_NAME__", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", __MONO_FONT_FALLBACK__ !important;
}
`;

  /** @type {string} 置換フォント自体の @font-face 定義（これがないとフォント名から woff2 を解決できない） */
  // リダイレクトルールと同じ範囲指定にして、中間ウェイト（500等）もカバーする
  const replacementFontFaces = `
/* 置換フォント自体の @font-face 定義 */
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__fonts/__BODY_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__fonts/__BODY_WOFF2_BOLD__') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__fonts/__MONO_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__fonts/__MONO_WOFF2_BOLD__') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
`;

  /** @type {string[]} 各セクション（Gothic/Mono）の @font-face ルール（既存フォント名のリダイレクト） */
  const sections = outputConfig.configs.map(item => {
    return item.families.map(family =>
      generateFontFace(family, item.config)
    ).join('\n');
  });

  return `${header}\n${variableOverrides}\n${replacementFontFaces}\n${sections.join('\n')}\n`;
}

// ---------------------------------------------
// プリセットCSS生成（事前ビルド方式）
// ---------------------------------------------

/**
 * プレースホルダー置換マップを構築する
 * @param {string} bodyKey - FONT_REGISTRY.body のキー
 * @param {string} monoKey - FONT_REGISTRY.mono のキー
 * @param {string} weight - '400' or '500'
 * @param {string} baseUrl - フォントファイルのベースURL
 * @returns {Object} プレースホルダー → 実際の値のマップ
 */
function buildPlaceholderMap(bodyKey, monoKey, weight, baseUrl) {
  const bodyFont = FONT_REGISTRY.body[bodyKey];
  const monoFont = FONT_REGISTRY.mono[monoKey];
  const bodyWoff2 = weight === '500' ? bodyFont.woff2Medium : bodyFont.woff2Regular;

  return {
    '__REPLACE_FONT_BASE__': baseUrl,
    '__BODY_FONT_NAME__': bodyFont.name,
    '__BODY_FONT_FALLBACK__': bodyFont.fallback,
    '__BODY_FONT_WEIGHT__': weight,
    '__BODY_LOCAL_REGULAR__': bodyFont.localFontsRegular.map(f => `local("${f}")`).join(', '),
    '__BODY_LOCAL_BOLD__': bodyFont.localFontsBold.map(f => `local("${f}")`).join(', '),
    '__BODY_WOFF2_REGULAR__': bodyWoff2,
    '__BODY_WOFF2_BOLD__': bodyFont.woff2Bold,
    '__MONO_FONT_NAME__': monoFont.name,
    '__MONO_FONT_FALLBACK__': monoFont.fallback,
    '__MONO_LOCAL_REGULAR__': monoFont.localFontsRegular.map(f => `local("${f}")`).join(', '),
    '__MONO_LOCAL_BOLD__': monoFont.localFontsBold.map(f => `local("${f}")`).join(', '),
    '__MONO_WOFF2_REGULAR__': monoFont.woff2Regular,
    '__MONO_WOFF2_BOLD__': monoFont.woff2Bold,
  };
}

/**
 * テンプレートCSSのプレースホルダーを一括置換する
 * @param {string} templateCSS - プレースホルダー入りテンプレートCSS
 * @param {Object} placeholderMap - 置換マップ
 * @returns {string} 解決済みCSS
 */
function resolveTemplate(templateCSS, placeholderMap) {
  const escaped = Object.keys(placeholderMap)
    .map(k => k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'));
  const regex = new RegExp(escaped.join('|'), 'g');
  return templateCSS.replace(regex, match => placeholderMap[match]);
}

/**
 * プリセットJSのファイル名を生成する（background.js と共通の命名規則）
 * @param {string} bodyKey - bodyフォントキー
 * @param {string} monoKey - monoフォントキー
 * @param {string} weight - '400' or '500'
 * @returns {string} ファイル名
 */
function getPresetFileName(bodyKey, monoKey, weight) {
  return `preset-${bodyKey}-${monoKey}-w${weight}.js`;
}

/**
 * CSSテキストをJSテンプレートリテラル内に埋め込むためにエスケープする
 * @param {string} css - エスケープ対象のCSSテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeForTemplateLiteral(css) {
  return css
    .replace(/\\/g, '\\\\')   // バックスラッシュ → \\
    .replace(/`/g, '\\`')     // バッククォート → \`
    .replace(/\$\{/g, '\\${'); // ${ → \${
}

/**
 * 全プリセットJSを生成する
 * JSファイル内で chrome.runtime.getURL('') を使い、
 * __REPLACE_FONT_BASE__ を実行時に拡張機能の絶対URLに置換する。
 * @param {string} templateCSS - プレースホルダー入りテンプレートCSS
 * @param {string} cssDir - 出力ディレクトリ
 */
function generatePresets(templateCSS, cssDir) {
  const bodyKeys = Object.keys(FONT_REGISTRY.body);
  const monoKeys = Object.keys(FONT_REGISTRY.mono);
  const weights = ['400', '500'];
  let count = 0;

  for (const bodyKey of bodyKeys) {
    for (const monoKey of monoKeys) {
      for (const weight of weights) {
        const fileName = getPresetFileName(bodyKey, monoKey, weight);
        // __REPLACE_FONT_BASE__ は実行時に chrome.runtime.getURL('') で置換するため残す
        const map = buildPlaceholderMap(bodyKey, monoKey, weight, '__REPLACE_FONT_BASE__');
        const resolvedCSS = resolveTemplate(templateCSS, map);
        // JSテンプレートリテラル内に埋め込むためにエスケープ
        const escapedCSS = escapeForTemplateLiteral(resolvedCSS);
        const jsContent = `(() => {
  const s = document.createElement('style');
  s.dataset.replaceFont = 'preset';
  s.textContent = \`${escapedCSS}\`.replace(/__REPLACE_FONT_BASE__/g, chrome.runtime.getURL(''));
  (document.head || document.documentElement).appendChild(s);
})();
`;
        const outputPath = path.join(cssDir, fileName);
        fs.writeFileSync(outputPath, jsContent, 'utf8');
        count++;
      }
    }
  }

  console.log(`✅ プリセット JS ${count} ファイルを生成しました`);
}

/**
 * メイン処理
 */
function main() {
  console.log('🎨 CSS ファイル生成を開始します...\n');

  const cssDir = path.join(__dirname, '../css');
  fs.mkdirSync(cssDir, { recursive: true });

  // 1. テンプレートCSS生成（プレースホルダー入り、Shadow DOM用フォールバック）
  for (const outputConfig of OUTPUT_CONFIGS) {
    const outputPath = path.join(cssDir, outputConfig.fileName);
    try {
      const templateCSS = generateCSS(outputConfig);
      fs.writeFileSync(outputPath, templateCSS, 'utf8');
      const totalFonts = outputConfig.configs.reduce((acc, curr) => acc + curr.families.length, 0);
      console.log(`✅ ${outputConfig.title} テンプレート CSS を生成しました: ${outputConfig.fileName} (フォント定義数: ${totalFonts})`);

      // 2. プリセットCSS生成（全フォント組み合わせの解決済みCSS）
      generatePresets(templateCSS, cssDir);
    } catch (error) {
      console.error(`❌ CSS の生成に失敗しました:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 CSS ファイル生成が完了しました！');
}

main();
