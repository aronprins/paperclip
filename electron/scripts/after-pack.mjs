import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

/**
 * afterPack hook: ad-hoc sign the macOS .app bundle so that App Translocation
 * preserves framework symlinks on recipient machines.  Without a signature,
 * quarantined apps crash at launch because dyld can't resolve
 * @rpath/Squirrel.framework/Squirrel after translocation.
 *
 * We also pre-sign all dylibs and native executables inside Resources so that
 * macOS doesn't reject them for mismatched Team IDs at runtime (e.g. the
 * embedded-postgres libzstd.dylib which ships with its own publisher signature).
 */

function findNativeBinaries(dir, results = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      findNativeBinaries(full, results);
    } else if (entry.endsWith(".dylib") || entry.endsWith(".so") || entry.endsWith(".node")) {
      results.push(full);
    } else if (st.mode & 0o111 && !entry.includes(".")) {
      // executable with no extension (e.g. postgres, pg_ctl binaries)
      results.push(full);
    }
  }
  return results;
}

export default async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

  console.log(`[after-pack] Stripping extended attributes from ${appPath}`);
  try {
    execFileSync("xattr", ["-cr", appPath]);
  } catch (e) {
    console.warn(`[after-pack] xattr -cr failed: ${e.message}`);
    try { execFileSync("xattr", ["-c", appPath]); } catch {}
  }

  // Pre-sign all native binaries inside Resources so their Team IDs are
  // neutralised before the deep sign. This is necessary because pnpm's nested
  // virtual store path is not traversed by codesign --deep.
  const resourcesDir = join(appPath, "Contents", "Resources");
  const natives = findNativeBinaries(resourcesDir);
  if (natives.length > 0) {
    console.log(`[after-pack] Pre-signing ${natives.length} native binaries inside Resources`);
    for (const bin of natives) {
      try {
        // Do NOT use --preserve-metadata here: it carries forward the original
        // publisher's hardened-runtime flag (0x10000), which causes dyld to
        // reject the binary on macOS 26+ with "different Team IDs".
        execFileSync("codesign", ["--sign", "-", "--force", bin]);
      } catch {
        // Some files may not be signable (e.g. plain text files caught by mode check); ignore.
      }
    }
  }

  // Explicitly re-sign the Electron Framework binary without the hardened-runtime
  // flag.  The original Electron binary ships with flags=0x10000(runtime) and
  // --preserve-metadata in the pre-sign step above carries that flag forward.
  // On macOS 26+, dyld rejects loading a hardened-runtime framework into a
  // non-platform ad-hoc process with "different Team IDs", so we must strip it.
  const electronFrameworkBin = join(
    appPath, "Contents", "Frameworks",
    "Electron Framework.framework", "Versions", "A", "Electron Framework"
  );
  try {
    execFileSync("codesign", ["--sign", "-", "--force", electronFrameworkBin]);
    console.log(`[after-pack] Stripped hardened-runtime from Electron Framework`);
  } catch (e) {
    console.warn(`[after-pack] Could not re-sign Electron Framework binary: ${e.message}`);
  }

  // Strip again — individual codesign calls can leave xattr detritus that
  // causes the final deep sign to fail with "resource fork not allowed".
  try { execFileSync("xattr", ["-cr", appPath]); } catch {}

  console.log(`[after-pack] Ad-hoc signing ${appPath}`);
  execFileSync("codesign", ["--sign", "-", "--deep", "--force", appPath], {
    stdio: "inherit",
  });
}
