import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import net from "node:net";
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
 */
function startServer(): ChildProcess {
  const root = getMonorepoRoot();
  const isWin = process.platform === "win32";

  let child: ChildProcess;

  if (app.isPackaged) {
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
      detached: !isWin,
    });
  } else {
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
 * Kill the server and all of its child processes using tree-kill.
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
// Splash window with step-by-step status
// ---------------------------------------------------------------------------

let splashWindow: BrowserWindow | null = null;

function sendSplashStatus(step: string, detail: string, progress: number) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send("status-update", { step, detail, progress });
  }
}

function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 480,
    height: 380,
    frame: false,
    resizable: false,
    transparent: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "splash-preload.js"),
    },
  });

  splash.center();

  // The Paperclip SVG icon path (matches favicon.svg / avatar branding)
  const paperclipSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg>`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    height: 100vh;
    background: #0a0a0a;
    color: #e4e4e7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-app-region: drag;
    overflow: hidden;
  }

  .logo {
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 32px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 0.15s forwards;
  }

  /* Progress bar */
  .progress-track {
    width: 240px;
    height: 3px;
    background: #27272a;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 24px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 0.3s forwards;
  }
  .progress-bar {
    height: 100%;
    width: 0%;
    background: #a1a1aa;
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Steps list */
  .steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 280px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 0.4s forwards;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #52525b;
    transition: color 0.3s ease;
  }
  .step.active {
    color: #e4e4e7;
  }
  .step.done {
    color: #71717a;
  }

  /* Step indicator icons */
  .step-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-icon .pending {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3f3f46;
  }

  .step-icon .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #3f3f46;
    border-top-color: #a1a1aa;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .step-icon .check {
    color: #71717a;
    font-size: 14px;
    line-height: 1;
  }

  .step-label {
    flex: 1;
  }

  .step-detail {
    font-size: 11px;
    color: #52525b;
    margin-top: 2px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
</head>
<body>

  <div class="logo">${paperclipSvg}</div>
  <div class="title">Paperclip</div>

  <div class="progress-track">
    <div class="progress-bar" id="progressBar"></div>
  </div>

  <div class="steps" id="steps">
    <div class="step" id="step-init" data-key="init">
      <div class="step-icon"><div class="pending"></div></div>
      <div>
        <div class="step-label">Initializing</div>
      </div>
    </div>
    <div class="step" id="step-database" data-key="database">
      <div class="step-icon"><div class="pending"></div></div>
      <div>
        <div class="step-label">Starting database</div>
      </div>
    </div>
    <div class="step" id="step-server" data-key="server">
      <div class="step-icon"><div class="pending"></div></div>
      <div>
        <div class="step-label">Starting server</div>
      </div>
    </div>
    <div class="step" id="step-ready" data-key="ready">
      <div class="step-icon"><div class="pending"></div></div>
      <div>
        <div class="step-label">Loading interface</div>
      </div>
    </div>
  </div>

  <script>
    const progressBar = document.getElementById('progressBar');
    const stepElements = {
      init: document.getElementById('step-init'),
      database: document.getElementById('step-database'),
      server: document.getElementById('step-server'),
      ready: document.getElementById('step-ready'),
    };

    const stepOrder = ['init', 'database', 'server', 'ready'];

    function setStepState(key, state, detail) {
      const el = stepElements[key];
      if (!el) return;

      const iconContainer = el.querySelector('.step-icon');

      // Remove previous classes
      el.classList.remove('active', 'done');

      if (state === 'active') {
        el.classList.add('active');
        iconContainer.innerHTML = '<div class="spinner"></div>';
      } else if (state === 'done') {
        el.classList.add('done');
        iconContainer.innerHTML = '<span class="check">&#10003;</span>';
      } else {
        iconContainer.innerHTML = '<div class="pending"></div>';
      }

      // Update detail text if provided
      let detailEl = el.querySelector('.step-detail');
      if (detail) {
        if (!detailEl) {
          detailEl = document.createElement('div');
          detailEl.className = 'step-detail';
          el.querySelector('.step-label').parentElement.appendChild(detailEl);
        }
        detailEl.textContent = detail;
      } else if (detailEl) {
        detailEl.remove();
      }
    }

    // Listen for status updates from main process
    window.electronSplash.onStatusUpdate(({ step, detail, progress }) => {
      // Update progress bar
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';

      // Mark all steps before current as done
      const currentIdx = stepOrder.indexOf(step);
      stepOrder.forEach((key, idx) => {
        if (idx < currentIdx) {
          setStepState(key, 'done');
        } else if (idx === currentIdx) {
          setStepState(key, 'active', detail);
        } else {
          setStepState(key, 'pending');
        }
      });
    });
  </script>

</body>
</html>`;

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  splashWindow = splash;
  return splash;
}

