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

// フォント設定と置換除外リストを1回の読込で同じ時点の値として読む。失敗時は null を返す。
async function readRegistrationInputs() {
  try {
    const result = await chrome.storage.local.get([FONT_REGISTRY.storageKey, FONT_REGISTRY.siteExclusionsKey]);
    return {
      settings: mergeFontSettings(result[FONT_REGISTRY.storageKey] || {}),
      siteMatches: SiteExclusions.toMatchPatterns(result[FONT_REGISTRY.siteExclusionsKey])
    };
  } catch (e) {
    console.error('[フォント置換] 設定の読込に失敗:', e && e.message);
    return null;
  }
}

/**
 * 現在の登録内容が desired と一致するか判定
 */
function isRegistrationUpToDate(desired, reg) {
  try {
    if (!reg) return false;
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

async function ensureScriptRegistration(scriptConfig, currentRegistration) {
  if (isRegistrationUpToDate(scriptConfig, currentRegistration)) return true;

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

// preserveOnFailure: 設定を読めないとき、既定値で張り替えず現在の登録を保つ (storage.onChanged 経路)。
// false の場合 (onInstalled / onStartup) は既定値へフォールバックして登録する。
async function _doEnsureRegistration(preserveOnFailure) {
  const presetKey = FONT_REGISTRY.presetRegisteredKey;
  // 設定と除外リストは直列化ロック内で読む。どちらかを読めなければ両方とも読込失敗として扱う。
  let inputs = await readRegistrationInputs();
  if (!inputs) {
    if (preserveOnFailure) return;
    inputs = { settings: getDefaultSettings(), siteMatches: [] };
  }
  const { settings, siteMatches } = inputs;

  if (!settings.enabled) {
    try { await chrome.scripting.unregisterContentScripts({ ids: MANAGED_SCRIPT_IDS }); } catch {}
    try { await chrome.storage.local.set({ [presetKey]: false }); } catch {}
    return;
  }

  const jsPath = getPresetPath(settings);
  // variant 設定の excludeMatches を動的登録にも反映する。
  // manifest.json の content_scripts.exclude_matches は宣言的な preload 側にしか効かない。
  // 動的登録するプリセット JS と MAIN world フックにも同じ除外を適用する。
  // 置換除外リストのうち match pattern で同じ意味を表せる規則（素のホスト名）も前倒しで除外する。
  // それ以外の規則は preload-fonts.js の実行時判定が preset を外す。
  const variantExcludes = (typeof VARIANT !== 'undefined' && Array.isArray(VARIANT.excludeMatches))
    ? VARIANT.excludeMatches
    : [];
  const excludeMatches = [...new Set([...variantExcludes, ...siteMatches])];
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

  let currentRegistrations = [];
  try {
    currentRegistrations = await chrome.scripting.getRegisteredContentScripts({ ids: MANAGED_SCRIPT_IDS }) || [];
  } catch {}
  const [presetRegistered] = await Promise.all([
    ensureScriptRegistration(presetConfig, currentRegistrations.find(reg => reg.id === PRESET_SCRIPT_ID)),
    ensureScriptRegistration(shadowConfig, currentRegistrations.find(reg => reg.id === SHADOW_INTERCEPT_SCRIPT_ID))
  ]);
  try { await chrome.storage.local.set({ [presetKey]: presetRegistered }); } catch {}
}

/**
 * ensureRegistration のシリアライズラッパー
 * 複数の呼び出しを直列化して、"Duplicate script ID" 競合を防ぐ
 */
function ensureRegistration(preserveOnFailure = false) {
  const next = _registrationLock
    .catch(() => {}) // 前回の reject は握りつぶして連鎖を止める
    .then(() => _doEnsureRegistration(preserveOnFailure));
  _registrationLock = next;
  return next;
}

// ---- ブラウザ起動後の補填 ----
// 起動時のタブ復元で、宣言的 content script が入らないページが出ることがある（再読み込みで直る）。
// onStartup のときだけ、未初期化の http/https フレームへ manifest と同じ順で注入し直す。
const STARTUP_SUPPLEMENT_DELAYS_MS = [0, 2000, 8000];

// '*' だけをワイルドカードとして扱う glob 判定（正規表現は使わない）。
function matchesGlob(pattern, text) {
  const parts = pattern.split('*');
  if (parts.length === 1) return pattern === text;
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!text.startsWith(first)) return false;
  let pos = first.length;
  for (let i = 1; i < parts.length - 1; i++) {
    const found = text.indexOf(parts[i], pos);
    if (found < 0) return false;
    pos = found + parts[i].length;
  }
  return text.length - last.length >= pos && text.endsWith(last);
}

function matchesPatternHost(patternHost, hostname) {
  const host = patternHost.toLowerCase();
  if (host === '*') return true;
  if (host.startsWith('*.')) {
    const base = host.slice(2);
    return hostname === base || hostname.endsWith('.' + base);
  }
  return hostname === host;
}

// match pattern（<all_urls>・スキーム `*`・`*.` ホスト・パスのワイルドカード）に URL が一致するか。
function matchesMatchPattern(pattern, url) {
  if (pattern === '<all_urls>') return true;
  let parsed;
  try { parsed = new URL(url); } catch { return false; }
  const schemeEnd = pattern.indexOf('://');
  if (schemeEnd < 0) return false;
  const rest = pattern.slice(schemeEnd + 3);
  const slash = rest.indexOf('/');
  if (slash < 0) return false;
  const scheme = pattern.slice(0, schemeEnd);
  const protocol = parsed.protocol.slice(0, -1);
  const schemeOk = scheme === '*' ? (protocol === 'http' || protocol === 'https') : scheme === protocol;
  return schemeOk &&
    matchesPatternHost(rest.slice(0, slash), parsed.hostname) &&
    matchesGlob(rest.slice(slash), parsed.pathname + parsed.search);
}

function isSupplementTarget(url, excludes) {
  if (typeof url !== 'string' || !(url.startsWith('https://') || url.startsWith('http://'))) return false;
  return !excludes.some((pattern) => matchesMatchPattern(pattern, url));
}

// 各フレームの isolated world で実行する。preload-fonts.js が一度でも始まっていればフラグが立っている。
function probeContentScriptState() {
  return { href: location.href, ready: globalThis.__replaceFontPreloadStarted === true };
}

// 応答しない executeScript で次の回が止まらないよう、タブごとに待ちの上限を置く。
const STARTUP_TAB_TIMEOUT_MS = 1500;
const _startupSupplementTabs = new Set();

// 1タブ分。待ちの上限を過ぎてから解決したプローブからも注入する（起動直後はページが重く、往復が遅れうる）。
// 次の回と重なっても、documentId の固定と preload-fonts.js の初期化ガードで二重に動かない。
async function runTabSupplement(tabId, files, excludes) {
  const probes = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    injectImmediately: true,
    func: probeContentScriptState
  });
  // documentId の無いフレームは、プローブ後に別文書へ遷移していても判別できないため注入しない。
  const targets = (probes || []).filter((r) =>
    r && r.documentId && r.result && r.result.ready === false && isSupplementTarget(r.result.href, excludes));
  // 一部のフレームの消失で全体が失敗しないよう、フレームごとに個別に注入する。
  const results = await Promise.allSettled(targets.map((r) => chrome.scripting.executeScript({
    target: { tabId, documentIds: [r.documentId] },
    files,
    injectImmediately: true
  })));
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    const reason = failed[0].reason;
    console.error(`[フォント置換] 起動後の補填に一部失敗 (tab ${tabId}, ${failed.length}/${targets.length} フレーム):`, reason && reason.message);
  }
}

