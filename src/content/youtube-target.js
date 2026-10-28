// 静的・動的登録の両方から呼ばれるため、同じ world での再実行に耐える。
(() => {
  if (globalThis.__replaceFontYouTubeTarget !== undefined) return;
  const brands = navigator.userAgentData?.brands;
  const isChrome = Array.isArray(brands)
    ? brands.some(({ brand }) => brand === 'Google Chrome')
    : /(?:^|\s)Chrome\//.test(navigator.userAgent) &&
      !/(?:Edg|OPR|SamsungBrowser|Vivaldi|Firefox)\//.test(navigator.userAgent);
  globalThis.__replaceFontYouTubeTarget = isChrome &&
    (location.protocol === 'https:' || location.protocol === 'http:') &&
    (location.hostname === 'youtube.com' || location.hostname.endsWith('.youtube.com'));
})();
