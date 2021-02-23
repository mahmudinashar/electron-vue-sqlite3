"use strict"

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  shell,
  globalShortcut
} from "electron"
import { Connection } from "./connection"
import { PrepareDatabase } from "./prepareDatabase"

// database and schema
let con = new Connection()
let prepare = new PrepareDatabase()
let knex = con.connect()

prepare.dropTableUser(knex)
prepare.createTableUser(knex)
prepare.insertTableUser(knex, "Firstname", "Lastname")

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
} else {
  // show context menu *inspect element* only in development mode
  let contextMenu = require("electron-context-menu")
  contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
    ]
  })

  // testing connection to sqlite3
  let result = knex.select("FirstName").from("User")
  result.then(function (rows) {
    console.log(rows)
  })
}

let mainWindow
const winURL = process.env.NODE_ENV === "development"
  ? "http://localhost:9080"
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 750,
    useContentSize: true,
    width: 1500,
    minWidth: 1024,
    minHeight: 550,
    resizable: true,
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

  let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Home",
          accelerator: "Ctrl+H",
          click () {
            mainWindow.webContents.send("pageMenu", "home")
          }
        },
        {
          label: "About This Project",
          accelerator: "Ctrl+A",
          click () {
            mainWindow.webContents.send("pageMenu", "about")
          }
        },
        {
          type: "separator"
        },
        {
          label: "Exit",
          role: "close"
        }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          role: "reload"
        },
        {
          role: "resetzoom"
        },
        {
          role: "zoomin"
        },
        {
          role: "zoomout"
        },
        {
          type: "separator"
        },
        {
          role: "togglefullscreen"
        }
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Documentation",
          click () {
            shell.openExternal("https://electron.atom.io/docs/")
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
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

app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+H", () => {
    mainWindow.webContents.send("pageMenu", "home")
  })

  globalShortcut.register("CommandOrControl+A", () => {
    mainWindow.webContents.send("pageMenu", "about")
  })
})
