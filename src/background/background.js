/**
 * Service Worker — プリセットJSの動的登録
 */

// variant.js を先に読み込み、mergeFontSettings の lockedFonts override が効くようにする。
// font-config.js を単一の真実の源泉として使用。
// Chrome の Service Worker context では importScripts でロード。
// Firefox の event page では manifest.background.scripts で既にロード済み (importScripts は worker 限定 API)。
if (typeof importScripts === 'function') {
  importScripts('/src/content/variant.js', '/src/content/font-config.js');
}

const SCRIPT_ID = 'replace-font-css';
const STORAGE_DEBOUNCE_MS = 150;

let _storageDebounceTimer = null;
let _pendingSettings = null;

// ensureRegistration の並行実行防止用ロック
// onInstalled + onStartup が同一 SW 起動で両方発火した場合の競合を避ける
let _registrationLock = Promise.resolve();

function getPresetPath(settings) {
  return `src/css/${getPresetFileName(settings.bodyFont, settings.monoFont, settings.bodyFontWeight)}`;
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(FONT_REGISTRY.storageKey);
    return mergeFontSettings(result[FONT_REGISTRY.storageKey] || {});
  } catch {
    return getDefaultSettings();
  }
}

/**
 * 現在の登録内容を取得し、desired と一致するか判定
 */
async function isRegistrationUpToDate(desired) {
  try {
    const current = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (!current || current.length === 0) return false;
    const reg = current[0];
    // excludeMatches の同一性チェック: 順序非依存・要素一致で比較する。
    // 旧登録 (excludeMatches なし) が残っているとここで false 判定 → updateContentScripts が走り
    // 新しい除外リストで再登録される（修正後の挙動を確実に反映するため）。
    const desiredExcl = Array.isArray(desired.excludeMatches) ? desired.excludeMatches.slice().sort() : [];
    const currentExcl = Array.isArray(reg.excludeMatches) ? reg.excludeMatches.slice().sort() : [];
    const sameExcludes =
      desiredExcl.length === currentExcl.length &&
      desiredExcl.every((v, i) => v === currentExcl[i]);
    return (
      Array.isArray(reg.js) && reg.js.length === 1 && reg.js[0] === desired.js[0] &&
      reg.runAt === desired.runAt &&
      reg.allFrames === desired.allFrames &&
      reg.world === desired.world &&
      sameExcludes
    );
  } catch {
    return false;
  }
}

async function _doEnsureRegistration(settings) {
  const presetKey = FONT_REGISTRY.presetRegisteredKey;

  if (!settings.enabled) {
    try { await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }); } catch {}
    try { await chrome.storage.local.set({ [presetKey]: false }); } catch {}
    return;
  }

  const jsPath = getPresetPath(settings);
  // variant 設定の excludeMatches を動的登録にも反映する。
  // manifest.json の content_scripts.exclude_matches は宣言的に登録された
  // inject.js / variant.js / font-config.js / preload-fonts.js にしか効かない。
  // 動的登録のプリセット JS が SharePoint / Docs 等の保護対象ドメインで走ってしまうのを防ぐ。
  const excludeMatches = (typeof VARIANT !== 'undefined' && Array.isArray(VARIANT.excludeMatches))
    ? VARIANT.excludeMatches.slice()
    : [];
  const scriptConfig = {
    id: SCRIPT_ID,
    matches: ['<all_urls>'],
    js: [jsPath],
    runAt: 'document_start',
    allFrames: true,
    world: 'ISOLATED',
    persistAcrossSessions: true
  };
  if (excludeMatches.length > 0) {
    scriptConfig.excludeMatches = excludeMatches;
  }

  // 差分チェック: 現在の登録内容が希望形と一致していれば skip（不要な API 呼び出し削減）
  if (await isRegistrationUpToDate(scriptConfig)) {
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
    return;
  }

  // (P1-8) updateContentScripts への移行: 既登録ありなら 1 回の API call で原子的に更新。
  // unregister + register の 2 round-trip 中に SW evict されると ID 重複 / 中断状態になり得るリスクを解消。
  // 既登録なしの初回は updateContentScripts が失敗するので、 その時のみ register にフォールバック。
  let registered = false;
  try {
    await chrome.scripting.updateContentScripts([scriptConfig]);
    registered = true;
  } catch (_) {
    // 初回登録 / ID 不在: register でフォールバック (この経路は通常 onInstalled 直後のみ)
    try {
      await chrome.scripting.registerContentScripts([scriptConfig]);
      registered = true;
    } catch (e) {
      console.error('[フォント置換] JS登録失敗:', e && e.message);
    }
  }
  try { await chrome.storage.local.set({ [presetKey]: registered }); } catch {}
}

/**
 * ensureRegistration のシリアライズラッパー
 * 複数の呼び出しを直列化して、"Duplicate script ID" 競合を防ぐ
 */
function ensureRegistration(settings) {
  const next = _registrationLock
    .catch(() => {}) // 前回の reject は握りつぶして連鎖を止める
    .then(() => _doEnsureRegistration(settings));
  _registrationLock = next;
  return next;
}

// インストール時・アップデート時・リロード時に登録
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await loadSettings();
  await ensureRegistration(settings);
});

// ブラウザ起動時の防御策（persistAcrossSessions が失われた場合のリカバリ）
chrome.runtime.onStartup.addListener(async () => {
  const settings = await loadSettings();
  await ensureRegistration(settings);
});

// 設定変更の監視 (連続更新をデバウンスして registerContentScripts の無駄打ちを避ける)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  // 我々自身が書いた presetRegisteredKey の変更は無視（無限ループ防止）
  if (!changes[FONT_REGISTRY.storageKey]) return;
  _pendingSettings = mergeFontSettings(changes[FONT_REGISTRY.storageKey].newValue || {});
  if (_storageDebounceTimer) clearTimeout(_storageDebounceTimer);
  _storageDebounceTimer = setTimeout(async () => {
    _storageDebounceTimer = null;
    const toApply = _pendingSettings;
    _pendingSettings = null;
    if (toApply) await ensureRegistration(toApply);
  }, STORAGE_DEBOUNCE_MS);
});
