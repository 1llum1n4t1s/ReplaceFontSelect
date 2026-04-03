// ポップアップ初期化
document.addEventListener('DOMContentLoaded', async () => {
  const manifest = chrome.runtime.getManifest();
  const versionElement = document.getElementById('version');
  if (versionElement && manifest.version) {
    versionElement.textContent = `v${manifest.version}`;
  }

  const enabledToggle = document.getElementById('enabled-toggle');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const settingsSection = document.querySelector('.settings-section');
  const bodyFontSelect = document.getElementById('body-font');
  const bodyWeightSelect = document.getElementById('body-weight');
  const monoFontSelect = document.getElementById('mono-font');
  const saveNotice = document.getElementById('save-notice');
  const { defaults, storageKey } = FONT_REGISTRY;

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

  // デフォルト値を適用するヘルパー
  function applyDefaults() {
    updateToggleUI(defaults.enabled);
    bodyFontSelect.value = defaults.bodyFont;
    bodyWeightSelect.value = defaults.bodyFontWeight;
    monoFontSelect.value = defaults.monoFont;
  }

  // 現在の設定を読み込んでUIに反映
  try {
    const result = await chrome.storage.local.get(storageKey);
    const settings = result[storageKey] || {};
    // 空文字・undefined はデフォルトにフォールバック（background.js, preload-fonts.js と同一ポリシー）
    const v = (val, def) => (val !== undefined && val !== '') ? val : def;
    updateToggleUI(v(settings.enabled, defaults.enabled));
    bodyFontSelect.value = v(settings.bodyFont, defaults.bodyFont);
    bodyWeightSelect.value = v(settings.bodyFontWeight, defaults.bodyFontWeight);
    monoFontSelect.value = v(settings.monoFont, defaults.monoFont);
  } catch (e) {
    applyDefaults();
  }

  // 保存通知のタイマーID（連打時に前の通知を即キャンセルして更新）
  let noticeTimer = 0;

  function saveSettings() {
    // バリデーション: FONT_REGISTRY に存在しない値の保存を防止
    if (!(bodyFontSelect.value in FONT_REGISTRY.body)) bodyFontSelect.value = defaults.bodyFont;
    if (!(monoFontSelect.value in FONT_REGISTRY.mono)) monoFontSelect.value = defaults.monoFont;

    const settings = {
      enabled: enabledToggle.checked,
      bodyFont: bodyFontSelect.value,
      bodyFontWeight: bodyWeightSelect.value,
      monoFont: monoFontSelect.value
    };

    chrome.storage.local.set({ [storageKey]: settings }, () => {
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
