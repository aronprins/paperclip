#!/usr/bin/env node

/**
 * Dev script: compiles TypeScript then launches Electron.
 * Usage: node scripts/dev.mjs
 */

import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronDir = path.resolve(__dirname, "..");

// 1. Compile TS
console.log("[electron-dev] Compiling TypeScript...");
execSync("npx tsc", { cwd: electronDir, stdio: "inherit" });

// 2. Launch Electron
console.log("[electron-dev] Starting Electron...");
const electronBin = path.join(electronDir, "node_modules", ".bin", "electron");
const child = spawn(electronBin, [path.join(electronDir, "dist", "main.js")], {
  cwd: electronDir,
  stdio: "inherit",
  env: { ...process.env },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
