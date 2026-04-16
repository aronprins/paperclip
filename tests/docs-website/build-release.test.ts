import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const scriptPath = path.join(repoRoot, "docs", "docs-website", "build-release.mjs");

async function runBuildRelease(args: string[]) {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "paperclip-docs-release-"));
  const result = await execFileAsync("node", [scriptPath, ...args, "--out-dir", outputDir], {
    cwd: repoRoot,
  });
  return { ...result, outputDir };
}

describe("docs release builder", () => {
  it("writes explicit-base-path deployment guidance and hardened release shell", async () => {
    const { outputDir, stdout, stderr } = await runBuildRelease([
      "--base-path",
      "/random/paperclip-docs/",
    ]);

    expect(stdout).toContain("Base path: /random/paperclip-docs/");
    expect(stderr).toBe("");

    const indexHtml = await readFile(path.join(outputDir, "index.html"), "utf8");
    const nginxConfig = await readFile(path.join(outputDir, "nginx.conf.example"), "utf8");
    const deployGuide = await readFile(path.join(outputDir, "DEPLOY.md"), "utf8");

    expect(indexHtml).toContain('const RELEASE_BASE_PATH = "/random/paperclip-docs/";');
    expect(indexHtml).toContain("async function fetchNavForBasePath(basePath)");
    expect(indexHtml).toContain("nav.json did not return valid JSON");
    expect(indexHtml).toContain("PRELOADED_NAV_DATA");

    expect(nginxConfig).toContain("location ~ ^/random/paperclip-docs/.*\\.[A-Za-z0-9]+$");
    expect(nginxConfig).toContain("try_files $uri $uri/ /random/paperclip-docs/index.html;");

    expect(deployGuide).toContain("This bundle was built for the public base path `/random/paperclip-docs/`.");
    expect(deployGuide).toContain("Let missing files with extensions such as `.json`, `.md`, images, fonts, and JS return `404`");
  });

  it("warns for auto base-path builds and emits placeholder nginx guidance", async () => {
    const { outputDir, stdout, stderr } = await runBuildRelease([]);

    expect(stdout).toContain("Base path: auto");
    expect(stderr).toContain("Warning: --base-path auto is less robust");

    const nginxConfig = await readFile(path.join(outputDir, "nginx.conf.example"), "utf8");
    const deployGuide = await readFile(path.join(outputDir, "DEPLOY.md"), "utf8");

    expect(nginxConfig).toContain("Replace /paperclip-docs/ with the public mount path");
    expect(deployGuide).toContain("This bundle was built with `--base-path auto`.");
    expect(deployGuide).toContain("node docs/docs-website/build-release.mjs --base-path /paperclip-docs/");
  });
});
