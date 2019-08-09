const {app, BrowserWindow, autoUpdater, dialog} = require('electron')
const repo = 'https://github.com/jeancx/electron-update-test/releases'
const feed = `${repo}/${app.getVersion()}`
console.log(feed)
const minutesToCheckUpdate = 1
let win

autoUpdater.setFeedURL(feed)

setInterval(() => {
    autoUpdater.checkForUpdates()
}, minutesToCheckUpdate * 60 * 1000)

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts, (response) => {
        if (response === 0) autoUpdater.quitAndInstall()
    })
})

autoUpdater.on('error', message => {
    const dialogOpts = {
        type: 'warning',
        buttons: ['OK'],
        title: 'Erro ao atualizar o aplicativo',
        message: message
    }

    dialog.showMessageBox(dialogOpts)
})