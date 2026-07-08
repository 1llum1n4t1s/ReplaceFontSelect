// バリアントごとのアイコン PNG を icons/<variant>/icon.svg から生成する。
// 使い方: node scripts/generate-icons.js <variant>
//   例:   node scripts/generate-icons.js default
//         node scripts/generate-icons.js notosans

// puppeteer v25+ は ESM-only のため CommonJS からは動的 import で読み込む (generateIcons 内)
const fs = require('fs');
const path = require('path');

const variantName = process.argv[2];
if (!variantName) {
  console.error('使い方: node scripts/generate-icons.js <variant>');
  process.exit(1);
}
if (!/^[a-z][a-z0-9_-]*$/.test(variantName)) {
  console.error(`❌ バリアント名は [a-z][a-z0-9_-]* の形式: "${variantName}"`);
  process.exit(1);
}

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons', variantName);
const svgPath = path.join(iconsDir, 'icon.svg');
const fontPath = path.join(__dirname, '../src/fonts/NotoSansJP-Bold.woff2');

// font-family を NotoSansJP に統一 (data URI で埋め込む名前と一致させる)
function normalizeSvgFontFamily(svgText) {
  return svgText.replace(
    /font-family="[^"]*"/g,
    'font-family="NotoSansJP-Bold"'
  );
}

function buildHtml(svgText, fontBase64, size) {
  // sharp の librsvg はシステムフォントを解決できず Unicode コードポイント (U+3042 => "3042")
  // を描画してしまうため、puppeteer (headless Chrome) + @font-face data URI で確実に
  // グリフを解決する。
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: 'NotoSansJP-Bold';
    font-weight: 700;
    font-style: normal;
    src: url(data:font/woff2;base64,${fontBase64}) format('woff2');
  }
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; width: ${size}px; height: ${size}px; }
</style>
</head>
<body>${svgText}</body></html>`;
}

async function generateIcons() {
  console.log(`🎨 アイコン生成を開始します (variant=${variantName}, puppeteer + 埋め込み font)...\n`);

  if (!fs.existsSync(svgPath)) {
    console.error(`❌ エラー: ${path.relative(path.join(__dirname, '..'), svgPath)} が見つかりません`);
    process.exit(1);
  }
  if (!fs.existsSync(fontPath)) {
    console.error('❌ エラー: src/fonts/NotoSansJP-Bold.woff2 が見つかりません');
    process.exit(1);
  }
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const rawSvg = fs.readFileSync(svgPath, 'utf8');
  const svgText = normalizeSvgFontFamily(rawSvg);
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');

  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      const page = await browser.newPage();
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      const html = buildHtml(svgText, fontBase64, size);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      // @font-face 埋め込みフォントの load 完了を待機
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: true,
        clip: { x: 0, y: 0, width: size, height: size }
      });
      await page.close();
      console.log(`✅ ${size}x${size} アイコンを生成しました: ${path.basename(outputPath)}`);
    }
  } finally {
    await browser.close();
  }

  console.log('\n🎉 アイコン生成が完了しました！');
}

generateIcons().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
