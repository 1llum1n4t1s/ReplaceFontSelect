#!/usr/bin/env bun
// 全 variant のバージョンを同期して patch +1 し、main のコミットに軽量タグ v<X.Y.Z> を付けて push する。
// 「両 variant 同時リリース」が常態のため、version を全 variant で揃え、
// 1 つのタグで GitHub Actions matrix が両 variant を並列公開する仕組み。
//
// 使い方:
//   bun scripts/release.js [--dry-run] [--yes]
//
//   --dry-run / -n = 実際の書き込み・push を行わず、計画だけ表示
//   --yes / -y     = 確認プロンプトを省略（CI / Claude Code から呼ぶ場合に使用）
//
// 動作:
//   1. 全 variants/*.json の version が一致しているか確認 (一致しなければ abort)
//   2. リモートに同名の v<X.Y.Z> タグが無いことを確認 (あれば abort)
//   3. version を patch +1 して全 variant に反映
//   4. main にコミット & push (git push --no-follow-tags)
//   5. そのコミットに軽量タグ v<X.Y.Z> を付け、タグだけを push
//      (これが publish.yml のトリガー。git push --tags は使わない)

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const VARIANTS_DIR = path.join(ROOT, 'variants');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('-')));
const positional = args.filter(a => !a.startsWith('-'));

const DRY_RUN = flags.has('--dry-run') || flags.has('-n');
const AUTO_YES = flags.has('--yes') || flags.has('-y');

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

const KNOWN_FLAGS = new Set(['--dry-run', '-n', '--yes', '-y']);
for (const f of flags) {
  if (!KNOWN_FLAGS.has(f)) fail(`未対応のオプションです: ${f} (--prune-old は廃止しました。release/* ブランチは作りません)`);
}

if (positional.length > 0) {
  fail(`このスクリプトは positional 引数を受け付けません ("${positional[0]}"). 全 variant 同時リリース専用です。`);
}

