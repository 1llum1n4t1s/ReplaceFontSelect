(() => {
  const EXTENSION_STYLE_SELECTOR =
    'style[data-replace-font="preset"], style[data-replace-font="fallback"]';
  const FILLED_EXTENSION_STYLE_SELECTOR =
    'style[data-replace-font="preset"]:not(:empty), style[data-replace-font="fallback"]:not(:empty)';

  // 二重注入防止。グローバル名はページのスクリプトから衝突・上書き攻撃を受けにくいよう
  // ビルドごとに変わらない固定ランダム接頭辞にしている（推測を困難にするのが目的）。
  const FLAG_KEY = '__rfs_7d42f8c1_shadow_intercept__';
  if (window[FLAG_KEY]) return;
  Object.defineProperty(window, FLAG_KEY, {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });

  // closed ShadowRoot は host.shadowRoot から取得できず、ISOLATED world にも渡せない。
  // attachShadow の返り値を参照できる MAIN world 内でだけ保持し、document_start で
  // preset / fallback CSS が現れた時点で共有 Constructable Stylesheet を採用する。
  // 待機中の root 自体を保持しない。他の variant の CSS が遅れても注入可能にする。
  const pendingClosedRoots = new Set();
  const pendingClosedRootRefs = new WeakMap();
  const styledClosedRoots = new WeakSet();
  let closedRootDisposed = false;
  let closedRootStyleObserver = null;
  let closedRootSharedSheet = null;
  let closedRootSharedCSSText = null;
  let observedDocumentElement;
  let observedHead;
  const closedRootFinalizer = typeof WeakRef === 'function' && typeof FinalizationRegistry === 'function'
    ? new FinalizationRegistry(ref => {
      pendingClosedRoots.delete(ref);
      if (pendingClosedRoots.size === 0) stopClosedRootStyleObserver();
    })
    : null;

  function findExtensionStyle() {
    // 空の style が先にあっても、別 variant の準備済み CSS を利用する。
    return document.querySelector(FILLED_EXTENSION_STYLE_SELECTOR) || document.querySelector(EXTENSION_STYLE_SELECTOR);
  }

  function getClosedRootSharedSheet(cssText) {
    if (closedRootSharedSheet && closedRootSharedCSSText === cssText) {
      return closedRootSharedSheet;
    }
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      closedRootSharedSheet = sheet;
      closedRootSharedCSSText = cssText;
      return sheet;
    } catch (_) {
      closedRootSharedSheet = null;
      closedRootSharedCSSText = null;
      return null;
    }
  }

  function stopClosedRootStyleObserver() {
    if (!closedRootStyleObserver) return;
    closedRootStyleObserver.disconnect();
    closedRootStyleObserver = null;
    observedDocumentElement = undefined;
    observedHead = undefined;
  }

  function rememberPendingClosedRoot(root) {
    if (pendingClosedRootRefs.has(root)) return;
    // 対応環境では WeakRef を使い、未対応環境では従来の保持方式へ戻す。
    const ref = typeof WeakRef === 'function' ? new WeakRef(root) : { deref: () => root };
    pendingClosedRootRefs.set(root, ref);
    pendingClosedRoots.add(ref);
    if (closedRootFinalizer) closedRootFinalizer.register(root, ref, ref);
  }

  function clearPendingClosedRoots() {
    const roots = [];
    for (const ref of pendingClosedRoots) {
      if (closedRootFinalizer) closedRootFinalizer.unregister(ref);
      const root = ref.deref();
      if (root) {
        pendingClosedRootRefs.delete(root);
        roots.push(root);
      }
    }
    pendingClosedRoots.clear();
    return roots;
  }

  function observeStyleContainers() {
    const root = document.documentElement;
    const head = document.head;
    if (root === observedDocumentElement && head === observedHead) return false;
    closedRootStyleObserver.disconnect();
    closedRootStyleObserver.observe(document, { childList: true });
    if (root) closedRootStyleObserver.observe(root, { childList: true });
    if (head) closedRootStyleObserver.observe(head, { childList: true });
    observedDocumentElement = root;
    observedHead = head;
    return true;
  }

  function observeEmptyExtensionStyles() {
    if (!closedRootStyleObserver) return;
    for (const style of document.querySelectorAll(EXTENSION_STYLE_SELECTOR)) {
      if (!style.textContent) {
        closedRootStyleObserver.observe(style, { childList: true, characterData: true, subtree: true });
      }
    }
  }

  function flushPendingClosedRoots() {
    const extensionStyle = findExtensionStyle();
    if (!extensionStyle?.textContent) return false;

    stopClosedRootStyleObserver();
    const roots = clearPendingClosedRoots();
    for (const root of roots) injectClosedRootCSS(root, extensionStyle);
    return true;
  }

  function waitForExtensionStyle() {
    if (closedRootStyleObserver || pendingClosedRoots.size === 0) return;
    closedRootStyleObserver = new MutationObserver(records => {
      if (closedRootDisposed || !closedRootStyleObserver || pendingClosedRoots.size === 0) return;
      const containersChanged = observeStyleContainers();
      const styleChanged = records.some(record => {
        const target = record.target.nodeType === Node.ELEMENT_NODE
          ? record.target : record.target.parentElement;
        if (target?.matches?.(EXTENSION_STYLE_SELECTOR) && document.contains(target)) return true;
        const relevantNode = node => node.nodeType === Node.ELEMENT_NODE &&
          (node.localName === 'style' || node.localName === 'head' || node.localName === 'html');
        return Array.from(record.addedNodes).some(node => relevantNode(node) && document.contains(node)) ||
          Array.from(record.removedNodes || []).some(relevantNode);
      });
      if (!containersChanged && !styleChanged) return;
      if (!flushPendingClosedRoots()) observeEmptyExtensionStyles();
    });
    observeStyleContainers();
    if (!flushPendingClosedRoots()) observeEmptyExtensionStyles();
  }

  function injectClosedRootCSS(root, extensionStyle = null) {
    if (closedRootDisposed || styledClosedRoots.has(root)) return;
    // 既に待機監視があれば、他の root の生成ごとに document 全体を再検索しない。
    if (!extensionStyle && !closedRootStyleObserver) extensionStyle = findExtensionStyle();
    if (!extensionStyle?.textContent) {
      rememberPendingClosedRoot(root);
      waitForExtensionStyle();
      return;
    }

    const cssText = extensionStyle.textContent;
    const sheet = getClosedRootSharedSheet(cssText);
    if (sheet) {
      try {
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        styledClosedRoots.add(root);
        return;
      } catch (_) {
        // 採用不可の root では、下の <style> 注入へフォールバックする。
      }
    }

    try {
      const style = document.createElement('style');
      style.dataset.replaceFont = 'fallback';
      style.textContent = cssText;
      root.appendChild(style);
      styledClosedRoots.add(root);
    } catch (_) {
      // root 自体が破棄済み等で注入できなければ、その root だけ諦める。
    }
  }

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    closedRootDisposed = true;
    stopClosedRootStyleObserver();
    clearPendingClosedRoots();
  });

  try {
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
      const shadowRoot = originalAttachShadow.apply(this, arguments);
      if (shadowRoot && !closedRootDisposed) {
        let isClosed = false;
        try {
          // init.mode を再読すると getter の副作用を二重発火させるため、返り値を正本にする。
          isClosed = shadowRoot.mode === 'closed';
        } catch (_) {}
        if (isClosed) {
          // 呼び出し元の同期初期化（adoptedStyleSheets / innerHTML の代入）が
          // 完了してから注入し、直後の上書きで拡張 CSS が消えるのを防ぐ。
          queueMicrotask(() => {
            try { injectClosedRootCSS(shadowRoot); } catch (_) {}
          });
          return shadowRoot;
        }

        // Host element に目印を付ける（Content Script 側が検出できるように）
        // ※ CustomEvent.detail で DOM オブジェクト（ShadowRoot）を渡しても
        //   MAIN → ISOLATED World 間の構造化クローンで null になるため、
        //   data 属性で host element を特定する方式を使用
        // ※ queueMicrotask で遅延: カスタム要素のコンストラクタ内で attachShadow が
        //   呼ばれた場合、同期的な setAttribute は仕様違反でエラーになるため
        const host = this;
        queueMicrotask(() => {
          if (closedRootDisposed) return;
          try {
            // ISOLATED 側は attributeFilter 付き MutationObserver でこの属性を直接検知する
            host.setAttribute('data-rfs-shadow', '');
            // 複数 variant の observer が同じ通知を読めるよう、次の microtask で消す。
            queueMicrotask(() => {
              try { host.removeAttribute('data-rfs-shadow'); } catch (_) {}
            });
          } catch (_) {
            // SVGElement 等で setAttribute が使えない場合は無視
          }
        });
      }
      return shadowRoot;
    };
  } catch (e) {
    console.debug('[フォント置換] attachShadow override failed:', e.message);
  }
})();
