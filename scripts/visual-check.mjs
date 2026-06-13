import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const playwrightUrl = pathToFileURL(
  "C:/Users/Abhishek PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core/index.mjs",
).href;
const { chromium } = await import(playwrightUrl);
const portfolioRoot = join(import.meta.dirname, "..");
const outputDir = join(portfolioRoot, "_visual-check");
const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl =
  process.argv[2] ||
  process.env.PORTFOLIO_URL ||
  pathToFileURL(join(portfolioRoot, "index.html")).href;

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });
const consoleErrors = [];

async function inspectPage(name, viewport) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`${name}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(`${name}: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.7, 480);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(outputDir, `${name}.png`),
    fullPage: true,
  });

  const checks = await page.evaluate(() => {
    const resumeLink = document.querySelector(
      'a[href="assets/Abhishek-Chatterjee-Resume.pdf"]',
    );
    const visibleSections = [...document.querySelectorAll("main section")].filter(
      (section) => section.getBoundingClientRect().width > 0,
    );

    return {
      title: document.title,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      sectionCount: visibleSections.length,
      resumeLink: resumeLink?.getAttribute("href") || null,
      navToggleVisible:
        getComputedStyle(document.querySelector("[data-nav-toggle]")).display !==
        "none",
    };
  });

  await page.close();
  return checks;
}

const desktop = await inspectPage("desktop-1440", {
  width: 1440,
  height: 1000,
});
const mobile = await inspectPage("mobile-390", {
  width: 390,
  height: 844,
});

await browser.close();

for (const [name, result] of Object.entries({ desktop, mobile })) {
  const noOverflow = result.documentWidth <= result.viewportWidth;
  console.log(
    `${noOverflow ? "PASS" : "FAIL"} ${name} horizontal overflow: ${result.documentWidth}/${result.viewportWidth}`,
  );
  console.log(`PASS ${name} rendered ${result.sectionCount} main sections`);
}

console.log(
  `${desktop.navToggleVisible ? "FAIL" : "PASS"} desktop navigation mode`,
);
console.log(
  `${mobile.navToggleVisible ? "PASS" : "FAIL"} mobile navigation mode`,
);
console.log(
  `${consoleErrors.length === 0 ? "PASS" : "FAIL"} browser console errors: ${consoleErrors.length}`,
);

if (consoleErrors.length) {
  consoleErrors.forEach((error) => console.error(error));
}

if (
  desktop.documentWidth > desktop.viewportWidth ||
  mobile.documentWidth > mobile.viewportWidth ||
  desktop.navToggleVisible ||
  !mobile.navToggleVisible ||
  consoleErrors.length
) {
  process.exitCode = 1;
}
