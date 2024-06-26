const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-folder-dialog', async (event) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    event.reply('selected-folder', folderPath);
  }
});
