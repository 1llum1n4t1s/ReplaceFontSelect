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
    bodyFont: 'noto-sans-jp',
    monoFont: 'udev-gothic-jpdoc',
    bodyFontWeight: '400'
  },
  storageKey: 'fontSettings',
  presetRegisteredKey: 'prebuiltCSSRegistered'
};

// eslint-disable-next-line no-unused-vars
const FONT_SETTINGS_VALIDATORS = {
  enabled: (v) => typeof v === 'boolean',
  bodyFont: (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(FONT_REGISTRY.body, v),
  monoFont: (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(FONT_REGISTRY.mono, v),
  bodyFontWeight: (v) => v === '400' || v === '500'
};

// 保存済み設定をデフォルトとマージし、無効値はデフォルトに戻す
// eslint-disable-next-line no-unused-vars
function mergeFontSettings(stored) {
  const merged = Object.assign({}, FONT_REGISTRY.defaults);
  if (stored && typeof stored === 'object') {
    for (const key of Object.keys(FONT_REGISTRY.defaults)) {
      const validator = FONT_SETTINGS_VALIDATORS[key];
      if (Object.prototype.hasOwnProperty.call(stored, key) && validator(stored[key])) {
        merged[key] = stored[key];
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
function buildPlaceholderMap(bodyFont, monoFont, weight, baseUrl) {
  const safeLocal = (list) => list.map(f => `local("${String(f).replace(/"/g, '')}")`).join(', ');
  const bodyWoff2 = getBodyWoff2(bodyFont, weight);
  return {
    '__REPLACE_FONT_BASE__': baseUrl,
    '__BODY_FONT_NAME__': bodyFont.name,
    '__BODY_FONT_FALLBACK__': bodyFont.fallback,
    '__BODY_LOCAL_REGULAR__': safeLocal(bodyFont.localFontsRegular),
    '__BODY_LOCAL_BOLD__': safeLocal(bodyFont.localFontsBold),
    '__BODY_WOFF2_REGULAR__': bodyWoff2,
    '__BODY_WOFF2_BOLD__': bodyFont.woff2Bold,
    '__MONO_FONT_NAME__': monoFont.name,
    '__MONO_FONT_FALLBACK__': monoFont.fallback,
    '__MONO_LOCAL_REGULAR__': safeLocal(monoFont.localFontsRegular),
    '__MONO_LOCAL_BOLD__': safeLocal(monoFont.localFontsBold),
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
    mergeFontSettings,
    getPresetFileName,
    FONT_SETTINGS_VALIDATORS,
    getBodyWoff2,
    buildPlaceholderMap,
    PLACEHOLDER_REGEX_SOURCE
  };
}
