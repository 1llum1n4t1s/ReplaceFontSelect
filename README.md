# 目に優しいフォント置換

[![Version](https://img.shields.io/badge/version-3.0.17-blue.svg)](https://github.com/1llum1n4t1s/ReplaceFontSelect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ウェブサイト上の読みづらいフォントを、好みのフォントに自動で置き換える Chrome / Firefox 拡張機能です。
**10種類のフォント**（本文用7種 + 等幅用3種）から選択でき、設定はポップアップから簡単に変更できます。
読みづらい指定フォントだけを狙い撃ちで置換するため、サイトのデザインを極力崩さずに視認性を大幅に向上させます。
置換フォントが持つグリフの範囲で文字が置き換わり、カバーされない文字（アラビア文字やタイ文字など一部言語）はブラウザが元サイト指定のフォントへ自動フォールバックします。

## 📥 インストール

| 版 | Chrome | Firefox |
|---|---|---|
| **通常版**（フォント選択対応） | [Chrome Web Store](https://chromewebstore.google.com/detail/faghcoiecciapdokelomjgeknadokgeg) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselect/) |
| **Noto Sans JP 固定版** | [Chrome Web Store](https://chromewebstore.google.com/detail/ipfbjlmjgfobhnncbggaaiknhdgkcdfe) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselectnotosans/) |

> Firefox desktop 140 以降、Firefox Android 142 以降に対応しています。

## ✨ 特徴

- 🎨 **フォント選択**: 本文用7種類・等幅用3種類から好みのフォントをポップアップで選択。設定は自動保存されます。
- 🔘 **オン/オフ切り替え**: ポップアップのトグルボタンで、拡張機能の有効/無効を簡単に切り替えられます。
- ⚡ **高速 & 軽量**: ページの表示速度に影響を与えないよう、徹底的に最適化されています。
- 🔄 **完全自動**: インストールするだけで、対応サイトのフォントが自動的に置換されます。編集・デザイン体験やアイコン表示を保護する必要がある一部サービスは対象外です。
- 📦 **モダンなWeb対応**: 一般的な拡張機能では対応が難しい open / closed **Shadow DOM** 内のフォントにも対応します。
- 🎯 **デザインを尊重**: フォントの種類（ゴシック/明朝/等幅）を判別し、元のデザイン意図を維持したまま最適なフォントへ置き換えます。
- 🛠️ **広範なサポート**: OS 標準のフォントから主要な Web フォントまで幅広くカバーしています。
- 🌐 **多言語対応**: 置換フォントが持つ文字範囲で自然に置き換わり、カバーされない文字は CSS font fallback で元の指定へ戻ります。
- 💬 **お問い合わせ**: 設定ポップアップから Kagayoi Support へ問い合わせできます。Firefoxでは個人識別情報・認証情報の送信許可がインストール・更新時に必要です。通信内容は送信前に別途許可を求めます。

## 🔤 選択可能フォント

### 本文フォント（7種類）

| フォント | 特徴 |
|---|---|
| **IBM Plex Sans JP**（デフォルト） | IBM のデザインシステム用フォント。可読性と現代的な印象を両立。 |
| **Noto Sans JP** | Google 製。幅広いウェイトに対応し、あらゆるサイズで美しく表示されます。 |
| **M PLUS 2** | やや幅広で丸みのあるデザイン。柔らかく親しみやすい印象です。 |
| **M PLUS Rounded 1c** | 丸い線端が特徴の丸ゴシック。柔らかく親しみやすい表情です。 |
| **Murecho** | 直線的でスッキリしたデザイン。UI やダッシュボードとの相性が良好です。 |
| **Zen Kaku Gothic New** | 伝統的なゴシック体の雰囲気を残しつつ、モダンに仕上げたフォント。 |
| **LINE Seed JP** | LINE が開発したフォント。丸みがあり、親しみやすく読みやすいデザイン。 |

### 等幅フォント（3種類）

| フォント | 特徴 |
|---|---|
| **UDEV Gothic JPDOC**（デフォルト） | BIZ UDゴシック + JetBrains Mono ベース。濁点・半濁点の判別がしやすく、コードの可読性に優れます。 |
| **PlemolJP** | IBM Plex Mono + IBM Plex Sans JP ベース。プログラミングと日本語の両方に最適化されています。 |
| **Moralerspace Neon JPDOC** | JetBrains Mono + IBM Plex Sans JP ベースの合成フォント。コーディング向けにデザインされた等幅フォントです。 |

> 本文フォントは **Regular (400)** と **Medium (500)** から太さを選択できます（デフォルト: Regular）。等幅フォントは Regular (400) 固定です。Bold はそのまま維持されます。

## 🔄 置換の仕組み

### 一般的なフォント（ゴシック体・明朝体）→ 選択した本文フォント
サイトが指定した日本語のゴシック体・明朝体と、欧文やシステム既定のフォントを、選択した本文フォントに置換します。読みづらい明朝体も視認性の高い書体に置き換わるため、長文の閲覧も快適になります。

### 等幅フォント・コード → 選択した等幅フォント
サイトが指定した等幅フォントを、選択した等幅フォントに置換します。
GitHub のコード表示や、技術ブログのコードブロック、入力フォームなども圧倒的に読みやすくなります。

## 🔧 ローカル開発・派生版ビルド

このリポジトリは「**バリアント方式**」で複数の派生版を 1 つのソースから生成できます。 `variants/<name>.json` に各ブランドの設定が入っています。

```bash
pnpm run build:default      # 通常版（フォント選択 UI 付き）
pnpm run build:notosans     # Noto Sans JP + UDEV Gothic JPDOC 固定の派生版

# Chrome 拡張のローカル読み込み（要事前ビルド）
# chrome://extensions → Developer mode ON → "Load unpacked" でリポジトリルートを選択
```

`manifest.json` と `src/content/variant.js` はビルド生成物（`.gitignore` 済）です。「Load unpacked」する前に必ず `pnpm run build:default` か `pnpm run build:notosans` を実行してください。

開発時の必須手順は [AGENTS.md](AGENTS.md)、システム設計は [DESIGN.md](DESIGN.md) を参照してください。

## 📄 ライセンス

- **プロジェクト本体**: [MIT License](LICENSE)
- **搭載フォント**（すべて [SIL Open Font License 1.1](https://scripts.sil.org/OFL)）:
  - Noto Sans JP / IBM Plex Sans JP / M PLUS 2 / M PLUS Rounded 1c / Murecho / Zen Kaku Gothic New / LINE Seed JP
  - UDEV Gothic JPDOC / PlemolJP / Moralerspace Neon JPDOC

---

## English

This extension automatically replaces hard-to-read fonts on websites with user-selected fonts. Available for **Chrome** and **Firefox**.
Choose from **10 fonts** (7 body + 3 monospace) via a popup dropdown. Settings persist across browser sessions.
It targets only hard-to-read fonts to improve legibility while preserving the original site design.
Characters are replaced only within the glyph coverage of the selected font; uncovered scripts (e.g., Arabic, Thai) fall back to the site's original font via CSS cascade.

### Install

| Edition | Chrome | Firefox |
|---|---|---|
| **Default** (font selector) | [Chrome Web Store](https://chromewebstore.google.com/detail/faghcoiecciapdokelomjgeknadokgeg) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselect/) |
| **Noto Sans JP fixed** | [Chrome Web Store](https://chromewebstore.google.com/detail/ipfbjlmjgfobhnncbggaaiknhdgkcdfe) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselectnotosans/) |

> Requires Firefox desktop 140+ or Firefox Android 142+.

### Features
- 🎨 **Font Selection**: Choose from 7 body fonts and 3 monospace fonts via popup dropdown. Settings auto-save.
- 🔘 **On/Off Toggle**: Easily enable or disable the extension via the popup toggle button.
- ⚡ **Fast & Lightweight**: Optimized for minimal impact on page load speed.
- 🔄 **Fully Automatic**: Works instantly on supported websites without configuration. Some editors and design tools are excluded to preserve their editing experience and icon rendering.
- 📦 **Modern Web Support**: Supports open and closed **Shadow DOM** elements.
- 🎯 **Preserve Intent**: Replaces fonts based on their type (Gothic, Serif, or Monospace) to maintain the intended layout.
- 🛠️ **Broad Coverage**: Covers everything from OS standard fonts to popular web fonts.
- 🌐 **Multilingual-friendly**: Replacement follows the selected font's glyph coverage; uncovered characters fall back via CSS cascade.
- 💬 **Contact Support**: Send inquiries to Kagayoi Support from the popup. Firefox requires permission for personally identifying and authentication information at installation or update, and requests separate permission for personal communications before sending.

### Available Fonts
- **Body**: Noto Sans JP, IBM Plex Sans JP, M PLUS 2, M PLUS Rounded 1c, Murecho, Zen Kaku Gothic New, LINE Seed JP
- **Monospace**: UDEV Gothic JPDOC, PlemolJP, Moralerspace Neon JPDOC

> Body fonts support **Regular (400)** and **Medium (500)** weight selection (default: Regular). Monospace fonts are fixed at Regular (400). Bold weights are preserved.

### Replacement Logic
- **General Fonts (Gothic/Serif/System)**: Replaced with the selected body font.
- **Monospace Fonts & Code**: Replaced with the selected monospace font.