// ---------------------------------------------------------------------------
// Main window
// ---------------------------------------------------------------------------

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Paperclip",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  return win;
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.setName("Paperclip");

app.whenReady().then(async () => {
  const splash = createSplashWindow();

  try {
    // Step 1: Initializing
    sendSplashStatus("init", "Preparing environment\u2026", 5);
    await sleep(300); // brief pause so the user sees the first step

    // Step 2: Starting database
    sendSplashStatus("database", "Launching embedded PostgreSQL\u2026", 15);

    serverProcess = startServer();

    // Watch stdout for server log milestones to update splash status
    let dbReady = false;
    let serverListening = false;

    const onServerData = (chunk: Buffer) => {
      const text = chunk.toString();

      // Detect database readiness from server logs
      if (!dbReady && (text.includes("database") || text.includes("postgres") || text.includes("migration"))) {
        dbReady = true;
        sendSplashStatus("database", "Running migrations\u2026", 35);
      }

      if (!serverListening && (text.includes("listening") || text.includes("Server") || text.includes("ready"))) {
        serverListening = true;
        sendSplashStatus("server", "Server is starting\u2026", 55);
      }
    };

    serverProcess.stdout?.on("data", onServerData);
    serverProcess.stderr?.on("data", onServerData);

    serverProcess.on("exit", (code, signal) => {
      if (serverProcess) {
        console.error(`Server exited unexpectedly (code=${code}, signal=${signal})`);
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

    // Animate progress while waiting for the port
    const progressInterval = setInterval(() => {
      if (!dbReady) {
        sendSplashStatus("database", "Launching embedded PostgreSQL\u2026", 20);
      } else if (!serverListening) {
        sendSplashStatus("server", "Waiting for server\u2026", 50);
      }
    }, 2000);

    sendSplashStatus("server", "Waiting for server\u2026", 45);

    // Step 3: Wait for server
    await waitForPort(SERVER_PORT, SERVER_STARTUP_TIMEOUT_MS);

    clearInterval(progressInterval);
    sendSplashStatus("server", "Server is ready", 70);

    // Step 4: Loading interface
    sendSplashStatus("ready", "Loading the UI\u2026", 80);

    mainWindow = createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

    mainWindow.webContents.once("did-finish-load", () => {
      sendSplashStatus("ready", "Almost there\u2026", 95);
    });

    // When the main window is ready, close the splash
    mainWindow.once("ready-to-show", () => {
      sendSplashStatus("ready", "Ready!", 100);
      // Short delay so the user sees "Ready!" before the splash disappears
      setTimeout(() => {
        if (splash && !splash.isDestroyed()) {
          splash.destroy();
        }
        splashWindow = null;
      }, 400);
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  } catch (err) {
    if (splash && !splash.isDestroyed()) {
      splash.destroy();
    }
    splashWindow = null;
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

// macOS: re-create window when dock icon clicked
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && serverProcess) {
    mainWindow = createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (e) => {
  if (serverProcess) {
    e.preventDefault();
    await killServer();
    app.quit();
  }
});

for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"] as const) {
  process.on(sig, async () => {
    await killServer();
    process.exit(0);
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
