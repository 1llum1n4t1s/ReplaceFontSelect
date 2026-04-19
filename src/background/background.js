/**
 * Service Worker — プリセットJSの動的登録
 */

// font-config.js を単一の真実の源泉として使用
importScripts('/src/content/font-config.js');

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
    return Object.assign({}, FONT_REGISTRY.defaults);
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
    return (
      Array.isArray(reg.js) && reg.js.length === 1 && reg.js[0] === desired.js[0] &&
      reg.runAt === desired.runAt &&
      reg.allFrames === desired.allFrames &&
      reg.world === desired.world
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
  const scriptConfig = {
    id: SCRIPT_ID,
    matches: ['<all_urls>'],
    js: [jsPath],
    runAt: 'document_start',
    allFrames: true,
    world: 'ISOLATED',
    persistAcrossSessions: true
  };

  // 差分チェック: 現在の登録内容が希望形と一致していれば skip（不要な API 呼び出し削減）
  if (await isRegistrationUpToDate(scriptConfig)) {
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
    return;
  }

  try { await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }); } catch {}

  try {
    await chrome.scripting.registerContentScripts([scriptConfig]);
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
  } catch (e) {
    console.error('[フォント置換] JS登録失敗:', e && e.message);
    try { await chrome.storage.local.set({ [presetKey]: false }); } catch {}
  }
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
