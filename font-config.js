/**
 * フォントレジストリ
 * content_scripts と popup の両方で共有するフォント定義
 */
// eslint-disable-next-line no-unused-vars
const FONT_REGISTRY = {
  body: {
    'noto-sans-jp': {
      name: 'Noto Sans JP',
      displayName: 'Noto Sans JP',
      fallback: 'sans-serif',
      localFontsRegular: ['Noto Sans JP', 'Noto Sans CJK Variable', 'Noto Sans CJK JP'],
      localFontsBold: ['Noto Sans JP', 'Noto Sans CJK Variable', 'Noto Sans CJK JP'],
      woff2Regular: 'NotoSansJP-Regular.woff2',
      woff2Medium: 'NotoSansJP-Medium.woff2',
      woff2Bold: 'NotoSansJP-Bold.woff2'
    },
    'ibm-plex-sans-jp': {
      name: 'IBM Plex Sans JP',
      displayName: 'IBM Plex Sans JP',
      fallback: 'sans-serif',
      localFontsRegular: ['IBM Plex Sans JP'],
      localFontsBold: ['IBM Plex Sans JP Bold'],
      woff2Regular: 'IBMPlexSansJP-Regular.woff2',
      woff2Medium: 'IBMPlexSansJP-Medium.woff2',
      woff2Bold: 'IBMPlexSansJP-Bold.woff2'
    },
    'm-plus-2': {
      name: 'M PLUS 2',
      displayName: 'M PLUS 2',
      fallback: 'sans-serif',
      localFontsRegular: ['M PLUS 2'],
      localFontsBold: ['M PLUS 2'],
      woff2Regular: 'MPLUS2.woff2',
      woff2Medium: 'MPLUS2.woff2',
      woff2Bold: 'MPLUS2.woff2'
    },
    'murecho': {
      name: 'Murecho',
      displayName: 'Murecho',
      fallback: 'sans-serif',
      localFontsRegular: ['Murecho'],
      localFontsBold: ['Murecho'],
      woff2Regular: 'Murecho.woff2',
      woff2Medium: 'Murecho.woff2',
      woff2Bold: 'Murecho.woff2'
    },
    'zen-kaku-gothic-new': {
      name: 'Zen Kaku Gothic New',
      displayName: 'Zen Kaku Gothic New',
      fallback: 'sans-serif',
      localFontsRegular: ['Zen Kaku Gothic New'],
      localFontsBold: ['Zen Kaku Gothic New Bold'],
      woff2Regular: 'ZenKakuGothicNew-Regular.woff2',
      woff2Medium: 'ZenKakuGothicNew-Medium.woff2',
      woff2Bold: 'ZenKakuGothicNew-Bold.woff2'
    }
  },
  mono: {
    'udev-gothic-jpdoc': {
      name: 'UDEV Gothic JPDOC',
      displayName: 'UDEV Gothic JPDOC',
      fallback: 'monospace',
      localFontsRegular: ['UDEV Gothic JPDOC'],
      localFontsBold: ['UDEV Gothic JPDOC Bold'],
      woff2Regular: 'UDEVGothicJPDOC-Regular.woff2',
      woff2Bold: 'UDEVGothicJPDOC-Bold.woff2'
    },
    'plemoljp': {
      name: 'PlemolJP',
      displayName: 'PlemolJP',
      fallback: 'monospace',
      localFontsRegular: ['PlemolJP'],
      localFontsBold: ['PlemolJP Bold'],
      woff2Regular: 'PlemolJP-Regular.woff2',
      woff2Bold: 'PlemolJP-Bold.woff2'
    },
    'moralerspace-neon-jpdoc': {
      name: 'Moralerspace Neon JPDOC',
      displayName: 'Moralerspace Neon JPDOC',
      fallback: 'monospace',
      localFontsRegular: ['Moralerspace Neon JPDOC'],
      localFontsBold: ['Moralerspace Neon JPDOC Bold'],
      woff2Regular: 'MoralerspaceNeonJPDOC-Regular.woff2',
      woff2Bold: 'MoralerspaceNeonJPDOC-Bold.woff2'
    }
  },
  defaults: {
    bodyFont: 'noto-sans-jp',
    monoFont: 'udev-gothic-jpdoc',
    bodyFontWeight: '400'
  },
  storageKey: 'fontSettings'
};
