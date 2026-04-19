# プライバシーポリシー / Privacy Policy

最終更新日: 2026年4月18日 / Last Updated: April 18, 2026

---

## 日本語

### 概要

「目に優しいフォント置換」（以下「本拡張機能」）は、ウェブページ上の読みづらいフォントをユーザーが選択したフォントに自動置換するブラウザ拡張機能です。本文用 6 種類・等幅用 3 種類のフォントから選択できます。置換はユーザーが選んだフォントが持つグリフ範囲に従い、そのフォントに含まれない文字（アラビア文字・タイ文字など一部言語）は CSS font fallback によって元サイト指定のフォントへ自動的に戻ります。

> **重要:** この拡張機能は**個人データを一切収集・送信しません**。フォント選択設定のみをブラウザのローカルストレージに保存し、全ての処理はブラウザ内で完結します。

### 収集しないデータ

本拡張機能は、以下を含むいかなるユーザーデータも収集しません：

- 個人情報（名前、メールアドレス、住所など）
- ブラウジング履歴・訪問したウェブサイトのURL
- 入力されたテキストやフォームデータ
- Cookie情報・IPアドレス・デバイス情報・位置情報

### データの保存について

本拡張機能は `chrome.storage.local` を使用して以下のデータのみを保存します：

- 拡張機能の有効/無効状態（boolean）
- 選択された本文用フォントキー（例: `noto-sans-jp`）
- 選択された本文用フォントの太さ（`400` または `500`）
- 選択された等幅フォントキー（例: `udev-gothic-jpdoc`）
- 登録済みプリセット CSS のフラグ（boolean、内部状態）

このデータはブラウザ内にのみ保存され、外部サーバーへの送信は一切行いません。

### 権限について

| 権限 | 理由 |
|---|---|
| `<all_urls>` (host_permissions) | ユーザーが訪問するすべてのウェブページでフォント置換を実行するため。データの収集や送信には使用しません。 |
| `storage` | フォント選択設定の保存のみに使用。保存されるのはフォント識別子の文字列とブーリアンのみです。 |
| `scripting` | ブラウザ起動時に `chrome.scripting.registerContentScripts` でプリセット CSS を注入する content script を登録するため。スクリプトは拡張機能バンドル内の静的ファイル（`src/css/preset-*.js`）のみで、外部取得や動的コード生成は行いません。 |

### 第三者への情報提供

広告ネットワーク・分析ツール・外部サービスとの連携は一切ありません。

---

## English

### Overview

"目に優しいフォント置換" (Eye-Friendly Font Replacer) is a browser extension that automatically replaces hard-to-read fonts on web pages with user-selected fonts. Users can choose from **6 body fonts and 3 monospace fonts**. Replacement follows the glyph coverage of the user-selected font; characters outside that coverage (e.g., Arabic, Thai) automatically fall back to the site's original font via the standard CSS font cascade.

> **Important:** This extension **does not collect or transmit any personal data**. Only font selection preferences are saved locally in the browser.

### Data We Do NOT Collect

This extension does not collect any user data, including:

- Personal information (name, email, address, etc.)
- Browsing history or visited URLs
- Entered text or form data
- Cookies, IP addresses, device information, or location data

### Data Storage

This extension uses `chrome.storage.local` to store only:

- Extension enabled/disabled flag (boolean)
- Selected body font key (e.g. `noto-sans-jp`)
- Selected body font weight (`400` or `500`)
- Selected monospace font key (e.g. `udev-gothic-jpdoc`)
- A boolean flag indicating whether preset CSS was registered (internal state)

This data is stored only within the browser and is never transmitted to external servers.

### Permissions

| Permission | Reason |
|---|---|
| `<all_urls>` (host_permissions) | Required to run font replacement on every page the user visits. Never used for data collection. |
| `storage` | Used solely to persist font preferences. Only identifier strings and booleans are stored. |
| `scripting` | Required to register a preset-CSS content script via `chrome.scripting.registerContentScripts` at startup. The script source is a static file shipped inside the extension bundle (`src/css/preset-*.js`); no remote code is fetched or evaluated. |

### Third-Party Data Sharing

No advertising networks, analytics tools, or external service integrations are used.
