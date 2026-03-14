# Electron App - Agent Guide

Reference for building, packaging, and debugging the Paperclip desktop app. Read this before making changes.

**IMPORTANT: This is a living document. If you discover a new gotcha, fix a packaging bug, add a workaround, or learn something non-obvious about the electron build, UPDATE THIS FILE with your findings before finishing your task. Add new entries under the appropriate section (or create a new one). Include the symptom, cause, and fix so future sessions don't have to rediscover it.**

---

## Architecture Overview

The electron app is a thin shell that:
1. Shows a splash screen with boot progress
2. Spawns the Paperclip server as a child process
3. Loads the server's UI at `http://localhost:3100` in a BrowserWindow

**Dev mode** (`pnpm electron:dev`): Runs `pnpm dev:once` at the monorepo root, which starts the server with Vite dev middleware (`PAPERCLIP_UI_DEV_MIDDLEWARE=true`). UI is served live from source via Vite HMR.

**Packaged mode** (`pnpm electron:pack` / `electron:dist:mac`): Bundles pre-built `server/dist`, `ui/dist`, and a flat `node_modules` into the `.app` as `extraResources`. The server runs via `node server/dist/index.js` and serves the UI statically from `ui-dist/`.

### Key files
- `src/main.ts` - Electron main process (splash, server lifecycle, window)
- `scripts/prepare-server.mjs` - Produces flat node_modules for packaging
- `scripts/dev.mjs` - Compiles TS and launches Electron in dev mode
- `electron-builder.yml` - Packaging config (extraResources, platform targets)

---

## Build Commands

| Command | From | What it does |
|---|---|---|
| `pnpm electron:dev` | root | Dev mode with Vite HMR |
| `pnpm electron:pack` | root | `pnpm build` (all packages) + pack unpacked app to `electron/release/mac/` |
| `pnpm electron:dist:mac` | root | Full distributable (`.dmg` + `.zip`) |
| `pnpm --filter @paperclipai/electron run pack` | anywhere | Pack only (skips root `pnpm build` - use when packages are already built) |

**Always run from root** for `electron:pack` / `electron:dist:*` - the root scripts run `pnpm build` first to compile all packages. Running `pnpm pack` directly from `electron/` only runs `tsc` for the electron package itself and will use stale `ui/dist` and `server/dist`.

---

## Known Gotchas & Fixes

### 1. UI changes not showing in packaged app
**Symptom:** Source code has changes but the packaged app shows old UI.
**Cause:** `ui/dist` was stale (built from a different branch or before changes were made). The `pnpm build` at root may have failed silently (e.g. TypeScript errors) leaving old `ui/dist` in place.
**Fix:** Run `pnpm --filter @paperclipai/ui build` and check for errors. If TS errors exist, fix them first. Verify with: `grep -c "your_feature_string" ui/dist/assets/index-*.js`

### 2. `ERR_MODULE_NOT_FOUND` for `@paperclipai/*` packages (src/*.ts paths)
**Symptom:** Packaged app crashes with errors like `Cannot find module '.../src/index.ts'`
**Cause:** `pnpm deploy --prod` creates symlinks for workspace `@paperclipai/*` packages pointing back to the monorepo source. Their `package.json` exports point to `./src/*.ts` (dev mode), not `./dist/*.js` (production). `prepare-server.mjs` must replace these symlinks with real copies and patch exports to use `publishConfig.exports`.
**Fix:** This is handled in Step 2 of `prepare-server.mjs`. If a new workspace package is added, it will be handled automatically. The key: symlinks are replaced with copies containing only `dist/` + `package.json` (no `node_modules/`, no `src/`).

### 3. `ERR_MODULE_NOT_FOUND` for third-party packages (e.g. `postgres`, `picocolors`)
**Symptom:** Packaged app crashes with `Cannot find package 'X' imported from .../node_modules/@paperclipai/...`
**Cause:** When workspace packages were symlinks, `pnpm deploy` didn't hoist their transitive dependencies to the top-level `node_modules`. After replacing symlinks with real copies, Node's module resolution walks up to `node_modules/` but the dependency isn't there (it's only in `.pnpm/`).
**Fix:** Step 3 of `prepare-server.mjs` scans `.pnpm/` and creates top-level symlinks for any package not already hoisted. This runs automatically.

### 4. `initdbFlags` TypeScript error on `EmbeddedPostgres`
**Symptom:** `tsc` fails in `packages/db` or `server` with `'initdbFlags' does not exist on type`
**Cause:** Both `packages/db/src/migration-runtime.ts` and `server/src/index.ts` define a local `EmbeddedPostgresCtor` type (because `embedded-postgres` is dynamically imported). If a new property is used from the upstream package, the local type must be updated in both places.
**Fix:** Add the missing property to the `EmbeddedPostgresCtor` type in both files.