async function supplementTab(tabId, files, excludes) {
  if (_startupSupplementTabs.has(tabId)) return;
  _startupSupplementTabs.add(tabId);
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, STARTUP_TAB_TIMEOUT_MS);
  });
  try {
    await Promise.race([runTabSupplement(tabId, files, excludes), timeout]);
  } catch (e) {
    console.error(`[フォント置換] 起動後の補填に失敗 (tab ${tabId}):`, e && e.message);
  } finally {
    clearTimeout(timer);
    _startupSupplementTabs.delete(tabId);
  }
}

// タブの URL（読み込み中は pendingUrl）が http/https のものだけを対象にする。url が取れないタブは対象外。
function isSupplementTab(tab) {
  if (!tab || typeof tab.id !== 'number' || tab.discarded) return false;
  const url = tab.url || tab.pendingUrl;
  return typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
}

async function supplementStartupTabs() {
  try {
    const inputs = await readRegistrationInputs();
    if (!inputs || !inputs.settings.enabled) return;
    const manifestScript = (chrome.runtime.getManifest().content_scripts || [])[0];
    if (!manifestScript || !Array.isArray(manifestScript.js)) return;
    const variantExcludes = (typeof VARIANT !== 'undefined' && Array.isArray(VARIANT.excludeMatches))
      ? VARIANT.excludeMatches
      : [];
    const excludes = [...new Set([...variantExcludes, ...(manifestScript.exclude_matches || []), ...inputs.siteMatches])];
    const tabs = await chrome.tabs.query({});
    await Promise.all(tabs
      .filter(isSupplementTab)
      .map((tab) => supplementTab(tab.id, manifestScript.js, excludes)));
  } catch (e) {
    console.error('[フォント置換] 起動後の補填に失敗:', e && e.message);
  }
}

// タブの復元が遅れる場合に備え、数回に分けて実行する（Service Worker が生きている範囲）。
function scheduleStartupSupplement() {
  for (const delay of STARTUP_SUPPLEMENT_DELAYS_MS) {
    setTimeout(() => { supplementStartupTabs(); }, delay);
  }
}

// インストール時・アップデート時・リロード時に登録
chrome.runtime.onInstalled.addListener(() => ensureRegistration());

// ブラウザ起動時の防御策（persistAcrossSessions が失われた場合のリカバリ）。
// 登録の成否にかかわらず、すでに開いているタブへの補填も行う。
chrome.runtime.onStartup.addListener(() => {
  ensureRegistration().catch((e) => console.error('[フォント置換] 起動時の登録に失敗:', e && e.message));
  scheduleStartupSupplement();
});

// 設定変更の監視 (連続更新をデバウンスして registerContentScripts の無駄打ちを避ける)
(() => {
  let _storageDebounceTimer = null;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    // fontSettings と siteExclusions の変更だけを契機にする。
    // 我々自身が書いた presetRegisteredKey の変更は無視（無限ループ防止）
    if (!changes[FONT_REGISTRY.storageKey] && !changes[FONT_REGISTRY.siteExclusionsKey]) return;
    if (_storageDebounceTimer) clearTimeout(_storageDebounceTimer);
    _storageDebounceTimer = setTimeout(() => {
      _storageDebounceTimer = null;
      // 発火時に storage を読み直す。読めない場合は現在の登録を保つ。
      ensureRegistration(true).catch((e) => console.error('[フォント置換] 登録更新に失敗:', e && e.message));
    }, STORAGE_DEBOUNCE_MS);
  });
})();
