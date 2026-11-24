# CSS とホットパスの実装規約

## CSS — 対象要素を明示したセレクタ

アイコンフォントを壊さないよう、`*` や `:is(pre, code) :not(i, .icon)` のような暗黙の全要素指定を使わない。`:root :is(pre, code, kbd, samp, ...)` はコンテナに適用して継承させ、`[style*="monospace"]` は該当要素だけを対象にする。編集領域は通常ルールと分離し `font-family: revert !important` で戻す。

## Performance — preload-fonts.js は Hot Path

全ページ・全フレームの `document_start` で実行されるため:
- 同期処理を最小限にし、DOM が空の状態での無意味な `querySelector` を避ける。
- `MutationObserver` のコールバックは `_replaceFontApplied` フラグで早期 return する。
- debug 用 `chrome.runtime.sendMessage` を本番に残さない。
- `scanDynamicFontFamilies` は `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce。`loadingdone` では `event.fontfaces` だけを同期確認し、未注入の動的 family があるか `event.fontfaces` が使えなければ件数キャッシュを無効化して次の走査を強制する。`document.fonts` 全体の反復はイベントごとには行わない。
