# Font License (フォントのライセンス)

All fonts in this directory are distributed under the SIL Open Font License 1.1.

Please see the [LICENSE](./LICENSE) file for more information.

このディレクトリ内にある全てのフォントは SIL Open Font License 1.1 の下で配布されています。

詳しくは、[LICENSE](./LICENSE) ファイルをご確認ください。

## 同梱フォントの描画設定

全10書体・22ファイルの `gasp` を version 1・全サイズ `15`（`0x000F`）に統一しています。グレースケールと ClearType の平滑化・グリッドフィッティングを指定する設定で、実際の描画は OS・ブラウザに依存します。字形・メトリクス・可変軸・既存のヒンティング命令は変更していません。

フォントの追加・TTF からの再生成時にも、WOFF2 の `gasp.version = 1`、`gasp.gaspRange = {65535: 15}` を適用してください。

## M PLUS Rounded 1c

- 対象: `MPLUSRounded1c-{Regular,Medium,Bold}.woff2`（400 / 500 / 700）
- 配布元: [Google Fonts](https://github.com/google/fonts/tree/84efd8ad78c3710ad14bd909e3bc407151885628/ofl/mplusrounded1c)
- 元の TTF を `ttf2woff2` で WOFF2 へ変換。文字の削減や字形の変更は行っていません。
- ローカル参照名は実ファイルの full name / PostScript name（`Rounded Mplus 1c` / `RoundedMplus1c-Regular` など）に従います。
- 著作権表示・ライセンス: [MPLUSRounded1c-OFL.txt](./MPLUSRounded1c-OFL.txt)。同じ配布元の [roundedmplus1c/OFL.txt](https://github.com/google/fonts/blob/84efd8ad78c3710ad14bd909e3bc407151885628/ofl/roundedmplus1c/OFL.txt) を同梱しています。
