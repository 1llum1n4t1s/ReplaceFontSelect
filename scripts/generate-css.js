const fs = require('fs');
const path = require('path');

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

// ヒラギノシリーズのバリエーション生成（既存ロジック維持）
const HIRAGINO_WEIGHTS = Array.from({ length: 9 }, (_, i) => i + 1);
const HIRAGINO_VARIANTS = [];
for (const weight of HIRAGINO_WEIGHTS) {
  HIRAGINO_VARIANTS.push(`Hiragino Kaku Gothic ProN W${weight}`);
  HIRAGINO_VARIANTS.push(`Hiragino Kaku Gothic Pro W${weight}`);
  HIRAGINO_VARIANTS.push(`ヒラギノ角ゴ ProN W${weight}`);
  HIRAGINO_VARIANTS.push(`ヒラギノ角ゴ Pro W${weight}`);
}
HIRAGINO_VARIANTS.unshift('Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ ProN', 'ヒラギノ角ゴ Pro');

// 最終的なフォントファミリー配列
const GOTHIC_FAMILIES = [...new Set([...GOTHIC_FONT_FAMILIES, ...HIRAGINO_VARIANTS])]; // 重複排除を追加

// フォント設定（プレースホルダーを使用）
const GOTHIC_CONFIGS = [
  {
    weight: 'Regular',
    localFonts: '__BODY_LOCAL_REGULAR__',
    webFont: '__BODY_WOFF2_REGULAR__',
    fontWeight: null
  },
  {
    weight: 'Bold',
    localFonts: '__BODY_LOCAL_BOLD__',
    webFont: '__BODY_WOFF2_BOLD__',
    fontWeight: 'bold'
  }
];

const MONO_CONFIGS = [
  {
    weight: 'Regular',
    localFonts: '__MONO_LOCAL_REGULAR__',
    webFont: '__MONO_WOFF2_REGULAR__',
    fontWeight: null
  },
  {
    weight: 'Bold',
    localFonts: '__MONO_LOCAL_BOLD__',
    webFont: '__MONO_WOFF2_BOLD__',
    fontWeight: 'bold'
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

  /* Monospace 系 CSS 変数 */
  --font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-berkeley-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-geist-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-code: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-family-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --tw-font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --mono-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --code-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --font-family-code: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --monospace-font: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
  --pplx-font-mono: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;
}

/* 汎用的な等幅フォント要素に対する強制指定（詳細度を高めて上書きを確実に） */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]) :not(i, .icon, [class*="icon"], [class*="Icon"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]) :not(i, .icon, [class*="icon"], [class*="Icon"]),
[style*="monospace"], [style*="ui-monospace"] {
  font-family: "__MONO_FONT_NAME__", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", __MONO_FONT_FALLBACK__ !important;
}
`;

  /** @type {string[]} 各セクション（Gothic/Mono）の @font-face ルール */
  const sections = outputConfig.configs.map(item => {
    return item.families.map(family =>
      generateFontFace(family, item.config)
    ).join('\n');
  });

  return `${header}\n${variableOverrides}\n${sections.join('\n')}\n`;
}

/**
 * メイン処理
 */
async function main() {
  console.log('🎨 CSS ファイル生成を開始します...\n');

  const cssDir = path.join(__dirname, '../css');

  // css ディレクトリの確認
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  // 各設定ごとに CSS を生成
  for (const outputConfig of OUTPUT_CONFIGS) {
    const outputPath = path.join(cssDir, outputConfig.fileName);
    const cssContent = generateCSS(outputConfig);

    try {
      fs.writeFileSync(outputPath, cssContent, 'utf8');
      console.log(`✅ ${outputConfig.title} CSS を生成しました: ${outputConfig.fileName}`);
      const totalFonts = outputConfig.configs.reduce((acc, curr) => acc + curr.families.length, 0);
      console.log(`   - フォント定義数: ${totalFonts}`);
    } catch (error) {
      console.error(`❌ ${outputConfig.title} CSS の生成に失敗しました:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 CSS ファイル生成が完了しました！');
  console.log('\n📂 生成されたファイル:');
  OUTPUT_CONFIGS.forEach(config => {
    console.log(`   - css/${config.fileName}`);
  });
}

main().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
