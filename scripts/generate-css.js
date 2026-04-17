const fs = require('fs');
const path = require('path');
const { FONT_REGISTRY } = require('../src/content/font-config');

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

// ---------------------------------------------
// CSS変数・セレクタの単一の真実の源泉
// variableOverrides と除外ゾーンの両方が参照するため、ここに追加するだけで
// 両方のルールに自動反映される（重複定義不要）
// ---------------------------------------------

const BODY_CSS_VARS = [
  '--font-sans', '--font-inter', '--font-geist-sans',
  '--font-fk-grotesk', '--font-fkgrotesk',
  '--font-fk-grotesk-neue', '--font-fkgrotesk-neue',
  '--font-body', '--font-sans-brand', '--font-family-sans', '--tw-font-sans',
  '--font-anthropic-serif', '--font-anthropic-sans',
  '--font-ui', '--font-ui-serif',
  '--font-user-message', '--font-claude-response',
  '--font-sans-serif', '--font-serif',
];

const MONO_CSS_VARS = [
  '--font-mono', '--font-berkeley-mono', '--font-geist-mono', '--font-code',
  '--font-family-mono', '--font-family-code', '--tw-font-mono',
  '--mono-font', '--code-font', '--monospace-font', '--pplx-font-mono',
];

// 編集可能領域として判定するDOMセレクタ（RTE / 入力フィールド / コードエディタ）
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

// variableOverrides で CSS 変数を直接宣言する prose / markdown / dark 系クラス。
// editable 配下に出現すると直接宣言が継承より強く当たるため、除外ゾーンでも reset 必要。
// '.prose' は '[class*="prose"]' が exact match もカバーするため省略
const VAR_OVERRIDE_CLASS_SELECTORS = [
  '[class*="prose"]', '[class*="markdown"]',
  '[class*="content"]', '[class*="answer"]',
  '[class*="light"]', '[class*="dark"]',
];

// variableOverrides の対象セレクタ（:root 等のルート系 + クラス系の合成）
const VAR_OVERRIDE_SELECTORS = [
  ':root', ':host', 'html', 'body',
  ...VAR_OVERRIDE_CLASS_SELECTORS,
];

// 強制mono指定の対象要素（pre/code系 + [style*="monospace"]系）。
// Block 2 で editable 配下の子孫 + editable 自身（compound）の両方に対して revert する
const MONO_FORCE_TARGETS = [
  'pre', 'code', 'kbd', 'samp', '.mono',
  '[class*="font-mono"]',
  '[class*="codeblock"]',
  '[class*="shiki"]',
  '[class*="hljs"]',
  '[class*="prism"]',
  '[class*="language-"]',
  '[style*="monospace"]',
  '[style*="ui-monospace"]',
];

/**
 * 拡張機能の CSS 変数上書きルール（variableOverrides）を構築する。
 * BODY_CSS_VARS / MONO_CSS_VARS を単一の真実の源泉として参照し、除外ゾーンとの
 * 同期ズレを防ぐ。
 */
function buildVariableOverrides() {
  const selector = VAR_OVERRIDE_SELECTORS.join(', ');
  const bodyVarsSet = BODY_CSS_VARS
    .map(v => `  ${v}: "__BODY_FONT_NAME__", __BODY_FONT_FALLBACK__ !important;`)
    .join('\n');
  const monoVarsSet = MONO_CSS_VARS
    .map(v => `  ${v}: "__MONO_FONT_NAME__", __MONO_FONT_FALLBACK__ !important;`)
    .join('\n');

  return `
${selector} {
  /* Sans-serif 系 CSS 変数 */
${bodyVarsSet}

  /* Monospace 系 CSS 変数 */
${monoVarsSet}
}

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播） */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
[style*="monospace"], [style*="ui-monospace"] {
  font-family: "__MONO_FONT_NAME__", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", __MONO_FONT_FALLBACK__ !important;
}
`;
}

/**
 * 編集可能領域（RTE / スプレッドシート / ブログエディタ等）でフォント置換を
 * 無効化する除外ゾーンCSSを構築する。DOM構造で判別するためドメインリスト不要。
 *
 * 仕組み:
 * - CSS変数（Layer 1）は inherited のため 'revert' は親継承してしまう。'initial'
 *   で guaranteed-invalid value にすると子孫の var() は fallback または IACVT に落ちる
 * - font-family は意図的に revert しない — 'revert' は author origin 全体の宣言を
 *   落とすため、site/editor 自身のフォント指定まで壊す（Codex レビュー指摘）
 * - @font-face 再定義（Layer 2）はドキュメントグローバルで要素スコープ化不可。
 *   モダンRTEは主にCSS変数経由のため実用上これで大半をカバー
 * - specificity: ':is(:root, :host) :is(editable)' で (0,2,0) を確保し、
 *   variableOverrides の (0,1,0) や強制mono :root :is(pre,...) の (0,1,1) に勝つ
 */
