(() => {
  // デバッグログ: 本番では no-op に差し替えて文字列生成コストを排除
  const DEBUG = false;
  const log = DEBUG ? console.debug.bind(console) : () => {};

  // ベースURL情報を取得。常に絶対パスになるようにする。
  const getExtensionBaseURL = () => {
    try {
      const url = chrome.runtime.getURL('');
      if (url && url.includes('://')) return url;
    } catch (e) {
      log('[フォント置換] runtime.getURL failed:', e.message);
    }
    // フォールバック: manifest から取得を試みる（通常は不要）
    return `chrome-extension://${chrome.runtime.id}/`;
  };

  const BASE_URL = getExtensionBaseURL();
  const FONT_BASE_URL = `${BASE_URL}fonts/`;
  const CSS_BASE_URL = `${BASE_URL}css/`;

  // 統合CSSファイルのURL
  const CSS_URL = `${CSS_BASE_URL}replacefont-extension.css`;

  // クラス名の衝突を防ぐためのユニークID
  const uniqueId = `preloadFontTag${Date.now()}`;

  // キャッシュされた固定済みCSS（Promise を格納して並行 fetch を防止）
  const fixedCSSCache = new Map();
  // 共有CSSStyleSheet（adoptedStyleSheets用、全 ShadowRoot でインスタンス共有）
  let sharedStyleSheetPromise = null;

  // 選択されたフォント情報（設定読み込み後にセットされる）
  let selectedBodyFont = null;
  let selectedMonoFont = null;
  let selectedBodyFontWeight = null; // '400' or '500'
  let fontConfig = []; // preload/force-load用の動的FONT_CONFIG
  let settingsReady = false; // 設定読み込み完了フラグ
  const pendingRoots = new Set(); // 設定読み込み前に検出された Shadow Root のキュー

  /**
   * デフォルトのフォント設定を返す
   */
  function getDefaultSettings() {
    const d = (typeof FONT_REGISTRY !== 'undefined') && FONT_REGISTRY.defaults;
    return {
      bodyFont: d ? d.bodyFont : 'noto-sans-jp',
      monoFont: d ? d.monoFont : 'udev-gothic-jpdoc',
      bodyFontWeight: d ? d.bodyFontWeight : '400'
    };
  }

  /**
   * chrome.storage.local からフォント設定を読み込む（タイムアウト付き）
   * @returns {Promise<{bodyFont: string, monoFont: string}>}
   */
  function loadFontSettings() {
    const defaults = getDefaultSettings();
    return new Promise((resolve) => {
      // タイムアウト: 3秒以内に読み込めなければデフォルト値を使用
      const timeout = setTimeout(() => {
        log('[フォント置換] Settings load timeout, using defaults');
        resolve(defaults);
      }, 3000);

      try {
        if (typeof FONT_REGISTRY === 'undefined') {
          clearTimeout(timeout);
          log('[フォント置換] FONT_REGISTRY not defined, using defaults');
          resolve(defaults);
          return;
        }
        chrome.storage.local.get(FONT_REGISTRY.storageKey, (result) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            log('[フォント置換] Storage error:', chrome.runtime.lastError.message);
            resolve(defaults);
            return;
          }
          const settings = result[FONT_REGISTRY.storageKey] || {};
          resolve({
            bodyFont: settings.bodyFont || defaults.bodyFont,
            monoFont: settings.monoFont || defaults.monoFont,
            bodyFontWeight: settings.bodyFontWeight || defaults.bodyFontWeight
          });
        });
      } catch (e) {
        clearTimeout(timeout);
        log('[フォント置換] Storage API unavailable, using defaults:', e.message);
        resolve(defaults);
      }
    });
  }

  /**
   * ウェイトに応じた本文フォントの woff2 ファイル名を返す
   */
  function getBodyWoff2(fontInfo, weight) {
    return weight === '500' ? fontInfo.woff2Medium : fontInfo.woff2Regular;
  }

  /**
   * 選択されたフォント情報を元に動的FONT_CONFIGを構築
   */
  function buildFontConfig(bodyFontInfo, monoFontInfo, bodyFontWeight) {
    const bodyWoff2 = getBodyWoff2(bodyFontInfo, bodyFontWeight);
    return [
      { weight: 'Regular', fontFamily: bodyFontInfo.name, fontWeight: bodyFontWeight, fontUrl: `${FONT_BASE_URL}${bodyWoff2}` },
      { weight: 'Bold', fontFamily: bodyFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${bodyFontInfo.woff2Bold}` },
      { weight: 'MonoRegular', fontFamily: monoFontInfo.name, fontWeight: '400', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Regular}` },
      { weight: 'MonoBold', fontFamily: monoFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Bold}` }
    ];
  }

  // 置換マップ・正規表現のキャッシュ（初回構築後は不変）
  let placeholderMap = null;
  let placeholderRegex = null;

  /**
   * CSSテキスト内のプレースホルダーを選択フォント情報に置換する
   * 単一パスの正規表現で全プレースホルダーを一括置換（12回→1回の文字列走査）
   */
  function replaceFontPlaceholders(text) {
    if (!selectedBodyFont || !selectedMonoFont) return text;

    // 置換マップを構築（初回のみ）
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
      // エスケープ済みキーから単一の正規表現を構築
      const escaped = Object.keys(placeholderMap)
        .map(k => k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'));
      placeholderRegex = new RegExp(escaped.join('|'), 'g');
    }

    return text.replace(placeholderRegex, match => placeholderMap[match]);
  }

  /**
   * CSSファイルをフェッチして、プレースホルダーを置換したものを返す
   */
  function getFixedCSS(url) {
    if (fixedCSSCache.has(url)) return fixedCSSCache.get(url);
    // Promise を即座にキャッシュして並行呼び出しの重複 fetch を防止
    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        let text = await response.text();
        text = replaceFontPlaceholders(text);
        return text;
      } catch (e) {
        fixedCSSCache.delete(url); // 失敗時はキャッシュを除去してリトライ可能に
        return null;
      }
    })();
    fixedCSSCache.set(url, promise);
    return promise;
  }

  /**
   * 共有 CSSStyleSheet を取得（adoptedStyleSheets 用）
   * 単一インスタンスを全 ShadowRoot で共有し、メモリを削減する
   */
  function getSharedStyleSheet() {
    if (sharedStyleSheetPromise) return sharedStyleSheetPromise;
    // Promise を即座にキャッシュして並行呼び出しの重複構築を防止
    sharedStyleSheetPromise = (async () => {
      const cssText = await getFixedCSS(CSS_URL);
      if (!cssText) { sharedStyleSheetPromise = null; return null; }
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cssText);
        return sheet;
      } catch (e) {
        // Constructable Stylesheets 非対応環境 → <style> タグにフォールバック
        sharedStyleSheetPromise = null;
        return null;
      }
    })();
    return sharedStyleSheetPromise;
  }

  /**
   * Shadow DOM (open/closed) 対応のためのスクリプト注入（フォールバック）
   * manifest.json の world: "MAIN" で inject.js が先に実行されるため、
   * 通常はこのフォールバックは不要。CSP等で manifest 注入が失敗した場合の保険。
   */
  function injectShadowDOMHandler() {
    try {
      const root = document.head || document.documentElement;
      if (!root) return;

      const scriptUrl = chrome.runtime.getURL('inject.js');
      // 既にスクリプトが注入されているかチェック
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

  // Shadow DOM 注入イベントの待機
  // inject.js (MAIN World) が attachShadow インターセプト時に
  // host element に data-rfs-shadow 属性を付与 → Event で通知
  // ※ CustomEvent.detail に DOM オブジェクトを渡しても MAIN → ISOLATED World 間の
  //   構造化クローンで null になるため、data 属性方式を使用
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

  /**
   * 指定したルート（ShadowRootなど）に CSS を注入する
   * ShadowRoot にはプロパティ宣言のみの軽量CSS（~3KB）、
   * document.head にはフルCSS（~85KB、@font-face リダイレクト含む）を使い分ける
   */
  async function injectCSS(root) {
    if (!root) return;

    // 既に適用済み、または注入実行中かチェック
    if (root._replaceFontApplied || root._replaceFontInProgress) return;

    // 設定が読み込まれていない場合はキューに追加して後で処理
    if (!settingsReady) {
      pendingRoots.add(root);
      return;
    }

    root._replaceFontInProgress = true;

    try {
      // ShadowRoot: adoptedStyleSheets で共有インスタンスを優先使用
      if (root instanceof ShadowRoot) {
        const sheet = await getSharedStyleSheet();
        if (sheet) {
          root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
          root._replaceFontApplied = true;
          return;
        }
      }

      // document.head または adoptedStyleSheets 非対応時: <style> タグで注入
      const cssText = await getFixedCSS(CSS_URL);
      if (!cssText) {
        root._replaceFontRetryCount = (root._replaceFontRetryCount || 0) + 1;
        if (root._replaceFontRetryCount >= 3) root._replaceFontApplied = true;
        return;
      }
      const style = document.createElement('style');
      style.textContent = cssText;
      style.dataset.replaceFont = 'true';
      root.appendChild(style);
      root._replaceFontApplied = true;
    } catch (e) {
      // エラー時はサイレントに失敗（ユーザー体験に影響しない）
    } finally {
      root._replaceFontInProgress = false;
    }
  }

  /**
   * 指定されたノードとその子孫要素から Shadow DOM を持つ要素を検索して CSS を注入
   * @param {Node} node - 走査対象のノード
   */
  function findShadowRoots(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    // 起点となるノード自体の Shadow DOM を処理
    // createTreeWalker の nextNode() は起点ノードを含まないため、ここで明示的に処理する
    if (node.isConnected && node.shadowRoot) {
      log('[フォント置換] MutationObserver経由でShadow Root検出:', node.tagName);
      injectCSS(node.shadowRoot);
    }

    // 子孫要素の Shadow DOM を走査
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode.isConnected && currentNode.shadowRoot) {
        log('[フォント置換] MutationObserver子孫走査でShadow Root検出:', currentNode.tagName);
        injectCSS(currentNode.shadowRoot);
      }
    }
  }

  /**
   * 既存の Open Shadow DOM と MutationObserver による監視
   */
  function setupShadowDOMObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            findShadowRoots(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // 既存の要素をTreeWalkerで逐次走査（querySelectorAll('*')と違い全要素リストをメモリに保持しない）
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
    const CHUNK_SIZE = 200;
    let scanAborted = false;

    function processChunks() {
      if (scanAborted) return;

      if (!document.documentElement?.isConnected) {
        scanAborted = true;
        return;
      }

      let count = 0;
      let currentNode;
      while (count < CHUNK_SIZE && (currentNode = walker.nextNode())) {
        if (currentNode.isConnected && currentNode.shadowRoot) {
          injectCSS(currentNode.shadowRoot);
        }
        count++;
      }

      if (count === CHUNK_SIZE) {
        // まだ要素がある可能性がある
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processChunks, { timeout: 100 });
        } else {
          setTimeout(processChunks, 0);
        }
      }
    }

    window.addEventListener('pagehide', () => { scanAborted = true; }, { once: true });
    processChunks();
  }

  // フォントの preload タグを生成して挿入
  function createPreloadTag() {
    const root = document.head || document.documentElement;
    if (!root) return;

    const fragment = document.createDocumentFragment();
    for (const config of fontConfig) {
      // 有効な絶対URLであることを確認
      if (!config.fontUrl || !config.fontUrl.includes('://')) continue;

      const preloadTag = document.createElement('link');
      preloadTag.rel = 'preload';
      preloadTag.as = 'font';
      preloadTag.href = config.fontUrl;
      preloadTag.crossOrigin = 'anonymous';
      preloadTag.className = `${uniqueId}_${config.weight}`;
      fragment.appendChild(preloadTag);
    }

    try {
      root.appendChild(fragment);
    } catch (e) {
      log('[フォント置換] Preload tag insertion failed:', e.message);
    }
  }

  // CSS Font Loading API でフォントを即時ロード開始
  // window.load を待たず document_start 時点で呼び出す → FOIT（Flash of Invisible Text）を最小化
  function setupFontForceLoad() {
    for (const config of fontConfig) {
      // 有効な絶対URLであることを確認
      if (!config.fontUrl || !config.fontUrl.includes('://')) continue;

      const fontName = config.fontFamily || config.weight;
      const fontWeight = config.fontWeight || 'normal';

      try {
        const fontFace = new FontFace(
          fontName,
          `url("${config.fontUrl}")`,
          { display: 'swap', weight: fontWeight }
        );
        // load() は非同期でネットワークリクエストを発行 — ブロッキングしない
        fontFace.load().then(loadedFace => {
          if (document.fonts) {
            document.fonts.add(loadedFace);
            log(`[フォント置換] フォント強制ロード成功: ${fontName} (${fontWeight})`);
          }
        }).catch((e) => {
          log('[フォント置換] Font preload failed:', fontName, fontWeight, e.message);
        });
      } catch (e) {
        log('[フォント置換] FontFace creation failed:', fontName, fontWeight, e.message);
      }
    }
  }

  /**
   * キューに溜まった Shadow Root を処理する
   */
  function flushPendingRoots() {
    if (pendingRoots.size === 0) return;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) {
      injectCSS(root);
    }
  }

  // 初期化処理
  async function initialize() {
    if (document.documentElement.dataset.replaceFontInitialized) return;
    document.documentElement.dataset.replaceFontInitialized = 'true';
    log('[フォント置換] 初期化開始', location.href.substring(0, 80));

    // inject.js を最速で注入（設定読み込みの前に Shadow DOM インターセプトを開始）
    // これにより、非同期の設定読み込み中に作成される Shadow DOM も捕捉できる
    injectShadowDOMHandler();

    // Shadow DOM 監視も早期開始（injectCSS 内でキューイングするので安全）
    setupShadowDOMObserver();

    // フォント設定を読み込む（非同期）
    const settings = await loadFontSettings();
    log('[フォント置換] 設定読み込み完了:', settings);

    // loadFontSettings() が既にデフォルト適用済みの値を返すため、二重フォールバック不要
    const registry = (typeof FONT_REGISTRY !== 'undefined') ? FONT_REGISTRY : null;
    const bodyFontInfo = registry?.body?.[settings.bodyFont] || null;
    const monoFontInfo = registry?.mono?.[settings.monoFont] || null;

    if (!bodyFontInfo || !monoFontInfo) {
      log('[フォント置換] フォント情報が取得できません。FONT_REGISTRY:', typeof FONT_REGISTRY);
      pendingRoots.clear();
      return;
    }
    selectedBodyFont = bodyFontInfo;
    selectedMonoFont = monoFontInfo;
    selectedBodyFontWeight = settings.bodyFontWeight;

    // 動的FONT_CONFIGを構築
    fontConfig = buildFontConfig(selectedBodyFont, selectedMonoFont, selectedBodyFontWeight);

    // 設定準備完了 → 以降の injectCSS はキューイングせず即実行される
    settingsReady = true;

    // メインドキュメントへの注入処理（head が利用可能になってから実行）
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

    // 設定読み込み中にキューされた Shadow Root を処理
    flushPendingRoots();
    setupFontForceLoad();

    log(`[フォント置換] 初期化完了: body=${selectedBodyFont.name} (weight=${selectedBodyFontWeight}), mono=${selectedMonoFont.name}`);
  }

  // 実行開始
  if (document.documentElement) {
    initialize();
  } else {
    // documentElementがまだない極稀なケースへの対応
    const observer = new MutationObserver(() => {
      if (document.documentElement) {
        observer.disconnect();
        initialize();
      }
    });
    observer.observe(document, { childList: true });
  }
})();
