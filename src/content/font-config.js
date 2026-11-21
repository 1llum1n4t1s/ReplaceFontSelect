/**
 * フォントレジストリ
 * content_scripts と popup の両方で共有するフォント定義
 */
// eslint-disable-next-line no-unused-vars
const FONT_REGISTRY = {
  body: {
    'noto-sans-jp': {
      name: 'Noto Sans JP',
      fallback: 'sans-serif',
      localFontsRegular: ['Noto Sans JP', 'Noto Sans CJK Variable', 'Noto Sans CJK JP'],
      localFontsBold: ['Noto Sans JP', 'Noto Sans CJK Variable', 'Noto Sans CJK JP'],
      woff2Regular: 'NotoSansJP-Regular.woff2',
      woff2Medium: 'NotoSansJP-Medium.woff2',
      woff2Bold: 'NotoSansJP-Bold.woff2'
    },
    'ibm-plex-sans-jp': {
      name: 'IBM Plex Sans JP',
      fallback: 'sans-serif',
      localFontsRegular: ['IBM Plex Sans JP'],
      localFontsBold: ['IBM Plex Sans JP Bold'],
      woff2Regular: 'IBMPlexSansJP-Regular.woff2',
      woff2Medium: 'IBMPlexSansJP-Medium.woff2',
      woff2Bold: 'IBMPlexSansJP-Bold.woff2'
    },
    'm-plus-2': {
      name: 'M PLUS 2',
      fallback: 'sans-serif',
      localFontsRegular: ['M PLUS 2'],
      localFontsBold: ['M PLUS 2'],
      woff2Regular: 'MPLUS2.woff2',
      woff2Medium: 'MPLUS2.woff2',
      woff2Bold: 'MPLUS2.woff2'
    },
    'm-plus-rounded-1c': {
      name: 'M PLUS Rounded 1c',
      fallback: 'sans-serif',
      localFontsRegular: ['Rounded Mplus 1c', 'RoundedMplus1c-Regular'],
      localFontsBold: ['Rounded Mplus 1c Bold', 'RoundedMplus1c-Bold'],
      woff2Regular: 'MPLUSRounded1c-Regular.woff2',
      woff2Medium: 'MPLUSRounded1c-Medium.woff2',
      woff2Bold: 'MPLUSRounded1c-Bold.woff2'
    },
    'murecho': {
      name: 'Murecho',
      fallback: 'sans-serif',
      localFontsRegular: ['Murecho'],
      localFontsBold: ['Murecho'],
      woff2Regular: 'Murecho.woff2',
      woff2Medium: 'Murecho.woff2',
      woff2Bold: 'Murecho.woff2'
    },
    'zen-kaku-gothic-new': {
      name: 'Zen Kaku Gothic New',
      fallback: 'sans-serif',
      localFontsRegular: ['Zen Kaku Gothic New'],
      localFontsBold: ['Zen Kaku Gothic New Bold'],
      woff2Regular: 'ZenKakuGothicNew-Regular.woff2',
      woff2Medium: 'ZenKakuGothicNew-Medium.woff2',
      woff2Bold: 'ZenKakuGothicNew-Bold.woff2'
    },
    'line-seed-jp': {
      name: 'LINE Seed JP',
      fallback: 'sans-serif',
      localFontsRegular: ['LINE Seed JP'],
      localFontsBold: ['LINE Seed JP Bold'],
      woff2Regular: 'LINESeedJP-Regular.woff2',
      woff2Medium: 'LINESeedJP-Regular.woff2', // Medium 未提供のため Regular で代替
      woff2Bold: 'LINESeedJP-Bold.woff2'
    }
  },
  mono: {
    'udev-gothic-jpdoc': {
      name: 'UDEV Gothic JPDOC',
      fallback: 'monospace',
      localFontsRegular: ['UDEV Gothic JPDOC'],
      localFontsBold: ['UDEV Gothic JPDOC Bold'],
      woff2Regular: 'UDEVGothicJPDOC-Regular.woff2',
      woff2Bold: 'UDEVGothicJPDOC-Bold.woff2'
    },
    'plemoljp': {
      name: 'PlemolJP',
      fallback: 'monospace',
      localFontsRegular: ['PlemolJP'],
      localFontsBold: ['PlemolJP Bold'],
      woff2Regular: 'PlemolJP-Regular.woff2',
      woff2Bold: 'PlemolJP-Bold.woff2'
    },
    'moralerspace-neon-jpdoc': {
      name: 'Moralerspace Neon JPDOC',
      fallback: 'monospace',
      localFontsRegular: ['Moralerspace Neon JPDOC'],
      localFontsBold: ['Moralerspace Neon JPDOC Bold'],
      woff2Regular: 'MoralerspaceNeonJPDOC-Regular.woff2',
      woff2Bold: 'MoralerspaceNeonJPDOC-Bold.woff2'
    }
  },
  defaults: {
    enabled: true,
    bodyFont: 'ibm-plex-sans-jp',
    monoFont: 'udev-gothic-jpdoc',
    bodyFontWeight: '400'
  },
  storageKey: 'fontSettings',
  presetRegisteredKey: 'prebuiltCSSRegistered',
  // 置換除外リスト（URL / ホスト glob の配列）。fontSettings とは別キーにし、
  // フォント設定の保存やYouTubeの設定変更監視へ影響させない。
  siteExclusionsKey: 'siteExclusions'
};

