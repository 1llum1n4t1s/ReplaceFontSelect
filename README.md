# 目に優しいフォント置換

[![Version](https://img.shields.io/badge/version-3.1.8-blue.svg)](https://github.com/1llum1n4t1s/ReplaceFontSelect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ウェブサイト上の読みづらいフォントを、好みのフォントに自動で置き換える Chrome / Firefox 拡張機能です。
**10種類のフォント**（本文用7種 + 等幅用3種）から選択でき、設定はポップアップから簡単に変更できます。
読みづらい指定フォントだけを狙い撃ちで置換するため、サイトのデザインを極力崩さずに視認性を大幅に向上させます。
置換フォントが持つグリフの範囲で文字が置き換わり、カバーされない文字（アラビア文字やタイ文字など一部言語）はブラウザが元サイト指定のフォントへ自動フォールバックします。

[English](docs/readme/overview.md)

## 📥 インストール

| 版 | Chrome | Firefox |
|---|---|---|
| **通常版**（フォント選択対応） | [Chrome Web Store](https://chromewebstore.google.com/detail/faghcoiecciapdokelomjgeknadokgeg) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselect/) |
| **Noto Sans JP 固定版** | [Chrome Web Store](https://chromewebstore.google.com/detail/ipfbjlmjgfobhnncbggaaiknhdgkcdfe) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselectnotosans/) |

> Firefox desktop 140 以降、Firefox Android 142 以降に対応しています。

## 使い方

1. インストール後、ブラウザの拡張機能メニューからポップアップを開きます。
2. 通常版では本文・等幅フォントと本文の太さを選びます。Noto Sans JP固定版はNoto Sans JP + UDEV Gothic JPDOC、本文Regular固定で、フォント選択欄はありません。
3. 設定は自動保存されます。変更やオン/オフ切り替え後は、対象ページを再読み込みしてください。

ブラウザの設定画面や拡張機能を実行できないページ、一部の編集・デザインサービスは置換対象外です。フォントが変わらない場合は、有効になっていることを確認して対象ページを再読み込みしてください。

## ✨ 特徴

- 🎨 **フォント選択**: 本文用7種類・等幅用3種類から好みのフォントをポップアップで選択。設定は自動保存されます。
- 🔘 **オン/オフ切り替え**: ポップアップのトグルボタンで、拡張機能の有効/無効を簡単に切り替えられます。
- 🚫 **除外リスト**: 置換しないサイトやページのURLを、ポップアップの「除外リスト」タブで指定できます。
- ⚡ **高速 & 軽量**: ページの表示速度に影響を与えないよう、徹底的に最適化されています。
- 🔄 **完全自動**: インストールするだけで、対応サイトのフォントが自動的に置換されます。編集・デザイン体験やアイコン表示を保護する必要がある一部サービスは対象外です。
- 📦 **モダンなWeb対応**: 一般的な拡張機能では対応が難しい open / closed **Shadow DOM** 内のフォントにも対応します。
- 🎯 **デザインを尊重**: フォントの種類（ゴシック/明朝/等幅）を判別し、元のデザイン意図を維持したまま最適なフォントへ置き換えます。
- 🛠️ **広範なサポート**: OS 標準のフォントから主要な Web フォントまで幅広くカバーしています。
- 🌐 **多言語対応**: 置換フォントが持つ文字範囲で自然に置き換わり、カバーされない文字は CSS font fallback で元の指定へ戻ります。
- 💬 **お問い合わせ**: 設定ポップアップから Kagayoi Support へ問い合わせできます。Firefoxでは個人識別情報・認証情報の送信許可がインストール・更新時に必要です。通信内容は送信前に別途許可を求めます。

## 🔤 フォントと置換の仕組み

本文7種・等幅3種の特徴、太さ、置換対象は[選択可能フォントと置換の仕組み](docs/readme/configuration.md)をご覧ください。

## 🔧 開発情報

このリポジトリからローカルビルドや派生版の開発を行う場合は、必須コマンドと検証手順を [AGENTS.md](AGENTS.md)、システムの構造と設計判断を [DESIGN.md](DESIGN.md) で確認してください。

## 📄 ライセンス

- **プロジェクト本体**: [MIT License](LICENSE)
- **搭載フォント**（すべて [SIL Open Font License 1.1](https://scripts.sil.org/OFL)）:
  - Noto Sans JP / IBM Plex Sans JP / M PLUS 2 / M PLUS Rounded 1c / Murecho / Zen Kaku Gothic New / LINE Seed JP
  - UDEV Gothic JPDOC / PlemolJP / Moralerspace Neon JPDOC
