#!/usr/bin/env node

/**
 * Uses `pnpm deploy` to produce a proper flat node_modules for the server
 * (no pnpm symlinks, all nested dependencies resolved) then patches
 * @paperclipai/* workspace packages to use their publishConfig.exports
 * (pointing to dist/) instead of the dev exports (pointing to src/*.ts).
 */

import { execSync } from "node:child_process";
import { rmSync, existsSync, readdirSync, readFileSync, writeFileSync, lstatSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronDir = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(electronDir, "..");

const deployDir = path.join(electronDir, "build", "server-deploy");

// ── Step 1: pnpm deploy ───────────────────────────────────────────────────────
console.log("[prepare-server] Running pnpm deploy for @paperclipai/server...");

if (existsSync(deployDir)) {
  rmSync(deployDir, { recursive: true, force: true });
}

execSync(
  `pnpm --filter @paperclipai/server deploy --prod "${deployDir}"`,
  { cwd: monorepoRoot, stdio: "inherit" }
);

// ── Step 2: patch @paperclipai/* package.json exports ────────────────────────
const scopeDir = path.join(deployDir, "node_modules", "@paperclipai");
if (existsSync(scopeDir)) {
  for (const pkg of readdirSync(scopeDir)) {
    const pkgJsonPath = path.join(scopeDir, pkg, "package.json");
    if (!existsSync(pkgJsonPath)) continue;

    // Skip symlinks — writing through them would modify source files in the monorepo
    if (lstatSync(pkgJsonPath).isSymbolicLink()) {
      console.log(`[prepare-server] Skipping symlinked @paperclipai/${pkg}`);
      continue;
    }

    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    if (pkgJson.publishConfig?.exports) {
      pkgJson.exports = pkgJson.publishConfig.exports;
      writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
      console.log(`[prepare-server] Patched exports for @paperclipai/${pkg}`);
    }
  }
}

console.log("[prepare-server] Done.");
