"use strict"

import { app, BrowserWindow, ipcMain } from "electron"
const path = require("path")

const userData = app.getPath("userData")
const dbFile = path.resolve(userData, "database.sqlite")

var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: dbFile
  },
  useNullAsDefault: true
})

// ---------------
//  prepateTable
// ---------------
knex.schema.createTableIfNotExists("User", function (table) {
  table.increments()
  table.string("FirstName")
  table.string("LastName")
}).then(function () {
  return knex("User").insert([
    { FirstName: "A", LastName: "A" },
    { FirstName: "B", LastName: "BB" }
  ])
}
)

if (process.env.NODE_ENV === "development") {
  let result = knex.select("FirstName").from("User")
  result.then(function (rows) {
    console.log(rows)
  })
}

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

let mainWindow
const winURL = process.env.NODE_ENV === "development"
  ? "http://localhost:9080"
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 650,
    useContentSize: true,
    width: 960,
    minWidth: 900,
    minHeight: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)

  ipcMain.on("mainWindowLoaded", function () {
    let result = knex.select("FirstName").from("User")
    result.then(function (rows) {
      mainWindow.webContents.send("resultSent", rows)
    })
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
