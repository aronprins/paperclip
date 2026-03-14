import { app, BrowserWindow, dialog, shell } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import treeKill from "tree-kill";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVER_PORT = 3100;
const SERVER_STARTUP_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 400;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Resolve the monorepo root (one level up from electron/) */
function getMonorepoRoot(): string {
  // In dev: electron/ is inside the monorepo.
  // In packaged app: we bundle the built server alongside.
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app-server");
  }
  return path.resolve(app.getAppPath(), "..");
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

let serverProcess: ChildProcess | null = null;

/**
 * Wait for a TCP port to accept connections.
 */
function waitForPort(port: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const tryConnect = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Server did not start within ${timeoutMs}ms`));
        return;
      }

      const sock = net.createConnection({ port, host: "127.0.0.1" }, () => {
        sock.destroy();
        resolve();
      });

      sock.on("error", () => {
        setTimeout(tryConnect, POLL_INTERVAL_MS);
      });
    };

    tryConnect();
  });
}

/**
 * Spawn the Paperclip server as a child process.
 *
 * In development we run `pnpm dev:once` from the monorepo root.
 * In a packaged build we run `node server/dist/index.js` directly.
 */
function startServer(): ChildProcess {
  const root = getMonorepoRoot();
  const isWin = process.platform === "win32";

  let child: ChildProcess;

  if (app.isPackaged) {
    // Production — run the pre-built server bundle
    const serverEntry = path.join(root, "server", "dist", "index.js");
    child = spawn("node", [serverEntry], {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(SERVER_PORT),
        PAPERCLIP_DATA_DIR: path.join(app.getPath("userData"), "data"),
      },
      stdio: ["ignore", "pipe", "pipe"],
      detached: !isWin, // Unix: create process group for clean tree-kill
    });
  } else {
    // Development — use pnpm dev:once
    const pnpmBin = isWin ? "pnpm.cmd" : "pnpm";
    child = spawn(pnpmBin, ["dev:once"], {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(SERVER_PORT),
      },
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWin,
      detached: !isWin,
    });
  }

  child.stdout?.on("data", (chunk: Buffer) => {
    process.stdout.write(chunk);
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(chunk);
  });

  return child;
}

/**
 * Kill the server and all of its child processes (pnpm → tsx → node, embedded
 * postgres, etc.) using tree-kill for reliable cross-platform cleanup.
 */
function killServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!serverProcess?.pid) {
      resolve();
      return;
    }

    const pid = serverProcess.pid;
    serverProcess = null;

    treeKill(pid, "SIGTERM", (err) => {
      if (err) {
        // Best-effort: try SIGKILL if SIGTERM didn't work
        try {
          treeKill(pid, "SIGKILL");
        } catch {
          // ignore
        }
      }
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Paperclip",
    show: false, // show after content has loaded
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Gracefully show once the renderer is ready
  win.once("ready-to-show", () => {
    win.show();
  });

  // Open external links in the system browser, not inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  return win;
}

// ---------------------------------------------------------------------------
// Splash / loading screen
// ---------------------------------------------------------------------------

function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #0f0f0f;
          color: #e0e0e0;
        }
        h1 { font-size: 28px; font-weight: 600; margin-bottom: 16px; }
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid #333;
          border-top-color: #888;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        p { margin-top: 16px; font-size: 13px; color: #888; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h1>Paperclip</h1>
      <div class="spinner"></div>
      <p>Starting server&hellip;</p>
    </body>
    </html>
  `;

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  return splash;
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.setName("Paperclip");

app.whenReady().then(async () => {
  const splash = createSplashWindow();

  try {
    // 1. Start the server
    serverProcess = startServer();

    serverProcess.on("exit", (code, signal) => {
      if (serverProcess) {
        // Unexpected exit
        console.error(
          `Server exited unexpectedly (code=${code}, signal=${signal})`
        );
        dialog
          .showMessageBox({
            type: "error",
            title: "Server Error",
            message: "The Paperclip server stopped unexpectedly.",
            detail: `Exit code: ${code}, signal: ${signal}`,
            buttons: ["Quit"],
          })
          .then(() => app.quit());
      }
    });

    // 2. Wait for the server to be ready
    await waitForPort(SERVER_PORT, SERVER_STARTUP_TIMEOUT_MS);

    // 3. Create the main window
    mainWindow = createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

    // 4. When the main window is ready, close the splash
    mainWindow.once("ready-to-show", () => {
      splash.destroy();
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  } catch (err) {
    splash.destroy();
    await dialog.showMessageBox({
      type: "error",
      title: "Startup Error",
      message: "Failed to start the Paperclip server.",
      detail: String(err),
      buttons: ["Quit"],
    });
    await killServer();
    app.quit();
  }
});

// macOS: re-create window when dock icon clicked and no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && serverProcess) {
    mainWindow = createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }
});

// Quit when all windows are closed (except on macOS where apps stay in dock)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Ensure the server is killed before the app fully exits
app.on("before-quit", async (e) => {
  if (serverProcess) {
    e.preventDefault();
    await killServer();
    app.quit();
  }
});

// Safety net: kill server on unexpected termination signals
for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"] as const) {
  process.on(sig, async () => {
    await killServer();
    process.exit(0);
  });
}
