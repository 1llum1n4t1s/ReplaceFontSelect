(() => {
  const s = document.createElement('style');
  s.dataset.replaceFont = 'preset';
  s.textContent = `@charset "UTF-8";

:root, :host, html, body, .prose, [class*="prose"], [class*="markdown"], [class*="content"], [class*="answer"], [class*="light"], [class*="dark"] {
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

/* 汎用的な等幅フォント要素に対する強制指定（CSS継承で子孫に伝播） */
:root :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
:host :is(pre, code, kbd, samp, .mono, [class*="font-mono"], [class*="codeblock"], [class*="shiki"], [class*="hljs"], [class*="prism"], [class*="language-"]),
[style*="monospace"], [style*="ui-monospace"] {
  font-family: "PlemolJP", "Berkeley Mono", "IBM Plex Mono", "Geist Mono", "Cascadia Code", "Cascadia Mono", "Consolas", "Monaco", "Courier New", monospace !important;
}


/* 置換フォント自体の @font-face 定義 */
@font-face {
  font-family: "Murecho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Murecho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "PlemolJP";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "PlemolJP";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}

@font-face {
  font-family: "MS PGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "メイリオ";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Arial";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ArialMT";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Verdana";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inter UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roobert";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FK Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ABC Social";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Graphik";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Manrope";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Poppins";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Outfit";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Signifer";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "system-ui";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "-apple-system";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "San Francisco";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Open Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Lato";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Montserrat";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Oswald";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Raleway";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "YuMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "游明朝体";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Times";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Georgia";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS PGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms pgothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms pゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS UI Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "メイリオ";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuGothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游ゴシック Medium";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Gothic UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Meiryo UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Motiva Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MotivaSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Arial";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ArialMT";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roboto";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "RobotoDraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Helvetica Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "HelveticaNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Trebuchet MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "TrebuchetMS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Verdana";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "M PLUS Rounded 1c";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Malgun Gothic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Arial Unicode MS";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Regular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter-Bold";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inter UI";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Public Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roobert";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Grotesk Neue Thin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FK Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGrotesk";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeue";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKGroteskNeueThin";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "FKDisplay";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexSans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ABC Social";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Graphik";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Euclid Circular";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Manrope";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Poppins";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Outfit";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Buch";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne-Kraft";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Signifer";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Serif Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Anthropic Sans Web Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "system-ui";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "-apple-system";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "BlinkMacSystemFont";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "San Francisco";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Display";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Variable Text";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Segoe UI Historic";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Open Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Lato";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Montserrat";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Source Sans Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Oswald";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Raleway";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Merriweather Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans CJK JP";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS PMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ 明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ Ｐ明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "YuMincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Yu Mincho";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游明朝";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "游明朝体";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "HiraMinProN-W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Mincho ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ明朝 ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Times New Roman";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Times";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Georgia";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "sans-serif";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W1";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W2";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W3";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W4";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W5";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W6";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W7";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W8";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Hiragino Kaku Gothic Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ ProN W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ヒラギノ角ゴ Pro W9";
  src:  local("Murecho"),
        url('__REPLACE_FONT_BASE__fonts/Murecho.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms gothic";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Consolas";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Monaco";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Courier New";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Courier";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Menlo";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Fira Code";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "SF Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "monospace";
  src:  local("PlemolJP"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Regular.woff2') format('woff2');
  font-weight: 100 599;
  font-display: swap;
}
@font-face {
  font-family: "MS Gothic";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms gothic";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "MS ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ms ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ＭＳ ゴシック";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Consolas";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Monaco";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Courier New";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Courier";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Menlo";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Ubuntu Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "source-code-pro";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Source Code Pro";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Code";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Cascadia Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Berkeley Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "BerkeleyMono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBM Plex Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "IBMPlexMono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Fira Code";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Fira Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Roboto Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Inconsolata";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "SFMono-Regular";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "SF Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "Söhne Mono";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "UDEV Gothic JPDOC";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "ui-monospace";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
@font-face {
  font-family: "monospace";
  src:  local("PlemolJP Bold"),
        url('__REPLACE_FONT_BASE__fonts/PlemolJP-Bold.woff2') format('woff2');
  font-weight: 600 900;
  font-display: swap;
}
`.replace(/__REPLACE_FONT_BASE__/g, chrome.runtime.getURL(''));
  (document.head || document.documentElement).appendChild(s);
})();
