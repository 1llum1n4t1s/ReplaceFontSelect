# プライバシーポリシー / Privacy Policy

最終更新日: 2026年3月4日 / Last Updated: March 4, 2026

---

## 日本語

### 概要

「目に優しいフォント置換」（以下「本拡張機能」）は、ウェブページ上の読みづらい日本語フォントをユーザーが選択したフォントに自動置換するブラウザ拡張機能です。本文用5種類・コード用2種類のフォントから選択できます。

> **重要:** この拡張機能は**個人データを一切収集・送信しません**。フォント選択設定のみをブラウザのローカルストレージに保存し、全ての処理はブラウザ内で完結します。

### 収集しないデータ

本拡張機能は、以下を含むいかなるユーザーデータも収集しません：

- 個人情報（名前、メールアドレス、住所など）
- ブラウジング履歴・訪問したウェブサイトのURL
- 入力されたテキストやフォームデータ
- Cookie情報・IPアドレス・デバイス情報・位置情報

### データの保存について

本拡張機能は `chrome.storage.local` を使用して以下のデータのみを保存します：

- 選択された本文用フォント名（例: `noto-sans-jp`）
- 選択された等幅フォント名（例: `udev-gothic-jpdoc`）

このデータはブラウザ内にのみ保存され、外部サーバーへの送信は一切行いません。

### 権限について

| 権限 | 理由 |
|---|---|
| `<all_urls>` | ユーザーが訪問するすべてのウェブページでフォント置換を実行するため。データの収集や送信には使用しません。 |
| `storage` | フォント選択設定の保存のみに使用。保存されるのはフォント名の文字列のみです。 |

### 第三者への情報提供

広告ネットワーク・分析ツール・外部サービスとの連携は一切ありません。

---

## English

### Overview

"目に優しいフォント置換" (Eye-Friendly Font Replacer) is a browser extension that automatically replaces hard-to-read Japanese fonts on web pages with user-selected fonts. Users can choose from 5 body fonts and 2 monospace fonts.

> **Important:** This extension **does not collect or transmit any personal data**. Only font selection preferences are saved locally in the browser.

### Data We Do NOT Collect

This extension does not collect any user data, including:

- Personal information (name, email, address, etc.)
- Browsing history or visited URLs
- Entered text or form data
- Cookies, IP addresses, device information, or location data

### Data Storage

This extension uses `chrome.storage.local` to store only:

- Selected body font name (e.g., `noto-sans-jp`)
- Selected monospace font name (e.g., `udev-gothic-jpdoc`)

This data is stored only within the browser and is never transmitted to external servers.

### Permissions

| Permission | Reason |
|---|---|
| `<all_urls>` | To perform font replacement on all web pages the user visits. Never used for data collection. |
| `storage` | To save font selection preferences only. Only font name strings are stored. |

### Third-Party Data Sharing

No advertising networks, analytics tools, or external service integrations are used.
