/**
 * Service Worker — プリセットJSの動的登録
 */

// font-config.js を単一の真実の源泉として使用
// (mergeFontSettings / getPresetFileName / FONT_REGISTRY を公開)
importScripts('/src/content/font-config.js');

const SCRIPT_ID = 'replace-font-css';
const STORAGE_DEBOUNCE_MS = 150;

let _storageDebounceTimer = null;
let _pendingSettings = null;

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

async function ensureRegistration(settings) {
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

  // ID指定で既存登録のみ解除（他のスクリプトに影響しない）
  try { await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }); } catch {}

  try {
    await chrome.scripting.registerContentScripts([scriptConfig]);
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
  } catch (e) {
    // 本番でも拾えるように console.error は残す (拡張機能のSWは通常ユーザに露出しない)
    console.error('[フォント置換] JS登録失敗:', e && e.message);
    try { await chrome.storage.local.set({ [presetKey]: false }); } catch {}
  }
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
