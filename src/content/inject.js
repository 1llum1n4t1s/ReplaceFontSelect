(() => {
  const EXTENSION_STYLE_SELECTOR =
    'style[data-replace-font="preset"], style[data-replace-font="fallback"]';

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
  const pendingClosedRoots = new Set();
  const styledClosedRoots = new WeakSet();
  let closedRootStyleObserver = null;
  let closedRootSharedSheet = null;
  let closedRootSharedCSSText = null;

  function findExtensionStyle() {
    return document.querySelector(EXTENSION_STYLE_SELECTOR);
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
  }

  function flushPendingClosedRoots() {
    const extensionStyle = findExtensionStyle();
    if (!extensionStyle?.textContent) return false;

    stopClosedRootStyleObserver();
    const roots = [...pendingClosedRoots];
    pendingClosedRoots.clear();
    for (const root of roots) injectClosedRootCSS(root, extensionStyle);
    return true;
  }

  function waitForExtensionStyle() {
    if (closedRootStyleObserver || pendingClosedRoots.size === 0) return;
    closedRootStyleObserver = new MutationObserver(() => flushPendingClosedRoots());
    closedRootStyleObserver.observe(document, { childList: true, subtree: true });
  }

  function injectClosedRootCSS(root, extensionStyle = findExtensionStyle()) {
    if (styledClosedRoots.has(root)) return;
    if (!extensionStyle?.textContent) {
      pendingClosedRoots.add(root);
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
    stopClosedRootStyleObserver();
    pendingClosedRoots.clear();
  });

  try {
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
      const shadowRoot = originalAttachShadow.apply(this, arguments);
      if (shadowRoot) {
        let isClosed = false;
        try {
          // init.mode を再読すると getter の副作用を二重発火させるため、返り値を正本にする。
          isClosed = shadowRoot.mode === 'closed';
        } catch (_) {}
        if (isClosed) {
          // 補助注入の失敗をページ側の attachShadow 呼び出しへ伝播させない。
          try { injectClosedRootCSS(shadowRoot); } catch (_) {}
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
          try {
            // ISOLATED 側は attributeFilter 付き MutationObserver でこの属性を直接検知する
            host.setAttribute('data-rfs-shadow', '');
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
