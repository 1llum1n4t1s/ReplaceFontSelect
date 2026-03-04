(() => {
  // デバッグログ: 本番では no-op に差し替えて文字列生成コストを排除
  const DEBUG = false;
  const log = DEBUG ? console.debug.bind(console) : () => {};

  // ベースURL情報を取得。常に絶対パスになるようにする。
  const getExtensionBaseURL = () => {
    try {
      const url = chrome.runtime.getURL('');
      if (url && url.includes('://')) return url;
    } catch (e) {}
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
  // cssUrls 削除: CSS_URL を直接使用（配列は不要）

  // キャッシュされた固定済みCSS
  const fixedCSSCache = new Map();
  // Shadow DOM用の軽量CSSキャッシュ（@font-face リダイレクトを除外）
  let shadowCSSCache = null;
  // Shadow DOM用の共有CSSStyleSheet（adoptedStyleSheets用、メモリ効率的）
  let shadowStyleSheet = null;

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
   * 選択されたフォント情報を元に動的FONT_CONFIGを構築
   */
  function buildFontConfig(bodyFontInfo, monoFontInfo, bodyFontWeight) {
    const bodyWoff2 = bodyFontWeight === '500' ? bodyFontInfo.woff2Medium : bodyFontInfo.woff2Regular;
    return [
      { weight: 'Regular', fontFamily: bodyFontInfo.name, fontWeight: bodyFontWeight, fontUrl: `${FONT_BASE_URL}${bodyWoff2}` },
      { weight: 'Bold', fontFamily: bodyFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${bodyFontInfo.woff2Bold}` },
      { weight: 'MonoRegular', fontFamily: monoFontInfo.name, fontWeight: '400', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Regular}` },
      { weight: 'MonoBold', fontFamily: monoFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Bold}` }
    ];
  }

  /**
   * CSSテキスト内のプレースホルダーを選択フォント情報に置換する
   * 単一パスの正規表現で全プレースホルダーを一括置換（12回→1回の文字列走査）
   */
  function replaceFontPlaceholders(text) {
    if (!selectedBodyFont || !selectedMonoFont) return text;

    // 置換マップを構築（初回のみ、以降はクロージャでキャッシュ）
    if (!replaceFontPlaceholders._map) {
      const bodyWoff2 = selectedBodyFontWeight === '500' ? selectedBodyFont.woff2Medium : selectedBodyFont.woff2Regular;
      replaceFontPlaceholders._map = {
        '__REPLACE_FONT_BASE__': BASE_URL,
        '../fonts/': FONT_BASE_URL,
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
      const escaped = Object.keys(replaceFontPlaceholders._map)
        .map(k => k.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'));
      replaceFontPlaceholders._regex = new RegExp(escaped.join('|'), 'g');
    }

    return text.replace(replaceFontPlaceholders._regex, match => replaceFontPlaceholders._map[match]);
  }

  // Shadow DOM 境界マーカー（generate-css.js が出力）
  const SHADOW_BOUNDARY = '/* __SHADOW_CSS_BOUNDARY__ */';

  /**
   * CSSファイルをフェッチして、プレースホルダーを置換したものを返す
   * 同時に Shadow DOM 用の軽量CSSも生成・キャッシュする
   */
  async function getFixedCSS(url) {
    if (fixedCSSCache.has(url)) return fixedCSSCache.get(url);
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      let text = await response.text();
      text = replaceFontPlaceholders(text);
      fixedCSSCache.set(url, text);

      // Shadow DOM 用: 境界マーカーより上の部分（プロパティ宣言＋置換フォント @font-face のみ）
      // 350+ 件のリダイレクト @font-face はドキュメントスコープで有効なので Shadow 内には不要
      if (!shadowCSSCache) {
        const boundaryIdx = text.indexOf(SHADOW_BOUNDARY);
        shadowCSSCache = boundaryIdx > 0 ? text.substring(0, boundaryIdx) : text;
        log(`[フォント置換] CSS分割: full=${text.length}文字, shadow=${shadowCSSCache.length}文字 (${Math.round(shadowCSSCache.length / text.length * 100)}%)`);
      }

      return text;
    } catch (e) {
      return null;
    }
  }

  /**
   * Shadow DOM 用の軽量CSSを取得
   * @font-face リダイレクトルールを除外し、プロパティ宣言のみ返す
   */
  async function getShadowCSS() {
    if (shadowCSSCache) return shadowCSSCache;
    // まだフルCSS未取得の場合はフェッチを実行（副作用で shadowCSSCache も生成される）
    await getFixedCSS(CSS_URL);
    return shadowCSSCache;
  }

  /**
   * Shadow DOM 用の共有 CSSStyleSheet を取得（adoptedStyleSheets 用）
   * 単一インスタンスを全 Shadow Root で共有し、メモリを大幅に削減する
   * （例: 572 roots × <style> 複製 → 1 インスタンス共有）
   */
  async function getShadowStyleSheet() {
    if (shadowStyleSheet) return shadowStyleSheet;
    const cssText = await getShadowCSS();
    if (!cssText) return null;
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      shadowStyleSheet = sheet;
      return sheet;
    } catch (e) {
      // Constructable Stylesheets 非対応環境 → <style> タグにフォールバック
      return null;
    }
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

    // styleタグ方式が既に存在するか念のため確認
    if (root.querySelector && root.querySelector('[data-replace-font]')) {
      root._replaceFontApplied = true;
      return;
    }

    root._replaceFontInProgress = true;
    const isShadow = root instanceof ShadowRoot;

    try {
      if (isShadow) {
        // ShadowRoot: adoptedStyleSheets で単一 CSSStyleSheet インスタンスを共有
        // → <style> タグ複製と比べ、メモリ使用量が劇的に削減される
        //   （572 roots × 3KB テキスト複製 → 1 インスタンス共有）
        const sheet = await getShadowStyleSheet();
        if (sheet) {
          root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
          root._replaceFontApplied = true;
          return;
        }
        // adoptedStyleSheets 非対応 → <style> タグにフォールバック
        const shadowCSS = await getShadowCSS();
        if (!shadowCSS) {
          root._replaceFontRetryCount = (root._replaceFontRetryCount || 0) + 1;
          if (root._replaceFontRetryCount >= 3) root._replaceFontApplied = true;
          return;
        }
        const style = document.createElement('style');
        style.textContent = shadowCSS;
        style.dataset.replaceFont = 'true';
        root.appendChild(style);
        root._replaceFontApplied = true;
      } else {
        // document.head: フルCSS（全 @font-face リダイレクト含む）
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
      }
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
      // 重複チェック
      if (document.querySelector(`link[href="${config.fontUrl}"]`)) continue;

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

    const registry = (typeof FONT_REGISTRY !== 'undefined') ? FONT_REGISTRY : null;
    const defaults = getDefaultSettings();
    const bodyFontInfo = registry?.body?.[settings.bodyFont] || registry?.body?.[defaults.bodyFont] || null;
    const monoFontInfo = registry?.mono?.[settings.monoFont] || registry?.mono?.[defaults.monoFont] || null;

    if (!bodyFontInfo || !monoFontInfo) {
      log('[フォント置換] フォント情報が取得できません。FONT_REGISTRY:', typeof FONT_REGISTRY);
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
      // head が利用可能になった時点で inject.js も再確認
      injectShadowDOMHandler();
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
