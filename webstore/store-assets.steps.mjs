// store-assets.steps.mjs — 撮影前の操作（vitrina の steps フック）。
// ビフォーアフター用の capture（compare-*）だけを扱う。
//  - 本ページ（拡張が有効）の右カードは、拡張が実際に置換した見た目のまま撮る。
//  - 左カードは「同じ固定ページを、拡張を無効にして開き直した撮影画像」に差し替える。
//    画像の作り物ではなく、拡張オフの実描画。差し替えるのは #sample-a の中身だけで、寸法は同一。
import fs from "node:fs";
import path from "node:path";

const STORAGE_KEY = "fontSettings"; // src/content/font-config.js の FONT_REGISTRY.storageKey

/** 拡張オフの同じ固定ページを開き、#sample-a を PNG（deviceScaleFactor 付き）で返す。 */
async function captureBeforeSample({ session, cap }) {
  const worker = await session.getWorker();
  // 現在の設定を保ったまま無効化する（本ページはすでに読み込み済みで影響を受けない）
  await worker.evaluate(async (key) => {
    const current = (await chrome.storage.local.get(key))[key] ?? {};
    await chrome.storage.local.set({ [key]: { ...current, enabled: false } });
  }, STORAGE_KEY);

  const target = new URL(cap.url);
  const fixture = fs.readFileSync(path.join(session.cfg.fixturesDir, cap.fixture), "utf8");
  const page = await session.browser.newPage();
  try {
    await page.setViewport({ width: cap.width ?? 1120, height: cap.height ?? 524, deviceScaleFactor: cap.scale ?? 2 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith("chrome-extension:") || url.startsWith("blob:") || url.startsWith("about:")) return request.continue();
      const u = new URL(url);
      if (request.isNavigationRequest() && u.origin === target.origin && u.pathname === target.pathname) {
        return request.respond({ status: 200, contentType: "text/html; charset=utf-8", body: fixture });
      }
      return request.respond({ status: 404, contentType: "text/plain", body: "" });
    });
    await page.goto(cap.url, { waitUntil: "load" });
    await page.evaluate(async () => { await document.fonts.ready; });
    await new Promise((resolve) => setTimeout(resolve, 600));
    const el = await page.$("#sample-a");
    const box = await el.boundingBox();
    const png = Buffer.from(await el.screenshot({ type: "png", omitBackground: false }));
    return { png, width: Math.round(box.width), height: Math.round(box.height) };
  } finally {
    await page.close().catch(() => {});
  }
}

async function compare(ctx) {
  const { page } = ctx;
  const before = await captureBeforeSample(ctx);
  await page.evaluate(({ dataUrl, width, height }) => {
    const sample = document.querySelector("#sample-a");
    sample.innerHTML = `<img alt="" src="${dataUrl}" width="${width}" height="${height}" style="display:block">`;
  }, { dataUrl: `data:image/png;base64,${before.png.toString("base64")}`, width: before.width, height: before.height });
}

/**
 * popup の撮影前に、サポートフッター（共有部品）の文言が表示言語に追従するまで待つ。
 * フッターは自分で <html lang> から言語を決めるため、撮影専用の言語設定（storage.local だけを書き、
 * ポップアップ側の localStorage ミラーは未作成）では、初回の描画で別言語（日本語）の
 * 「お問い合わせ」等が混じることがある。日本語以外のロケールで仮名が残る間は再読み込みして
 * 描き直し、直らなければ失敗にする（日本語混入の画像を採用しない）。
 */
async function popup({ page, locale }) {
  const KANA = /[぀-ヿ]/; // ひらがな・カタカナ
  const readFooter = () => page.evaluate(() => {
    const footer = document.querySelector("kagayoi-support-footer");
    return `${footer?.shadowRoot?.textContent ?? ""}${footer?.textContent ?? ""}`;
  });
  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const text = await readFooter();
    if (locale === "ja" || !KANA.test(text)) return;
    console.warn(`[steps] popup(${locale}) のフッターに日本語が混入しています。再読み込みします（${attempt + 1}回目）`);
    await page.reload({ waitUntil: "load" });
  }
  throw new Error(`popup(${locale}) のサポートフッターが表示言語に追従しません`);
}

export default {
  popup,
  "compare-default": compare,
  "compare-notosans": compare,
};
