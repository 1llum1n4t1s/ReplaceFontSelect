#!/usr/bin/env node
// 全 variant のバージョンを同期して patch +1 し、release/<X.Y.Z> ブランチを作成・push する。
// 「両 variant 同時リリース」が常態のため、version を全 variant で揃え、
// 1 ブランチで GitHub Actions matrix が両 variant を並列公開する仕組み。
//
// 使い方:
//   node scripts/release.js [--dry-run] [--yes] [--prune-old]
//
//   --dry-run / -n = 実際の書き込み・push を行わず、計画だけ表示
//   --yes / -y     = 確認プロンプトを省略（CI / Claude Code から呼ぶ場合に使用）
//   --prune-old    = 古い release ブランチ (release/<X.Y.Z> および旧形式
//                    release/<variant>-<X.Y.Z>) をリモートから削除
//
// 動作:
//   1. 全 variants/*.json の version が一致しているか確認 (一致しなければ abort)
//   2. version を patch +1 して全 variant に反映
//   3. main にコミット & push
//   4. release/<X.Y.Z> ブランチを作って push (これが publish.yml のトリガー)
//   5. main に戻る
//   (--prune-old) 6. 古い release/* ブランチをリモートから削除

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const VARIANTS_DIR = path.join(ROOT, 'variants');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('-')));
const positional = args.filter(a => !a.startsWith('-'));

const DRY_RUN = flags.has('--dry-run') || flags.has('-n');
const AUTO_YES = flags.has('--yes') || flags.has('-y');
const PRUNE_OLD = flags.has('--prune-old');

function usage() {
  console.error('使い方: node scripts/release.js [--dry-run] [--yes] [--prune-old]');
  console.error('  patch +1 専用。全 variant に同じ version を反映し release/<X.Y.Z> ブランチを切ります。');
  console.error('  minor/major bump は variants/*.json を手で書き換えてから実行してください。');
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
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

function runQuiet(cmd) {
  return execSync(cmd, { encoding: 'utf8', cwd: ROOT }).trim();
}

function ensureCleanMain() {
  const branch = runQuiet('git rev-parse --abbrev-ref HEAD');
  if (branch !== 'main') fail(`main ブランチで実行してください (現在: ${branch})`);
  const status = runQuiet('git status --porcelain');
  if (status) fail(`作業ディレクトリが clean ではありません:\n${status}`);
  runQuiet('git fetch origin main --quiet');
  const local = runQuiet('git rev-parse main');
  const remote = runQuiet('git rev-parse origin/main');
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

function listAllReleaseBranches() {
  // 新形式 release/X.Y.Z と旧形式 release/<variant>-X.Y.Z の両方を列挙
  const out = runQuiet(`git ls-remote --refs --heads origin "refs/heads/release/*"`);
  if (!out) return [];
  return out.split('\n')
    .map(line => line.split('\t')[1])
    .filter(Boolean)
    .map(ref => ref.replace(/^refs\/heads\//, ''));
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
  const branch = `release/${newVersion}`;

  // 表示
  console.log('\n📋 リリース計画 (全 variant 同期):');
  console.log(`   version: ${oldVersion} → ${newVersion}`);
  console.log(`   ブランチ: ${branch}`);
  console.log(`   反映先 variant: ${variantNames.join(', ')}`);
  if (DRY_RUN) console.log('   ⚠️  --dry-run 指定: 実際の変更は行いません');
  if (PRUNE_OLD) console.log('   🗑️  --prune-old 指定: 古いリリースブランチをリモートから削除します');
  console.log('');

  // リモートに同名ブランチがあれば abort
  const existsRemote = runQuiet(`git ls-remote --heads origin ${branch}`);
  if (existsRemote) fail(`リモートに既に ${branch} が存在します。手動で削除するか variants/*.json を手で minor/major bump してください。`);

  // 古いリリースブランチをリストアップ
  let pruneCandidates = [];
  if (PRUNE_OLD) {
    pruneCandidates = listAllReleaseBranches().filter(b => b !== branch);
    if (pruneCandidates.length > 0) {
      console.log('🗑️  削除予定のリモートブランチ:');
      for (const b of pruneCandidates) console.log(`   - ${b}`);
      console.log('');
    }
  }

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
  const commitMsg = `release: v${newVersion}`;
  run(`git add ${stagedFiles}`, { modifyState: true });
  run(`git commit -m "${commitMsg}"`, { modifyState: true });
  run('git push origin main', { modifyState: true });

  // 4. release/<X.Y.Z> ブランチを作成・push
  run(`git checkout -b ${branch}`, { modifyState: true });
  run(`git push -u origin ${branch}`, { modifyState: true });
  run('git checkout main', { modifyState: true });

  // 5. 古いリリースブランチを削除
  if (PRUNE_OLD && pruneCandidates.length > 0) {
    for (const old of pruneCandidates) {
      run(`git push origin --delete ${old}`, { modifyState: true });
    }
  }

  console.log('\n🎉 リリースキックオフ完了！');
  console.log(`   GitHub Actions が matrix strategy で variant 公開:`);
  console.log(`   ${branch} → CWS_EXTENSION_ID_DEFAULT (現在 default 1 variant のみ)`);
}

main().catch(e => fail(e.message));
