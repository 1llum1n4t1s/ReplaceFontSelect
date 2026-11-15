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
});
