const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) app.quit();

const ActiveWindow = require('@paymoapp/active-window').default;
ActiveWindow.initialize();

if (!ActiveWindow.requestPermissions()) {
    console.log('Error: You need to grant screen recording permission in System Preferences > Security & Privacy > Privacy > Screen Recording');
    process.exit(0);
}

let gridWin;
let win;
let tray;

function createGridWin() {
    gridWin = new BrowserWindow({
        x: 330, y: 25,
        width: 1280,
        height: 980,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload-grid.js')
        },
        transparent: true,
        focusable: false,
        frame: false,
        show: false,
    })
    gridWin.setAlwaysOnTop(true, 'screen');
    gridWin.setMenu(null);
    gridWin.loadFile('index-grid.html')


    gridWin.setIgnoreMouseEvents(true, { forward: true });

    ipcMain.on('disable-mouse-event', (event, title) => {
        gridWin.setIgnoreMouseEvents(true, { forward: true });
    });

    ipcMain.on('enable-mouse-event', (event, title) => {
        gridWin.setIgnoreMouseEvents(false, { forward: true });
    });

    // gridWin.webContents.openDevTools();
}

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(__dirname, 'icon.png'),
        x: 20, y: 150,
        width: 150,
        height: 114,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        transparent: true,
        focusable: false,
        frame: false,
        show: false,
    })
    win.setAlwaysOnTop(true, 'screen');
    win.setMenu(null);
    win.loadFile('index.html')

    win.on('close', () => {
        app.quit();
    })

    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createGridWin();
    createWindow();

    tray = new Tray(path.join(__dirname, "icon.ico"));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', click: () => { app.quit() } }
    ]);

    tray.setToolTip('Harebourg Overlay');
    tray.setContextMenu(contextMenu);
})

ipcMain.on('set::rotation', async (event, arg) => {
    console.log('set::rotation', arg)
    gridWin.webContents.send("set::rotation", arg)
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

setInterval(async () => {
    try {
        const activeWin = ActiveWindow.getActiveWindow();
        if (["Dofus.exe"].includes(activeWin.application)) {
            gridWin.showInactive();
            win.showInactive();
        } else {
            gridWin.hide();
            win.hide();
        }
    }
    catch (e) {
        // console.error(e)
    }
}, 50);