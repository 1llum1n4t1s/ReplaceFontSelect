// ポップアップ初期化
document.addEventListener('DOMContentLoaded', async () => {
  // manifest.json からバージョン番号を取得して表示
  const manifest = chrome.runtime.getManifest();
  const versionElement = document.getElementById('version');
  if (versionElement && manifest.version) {
    versionElement.textContent = `v${manifest.version}`;
  }

  const bodyFontSelect = document.getElementById('body-font');
  const bodyWeightSelect = document.getElementById('body-weight');
  const monoFontSelect = document.getElementById('mono-font');
  const saveNotice = document.getElementById('save-notice');

  // ドロップダウンの選択肢を FONT_REGISTRY から動的生成
  for (const [key, font] of Object.entries(FONT_REGISTRY.body)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = font.displayName;
    bodyFontSelect.appendChild(option);
  }

  for (const [key, font] of Object.entries(FONT_REGISTRY.mono)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = font.displayName;
    monoFontSelect.appendChild(option);
  }

  // 現在の設定を読み込んでドロップダウンに反映
  try {
    const result = await chrome.storage.local.get(FONT_REGISTRY.storageKey);
    const settings = result[FONT_REGISTRY.storageKey] || {};
    bodyFontSelect.value = settings.bodyFont || FONT_REGISTRY.defaults.bodyFont;
    bodyWeightSelect.value = settings.bodyFontWeight || FONT_REGISTRY.defaults.bodyFontWeight;
    monoFontSelect.value = settings.monoFont || FONT_REGISTRY.defaults.monoFont;
  } catch (e) {
    bodyFontSelect.value = FONT_REGISTRY.defaults.bodyFont;
    bodyWeightSelect.value = FONT_REGISTRY.defaults.bodyFontWeight;
    monoFontSelect.value = FONT_REGISTRY.defaults.monoFont;
  }

  // 変更時に自動保存
  function saveSettings() {
    const settings = {
      bodyFont: bodyFontSelect.value,
      bodyFontWeight: bodyWeightSelect.value,
      monoFont: monoFontSelect.value
    };

    chrome.storage.local.set({ [FONT_REGISTRY.storageKey]: settings }, () => {
      // 保存通知を表示
      saveNotice.classList.add('visible');
      setTimeout(() => {
        saveNotice.classList.remove('visible');
      }, 3000);
    });
  }

  bodyFontSelect.addEventListener('change', saveSettings);
  bodyWeightSelect.addEventListener('change', saveSettings);
  monoFontSelect.addEventListener('change', saveSettings);
});
