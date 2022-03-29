const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron/main');

const getWindowCount = () => BrowserWindow.getAllWindows().length;

const createWindow = () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    height: 864,
    maximizable: false,
    resizable: false,
    roundedCorners: true,
    title: "Calculator",
    // transparent: true,
    width: 600,
    // webPreferences: {
    //   contextIsolation: false,
    //   nodeIntegration: true,
    //   // preload: path.join(__dirname, 'preload.js'),
    // }
  });

  win.loadFile("src/index.html");
};

app.on('window-all-closed', () => process.platform !== "darwin" && app.quit());
ipcMain.on('close-window', (event, arg) => app.quit());

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => getWindowCount() === 0 && createWindow());
});
