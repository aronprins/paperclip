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
  console.log(`[after-pack] Ad-hoc signing ${appPath}`);

  execFileSync("codesign", ["--sign", "-", "--deep", "--force", appPath], {
    stdio: "inherit",
  });
}