// ---- 置換除外リスト ----
// popup の複数行入力・content の実行時判定・background の excludeMatches 生成で同じ判定を共有する。
// 規則は ReplaceTranslator の自動翻訳ブラックリストと同じ:
//   - `*` は任意の文字列。URL 規則（`://` を含む）は指定パス以下、ホスト規則はそのホスト全体。
//   - `host/path` はそのホストの指定パス以下（大文字小文字を区別しない）。
const SITE_EXCLUSIONS_MAX_ENTRIES = 500;
const SITE_EXCLUSIONS_MAX_PATTERN_CHARS = 1000;

function normalizeSiteExclusions(value) {
  const source = Array.isArray(value) ? value : (typeof value === 'string' ? [value] : []);
  const result = [];
  const seen = new Set();
  for (const item of source) {
    if (typeof item !== 'string') continue;
    for (const raw of item.split(/\r?\n/)) {
      const pattern = raw.trim();
      if (!pattern || pattern.length > SITE_EXCLUSIONS_MAX_PATTERN_CHARS || seen.has(pattern)) continue;
      seen.add(pattern);
      result.push(pattern);
      if (result.length >= SITE_EXCLUSIONS_MAX_ENTRIES) return result;
    }
  }
  return result;
}

function siteExclusionGlobMatches(value, pattern, prefix) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  try { return new RegExp(`^${escaped}${prefix ? '' : '$'}`, 'i').test(value); } catch (_e) { return false; }
}

function siteExclusionPatternMatches(url, pattern) {
  if (pattern.includes('://')) {
    if (pattern.includes('*')) return siteExclusionGlobMatches(url.href, pattern, false);
    try {
      const ruleUrl = new URL(pattern);
      if (ruleUrl.origin !== url.origin) return false;
      const rulePath = ruleUrl.pathname + ruleUrl.search + ruleUrl.hash;
      const actualPath = url.pathname + url.search + url.hash;
      return actualPath.startsWith(rulePath);
    } catch (_e) { return false; }
  }

  const slash = pattern.indexOf('/');
  const hostPattern = slash >= 0 ? pattern.slice(0, slash) : pattern;
  const pathPattern = slash >= 0 ? pattern.slice(slash) : '';
  if (!hostPattern || !siteExclusionGlobMatches(url.hostname, hostPattern, false)) return false;
  if (!pathPattern) return true;
  const actualPath = url.pathname + url.search + url.hash;
  return siteExclusionGlobMatches(actualPath, pathPattern, !pathPattern.includes('*'));
}

function siteExclusionMatches(urlValue, value) {
  let url;
  try { url = new URL(urlValue); } catch (_e) { return false; }
  return normalizeSiteExclusions(value).some((pattern) => siteExclusionPatternMatches(url, pattern));
}

function siteExclusionSitePattern(urlValue) {
  try {
    const url = new URL(urlValue);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname ? url.hostname.toLowerCase() : null;
  } catch (_e) { return null; }
}

// 動的登録 (preset JS / MAIN world フック) の excludeMatches へ前倒しで反映できる規則だけを
// match pattern に変換する。意味が完全に一致する「ワイルドカード・パス・ポートを含まない素のホスト名」
// に限る（`*.x.com` は match pattern だと x.com 自身も含み、意味が変わるため変換しない）。
// 1件でも無効な match pattern が混じると登録全体が失敗するため、変換対象は厳格に検証する。
// 変換できない規則は content 側の実行時判定だけで除外する。
// URL として解釈したホスト名が規則と同一の場合に限る（`1.2.3` → `1.2.0.3` のような正規化や、
// `example.123` のような URL として無効なホストは、実行時判定と一致しないため変換しない）。
// 既知の差: Chrome は照合時に末尾ドットを無視するため、`*://x.com/*` は `x.com.` にも一致するが、
// 実行時判定（ReplaceTranslator と同じ規則）は一致しない。その場合、preset JS と MAIN world フックは外れるが、
// 本文の置換は fallback 経路で続く。
const SITE_EXCLUSION_PLAIN_HOST = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
function siteExclusionHostIsCanonical(host) {
  try { return new URL(`http://${host}/`).hostname === host; } catch (_e) { return false; }
}
function siteExclusionsToMatchPatterns(value) {
  const result = [];
  for (const pattern of normalizeSiteExclusions(value)) {
    const host = pattern.toLowerCase();
    if (SITE_EXCLUSION_PLAIN_HOST.test(host) && siteExclusionHostIsCanonical(host)) result.push(`*://${host}/*`);
  }
  return [...new Set(result)];
}

// eslint-disable-next-line no-unused-vars
const SiteExclusions = Object.freeze({
  normalize: normalizeSiteExclusions,
  matches: siteExclusionMatches,
  sitePattern: siteExclusionSitePattern,
  toMatchPatterns: siteExclusionsToMatchPatterns
});

