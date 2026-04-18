// DO NOT EDIT — このファイルは scripts/generate-css.js により自動生成されます。
// preset-murecho-plemoljp-w500.js (body=murecho, mono=plemoljp, weight=500)
(() => {
  const s = document.createElement('style');
  s.dataset.replaceFont = 'preset';
  s.textContent = `@charset "UTF-8";
/* ============================================================================
 * DO NOT EDIT — このファイルは scripts/generate-css.js により自動生成されます。
 * 変更は scripts/generate-css.js か src/content/font-config.js を編集し、
 * npm run generate-css を実行してください。
 * ============================================================================ */

:root, :host, html, body, [class*="prose"], [class*="markdown"] {
  /* Sans-serif 系 CSS 変数 */
  --font-sans: "Murecho", sans-serif !important;
  --font-inter: "Murecho", sans-serif !important;
  --font-geist-sans: "Murecho", sans-serif !important;
  --font-fk-grotesk: "Murecho", sans-serif !important;
  --font-fkgrotesk: "Murecho", sans-serif !important;
  --font-fk-grotesk-neue: "Murecho", sans-serif !important;
  --font-fkgrotesk-neue: "Murecho", sans-serif !important;
  --font-body: "Murecho", sans-serif !important;
  --font-sans-brand: "Murecho", sans-serif !important;
  --font-family-sans: "Murecho", sans-serif !important;
  --tw-font-sans: "Murecho", sans-serif !important;
  --font-anthropic-serif: "Murecho", sans-serif !important;
  --font-anthropic-sans: "Murecho", sans-serif !important;
  --font-ui: "Murecho", sans-serif !important;
  --font-ui-serif: "Murecho", sans-serif !important;
  --font-user-message: "Murecho", sans-serif !important;
  --font-claude-response: "Murecho", sans-serif !important;
  --font-sans-serif: "Murecho", sans-serif !important;
  --font-serif: "Murecho", sans-serif !important;

  /* Monospace 系 CSS 変数 */
  --font-mono: "PlemolJP", monospace !important;
  --font-berkeley-mono: "PlemolJP", monospace !important;
  --font-geist-mono: "PlemolJP", monospace !important;
  --font-code: "PlemolJP", monospace !important;
  --font-family-mono: "PlemolJP", monospace !important;
  --font-family-code: "PlemolJP", monospace !important;
  --tw-font-mono: "PlemolJP", monospace !important;
  --mono-font: "PlemolJP", monospace !important;
  --code-font: "PlemolJP", monospace !important;
  --monospace-font: "PlemolJP", monospace !important;
  --pplx-font-mono: "PlemolJP", monospace !important;
}

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播）。
   editable 領域および editable 配下は ':not(:where(...))' で除外する。
   ':where()' で specificity を 0 にすることで、非編集領域での specificity を
   元の (0,1,1) のまま維持し、site の pre/code スタイルへの影響を最小化する。
   editable 配下で我々の強制mono指定自体が発火しないため、site の author mono
   宣言（!important の有無によらず）が正しく適用される（Codex レビュー指摘対応）。 */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]):not(:where([contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], input, textarea, [role="textbox"], .ProseMirror, .ql-editor, .mce-content-body, .cke_editable, .CodeMirror, .cm-editor, .monaco-editor, .ace_editor, [contenteditable="true"] *, [contenteditable=""] *, [contenteditable="plaintext-only"] *, input *, textarea *, [role="textbox"] *, .ProseMirror *, .ql-editor *, .mce-content-body *, .cke_editable *, .CodeMirror *, .cm-editor *, .monaco-editor *, .ace_editor *)),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]):not(:where([contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], input, textarea, [role="textbox"], .ProseMirror, .ql-editor, .mce-content-body, .cke_editable, .CodeMirror, .cm-editor, .monaco-editor, .ace_editor, [contenteditable="true"] *, [contenteditable=""] *, [contenteditable="plaintext-only"] *, input *, textarea *, [role="textbox"] *, .ProseMirror *, .ql-editor *, .mce-content-body *, .cke_editable *, .CodeMirror *, .cm-editor *, .monaco-editor *, .ace_editor *)),
[style*="monospace"]:not(:where([contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], input, textarea, [role="textbox"], .ProseMirror, .ql-editor, .mce-content-body, .cke_editable, .CodeMirror, .cm-editor, .monaco-editor, .ace_editor, [contenteditable="true"] *, [contenteditable=""] *, [contenteditable="plaintext-only"] *, input *, textarea *, [role="textbox"] *, .ProseMirror *, .ql-editor *, .mce-content-body *, .cke_editable *, .CodeMirror *, .cm-editor *, .monaco-editor *, .ace_editor *)),
[style*="ui-monospace"]:not(:where([contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], input, textarea, [role="textbox"], .ProseMirror, .ql-editor, .mce-content-body, .cke_editable, .CodeMirror, .cm-editor, .monaco-editor, .ace_editor, [contenteditable="true"] *, [contenteditable=""] *, [contenteditable="plaintext-only"] *, input *, textarea *, [role="textbox"] *, .ProseMirror *, .ql-editor *, .mce-content-body *, .cke_editable *, .CodeMirror *, .cm-editor *, .monaco-editor *, .ace_editor *)) {
  font-family: "PlemolJP", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", monospace !important;
}


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
  [contenteditable="true"],
  [contenteditable=""],
  [contenteditable="plaintext-only"],
  input,
  textarea,
  [role="textbox"],
  .ProseMirror,
  .ql-editor,
  .mce-content-body,
  .cke_editable,
  .CodeMirror,
  .cm-editor,
  .monaco-editor,
  .ace_editor
) {
  --font-sans: initial !important;
  --font-inter: initial !important;
  --font-geist-sans: initial !important;
  --font-fk-grotesk: initial !important;
  --font-fkgrotesk: initial !important;
  --font-fk-grotesk-neue: initial !important;
  --font-fkgrotesk-neue: initial !important;
  --font-body: initial !important;
  --font-sans-brand: initial !important;
  --font-family-sans: initial !important;
  --tw-font-sans: initial !important;
  --font-anthropic-serif: initial !important;
  --font-anthropic-sans: initial !important;
  --font-ui: initial !important;
  --font-ui-serif: initial !important;
  --font-user-message: initial !important;
  --font-claude-response: initial !important;
  --font-sans-serif: initial !important;
  --font-serif: initial !important;

  --font-mono: initial !important;
  --font-berkeley-mono: initial !important;
  --font-geist-mono: initial !important;
  --font-code: initial !important;
  --font-family-mono: initial !important;
  --font-family-code: initial !important;
  --tw-font-mono: initial !important;
  --mono-font: initial !important;
  --code-font: initial !important;
  --monospace-font: initial !important;
  --pplx-font-mono: initial !important;
}

/* Block 2: editable 配下に出現する prose / markdown / content / dark 系クラスへ
   の直接宣言（variableOverrides の '[class*="content"]' 等への !important 指定）は
   継承より強く当たるため、ここで再度 initial に reset する */
:is(:root, :host) :is(
  [contenteditable="true"],
  [contenteditable=""],
  [contenteditable="plaintext-only"],
  input,
  textarea,
  [role="textbox"],
  .ProseMirror,
  .ql-editor,
  .mce-content-body,
  .cke_editable,
  .CodeMirror,
  .cm-editor,
  .monaco-editor,
  .ace_editor
) :is([class*="prose"], [class*="markdown"]) {
  --font-sans: initial !important;
  --font-inter: initial !important;
  --font-geist-sans: initial !important;
  --font-fk-grotesk: initial !important;
  --font-fkgrotesk: initial !important;
  --font-fk-grotesk-neue: initial !important;
  --font-fkgrotesk-neue: initial !important;
  --font-body: initial !important;
  --font-sans-brand: initial !important;
  --font-family-sans: initial !important;
  --tw-font-sans: initial !important;
  --font-anthropic-serif: initial !important;
  --font-anthropic-sans: initial !important;
  --font-ui: initial !important;
  --font-ui-serif: initial !important;
  --font-user-message: initial !important;
  --font-claude-response: initial !important;
  --font-sans-serif: initial !important;
  --font-serif: initial !important;

  --font-mono: initial !important;
  --font-berkeley-mono: initial !important;
  --font-geist-mono: initial !important;
  --font-code: initial !important;
  --font-family-mono: initial !important;
  --font-family-code: initial !important;
  --tw-font-mono: initial !important;
  --mono-font: initial !important;
  --code-font: initial !important;
  --monospace-font: initial !important;
  --pplx-font-mono: initial !important;
}


/* 置換フォント自体の @font-face 定義 (unicode-range で CJK に限定) */
@font-face {
  font-family: "Murecho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Murecho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "PlemolJP";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "PlemolJP";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}

@font-face {
  font-family: "MS PGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "メイリオ";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Meiryo";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Arial";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ArialMT";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roboto";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Helvetica";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Verdana";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Public Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roobert";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ABC Social";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Graphik";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Manrope";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Poppins";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Outfit";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Signifer";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "system-ui";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "-apple-system";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "San Francisco";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Open Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Lato";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Montserrat";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Oswald";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Raleway";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游明朝体";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Times";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Georgia";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS PGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "メイリオ";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Meiryo";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Arial";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ArialMT";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roboto";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Helvetica";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Verdana";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inter UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Public Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roobert";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FK Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ABC Social";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Graphik";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Manrope";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Poppins";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Outfit";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Signifer";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "system-ui";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "-apple-system";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "San Francisco";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Open Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Lato";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Montserrat";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Oswald";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Raleway";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "YuMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "游明朝体";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Times";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Georgia";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__src/fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms gothic";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Consolas";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Monaco";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Courier New";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Courier";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Menlo";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Fira Code";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "SF Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms gothic";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Consolas";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Monaco";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Courier New";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Courier";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Menlo";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Fira Code";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "SF Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
  unicode-range: U+3000-30FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FF00-FFEF;
}
`.replace(/__REPLACE_FONT_BASE__/g, chrome.runtime.getURL(''));
  (document.head || document.documentElement).appendChild(s);
})();
