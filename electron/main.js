const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// --- 单实例应用逻辑 (Single Instance Lock) ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，说明已经有一个实例在运行，直接退出当前新实例
  app.quit();
} else {
  // 获取锁成功，设置监听器以响应第二个实例的启动请求
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当用户尝试打开第二个实例时，让主窗口恢复显示并聚焦
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 只有获取到锁的实例才执行标准的启动流程
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 900,
    minHeight: 600,
    frame: false, // 无边框窗口
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true, // 允许使用 Node.js API
      contextIsolation: false, // 允许渲染进程直接通信
      webSecurity: false // 允许加载本地文件 (file://) 用于PDF预览
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // 开发模式下可取消注释开启调试工具
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 处理窗口打开链接的行为，强制使用默认浏览器打开外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC 处理器 (前后端通信) ---

// 窗口控制
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

// 原生文件/文件夹选择
// 1. 选择文件夹
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// 2. 选择 PDF 文件
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDFs', extensions: ['pdf'] }]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});