(() => {
  // ── 二重起動防止 ──
  if (window.__rfs_preload_loaded__) return;
  window.__rfs_preload_loaded__ = true;

  // ── デバッグログ ──
  const DEBUG = false;
  const log = DEBUG ? console.debug.bind(console) : () => {};

  // ── 定数 ──
  const RFS_ATTR = 'replaceFont';
  const RFS_SELECTOR = 'data-replace-font';
  const RFS_PRESET = 'preset';
  const RFS_DYNAMIC = 'dynamic';

  // 動的フォント検出: Next.js next/font / PostCSS modules の自動生成 family
  // 例: __Inter_abc123, __Inter_Fallback_abc123 → 必ず '__' で始まる
  const DYNAMIC_FONT_PATTERN = /^__[A-Za-z][A-Za-z0-9_]*_[a-f0-9]{4,}$/;
  const MONO_KEYWORD_PATTERN = /mono|code|menlo|consolas|courier/i;

  // フォント設定の読み込みタイムアウト
  const SETTINGS_LOAD_TIMEOUT_MS = 3000;

  // 動的フォント Set の最大サイズ (LRU、 SPA 長時間運用で leak 防止)
  const DYNAMIC_FONT_MAX = 200;
  // ext style reposition の throttle (extStyleEndObserver の振動防止)
  const EXT_REPOSITION_THROTTLE_MS = 100;

  // ── 拡張機能ベース URL ──
  const BASE_URL = (() => {
    try {
      const url = chrome.runtime.getURL('');
      if (url && url.includes('://')) return url;
    } catch (_) {}
    return `chrome-extension://${chrome.runtime.id}/`;
  })();
  const FONT_BASE_URL = `${BASE_URL}src/fonts/`;

  // ── 状態管理 ──
  let selectedBodyFont = null;
  let selectedMonoFont = null;
  let selectedBodyFontWeight = null;
  let fontConfig = [];
  let settingsReady = false;
  let prebuiltCSSRegistered = false;
  let sharedStyleSheet = null;

  // 設定読み込み前に届いた ShadowRoot を一時保管 (settingsReady 後に flush)
  const pendingRoots = new Set();

  // ── ライフサイクル管理 (pagehide で一括 dispose、 bfcache 入り時は dispose しない) ──
  const disposers = [];
  window.addEventListener('pagehide', (event) => {
    // bfcache 入り時 (event.persisted=true) は dispose せずに、 復帰時にそのまま動作継続。
    // 旧コードは無条件 dispose していたため、 bfcache 復帰時に observer 群が復元されない bug があった。
    if (event.persisted) return;
    for (const dispose of disposers) {
      try { dispose(); } catch (_) {}
    }
  });

  // ── プリセット CSS の有無確認 ──
  function checkPresetCSSInDOM() {
    const root = document.head || document.documentElement;
    if (!root) return false;
    return root.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`) !== null;
  }

  // ── 設定読み込み ──
  function loadFontSettings() {
    const defaults = Object.assign({}, FONT_REGISTRY.defaults);
    const presetKey = FONT_REGISTRY.presetRegisteredKey;
    return new Promise((resolve) => {
      let settled = false;
      const settle = (value) => { if (!settled) { settled = true; resolve(value); } };
      const timeout = setTimeout(() => settle(defaults), SETTINGS_LOAD_TIMEOUT_MS);
      try {
        chrome.storage.local.get([FONT_REGISTRY.storageKey, presetKey], (result) => {
          // (#LATE-CALLBACK) settle 後の late callback でグローバル状態を変更しないようガード
          if (settled) return;
          clearTimeout(timeout);
          if (chrome.runtime.lastError) { settle(defaults); return; }
          const stored = result[FONT_REGISTRY.storageKey] || {};
          prebuiltCSSRegistered = result[presetKey] === true;
          settle(mergeFontSettings(stored));
        });
      } catch (_) {
        clearTimeout(timeout);
        settle(defaults);
      }
    });
  }

  // ── 選択中フォントから FontFace 用 config を組み立て ──
  // mono/Bold は preload しない (font-display:swap で lazy)
  function buildFontConfig(bodyFontInfo, monoFontInfo, bodyFontWeight) {
    const bodyWoff2 = getBodyWoff2(bodyFontInfo, bodyFontWeight);
    return [
      { weight: 'Regular', fontFamily: bodyFontInfo.name, fontWeight: bodyFontWeight, fontUrl: `${FONT_BASE_URL}${bodyWoff2}`, preload: true },
      { weight: 'Bold', fontFamily: bodyFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${bodyFontInfo.woff2Bold}`, preload: false },
      { weight: 'MonoRegular', fontFamily: monoFontInfo.name, fontWeight: '400', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Regular}`, preload: false },
      { weight: 'MonoBold', fontFamily: monoFontInfo.name, fontWeight: 'bold', fontUrl: `${FONT_BASE_URL}${monoFontInfo.woff2Bold}`, preload: false }
    ];
  }

  // ── 共有 CSSStyleSheet 取得 (Path A 専用、 preset の textContent をパース) ──
  function getSharedStyleSheet() {
    if (sharedStyleSheet) return sharedStyleSheet;
    const presetStyle = (document.head || document.documentElement)
      ?.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`);
    if (!presetStyle || !presetStyle.textContent) return null;
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(presetStyle.textContent);
      sharedStyleSheet = sheet;
      return sheet;
    } catch (_) {
      return null;
    }
  }

  // ── Shadow DOM への CSS 注入 (バッチ処理化) ──
  let injectScheduled = false;
  const pendingShadowRoots = new Set();

  function injectCSS(root) {
    if (!root) return;
    if (root._replaceFontApplied) return;
    if (!settingsReady) { pendingRoots.add(root); return; }

    // document.head はプリセット JS が既に <style> を注入済み (Path A 一本化)
    if (root === document.head) {
      if (checkPresetCSSInDOM()) {
        root._replaceFontApplied = true;
        ensureExtensionStyleAtEnd();
        return;
      }
      // preset JS が走らない異常系: registerContentScripts 失敗の保険ログ
      // (SW スリープ後の race 等、 background.js の chrome.alarms による retry に委ねる)
      log('[フォント置換] プリセット未注入 (registerContentScripts 失敗の可能性)');
      return;
    }

    // ShadowRoot はバッチで一括 adopt
    if (root instanceof ShadowRoot) {
      if (!root.host?.isConnected) return;
      pendingShadowRoots.add(root);
      if (injectScheduled) return;
      injectScheduled = true;
      queueMicrotask(() => {
        injectScheduled = false;
        try {
          const sheet = getSharedStyleSheet();
          if (!sheet) return;
          for (const r of pendingShadowRoots) {
            try {
              if (r._replaceFontApplied) continue;
              if (!r.host?.isConnected) continue;
              r.adoptedStyleSheets = [...r.adoptedStyleSheets, sheet];
              r._replaceFontApplied = true;
            } catch (_) {}
          }
        } finally {
          pendingShadowRoots.clear();
        }
      });
    }
  }

  function flushPendingRoots() {
    if (pendingRoots.size === 0) return;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    for (const root of roots) {
      if (root instanceof ShadowRoot && !root.host?.isConnected) continue;
      injectCSS(root);
    }
  }

  // ── 拡張 <style> を head 末尾に維持 (cascade 後勝ち戦略) ──
  // 旧 setupStyleSheetMonitor の deleteRule 連発を廃止し、 自然な後勝ちで競合 @font-face に勝つ。
  // (#EXT-STYLE-RECURSE) 自己発火による振動防止: appendChild 前後で observer を disconnect/reconnect、
  // さらに throttle で per-frame 過剰発火を抑制する。
  let extStyleEndObserver = null;
  let lastRepositionTime = 0;
  function ensureExtensionStyleAtEnd() {
    if (extStyleEndObserver) return;
    const head = document.head;
    if (!head) return;
    const ext = head.querySelector(`style[${RFS_SELECTOR}="${RFS_PRESET}"]`);
    if (!ext) return;

    // 拡張 <style> をすぐ末尾に
    if (head.lastElementChild !== ext) head.appendChild(ext);

    // 後追い <style> / <link rel=stylesheet> が末尾に追加されたら再配置
    extStyleEndObserver = new MutationObserver((mutations) => {
      let needsReposition = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node === ext) continue;
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
            needsReposition = true;
            break;
          }
        }
        if (needsReposition) break;
      }
      if (!needsReposition) return;
      // throttle で per-frame 過剰発火を抑制
      const now = performance.now();
      if (now - lastRepositionTime < EXT_REPOSITION_THROTTLE_MS) return;
      lastRepositionTime = now;
      if (head.lastElementChild !== ext && ext.isConnected) {
        // 自己発火防止: disconnect → appendChild → re-observe
        extStyleEndObserver.disconnect();
        head.appendChild(ext);
        extStyleEndObserver.observe(head, { childList: true });
      }
    });
    extStyleEndObserver.observe(head, { childList: true });
    disposers.push(() => {
      if (extStyleEndObserver) { extStyleEndObserver.disconnect(); extStyleEndObserver = null; }
    });
  }

  // ── Shadow DOM 観測 (microtask coalescing + 軽量 addedNodes 処理) ──
  // inject.js が attachShadow をフックして data-rfs-shadow 属性 + replace-font-shadow-created
  // イベントを発火するため、 ISOLATED 側はそれの subscriber + 既存 Shadow DOM の初回 scan のみ。
  function setupShadowDOMObserver() {
    // (#MUT-DROP) 蓄積方式: drain 中に来た mutations も pendingMutations に push し、
    // 旧実装の drop バグを解消。
    let mutationBatchPending = false;
    const pendingMutations = [];
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) pendingMutations.push(m);
      if (mutationBatchPending) return;
      mutationBatchPending = true;
      queueMicrotask(() => {
        mutationBatchPending = false;
        const drained = pendingMutations.splice(0);
        for (const m of drained) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            // depth 1 のホスト要素のみチェック (子孫は inject.js が捕捉)
            if (node.shadowRoot) injectCSS(node.shadowRoot);
          }
        }
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    disposers.push(() => observer.disconnect());

    // 初回 scan: requestIdleCallback の deadline.timeRemaining を尊重しつつ、
    // 中断後は chained schedule で再開する (#IDLE-RESUME)。
    let walker = null;
    let scanFinished = false;
    function idleScan(deadline) {
      if (scanFinished) return;
      if (!walker) {
        try {
          walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
        } catch (_) {
          scanFinished = true;
          return;
        }
      }
      const hasDeadline = deadline && typeof deadline.timeRemaining === 'function';
      let count = 0;
      let node;
      while ((node = walker.nextNode())) {
        if (node.shadowRoot) injectCSS(node.shadowRoot);
        count++;
        if (hasDeadline && (count % 50) === 0 && deadline.timeRemaining() < 1) {
          // 中断 → 次の idle で続きを再開
          if (window.requestIdleCallback) {
            window.requestIdleCallback(idleScan, { timeout: 200 });
          } else {
            setTimeout(idleScan, 0);
          }
          return;
        }
      }
      scanFinished = true;
    }
    if (window.requestIdleCallback) {
      window.requestIdleCallback(idleScan, { timeout: 200 });
    } else {
      setTimeout(idleScan, 0);
    }
  }

  function setupShadowEventListener() {
    const handler = () => {
      const elements = document.querySelectorAll('[data-rfs-shadow]');
      for (const el of elements) {
        el.removeAttribute('data-rfs-shadow');
        if (el.shadowRoot) injectCSS(el.shadowRoot);
      }
    };
    window.addEventListener('replace-font-shadow-created', handler);
    disposers.push(() => window.removeEventListener('replace-font-shadow-created', handler));
  }

  // ── フォント preload (top frame + Regular のみ) ──
  let preloadInjected = false;
  function createPreloadTag() {
    if (preloadInjected) return;
    // top frame のみで preload (iframe は HTTP キャッシュ経由で再利用される)
    if (window !== window.top) return;
    const root = document.head || document.documentElement;
    if (!root) return;
    const fragment = document.createDocumentFragment();
    for (const config of fontConfig) {
      if (!config.preload) continue;
      if (!config.fontUrl?.startsWith(FONT_BASE_URL)) continue;
      const preloadTag = document.createElement('link');
      preloadTag.rel = 'preload';
      preloadTag.as = 'font';
      preloadTag.type = 'font/woff2';
      preloadTag.href = config.fontUrl;
      // chrome-extension origin では crossorigin は不要 (むしろ warning を出すブラウザあり)
      fragment.appendChild(preloadTag);
    }
    try {
      root.appendChild(fragment);
      preloadInjected = true;
    } catch (_) {}
  }

  // ── 動的フォント検出 (Next.js next/font / Perplexity pplx 等) ──
  // size キャッシュ + startsWith 早期 reject + microtask debounce で連続発火を抑制。
  // (#DYNAMIC-FONTS-GROW) LRU で蓄積を最大 DYNAMIC_FONT_MAX 件に制限。
  const dynamicFontsInjected = new Set();
  let dynamicFontStyleNode = null;
  let lastFontsSize = 0;
  let scanScheduled = false;

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
    // size 変化なし → 早期 return (debounce 後でも frequent fire を吸収)
    const size = document.fonts.size;
    if (size === lastFontsSize) return;
    lastFontsSize = size;

    const added = [];
    for (const ff of document.fonts) {
      const name = ff.family;
      // 動的 family は必ず '__' (0x5F) で始まる → ASCII 比較で 99% 早期 reject
      if (!name || name.charCodeAt(0) !== 0x5F) continue;
      if (name.charCodeAt(1) !== 0x5F) continue;
      if (!DYNAMIC_FONT_PATTERN.test(name)) continue;
      if (dynamicFontsInjected.has(name)) continue;
      // (#DYNAMIC-FONTS-GROW) LRU 上限到達時は新規追加を打ち切る
      if (dynamicFontsInjected.size >= DYNAMIC_FONT_MAX) {
        log(`[フォント置換] dynamicFontsInjected が ${DYNAMIC_FONT_MAX} 件に到達、 これ以上追加しない`);
        break;
      }
      dynamicFontsInjected.add(name);
      added.push(name);
    }
    if (added.length) {
      log('[フォント置換] 動的フォント検出:', added);
      injectDynamicFonts(added);
    }
  }

  function scheduleDynamicScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    const fn = () => { scanScheduled = false; scanDynamicFontFamilies(); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(fn, { timeout: 200 });
    } else {
      queueMicrotask(fn);
    }
  }

  function setupDynamicFontWatcher() {
    if (!document.fonts) return;
    // 初回 (ロード済み分)
    scanDynamicFontFamilies();
    // ready 後
    try {
      document.fonts.ready.then(() => scanDynamicFontFamilies()).catch(() => {});
    } catch (_) {}
    // 後発の loadingdone は debounce
    try {
      document.fonts.addEventListener('loadingdone', scheduleDynamicScan);
      disposers.push(() => {
        try { document.fonts.removeEventListener('loadingdone', scheduleDynamicScan); } catch (_) {}
      });
    } catch (_) {}
  }

  // ── 初期化 ──
  let initialized = false;
  async function initialize() {
    if (initialized) return;
    initialized = true;
    log('[フォント置換] 初期化開始', location.href.substring(0, 80));

    setupShadowDOMObserver();
    setupShadowEventListener();

    const settings = await loadFontSettings();
    log('[フォント置換] 設定読み込み完了:', settings, 'プリセットモード:', prebuiltCSSRegistered);

    if (!settings.enabled) {
      pendingRoots.clear();
      return;
    }

    const registry = (typeof FONT_REGISTRY !== 'undefined') ? FONT_REGISTRY : null;
    const bodyFontInfo = registry?.body?.[settings.bodyFont] || null;
    const monoFontInfo = registry?.mono?.[settings.monoFont] || null;
    if (!bodyFontInfo || !monoFontInfo) {
      pendingRoots.clear();
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
    setupDynamicFontWatcher();

    log(`[フォント置換] 初期化完了: body=${selectedBodyFont.name} (weight=${selectedBodyFontWeight}), mono=${selectedMonoFont.name}, preset=${prebuiltCSSRegistered}`);
  }

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
