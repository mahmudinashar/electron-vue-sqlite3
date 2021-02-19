"use strict"

import { app, BrowserWindow, ipcMain } from "electron"
import { Connection } from "./connection"
import { PrepareDatabase } from "./prepareDatabase"

let con = new Connection()
let prepare = new PrepareDatabase()
let knex = con.connect()

prepare.dropTableUser(knex)
prepare.createTableUser(knex)
prepare.insertTableUser(knex, "Firstname", "Lastname")

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

let mainWindow
const winURL = process.env.NODE_ENV === "development"
  ? "http://localhost:9080"
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 1280,
    minWidth: 1024,
    minHeight: 650,
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
