const fs = require('fs');
const path = require('path');
const { FONT_REGISTRY, getPresetFileName } = require('../src/content/font-config');

// 多言語対応: CJK 系文字のみを置換対象とする unicode-range
// Latin 文字は元サイトの指定 (Arial / Helvetica / system-ui 等) をそのまま尊重するため、
// 置換用 @font-face はこのレンジ内の文字だけを担当する。
// - U+3000-30FF: Japanese punctuation, hiragana, katakana
// - U+3400-4DBF: CJK Unified Ideographs Extension A
// - U+4E00-9FFF: CJK Unified Ideographs (common + rare kanji)
// - U+F900-FAFF: CJK Compatibility Ideographs
// - U+FF00-FFEF: Halfwidth / Fullwidth Forms
const CJK_UNICODE_RANGE = 'U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF';

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
  'Times New Roman', 'Times', 'Georgia'
  // 注: 'serif' / 'sans-serif' / 'monospace' などの CSS 汎用キーワードは
  // @font-face の font-family 指定として spec 上無効であり、ブラウザによっては
  // 未定義フォント扱いとなるため、置換対象には含めない。
  // 汎用キーワードへの対応は BODY_CSS_VARS / MONO_CSS_VARS の上書きで行う。
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
  'ui-monospace'
  // 'monospace' は CSS 汎用キーワードで @font-face の family 指定として無効
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

// variableOverrides で CSS 変数を直接宣言する prose / markdown 系クラス。
// editable 配下に出現すると直接宣言が継承より強く当たるため、除外ゾーンでも reset 必要。
// '.prose' は '[class*="prose"]' が exact match もカバーするため省略。
// 注: 'content' / 'answer' / 'light' / 'dark' などの汎用ワードは class 名として広く
// 使われており、例えば Material-UI の '.content' やアイコン系の '.dark' を巻き込む
// ため、明示的に prose/markdown に絞る (#P0 対応)。
const VAR_OVERRIDE_CLASS_SELECTORS = [
  '[class*="prose"]', '[class*="markdown"]',
];

// variableOverrides の対象セレクタ（:root 等のルート系 + クラス系の合成）
const VAR_OVERRIDE_SELECTORS = [
  ':root', ':host', 'html', 'body',
  ...VAR_OVERRIDE_CLASS_SELECTORS,
];

// 強制mono指定の対象要素（pre/code系）。[style*="monospace"] / [style*="ui-monospace"]
// はインライン指定用で別途扱う
const MONO_FORCE_TARGETS = [
  'pre', 'code', 'kbd', 'samp', '.mono',
  '[class*="font-mono"]',
  '[class*="codeblock"]',
  '[class*="shiki"]',
  '[class*="hljs"]',
  '[class*="prism"]',
  '[class*="language-"]',
];

/**
 * editable 領域自身 + editable 配下を除外するためのセレクタ群を返す。
 * ':not(:where(...))' 内で使用することで specificity を増やさずに除外できる。
 */
function buildEditableExclusionList() {
  return [
    ...EDITABLE_SELECTORS,
    ...EDITABLE_SELECTORS.map(s => `${s} *`),
  ].join(', ');
}

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
  const monoForceCompound = MONO_FORCE_TARGETS.join(', ');
  // :where() で包むことで :not() の specificity 寄与を 0 にし、元の (0,1,1) を維持
  // → 除外ゾーンで編集領域を飛ばしつつ、非編集領域では既存の cascade 挙動を保つ
  const editableExclusion = buildEditableExclusionList();

  return `
${selector} {
  /* Sans-serif 系 CSS 変数 */
${bodyVarsSet}

  /* Monospace 系 CSS 変数 */
${monoVarsSet}
}

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播）。
   editable 領域および editable 配下は ':not(:where(...))' で除外する。
   ':where()' で specificity を 0 にすることで、非編集領域での specificity を
   元の (0,1,1) のまま維持し、site の pre/code スタイルへの影響を最小化する。
   editable 配下で我々の強制mono指定自体が発火しないため、site の author mono
   宣言（!important の有無によらず）が正しく適用される（Codex レビュー指摘対応）。 */
:root :is(${monoForceCompound}):not(:where(${editableExclusion})),
:host :is(${monoForceCompound}):not(:where(${editableExclusion})),
[style*="monospace"]:not(:where(${editableExclusion})),
[style*="ui-monospace"]:not(:where(${editableExclusion})) {
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
 * - mono 系要素への強制指定は buildVariableOverrides() 側で editable 配下を
 *   ':not(:where(...))' で除外済みのため、除外ゾーン側では pre/code 向けルールは不要
 * - @font-face 再定義（Layer 2）はドキュメントグローバルで要素スコープ化不可。
 *   モダンRTEは主にCSS変数経由のため実用上これで大半をカバー
 * - specificity: ':is(:root, :host) :is(editable)' で (0,2,0) を確保し、
 *   variableOverrides の (0,1,0) に勝つ
 */
function buildExclusionZone() {
  const editableList = EDITABLE_SELECTORS.map(s => `  ${s}`).join(',\n');
  const bodyVarsReset = BODY_CSS_VARS.map(v => `  ${v}: initial !important;`).join('\n');
  const monoVarsReset = MONO_CSS_VARS.map(v => `  ${v}: initial !important;`).join('\n');
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

/* Block 2: editable 配下に出現する prose / markdown / content / dark 系クラスへ
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
 *
 * 多言語対応: 外部サイトのフォント (Arial / Helvetica / Segoe UI 等) を
 * 置換対象とする場合、unicode-range を CJK に限定することで Latin 文字は
 * オリジナルのフォント指定 (システムの Arial 等) をそのまま残す。
 * これにより英語中心のサイトでも見た目が不自然にならない。
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
  rule += `\n  font-display: swap;`;
  // CJK のみ置換 → Latin は元サイトのフォント指定にフォールバック
  rule += `\n  unicode-range: ${CJK_UNICODE_RANGE};`;
  rule += `\n}`;

  return rule;
}

/**
 * CSS ファイルを生成するためのメインロジック
 * @param {object} outputConfig - 出力設定（ファイル名、タイトル、設定リスト）
 * @returns {string} 生成された CSS 内容
 */
function generateCSS(outputConfig) {
  /** @type {string} CSSファイルのヘッダー */
  const header = `@charset "UTF-8";
