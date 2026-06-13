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
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const js = await readFile(resolve(root, "script.js"), "utf8");

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
