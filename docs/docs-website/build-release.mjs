#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, "..");
const sourceIndexPath = path.join(__dirname, "index.html");
const sourceNavPath = path.join(__dirname, "nav.json");
const screenshotsSourceDir = path.join(docsRoot, "user-guides", "screenshots");

function printUsage() {
  console.log(`Usage: node docs/docs-website/build-release.mjs [options]

Options:
  --base-path <path>  Public URL base path for the uploaded docs bundle.
                      Examples: auto, /, /docs/, /docs-website/
                      Default: auto
  --out-dir <path>    Output directory for the release bundle.
                      Default: docs/docs-website/release
  --help              Show this help text.`);
}

function parseArgs(argv) {
  const options = {
    basePath: "auto",
    outDir: path.join(__dirname, "release"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") {
      printUsage();
      process.exit(0);
    }
    if (arg === "--base-path") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--base-path requires a value.");
      }
      options.basePath = normalizeBasePath(value);
      index += 1;
      continue;
    }
    if (arg === "--out-dir") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--out-dir requires a value.");
      }
      options.outDir = path.resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function normalizeBasePath(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "auto") return "auto";
  if (!trimmed || trimmed === "/") return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function isLocalDocHref(href) {
  return !/^(?:[a-z]+:)?\/\//i.test(href) && !href.startsWith("#");
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function copyFileIntoRelease(sourcePath, releaseRoot) {
  const relativeFromDocsRoot = path.relative(docsRoot, sourcePath);
  const targetPath = path.join(releaseRoot, relativeFromDocsRoot);
  await ensureDir(path.dirname(targetPath));
  await fs.copyFile(sourcePath, targetPath);
}

async function copyDirRecursive(sourceDir, targetDir) {
  await ensureDir(targetDir);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await ensureDir(path.dirname(targetPath));
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

function rewriteIndexHtml(source, basePath) {
  const appBaseBlock = `const APP_DIR_NAME = 'docs-website';
const APP_BASE_PATH = (() => {
  const marker = \`/\${APP_DIR_NAME}\`;
  const pathname = window.location.pathname;
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex === -1) return '';
  return pathname.slice(0, markerIndex + marker.length);
})();
const APP_BASE_URL = new URL(\`\${APP_BASE_PATH.replace(/\\/$/, '')}/\`, window.location.origin);
const APP_SHELL_URL = new URL('index.html', APP_BASE_URL);`;
  const rewrittenBaseBlock = `const RELEASE_BASE_PATH = ${JSON.stringify(basePath)};
let APP_BASE_PATH = "/";
let APP_BASE_URL = new URL("/", window.location.origin);
let APP_SHELL_URL = new URL("index.html", APP_BASE_URL);

function applyAppBasePath(basePath) {
  APP_BASE_PATH = !basePath || basePath === "auto" ? "/" : (basePath.endsWith("/") ? basePath : \`\${basePath}/\`);
  APP_BASE_URL = new URL(\`\${APP_BASE_PATH.replace(/\\/$/, "")}/\`, window.location.origin);
  APP_SHELL_URL = new URL("index.html", APP_BASE_URL);
}

async function detectAppBasePath() {
  if (RELEASE_BASE_PATH !== "auto") {
    applyAppBasePath(RELEASE_BASE_PATH);
    return;
  }

  const cleanPath = window.location.pathname.replace(/\\/index\\.html$/, "").replace(/\\/$/, "");
  const segments = cleanPath.split("/").filter(Boolean);
  const candidates = [];
  for (let index = segments.length; index >= 0; index -= 1) {
    const prefix = segments.slice(0, index).join("/");
    const candidate = prefix ? \`/\${prefix}/\` : "/";
    if (!candidates.includes(candidate)) candidates.push(candidate);
  }

  for (const candidate of candidates) {
    try {
      const candidateBaseUrl = new URL(\`\${candidate.replace(/\\/$/, "")}/\`, window.location.origin);
      const response = await fetch(new URL("nav.json", candidateBaseUrl), { cache: "no-store" });
      if (response.ok) {
        applyAppBasePath(candidate);
        return;
      }
    } catch {
      // Keep probing parent paths until nav.json is found.
    }
  }

  applyAppBasePath("/");
}`;

  let output = source.replace(appBaseBlock, rewrittenBaseBlock);
  if (output === source) {
    throw new Error("Could not rewrite the docs shell base-path block.");
  }
  output = output.replace(
    "async function init() {\n  try {",
    "async function init() {\n  await detectAppBasePath();\n  try {",
  );
  if (!output.includes("await detectAppBasePath();")) {
    throw new Error("Could not wire base-path detection into init().");
  }
  output = output.replace("../user-guides/screenshots/", "user-guides/screenshots/");
  output = output.replace(
    "Could not load nav.json. Check docs-website hosting and rewrite configuration.",
    "Could not load nav.json. Check that the release bundle was uploaded intact and the rewrite rules are enabled.",
  );
  return output;
}

function collectMarkdownLinks(markdown) {
  const links = [];
  const markdownLinkRegex = /\[[^\]]+\]\(([^)\s]+(?:\s+\"[^\"]*\")?)\)/g;
  const htmlImageRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

  let match;
  while ((match = markdownLinkRegex.exec(markdown)) !== null) {
    const rawTarget = match[1].trim().replace(/\s+"[^"]*"$/, "");
    links.push(rawTarget);
  }
  while ((match = htmlImageRegex.exec(markdown)) !== null) {
    links.push(match[1].trim());
  }

  return links;
}

async function collectReleaseFiles(nav) {
  const markdownFiles = new Set();
  const queue = [];
  const warnings = [];

  for (const section of nav.sections) {
    for (const page of section.pages) {
      const absolutePath = path.resolve(__dirname, page.file);
      queue.push(absolutePath);
    }
  }

  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (markdownFiles.has(currentPath)) continue;

    if (!(await pathExists(currentPath))) {
      warnings.push(`Missing markdown file: ${path.relative(process.cwd(), currentPath)}`);
      continue;
    }

    markdownFiles.add(currentPath);
    const markdown = await fs.readFile(currentPath, "utf8");
    const baseDir = path.dirname(currentPath);

    for (const rawHref of collectMarkdownLinks(markdown)) {
      const [href] = rawHref.split("#", 1);
      if (!href || !isLocalDocHref(href)) continue;

      const resolvedPath = path.resolve(baseDir, href);
      if (!resolvedPath.startsWith(docsRoot)) continue;

      if (href.endsWith(".md")) {
        if (await pathExists(resolvedPath)) {
          queue.push(resolvedPath);
        } else {
          warnings.push(`Missing linked markdown file: ${path.relative(process.cwd(), resolvedPath)}`);
        }
      }
    }
  }

  return { markdownFiles, warnings };
}

function rewriteNav(nav) {
  return {
    ...nav,
    sections: nav.sections.map((section) => ({
      ...section,
      pages: section.pages.map((page) => {
        const absolutePath = path.resolve(__dirname, page.file);
        const relativeFromDocsRoot = toPosixPath(path.relative(docsRoot, absolutePath));
        return {
          ...page,
          file: relativeFromDocsRoot,
        };
      }),
    })),
  };
}

function buildHtaccess(basePath) {
  const rewriteBaseLine = basePath === "auto" ? "" : `RewriteBase ${basePath}\n\n`;
  return `RewriteEngine On
${rewriteBaseLine}RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteRule ^ index.html [L]
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceNav = JSON.parse(await fs.readFile(sourceNavPath, "utf8"));
  const releaseNav = rewriteNav(sourceNav);
  const { markdownFiles, warnings } = await collectReleaseFiles(sourceNav);

  await fs.rm(options.outDir, { recursive: true, force: true });
  await ensureDir(options.outDir);

  const sourceIndex = await fs.readFile(sourceIndexPath, "utf8");
  const releaseIndex = rewriteIndexHtml(sourceIndex, options.basePath);
  await fs.writeFile(path.join(options.outDir, "index.html"), releaseIndex);
  await fs.writeFile(path.join(options.outDir, "nav.json"), `${JSON.stringify(releaseNav, null, 2)}\n`);
  await fs.writeFile(path.join(options.outDir, ".htaccess"), buildHtaccess(options.basePath));

  const sortedMarkdownFiles = [...markdownFiles].sort((left, right) => left.localeCompare(right));
  for (const markdownPath of sortedMarkdownFiles) {
    await copyFileIntoRelease(markdownPath, options.outDir);
  }

  if (await pathExists(screenshotsSourceDir)) {
    const screenshotTargetDir = path.join(options.outDir, "user-guides", "screenshots");
    await copyDirRecursive(screenshotsSourceDir, screenshotTargetDir);
  }

  const missingNavTargets = [];
  for (const section of releaseNav.sections) {
    for (const page of section.pages) {
      const targetPath = path.join(options.outDir, page.file);
      if (!(await pathExists(targetPath))) {
        missingNavTargets.push(page.file);
      }
    }
  }

  if (missingNavTargets.length > 0) {
    throw new Error(`Release build is incomplete. Missing nav targets: ${missingNavTargets.join(", ")}`);
  }

  console.log(`Release bundle written to ${path.relative(process.cwd(), options.outDir)}`);
  console.log(`Base path: ${options.basePath}`);
  console.log(`Copied ${sortedMarkdownFiles.length} markdown files.`);
  if (await pathExists(screenshotsSourceDir)) {
    console.log("Copied screenshot assets.");
  }
  if (warnings.length > 0) {
    console.warn(`Completed with ${warnings.length} warning(s):`);
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
