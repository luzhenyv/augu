import { app, BrowserWindow, ipcMain, dialog, OpenDialogOptions } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  win = null
})

app.whenReady().then(createWindow)

ipcMain.handle('dialog:openDirectorySelect', async () => {
  let options: OpenDialogOptions = {
    title: 'Open Directory',
    properties: ['openFile', 'multiSelections'],
  };

  const result = await dialog.showOpenDialog(win!, options);

  if (result.canceled) {
    return null
  }
  // console.log(result.canceled)
  console.log(`open files is ${result.filePaths.join(', ')}`)
  return absolutePathsInDirectory(
    result.filePaths
  );
})

function absolutePathsInDirectory(paths: string[]) {
  let result: string[] = [];
  return new Promise((resolve, reject) => {
    fs.stat(paths[0], function (_err, stats) {
      if (stats.isDirectory()) {
        fs.readdir(paths[0], (err, files) => {
          if (err) {
            console.error('reject:' + err)
            reject(err)
          } else {
            files.forEach(file => {
              result.push(`file://${paths[0]}${path.sep}${file}`);
            });

            resolve(result)
          }
        }
        )
      } else if (stats.isFile()) {
        paths.forEach((path) => {
          result.push(`file://${path}`);
        })
        resolve(result)
      }
    })
  })

}
