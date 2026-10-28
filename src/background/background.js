/**
 * Service Worker — プリセットJSと Shadow DOM フックの動的登録
 */

// variant.js を先に読み込み、mergeFontSettings の lockedFonts override が効くようにする。
// font-config.js を単一の真実の源泉として使用。
// Chrome の Service Worker context では importScripts でロード。
// Firefox の event page では manifest.background.scripts で既にロード済み (importScripts は worker 限定 API)。
if (typeof importScripts === 'function') {
  importScripts('/src/content/variant.js', '/src/content/font-config.js');
}

const PRESET_SCRIPT_ID = 'replace-font-css';
const SHADOW_INTERCEPT_SCRIPT_ID = 'replace-font-shadow-intercept';
const MANAGED_SCRIPT_IDS = [PRESET_SCRIPT_ID, SHADOW_INTERCEPT_SCRIPT_ID];
const STORAGE_DEBOUNCE_MS = 150;

// ensureRegistration の並行実行防止用ロック
// onInstalled + onStartup が同一 SW 起動で両方発火した場合の競合を避ける
let _registrationLock = Promise.resolve();

// Chrome のメッセージは旧版でも JSON シリアライズされるため、バイナリは base64 で渡す。
// 指定可能なパスは registry から導出し、送信元からの任意パスは受け取らない。
const youtubeAssetCache = new Map();
const youtubeAssetPending = new Map();
const YOUTUBE_CACHE_LIMIT = 24 * 1024 * 1024;
const YOUTUBE_ASSET_LIMIT = 6 * 1024 * 1024;
let youtubeCacheSize = 0;

async function getYouTubeAsset(path, binary) {
  if (youtubeAssetCache.has(path)) {
    const value = youtubeAssetCache.get(path);
    youtubeAssetCache.delete(path);
    youtubeAssetCache.set(path, value);
    return value;
  }
  if (youtubeAssetPending.has(path)) return youtubeAssetPending.get(path);
  const pending = (async () => {
    const response = await fetch(chrome.runtime.getURL(path));
    if (!response.ok) throw new Error('asset fetch failed');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > (binary ? YOUTUBE_ASSET_LIMIT : 1024 * 1024)) {
      throw new Error('asset size invalid');
    }
    let value;
    if (binary) {
      let data = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        data += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      value = btoa(data);
    } else {
      value = new TextDecoder().decode(bytes);
    }
    const size = value.length * 2;
    if (size <= YOUTUBE_CACHE_LIMIT) {
      while (youtubeCacheSize + size > YOUTUBE_CACHE_LIMIT && youtubeAssetCache.size) {
        const oldest = youtubeAssetCache.keys().next().value;
        youtubeCacheSize -= youtubeAssetCache.get(oldest).length * 2;
        youtubeAssetCache.delete(oldest);
      }
      youtubeAssetCache.set(path, value);
      youtubeCacheSize += size;
    }
    return value;
  })();
  youtubeAssetPending.set(path, pending);
  try { return await pending; } finally { youtubeAssetPending.delete(path); }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'replace-font-youtube-assets') return;
  let url;
  try { url = new URL(sender.url); } catch { return; }
  if (sender.id !== chrome.runtime.id || !Number.isInteger(sender.tab?.id) ||
      !Number.isInteger(sender.frameId) || !['http:', 'https:'].includes(url.protocol) ||
      !(url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com'))) return;
  (async () => {
    const stored = await chrome.storage.local.get(FONT_REGISTRY.storageKey);
    const settings = mergeFontSettings(stored[FONT_REGISTRY.storageKey] || {});
    if (!settings.enabled || settings.bodyFont !== message.bodyFont ||
        settings.monoFont !== message.monoFont || settings.bodyFontWeight !== message.bodyFontWeight) {
      throw new Error('settings changed');
    }
    const body = FONT_REGISTRY.body[settings.bodyFont];
    const mono = FONT_REGISTRY.mono[settings.monoFont];
    const names = [getBodyWoff2(body, settings.bodyFontWeight), body.woff2Bold, mono.woff2Regular, mono.woff2Bold];
    const uniqueNames = [...new Set(names)];
    const data = await Promise.all(uniqueNames.map(name => getYouTubeAsset(`src/fonts/${name}`, true)));
    const [css, youtubeOverride] = await Promise.all([
      getYouTubeAsset('src/css/replacefont-extension.css', false),
      getYouTubeAsset('src/css/youtube-override.css', false)
    ]);
    return { names, data: Object.fromEntries(uniqueNames.map((name, i) => [name, data[i]])), css: `${css}\n${youtubeOverride}` };
  })().then(sendResponse, () => sendResponse({ error: true }));
  return true;
});

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
    const current = await chrome.scripting.getRegisteredContentScripts({ ids: [desired.id] });
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
      Array.isArray(reg.js) && reg.js.length === desired.js.length &&
      reg.js.every((path, i) => path === desired.js[i]) &&
      reg.runAt === desired.runAt &&
      reg.allFrames === desired.allFrames &&
      reg.world === desired.world &&
      sameExcludes
    );
  } catch {
    return false;
  }
}

async function ensureScriptRegistration(scriptConfig) {
  if (await isRegistrationUpToDate(scriptConfig)) return true;

  // 既登録なら原子的に更新し、ID がまだ無い初回だけ register へフォールバックする。
  try {
    await chrome.scripting.updateContentScripts([scriptConfig]);
    return true;
  } catch (_) {
    try {
      await chrome.scripting.registerContentScripts([scriptConfig]);
      return true;
    } catch (e) {
      console.error(`[フォント置換] JS登録失敗 (${scriptConfig.id}):`, e && e.message);
      return false;
    }
  }
}

async function _doEnsureRegistration(settings) {
  const presetKey = FONT_REGISTRY.presetRegisteredKey;

  if (!settings.enabled) {
    try { await chrome.scripting.unregisterContentScripts({ ids: MANAGED_SCRIPT_IDS }); } catch {}
    try { await chrome.storage.local.set({ [presetKey]: false }); } catch {}
    return;
  }

  const jsPath = getPresetPath(settings);
  // variant 設定の excludeMatches を動的登録にも反映する。
  // manifest.json の content_scripts.exclude_matches は宣言的な preload 側にしか効かない。
  // 動的登録するプリセット JS と MAIN world フックにも同じ除外を適用する。
  const excludeMatches = (typeof VARIANT !== 'undefined' && Array.isArray(VARIANT.excludeMatches))
    ? VARIANT.excludeMatches.slice()
    : [];
  const commonConfig = {
    matches: ['<all_urls>'],
    runAt: 'document_start',
    allFrames: true,
    persistAcrossSessions: true
  };
  if (excludeMatches.length > 0) {
    commonConfig.excludeMatches = excludeMatches;
  }
  const presetConfig = {
    ...commonConfig,
    id: PRESET_SCRIPT_ID,
    js: ['src/content/youtube-target.js', jsPath],
    world: 'ISOLATED'
  };
  const shadowConfig = {
    ...commonConfig,
    id: SHADOW_INTERCEPT_SCRIPT_ID,
    js: ['src/content/inject.js'],
    world: 'MAIN'
  };

  const [presetRegistered] = await Promise.all([
    ensureScriptRegistration(presetConfig),
    ensureScriptRegistration(shadowConfig)
  ]);
  try { await chrome.storage.local.set({ [presetKey]: presetRegistered }); } catch {}
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
(() => {
  let _storageDebounceTimer = null;
  let _pendingSettings = null;
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
})();
