// <html lang> を同期で表示言語へ合わせる（module script のサポートフッターより先に実行する）
Localizer.applyDocumentLang();

// ポップアップ初期化
document.addEventListener('DOMContentLoaded', async () => {
  // 保存済みの UI 言語を待ち、更新後に辞書が古ければ作り直してから文言を置換する
  await Localizer.ready;
  await Localizer.ensureFresh();
  Localizer.localizeDocument();
  // 言語切替（保存は storage.local。変更後は再読み込みで反映）
  Localizer.mountLanguageSelect(document.getElementById('uiLanguage'));

  // font-config.js の読み込みに失敗した場合はサイレントクラッシュさせず、
  // UIで可視化して再インストールを促す
  if (typeof FONT_REGISTRY === 'undefined') {
    // 文言は textContent で入れる（innerHTML へ翻訳文を渡さない）
    document.body.textContent = '';
    const errorBox = document.createElement('div');
    errorBox.style.cssText = 'padding:16px;color:#c00;font:14px system-ui,sans-serif';
    errorBox.textContent = Localizer.t('popupConfigLoadError', undefined, '⚠️ Failed to load the font settings file. Please reinstall the extension.');
    document.body.appendChild(errorBox);
    return;
  }

  // ローカルプレビュー（拡張機能コンテキスト外）でも見た目を確認できるよう例外を握る
  let manifest = { version: 'preview' };
  try { manifest = chrome.runtime.getManifest(); } catch (_) {}
  const versionElement = document.getElementById('version');
  if (versionElement && manifest.version) {
    versionElement.textContent = `v${manifest.version}`;
  }

  // バリアント設定で見た目（data-variant）を切り替える。
  // タイトル・説明文は _locales の popupTitle / popupDescription（variant ごとに生成）を data-i18n で表示する。
  if (typeof VARIANT !== 'undefined' && VARIANT) {
    document.body.dataset.variant = VARIANT.name || 'default';
  } else {
    document.body.dataset.variant = 'default';
  }

  const enabledToggle = document.getElementById('enabled-toggle');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const settingsSection = document.getElementById('settings-section');
  const bodyFontSelect = document.getElementById('body-font');
  const bodyWeightSelect = document.getElementById('body-weight');
  const monoFontSelect = document.getElementById('mono-font');
  const saveNotice = document.getElementById('save-notice');
  const { storageKey } = FONT_REGISTRY;

  // VARIANT.showFontSelector=false の場合は Typography UI を完全非表示。
  const variantShowsFontSelector = (typeof VARIANT === 'undefined' || !VARIANT) ? true : VARIANT.showFontSelector !== false;
  if (settingsSection) {
    settingsSection.hidden = !variantShowsFontSelector;
    // 保存通知は、フォント設定を非表示にする固定版でも表示する。
    if (!variantShowsFontSelector && saveNotice) settingsSection.after(saveNotice);
  }

  // ドロップダウンの選択肢を FONT_REGISTRY から動的生成
  function populateSelect(selectEl, registry) {
    for (const [key, font] of Object.entries(registry)) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = font.name;
      selectEl.appendChild(option);
    }
  }
  populateSelect(bodyFontSelect, FONT_REGISTRY.body);
  populateSelect(monoFontSelect, FONT_REGISTRY.mono);

  function updateToggleUI(enabled) {
    enabledToggle.checked = enabled;
    statusDot.className = enabled ? 'dot active' : 'dot inactive';
    statusText.textContent = Localizer.t(enabled ? 'statusActive' : 'statusInactive', undefined, enabled ? 'Active' : 'Disabled');
    settingsSection.classList.toggle('disabled', !enabled);
    bodyFontSelect.disabled = !enabled;
    bodyWeightSelect.disabled = !enabled;
    monoFontSelect.disabled = !enabled;
  }

  function applySettingsToUI(settings) {
    updateToggleUI(settings.enabled);
    bodyFontSelect.value = settings.bodyFont;
    bodyWeightSelect.value = settings.bodyFontWeight;
    monoFontSelect.value = settings.monoFont;
  }

  // 現在の設定を読み込んでUIに反映
  try {
    const result = await chrome.storage.local.get(storageKey);
    applySettingsToUI(mergeFontSettings(result[storageKey] || {}));
  } catch (e) {
    applySettingsToUI(getDefaultSettings());
  }

  let noticeTimer = 0;
  let _lastSaved = null;

  async function saveSettings() {
    const raw = {
      enabled: enabledToggle.checked,
      bodyFont: bodyFontSelect.value,
      bodyFontWeight: bodyWeightSelect.value,
      monoFont: monoFontSelect.value
    };
    const settings = mergeFontSettings(raw);
    applySettingsToUI(settings);

    // 保存スキーマの正本 (FONT_REGISTRY.defaults) のキーで比較し、設定項目の追加時に比較漏れを起こさない。
    if (_lastSaved && Object.keys(FONT_REGISTRY.defaults).every(key => _lastSaved[key] === settings[key])) {
      return;
    }

    try {
      await chrome.storage.local.set({ [storageKey]: settings });
      _lastSaved = settings;
      saveNotice.textContent = Localizer.t('popupSaveNotice', undefined, 'Reload the page to apply the changes.');
      saveNotice.classList.add('visible');
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => saveNotice.classList.remove('visible'), 3000);
    } catch (e) {
      saveNotice.textContent = Localizer.t('popupSaveFailed', [e.message], `⚠️ Failed to save: ${e.message}`);
      saveNotice.classList.add('visible');
      clearTimeout(noticeTimer);
      noticeTimer = 0;
    }
  }

  enabledToggle.addEventListener('change', saveSettings);
  bodyFontSelect.addEventListener('change', saveSettings);
  bodyWeightSelect.addEventListener('change', saveSettings);
  monoFontSelect.addEventListener('change', saveSettings);

  setupTabs();
  await setupSiteExclusions(FONT_REGISTRY.siteExclusionsKey);
});

