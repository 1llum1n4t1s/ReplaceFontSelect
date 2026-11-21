// vitrina（ストア掲載画像キット）の variant 対応ラッパー。
// キット（webstore/vitrina/）は逐語コピーで改変禁止で、1 回の実行は 1 つの設定ファイルだけを扱う。
// このリポジトリは default / notosans の 2 拡張（variant）を同じソースから出すため、
// variant ごとの設定・出力先・拡張の読み込み（ビルド）をここで補う。
//
//   bun webstore/run-vitrina.mjs <default|notosans|all> [generate|verify|sheet] [vitrina のオプション...]
//
// - 設定: webstore/store-assets.<variant>.json
// - 出力: webstore/images/<variant>/<locale>/screenshot-NN.png と webstore/images/<variant>/tile-*.png
// - generate の前に `bun scripts/build-variant.js <variant>` で manifest.json / variant.js / _locales を作る
//   （実拡張を読み込む撮影のため。生成物は gitignore 済み）。アイコン PNG と preset CSS は
//   `bun --bun run build:<variant>` 済みであること（初回 checkout 直後は先にそれを実行する）。
// - all は notosans → default の順に処理し、終了時に default の manifest が残るようにする
//   （通常の開発・検証は default の manifest を前提にするため）。
// - 既定の work-dir: キットの既定値（OS の一時フォルダー %TEMP% = os.tmpdir() 配下の vitrina-<リポジトリ名>）に
//   -<variant> を付ける（variant ごとに ui-defects.json を分けるため）。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultWorkDir } from "./vitrina/lib/config.mjs";

const VARIANTS = ["default", "notosans"];
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

const [target, ...rest] = process.argv.slice(2);
if (!target || ![...VARIANTS, "all"].includes(target)) {
  console.error("使い方: bun webstore/run-vitrina.mjs <default|notosans|all> [generate|verify|sheet] [vitrina のオプション...]");
  process.exit(2);
}
const command = rest[0] && !rest[0].startsWith("--") ? rest.shift() : "generate";
const extra = rest;
const hasOption = (name) => extra.includes(name);

/** 子プロセスを同じ標準入出力で実行し、終了コードを返す。 */
function run(args) {
  const proc = Bun.spawnSync([process.execPath, ...args], { cwd: repoRoot, stdio: ["inherit", "inherit", "inherit"] });
  return proc.exitCode ?? 1;
}

const targets = target === "all" ? [...VARIANTS].reverse() : [target];
if (target === "all" && hasOption("--out")) {
  console.error("all では --out を指定できません（variant ごとの出力先が重なるため）");
  process.exit(2);
}

for (const variant of targets) {
  if (command === "generate") {
    const code = run([path.join(repoRoot, "scripts", "build-variant.js"), variant]);
    if (code !== 0) process.exit(code);
  }
  const imagesDir = path.join(repoRoot, "webstore", "images", variant);
  const args = [path.join(here, "vitrina", "vitrina.mjs"), command, "--repo", repoRoot, "--config", path.join(here, `store-assets.${variant}.json`)];
  if (command === "generate" && !hasOption("--out")) args.push("--out", imagesDir);
  if ((command === "verify" || command === "sheet") && !hasOption("--images-dir")) args.push("--images-dir", imagesDir);
  if ((command === "generate" || command === "sheet") && !hasOption("--work-dir")) {
    args.push("--work-dir", `${defaultWorkDir(repoRoot)}-${variant}`);
  }
  args.push(...extra);
  const code = run(args);
  if (code !== 0) process.exit(code);
}
