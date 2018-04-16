const electron = require('electron');

// 控制应用生命周期的模块
const app = electron.app
// 创建窗口
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
let mainWindow

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', () => {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        frame: false,
        width: 800,
        height: 500,
        resizable: false
    });

    // 加载应用的index.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // 打开 DevTools.
    //mainWindow.webContents.openDevTools()

    // window关闭事件
    mainWindow.on('closed', () => {
        /// 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 但这次不是。
        mainWindow = null
    })
})

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', () => {
    // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
    // 应用会保持活动状态
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})


var ipcMain = electron.ipcMain;

//遍历获取图片文件
const { getImgList } = require('./assist');
ipcMain.on('file-drop', (event, dropPaths) => {
    var imgList = getImgList(dropPaths);
    event.sender.send('drop-imgs', imgList);
})

//关闭/最小化窗口
ipcMain.on('window-handle', (event, arg) => {
    if (arg == 'close') {
        mainWindow.close();
        return
    }

    if (arg == 'min') {
        mainWindow.minimize();
        return
    }
});


//打开目录选择面板
var dialog = electron.dialog;
ipcMain.on('select-directory', (event, arg) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }, (directory) => {
        if (directory) {
            event.sender.send('directory-selected', path.normalize(directory[0]))
        }
    });
})

//保存设置到文件
ipcMain.on('save-setting', (event, arg) => {
    
})