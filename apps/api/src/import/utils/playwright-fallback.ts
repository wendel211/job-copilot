import { chromium } from "playwright";

export async function fetchDynamicHtml(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const content = await page.content();
  await browser.close();

  return content;
}