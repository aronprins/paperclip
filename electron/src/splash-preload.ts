import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronSplash", {
  onStatusUpdate: (callback: (data: { step: string; detail: string; progress: number }) => void) => {
    ipcRenderer.on("status-update", (_event, data) => {
      callback(data);
    });
  },
});
