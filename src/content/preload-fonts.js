(() => {
  // デバッグログ: 本番では no-op に差し替えて文字列生成コストを排除
  const DEBUG = false;
  const log = DEBUG ? console.debug.bind(console) : () => {};

  // data-replace-font 属性の定数
  const RFS_ATTR = 'replaceFont';
  const RFS_SELECTOR = 'data-replace-font';
  const RFS_PRESET = 'preset';
  const RFS_FALLBACK = 'fallback';
  const RFS_DYNAMIC = 'dynamic';

  // タイムアウト定数
  const SETTINGS_LOAD_TIMEOUT_MS = 3000;
  const CSS_FETCH_TIMEOUT_MS = 5000;

  // Shadow DOM 初期スキャンのチャンクサイズ
  const SHADOW_SCAN_CHUNK_SIZE = 200;

  // 動的フォント検出: Next.js next/font や PostCSS modules 等の自動生成 family 名
  // 例: __Inter_abc123, __Inter_Fallback_abc123
  const DYNAMIC_FONT_PATTERN = /^__[A-Za-z][A-Za-z0-9_]*_[a-f0-9]{4,}$/;
  // mono 系と判定するキーワード
  const MONO_KEYWORD_PATTERN = /mono|code|menlo|consolas|courier/i;

  /**
   * @font-face ルールからフォントファミリー名を正規化して返す
   */
  function getFontFamilyName(rule) {
    return rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim().toLowerCase();
  }

  // 拡張機能のベースURL取得
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
  const FONT_BASE_URL = `${BASE_URL}src/fonts/`;
  const CSS_BASE_URL = `${BASE_URL}src/css/`;
  const TEMPLATE_CSS_URL = `${CSS_BASE_URL}replacefont-extension.css`;

  // ── 早期 <head> 監視バッファ ──
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
    disposers.push(() => {
      if (earlyHeadObserver) {
        earlyHeadObserver.disconnect();
        earlyHeadObserver = null;
      }
    });
  }

  // ── 状態管理 ──
  const fixedCSSCache = new Map();
  let sharedStyleSheetPromise = null;
  let placeholderMap = null;
  let placeholderRegex = null;

  // 選択されたフォント情報（設定読み込み後にセットされる）
  let selectedBodyFont = null;
  let selectedMonoFont = null;
  let selectedBodyFontWeight = null;
  let fontConfig = [];
  let settingsReady = false;
  let prebuiltCSSRegistered = false;
  const pendingRoots = new Set();

  // ページ離脱時のクリーンアップ関数（MutationObserver / Listener 等のリーク防止）
  const disposers = [];
  const onPagehideDispose = () => {
    for (const dispose of disposers) {
      try { dispose(); } catch (e) {}
    }
  };
  const onPagehideCacheClear = (e) => {
    if (!e.persisted) return;
    // bfcache 復帰時: キャッシュを破棄して再構築に備える
    fixedCSSCache.clear();
    sharedStyleSheetPromise = null;
    placeholderMap = null;
    placeholderRegex = null;
  };
  window.addEventListener('pagehide', onPagehideCacheClear);
  window.addEventListener('pagehide', onPagehideDispose);
  // disposers 自身の cleanup（onPagehideDispose が複数回呼ばれるのを防ぐ）
  disposers.push(() => {
    window.removeEventListener('pagehide', onPagehideCacheClear);
    window.removeEventListener('pagehide', onPagehideDispose);
  });

  /**
   * プリセットJSが注入した <style data-replace-font="preset"> がDOMに存在するかチェックする
   */
  function checkPresetCSSInDOM() {
    const root = document.head || document.documentElement;
    if (!root) return false;
    return root.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`) !== null;
  }

  function getDefaultSettings() {
    return Object.assign({}, FONT_REGISTRY.defaults);
  }

  /**
   * chrome.storage.local からフォント設定を読み込む（タイムアウト付き）
   */
  function loadFontSettings() {
    const defaults = getDefaultSettings();
    const presetKey = FONT_REGISTRY.presetRegisteredKey;
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const timeout = setTimeout(() => {
        log('[フォント置換] Settings load timeout, using defaults');
        settle(defaults);
      }, SETTINGS_LOAD_TIMEOUT_MS);

      try {
        chrome.storage.local.get([FONT_REGISTRY.storageKey, presetKey], (result) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            settle(defaults);
            return;
          }
          const stored = result[FONT_REGISTRY.storageKey] || {};
          prebuiltCSSRegistered = result[presetKey] === true;
          settle(mergeFontSettings(stored));
        });
      } catch (e) {
        clearTimeout(timeout);
        settle(defaults);
      }
    });
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

  /**
   * CSSテキスト内のプレースホルダーを置換する（フォールバック用）
   * font-config.js の buildPlaceholderMap を単一ソースとして使用
   */
  function replaceFontPlaceholders(text) {
    if (!selectedBodyFont || !selectedMonoFont) return text;
    if (!placeholderMap) {
      placeholderMap = buildPlaceholderMap(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight, BASE_URL);
      placeholderRegex = new RegExp(PLACEHOLDER_REGEX_SOURCE, 'g');
    }
    return text.replace(placeholderRegex, match =>
      Object.prototype.hasOwnProperty.call(placeholderMap, match) ? placeholderMap[match] : match
    );
  }

  /**
   * CSS テキストを取得する（引数なし、クロージャ変数を直接参照）
   */
  function getCSSText() {
    const cacheKey = prebuiltCSSRegistered ? 'preset' : 'template';
    if (fixedCSSCache.has(cacheKey)) return fixedCSSCache.get(cacheKey);

    const promise = (async () => {
      try {
        if (prebuiltCSSRegistered) {
          const presetStyle = (document.head || document.documentElement)
            ?.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`);
          if (presetStyle) {
            return presetStyle.textContent;
          }
          fixedCSSCache.delete(cacheKey);
          return null;
        }
        // フォールバック: テンプレートCSS
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CSS_FETCH_TIMEOUT_MS);
        const response = await fetch(TEMPLATE_CSS_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          // 失敗した Promise をキャッシュに残さない（次回再試行可能にする）
          fixedCSSCache.delete(cacheKey);
          return null;
        }
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
  function getSharedStyleSheet() {
    if (sharedStyleSheetPromise) return sharedStyleSheetPromise;
    sharedStyleSheetPromise = (async () => {
      const cssText = await getCSSText();
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
  // inject.js は manifest の content_scripts で MAIN world / document_start 登録済み。
  // host 要素に data-rfs-shadow="" 属性が一時的に付くのを監視し、処理後は削除する。

  let shadowBatchPending = false;
  const handleShadowCreated = () => {
    if (shadowBatchPending) return;
    shadowBatchPending = true;
    queueMicrotask(() => {
      shadowBatchPending = false;
      const elements = document.querySelectorAll('[data-rfs-shadow]');
      for (const el of elements) {
        // 処理済みマーカーではなく即座に属性を外す（DOM 汚染回避）
        el.removeAttribute('data-rfs-shadow');
        if (el.shadowRoot) {
          injectCSS(el.shadowRoot);
        }
      }
    });
  };
  window.addEventListener('replace-font-shadow-created', handleShadowCreated);
  disposers.push(() => window.removeEventListener('replace-font-shadow-created', handleShadowCreated));

  /**
   * 指定したルート（ShadowRoot / document.head）に CSS を注入する
   */
  async function injectCSS(root) {
    if (!root) return;
    if (root._replaceFontApplied || root._replaceFontInProgress) return;
    if (!settingsReady) {
      pendingRoots.add(root);
      return;
    }

    if (root === document.head && prebuiltCSSRegistered) {
      const hasPresetCSS = checkPresetCSSInDOM();
      if (hasPresetCSS) {
        root._replaceFontApplied = true;
        setupStyleSheetMonitor();
        return;
      }
      log('[フォント置換] プリセットCSS登録済みだがDOMに未反映。フォールバック注入実行');
      prebuiltCSSRegistered = false;
    }

    root._replaceFontInProgress = true;

    try {
      if (root instanceof ShadowRoot) {
        const sheet = await getSharedStyleSheet();
        if (sheet) {
          root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
          root._replaceFontApplied = true;
          return;
        }
      }

      const cssText = await getCSSText();
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
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (!node.shadowRoot && !node.firstElementChild) continue;
          findShadowRoots(node);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    let scanAborted = false;
    let pendingIdleHandle = null;

    function scheduleChunk(fn) {
      if (window.requestIdleCallback) {
        pendingIdleHandle = window.requestIdleCallback(fn, { timeout: 100 });
      } else {
        pendingIdleHandle = setTimeout(fn, 0);
      }
    }

    function cancelPendingChunk() {
      if (pendingIdleHandle == null) return;
      if (window.cancelIdleCallback && window.requestIdleCallback) {
        try { window.cancelIdleCallback(pendingIdleHandle); } catch (e) {}
      } else {
        clearTimeout(pendingIdleHandle);
      }
      pendingIdleHandle = null;
    }

    function runInitialScan() {
      scanAborted = false;
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
      function processChunks() {
        pendingIdleHandle = null;
        if (scanAborted || !document.documentElement?.isConnected) return;
        let count = 0;
        let currentNode;
        while (count < SHADOW_SCAN_CHUNK_SIZE && (currentNode = walker.nextNode())) {
          if (currentNode.isConnected && currentNode.shadowRoot) injectCSS(currentNode.shadowRoot);
          count++;
        }
        if (count === SHADOW_SCAN_CHUNK_SIZE) scheduleChunk(processChunks);
      }
      processChunks();
    }

    const onPagehide = () => {
      scanAborted = true;
      cancelPendingChunk();
      observer.disconnect();
    };
    const onPageshow = (e) => {
      if (!e.persisted) return;
      scanAborted = false;
      observer.observe(document.documentElement, { childList: true, subtree: true });
      runInitialScan();
    };
    window.addEventListener('pagehide', onPagehide);
    window.addEventListener('pageshow', onPageshow);
    disposers.push(() => {
      scanAborted = true;
      cancelPendingChunk();
      observer.disconnect();
      window.removeEventListener('pagehide', onPagehide);
      window.removeEventListener('pageshow', onPageshow);
    });
    runInitialScan();
  }

  // ── フォント preload ──

  let preloadInjected = false;

  function createPreloadTag() {
    if (preloadInjected) return;
    const root = document.head || document.documentElement;
    if (!root) return;
    const fragment = document.createDocumentFragment();
    for (const config of fontConfig) {
      if (!config.fontUrl || !config.fontUrl.startsWith(FONT_BASE_URL)) continue;
      const preloadTag = document.createElement('link');
      preloadTag.rel = 'preload';
      preloadTag.as = 'font';
      preloadTag.type = 'font/woff2';
      preloadTag.href = config.fontUrl;
      preloadTag.crossOrigin = 'anonymous';
      fragment.appendChild(preloadTag);
    }
    try {
      root.appendChild(fragment);
      preloadInjected = true;
    } catch (e) {}
  }

  function setupFontForceLoad() {
    // サブフレームでは top frame の HTTP キャッシュが効くため重複 FontFace 生成は不要
    if (window !== window.top) return;
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

  // ── 動的フォント検出 (Next.js next/font / Perplexity pplx 等) ──
  // ビルド時に列挙した GOTHIC/MONO FAMILIES に含まれない、ハッシュ付き家族名を
  // document.fonts から検出してランタイム @font-face を注入する。

  const dynamicFontsInjected = new Set();
  let dynamicFontStyleNode = null;

  function buildDynamicRuleSet(families) {
    if (!selectedBodyFont || !selectedMonoFont) return '';
    const safeLocal = (list) => list.map(f => `local("${String(f).replace(/"/g, '')}")`).join(', ');
    const bodyRegUrl = `${FONT_BASE_URL}${getBodyWoff2(selectedBodyFont, selectedBodyFontWeight)}`;
    const bodyBoldUrl = `${FONT_BASE_URL}${selectedBodyFont.woff2Bold}`;
    const monoRegUrl = `${FONT_BASE_URL}${selectedMonoFont.woff2Regular}`;
    const monoBoldUrl = `${FONT_BASE_URL}${selectedMonoFont.woff2Bold}`;
    const bodyLocalReg = safeLocal(selectedBodyFont.localFontsRegular);
    const bodyLocalBold = safeLocal(selectedBodyFont.localFontsBold);
    const monoLocalReg = safeLocal(selectedMonoFont.localFontsRegular);
    const monoLocalBold = safeLocal(selectedMonoFont.localFontsBold);

    const rules = [];
    for (const name of families) {
      const safeName = String(name).replace(/"/g, '');
      const isMono = MONO_KEYWORD_PATTERN.test(name);
      const localReg = isMono ? monoLocalReg : bodyLocalReg;
      const localBold = isMono ? monoLocalBold : bodyLocalBold;
      const regUrl = isMono ? monoRegUrl : bodyRegUrl;
      const boldUrl = isMono ? monoBoldUrl : bodyBoldUrl;
      rules.push(
        `@font-face{font-family:"${safeName}";src:${localReg},url("${regUrl}") format("woff2");font-weight:100 599;font-display:swap}`,
        `@font-face{font-family:"${safeName}";src:${localBold},url("${boldUrl}") format("woff2");font-weight:600 900;font-display:swap}`
      );
    }
    return rules.join('');
  }

  function injectDynamicFonts(newFamilies) {
    if (!newFamilies.length) return;
    const css = buildDynamicRuleSet(newFamilies);
    if (!css) return;
    if (!dynamicFontStyleNode) {
      dynamicFontStyleNode = document.createElement('style');
      dynamicFontStyleNode.dataset[RFS_ATTR] = RFS_DYNAMIC;
      (document.head || document.documentElement).appendChild(dynamicFontStyleNode);
    }
    dynamicFontStyleNode.appendChild(document.createTextNode(css));
  }

  function scanDynamicFontFamilies() {
    if (!document.fonts || !selectedBodyFont) return;
    const added = [];
    for (const ff of document.fonts) {
      const name = (ff.family || '').replace(/['"]/g, '');
      if (!DYNAMIC_FONT_PATTERN.test(name)) continue;
      if (dynamicFontsInjected.has(name)) continue;
      dynamicFontsInjected.add(name);
      added.push(name);
    }
    if (added.length) {
      log('[フォント置換] 動的フォント検出:', added);
      injectDynamicFonts(added);
    }
  }

  function setupDynamicFontWatcher() {
    if (!document.fonts) return;
    // 初回スキャン（現在ロード済みの font から）
    scanDynamicFontFamilies();
    // document.fonts.ready 完了後に再スキャン
    try {
      document.fonts.ready.then(() => scanDynamicFontFamilies()).catch(() => {});
    } catch (e) {}
    // 後から追加される FontFace を拾う
    const onLoadingDone = () => scanDynamicFontFamilies();
    try {
      document.fonts.addEventListener('loadingdone', onLoadingDone);
      disposers.push(() => {
        try { document.fonts.removeEventListener('loadingdone', onLoadingDone); } catch (e) {}
      });
    } catch (e) {}
  }

  // ── 競合 @font-face 無効化 ──

  let styleSheetMonitorActive = false;

  function buildTargetFamiliesFromRegistry() {
    // 空のときのフォールバック: FONT_REGISTRY から name を直接構築
    const set = new Set();
    if (typeof FONT_REGISTRY === 'undefined') return set;
    const replacement = new Set();
    if (selectedBodyFont) replacement.add(selectedBodyFont.name.toLowerCase());
    if (selectedMonoFont) replacement.add(selectedMonoFont.name.toLowerCase());
    for (const key of Object.keys(FONT_REGISTRY.body || {})) {
      const name = FONT_REGISTRY.body[key].name.toLowerCase();
      if (!replacement.has(name)) set.add(name);
    }
    for (const key of Object.keys(FONT_REGISTRY.mono || {})) {
      const name = FONT_REGISTRY.mono[key].name.toLowerCase();
      if (!replacement.has(name)) set.add(name);
    }
    return set;
  }

  function setupStyleSheetMonitor() {
    if (styleSheetMonitorActive || !document.head) return;
    styleSheetMonitorActive = true;

    if (earlyHeadObserver) {
      earlyHeadObserver.disconnect();
      earlyHeadObserver = null;
    }

    // 置換対象フォントファミリーを「拡張機能のCSS」から収集
    const targetFamilies = new Set();
    try {
      const replacementNames = new Set();
      if (selectedBodyFont) replacementNames.add(selectedBodyFont.name.toLowerCase());
      if (selectedMonoFont) replacementNames.add(selectedMonoFont.name.toLowerCase());

      // 拡張機能が定義した @font-face のファミリー名を収集
      // 属性値で 'preset' か 'fallback' を指定して <style data-replace-font="dynamic"> を除外
      const extSheets = document.querySelectorAll(
        `style[${RFS_SELECTOR}="${RFS_PRESET}"], style[${RFS_SELECTOR}="${RFS_FALLBACK}"]`
      );
      for (const node of extSheets) {
        const sheet = node.sheet;
        if (!sheet) continue;
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              const family = getFontFamilyName(rule);
              if (family && !replacementNames.has(family)) {
                targetFamilies.add(family);
              }
            }
          }
        } catch (e) {}
      }
    } catch (e) {
      log('[フォント置換] 置換対象フォント一覧の構築に失敗:', e.message);
    }

    // 空の場合は FONT_REGISTRY から直接フォールバック構築（CSP で cssRules 取得失敗時の保険）
    if (targetFamilies.size === 0) {
      const fallback = buildTargetFamiliesFromRegistry();
      for (const name of fallback) targetFamilies.add(name);
    }

    if (targetFamilies.size === 0) {
      earlyStyleBuffer.length = 0;
      return;
    }

    let hasBlockedSheets = false;
    const processedSheets = new WeakSet();

    function neutralizeCompetingFontFaces(sheet) {
      if (!sheet) return true;
      if (processedSheets.has(sheet)) return true;
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
        processedSheets.add(sheet);
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

    for (const sheet of document.styleSheets) {
      if (!sheet.ownerNode?.dataset?.[RFS_ATTR]) {
        if (!neutralizeCompetingFontFaces(sheet)) {
          hasBlockedSheets = true;
        }
      }
    }

    for (const node of earlyStyleBuffer) {
      processStyleNode(node);
    }
    earlyStyleBuffer.length = 0;

    if (hasBlockedSheets) {
      const extStyle = document.querySelector(`style[${RFS_SELECTOR}]`);
      if (extStyle?.parentNode) {
        queueMicrotask(() => {
          if (extStyle.parentNode) extStyle.parentNode.appendChild(extStyle);
        });
      }
    }

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
    const onHeadPagehide = () => headObserver.disconnect();
    const onHeadPageshow = (e) => {
      if (e.persisted && document.head) {
        headObserver.observe(document.head, { childList: true });
        for (const sheet of document.styleSheets) {
          if (!sheet.ownerNode?.dataset?.[RFS_ATTR]) {
            neutralizeCompetingFontFaces(sheet);
          }
        }
      }
    };
    window.addEventListener('pagehide', onHeadPagehide);
    window.addEventListener('pageshow', onHeadPageshow);
    disposers.push(() => {
      headObserver.disconnect();
      window.removeEventListener('pagehide', onHeadPagehide);
      window.removeEventListener('pageshow', onHeadPageshow);
    });
  }

  function flushPendingRoots() {
    if (pendingRoots.size === 0) return;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) {
      // 切断済み ShadowRoot はスキップ（保持しつづけると GC 阻害）
      if (root instanceof ShadowRoot && !root.host?.isConnected) continue;
      injectCSS(root);
    }
  }

  // ── 初期化 ──
  // IIFE スコープのクロージャ変数で二重初期化を防ぐ（DOM 属性は使わない）
  let initialized = false;

  async function initialize() {
    if (initialized) return;
    initialized = true;
    log('[フォント置換] 初期化開始', location.href.substring(0, 80));

    setupShadowDOMObserver();

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
      disposers.push(() => headWatcher.disconnect());
    }

    const settings = await loadFontSettings();
    log('[フォント置換] 設定読み込み完了:', settings, 'プリセットモード:', prebuiltCSSRegistered);

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
      disposers.push(() => observer.disconnect());
    }

    flushPendingRoots();
    setupFontForceLoad();
    setupDynamicFontWatcher();

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