// ---- タブ（設定 / 除外リスト） ----
function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const ink = document.querySelector('.tab-ink');
  const moveInk = (tab) => {
    if (!ink || !tab) return;
    ink.style.left = `${tab.offsetLeft}px`;
    ink.style.width = `${tab.offsetWidth}px`;
  };
  const switchTab = (name, focus = false) => {
    for (const tab of tabs) {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        moveInk(tab);
        if (focus) tab.focus();
      }
    }
    for (const pane of document.querySelectorAll('.pane')) {
      const active = pane.dataset.pane === name;
      pane.classList.toggle('is-active', active);
      pane.hidden = !active;
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    // WAI-ARIA タブパターン: 左右・Home/End で移動して即時に切り替える
    tab.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      switchTab(tabs[next].dataset.tab, true);
    });
  });
  // Web フォントの読込で幅が変わってもインクの位置を合わせる
  moveInk(document.querySelector('.tab.is-active'));
  (async () => {
    try {
      await document.fonts?.ready;
      moveInk(document.querySelector('.tab.is-active'));
    } catch (_) {}
  })();
}

// ---- 置換除外リスト ----
// 入力は 450ms の debounce と blur で自動保存する。保存は「前回保存値との差分」を
// 最新の保存値へ適用し、他経路で同時に書かれた規則を巻き戻さない。
async function setupSiteExclusions(storageKey) {
  const input = document.getElementById('site-exclusions');
  const addButton = document.getElementById('exclusions-add-current');
  const saveState = document.getElementById('exclusions-save-state');
  if (!input || !addButton || !saveState || typeof SiteExclusions === 'undefined') return;
  const t = (key, fallback) => Localizer.t(key, undefined, fallback);

  let baseline = [];
  let saveTimer = null;
  let pendingSave = Promise.resolve(true);

  async function readStored() {
    const result = await chrome.storage.local.get(storageKey);
    return SiteExclusions.normalize(result[storageKey]);
  }

  try {
    baseline = await readStored();
  } catch (_) {
    baseline = [];
  }
  input.value = baseline.join('\n');

  async function doSave() {
    const submittedText = input.value;
    const submitted = SiteExclusions.normalize(submittedText);
    const before = new Set(baseline);
    const after = new Set(submitted);
    const add = submitted.filter(rule => !before.has(rule));
    const remove = new Set(baseline.filter(rule => !after.has(rule)));
    try {
      const latest = await readStored();
      const next = SiteExclusions.normalize([...latest.filter(rule => !remove.has(rule)), ...add]);
      await chrome.storage.local.set({ [storageKey]: next });
      baseline = next;
      // blur 後だけ正規化済みの表示へ揃える。入力中はカーソル位置を動かさない。
      if (document.activeElement !== input && input.value === submittedText) input.value = next.join('\n');
      saveState.textContent = t('exclusionsSaved', 'Saved');
      return true;
    } catch (e) {
      saveState.textContent = Localizer.t('popupSaveFailed', [e && e.message], `⚠️ Failed to save: ${e && e.message}`);
      return false;
    }
  }

  function save() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    // 保存を直列化し、前の保存の完了後に最新の入力で保存する
    pendingSave = (async (previous) => {
      await previous;
      return doSave();
    })(pendingSave);
    return pendingSave;
  }

  input.addEventListener('input', () => {
    saveState.textContent = t('exclusionsSaving', 'Saving…');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 450);
  });
  // 未保存のまま popup が閉じられた場合（debounce 中、または blur で始めた保存が読み直し待ちの間）:
  // 非同期の読み直しは完了しないため、入力値をその場で書く。
  window.addEventListener('pagehide', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const current = SiteExclusions.normalize(input.value);
    if (current.join('\n') === baseline.join('\n')) return;
    try { chrome.storage.local.set({ [storageKey]: current }); } catch (_) {}
  });
  input.addEventListener('blur', () => {
    // 未変更のまま focus を外しただけなら保存しない
    if (saveTimer || SiteExclusions.normalize(input.value).join('\n') !== baseline.join('\n')) save();
  });

  addButton.addEventListener('click', async () => {
    addButton.disabled = true;
    try {
      // textarea の debounce 保存が残っていれば先に確定し、その結果へ追記する。
      await save();
      let tab;
      try {
        [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      } catch (_) {
        tab = null;
      }
      const site = SiteExclusions.sitePattern(tab && tab.url);
      if (!site) {
        saveState.textContent = t('exclusionsCurrentSiteUnavailable', 'This page cannot be added');
        return;
      }
      const current = SiteExclusions.normalize(input.value);
      if (!current.includes(site)) {
        input.value = SiteExclusions.normalize([...current, site]).join('\n');
        if (!await save()) return;
      }
      saveState.textContent = t('exclusionsCurrentSiteAdded', 'Current site added');
    } finally {
      addButton.disabled = false;
    }
  });
}
