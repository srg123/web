const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
var runPath = app.getAppPath();

var winOption = {
    frame: true,
    modal: false,
    skipTaskbar: false,
    fullscreen: false,
    alwaysOnTop: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
   /* width:1000,
    height:600,*/
    thickFrame: true,
    //title: 'VideoPlayer',
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    transparent: false,
    webPreferences: {
        allowRunningInsecureContent: true,
        plugins: true,
        //  zoomFactor: 0,
        // nodeIntegration: false,
        //  nodeIntegrationInWorker: false,
        webSecurity: false
    }
};

app.on('ready', function () {

    //  showTray();
    createWindow(winOption);

});

app.on("window-all-closed", function () {
    app.quit();
    process.exit(0);
});

function createWindow(option) {


    var win = new BrowserWindow(option);

    var contents = win.webContents;

    var url = runPath + "/web/index.html";
    win.loadURL(url + "?v=" + Math.random());

    contents.on("before-input-event", function (event, input) {
        if (input.type === "keyUp") {

            if (input.key === "F12") { //f12出控制台
                contents.toggleDevTools();
            }
            else if (input.key === "F5") {
                contents.reload(); //f5 刷新
            }
        }
    });

    return win;
}