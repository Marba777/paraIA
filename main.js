const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let win
let settingsWin
let clickThrough = true
let isDev = process.argv.includes('--dev')

const statePath = path.join(app.getPath('userData'), 'window-state.json')

function loadState() {
  try { return JSON.parse(fs.readFileSync(statePath, 'utf8')) }
  catch { return { x: 100, y: 100, width: 800, height: 300 } }
}

function saveState() {
  if (!win) return
  fs.writeFileSync(statePath, JSON.stringify(win.getBounds()))
}

function createOverlay() {
  const state = loadState()

  win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 300,
    minHeight: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev
    }
  })

  // Busca overlay.html en rutas posibles según estructura del proyecto
  let htmlPath = path.join(__dirname, 'overlay.html')
  if (!fs.existsSync(htmlPath)) htmlPath = path.join(__dirname, '..', 'overlay.html')
  if (!fs.existsSync(htmlPath)) htmlPath = path.join(__dirname, '..', '..', 'overlay.html')
  if (!fs.existsSync(htmlPath)) htmlPath = path.join(__dirname, '..', '..', 'parakeet.html')
  win.loadFile(htmlPath)

  win.setIgnoreMouseEvents(true, { forward: true })
  clickThrough = true

  if (isDev) win.webContents.openDevTools({ mode: 'detach' })

  win.on('moved', saveState)
  win.on('resized', saveState)
  win.on('close', saveState)
}

function createSettings() {
  if (settingsWin) { settingsWin.focus(); return }

  settingsWin = new BrowserWindow({
    width: 480,
    height: 620,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  let settingsPath = path.join(__dirname, 'settings.html')
  if (!fs.existsSync(settingsPath)) settingsPath = path.join(__dirname, '..', 'settings.html')
  if (!fs.existsSync(settingsPath)) settingsPath = path.join(__dirname, '..', '..', 'settings.html')
  settingsWin.loadFile(settingsPath)
  settingsWin.on('closed', () => { settingsWin = null })
}

app.whenReady().then(() => {
  createOverlay()

  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (!win) return
    win.isVisible() ? win.hide() : win.show()
  })

  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (!win) return
    clickThrough = !clickThrough
    win.setIgnoreMouseEvents(clickThrough, { forward: true })
    win.webContents.send('click-through-changed', clickThrough)
  })

  globalShortcut.register('CommandOrControl+Shift+S', () => createSettings())
  globalShortcut.register('CommandOrControl+Shift+X', () => app.quit())
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  saveState()
})

ipcMain.on('open-settings', () => createSettings())
ipcMain.on('quit-app', () => app.quit())
ipcMain.on('settings-closed', () => { if (settingsWin) settingsWin.close() })

ipcMain.on('set-opacity', (_, value) => {
  if (win) {
    win.setOpacity(value / 100)
    win.webContents.send('set-opacity', value)
  }
})

ipcMain.on('set-font-size', (_, value) => {
  if (win) win.webContents.send('set-font-size', value)
})

ipcMain.on('set-theme', (_, theme) => {
  if (win) win.webContents.send('set-theme', theme)
})

ipcMain.on('set-system-prompt', (_, prompt) => {
  if (win) win.webContents.send('set-system-prompt', prompt)
})

ipcMain.on('set-model', (_, model) => {
  if (win) win.webContents.send('set-model', model)
})

ipcMain.on('set-whisper-url', (_, url) => {
  if (win) win.webContents.send('set-whisper-url', url)
})

ipcMain.on('set-ollama-url', (_, url) => {
  if (win) win.webContents.send('set-ollama-url', url)
})

if (process.platform === 'win32') {
  setInterval(() => {
    if (win && win.isVisible()) win.setAlwaysOnTop(true, 'screen-saver')
  }, 3000)
}