### 5. macOS: `node` binary not found in packaged app
**Symptom:** App crashes because it can't find `node` to spawn the server.
**Cause:** macOS apps launched from Finder/Dock don't inherit shell PATH. NVM/Homebrew `node` locations aren't on PATH.
**Fix:** `findNodeBinary()` in `main.ts` probes NVM default alias, Homebrew Intel/ARM, and system paths. If a user has Node installed in a non-standard location, they can set `NODE_PATH` env var.

### 6. macOS: dylib symlinks missing for embedded PostgreSQL
**Symptom:** Embedded PostgreSQL fails to start with dylib loading errors.
**Cause:** pnpm's content-addressable store strips soname symlinks (e.g. `libzstd.1.dylib -> libzstd.1.5.7.dylib`). macOS `dyld` needs these for `@loader_path` resolution.
**Fix:** Step 4 of `prepare-server.mjs` recreates soname symlinks for all `@embedded-postgres` native libs.

### 7. New workspace package added but packaged app can't find it
**Symptom:** `ERR_MODULE_NOT_FOUND` for a newly added `@paperclipai/*` package.
**Checklist:**
1. Is it in `server/package.json` dependencies? (`"@paperclipai/new-pkg": "workspace:*"`)
2. Run `pnpm install` from root to link it.
3. Does it have `publishConfig.exports` in its `package.json`? (pointing to `dist/`)
4. Run `pnpm build` from root to compile it.
5. `prepare-server.mjs` will handle the rest automatically (symlink replacement + export patching + dep hoisting).

---

## prepare-server.mjs Pipeline

This is the critical script for packaging. It runs 4 steps:

```
Step 1: pnpm deploy --prod
   Creates a flat node_modules at electron/build/server-deploy/
   BUT workspace packages are symlinks and deps may not be fully hoisted.

Step 2: Replace workspace symlinks with real copies
   For each @paperclipai/* symlink:
   - Remove symlink
   - Copy only dist/ + package.json + skills/ (NOT node_modules or src/)
   - Patch exports from src/*.ts to dist/*.js using publishConfig.exports

Step 3: Hoist missing dependencies
   Scan .pnpm/ store and create top-level symlinks for anything
   not already in node_modules/. Ensures transitive deps of
   workspace packages are resolvable.

Step 4: Restore dylib soname symlinks
   Recreate macOS soname symlinks for @embedded-postgres native libs
   that pnpm's content-addressable store strips out.
```

---

## electron-builder.yml: extraResources Layout

The packaged app bundles these into `Contents/Resources/`:

```
app-server/
  server/
    dist/          <- from ../server/dist (compiled server)
    ui-dist/       <- from ../ui/dist (compiled frontend)
    node_modules/  <- from build/server-deploy/node_modules (flat deps)
    package.json   <- from ../server/package.json
```

The server resolves `ui-dist/` via `path.resolve(__dirname, "../ui-dist")` when `uiMode === "static"`.

---

## Server UI Modes

Determined at startup in `server/src/index.ts`:
```
uiMode = config.uiDevMiddleware ? "vite-dev"
       : config.serveUi         ? "static"
       : "none"
```

- **vite-dev**: Vite dev server middleware, live from `ui/src/`. Used in dev mode.
- **static**: Serves from `ui-dist/` (packaged) or `../../ui/dist` (monorepo fallback). Used in production.
- **none**: API-only, no UI served.

---

## Debugging Packaged App

- **Server logs:** `~/Library/Application Support/Paperclip/server.log`
- **Electron main process:** Launch from terminal to see stdout: `./electron/release/mac/Paperclip.app/Contents/MacOS/Paperclip`
- **Verify UI bundle contents:** `grep -c "feature_string" ui/dist/assets/index-*.js`
- **Verify packaged node_modules:** `ls "electron/release/mac/Paperclip.app/Contents/Resources/app-server/server/node_modules/<package>"`
- **Check workspace package exports:** `cat "electron/release/mac/Paperclip.app/Contents/Resources/app-server/server/node_modules/@paperclipai/<pkg>/package.json" | grep -A5 exports`

---

## Pre-packaging Checklist

Before running `electron:pack` or `electron:dist:*`:

1. `pnpm install` - ensure all workspace links are current
2. `pnpm build` - compile all packages (check for errors!)
3. Verify `ui/dist` is fresh: `ls -la ui/dist/assets/index-*.js` (timestamp should be recent)
4. Verify `server/dist` is fresh: `ls -la server/dist/index.js`
5. If any of the above fail, fix errors before packaging - stale dist = stale app
