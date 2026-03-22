(() => {
  // デバッグログ: 本番では no-op に差し替えて文字列生成コストを排除
  const DEBUG = false;
  const log = DEBUG ? console.debug.bind(console) : () => {};

  // data-replace-font 属性値の定数
  const RFS_ATTR = 'replaceFont';
  const RFS_PRESET = 'preset';
  const RFS_FALLBACK = 'true';

  /**
   * @font-face ルールからフォントファミリー名を正規化して返す
   */
  function getFontFamilyName(rule) {
    return rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim().toLowerCase();
  }

  // ベースURL情報を取得。常に絶対パスになるようにする。
  const getExtensionBaseURL = () => {
    try {
      const url = chrome.runtime.getURL('');
      if (url && url.includes('://')) return url;
    } catch (e) {
      log('[フォント置換] runtime.getURL failed:', e.message);
    }
    return `chrome-extension://${chrome.runtime.id}/`;
  };

  const BASE_URL = getExtensionBaseURL();
  const FONT_BASE_URL = `${BASE_URL}fonts/`;
  const CSS_BASE_URL = `${BASE_URL}css/`;

  // テンプレートCSSファイルのURL（フォールバック用）
  const TEMPLATE_CSS_URL = `${CSS_BASE_URL}replacefont-extension.css`;

  // ── 早期 <head> 監視バッファ ──
  // 非同期の設定読み込みを待つ間に、サイトが <head> に追加する
  // <style> / <link> ノードをバッファリングする。
  const earlyStyleBuffer = [];
  let earlyHeadObserver = null;

  function startEarlyHeadMonitor() {
    if (earlyHeadObserver) return;
    const head = document.head;
    if (!head) return;
    earlyHeadObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'STYLE' ||
              (node.nodeName === 'LINK' && (node.rel === 'stylesheet' || node.as === 'style'))) {
            earlyStyleBuffer.push(node);
          }
        }
      }
    });
    earlyHeadObserver.observe(head, { childList: true });
  }

  // キャッシュ
  const fixedCSSCache = new Map();
  let sharedStyleSheetPromise = null;

  // 選択されたフォント情報（設定読み込み後にセットされる）
  let selectedBodyFont = null;
  let selectedMonoFont = null;
  let selectedBodyFontWeight = null;
  let fontConfig = [];
  let settingsReady = false;
  let prebuiltCSSRegistered = false; // プリセットCSS登録済みフラグ
  const pendingRoots = new Set();

  /**
   * プリセットJSが注入した <style data-replace-font="preset"> がDOMに存在するかチェックする
   * background.js の registerContentScripts で登録されたJSファイルが
   * <style data-replace-font="preset"> を生成・注入する
   */
  function checkPresetCSSInDOM() {
    const root = document.head || document.documentElement;
    if (!root) return false;
    return root.querySelector(`style[data-${RFS_ATTR}="${RFS_PRESET}"]`) !== null;
  }

  // ハードコードのフォールバック値
  const HARDCODED_DEFAULTS = { enabled: true, bodyFont: 'noto-sans-jp', monoFont: 'udev-gothic-jpdoc', bodyFontWeight: '400' };

  function getDefaultSettings() {
    return (typeof FONT_REGISTRY !== 'undefined' && FONT_REGISTRY.defaults)
      ? { ...HARDCODED_DEFAULTS, ...FONT_REGISTRY.defaults }
      : HARDCODED_DEFAULTS;
  }

  /**
   * chrome.storage.local からフォント設定を読み込む（タイムアウト付き）
   */
  function loadFontSettings() {
    const defaults = getDefaultSettings();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        log('[フォント置換] Settings load timeout, using defaults');
        resolve(defaults);
      }, 3000);

      try {
        if (typeof FONT_REGISTRY === 'undefined') {
          clearTimeout(timeout);
          resolve(defaults);
          return;
        }
        // fontSettings と prebuiltCSSRegistered を同時に読み込む
        chrome.storage.local.get([FONT_REGISTRY.storageKey, 'prebuiltCSSRegistered'], (result) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            resolve(defaults);
            return;
          }
          const stored = result[FONT_REGISTRY.storageKey] || {};
          prebuiltCSSRegistered = result.prebuiltCSSRegistered === true;
          resolve({
            ...defaults,
            ...Object.fromEntries(Object.entries(stored).filter(([, v]) => v !== undefined && v !== ''))
          });
        });
      } catch (e) {
        clearTimeout(timeout);
        resolve(defaults);
      }
    });
  }

  function getBodyWoff2(fontInfo, weight) {
    return weight === '500' ? fontInfo.woff2Medium : fontInfo.woff2Regular;
  }

  function buildFontConfig(bodyFontInfo, monoFontInfo, bodyFontWeight) {
    const bodyWoff2 = getBodyWoff2(bodyFontInfo, bodyFontWeight);
    return [
      { weight: 'Regular', fontFamily: bodyFontInfo.name, fontWeight: bodyFontWeight, fontUrl: `${FONT_BASE_URL}${bodyWoff2}` },
      { weight: 'Bold', fontFamily: bodyFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${bodyFontInfo.woff2Bold}` },
      { weight: 'MonoRegular', fontFamily: monoFontInfo.name, fontWeight: '400', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Regular}` },
      { weight: 'MonoBold', fontFamily: monoFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Bold}` }
    ];
  }

  // 置換マップ・正規表現のキャッシュ（フォールバック用）
  let placeholderMap = null;
  let placeholderRegex = null;

  /**
   * CSSテキスト内のプレースホルダーを置換する（フォールバック用）
   */
  function replaceFontPlaceholders(text) {
    if (!selectedBodyFont || !selectedMonoFont) return text;
    if (!placeholderMap) {
      const bodyWoff2 = getBodyWoff2(selectedBodyFont, selectedBodyFontWeight);
      placeholderMap = {
        '__REPLACE_FONT_BASE__': BASE_URL,
        '__BODY_FONT_NAME__': selectedBodyFont.name,
        '__BODY_FONT_FALLBACK__': selectedBodyFont.fallback,
        '__BODY_FONT_WEIGHT__': selectedBodyFontWeight,
        '__BODY_LOCAL_REGULAR__': selectedBodyFont.localFontsRegular.map(f => `local("${f}")`).join(', '),
        '__BODY_LOCAL_BOLD__': selectedBodyFont.localFontsBold.map(f => `local("${f}")`).join(', '),
        '__BODY_WOFF2_REGULAR__': bodyWoff2,
        '__BODY_WOFF2_BOLD__': selectedBodyFont.woff2Bold,
        '__MONO_FONT_NAME__': selectedMonoFont.name,
        '__MONO_FONT_FALLBACK__': selectedMonoFont.fallback,
        '__MONO_LOCAL_REGULAR__': selectedMonoFont.localFontsRegular.map(f => `local("${f}")`).join(', '),
        '__MONO_LOCAL_BOLD__': selectedMonoFont.localFontsBold.map(f => `local("${f}")`).join(', '),
        '__MONO_WOFF2_REGULAR__': selectedMonoFont.woff2Regular,
        '__MONO_WOFF2_BOLD__': selectedMonoFont.woff2Bold,
      };
      const escaped = Object.keys(placeholderMap)
        .map(k => k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'));
      placeholderRegex = new RegExp(escaped.join('|'), 'g');
    }
    return text.replace(placeholderRegex, match => placeholderMap[match]);
  }

  /**
   * CSS テキストを取得する
   * プリセットモード: プリセットJSが注入した <style data-replace-font="preset"> から取得
   * フォールバック: テンプレートCSSをfetch → プレースホルダー置換
   */
  function getCSSText(settings) {
    const cacheKey = prebuiltCSSRegistered ? 'preset' : 'template';
    if (fixedCSSCache.has(cacheKey)) return fixedCSSCache.get(cacheKey);

    const promise = (async () => {
      try {
        if (prebuiltCSSRegistered) {
          // プリセットモード: プリセットJSが注入した <style> からCSSテキストを取得
          const presetStyle = (document.head || document.documentElement)
            ?.querySelector(`style[data-${RFS_ATTR}="${RFS_PRESET}"]`);
          if (presetStyle) {
            return presetStyle.textContent;
          }
          // まだ注入されていない場合はフォールバック
          fixedCSSCache.delete(cacheKey);
          return null;
        }
        // フォールバック: テンプレートCSS
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(TEMPLATE_CSS_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        const text = await response.text();
        return replaceFontPlaceholders(text);
      } catch (e) {
        fixedCSSCache.delete(cacheKey);
        return null;
      }
    })();
    fixedCSSCache.set(cacheKey, promise);
    return promise;
  }

  /**
   * 共有 CSSStyleSheet を取得（adoptedStyleSheets 用、Shadow DOM 向け）
   */
  function getSharedStyleSheet(settings) {
    if (sharedStyleSheetPromise) return sharedStyleSheetPromise;
    sharedStyleSheetPromise = (async () => {
      const cssText = await getCSSText(settings);
      if (!cssText) { sharedStyleSheetPromise = null; return null; }
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cssText);
        return sheet;
      } catch (e) {
        sharedStyleSheetPromise = null;
        return null;
      }
    })();
    return sharedStyleSheetPromise;
  }

  // ── Shadow DOM 対応 ──

  function injectShadowDOMHandler() {
    try {
      const root = document.head || document.documentElement;
      if (!root) return;
      const scriptUrl = chrome.runtime.getURL('inject.js');
      if (document.querySelector(`script[src="${scriptUrl}"]`)) return;
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = false;
      script.onload = () => script.remove();
      root.appendChild(script);
    } catch (e) {
      log('[フォント置換] Shadow DOM handler injection failed:', e);
    }
  }

  window.addEventListener('replace-font-shadow-created', () => {
    const elements = document.querySelectorAll('[data-rfs-shadow]:not([data-rfs-done])');
    for (const el of elements) {
      el.setAttribute('data-rfs-done', '');
      if (el.shadowRoot) {
        log('[フォント置換] inject.js経由でShadow Root検出:', el.tagName);
        injectCSS(el.shadowRoot);
      }
    }
  });

  // 現在の設定を保持（getCSSText に渡すため）
  let currentSettings = null;

  /**
   * 指定したルート（ShadowRoot / document.head）に CSS を注入する
   * プリセットモードでは document.head への注入をスキップ
   * （background.js の registerContentScripts が同期的に処理済み）
   */
  async function injectCSS(root) {
    if (!root) return;
    if (root._replaceFontApplied || root._replaceFontInProgress) return;
    if (!settingsReady) {
      pendingRoots.add(root);
      return;
    }

    // プリセットモード: 登録CSSが実際にDOMに注入されているか確認
    // フラグだけでなく、実際に @font-face ルールが存在するかチェックする
    if (root === document.head && prebuiltCSSRegistered) {
      const hasPresetCSS = checkPresetCSSInDOM();
      if (hasPresetCSS) {
        root._replaceFontApplied = true;
        setupStyleSheetMonitor();
        return;
      }
      // 登録CSSが見つからない → フォールバック（下に続行）
      log('[フォント置換] プリセットCSS登録済みだがDOMに未反映。フォールバック注入実行');
      prebuiltCSSRegistered = false;
    }

    root._replaceFontInProgress = true;

    try {
      // ShadowRoot: adoptedStyleSheets で共有インスタンスを優先使用
      if (root instanceof ShadowRoot) {
        const sheet = await getSharedStyleSheet(currentSettings);
        if (sheet) {
          if (!root.adoptedStyleSheets.includes(sheet)) {
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
          }
          root._replaceFontApplied = true;
          return;
        }
      }

      // document.head（フォールバック）または adoptedStyleSheets 非対応時: <style> タグで注入
      const cssText = await getCSSText(currentSettings);
      if (!cssText) {
        root._replaceFontRetryCount = (root._replaceFontRetryCount || 0) + 1;
        if (root._replaceFontRetryCount >= 3) root._replaceFontApplied = true;
        return;
      }
      const style = document.createElement('style');
      style.textContent = cssText;
      style.dataset[RFS_ATTR] = RFS_FALLBACK;
      root.appendChild(style);
      root._replaceFontApplied = true;

      // document.head への注入時（フォールバック）: 競合 @font-face 監視
      if (root === document.head) {
        setupStyleSheetMonitor();
      }
    } catch (e) {
      // エラー時はサイレントに失敗
    } finally {
      root._replaceFontInProgress = false;
    }
  }

  function findShadowRoots(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.isConnected && node.shadowRoot) injectCSS(node.shadowRoot);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode.isConnected && currentNode.shadowRoot) injectCSS(currentNode.shadowRoot);
    }
  }

  function setupShadowDOMObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) findShadowRoots(node);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
    const CHUNK_SIZE = 200;
    let scanAborted = false;

    function processChunks() {
      if (scanAborted || !document.documentElement?.isConnected) { scanAborted = true; return; }
      let count = 0;
      let currentNode;
      while (count < CHUNK_SIZE && (currentNode = walker.nextNode())) {
        if (currentNode.isConnected && currentNode.shadowRoot) injectCSS(currentNode.shadowRoot);
        count++;
      }
      if (count === CHUNK_SIZE) {
        (window.requestIdleCallback || setTimeout)(processChunks, window.requestIdleCallback ? { timeout: 100 } : 0);
      }
    }

    window.addEventListener('pagehide', () => { scanAborted = true; }, { once: true });
    processChunks();
  }

  // ── フォント preload ──

  function createPreloadTag() {
    const root = document.head || document.documentElement;
    if (!root) return;
    const fragment = document.createDocumentFragment();
    for (const config of fontConfig) {
      if (!config.fontUrl || !config.fontUrl.startsWith(FONT_BASE_URL)) continue;
      const preloadTag = document.createElement('link');
      preloadTag.rel = 'preload';
      preloadTag.as = 'font';
      preloadTag.href = config.fontUrl;
      preloadTag.crossOrigin = 'anonymous';
      fragment.appendChild(preloadTag);
    }
    try { root.appendChild(fragment); } catch (e) {}
  }

  function setupFontForceLoad() {
    for (const config of fontConfig) {
      if (!config.fontUrl || !config.fontUrl.startsWith(FONT_BASE_URL)) continue;
      const fontName = config.fontFamily || config.weight;
      const fontWeight = config.fontWeight || 'normal';
      try {
        const fontFace = new FontFace(fontName, `url("${config.fontUrl}")`, { display: 'swap', weight: fontWeight });
        fontFace.load().then(loaded => {
          if (document.fonts) document.fonts.add(loaded);
        }).catch(() => {});
      } catch (e) {}
    }
  }

  // ── 競合 @font-face 無効化 ──

  /**
   * サイトの競合 @font-face を監視・無効化する
   * プリセットモードでも動作する（FONT_REGISTRY から直接ターゲット構築）
   */
  let styleSheetMonitorActive = false;

  function setupStyleSheetMonitor() {
    if (styleSheetMonitorActive || !document.head) return;
    styleSheetMonitorActive = true;

    // 早期バッファのオブザーバーを停止
    if (earlyHeadObserver) {
      earlyHeadObserver.disconnect();
      earlyHeadObserver = null;
    }

    // 置換対象フォントファミリーを「拡張機能のCSS」からのみ収集する
    // サイトの全 @font-face から収集すると icomoon 等のアイコンフォントまで対象になる
    const targetFamilies = new Set();
    try {
      if (typeof FONT_REGISTRY !== 'undefined') {
        // 現在選択中の置換先フォント名のみ除外する
        const replacementNames = new Set();
        if (selectedBodyFont) replacementNames.add(selectedBodyFont.name.toLowerCase());
        if (selectedMonoFont) replacementNames.add(selectedMonoFont.name.toLowerCase());

        // 拡張機能が定義した @font-face のフォントファミリー名のみを収集
        const extSheet = document.querySelector(`style[data-${RFS_ATTR}]`)?.sheet;
        if (extSheet) {
          try {
            for (const rule of extSheet.cssRules) {
              if (rule.type === CSSRule.FONT_FACE_RULE) {
                const family = getFontFamilyName(rule);
                if (family && !replacementNames.has(family)) {
                  targetFamilies.add(family);
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      log('[フォント置換] 置換対象フォント一覧の構築に失敗:', e.message);
    }

    // 対象が空なら監視不要（バッファもクリーンアップ）
    if (targetFamilies.size === 0) {
      earlyStyleBuffer.length = 0;
      return;
    }

    let hasBlockedSheets = false;

    function neutralizeCompetingFontFaces(sheet) {
      if (!sheet) return true;
      try {
        const rules = sheet.cssRules;
        if (!rules) return true;
        for (let i = rules.length - 1; i >= 0; i--) {
          if (rules[i].type === CSSRule.FONT_FACE_RULE) {
            if (targetFamilies.has(getFontFamilyName(rules[i]))) {
              sheet.deleteRule(i);
            }
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    function processStyleNode(node) {
      if (node.dataset && node.dataset[RFS_ATTR]) return;
      if (node.nodeName === 'STYLE' && node.sheet) {
        neutralizeCompetingFontFaces(node.sheet);
      }
      if (node.nodeName === 'LINK') {
        if (node.sheet) {
          neutralizeCompetingFontFaces(node.sheet);
        } else {
          node.addEventListener('load', () => {
            if (node.sheet) neutralizeCompetingFontFaces(node.sheet);
          }, { once: true });
        }
      }
    }

    // 既存のスタイルシートを走査
    for (const sheet of document.styleSheets) {
      if (!sheet.ownerNode?.dataset?.[RFS_ATTR]) {
        if (!neutralizeCompetingFontFaces(sheet)) {
          hasBlockedSheets = true;
        }
      }
    }

    // 早期バッファを処理
    for (const node of earlyStyleBuffer) {
      processStyleNode(node);
    }
    earlyStyleBuffer.length = 0;

    // CORS ブロックされたシートがある場合：拡張機能の <style> を <head> 末尾に再配置
    if (hasBlockedSheets) {
      const extStyle = document.querySelector(`style[data-${RFS_ATTR}]`);
      if (extStyle?.parentNode) {
        queueMicrotask(() => {
          if (extStyle.parentNode) extStyle.parentNode.appendChild(extStyle);
        });
      }
    }

    // 新しいスタイルシートの監視
    const headObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const isStyle = node.nodeName === 'STYLE';
          const isLink = node.nodeName === 'LINK' &&
            (node.rel === 'stylesheet' || node.as === 'style');
          if (isStyle || isLink) processStyleNode(node);
        }
      }
    });

    headObserver.observe(document.head, { childList: true });
    window.addEventListener('pagehide', () => headObserver.disconnect(), { once: true });
  }

  function flushPendingRoots() {
    if (pendingRoots.size === 0) return;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) injectCSS(root);
  }

  // ── 初期化 ──

  async function initialize() {
    if (document.documentElement.dataset.replaceFontInitialized) return;
    document.documentElement.dataset.replaceFontInitialized = 'true';
    log('[フォント置換] 初期化開始', location.href.substring(0, 80));

    injectShadowDOMHandler();
    setupShadowDOMObserver();

    // 早期 <head> 監視を開始
    if (document.head) {
      startEarlyHeadMonitor();
    } else {
      const headWatcher = new MutationObserver(() => {
        if (document.head) {
          headWatcher.disconnect();
          startEarlyHeadMonitor();
        }
      });
      headWatcher.observe(document.documentElement, { childList: true });
    }

    // フォント設定を読み込む（prebuiltCSSRegistered フラグも同時取得）
    const settings = await loadFontSettings();
    currentSettings = settings;
    log('[フォント置換] 設定読み込み完了:', settings, 'プリセットモード:', prebuiltCSSRegistered);

    // 無効化されている場合は何もしない
    if (!settings.enabled) {
      pendingRoots.clear();
      if (earlyHeadObserver) { earlyHeadObserver.disconnect(); earlyHeadObserver = null; }
      return;
    }

    const registry = (typeof FONT_REGISTRY !== 'undefined') ? FONT_REGISTRY : null;
    const bodyFontInfo = registry?.body?.[settings.bodyFont] || null;
    const monoFontInfo = registry?.mono?.[settings.monoFont] || null;

    if (!bodyFontInfo || !monoFontInfo) {
      pendingRoots.clear();
      if (earlyHeadObserver) { earlyHeadObserver.disconnect(); earlyHeadObserver = null; }
      return;
    }
    selectedBodyFont = bodyFontInfo;
    selectedMonoFont = monoFontInfo;
    selectedBodyFontWeight = settings.bodyFontWeight;

    fontConfig = buildFontConfig(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight);
    settingsReady = true;

    // メインドキュメントへの注入処理
    const performInjections = () => {
      const head = document.head;
      if (!head) return;
      injectCSS(head);
      createPreloadTag();
    };

    if (document.head) {
      performInjections();
    } else {
      const observer = new MutationObserver(() => {
        if (document.head) {
          observer.disconnect();
          performInjections();
        }
      });
      observer.observe(document.documentElement, { childList: true });
    }

    flushPendingRoots();
    setupFontForceLoad();

    log(`[フォント置換] 初期化完了: body=${selectedBodyFont.name} (weight=${selectedBodyFontWeight}), mono=${selectedMonoFont.name}, preset=${prebuiltCSSRegistered}`);
  }

  // 実行開始
  if (document.documentElement) {
    initialize();
  } else {
    const observer = new MutationObserver(() => {
      if (document.documentElement) {
        observer.disconnect();
        initialize();
      }
    });
    observer.observe(document, { childList: true });
  }
})();
