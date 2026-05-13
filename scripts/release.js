#!/usr/bin/env node
// バリアントのバージョンを patch +1 して release/<variant>-X.Y.Z ブランチを作成・push する。
// `/vava` スキルと同じ「patch のみ」のメンタルモデルに揃えてある。
// minor / major bump は手で variants/<name>.json の version を編集してから release を実行する運用。
//
// 使い方:
//   node scripts/release.js <variant|all> [--dry-run] [--yes] [--prune-old]
//
//   <variant>      = default | notosans | all (variants/*.json から自動検出)
//   --dry-run / -n = 実際の書き込み・push を行わず、計画だけ表示
//   --yes / -y     = 確認プロンプトを省略（CI / Claude Code から呼ぶ場合に使用）
//   --prune-old    = 同 variant の古い release/<variant>-* ブランチをリモートから削除
//
// 動作:
//   1. variants/<name>.json の version を patch +1
//   2. main にコミット & push
//   3. release/<variant>-X.Y.Z ブランチを作って push (これが publish.yml のトリガー)
//   4. main に戻る
//   (--prune-old 指定時) 5. 古い release/<variant>-* ブランチをリモートから削除

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

const variantArg = positional[0];

function usage() {
  console.error('使い方: node scripts/release.js <variant|all> [--dry-run] [--yes] [--prune-old]');
  console.error('  ※ 常に patch +1。minor/major は variants/<name>.json を手で書き換えてから実行してください。');
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!variantArg) { usage(); process.exit(1); }
// 余計な positional 引数（旧 bump-level 互換）を検出して誤用を防ぐ
if (positional.length > 1) {
  fail(`このスクリプトは patch +1 専用です。bump-level 引数 ("${positional[1]}") は受け付けません。minor/major bump は variants/${variantArg}.json の version を手で書き換えてから実行してください。`);
}

function listAvailableVariants() {
  return fs.readdirSync(VARIANTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
    .sort();
}

function bumpPatch(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) throw new Error(`不正な version 形式: ${v}`);
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}

// git/その他のコマンドを実行。modifyState=true の場合 dry-run でスキップ。
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
  // main がリモートと同期しているか確認 (古い main から release を切ると後で困る)
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

function readVariant(name) {
  const file = path.join(VARIANTS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) fail(`variants/${name}.json が見つかりません`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeVariant(name, data) {
  const file = path.join(VARIANTS_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function listRemoteReleaseBranches(variant) {
  // リモートの release/<variant>-* ブランチを列挙
  const out = runQuiet(`git ls-remote --refs --heads origin "refs/heads/release/${variant}-*"`);
  if (!out) return [];
  return out.split('\n')
    .map(line => line.split('\t')[1])
    .filter(Boolean)
    .map(ref => ref.replace(/^refs\/heads\//, ''));
}

async function main() {
  ensureCleanMain();

  // 対象 variants を確定
  const available = listAvailableVariants();
  let targets;
  if (variantArg === 'all') {
    targets = available;
  } else if (available.includes(variantArg)) {
    targets = [variantArg];
  } else {
    fail(`未知の variant: "${variantArg}" (利用可能: ${available.join(', ')} / all)`);
  }

  // 計画作成
  const plan = targets.map(name => {
    const cfg = readVariant(name);
    const newVersion = bumpPatch(cfg.version);
    return { name, cfg, oldVersion: cfg.version, newVersion, branch: `release/${name}-${newVersion}` };
  });

  // 表示
  console.log('\n📋 リリース計画:');
  for (const p of plan) {
    console.log(`   ${p.name.padEnd(10)}: ${p.oldVersion} → ${p.newVersion}  (${p.branch})`);
  }
  if (DRY_RUN) console.log('   ⚠️  --dry-run 指定: 実際の変更は行いません');
  if (PRUNE_OLD) console.log('   🗑️  --prune-old 指定: 古いリリースブランチをリモートから削除します');
  console.log('');

  // リモートに既に同名ブランチが存在するか事前確認 (race を避けたい)
  for (const p of plan) {
    const exists = runQuiet(`git ls-remote --heads origin ${p.branch}`);
    if (exists) fail(`リモートに既に ${p.branch} が存在します。手動で削除するか別 bump-level を指定してください。`);
  }

  // 古いリリースブランチをリストアップ（プルーン候補）
  let pruneCandidates = [];
  if (PRUNE_OLD) {
    for (const p of plan) {
      const remoteBranches = listRemoteReleaseBranches(p.name);
      pruneCandidates.push(...remoteBranches);
    }
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

  // 1) variants/<name>.json の version 書き換え
  for (const p of plan) {
    p.cfg.version = p.newVersion;
    if (!DRY_RUN) writeVariant(p.name, p.cfg);
    console.log(`✏️  variants/${p.name}.json: ${p.oldVersion} → ${p.newVersion}`);
  }

  // 2) main に commit + push
  const variantPaths = plan.map(p => `variants/${p.name}.json`).join(' ');
  const commitMsg = plan.length === 1
    ? `release: ${plan[0].name} v${plan[0].newVersion}`
    : `release: ${plan.map(p => `${p.name} v${p.newVersion}`).join(' / ')}`;
  run(`git add ${variantPaths}`, { modifyState: true });
  run(`git commit -m "${commitMsg}"`, { modifyState: true });
  run('git push origin main', { modifyState: true });

  // 3) 各 variant のリリースブランチを作成・push
  for (const p of plan) {
    run(`git checkout -b ${p.branch}`, { modifyState: true });
    run(`git push -u origin ${p.branch}`, { modifyState: true });
    run('git checkout main', { modifyState: true });
  }

  // 4) 古いリリースブランチを削除
  if (PRUNE_OLD && pruneCandidates.length > 0) {
    for (const branch of pruneCandidates) {
      run(`git push origin --delete ${branch}`, { modifyState: true });
    }
  }

  console.log('\n🎉 リリースキックオフ完了！');
  console.log('   GitHub Actions の進捗を確認してください:');
  for (const p of plan) {
    console.log(`   - ${p.branch} → CWS_EXTENSION_ID_${p.name.toUpperCase()}`);
  }
}

main().catch(e => fail(e.message));
