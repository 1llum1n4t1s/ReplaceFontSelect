// ポップアップ初期化
document.addEventListener('DOMContentLoaded', async () => {
  // font-config.js の読み込みに失敗した場合はサイレントクラッシュさせず、
  // UIで可視化して再インストールを促す
  if (typeof FONT_REGISTRY === 'undefined') {
    document.body.innerHTML = '<div style="padding:16px;color:#c00;font:14px system-ui,sans-serif">⚠️ フォント設定ファイルの読み込みに失敗しました。拡張機能を再インストールしてください。</div>';
    return;
  }

  // ローカルプレビュー（拡張機能コンテキスト外）でも見た目を確認できるよう例外を握る
  let manifest = { version: 'preview' };
  try { manifest = chrome.runtime.getManifest(); } catch (_) {}
  const versionElement = document.getElementById('version');
  if (versionElement && manifest.version) {
    versionElement.textContent = `v${manifest.version}`;
  }

  // バリアント設定でタイトル・説明文を上書き
  if (typeof VARIANT !== 'undefined' && VARIANT) {
    document.body.dataset.variant = VARIANT.name || 'default';
    const titleEl = document.getElementById('popup-title');
    const subtitleEl = document.getElementById('popup-subtitle');
    const descEl = document.getElementById('popup-description');
    if (titleEl && VARIANT.popupTitle) titleEl.textContent = VARIANT.popupTitle;
    if (descEl && VARIANT.popupDescription) descEl.textContent = VARIANT.popupDescription;
    if (subtitleEl) subtitleEl.textContent = 'Font Replacement Studio';
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
  const { defaults, storageKey } = FONT_REGISTRY;

  // VARIANT.showFontSelector=false の場合は Typography UI を完全非表示。
  const variantShowsFontSelector = (typeof VARIANT === 'undefined' || !VARIANT) ? true : VARIANT.showFontSelector !== false;
  if (settingsSection) settingsSection.hidden = !variantShowsFontSelector;

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
    statusText.textContent = enabled ? '動作中' : '無効';
    settingsSection.classList.toggle('disabled', !enabled);
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
    applySettingsToUI(Object.assign({}, defaults));
  }

  let noticeTimer = 0;
  let _lastSaved = null;

  function saveSettings() {
    const raw = {
      enabled: enabledToggle.checked,
      bodyFont: bodyFontSelect.value,
      bodyFontWeight: bodyWeightSelect.value,
      monoFont: monoFontSelect.value
    };
    const settings = mergeFontSettings(raw);
    applySettingsToUI(settings);

    if (_lastSaved &&
        _lastSaved.enabled === settings.enabled &&
        _lastSaved.bodyFont === settings.bodyFont &&
        _lastSaved.bodyFontWeight === settings.bodyFontWeight &&
        _lastSaved.monoFont === settings.monoFont) {
      return;
    }

    chrome.storage.local.set({ [storageKey]: settings }, () => {
      if (chrome.runtime.lastError) {
        saveNotice.textContent = `⚠️ 保存に失敗しました: ${chrome.runtime.lastError.message}`;
        saveNotice.classList.add('visible');
        clearTimeout(noticeTimer);
        noticeTimer = 0;
        return;
      }
      _lastSaved = settings;
      saveNotice.textContent = 'ページを再読み込みすると反映されます';
      saveNotice.classList.add('visible');
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => saveNotice.classList.remove('visible'), 3000);
    });
  }

  enabledToggle.addEventListener('change', () => {
    updateToggleUI(enabledToggle.checked);
    saveSettings();
  });
  bodyFontSelect.addEventListener('change', saveSettings);
  bodyWeightSelect.addEventListener('change', saveSettings);
  monoFontSelect.addEventListener('change', saveSettings);
});
