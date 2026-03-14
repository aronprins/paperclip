// Preload script — runs in a sandboxed renderer context.
// Currently a no-op; extend this to expose safe IPC APIs to the renderer
// via contextBridge if needed in the future.
//
// Example:
//   import { contextBridge, ipcRenderer } from "electron";
//   contextBridge.exposeInMainWorld("paperclip", {
//     getVersion: () => ipcRenderer.invoke("get-version"),
//   });

export {};
