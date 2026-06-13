import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const playwrightUrl = pathToFileURL(
  "C:/Users/Abhishek PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core/index.mjs",
).href;
const { chromium } = await import(playwrightUrl);
const root = join(import.meta.dirname, "..");
const output = join(root, "_concept-previews");
const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const concepts = [
  ["signal-grid", "signal-grid.html"],
  ["editorial-ledger", "editorial-ledger.html"],
  ["systems-blueprint", "systems-blueprint.html"],
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
let failed = false;

for (const [name, file] of concepts) {
  const errors = [];
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await desktop.goto(pathToFileURL(join(root, "concepts", file)).href);
  await desktop.screenshot({ path: join(output, `${name}.png`) });
  const desktopWidth = await desktop.evaluate(
    () => document.documentElement.scrollWidth,
  );
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await mobile.goto(pathToFileURL(join(root, "concepts", file)).href);
  const mobileWidth = await mobile.evaluate(
    () => document.documentElement.scrollWidth,
  );
  await mobile.close();

  const pass = desktopWidth <= 1440 && mobileWidth <= 390 && errors.length === 0;
  failed ||= !pass;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${name}: desktop ${desktopWidth}/1440, mobile ${mobileWidth}/390, console errors ${errors.length}`,
  );
}

await browser.close();
if (failed) process.exitCode = 1;