// eslint-disable-next-line no-unused-vars
const FONT_SETTINGS_VALIDATORS = {
  enabled: (v) => typeof v === 'boolean',
  bodyFont: (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(FONT_REGISTRY.body, v),
  monoFont: (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(FONT_REGISTRY.mono, v),
  bodyFontWeight: (v) => v === '400' || v === '500'
};

// 既定設定を返す (storage 到達不能時などのエラーフォールバック用)。
// lockedFonts は variant の契約なので障害時ほど守る必要がある (notosans で Noto Sans JP 以外を
// 選ぶと、同梱されていない preset JS を登録しようとして Path A ごと失敗する)。
// そのため raw defaults ではなく mergeFontSettings({}) 相当を返す。
// eslint-disable-next-line no-unused-vars
function getDefaultSettings() {
  return mergeFontSettings({});
}

// 保存済み設定をデフォルトとマージし、無効値はデフォルトに戻す
// eslint-disable-next-line no-unused-vars
function mergeFontSettings(stored) {
  const merged = { ...FONT_REGISTRY.defaults };
  if (stored && typeof stored === 'object') {
    for (const key of Object.keys(FONT_REGISTRY.defaults)) {
      const validator = FONT_SETTINGS_VALIDATORS[key];
      if (Object.prototype.hasOwnProperty.call(stored, key) && validator(stored[key])) {
        merged[key] = stored[key];
      }
    }
  }
  // バリアントが lockedFonts を持つ場合 (例: notosans variant) はユーザー設定より優先する。
  // VARIANT は scripts/build-variant.js が生成し、content_scripts / popup / background のいずれの
  // コンテキストでも variant.js が先に読まれている前提。未定義時 (Node テスト等) は何もしない。
  // 各 lockedFonts キーは念のため FONT_SETTINGS_VALIDATORS で再検証し、不正値はサイレントに無視する。
  if (typeof VARIANT !== 'undefined' && VARIANT && VARIANT.lockedFonts) {
    for (const key of Object.keys(VARIANT.lockedFonts)) {
      const validator = FONT_SETTINGS_VALIDATORS[key];
      const value = VARIANT.lockedFonts[key];
      if (validator && validator(value)) {
        merged[key] = value;
      }
    }
  }
  return merged;
}

// プリセット JS ファイル名を統一的に構築
// eslint-disable-next-line no-unused-vars
function getPresetFileName(bodyKey, monoKey, weight) {
  return `preset-${bodyKey}-${monoKey}-w${weight}.js`;
}

// body weight ('500' = Medium) に応じて woff2 を選ぶ（Medium 未提供なら Regular で代替）
// eslint-disable-next-line no-unused-vars
function getBodyWoff2(fontInfo, weight) {
  return weight === '500' ? (fontInfo.woff2Medium || fontInfo.woff2Regular) : fontInfo.woff2Regular;
}

// CSS プレースホルダー置換用のマップを構築する（fallback 経路とビルド経路で共有）
// CSS 構造破壊を防ぐため、family 名内の " は除去する
// eslint-disable-next-line no-unused-vars
function formatLocalFontSources(list) {
  return list.map(f => `local("${String(f).replace(/"/g, '')}")`).join(', ');
}

// eslint-disable-next-line no-unused-vars
function buildPlaceholderMap(bodyFont, monoFont, weight, baseUrl) {
  const bodyWoff2 = getBodyWoff2(bodyFont, weight);
  return {
    '__REPLACE_FONT_BASE__': baseUrl,
    '__BODY_FONT_NAME__': bodyFont.name,
    '__BODY_FONT_FALLBACK__': bodyFont.fallback,
    '__BODY_LOCAL_REGULAR__': formatLocalFontSources(bodyFont.localFontsRegular),
    '__BODY_LOCAL_BOLD__': formatLocalFontSources(bodyFont.localFontsBold),
    '__BODY_WOFF2_REGULAR__': bodyWoff2,
    '__BODY_WOFF2_BOLD__': bodyFont.woff2Bold,
    '__MONO_FONT_NAME__': monoFont.name,
    '__MONO_FONT_FALLBACK__': monoFont.fallback,
    '__MONO_LOCAL_REGULAR__': formatLocalFontSources(monoFont.localFontsRegular),
    '__MONO_LOCAL_BOLD__': formatLocalFontSources(monoFont.localFontsBold),
    '__MONO_WOFF2_REGULAR__': monoFont.woff2Regular,
    '__MONO_WOFF2_BOLD__': monoFont.woff2Bold
  };
}

// プレースホルダー検出用の正規表現（数字を含むキーにも対応）
const PLACEHOLDER_REGEX_SOURCE = '__[A-Z0-9_]+__';

// Node.js（ビルドスクリプト）からも require() で使用可能にする
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FONT_REGISTRY,
    getDefaultSettings,
    mergeFontSettings,
    getPresetFileName,
    FONT_SETTINGS_VALIDATORS,
    getBodyWoff2,
    buildPlaceholderMap,
    PLACEHOLDER_REGEX_SOURCE,
    SiteExclusions
  };
}
