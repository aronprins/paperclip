#!/usr/bin/env node

/**
 * Uses `pnpm deploy` to produce a proper flat node_modules for the server
 * (no pnpm symlinks, all nested dependencies resolved) then patches
 * @paperclipai/* workspace packages to use their publishConfig.exports
 * (pointing to dist/) instead of the dev exports (pointing to src/*.ts).
 */

import { execSync } from "node:child_process";
import { rmSync, existsSync, readdirSync, readFileSync, writeFileSync, lstatSync, symlinkSync } from "node:fs";
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
  `pnpm --filter @paperclipai/server deploy --prod --ignore-scripts "${deployDir}"`,
  { cwd: monorepoRoot, stdio: "inherit" }
);

// ── Step 2: patch @paperclipai/* package.json exports ────────────────────────
const scopeDir = path.join(deployDir, "node_modules", "@paperclipai");
if (existsSync(scopeDir)) {
  for (const pkg of readdirSync(scopeDir)) {
    const pkgDir = path.join(scopeDir, pkg);
    const pkgJsonPath = path.join(pkgDir, "package.json");
    if (!existsSync(pkgJsonPath)) continue;

    // Skip symlinked package dirs — writing through them would modify source files in the monorepo
    if (lstatSync(pkgDir).isSymbolicLink()) {
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

// ── Step 3: restore dylib soname symlinks stripped by pnpm store ─────────────
// pnpm's content-addressable store only keeps real files, not the soname
// symlinks (e.g. libzstd.1.dylib -> libzstd.1.5.7.dylib) that macOS dyld
// needs to resolve @loader_path references. Recreate them.
const embeddedPostgresScope = path.join(deployDir, "node_modules", ".pnpm");
if (existsSync(embeddedPostgresScope)) {
  for (const entry of readdirSync(embeddedPostgresScope)) {
    if (!entry.startsWith("@embedded-postgres")) continue;
    const nativeLib = path.join(embeddedPostgresScope, entry, "node_modules", "@embedded-postgres");
    if (!existsSync(nativeLib)) continue;
    for (const arch of readdirSync(nativeLib)) {
      const libDir = path.join(nativeLib, arch, "native", "lib");
      if (!existsSync(libDir)) continue;
      for (const file of readdirSync(libDir)) {
        // Match versioned dylibs: libfoo.A.B.C.dylib or libfoo.A.B.dylib
        const m = file.match(/^(lib[^.]+)\.(\d+)(\..+)?\.dylib$/);
        if (!m) continue;
        const base = m[1]; // e.g. libzstd, libicui18n
        const major = m[2]; // e.g. 1, 77

        // Create libfoo.A.dylib (soname) and libfoo.dylib (bare link)
        for (const alias of [`${base}.${major}.dylib`, `${base}.dylib`]) {
          const aliasPath = path.join(libDir, alias);
          if (!existsSync(aliasPath)) {
            symlinkSync(file, aliasPath);
            console.log(`[prepare-server] Created dylib symlink ${alias} -> ${file}`);
          }
        }
      }
    }
  }
}

console.log("[prepare-server] Done.");
