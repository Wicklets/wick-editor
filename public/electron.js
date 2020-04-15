const electron = require('electron');
const autoUpdater = require("electron-updater");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 400,
      minHeight: 400,
      webPreferences: {
        // This is required for HTML Preview to work.
        // See: https://www.electronjs.org/docs/api/window-open#using-chromes-windowopen-implementation
        nativeWindowOpen: true,
      }
    });

    mainWindow.autoUpdater = autoUpdater;

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });

    mainWindow.loadURL(startUrl);

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    mainWindow.on('close', function(e) {
        e.preventDefault();
        mainWindow.destroy();
        app.quit();
    });

    mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      electron.shell.openExternal(url);
    });

    mainWindow.setMenu(null); // Disable the file menu in favor of the in-app menu.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    autoUpdater.autoUpdater.checkForUpdatesAndNotify();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
