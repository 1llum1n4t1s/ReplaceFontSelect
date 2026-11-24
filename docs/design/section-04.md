# サイト単位の除外

リッチエディタやデザインツールまで強制置換すると、編集体験やアイコンフォントを壊す場合がある。全サイト対応より既存UIの保全を優先し、既知の対象はバリアント設定で除外する。

利用者の除外リストはglobとパス前方一致を含み、match patternでは同じ意味を表せない規則がある。動的登録はコードを埋め込めず、content scriptはstorageを同期で読めないため、除外の正本は`preload-fonts.js`の実行時判定とする。そのうえで、意味が完全に一致する素のホスト名（`*`・パス・ポートを含まない）だけを`*://host/*`へ変換し、presetとMAIN worldフックの`excludeMatches`へ前倒しで加える。`*.x.com`はmatch patternだと`x.com`自身も含むため変換しない。無効なmatch patternが1件でも混じると登録全体が失敗するため、変換対象は厳格に検証する。変換できない規則のページでは、presetが設定読込までの短時間だけ注入される。その間にclosed Shadow rootへ採用した共有sheetは中身を空にし、`<style>` fallbackは除去する。

除外リストに一致したframeでは、`preload-fonts.js`が設定と同じ1回の`storage.local.get`で除外リストを読み、無効時と同じく監視を畳む。Path Aが同期注入したpreset styleを外し、MAIN worldの`inject.js`へイベントで撤去を伝える。判定はYouTube分岐と競合font-faceの除去より前に行うため、サイトのフォントは元のまま残る。
