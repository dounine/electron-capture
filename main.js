const electron = require('electron');
const {desktopCapturer,ipcMain, globalShortcut} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
var mainWindow;
var JSONStorage = require('node-localstorage').JSONStorage;
var storageLocation = app.getPath('userData');
global.nodeStorage = new JSONStorage(storageLocation);
var windowState = null;
try {
    windowState = global.nodeStorage.getItem('windowstate') || {
        bounds: {
            x: undefined,
            y: undefined,
            width: 800,
            height: 600
        }
    };
} catch (err) {
}

function storeWindowState() {
    windowState.isMaximized = mainWindow.isMaximized();
    windowState.bounds = {
        x: mainWindow.getBounds().x,
        y: mainWindow.getBounds().y,
        width: mainWindow.getBounds().width,
        height: mainWindow.getBounds().height
    };
    global.nodeStorage.setItem('windowstate', windowState);
};

globalShort = globalShortcut;


function createWindow() {
    const ipcMain = electron.ipcMain;

    mainWindow = new BrowserWindow({
        title: 'IYou',
        x: windowState.bounds.x,
        y: windowState.bounds.y,
        width: windowState.bounds.width,
        minWidth: 880,
        height: windowState.bounds.height,
        minHeight: 600,
        icon: __dirname + '/img/favicon',
        frame: true,
        // resizable: false,
        show: true,
        hasShadow: true
    });

    mainWindow.loadURL('http://localhost:63343/electron-capture/index.html?_ijt=4bltsn0e9uj7lv6k7ije3kahme');

    ipcMain.on('screenshot-page', function(sender, message) {
        switch (message.type) {
            case 'close':
                mainWindow.webContents.send('quit-cut',{
                    data:message.data
                });
                break;
            default:
                break;
        }
    });

    mainWindow.webContents.openDevTools();
    ipcMain.on('CLOSE', function (event, result) {
        app.quit()
    });
    ipcMain.on('MIN', function (event, result) {
        mainWindow.minimize();
    });
    ipcMain.on('MAX', function (event, result) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('close', function () {
        storeWindowState();
    });

    mainWindow.on('move', function () {
        storeWindowState();
    });

    mainWindow.on('resize', function () {
        storeWindowState();
    });

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.show();
        // mainWindow.focus();
    });
}

app.on('ready', createWindow);

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
