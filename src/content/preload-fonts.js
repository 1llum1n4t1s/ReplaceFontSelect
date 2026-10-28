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

  // 同じ rule のファミリー名を監視の再実行間でも再利用する。
  const _fontFamilyCache = new WeakMap();

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
  const youtubeTarget = globalThis.__replaceFontYouTubeTarget === true;
  const blobUrls = new Set();
  let youtubeCSS = null;
  let youtubeUrls = null;
  let youtubeHeadReady = false;
  let youtubeDiagnosticShown = false;
  let youtubeFailureCode = 'settings_load';
  function reportYouTubeFailure(code, afterInjection = false) {
    if (youtubeDiagnosticShown) return;
    youtubeDiagnosticShown = true;
    const message = afterInjection
      ? '[フォント置換] YouTube 用フォントが部分的に適用されました。ページを再読み込みしてください。'
      : '[フォント置換] YouTube 用フォントを準備できませんでした。元の表示を維持します。';
    console.warn(message, code);
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
  let disposed = false;
  const releaseBlobUrls = () => {
    for (const url of blobUrls) URL.revokeObjectURL(url);
    blobUrls.clear();
  };
  const runDisposers = (preserveBlobUrls = false) => {
    if (disposed) return;
    disposed = true;
    pendingRoots.clear();
    for (const dispose of disposers) {
      try { dispose(); } catch (e) {}
    }
    disposers.length = 0;
    if (!preserveBlobUrls) releaseBlobUrls();
  };
  const preserveBlobUrlsUntilPagehide = () => {
    const releaseOnPagehide = (e) => {
      if (e.persisted) return;
      window.removeEventListener('pagehide', releaseOnPagehide);
      releaseBlobUrls();
    };
    window.addEventListener('pagehide', releaseOnPagehide);
  };
  // bfcache 入場 (persisted: true) では破棄しない。content script は bfcache 復元時に
  // 再注入されないため、ここで observer と復帰用 pageshow を外すと戻る/進むの後に
  // 監視が二度と復活しない。各 observer は自前の pagehide/pageshow ペアで待避・復帰する。
  const onPagehideDispose = (e) => {
    if (e && e.persisted) return;
    runDisposers();
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
    return document.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`) !== null;
  }

  /**
   * chrome.storage.local からフォント設定を読み込む（遅延はログのみ、値は必ず storage 準拠）
   * getDefaultSettings は font-config.js 定義のグローバルを使用
   */
  function loadFontSettings() {
    const defaults = getDefaultSettings();
    const presetKey = FONT_REGISTRY.presetRegisteredKey;

    let getPromise;
    try {
      getPromise = chrome.storage.local.get([FONT_REGISTRY.storageKey, presetKey]);
    } catch (e) {
      log('[フォント置換] 設定読み込み例外:', e && e.message);
      if (youtubeTarget) return Promise.reject(e);
      return Promise.resolve(defaults);
    }

    // タイムアウトで defaults を採用すると enabled:false のユーザーにも置換が走る。
    // setupStyleSheetMonitor がサイト側 @font-face を deleteRule した後では事後撤去でも
    // 元に戻せないため、遅延はログに残すだけにして enabled の判定は必ず storage の実値で行う。
    // 遅延側に倒した場合の最悪ケースは「そのページで置換が効かない」だけで、リロードで回復する。
    const timeoutId = setTimeout(() => {
      log('[フォント置換] Settings load is slow, still waiting for storage');
    }, SETTINGS_LOAD_TIMEOUT_MS);

    return getPromise.then((result) => {
      clearTimeout(timeoutId);
      const stored = result[FONT_REGISTRY.storageKey] || {};
      prebuiltCSSRegistered = !youtubeTarget && result[presetKey] === true;
      return mergeFontSettings(stored);
    }, (e) => {
      clearTimeout(timeoutId);
      log('[フォント置換] 設定読み込み失敗:', e && e.message);
      if (youtubeTarget) throw e;
      return defaults;
    });
  }

  function buildFontConfig(bodyFontInfo, monoFontInfo, bodyFontWeight) {
    const bodyWoff2 = getBodyWoff2(bodyFontInfo, bodyFontWeight);
    return [
      { weight: 'Regular', fontFamily: bodyFontInfo.name, fontWeight: bodyFontWeight, fontUrl: youtubeUrls?.[0] || `${FONT_BASE_URL}${bodyWoff2}` },
      { weight: 'Bold', fontFamily: bodyFontInfo.name, fontWeight: 'bold', fontUrl: youtubeUrls?.[1] || `${FONT_BASE_URL}${bodyFontInfo.woff2Bold}` },
      { weight: 'MonoRegular', fontFamily: monoFontInfo.name, fontWeight: '400', fontUrl: youtubeUrls?.[2] || `${FONT_BASE_URL}${monoFontInfo.woff2Regular}` },
      { weight: 'MonoBold', fontFamily: monoFontInfo.name, fontWeight: 'bold', fontUrl: youtubeUrls?.[3] || `${FONT_BASE_URL}${monoFontInfo.woff2Bold}` }
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
    if (youtubeTarget) return Promise.resolve(youtubeCSS);
    const cacheKey = prebuiltCSSRegistered ? 'preset' : 'template';
    if (fixedCSSCache.has(cacheKey)) return fixedCSSCache.get(cacheKey);

    const promise = (async () => {
      try {
        if (prebuiltCSSRegistered) {
          const presetStyle = document.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`);
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
        log('[フォント置換] テンプレートCSS取得失敗:', e && e.message);
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
        log('[フォント置換] 共有 CSSStyleSheet 構築失敗:', e && e.message);
        sharedStyleSheetPromise = null;
        return null;
      }
    })();
    return sharedStyleSheetPromise;
  }

  // ── Shadow DOM 対応 ──
  // inject.js は有効時だけ background.js が MAIN world / document_start へ動的登録する。
  // host 要素に data-rfs-shadow="" 属性が一時的に付くのを attributeFilter 付き
  // MutationObserver で直接検知する (MutationRecord.target が host そのもの)。
  // 旧実装はイベント受信ごとに document.querySelectorAll('[data-rfs-shadow]') で
  // 全 DOM を走査していた (O(DOM要素数)/回)。属性監視なら O(新規shadow数) で済む。
  // ※ 切断状態の host への属性付与は mutation が飛ばないが、接続時に
  //   setupShadowDOMObserver (childList 監視) → findShadowRoots が回収する (従来と同じ経路)。

  const SHADOW_HOST_ATTR = 'data-rfs-shadow';
  const cleanupShadowHostMarker = (el) => {
    if (!el.hasAttribute || !el.hasAttribute(SHADOW_HOST_ATTR)) return;
    // 同じ通知を受けた別 variant の observer に先に読ませる。
    queueMicrotask(() => {
      try { el.removeAttribute(SHADOW_HOST_ATTR); } catch (_) {}
    });
  };
  const processShadowHost = (el) => {
    // 別 variant が先に属性を削除しても、mutation の対象から root を処理する。
    cleanupShadowHostMarker(el);
    if (el.shadowRoot) injectCSS(el.shadowRoot);
  };
  const shadowHostObserver = new MutationObserver((records) => {
    for (const record of records) processShadowHost(record.target);
  });
  // document を observe すれば documentElement 出現前 (document_start 直後) でも登録できる
  shadowHostObserver.observe(document, { attributes: true, attributeFilter: [SHADOW_HOST_ATTR], subtree: true });
  disposers.push(() => shadowHostObserver.disconnect());

  /**
   * 指定したルート（ShadowRoot / document.head）に CSS を注入する
   */
  async function injectCSS(root) {
    if (!root) return;
    if (disposed) return; // 無効化確定 / ページ破棄後は pendingRoots に溜めない (ShadowRoot 参照リーク防止)
    if (root._replaceFontApplied || root._replaceFontInProgress) return;
    if (youtubeTarget && root !== document.head && !youtubeHeadReady) {
      pendingRoots.add(root);
      return;
    }
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
        if (disposed) return;
        if (sheet) {
          try {
            root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
            root._replaceFontApplied = true;
            return;
          } catch (e) {
            log('[フォント置換] adoptedStyleSheets 採用失敗、style 注入へフォールバック:', e && e.message);
          }
        }
      }

      const cssText = await getCSSText();
      if (disposed) return;
      if (!cssText) {
        root._replaceFontRetryCount = (root._replaceFontRetryCount || 0) + 1;
        if (root._replaceFontRetryCount >= 3) root._replaceFontApplied = true;
        return;
      }
      const style = document.createElement('style');
      style.textContent = cssText;
      style.dataset[RFS_ATTR] = RFS_FALLBACK;
      root.appendChild(style);
      if (youtubeTarget && root === document.head && !style.sheet) {
        style.remove();
        reportYouTubeFailure('stylesheet');
        runDisposers();
        return;
      }
      root._replaceFontApplied = true;

      if (root === document.head) {
        setupStyleSheetMonitor();
      }
    } catch (e) {
      log('[フォント置換] CSS注入失敗:', e && e.message);
    } finally {
      root._replaceFontInProgress = false;
    }
  }

  function findShadowRoots(node, visited) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (visited?.has(node)) return;
    visited?.add(node);
    // 切断状態で attachShadow された host は属性 mutation が観測できないため、接続時にここで属性を回収する
    cleanupShadowHostMarker(node);
    if (node.isConnected && node.shadowRoot) injectCSS(node.shadowRoot);
    // 同じbatchで走査済みのsubtreeは、最初の処理順を保ったまま除外する。
    const filter = visited ? {
      acceptNode(element) {
        if (visited.has(element)) return NodeFilter.FILTER_REJECT;
        visited.add(element);
        return NodeFilter.FILTER_ACCEPT;
      }
    } : null;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, filter);
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      cleanupShadowHostMarker(currentNode);
      if (currentNode.isConnected && currentNode.shadowRoot) injectCSS(currentNode.shadowRoot);
    }
  }

  function setupShadowDOMObserver() {
    // (P0-2) microtask coalescing: 連続 mutation を 1 microtask に集約して findShadowRoots の重複走査を抑止。
    // 同じ tick で複数 mutations が来ても、 microtask 1 つに集めて batch 処理する。
    const pendingNodes = new Set();
    let microtaskScheduled = false;
    const flushPending = () => {
      microtaskScheduled = false;
      const nodes = Array.from(pendingNodes);
      pendingNodes.clear();
      const visited = nodes.length > 1 ? new WeakSet() : null;
      for (const node of nodes) {
        if (!node.isConnected) continue;
        findShadowRoots(node, visited);
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (!node.shadowRoot && !node.firstElementChild) continue;
          pendingNodes.add(node);
        }
      }
      if (pendingNodes.size && !microtaskScheduled) {
        microtaskScheduled = true;
        queueMicrotask(flushPending);
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
    // (P1-3) preload は top frame のみで実施。 iframe では top frame の HTTP キャッシュが効くので preload は重複コスト。
    if (window !== window.top) {
      preloadInjected = true;
      return;
    }
    const root = document.head || document.documentElement;
    if (!root) return;
    const fragment = document.createDocumentFragment();
    for (const config of fontConfig) {
      if (!config.fontUrl || !(youtubeTarget ? blobUrls.has(config.fontUrl) : config.fontUrl.startsWith(FONT_BASE_URL))) continue;
      // (P1-3) 本文 Regular の woff2 のみ preload。 Bold / Mono は font-display:swap 任せで FOUT 許容。
      // 起動クリティカルパスで preload が効くのは「最初に表示される本文文字」 で、 Bold / Mono は CSS parse 後の遅延ロードでも体感差が小さい。
      if (config.weight !== 'Regular') continue;
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
      if (!config.fontUrl || !(youtubeTarget ? blobUrls.has(config.fontUrl) : config.fontUrl.startsWith(FONT_BASE_URL))) continue;
      const fontName = config.fontFamily || config.weight;
      const fontWeight = config.fontWeight || 'normal';
      try {
        const fontFace = new FontFace(fontName, `url("${config.fontUrl}")`, { display: 'swap', weight: fontWeight });
        fontFace.load().then(loaded => {
          if (!disposed && document.fonts) document.fonts.add(loaded);
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
    const bodyRegUrl = fontConfig[0].fontUrl;
    const bodyBoldUrl = fontConfig[1].fontUrl;
    const monoRegUrl = fontConfig[2].fontUrl;
    const monoBoldUrl = fontConfig[3].fontUrl;
    const bodyLocalReg = formatLocalFontSources(selectedBodyFont.localFontsRegular);
    const bodyLocalBold = formatLocalFontSources(selectedBodyFont.localFontsBold);
    const monoLocalReg = formatLocalFontSources(selectedMonoFont.localFontsRegular);
    const monoLocalBold = formatLocalFontSources(selectedMonoFont.localFontsBold);

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

  // (P0-1) document.fonts.size キャッシュで「同じ size のままなら scan skip」 を実現。
  // 連続発火 (loadingdone を burst で受ける Next.js 系サイト等) で同じ Set を何度も舐めるコストを削減する。
  let lastScannedFontsSize = -1;

  function scanDynamicFontFamilies() {
    if (disposed || !document.fonts || !selectedBodyFont) return;
    // (P0-1) document.fonts.size が前回と同じなら短絡: 既知の family しか含まれていないので scan 不要
    const currentSize = document.fonts.size;
    if (currentSize === lastScannedFontsSize) return;
    lastScannedFontsSize = currentSize;
    const added = [];
    for (const ff of document.fonts) {
      const familyRaw = ff.family || '';
      // (P0-1) 早期 reject: 動的 family は必ず '__' で始まるので、 接頭辞チェックで正規表現テストを回避
      if (familyRaw.charCodeAt(0) !== 0x22 /* " */
        && familyRaw.charCodeAt(0) !== 0x27 /* ' */
        && familyRaw.charCodeAt(0) !== 0x5F /* _ */) continue;
      const name = familyRaw.replace(/['"]/g, '');
      if (name.charCodeAt(0) !== 0x5F || name.charCodeAt(1) !== 0x5F) continue;
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

  // (P0-1) requestIdleCallback ベースの debounce で loadingdone burst を 1 回にまとめる。
  // ride-out: idle で発火、 cap 200ms で確実に呼び出し。
  let _scanIdleHandle = null;
  let _scanUsesIdle = false;
  function scheduleScan() {
    if (disposed || _scanIdleHandle !== null) return;
    if (typeof requestIdleCallback === 'function') {
      _scanUsesIdle = true;
      _scanIdleHandle = requestIdleCallback(() => {
        _scanIdleHandle = null;
        scanDynamicFontFamilies();
      }, { timeout: 200 });
    } else {
      _scanUsesIdle = false;
      _scanIdleHandle = setTimeout(() => {
        _scanIdleHandle = null;
        scanDynamicFontFamilies();
      }, 32);
    }
  }

  function setupDynamicFontWatcher() {
    if (!document.fonts) return;
    // 初回スキャン (現在ロード済みの font から)
    scanDynamicFontFamilies();
    // document.fonts.ready 完了後に再スキャン
    try {
      document.fonts.ready.then(() => scanDynamicFontFamilies()).catch(() => {});
    } catch (e) {}
    // 後から追加される FontFace を拾う (P0-1: debounce で連続発火を 1 回にまとめる)
    const onLoadingDone = () => scheduleScan();
    try {
      document.fonts.addEventListener('loadingdone', onLoadingDone);
    } catch (e) {}
    disposers.push(() => {
      try { document.fonts.removeEventListener('loadingdone', onLoadingDone); } catch (e) {}
      if (_scanIdleHandle !== null) {
        if (_scanUsesIdle) {
          if (typeof cancelIdleCallback === 'function') cancelIdleCallback(_scanIdleHandle);
        } else {
          clearTimeout(_scanIdleHandle);
        }
        _scanIdleHandle = null;
      }
    });
  }

  // ── 競合 @font-face 無効化 ──

  let styleSheetMonitorActive = false;

  function setupStyleSheetMonitor() {
    if (styleSheetMonitorActive || !document.head) return;
    styleSheetMonitorActive = true;

    function getFontFamilyName(rule) {
      const cached = _fontFamilyCache.get(rule);
      if (cached !== undefined) return cached;
      const name = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim().toLowerCase();
      _fontFamilyCache.set(rule, name);
      return name;
    }

    // 置換先 (= 削除してはいけない) フォント名の小文字 Set を構築
    function getReplacementNameSet() {
      const set = new Set();
      if (selectedBodyFont) set.add(selectedBodyFont.name.toLowerCase());
      if (selectedMonoFont) set.add(selectedMonoFont.name.toLowerCase());
      return set;
    }

    function buildTargetFamiliesFromRegistry(replacement, targetFamilies) {
      // 空のときのフォールバック: FONT_REGISTRY から name を直接構築
      if (typeof FONT_REGISTRY === 'undefined') return;
      for (const key of Object.keys(FONT_REGISTRY.body || {})) {
        const name = FONT_REGISTRY.body[key].name.toLowerCase();
        if (!replacement.has(name)) targetFamilies.add(name);
      }
      for (const key of Object.keys(FONT_REGISTRY.mono || {})) {
        const name = FONT_REGISTRY.mono[key].name.toLowerCase();
        if (!replacement.has(name)) targetFamilies.add(name);
      }
    }

    function collectTargetFamilies(rules, replacementNames, targetFamilies) {
      if (!rules) return;
      for (const rule of rules) {
        if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
        const family = getFontFamilyName(rule);
        if (family && !replacementNames.has(family)) targetFamilies.add(family);
      }
    }

    function collectTargetFamiliesFromExtensionText(extStyles, replacementNames, targetFamilies) {
      if (typeof CSSStyleSheet !== 'function') return;
      for (const node of extStyles) {
        if (!node.textContent) continue;
        try {
          // node.sheet.cssRules が参照できない環境でも、拡張機能自身が生成した CSS 文字列は
          // Constructable Stylesheet へ再パースできる。FONT_REGISTRY の置換先名だけに
          // 退化させず、Chirp などの source alias をすべて回収する。
          const parsed = new CSSStyleSheet();
          parsed.replaceSync(node.textContent);
          collectTargetFamilies(parsed.cssRules, replacementNames, targetFamilies);
        } catch (e) {}
      }
    }

    // 置換対象フォントファミリーを「拡張機能のCSS」から収集
    const targetFamilies = new Set();
    const replacementNames = getReplacementNameSet();
    const extStyles = document.querySelectorAll(
      `style[${RFS_SELECTOR}="${RFS_PRESET}"], style[${RFS_SELECTOR}="${RFS_FALLBACK}"]`
    );
    try {

      // 拡張機能が定義した @font-face のファミリー名を収集
      // 属性値で 'preset' か 'fallback' を指定して <style data-replace-font="dynamic"> を除外
      for (const node of extStyles) {
        const sheet = node.sheet;
        if (!sheet) continue;
        try {
          collectTargetFamilies(sheet.cssRules, replacementNames, targetFamilies);
        } catch (e) {}
      }
    } catch (e) {
      log('[フォント置換] 置換対象フォント一覧の構築に失敗:', e.message);
    }

    // cssRules 参照に失敗しても、拡張機能自身の CSS テキストから source alias を再構築する。
    if (targetFamilies.size === 0) {
      collectTargetFamiliesFromExtensionText(extStyles, replacementNames, targetFamilies);
    }

    // CSS の再パースも使えない古い環境だけ FONT_REGISTRY を最終フォールバックにする。
    if (targetFamilies.size === 0) {
      buildTargetFamiliesFromRegistry(replacementNames, targetFamilies);
    }

    if (targetFamilies.size === 0) {
      return;
    }

    let styleReorderPending = false;
    const processedSheets = new WeakSet();
    const pendingStyleLoads = new WeakSet();
    const styleNodeSelector = 'style, link[rel~="stylesheet" i], link[as="style" i]';
    let styleObserver = null;

    function onStylePagehide() {
      styleObserver?.disconnect();
    }
    function onStylePageshow(e) {
      if (!disposed && e.persisted && document.documentElement) {
        styleObserver?.observe(document.documentElement, { childList: true, subtree: true });
        for (const node of document.querySelectorAll(styleNodeSelector)) {
          processStyleNode(node);
        }
        runInitialScan();
      }
    }
    // 監視の途中で例外が起きても、登録済みの listener や observer を解除できるよう先に登録する。
    disposers.push(() => {
      try { styleObserver?.disconnect(); } catch (e) {}
      try { document.removeEventListener('DOMContentLoaded', runInitialScan); } catch (e) {}
      try { window.removeEventListener('pagehide', onStylePagehide); } catch (e) {}
      try { window.removeEventListener('pageshow', onStylePageshow); } catch (e) {}
    });

    // 初回・遅延ロードのどちらでも、読めない競合 CSS には後勝ちで対応する。
    // 同じターンの失敗はまとめ、自分の style 移動は下の observer で除外する。
    function scheduleExtensionStyleReorder() {
      if (disposed || styleReorderPending) return;
      styleReorderPending = true;
      queueMicrotask(() => {
        styleReorderPending = false;
        if (disposed) return;
        let lastSiteStyle = null;
        for (const node of document.querySelectorAll(styleNodeSelector)) {
          if (!node.dataset?.[RFS_ATTR]) lastSiteStyle = node;
        }
        if (!lastSiteStyle) return;
        for (const extStyle of extStyles) {
          if (!extStyle.isConnected) continue;
          if (lastSiteStyle.compareDocumentPosition(extStyle) & Node.DOCUMENT_POSITION_PRECEDING) {
            // body 内の CSS より後ろにする場合は、サイトの部品内へ移さず
            // documentElement 直下へ置く（preset の初期注入先としても使用）。
            const parent = document.head?.contains(lastSiteStyle) ? document.head : document.documentElement;
            parent.appendChild(extStyle);
          }
        }
      });
    }

    // @layer / @media などの子規則は、それを所有するグループから削除する。
    // @import の参照先も同じ対象だが、読めないシートは既存の後勝ち対策に任せる。
    function neutralizeFontFaceRules(owner, visited = new WeakSet()) {
      if (visited.has(owner)) return true;
      visited.add(owner);
      try {
        const rules = owner.cssRules;
        if (!rules) return true;
        let readable = true;
        for (let i = rules.length - 1; i >= 0; i--) {
          const rule = rules[i];
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            if (targetFamilies.has(getFontFamilyName(rule))) {
              owner.deleteRule(i);
            }
          } else if (rule.type === CSSRule.IMPORT_RULE) {
            if (!rule.styleSheet || !neutralizeFontFaceRules(rule.styleSheet, visited)) readable = false;
          } else if (rule.cssRules && !neutralizeFontFaceRules(rule, visited)) {
            readable = false;
          }
        }
        return readable;
      } catch (e) {
        return false;
      }
    }

    function neutralizeCompetingFontFaces(sheet) {
      if (!sheet) return true;
      if (processedSheets.has(sheet)) return true;
      const readable = neutralizeFontFaceRules(sheet);
      if (readable) processedSheets.add(sheet);
      else scheduleExtensionStyleReorder();
      return readable;
    }

    function scanAdoptedStyleSheets() {
      for (const sheet of document.adoptedStyleSheets || []) {
        neutralizeCompetingFontFaces(sheet);
      }
    }

    function processStyleNode(node) {
      if (node.dataset && node.dataset[RFS_ATTR]) return false;
      if (node.sheet) neutralizeCompetingFontFaces(node.sheet);
      // style 内の @import も非同期ロードする。完了時には親シートの処理済み印を外す。
      if (!pendingStyleLoads.has(node)) {
        pendingStyleLoads.add(node);
        node.addEventListener('load', () => {
          pendingStyleLoads.delete(node);
          if (disposed) return;
          if (node.sheet) {
            processedSheets.delete(node.sheet);
            neutralizeCompetingFontFaces(node.sheet);
          }
        }, { once: true });
      }
      return true;
    }

    function processStyleSubtree(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      let foundStyle = node.matches(styleNodeSelector) && processStyleNode(node);
      for (const child of node.querySelectorAll(styleNodeSelector)) {
        foundStyle = processStyleNode(child) || foundStyle;
      }
      return foundStyle;
    }

    // monitor の起動前に追加済みの全 style/link を処理する。
    // link の sheet が未ロードなら load listener を付けるため、件数 cap は不要。
    for (const node of document.querySelectorAll(styleNodeSelector)) {
      processStyleNode(node);
    }

    // (P2-1) 初回走査は targetFamilies 構築の直後ではなく DOMContentLoaded まで遅延する 2-tier 戦略。
    // document_start 時点の `document.styleSheets` は通常空〜数枚で初回走査の体感メリットが薄い一方、 大規模サイトでは
    // ロード中シートを早期 access すると CPU を奪うため、 ready 段階に揃ってから 1 回だけ走査する方が効率的。
    // styleObserver は直後に documentElement 全体へ設置し、ready より前の後続シートも捕捉する。
    function runInitialScan() {
      if (disposed) return;
      for (const sheet of document.styleSheets) {
        if (!sheet.ownerNode?.dataset?.[RFS_ATTR]) {
          neutralizeCompetingFontFaces(sheet);
        }
      }
      scanAdoptedStyleSheets();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInitialScan, { once: true });
    } else {
      runInitialScan();
    }

    styleObserver = new MutationObserver((mutations) => {
      let foundStyle = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          foundStyle = processStyleSubtree(node) || foundStyle;
        }
      }
      // 採用だけではDOM mutationが出ないため、初回・復帰時とstyle/link追加時に確認する。
      // 通常の本文DOM更新ではシート一覧を走査しない。
      if (foundStyle) scanAdoptedStyleSheets();
    });

    styleObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('pagehide', onStylePagehide);
    window.addEventListener('pageshow', onStylePageshow);
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

  // document_start 時点でまだ存在しない DOM ノードの出現を待って callback を 1 回だけ実行する。
  // 既に存在すれば即実行して null を返し、待機した場合は MutationObserver を返す (呼び出し側で disposers 登録)。
  function whenNodeReady(getNode, observeTarget, callback) {
    if (getNode()) {
      callback();
      return null;
    }
    const observer = new MutationObserver(() => {
      if (getNode()) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(observeTarget, { childList: true });
    return observer;
  }

  // IIFE スコープのクロージャ変数で二重初期化を防ぐ（DOM 属性は使わない）
  let initialized = false;

  function requestYouTubeAssets(settings) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          type: 'replace-font-youtube-assets', bodyFont: settings.bodyFont,
          monoFont: settings.monoFont, bodyFontWeight: settings.bodyFontWeight
        }, response => {
          const error = chrome.runtime.lastError;
          if (error) reject(new Error(error.message));
          else resolve(response);
        });
      } catch (error) { reject(error); }
    });
  }

  class YouTubeProbeTimeout extends Error {}

  function probePageFontLoad(url, head) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      let finished = false;
      const finish = (error) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        link.onload = null;
        link.onerror = null;
        link.remove();
        if (error) reject(error); else resolve();
      };
      const timer = setTimeout(() => finish(new YouTubeProbeTimeout('page font preload timeout')), CSS_FETCH_TIMEOUT_MS);
      link.onload = () => finish();
      link.onerror = () => finish(new Error('page font preload failed'));
      disposers.push(() => finish(new Error('page disposed')));
      try { head.appendChild(link); } catch (error) { finish(error); }
    });
  }

  async function prepareYouTubeAssets(settings, head) {
    youtubeFailureCode = 'asset_message';
    const response = await requestYouTubeAssets(settings);
    if (disposed) return false;
    if (response?.error) {
      youtubeFailureCode = 'asset_background';
      throw new Error('asset request failed');
    }
    youtubeFailureCode = 'asset_response';
    const expected = [getBodyWoff2(selectedBodyFont, selectedBodyFontWeight), selectedBodyFont.woff2Bold,
      selectedMonoFont.woff2Regular, selectedMonoFont.woff2Bold];
    if (!response || !Array.isArray(response.names) ||
        response.names.length !== expected.length || response.names.some((name, i) => name !== expected[i]) ||
        typeof response.css !== 'string' || !response.data) throw new Error('invalid asset response');
    const byName = new Map();
    for (const name of new Set(expected)) {
      youtubeFailureCode = 'asset_response';
      const encoded = response.data[name];
      if (typeof encoded !== 'string' || encoded.length > 8 * 1024 * 1024) throw new Error('invalid font');
      youtubeFailureCode = 'asset_decode';
      let bytes = null;
      if (typeof Uint8Array.fromBase64 === 'function') {
        try { bytes = Uint8Array.fromBase64(encoded); } catch (_) {}
      }
      if (!bytes) {
        // 未対応ブラウザや復号方式の差異がある場合は従来の経路を使う。
        const binary = atob(encoded);
        if (!binary.length || binary.length > 6 * 1024 * 1024) throw new Error('invalid font size');
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      }
      if (!bytes.length || bytes.length > 6 * 1024 * 1024) throw new Error('invalid font size');
      const url = URL.createObjectURL(new Blob([bytes], { type: 'font/woff2' }));
      blobUrls.add(url);
      byName.set(name, url);
    }
    youtubeUrls = expected.map(name => byName.get(name));
    // FontFace.load はページの font-src に従う。使えない場合は CSS 注入前に止める。
    let timeout;
    youtubeFailureCode = 'font_probe';
    try {
      await Promise.race([
        Promise.all([...blobUrls].flatMap((url, i) => [
          new FontFace(`__rfs_probe_${i}`, `url("${url}")`).load(),
          probePageFontLoad(url, head)
        ])),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new YouTubeProbeTimeout('font load timeout')), CSS_FETCH_TIMEOUT_MS); })
      ]);
    } catch (error) {
      if (error instanceof YouTubeProbeTimeout) youtubeFailureCode = 'font_probe_timeout';
      throw error;
    } finally { clearTimeout(timeout); }
    if (disposed) return false;
    youtubeFailureCode = 'stylesheet';
    const marker = '__RFS_BLOB_BASE__/';
    const map = buildPlaceholderMap(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight, marker);
    let css = response.css.replace(new RegExp(PLACEHOLDER_REGEX_SOURCE, 'g'), match =>
      Object.prototype.hasOwnProperty.call(map, match) ? map[match] : match);
    for (const [name, url] of byName) css = css.split(`${marker}src/fonts/${name}`).join(url);
    if (css.includes(marker) || css.includes('__REPLACE_FONT_BASE__') || /(?:chrome|moz)-extension:\/\//.test(css)) {
      throw new Error('unresolved font URL');
    }
    youtubeCSS = css;
    return true;
  }

  async function initialize() {
    if (disposed || initialized) return;
    initialized = true;
    log('[フォント置換] 初期化開始', location.href.substring(0, 80));

    let youtubeDeadline = null;
    let onYouTubeSettingsChanged = null;
    if (youtubeTarget) {
      youtubeDeadline = setTimeout(() => {
        if (!disposed) reportYouTubeFailure('deadline');
        runDisposers();
      }, 15000);
      onYouTubeSettingsChanged = (changes, area) => {
        if (area !== 'local' || !changes[FONT_REGISTRY.storageKey]) return;
        pendingRoots.clear();
        runDisposers();
      };
      chrome.storage.onChanged.addListener(onYouTubeSettingsChanged);
      disposers.push(() => {
        clearTimeout(youtubeDeadline);
        chrome.storage.onChanged.removeListener(onYouTubeSettingsChanged);
      });
    }
    setupShadowDOMObserver();

    let settings;
    try { settings = await loadFontSettings(); } catch (_) {
      if (youtubeTarget && !disposed) reportYouTubeFailure('settings_load');
      runDisposers();
      return;
    }
    if (disposed) return;
    log('[フォント置換] 設定読み込み完了:', settings, 'プリセットモード:', prebuiltCSSRegistered);

    if (!settings.enabled) {
      pendingRoots.clear();
      // 無効時は監視自体を畳む (shadowHostObserver / shadow DOM observer)。
      // 残すと injectCSS が新規 ShadowRoot を pendingRoots に溜め続け GC を阻害する。
      runDisposers();
      return;
    }

    const registry = (typeof FONT_REGISTRY !== 'undefined') ? FONT_REGISTRY : null;
    const bodyFontInfo = registry?.body?.[settings.bodyFont] || null;
    const monoFontInfo = registry?.mono?.[settings.monoFont] || null;

    if (!bodyFontInfo || !monoFontInfo) {
      pendingRoots.clear();
      runDisposers();
      return;
    }
    selectedBodyFont = bodyFontInfo;
    selectedMonoFont = monoFontInfo;
    selectedBodyFontWeight = settings.bodyFontWeight;

    if (youtubeTarget) {
      let youtubeStyleApplied = false;
      try {
        const head = await new Promise(resolve => {
          const watcher = whenNodeReady(() => document.head, document.documentElement, () => resolve(document.head));
          if (watcher) disposers.push(() => { watcher.disconnect(); resolve(null); });
        });
        if (disposed || !head) return;
        if (!await prepareYouTubeAssets(settings, head) || disposed) return;
        youtubeFailureCode = 'settings_load';
        const latest = await loadFontSettings();
        if (disposed) return;
        if (!latest.enabled || latest.bodyFont !== settings.bodyFont ||
            latest.monoFont !== settings.monoFont || latest.bodyFontWeight !== settings.bodyFontWeight) {
          pendingRoots.clear();
          runDisposers();
          return;
        }
        prebuiltCSSRegistered = false;
        youtubeFailureCode = 'stylesheet';
        fontConfig = buildFontConfig(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight);
        settingsReady = true;
        const style = document.createElement('style');
        style.textContent = youtubeCSS;
        style.dataset[RFS_ATTR] = RFS_FALLBACK;
        head.appendChild(style);
        if (!style.sheet) {
          style.remove();
          throw new Error('style blocked');
        }
        youtubeStyleApplied = true;
        youtubeFailureCode = 'post_injection';
        head._replaceFontApplied = true;
        youtubeHeadReady = true;
        clearTimeout(youtubeDeadline);
        chrome.storage.onChanged.removeListener(onYouTubeSettingsChanged);
        setupStyleSheetMonitor();
        flushPendingRoots();
        setupFontForceLoad();
        setupDynamicFontWatcher();
        createPreloadTag();
        return;
      } catch (_) {
        if (!disposed) reportYouTubeFailure(youtubeFailureCode, youtubeStyleApplied);
        pendingRoots.clear();
        if (youtubeStyleApplied) preserveBlobUrlsUntilPagehide();
        runDisposers(youtubeStyleApplied);
        return;
      }
    }

    fontConfig = buildFontConfig(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight);
    settingsReady = true;

    const performInjections = () => {
      const head = document.head;
      if (!head || disposed) return;
      injectCSS(head);
      createPreloadTag();
    };

    const injectionWatcher = whenNodeReady(() => document.head, document.documentElement, performInjections);
    if (injectionWatcher) disposers.push(() => injectionWatcher.disconnect());

    flushPendingRoots();
    setupFontForceLoad();
    setupDynamicFontWatcher();

    log(`[フォント置換] 初期化完了: body=${selectedBodyFont.name} (weight=${selectedBodyFontWeight}), mono=${selectedMonoFont.name}, preset=${prebuiltCSSRegistered}`);
  }

  // documentElement 待機中もページ破棄時には監視を解除する。
  const initializationWatcher = whenNodeReady(() => document.documentElement, document, initialize);
  if (initializationWatcher) disposers.push(() => initializationWatcher.disconnect());
})();
