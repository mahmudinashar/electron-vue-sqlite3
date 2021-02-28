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

knex.schema.hasTable("setting").then(function (exists) {
  if (!exists) {
    prepare.createTableSetting(knex)
    prepare.createTableWilayah(knex)
    prepare.createTableTps(knex)
  }
})

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
} else {
  let contextMenu = require("electron-context-menu")
  contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
    ]
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

  // +++++++++++++++++++++
  //        ipcMain
  // +++++++++++++++++++++
  ipcMain.on("getWilayahParent", (event, data) => {
    knex
      .from("wilayah")
      .select("*")
      .where("wilayah_id", data)
      .then((rows) => {
        mainWindow.webContents.send("getWilayahParentResult", rows[0])
      })
      .catch((err) => {
        mainWindow.webContents.send("getWilayahParentResult", err)
      })
      .finally(() => { })
  })

  ipcMain.on("getWilayahChild", async (event, data) => {
    var result = []
    var rows = []
    rows = await knex.from("wilayah").select("*").where("parent", data)
    const promises = rows.map(async data => {
      const container = {}
      container["wilayah_id"] = data.wilayah_id
      container["nama"] = data.nama
      container["tingkat"] = data.tingkat
      container["parent"] = data.parent

      let where = {}
      if (data.tingkat === 2) {
        where = { "kabupaten_id": data.wilayah_id }
      }
      if (data.tingkat === 3) {
        where = { "kecamatan_id": data.wilayah_id }
      }
      if (data.tingkat === 4) {
        where = { "kelurahan_id": data.wilayah_id }
      }

      let hasil = await knex("tps").count("id", { as: "count" }).where(where)

      container["countTps"] = hasil[0].count
      result.push(container)
    })

    await Promise.all(promises)
    mainWindow.webContents.send("getWilayahChildResult", result)
  })

  ipcMain.on("getTpsChild", (event, data) => {
    knex
      .from("tps")
      .select("*")
      .where(data)
      .then((rows) => {
        // console.log(rows)
        mainWindow.webContents.send("getTpsChildResult", rows)
      })
      .catch((err) => {
        mainWindow.webContents.send("getTpsChildResult", err)
      })
      .finally(() => { })
  })

  ipcMain.on("getTpsCount", (event, data) => {
    knex("tps")
      .count("id", { as: "count" })
      .where(data)
      .then((rows) => {
        console.log(rows[0])
        mainWindow.webContents.send("getTpsCountResult", rows[0])
      })
      .catch((err) => {
        mainWindow.webContents.send("getTpsCountResult", err)
      })
      .finally(() => { })
  })

  ipcMain.on("saveSetting", (event, data) => {
    knex("setting")
      .truncate()
      .then()
      .catch((err) => {
        mainWindow.webContents.send("saveSettingResult", err)
      })

    knex("setting")
      .insert(data)
      .then(
        mainWindow.webContents.send(
          "saveSettingResult",
          "data setting has been saved to database!"
        )
      )
      .catch((err) => {
        mainWindow.webContents.send("saveSettingResult", err)
      })
  })

  ipcMain.on("saveWilayah", (event, data) => {
    knex("wilayah")
      .truncate()
      .then()
      .catch((err) => {
        mainWindow.webContents.send("saveWilayahResult", err)
      })

    knex("wilayah")
      .insert(data)
      .then((rows) => {
        mainWindow.webContents.send("saveWilayahResult", "data wilayah has been saved to database!")
      })
      .catch((err) => {
        mainWindow.webContents.send("saveWilayahResult", err)
      })
      .finally(() => {})
  })

  ipcMain.on("saveTps", (event, data) => {
    knex("tps")
      .truncate()
      .then()
      .catch((err) => {
        mainWindow.webContents.send("saveTpsResult", err)
      })

    var i
    var j
    var resArray = []
    var chunk = 200
    for (i = 0, j = data.length; i < j; i += chunk) {
      resArray.push(data.slice(i, i + chunk))
    }

    var numChunk = Math.ceil(data.length / chunk)
    for (i = 0, j = numChunk; i < j; i++) {
      knex("tps")
        .insert(resArray[i])
        .then()
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {})
    }
    mainWindow.webContents.send(
      "saveTpsResult",
      "data tps has been saved to database!"
    )
  })

  ipcMain.on("currentSetting", (event, data) => {
    knex
      .from("setting")
      .select("*")
      .where("id", 1)
      .then((rows) => {
        mainWindow.webContents.send("currentSettingResult", rows)
      })
      .catch((err) => {
        throw err
      })
      .finally(() => { })
  })

  // +++++++++++++++++++++

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Setup (Inisialisasi)",
          accelerator: "Ctrl+I",
          click () {
            mainWindow.webContents.send("pageMenu", "setting")
          }
        },
        {
          label: "Pemutakhiran",
          accelerator: "Ctrl+P",
          click () {
            mainWindow.webContents.send("pageMenu", "home")
          }
        },
        {
          label: "Wilayah",
          accelerator: "Ctrl+T",
          click () {
            mainWindow.webContents.send("pageMenu", "wilayah")
          }
        },
        {
          label: "About",
          accelerator: "Ctrl+B",
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
  globalShortcut.register("CommandOrControl+P", () => {
    mainWindow.webContents.send("pageMenu", "home")
  })

  globalShortcut.register("CommandOrControl+B", () => {
    mainWindow.webContents.send("pageMenu", "about")
  })

  globalShortcut.register("CommandOrControl+I", () => {
    mainWindow.webContents.send("pageMenu", "setting")
  })

  globalShortcut.register("CommandOrControl+T", () => {
    mainWindow.webContents.send("pageMenu", "wilayah")
  })
})
