// ポップアップ初期化
document.addEventListener('DOMContentLoaded', async () => {
  // font-config.js の読み込みに失敗した場合はサイレントクラッシュさせず、
  // UIで可視化して再インストールを促す
  if (typeof FONT_REGISTRY === 'undefined') {
    document.body.innerHTML = '<div style="padding:16px;color:#c00;font:14px system-ui,sans-serif">⚠️ フォント設定ファイルの読み込みに失敗しました。拡張機能を再インストールしてください。</div>';
    return;
  }

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

  function applySettingsToUI(settings) {
    updateToggleUI(settings.enabled);
    bodyFontSelect.value = settings.bodyFont;
    bodyWeightSelect.value = settings.bodyFontWeight;
    monoFontSelect.value = settings.monoFont;
  }

  // 現在の設定を読み込んでUIに反映
  // mergeFontSettings が単一の真実の源泉として validator による白リスト検証を実行
  try {
    const result = await chrome.storage.local.get(storageKey);
    applySettingsToUI(mergeFontSettings(result[storageKey] || {}));
  } catch (e) {
    applySettingsToUI(Object.assign({}, defaults));
  }

  // 保存通知のタイマーID（連打時に前の通知を即キャンセルして更新）
  let noticeTimer = 0;

  // 直前に保存した設定（同一内容の storage.set を抑止して onChanged の無駄発火を回避）
  let _lastSaved = null;

  function saveSettings() {
    // FONT_SETTINGS_VALIDATORS で個別に妥当性を確認、不正値は defaults に戻す
    const raw = {
      enabled: enabledToggle.checked,
      bodyFont: bodyFontSelect.value,
      bodyFontWeight: bodyWeightSelect.value,
      monoFont: monoFontSelect.value
    };
    const settings = mergeFontSettings(raw);
    // UI 表示と乖離していたら反映（validator ではじかれたケース）
    applySettingsToUI(settings);

    // 差分なしなら早期リターン（onChanged 連鎖を避ける）
    if (_lastSaved &&
        _lastSaved.enabled === settings.enabled &&
        _lastSaved.bodyFont === settings.bodyFont &&
        _lastSaved.bodyFontWeight === settings.bodyFontWeight &&
        _lastSaved.monoFont === settings.monoFont) {
      return;
    }

    chrome.storage.local.set({ [storageKey]: settings }, () => {
      // 失敗時 (quota, corrupt storage 等) はユーザに明示 (自動で消さない)
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
