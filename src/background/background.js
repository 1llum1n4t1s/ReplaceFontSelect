/**
 * Service Worker — プリセットJSの動的登録
 */

// variant.js を先に読み込み、 mergeFontSettings の lockedFonts override が効くようにする。
// Chrome SW では importScripts、 Firefox event page では manifest.background.scripts 経由でロード。
if (typeof importScripts === 'function') {
  importScripts('/src/content/variant.js', '/src/content/font-config.js');
}

const SCRIPT_ID = 'replace-font-css';

// SW evict (Chrome MV3 30 秒 idle) で setTimeout がキャンセルされるため、 debounce / retry は
// chrome.alarms に移行する (#SW-EVICT / #BG-ERROR-RETRY)。
const ALARM_DEBOUNCE = 'rfs-register-debounce';
const ALARM_RETRY = 'rfs-register-retry';
const STORAGE_DEBOUNCE_DELAY_MIN = 0.0025; // 0.15 秒 (chrome.alarms の最小単位回避のため小数)
// retry: exponential backoff (1m → 5m → 30m → 60m cap)
const RETRY_DELAYS_MIN = [1, 5, 30, 60];
let _retryAttempt = 0;

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
 * 現在の登録内容を取得し、 desired と一致するか判定
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
    _retryAttempt = 0;
    return;
  }

  const jsPath = getPresetPath(settings);
  // (P3-2) all_frames を false に。 iframe (広告 / 埋め込み) への注入を抑制し、
  // long_tasks 増加の主要因 (all_frames 倍率) を解消する。
  // iframe 内置換が必要なケースは将来 per-origin allowlist で個別対応。
  const scriptConfig = {
    id: SCRIPT_ID,
    matches: ['<all_urls>'],
    js: [jsPath],
    runAt: 'document_start',
    allFrames: false,
    world: 'ISOLATED',
    persistAcrossSessions: true
  };

  if (await isRegistrationUpToDate(scriptConfig)) {
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
    _retryAttempt = 0;
    return;
  }

  // (P1-8) unregister+register の 2 round-trip を 1 回の API call に統合。
  // 既存登録あり → updateContentScripts (差分パッチ)、 なし → registerContentScripts。
  // 「登録なし時間窓」が消えるので、 設定変更直後にページが開かれても preset が確実に注入される。
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (existing && existing.length > 0) {
      await chrome.scripting.updateContentScripts([scriptConfig]);
    } else {
      await chrome.scripting.registerContentScripts([scriptConfig]);
    }
    try { await chrome.storage.local.set({ [presetKey]: true }); } catch {}
    _retryAttempt = 0;
  } catch (e) {
    // (#BG-ERROR-RETRY) 構造化ログ + alarms ベースの指数バックオフ retry。
    // SW restart 復旧パスは onStartup のみで覆われない (browser 再起動時のみ) ため、
    // SW alive 中の一時的な API 失敗 (Chrome internal error 等) に対しても retry する。
    console.error('[フォント置換] JS登録失敗:', {
      name: e?.name,
      message: e?.message,
      scriptId: SCRIPT_ID,
      jsPath,
      attempt: _retryAttempt
    });
    try {
      await chrome.storage.local.set({
        [presetKey]: false,
        _last_register_error: { ts: Date.now(), message: e?.message || String(e), name: e?.name, attempt: _retryAttempt }
      });
    } catch {}

    // exponential backoff retry
    const delay = RETRY_DELAYS_MIN[Math.min(_retryAttempt, RETRY_DELAYS_MIN.length - 1)];
    _retryAttempt++;
    try {
      await chrome.alarms.create(ALARM_RETRY, { delayInMinutes: delay });
      console.warn(`[フォント置換] 登録 retry を ${delay} 分後に schedule (attempt=${_retryAttempt})`);
    } catch {}
  }
}

/**
 * ensureRegistration のシリアライズラッパー
 * 複数の呼び出しを直列化して、 "Duplicate script ID" 競合を防ぐ
 */
function ensureRegistration(settings) {
  const next = _registrationLock
    .catch(() => {})
    .then(() => _doEnsureRegistration(settings));
  _registrationLock = next;
  return next;
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await loadSettings();
  await ensureRegistration(settings);
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await loadSettings();
  await ensureRegistration(settings);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (!changes[FONT_REGISTRY.storageKey]) return;
  // (#SW-EVICT) setTimeout debounce を chrome.alarms.create に置換。
  // SW evict 時も alarm は永続化されているため、 wake-up 後に確実に発火する。
  try {
    chrome.alarms.create(ALARM_DEBOUNCE, { delayInMinutes: STORAGE_DEBOUNCE_DELAY_MIN });
  } catch {}
});

// alarms ハンドラ: debounce / retry 両方をここで処理。
// SW evict 後の wake-up 時にも storage の最新値を fetch するため race-free。
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_DEBOUNCE && alarm.name !== ALARM_RETRY) return;
  const settings = await loadSettings();
  await ensureRegistration(settings);
});