function listVariants() {
  return fs.readdirSync(VARIANTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
    .sort();
}

function readVariant(name) {
  const file = path.join(VARIANTS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) fail(`variants/${name}.json が見つかりません`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeVariant(name, data) {
  const file = path.join(VARIANTS_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function bumpPatch(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) throw new Error(`不正な version 形式: ${v}`);
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  if (DRY_RUN && opts.modifyState) {
    console.log('  (dry-run — skipped)');
    return '';
  }
  return execSync(cmd, { encoding: 'utf8', stdio: ['inherit', 'inherit', 'inherit'], cwd: ROOT });
}

// run() と同じ3点（コマンド表示・dry-run スキップ・cwd: ROOT）を持つ、シェルを介さない版。
function runFile(file, fileArgs, opts = {}) {
  console.log(`$ ${file} ${fileArgs.join(' ')}`);
  if (DRY_RUN && opts.modifyState) {
    console.log('  (dry-run — skipped)');
    return '';
  }
  return execFileSync(file, fileArgs, { encoding: 'utf8', stdio: ['inherit', 'inherit', 'inherit'], cwd: ROOT });
}

// 非 ASCII のコミット文は引数で渡さず、UTF-8（BOM なし）のファイルで渡す。
// commit 後に実際の文面を読み戻して予定文と照合する。不一致なら巻き戻さず、push せずに停止する。
function commitWithMessageFile(message, tag) {
  if (DRY_RUN) {
    console.log('$ git -c i18n.commitEncoding=UTF-8 commit --file <message-file>');
    console.log('  (dry-run — skipped)');
    return;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-commit-'));
  try {
    const file = path.join(dir, 'COMMIT_MESSAGE.txt');
    fs.writeFileSync(file, message + '\n', 'utf8');
    runFile('git', ['-c', 'i18n.commitEncoding=UTF-8', 'commit', '--file', file], { modifyState: true });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  const actual = execFileSync('git', ['-c', 'i18n.logOutputEncoding=UTF-8', 'log', '-1', '--format=%B'], { encoding: 'utf8', cwd: ROOT }).replace(/[\r\n]+$/, '');
  if (actual !== message || actual.includes('\uFFFD')) {
    const sha = runQuiet('git rev-parse HEAD');
    fail(
      `コミット文が予定文と一致しません。push せずに停止します（自動では巻き戻していません）。\n` +
      `  コミット: ${sha}（未 push）\n` +
      `  予定文: ${message}\n` +
      `  実際の文: ${actual}\n` +
      `  原因（commit-msg hook・文字コード設定など）を確認してください。このまま再実行すると main が origin と不一致で停止し、main を push した後に再実行すると版がもう一度上がるため、次のどちらかで進めてください。\n` +
      `  - 取り消す: version の書き換えごと main を origin/main と同じ状態へ戻してから再実行する。\n` +
      `  - 修正して続行する: 再実行せず、コミット文を直したうえで git push --no-follow-tags origin main → git tag ${tag} → git push --no-follow-tags origin refs/tags/${tag} を手動で行う。`
    );
  }
}

function runQuiet(cmd) {
  return execSync(cmd, { encoding: 'utf8', cwd: ROOT }).trim();
}

function ensureCleanMain() {
  const branch = runQuiet('git rev-parse --abbrev-ref HEAD');
  if (branch !== 'main') fail(`main ブランチで実行してください (現在: ${branch})`);
  const status = runQuiet(DRY_RUN ? 'git --no-optional-locks status --porcelain' : 'git status --porcelain');
  if (status) fail(`作業ディレクトリが clean ではありません:\n${status}`);
  let remote;
  if (DRY_RUN) {
    let output;
    try {
      output = runQuiet('git ls-remote --exit-code origin refs/heads/main');
    } catch (error) {
      fail(`リモートの main を取得できません: ${error.message}`);
    }
    const match = /^([0-9a-f]{40}|[0-9a-f]{64})\trefs\/heads\/main$/i.exec(output);
    if (!match) fail('リモートの main の応答が空または不正です。');
    remote = match[1];
  } else {
    runQuiet('git fetch origin main --quiet');
    remote = runQuiet('git rev-parse origin/main');
  }
  const local = runQuiet('git rev-parse main');
  if (local !== remote) {
    fail('main がリモートと同期していません。git pull --rebase origin main してください。');
  }
}

async function confirm(prompt) {
  if (AUTO_YES) return true;
  if (!process.stdin.isTTY) {
    fail('対話モード不可: --yes を指定するか TTY から実行してください');
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${prompt} (y/N): `, ans => {
      rl.close();
      resolve(/^y(es)?$/i.test(ans.trim()));
    });
  });
}

async function main() {
  ensureCleanMain();

  const variantNames = listVariants();
  if (variantNames.length === 0) fail('variants/ ディレクトリに variant 設定が見つかりません');

  // 1. 全 variant の version が一致しているか確認
  const variants = variantNames.map(name => ({ name, cfg: readVariant(name) }));
  const versions = variants.map(v => v.cfg.version);
  const uniqueVersions = [...new Set(versions)];
  if (uniqueVersions.length !== 1) {
    fail(
      `variants の version が揃っていません:\n` +
      variants.map(v => `  ${v.name}: ${v.cfg.version}`).join('\n') +
      `\nリリース前に variants/*.json の version を手作業で揃えてください。`
    );
  }

  const oldVersion = uniqueVersions[0];
  const newVersion = bumpPatch(oldVersion);
  const tag = `v${newVersion}`;

  // 表示
  console.log('\n📋 リリース計画 (全 variant 同期):');
  console.log(`   version: ${oldVersion} → ${newVersion}`);
  console.log(`   タグ: ${tag} (main のコミットに付ける軽量タグ)`);
  console.log(`   反映先 variant: ${variantNames.join(', ')}`);
  if (DRY_RUN) console.log('   ⚠️  --dry-run 指定: 実際の変更は行いません');
  console.log('');

  // リモートに同名タグがあれば abort (既存タグの付け替え・上書きはしない)
  const existsRemote = runQuiet(`git ls-remote --tags origin refs/tags/${tag}`);
  if (existsRemote) fail(`リモートに既に ${tag} が存在します。手動で確認するか variants/*.json を手で minor/major bump してください。`);

  if (!await confirm('続行しますか？')) {
    console.log('中止しました。');
    return;
  }

  // 2. 全 variant の version を bump
  for (const v of variants) {
    v.cfg.version = newVersion;
    if (!DRY_RUN) writeVariant(v.name, v.cfg);
    console.log(`✏️  variants/${v.name}.json: ${oldVersion} → ${newVersion}`);
  }

  // 2-2. package.json の version も同期 (リポジトリ内の version 文字列を一貫させる)
  //      build パイプラインからは参照されないが、/vava スキルなど外部ツールが
  //      package.json を真実の源泉として扱うケースに備えた整合性維持。
  const pkgPath = path.join(ROOT, 'package.json');
  let pkgUpdated = false;
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.version !== newVersion) {
      pkg.version = newVersion;
      if (!DRY_RUN) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log(`✏️  package.json: → ${newVersion} (同期)`);
      pkgUpdated = true;
    }
  }

  // 3. main に commit + push
  const stagedFiles = [
    ...variants.map(v => `variants/${v.name}.json`),
    ...(pkgUpdated ? ['package.json'] : [])
  ].join(' ');
  const commitMsg = `v${newVersion} をリリース`;
  run(`git add ${stagedFiles}`, { modifyState: true });
  commitWithMessageFile(commitMsg, tag);
  run('git push --no-follow-tags origin main', { modifyState: true });

  // 4. 軽量タグ v<X.Y.Z> を付け、そのタグだけを push (publish.yml のトリガー)
  run(`git tag ${tag}`, { modifyState: true });
  run(`git push --no-follow-tags origin refs/tags/${tag}`, { modifyState: true });

  console.log('\n🎉 リリースキックオフ完了！');
  console.log(`   GitHub Actions が matrix strategy で variant 並列公開:`);
  console.log(`   ${tag} → CWS_EXTENSION_ID_DEFAULT / CWS_EXTENSION_ID_NOTOSANS`);
}

main().catch(e => fail(e.message));
