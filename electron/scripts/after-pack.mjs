import { execFileSync } from "node:child_process";
import { join } from "node:path";

/**
 * afterPack hook: ad-hoc sign the macOS .app bundle so that App Translocation
 * preserves framework symlinks on recipient machines.  Without a signature,
 * quarantined apps crash at launch because dyld can't resolve
 * @rpath/Squirrel.framework/Squirrel after translocation.
 */
export default async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;

  const appPath = join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log(`[after-pack] Stripping extended attributes from ${appPath}`);
  // Clear all xattrs from the .app bundle root (com.apple.FinderInfo blocks codesign).
  // Use non-recursive xattr -c so broken symlinks inside the bundle don't abort the call.
  try {
    execFileSync("xattr", ["-c", appPath]);
  } catch (e) {
    console.warn(`[after-pack] xattr -c on root failed: ${e.message}`);
  }
  // Also recursively strip xattrs from Frameworks and MacOS dirs (the binaries codesign signs).
  for (const sub of ["Contents/Frameworks", "Contents/MacOS"]) {
    try {
      execFileSync("xattr", ["-cr", `${appPath}/${sub}`]);
    } catch (e) {
      // non-fatal
    }
  }

  console.log(`[after-pack] Ad-hoc signing ${appPath}`);
  execFileSync("codesign", ["--sign", "-", "--deep", "--force", appPath], {
    stdio: "inherit",
  });
}
