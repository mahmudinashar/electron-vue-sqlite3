"use strict"

import { app, BrowserWindow, ipcMain, Menu, shell, globalShortcut } from "electron"
import { Connection } from "./connection"
import { PrepareDatabase } from "./prepareDatabase"

// database and schema
let con = new Connection()
let prepare = new PrepareDatabase()
let knex = con.connect()
knex.schema.hasTable("setting").then(function(exists) {
  if (!exists) {
    prepare.createTableSetting(knex)
    prepare.createTableWilayah(knex)
    prepare.createTableTps(knex)
    prepare.createTablePemilih(knex)
  }
})

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\")
} else {
  let contextMenu = require("electron-context-menu")
  contextMenu({
    prepend: (defaultActions, params, browserWindow) => []
  })
}

let mainWindow
const winURL = process.env.NODE_ENV === "development" ? "http://localhost:9080" : `file://${__dirname}/index.html`

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 870,
    useContentSize: true,
    width: 1500,
    minWidth: 1024,
    minHeight: 750,
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
  ipcMain.on("getWilayah", (event, data) => {
    knex
      .from("wilayah")
      .select("*")
      .where("wilayah_id", data)
      .then((rows) => {
        mainWindow.webContents.send("getWilayahResult", rows[0])
      })
      .catch((err) => {
        mainWindow.webContents.send("getWilayahResult", err)
      })
      .finally(() => {})
  })

  ipcMain.on("getWilayahChild", async (event, data) => {
    var result = []
    var rows = []
    rows = await knex
      .from("wilayah")
      .select("*")
      .where("parent", data)
    const promises = rows.map(async (data) => {
      const container = {}
      container["wilayah_id"] = data.wilayah_id
      container["nama"] = data.nama
      container["tingkat"] = data.tingkat
      container["parent"] = data.parent

      let where = {}
      if (data.tingkat === 2) {
        where = { kabupaten_id: data.wilayah_id }
      }
      if (data.tingkat === 3) {
        where = { kecamatan_id: data.wilayah_id }
      }
      if (data.tingkat === 4) {
        where = { kelurahan_id: data.wilayah_id }
      }

      let hasil = await knex("tps")
        .count("id", { as: "count" })
        .where(where)

      container["countTps"] = hasil[0].count
      result.push(container)
    })

    await Promise.all(promises)
    mainWindow.webContents.send("getWilayahChildResult", result)
  })

  ipcMain.on("getPemilihForSync", async (event, data) => {
    console.log("ssss")
    let limit = data.limit
    delete data.term
    delete data.sortBy
    delete data.sortDirection
    delete data.offset
    delete data.limit

    knex
      .from("pemilih")
      .select("id as local_id", "dp_id as dpid", "sync_id", "kec_id", "kel_id", "tps_id", "nik", "nkk", "nama", "jenis_kelamin", "tanggal_lahir", "tempat_lahir", "kawin", "alamat", "rw", "rt", "dusun", "status", "saringan_id", "sumberdata", "tps")
      .where(data)
      .then((rows) => {
        console.log(rows)
        mainWindow.webContents.send("getPemilihForSyncResult", rows)
      })
      .limit(limit)
      .catch((err) => {
        console.log(err)
        mainWindow.webContents.send("getPemilihForSyncResult", err)
      })
      .finally(() => {})
  })

  ipcMain.on("getTpsChild", (event, data) => {
    knex
      .from("tps")
      .select("*")
      .where(data)
      .then((rows) => {
        mainWindow.webContents.send("getTpsChildResult", rows)
      })
      .catch((err) => {
        mainWindow.webContents.send("getTpsChildResult", err)
      })
      .finally(() => {})
  })

  ipcMain.on("getTpsCount", (event, data) => {
    knex("tps")
      .count("id", { as: "count" })
      .where(data)
      .then((rows) => {
        mainWindow.webContents.send("getTpsCountResult", rows[0])
      })
      .catch((err) => {
        mainWindow.webContents.send("getTpsCountResult", err)
      })
      .finally(() => {})
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
      .then(mainWindow.webContents.send("saveSettingResult", "data setting has been saved to database!"))
      .catch((err) => {
        mainWindow.webContents.send("saveSettingResult", err)
      })
  })

  ipcMain.on("deletePemilih", async (event, data) => {
    let rows = await knex("pemilih")
      .where(data)
      .del()
    mainWindow.webContents.send("deletePemilihResult", rows + " record deleted")
  })

  ipcMain.on("updatePemilihByTerm", async (event, data) => {
    let id = data.id
    delete data.id

    let rows = await knex("pemilih")
      .whereIn("id", id)
      .update(data.term)
    mainWindow.webContents.send("updatePemilihByTermResult", rows)
  })

  ipcMain.on("updatePemilihById", async (event, data) => {
    let id = data.id
    delete data.id
    delete data.dp_id
    delete data.k1
    delete data.k2
    delete data.k3

    let rows = await knex("pemilih")
      .where("id", id)
      .update(data)
    mainWindow.webContents.send("updatePemilihByIdResult", rows)
  })

  ipcMain.on("getPemilihById", async (event, data) => {
    delete data.sortBy
    delete data.sortDirection
    delete data.limit
    delete data.offset

    let rows = await knex
      .from("pemilih")
      .select("*")
      .where(data)
    mainWindow.webContents.send("getPemilihByIdResult", rows)
  })

  ipcMain.on("getPemilih", async (event, data) => {
    console.log(data)
    let term = data.term
    let limit = data.limit
    let offset = data.offset
    let sortBy = ""
    if (data.sortBy && data.sortBy !== "id") {
      sortBy = data.sortBy
    } else {
      sortBy = "dp_id"
    }
    let sortDirection = data.sortDirection

    delete data.term
    delete data.sortBy
    delete data.sortDirection
    delete data.limit
    delete data.offset

    if (isNaN(offset)) {
      offset = 0
    }

    if (isNaN(limit)) {
      offset = 200
    }
    let where = ""
    let inc = 1
    let rows = []
    if (term === "filterSearch") {
      if (data.nama) {
        if (inc === 1) {
          where = where + "nama like '%" + data.nama + "%'"
        } else {
          where = where + "AND nama like '%" + data.nama + "%'"
        }
        delete data.nama
        inc++
      }

      if (data.nik) {
        if (inc === 1) {
          where = where + "nik like '%" + data.nik + "%'"
        } else {
          where = where + "AND nik like '%" + data.nik + "%'"
        }
        delete data.nik
        inc++
      }

      if (data.nkk) {
        if (inc === 1) {
          where = where + "nkk like '%" + data.nkk + "%'"
        } else {
          where = where + "AND nkk like '%" + data.nkk + "%'"
        }
        delete data.nkk
        inc++
      }

      if (data.alamat) {
        if (inc === 1) {
          where = where + "alamat like '%" + data.alamat + "%'"
        } else {
          where = where + "AND alamat like '%" + data.alamat + "%'"
        }
        delete data.alamat
        inc++
      }

      rows = await knex
        .from("pemilih")
        .select("*")
        .where(data)
        .whereRaw(where)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
    } else {
      rows = await knex
        .from("pemilih")
        .select("*")
        .where(data)
        .orderBy(sortBy, sortDirection)
        .limit(limit)
        .offset(offset)
    }
    mainWindow.webContents.send("getPemilihResult", rows)
  })

  ipcMain.on("getPemilihCount", async (event, data) => {
    let term = data.term
    delete data.term
    delete data.sortBy
    delete data.sortDirection
    delete data.limit
    delete data.offset

    let where = ""
    let inc = 1
    let rows = []
    if (term === "filterSearch") {
      if (data.nama) {
        if (inc === 1) {
          where = where + "nama like '%" + data.nama + "%'"
        } else {
          where = where + "AND nama like '%" + data.nama + "%'"
        }
        delete data.nama
        inc++
      }

      if (data.nik) {
        if (inc === 1) {
          where = where + "nik like '%" + data.nik + "%'"
        } else {
          where = where + "AND nik like '%" + data.nik + "%'"
        }
        delete data.nik
        inc++
      }

      if (data.nkk) {
        if (inc === 1) {
          where = where + "nkk like '%" + data.nkk + "%'"
        } else {
          where = where + "AND nkk like '%" + data.nkk + "%'"
        }
        delete data.nkk
        inc++
      }

      if (data.alamat) {
        if (inc === 1) {
          where = where + "alamat like '%" + data.alamat + "%'"
        } else {
          where = where + "AND alamat like '%" + data.alamat + "%'"
        }
        delete data.alamat
        inc++
      }
      rows = await knex
        .from("pemilih")
        .count("id", { as: "count" })
        .where(data)
        .whereRaw(where)
      mainWindow.webContents.send("getPemilihCountResult", rows[0])
    } else {
      rows = await knex
        .from("pemilih")
        .count("id", { as: "count" })
        .where(data)
      mainWindow.webContents.send("getPemilihCountResult", rows[0])
    }
  })

  ipcMain.on("savePemilih", (event, data) => {
    // console.log(data)
    delete data.term

    if (data.length > 199) {
      var i
      var j
      var resArray = []
      var chunk = 200
      for (i = 0, j = data.length; i < j; i += chunk) {
        resArray.push(data.slice(i, i + chunk))
      }

      var numChunk = Math.ceil(data.length / chunk)
      for (i = 0, j = numChunk; i < j; i++) {
        knex("pemilih")
          .insert(resArray[i])
          .then()
          .catch((err) => {
            mainWindow.webContents.send("savePemilihResult", err)
          })
          .finally(() => {})
      }
      mainWindow.webContents.send("savePemilihResult", data.length + " record inserted")
    } else {
      knex("pemilih")
        .insert(data)
        .then((wyz) => {
          mainWindow.webContents.send("savePemilihResult", "1 record inserted")
        })
        .catch((err) => {
          mainWindow.webContents.send("savePemilihResult", err)
        })
        .finally(() => {})
    }
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
        mainWindow.webContents.send("saveWilayahResult", rows + " record inserted")
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
    mainWindow.webContents.send("saveTpsResult", data.length + " record inserted")
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
      .finally(() => {})
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
          label: "Inisialisasi Project",
          accelerator: "Ctrl+I",
          click() {
            mainWindow.webContents.send("pageMenu", "setting")
          }
        },
        {
          label: "Pemutakhiran Data Pemilih",
          accelerator: "Ctrl+P",
          click() {
            mainWindow.webContents.send("pageMenu", "coklit")
          }
        },
        {
          label: "Data Wilayah",
          accelerator: "Ctrl+T",
          click() {
            mainWindow.webContents.send("pageMenu", "wilayah")
          }
        },
        {
          label: "Tentang",
          accelerator: "Ctrl+B",
          click() {
            mainWindow.webContents.send("pageMenu", "about")
          }
        },
        {
          type: "separator"
        },
        {
          label: "Keluar",
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
          label: "Dokumentasi",
          click() {
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
    mainWindow.webContents.send("pageMenu", "coklit")
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