/* ============================================================================
 * DO NOT EDIT — このファイルは scripts/generate-css.js により自動生成されます。
 * 変更は scripts/generate-css.js か src/content/font-config.js を編集し、
 * npm run generate-css を実行してください。
 * ============================================================================ */`;

  // CSS変数上書き定義 (BODY_CSS_VARS / MONO_CSS_VARS から生成、除外ゾーンと同期)
  const variableOverrides = buildVariableOverrides();
  const exclusionZone = buildExclusionZone();

  /** @type {string} 置換フォント自体の @font-face 定義（これがないとフォント名から woff2 を解決できない）
   * 多言語対応: unicode-range を CJK に限定することで、例えば
   * `font-family: "Noto Sans JP", sans-serif` が適用された Latin 文字は
   * 2nd fallback (sans-serif / ユーザシステムのネイティブフォント) に落ちる。
   * 日本語だけ我々のフォント、Latin は元のまま、という挙動になる。 */
  const replacementFontFaces = `
/* 置換フォント自体の @font-face 定義 (unicode-range で CJK に限定) */
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: ${CJK_UNICODE_RANGE};
}
@font-face {
  font-family: "__BODY_FONT_NAME__";
  src:  __BODY_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__BODY_WOFF2_BOLD__') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: ${CJK_UNICODE_RANGE};
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_REGULAR__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_REGULAR__') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: ${CJK_UNICODE_RANGE};
}
@font-face {
  font-family: "__MONO_FONT_NAME__";
  src:  __MONO_LOCAL_BOLD__,
        url('__REPLACE_FONT_BASE__src/fonts/__MONO_WOFF2_BOLD__') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: ${CJK_UNICODE_RANGE};
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

// プレースホルダーキー一覧は全プリセットで共通 (同じ buildPlaceholderMap 形式) のため
// 正規表現を 1 度だけコンパイルしてキャッシュする (36 回の再コンパイルを回避)
let _placeholderRegexCache = null;
function getPlaceholderRegex(keys) {
  if (_placeholderRegexCache) return _placeholderRegexCache;
  const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
  _placeholderRegexCache = new RegExp(escaped.join('|'), 'g');
  return _placeholderRegexCache;
}

/**
 * テンプレートCSSのプレースホルダーを一括置換する
 * @param {string} templateCSS - プレースホルダー入りテンプレートCSS
 * @param {Object} placeholderMap - 置換マップ
 * @returns {string} 解決済みCSS
 */
function resolveTemplate(templateCSS, placeholderMap) {
  const regex = getPlaceholderRegex(Object.keys(placeholderMap));
  return templateCSS.replace(regex, match => placeholderMap[match]);
}

/**
 * CSSテキストをJSテンプレートリテラル内に埋め込むためにエスケープする
 * バックスラッシュ・バッククォート・${ を単一スキャンで処理する (以前の 3 パス実装を統合)
 * @param {string} css - エスケープ対象のCSSテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeForTemplateLiteral(css) {
  return css.replace(/[\\`]|\$\{/g, (m) => {
    if (m === '\\') return '\\\\';
    if (m === '`') return '\\`';
    return '\\${';
  });
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
        const jsContent = `// DO NOT EDIT — このファイルは scripts/generate-css.js により自動生成されます。
// ${fileName} (body=${bodyKey}, mono=${monoKey}, weight=${weight})
(() => {
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
