# プライバシーポリシー / Privacy Policy

最終更新日: 2026年8月27日 / Last Updated: August 27, 2026

---

## 日本語

### 概要

「目に優しいフォント置換」（以下「本拡張機能」）は、ウェブページ上の読みづらいフォントをユーザーが選択したフォントに自動置換するブラウザ拡張機能です。本文用 6 種類・等幅用 3 種類のフォントから選択できます。置換はユーザーが選んだフォントが持つグリフ範囲に従い、そのフォントに含まれない文字（アラビア文字・タイ文字など一部言語）は CSS font fallback によって元サイト指定のフォントへ自動的に戻ります。

> **重要:** フォント置換の動作で**個人データを収集・送信することはありません**。フォント選択設定のみをブラウザのローカルストレージに保存し、置換処理はブラウザ内で完結します。外部への送信は、利用者が自分でお問い合わせフォームを送信したときだけ発生します（「お問い合わせフォーム」の項を参照）。

### 収集しないデータ

本拡張機能は、以下を含むユーザーデータを自動的に収集することはありません：

- 個人情報（名前、住所など）
- ブラウジング履歴・訪問したウェブサイトのURL
- 入力されたテキストやフォームデータ
- Cookie情報・IPアドレス・デバイス情報・位置情報

お名前とメールアドレスは、利用者がお問い合わせフォームに入力して送信したときだけ受け取ります。フォームを使わなければ受け取りません。

### データの保存について

本拡張機能は `chrome.storage.local` を使用して以下のデータのみを保存します：

- 拡張機能の有効/無効状態（boolean）
- 選択された本文用フォントキー（例: `noto-sans-jp`）
- 選択された本文用フォントの太さ（`400` または `500`）
- 選択された等幅フォントキー（例: `udev-gothic-jpdoc`）
- 登録済みプリセット CSS のフラグ（boolean、内部状態）

このデータはブラウザ内にのみ保存され、外部サーバーへの送信は一切行いません。

お問い合わせでメール認証に成功した場合は、認証済みメールアドレス、アクセストークン、有効期限を拡張機能オリジンの `localStorage` に保存します。期限切れまたは不正なセッション情報は削除されます。この情報はお問い合わせ API の認証以外には使用しません。

### お問い合わせフォーム

設定ポップアップ下部の「お問い合わせ」ボタンからフォームを送信したときだけ、次の情報を Kagayoi Support（`https://support.kagayoi.com`）へ送信します。ボタンを押さない限り、この通信は発生しません。

- 入力されたメールアドレス、お名前（任意）、問い合わせ種別、件名、本文
- 製品ID、拡張機能のバージョン、ロケール

初回はメールで届く6桁の確認コードを Kagayoi Support へ送信して本人確認します。認証後の問い合わせと返信は、利用者本人とサポート担当者が確認できるよう Kagayoi Support に保存します。閲覧中のページの内容やフォント設定は送信しません。

Firefox では、初回送信前に、個人識別情報・認証情報・個人的な通信内容を Kagayoi Support へ送信する許可をブラウザの確認画面で求めます。許可しなかった場合、お問い合わせ情報は送信されません。

### 権限について

| 権限 | 理由 |
|---|---|
| `<all_urls>` (host_permissions) | ユーザーが訪問するすべてのウェブページでフォント置換を実行するため。データの収集や送信には使用しません。 |
| `storage` | フォント設定と、プリセット登録済みかを示す内部フラグの保存に使用します。 |
| `scripting` | 有効時に、同梱プリセット CSS と Shadow DOM 検出用スクリプトを `chrome.scripting.registerContentScripts` で登録するため。外部コードの取得や動的コード生成は行いません。 |

### 第三者への情報提供

広告ネットワークや分析ツールは使用しません。外部サービスとの通信は、利用者が問い合わせを送信するときの Kagayoi Support に限られます。

---

## English

### Overview

"目に優しいフォント置換" (Eye-Friendly Font Replacer) is a browser extension that automatically replaces hard-to-read fonts on web pages with user-selected fonts. Users can choose from **6 body fonts and 3 monospace fonts**. Replacement follows the glyph coverage of the user-selected font; characters outside that coverage (e.g., Arabic, Thai) automatically fall back to the site's original font via the standard CSS font cascade.

> **Important:** Font replacement **collects and transmits no personal data**. Only font selection preferences are saved locally in the browser. The only outbound transmission happens when you submit the contact form yourself (see "Contact form").

### Data We Do NOT Collect

This extension never collects the following automatically:

- Personal information (name, address, etc.)
- Browsing history or visited URLs
- Entered text or form data
- Cookies, IP addresses, device information, or location data

Your name and email address are received only when you type them into the contact form and submit it.

### Data Storage

This extension uses `chrome.storage.local` to store only:

- Extension enabled/disabled flag (boolean)
- Selected body font key (e.g. `noto-sans-jp`)
- Selected body font weight (`400` or `500`)
- Selected monospace font key (e.g. `udev-gothic-jpdoc`)
- A boolean flag indicating whether preset CSS was registered (internal state)

This data is stored only within the browser and is never transmitted to external servers.

After successful email verification, the verified email address, access token, and expiration time are stored in the extension origin's `localStorage`. Expired or invalid session data is removed. This data is used only to authenticate requests to the support API.

### Contact form

Only when you press "Contact support" at the bottom of the settings popup and submit the form does the extension send the following to Kagayoi Support (`https://support.kagayoi.com`). No such request happens unless you press the button.

- The email address, optional name, inquiry category, subject, and message you entered
- Product ID, extension version, and locale

On first use, the six-digit code delivered by email is sent to Kagayoi Support to verify you. After verification, Kagayoi Support stores the inquiry and replies so that you and support staff can access them. The content of pages you browse and your font settings are never sent.

On Firefox, before the first transmission, the browser asks you to permit sending personally identifying information, authentication information, and personal communications to Kagayoi Support. If you decline, the inquiry data is not sent.

### Permissions

| Permission | Reason |
|---|---|
| `<all_urls>` (host_permissions) | Required to run font replacement on every page the user visits. Never used for data collection. |
| `storage` | Used to persist font settings and an internal flag indicating preset-registration status. |
| `scripting` | Used while enabled to register the bundled preset CSS and Shadow DOM detector via `chrome.scripting.registerContentScripts`. No remote code is fetched or evaluated. |

### Third-Party Data Sharing

No advertising networks or analytics tools are used. The only external-service communication is with Kagayoi Support when you choose to submit an inquiry.
