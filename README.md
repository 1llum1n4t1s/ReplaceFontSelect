# 目に優しいフォント置換

[![Version](https://img.shields.io/badge/version-1.0.27-blue.svg)](https://github.com/1llum1n4t1s/ReplaceFontSelect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ウェブサイト上の読みづらいフォントを、好みのフォントに自動で置き換える Chrome / Firefox 拡張機能です。
**9種類のフォント**（本文用6種 + 等幅用3種）から選択でき、設定はポップアップから簡単に変更できます。
特定のフォント（MS ゴシック、メイリオ、Yu Gothic、システムフォントなど）を狙い撃ちで置換するため、サイトのデザインを極力崩さずに視認性を大幅に向上させます。
置換フォントが持つグリフの範囲で文字が置き換わり、カバーされない文字（アラビア文字やタイ文字など一部言語）はブラウザが元サイト指定のフォントへ自動フォールバックします。

## 📥 インストール

| ブラウザ | リンク |
|---------|--------|
| **Chrome** | [Chrome Web Store](https://chrome.google.com/webstore/detail/TODO) |
| **Firefox** | [Firefox Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/TODO) |

> Firefox 140 以降に対応しています。

## ✨ 特徴

- 🎨 **フォント選択**: 本文用6種類・等幅用3種類から好みのフォントをポップアップで選択。設定は自動保存されます。
- 🔘 **オン/オフ切り替え**: ポップアップのトグルボタンで、拡張機能の有効/無効を簡単に切り替えられます。
- ⚡ **高速 & 軽量**: ページの表示速度に影響を与えないよう、徹底的に最適化されています。
- 🔄 **完全自動**: インストールするだけで、あらゆるサイトのフォントが自動的に置換されます。
- 📦 **モダンなWeb対応**: 一般的な拡張機能では対応が難しい **Shadow DOM** 内のフォントも漏らさず置換します（YouTube や各種モダンなWebアプリに対応）。
- 🎯 **デザインを尊重**: フォントの種類（ゴシック/明朝/等幅）を判別し、元のデザイン意図を維持したまま最適なフォントへ置き換えます。
- 🛠️ **広範なサポート**: Windows/Mac/Linux の標準フォントから、Inter や Roboto などの主要な Web フォントまで幅広くカバーしています。
- 🌐 **多言語対応**: 置換フォントが持つ文字範囲で自然に置き換わり、カバーされない文字は CSS font fallback で元の指定へ戻ります。

## 🔤 選択可能フォント

### 本文フォント（6種類）

| フォント | 特徴 |
|---|---|
| **Noto Sans JP**（デフォルト） | Google 製。幅広いウェイトに対応し、あらゆるサイズで美しく表示されます。 |
| **IBM Plex Sans JP** | IBM のデザインシステム用フォント。可読性と現代的な印象を両立。 |
| **M PLUS 2** | やや幅広で丸みのあるデザイン。柔らかく親しみやすい印象です。 |
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
`ＭＳ Ｐゴシック`、`メイリオ`、`游ゴシック` などの標準的な日本語フォントに加え、`Arial`、`Helvetica`、`Inter`、`system-ui` などの欧文・システムフォントも選択した本文フォントに置換します。読みづらい明朝体も視認性の高いフォントに置き換わるため、長文の閲覧も快適になります。

### 等幅フォント・コード → 選択した等幅フォント
`ＭＳ ゴシック` や `Consolas`、`JetBrains Mono` などの等幅フォントを、選択した等幅フォントに置換します。
GitHub のコード表示や、技術ブログのコードブロック、入力フォームなども圧倒的に読みやすくなります。

## 📄 ライセンス

- **プロジェクト本体**: [MIT License](LICENSE)
- **搭載フォント**（すべて [SIL Open Font License 1.1](https://scripts.sil.org/OFL)）:
  - Noto Sans JP / IBM Plex Sans JP / M PLUS 2 / Murecho / Zen Kaku Gothic New / LINE Seed JP
  - UDEV Gothic JPDOC / PlemolJP / Moralerspace Neon JPDOC

---

## English

This extension automatically replaces hard-to-read fonts on websites with user-selected fonts. Available for **Chrome** and **Firefox**.
Choose from **9 fonts** (6 body + 3 monospace) via a popup dropdown. Settings persist across browser sessions.
It targets specific fonts (MS Gothic, Meiryo, Yu Gothic, System fonts, etc.) to improve legibility while preserving the original site design.
Characters are replaced only within the glyph coverage of the selected font; uncovered scripts (e.g., Arabic, Thai) fall back to the site's original font via CSS cascade.

### Install

| Browser | Link |
|---------|------|
| **Chrome** | [Chrome Web Store](https://chrome.google.com/webstore/detail/TODO) |
| **Firefox** | [Firefox Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/TODO) |

> Requires Firefox 140 or later.

### Features
- 🎨 **Font Selection**: Choose from 6 body fonts and 3 monospace fonts via popup dropdown. Settings auto-save.
- 🔘 **On/Off Toggle**: Easily enable or disable the extension via the popup toggle button.
- ⚡ **Fast & Lightweight**: Optimized for minimal impact on page load speed.
- 🔄 **Fully Automatic**: Works instantly across all websites without configuration.
- 📦 **Modern Web Support**: Supports **Shadow DOM** elements (works on YouTube and modern web apps).
- 🎯 **Preserve Intent**: Replaces fonts based on their type (Gothic, Serif, or Monospace) to maintain the intended layout.
- 🛠️ **Broad Coverage**: Covers everything from OS standard fonts to popular web fonts like Inter and Roboto.
- 🌐 **Multilingual-friendly**: Replacement follows the selected font's glyph coverage; uncovered characters fall back via CSS cascade.

### Available Fonts
- **Body**: Noto Sans JP, IBM Plex Sans JP, M PLUS 2, Murecho, Zen Kaku Gothic New, LINE Seed JP
- **Monospace**: UDEV Gothic JPDOC, PlemolJP, Moralerspace Neon JPDOC

> Body fonts support **Regular (400)** and **Medium (500)** weight selection (default: Regular). Monospace fonts are fixed at Regular (400). Bold weights are preserved.

### Replacement Logic
- **General Fonts (Gothic/Serif/System)**: Replaced with the selected body font.
- **Monospace Fonts & Code**: Replaced with the selected monospace font.
