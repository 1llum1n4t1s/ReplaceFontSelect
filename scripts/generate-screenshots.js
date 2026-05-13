// Chrome Web Store用のスクリーンショット画像を自動生成するスクリプト
// バリアントごとの HTML テンプレートから対応する PNG を出力する。
// 使い方: node scripts/generate-screenshots.js <variant>
//   例:   node scripts/generate-screenshots.js default
//         node scripts/generate-screenshots.js notosans

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const variantName = process.argv[2];
if (!variantName) {
  console.error('使い方: node scripts/generate-screenshots.js <variant>');
  process.exit(1);
}
if (!/^[a-z][a-z0-9_-]*$/.test(variantName)) {
  console.error(`❌ バリアント名は [a-z][a-z0-9_-]* の形式: "${variantName}"`);
  process.exit(1);
}

// 入力テンプレート: webstore/screenshots/<variant>/*.html
// 出力 PNG:        webstore/images/<variant>/*.png
const INPUT_DIR = `webstore/screenshots/${variantName}`;
const OUTPUT_DIR = `webstore/images/${variantName}`;

// 生成する画像の各設定項目（入力パス、出力名、サイズ、タイプ）
const IMAGE_CONFIGS = [
  // スクリーンショット：1280x800
  {
    input: `${INPUT_DIR}/01-popup-ui.html`,
    output: '01-popup-ui-1280x800.png',
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: `${INPUT_DIR}/02-before-after.html`,
    output: '02-before-after-1280x800.png',
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: `${INPUT_DIR}/03-hero-promo.html`,
    output: '03-hero-promo-1280x800.png',
    width: 1280,
    height: 800,
    type: 'screenshot'
  },

  // プロモーション タイル（小）：440x280
  {
    input: `${INPUT_DIR}/04-promo-small.html`,
    output: 'promo-small-440x280.png',
    width: 440,
    height: 280,
    type: 'promo-small'
  },

  // マーキー プロモーション タイル：1400x560
  {
    input: `${INPUT_DIR}/05-promo-marquee.html`,
    output: 'promo-marquee-1400x560.png',
    width: 1400,
    height: 560,
    type: 'promo-marquee'
  }
];

/**
 * 共有ブラウザインスタンスを使用してHTMLファイルから画像を生成
 * @param {import('puppeteer').Browser} browser - 共有ブラウザインスタンス
 * @param {string} htmlPath - HTMLファイルのパス
 * @param {string} outputPath - 出力画像のパス
 * @param {number} width - 画像の幅
 * @param {number} height - 画像の高さ
 */
async function generateScreenshot(browser, htmlPath, outputPath, width, height) {
  const page = await browser.newPage();

  try {
    // ビューポートを設定
    // deviceScaleFactorを1に設定することで、指定したwidth/height通りのピクセルサイズで出力します
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: 1
    });

    // HTMLファイルの絶対パスを取得してブラウザで読み込み
    const absolutePath = path.resolve(htmlPath);
    await page.goto(`file://${absolutePath}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // フォントの読み込みやレンダリングの完了を待機するためのウェイト
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 指定した範囲（clip）でスクリーンショットを撮影して保存
    await page.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    });

    console.log(`✅ 生成完了: ${outputPath} (${width}x${height})`);
  } catch (error) {
    console.error(`❌ エラー: ${htmlPath} -> ${outputPath}`);
    console.error(error);
  } finally {
    await page.close();
  }
}

/**
 * メイン処理：出力ディレクトリの準備と各画像の並列生成
 */
async function main() {
  console.log(`🎨 Chrome Web Store用スクリーンショットを生成中 (variant=${variantName})...\n`);

  // 入力ディレクトリの存在確認
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ 入力ディレクトリが見つかりません: ${INPUT_DIR}`);
    console.error(`   variants/${variantName}.json があるなら ${INPUT_DIR}/ にスクショ HTML を配置してください。`);
    process.exit(1);
  }

  // 出力ディレクトリが存在しない場合は再帰的に作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 出力ディレクトリを作成: ${OUTPUT_DIR}\n`);
  }

  // ブラウザを1回だけ起動して全画像で共有
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 120000
  });

  try {
    // 全画像を順次生成（並列だとタイムアウトしやすいため）
    for (const config of IMAGE_CONFIGS) {
      const inputPath = config.input;
      const outputPath = path.join(OUTPUT_DIR, config.output);

      // HTMLファイルの存在確認（存在しない場合はスキップ）
      if (!fs.existsSync(inputPath)) {
        console.error(`❌ HTMLファイルが見つかりません: ${inputPath}`);
        continue;
      }

      await generateScreenshot(browser, inputPath, outputPath, config.width, config.height);
    }
  } finally {
    await browser.close();
  }

  console.log('\n✨ すべての画像生成が完了しました！');
  console.log(`\n📂 生成された画像は ${OUTPUT_DIR} ディレクトリにあります。`);
  console.log('\n📋 生成された画像一覧:');
  
  // 生成されたファイルのサイズを確認して表示
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(file => {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });

  console.log('\n📝 Chrome Web Storeアップロード仕様:');
  console.log('   ✓ スクリーンショット: 1280x800 または 640x400');
  console.log('   ✓ プロモーション タイル（小）: 440x280');
  console.log('   ✓ マーキー プロモーション タイル: 1400x560');
  console.log('   ✓ 形式: PNG (24ビット、アルファなし)');
}

// スクリプトの実行（エラーハンドリング付き）
main().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