function buildExclusionZone() {
  const editableList = EDITABLE_SELECTORS.map(s => `  ${s}`).join(',\n');
  const bodyVarsReset = BODY_CSS_VARS.map(v => `  ${v}: initial !important;`).join('\n');
  const monoVarsReset = MONO_CSS_VARS.map(v => `  ${v}: initial !important;`).join('\n');
  const monoTargets = MONO_FORCE_TARGETS.join(', ');
  const overrideClassTargets = VAR_OVERRIDE_CLASS_SELECTORS.join(', ');

  return `
/* ============================================================================
   編集可能領域（RTE / 入力フィールド / コードエディタ）の除外ゾーン
   ブラウザ上でフォントを選択して編集するアプリと、ブログエディタのリッチテキスト
   入力エリアで拡張機能のフォント置換を無効化する。DOM構造で判別するためドメイン
   リストのメンテナンス不要。詳細は buildExclusionZone() のJSDoc参照
   ============================================================================ */

/* Block 1: editable 要素自身の CSS 変数を無効化。
   font-family は意図的に revert しない — author-origin の 'revert' は site/editor
   自身の宣言も同じ origin として落とすため、WYSIWYG エディタが JS で inline style
   を適用するフォント選択 (<span style="font-family:Arial">) や、site CSS の
   'input { font-family: ... }' が壊れる (Codex レビュー指摘)。
   CSS 変数を initial (guaranteed-invalid) に reset するだけで、モダンRTEの
   フレームワーク（Tailwind/Next.js 等）が CSS 変数経由で指定するフォントは
   無効化でき、同時に inline style / site 直接指定は保持される。
   specificity (0,2,0): variableOverrides (0,1,0) に勝つ */
:is(:root, :host) :is(
${editableList}
) {
${bodyVarsReset}

${monoVarsReset}
}

/* Block 2: editable 配下の mono 系要素および editable 自身が mono 系要素。
   我々の ':root :is(pre, code, ...) { font-family: MONO !important }' 強制
   指定 (specificity 0,1,1) を打ち消す。'revert' だと site の pre/code スタイル
   まで落とすため、'inherit !important' で親 (editable コンテナ) の font-family
   を継承 — 破壊を最小化しつつ我々の強制指定のみ打ち消す。
   子孫結合子版と compound 版で <pre contenteditable> のようなケースもカバー。
   specificity (0,2,1): 強制mono (0,1,1) に勝つ */
:is(:root, :host) :is(
${editableList}
) :is(${monoTargets}),
:is(:root, :host) :is(
${editableList}
):is(${monoTargets}) {
  font-family: inherit !important;
}

/* Block 3: editable 配下に出現する prose / markdown / content / dark 系クラスへ
   の直接宣言（variableOverrides の '[class*="content"]' 等への !important 指定）は
   継承より強く当たるため、ここで再度 initial に reset する */
:is(:root, :host) :is(
${editableList}
) :is(${overrideClassTargets}) {
${bodyVarsReset}

${monoVarsReset}
}
`;
}

/**
 * @font-face ルールを生成（プレースホルダー版）
 */
function generateFontFace(fontFamily, config) {
  const quotedFontFamily = `"${fontFamily}"`;

  // localFonts がプレースホルダー文字列の場合はそのまま使用
  const localSources = config.localFonts;
  // 拡張機能IDが動的なため、プレースホルダーを使用し、Content Script側で置換する
  const webFontUrl = `url('__REPLACE_FONT_BASE__src/fonts/${config.webFont}') format('woff2')`;
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

  // CSS変数上書き定義 (BODY_CSS_VARS / MONO_CSS_VARS から生成、除外ゾーンと同期)
  const variableOverrides = buildVariableOverrides();
  const exclusionZone = buildExclusionZone();

  /** @type {string} 置換フォント自体の @font-face 定義（これがないとフォント名から woff2 を解決できない） */
  // リダイレクトルールと同じ範囲指定にして、中間ウェイト（500等）もカバーする
  const replacementFontFaces = `
/* 置換フォント自体の @font-face 定義 */
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_BOLD__') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_BOLD__') format('woff2');
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

  return `${header}\n${variableOverrides}\n${exclusionZone}\n${replacementFontFaces}\n${sections.join('\n')}\n`;
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

  const cssDir = path.join(__dirname, '../src/css');
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
