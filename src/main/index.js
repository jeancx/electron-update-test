(function () {
  'use strict'

  const path = require('path')
  const electron = require('electron')
  const app = electron.app
  const Menu = electron.Menu
  const Tray = electron.Tray
  const BrowserWindow = electron.BrowserWindow
  const autoUpdater = electron.autoUpdater
  const dialog = electron.dialog

  let tray = null
  let win = null
  let quitting = false

  const args = require('./args')
  const squirrel = require('./squirrel')

  const cmd = args.parseArguments(app, process.argv.slice(1)).squirrelCommand
  if (process.platform === 'win32' && squirrel.handleCommand(app, cmd)) {
    return
  }

  const createMenu = () => {
    const appMenu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit()
            }
          }
        ]
      }
    ])
    Menu.setApplicationMenu(appMenu)
  }

  const createTray = () => {
    const variant = (process.platform === 'darwin' ? 'Black' : 'White')
    const iconPath = path.resolve(__dirname, `../../resources/Icon${variant}Template.png`)

    tray = new Tray(iconPath)

    const trayMenu = Menu.buildFromTemplate([
      {
        label: 'Preferences...',
        click: () => {
          win.show()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])
    tray.setContextMenu(trayMenu)
  }

  const createWindow = () => {
    const iconPath = path.resolve(__dirname, '../../resources/Icon.png')
    const winUrl = `file://${path.resolve(__dirname, '../renderer/index.html')}`

    win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      icon: iconPath
    })
    win.loadURL(winUrl)

    win.on('close', (evt) => {
      if (quitting) {
        return
      }

      evt.preventDefault()
      win.hide()
    })

    win.on('closed', () => {
      tray = null
      win = null
    })
  }

  const autoUpdate = () => {
    const server = 'https://your-deployment-url.com'
    const feed = `${server}/update/${process.platform}/${app.getVersion()}`

    autoUpdater.setFeedURL(feed)

    autoUpdater.on('error', message => {
      console.error('Erro ao atualizar o aplicativo')
      console.error(message)
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

    autoUpdater.checkForUpdates()
  }

  app.on('before-quit', () => {
    quitting = true
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('ready', () => {
    createMenu()
    createTray()
    createWindow()
    autoUpdate()
  })
})()
