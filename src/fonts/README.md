# Font License (フォントのライセンス)

All fonts in this directory are distributed under the SIL Open Font License 1.1.

Please see the [LICENSE](./LICENSE) file for more information.

このディレクトリ内にある全てのフォントは SIL Open Font License 1.1 の下で配布されています。

詳しくは、[LICENSE](./LICENSE) ファイルをご確認ください。

## 同梱フォントの描画設定

全10書体・22ファイルの `gasp` を version 1・全サイズ `15`（`0x000F`）に統一しています。グレースケールと ClearType の平滑化・グリッドフィッティングを指定する設定で、実際の描画は OS・ブラウザに依存します。字形・メトリクス・可変軸・既存のヒンティング命令は変更していません。

フォントの追加・TTF からの再生成時にも、WOFF2 の `gasp.version = 1`、`gasp.gaspRange = {65535: 15}` を適用してください。

## 同梱版と取得元

2026-09-22 時点の同梱版。更新時は公式配布物を取得し、上記の描画設定を適用してから WOFF2 へ変換します。

| 書体 | 同梱版 | 公式取得元 |
|---|---|---|
| IBM Plex Sans JP | 1.004 | [IBM/plex `763c36e`](https://github.com/IBM/plex/tree/763c36ef9117782905ae010056dfbe8fd2653a25/packages/plex-sans-jp/fonts/complete/ttf/hinted) |
| LINE Seed JP | 1.016 | [LINE Seed v20260828](https://github.com/LINE/seed/releases/tag/v20260828) |
| Moralerspace Neon JPDOC | 2.0.0 | [Moralerspace v2.0.0](https://github.com/yuru7/moralerspace/releases/tag/v2.0.0) |
| M PLUS 2 | 1.100 | [google/fonts `e44c4b0`](https://github.com/google/fonts/tree/e44c4b011a820c2cbe2fd2cfa8052037d7edb571/ofl/mplus2) |
| M PLUS Rounded 1c | 1.059.20150529 | [google/fonts `84efd8a`](https://github.com/google/fonts/tree/84efd8ad78c3710ad14bd909e3bc407151885628/ofl/mplusrounded1c) |
| Murecho | 1.010 | [google/fonts `e44c4b0`](https://github.com/google/fonts/tree/e44c4b011a820c2cbe2fd2cfa8052037d7edb571/ofl/murecho) |
| Noto Sans JP | 2.004-H2 | [Noto CJK Sans2.004](https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004) |
| PlemolJP | 3.1.0 | [PlemolJP v3.1.0](https://github.com/yuru7/PlemolJP/releases/tag/v3.1.0) |
| UDEV Gothic JPDOC | 2.2.0 | [UDEV Gothic v2.2.0](https://github.com/yuru7/udev-gothic/releases/tag/v2.2.0) |
| Zen Kaku Gothic New | 1.002 | [google/fonts `e44c4b0`](https://github.com/google/fonts/tree/e44c4b011a820c2cbe2fd2cfa8052037d7edb571/ofl/zenkakugothicnew) |

各 WOFF2 の `name` table に upstream の著作権表示を保持し、収録されている書体では OFL-1.1 のライセンス表示も保持しています。OFL-1.1 の全文は [`LICENSE`](./LICENSE)、M PLUS Rounded 1c の upstream 表示は [`MPLUSRounded1c-OFL.txt`](./MPLUSRounded1c-OFL.txt) にも収録しています。

## M PLUS Rounded 1c

- 対象: `MPLUSRounded1c-{Regular,Medium,Bold}.woff2`（400 / 500 / 700）
- 配布元: [Google Fonts](https://github.com/google/fonts/tree/84efd8ad78c3710ad14bd909e3bc407151885628/ofl/mplusrounded1c)
- 元の TTF を `ttf2woff2` で WOFF2 へ変換。文字の削減や字形の変更は行っていません。
- ローカル参照名は実ファイルの full name / PostScript name（`Rounded Mplus 1c` / `RoundedMplus1c-Regular` など）に従います。
- 著作権表示・ライセンス: [MPLUSRounded1c-OFL.txt](./MPLUSRounded1c-OFL.txt)。同じ配布元の [roundedmplus1c/OFL.txt](https://github.com/google/fonts/blob/84efd8ad78c3710ad14bd909e3bc407151885628/ofl/roundedmplus1c/OFL.txt) を同梱しています。
