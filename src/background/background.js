/**
 * Service Worker — プリセットJSの動的登録
 */

// font-config.js を単一の真実の源泉として使用
importScripts('/src/content/font-config.js');

const SCRIPT_ID = 'replace-font-css';

function getPresetPath(settings) {
  const { bodyFont, monoFont, bodyFontWeight } = settings;
  return `src/css/preset-${bodyFont}-${monoFont}-w${bodyFontWeight}.js`;
}

// 空文字・undefined を除外して defaults にマージ（preload-fonts.js と同一ポリシー）
function mergeWithDefaults(stored) {
  const defaults = FONT_REGISTRY.defaults;
  const filtered = Object.fromEntries(
    Object.entries(stored).filter(([, v]) => v !== undefined && v !== '')
  );
  return { ...defaults, ...filtered };
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(FONT_REGISTRY.storageKey);
    return mergeWithDefaults(result[FONT_REGISTRY.storageKey] || {});
  } catch {
    return { ...FONT_REGISTRY.defaults };
  }
}

async function ensureRegistration(settings) {
  if (!settings.enabled) {
    try { await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] }); } catch {}
    await chrome.storage.local.set({ prebuiltCSSRegistered: false });
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
    await chrome.storage.local.set({ prebuiltCSSRegistered: true });
  } catch (e) {
    console.error('[フォント置換] JS登録失敗:', e.message);
    await chrome.storage.local.set({ prebuiltCSSRegistered: false });
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

// 設定変更の監視
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local' || !changes[FONT_REGISTRY.storageKey]) return;
  const newSettings = mergeWithDefaults(changes[FONT_REGISTRY.storageKey].newValue || {});
  await ensureRegistration(newSettings);
});
