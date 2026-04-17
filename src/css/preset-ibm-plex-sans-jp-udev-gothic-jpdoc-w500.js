(() => {
  const s = document.createElement('style');
  s.dataset.replaceFont = 'preset';
  s.textContent = `@charset "UTF-8";

:root, :host, html, body, [class*="prose"], [class*="markdown"], [class*="content"], [class*="answer"], [class*="light"], [class*="dark"] {
  /* Sans-serif 系 CSS 変数 */
  --font-sans: "IBM Plex Sans JP", sans-serif !important;
  --font-inter: "IBM Plex Sans JP", sans-serif !important;
  --font-geist-sans: "IBM Plex Sans JP", sans-serif !important;
  --font-fk-grotesk: "IBM Plex Sans JP", sans-serif !important;
  --font-fkgrotesk: "IBM Plex Sans JP", sans-serif !important;
  --font-fk-grotesk-neue: "IBM Plex Sans JP", sans-serif !important;
  --font-fkgrotesk-neue: "IBM Plex Sans JP", sans-serif !important;
  --font-body: "IBM Plex Sans JP", sans-serif !important;
  --font-sans-brand: "IBM Plex Sans JP", sans-serif !important;
  --font-family-sans: "IBM Plex Sans JP", sans-serif !important;
  --tw-font-sans: "IBM Plex Sans JP", sans-serif !important;
  --font-anthropic-serif: "IBM Plex Sans JP", sans-serif !important;
  --font-anthropic-sans: "IBM Plex Sans JP", sans-serif !important;
  --font-ui: "IBM Plex Sans JP", sans-serif !important;
  --font-ui-serif: "IBM Plex Sans JP", sans-serif !important;
  --font-user-message: "IBM Plex Sans JP", sans-serif !important;
  --font-claude-response: "IBM Plex Sans JP", sans-serif !important;
  --font-sans-serif: "IBM Plex Sans JP", sans-serif !important;
  --font-serif: "IBM Plex Sans JP", sans-serif !important;

  /* Monospace 系 CSS 変数 */
  --font-mono: "UDEV Gothic JPDOC", monospace !important;
  --font-berkeley-mono: "UDEV Gothic JPDOC", monospace !important;
  --font-geist-mono: "UDEV Gothic JPDOC", monospace !important;
  --font-code: "UDEV Gothic JPDOC", monospace !important;
  --font-family-mono: "UDEV Gothic JPDOC", monospace !important;
  --font-family-code: "UDEV Gothic JPDOC", monospace !important;
  --tw-font-mono: "UDEV Gothic JPDOC", monospace !important;
  --mono-font: "UDEV Gothic JPDOC", monospace !important;
  --code-font: "UDEV Gothic JPDOC", monospace !important;
  --monospace-font: "UDEV Gothic JPDOC", monospace !important;
  --pplx-font-mono: "UDEV Gothic JPDOC", monospace !important;
}

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播） */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
[style*="monospace"], [style*="ui-monospace"] {
  font-family: "UDEV Gothic JPDOC", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", monospace !important;
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

/* Block 2: editable 配下の mono 系要素および editable 自身が mono 系要素。
   我々の ':root :is(pre, code, ...) { font-family: MONO !important }' 強制
   指定 (specificity 0,1,1) を打ち消す。'revert' だと site の pre/code スタイル
   まで落とすため、'inherit !important' で親 (editable コンテナ) の font-family
   を継承 — 破壊を最小化しつつ我々の強制指定のみ打ち消す。
   子孫結合子版と compound 版で <pre contenteditable> のようなケースもカバー。
   specificity (0,2,1): 強制mono (0,1,1) に勝つ */
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
) :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"], [style*="monospace"], [style*="ui-monospace"]),
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
):is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"], [style*="monospace"], [style*="ui-monospace"]) {
  font-family: inherit !important;
}

/* Block 3: editable 配下に出現する prose / markdown / content / dark 系クラスへ
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
) :is([class*="prose"], [class*="markdown"], [class*="content"], [class*="answer"], [class*="light"], [class*="dark"]) {
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


/* 置換フォント自体の @font-face 定義 */
@font-face {
  font-family: "IBM Plex Sans JP";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Sans JP";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}

@font-face {
  font-family: "MS PGothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "メイリオ";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Arial";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ArialMT";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Verdana";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter UI";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roobert";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Display";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ABC Social";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Graphik";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Manrope";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Poppins";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Outfit";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Signifer";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "system-ui";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-serif";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "-apple-system";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "San Francisco";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Open Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Lato";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Montserrat";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Oswald";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Raleway";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms mincho";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuMincho";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游明朝";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游明朝体";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Times";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Georgia";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "serif";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "sans-serif";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("IBM Plex Sans JP"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Medium.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS PGothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "メイリオ";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Arial";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ArialMT";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Verdana";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter UI";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roobert";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Display";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ABC Social";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Graphik";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Manrope";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Poppins";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Outfit";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Signifer";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "system-ui";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-serif";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "-apple-system";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "San Francisco";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Open Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Lato";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Montserrat";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Oswald";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Raleway";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms mincho";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuMincho";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游明朝";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游明朝体";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Times";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Georgia";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "serif";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "sans-serif";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("IBM Plex Sans JP Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/IBMPlexSansJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms gothic";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Consolas";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Monaco";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Courier New";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Courier";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Menlo";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Fira Code";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "SF Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "monospace";
  src:  local("UDEV Gothic JPDOC"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms gothic";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Consolas";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Monaco";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Courier New";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Courier";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Menlo";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Fira Code";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "SF Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "monospace";
  src:  local("UDEV Gothic JPDOC Bold"),
        url('__REPLACE_FONT_BASE__src/fonts/UDEVGothicJPDOC-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
`.replace(/__REPLACE_FONT_BASE__/g, chrome.runtime.getURL(''));
  (document.head || document.documentElement).appendChild(s);
})();
