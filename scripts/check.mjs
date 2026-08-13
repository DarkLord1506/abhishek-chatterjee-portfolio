import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/favicon.svg",
  "assets/Abhishek-Chatterjee-Resume.pdf",
  "legacy.html",
  "legacy-styles.css",
  "legacy-script.js",
  "sitemap.xml",
  "vercel.json",
  "robots.txt",
  "site.webmanifest",
  "404.html",
  "assets/og-card.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/apple-touch-icon.png",
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const js = await readFile(resolve(root, "script.js"), "utf8");
const vercel = await readFile(resolve(root, "vercel.json"), "utf8");
const robots = await readFile(resolve(root, "robots.txt"), "utf8");
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");

const checks = [
  [html.includes("<title>Abhishek Chatterjee"), "HTML title is present"],
  [html.includes('id="contact"'), "Contact section is present"],
  [html.includes("Abhishek-Chatterjee-Resume.pdf"), "Resume link is present"],
  [html.includes("linkedin.com/in/abhishek-chatterjee-8b37b9206"), "LinkedIn link is present"],
  [html.includes("github.com/DarkLord1506"), "GitHub link is present"],
  [html.includes('id="projects"'), "Personal projects section is present"],
  [html.includes("application/ld+json"), "Structured data is present"],
  [css.includes("@media (prefers-reduced-motion: reduce)"), "Reduced-motion styles are present"],
  [js.includes("IntersectionObserver"), "Progressive reveal behavior is present"],
  [html.includes('property="og:image"'), "Open Graph image is declared"],
  [html.includes('name="twitter:card" content="summary_large_image"'), "Large Twitter card is set"],
  [html.includes('rel="canonical"'), "Canonical URL is present"],
  [html.includes('rel="apple-touch-icon"'), "Apple touch icon is linked"],
  [!html.includes("<500 us"), "Microsecond symbol is used, not an ASCII fallback"],
  [css.includes(":focus-visible"), "Visible keyboard focus styles are present"],
  [!css.includes("#c8462d"), "Accent red meets WCAG AA contrast (old value removed)"],
  [vercel.includes("Content-Security-Policy"), "CSP header is configured"],
  [vercel.includes("Strict-Transport-Security"), "HSTS header is configured"],
  [vercel.includes("X-Frame-Options"), "Clickjacking protection is configured"],
  [robots.includes("Sitemap:"), "robots.txt advertises the sitemap"],
  [sitemap.includes("<lastmod>"), "Sitemap declares lastmod"],
];

const failed = checks.filter(([passed]) => !passed);

for (const [passed, label] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length) {
  process.exitCode = 1;
} else {
  console.log(`PASS ${requiredFiles.length} required files are accessible`);
}
