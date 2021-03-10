"use strict"

import { app, BrowserWindow, ipcMain, Menu, shell } from "electron"
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

async function clearSetting(type) {
  let knex = con.connect()
  let data = {}
  if (type === "k1") {
    data = { k1: false }
  } else if (type === "k2") {
    data = { k2: false }
  } else if (type === "k3") {
    data = { k3: false }
  } else {
    data = { k1: false, k2: false, k3: false }
  }

  await knex("setting")
    .where("id", 1)
    .update(data)
  knex.destroy()
}

async function setSetting(type) {
  let knex = con.connect()
  let data = {}
  if (type === "k1") {
    data = { k1: true }
  } else if (type === "k2") {
    data = { k2: true }
  } else if (type === "k3") {
    data = { k3: true }
  } else {
    data = { k1: true, k2: true, k3: true }
  }

  await knex("setting")
    .where("id", 1)
    .update(data)
  knex.destroy()
}

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
  clearSetting()
  mainWindow = new BrowserWindow({
    height: 870,
    useContentSize: true,
    width: 1700,
    minWidth: 1700,
    minHeight: 870,
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
  ipcMain.on("analisisK1", async (event, data) => {
    setSetting("k1")
    let knex = con.connect()
    let rows = await knex
      .from("pemilih")
      .select("id", "dp_id", "nik", "nkk", "nama")
      .whereRaw("k1=0 AND k2=0 AND k3=0")
      .count("id as count")
      .groupBy("nik", "nkk", "nama")
      .having("count", ">", 1)

    const promises = rows.map(async (data) => {
      await knex("pemilih")
        .update({ k1: data.dp_id })
        .whereRaw("nik=" + data.nik + " AND nkk = " + data.nkk + " AND nama = '" + data.nama + "' AND k1=0 AND k2=0 AND k3=0")
    })

    await Promise.all(promises)
    clearSetting("k1")
    knex.destroy()
    mainWindow.webContents.send("analisisK1Result", rows.length + " data found duplicateds (K1)")
  })

  ipcMain.on("analisisK2", async (event, data) => {
    setSetting("k2")
    let knex = con.connect()
    let rows = await knex
      .from("pemilih")
      .select("id", "dp_id", "nik", "nkk", "nama")
      .whereRaw("k1=0 AND k2=0 AND k3=0")
      .count("id as count")
      .groupBy("nik", "nama")
      .having("count", ">", 1)

    const promises = rows.map(async (data) => {
      await knex("pemilih")
        .update({ k2: data.dp_id })
        .whereRaw("nik=" + data.nik + " AND nama = '" + data.nama + "' AND k1=0 AND k2=0 AND k3=0")
    })

    await Promise.all(promises)
    clearSetting("k2")
    knex.destroy()
    mainWindow.webContents.send("analisisK2Result", rows.length + " data found duplicateds (K2)")
  })

  ipcMain.on("analisisK3", async (event, data) => {
    setSetting("k3")
    let knex = con.connect()
    let rows = await knex
      .from("pemilih")
      .select("id", "dp_id", "nik", "nkk", "nama")
      .whereRaw("k1=0 AND k2=0 AND k3=0")
      .count("id as count")
      .groupBy("nik")
      .having("count", ">", 1)

    const promises = rows.map(async (data) => {
      await knex("pemilih")
        .update({ k3: data.dp_id })
        .whereRaw("nik=" + data.nik + " AND k1=0 AND k2=0 AND k3=0")
    })

    await Promise.all(promises)
    clearSetting("k3")
    knex.destroy()
    mainWindow.webContents.send("analisisK3Result", rows.length + " data found duplicateds (K3)")
  })

  ipcMain.on("getWilayah", (event, data) => {
    let knex = con.connect()
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
      .finally(() => {
        knex.destroy()
      })
  })

  ipcMain.on("getWilayahChild", async (event, data) => {
    let knex = con.connect()
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
      let wherePemilih = {}
      if (data.tingkat === 2) {
        where = { kabupaten_id: data.wilayah_id }
      }
      if (data.tingkat === 3) {
        where = { kecamatan_id: data.wilayah_id }
        wherePemilih = { kec_id: data.wilayah_id }
      }
      if (data.tingkat === 4) {
        where = { kelurahan_id: data.wilayah_id }
        wherePemilih = { kel_id: data.wilayah_id }
      }

      let hasil = await knex("tps")
        .count("id", { as: "count" })
        .where(where)

      let hasilPemilih = await knex("pemilih")
        .count("id", { as: "count" })
        .where(wherePemilih)

      container["countTps"] = hasil[0].count
      container["countPemilih"] = hasilPemilih[0].count
      result.push(container)
    })

    await Promise.all(promises)
    knex.destroy()
    mainWindow.webContents.send("getWilayahChildResult", result)
  })

  ipcMain.on("getPemilihForSync", async (event, data) => {
    let knex = con.connect()
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
        mainWindow.webContents.send("getPemilihForSyncResult", rows)
      })
      .limit(limit)
      .catch((err) => {
        mainWindow.webContents.send("getPemilihForSyncResult", err)
      })
      .finally(() => {
        knex.destroy()
      })
  })

  ipcMain.on("getTpsChild", async (event, data) => {
    let knex = con.connect()
    var result = []
    var rows = []

    rows = await knex
      .from("tps")
      .select("*")
      .where(data)

    const promises = rows.map(async (data) => {
      const container = {}
      container["tps_id"] = data.tps_id
      container["wilayah_id"] = data.tps_id
      container["nama"] = data.tps_no
      container["tps_no"] = data.tps_no
      container["tingkat"] = 5
      container["parent"] = data.kelurahan_id

      let wherePemilih = { tps_id: data.tps_id }

      let hasilPemilih = await knex("pemilih")
        .count("id", { as: "count" })
        .where(wherePemilih)

      container["countPemilih"] = hasilPemilih[0].count
      result.push(container)
    })

    await Promise.all(promises)

    knex.destroy()
    mainWindow.webContents.send("getTpsChildResult", result)

    // knex
    //   .from("tps")
    //   .select("*")
    //   .where(data)
    //   .then((rows) => {
    //     mainWindow.webContents.send("getTpsChildResult", rows)
    //   })
    //   .catch((err) => {
    //     mainWindow.webContents.send("getTpsChildResult", err)
    //   })
    //   .finally(() => {
    //     knex.destroy()
    //   })
  })

  ipcMain.on("getTpsCount", (event, data) => {
    let knex = con.connect()
    knex("tps")
      .count("id", { as: "count" })
      .where(data)
      .then((rows) => {
        mainWindow.webContents.send("getTpsCountResult", rows[0])
      })
      .catch((err) => {
        mainWindow.webContents.send("getTpsCountResult", err)
      })
      .finally(() => {
        knex.destroy()
      })
  })

  ipcMain.on("saveSetting", async (event, data) => {
    let knex = con.connect()

    await knex("setting").truncate()
    knex("setting")
      .insert(data)
      .then((rows) => {
        mainWindow.webContents.send("saveSettingResult", "data setting has been saved to database!")
      })
      .catch((err) => {
        mainWindow.webContents.send("saveSettingResult", err)
      })
      .finally(() => {
        knex.destroy()
      })
  })

  ipcMain.on("deletePemilih", async (event, data) => {
    let knex = con.connect()
    let rows = await knex("pemilih")
      .where(data)
      .del()

    knex.destroy()
    mainWindow.webContents.send("deletePemilihResult", rows + " record deleted")
  })

  ipcMain.on("deletePemilihByTerm", async (event, data) => {
    let knex = con.connect()
    let rows = await knex("pemilih")
      .whereNull("dp_id")
      .whereIn("id", data)
      .del()

    knex.destroy()
    mainWindow.webContents.send("deletePemilihByTermResult", rows)
  })

  ipcMain.on("updatePemilihByTermPerItem", async (event, data) => {
    let knex = con.connect()

    const promises = data.map(async (data) => {
      let id = data.id
      data.synced = false
      delete data.id

      await knex("pemilih")
        .where("id", id)
        .update(data)
    })

    await Promise.all(promises)

    knex.destroy()
    mainWindow.webContents.send("updatePemilihByTermPerItemResult", data.length + " updated")
  })

  ipcMain.on("updatePemilihByTerm", async (event, data) => {
    let knex = con.connect()
    let id = data.id
    delete data.id

    let rows = await knex("pemilih")
      .whereIn("id", id)
      .update(data.term)

    knex.destroy()
    mainWindow.webContents.send("updatePemilihByTermResult", rows)
  })

  ipcMain.on("updatePemilihById", async (event, data) => {
    let knex = con.connect()
    let id = data.id
    delete data.id
    delete data.dp_id
    delete data.k1
    delete data.k2
    delete data.k3

    let rows = await knex("pemilih")
      .where("id", id)
      .update(data)

    knex.destroy()
    mainWindow.webContents.send("updatePemilihByIdResult", rows)
  })

  ipcMain.on("getPemilihById", async (event, data) => {
    let knex = con.connect()
    delete data.sortBy
    delete data.term
    delete data.sortDirection
    delete data.limit
    delete data.offset

    let rows = await knex
      .from("pemilih")
      .select("*")
      .where(data)

    knex.destroy()
    mainWindow.webContents.send("getPemilihByIdResult", rows)
  })

  ipcMain.on("getPemilihCsv", async (event, data) => {
    let knex = con.connect()
    let sortBy = ""
    if (data.sortBy && data.sortBy !== "id") {
      sortBy = data.sortBy
    } else {
      sortBy = "dp_id"
    }
    let sortDirection = data.sortDirection
    let where = ""
    let inc = 1
    let rows = []
    let term = data.term

    delete data.term
    delete data.sortBy
    delete data.sortDirection
    delete data.limit
    delete data.offset

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

      if (data.ganda) {
        if (inc === 1) {
          where = where + "(k1!=0 OR k2!=0 OR k3!=0)"
        } else {
          where = where + "AND (k1!=0 OR k2!=0 OR k3!=0)"
        }
        delete data.ganda
        inc++
      }

      rows = await knex
        .from("pemilih")
        .select("*")
        .where(data)
        .whereRaw(where)
        .orderBy(sortBy, sortDirection)
    } else {
      rows = await knex
        .from("pemilih")
        .select("*")
        .where(data)
        .whereRaw(where)
        .orderBy(sortBy, sortDirection)
    }

    knex.destroy()
    mainWindow.webContents.send("getPemilihCsvResult", rows)
  })

  ipcMain.on("getPemilih", async (event, data) => {
    let knex = con.connect()
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

      if (data.ganda) {
        if (inc === 1) {
          where = where + "(k1!=0 OR k2!=0 OR k3!=0)"
        } else {
          where = where + "AND (k1!=0 OR k2!=0 OR k3!=0)"
        }
        delete data.ganda
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

    knex.destroy()
    mainWindow.webContents.send("getPemilihResult", rows)
  })

  ipcMain.on("getPemilihCount", async (event, data) => {
    let knex = con.connect()
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
      if (data.ganda) {
        if (inc === 1) {
          where = where + "(k1!=0 AND k2!=0 AND k3!=0)"
        } else {
          where = where + "AND (k1!=0 AND k2!=0 AND k3!=0)"
        }
        delete data.ganda
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
    knex.destroy()
  })

  ipcMain.on("savePemilihWebgrid", async (event, data) => {
    let knex = con.connect()
    let result = {}
    result.countSuccess = 0
    result.countError = 0

    let itemError = []
    let itemSuccess = []

    let listTps = await knex
      .from("tps")
      .select("tps_no", "tps_id")
      .where({ kelurahan_id: data[0].kel_id })

    let savetps = []
    let savetpsID = []
    listTps.map(async (listTps) => {
      let container = {}
      container[listTps.tps_no] = listTps.tps_id
      savetps.push(listTps.tps_no)
      savetpsID.push(container)
    })

    const promises = data.map(async (data) => {
      let tps = data.tps.toString()
      if (tps.length === 1) {
        tps = "00" + tps
      } else {
        tps = "0" + tps
      }

      let tpsId = savetps.includes(tps)
      if (tpsId) {
        data.tps_id = savetpsID[0][tps]

        if (data.dp_id) {
          // bila memiliki dp_id maka update
          let checkGandaNik = await knex
            .from("pemilih")
            .select("id")
            .whereRaw("nik=" + data.nik + " AND dp_id!=" + data.dp_id)

          if (checkGandaNik.length > 0) {
            result.countError = result.countError + 1
            data.status = "Err : Duplicated NIK"
            itemError.push(data)
          } else {
            try {
              let update = await knex("pemilih")
                .whereIn("dp_id", data.id)
                .update(data)

              if (update) {
                result.countSuccess = result.countSuccess + 1
                itemSuccess.push(data)
              } else {
                data.status = "Err : unknown error when update database"
                result.countError = result.countError + 1
                itemError.push(data)
              }
            } catch (err) {
              result.countError = result.countError + 1
              data.status = "Err : dpid not exist"
              itemError.push(data)
            }
          }
        } else {
          // data fresh
          let checkGandaNik = await knex
            .from("pemilih")
            .select("id")
            .where({ nik: data.nik })

          if (checkGandaNik.length > 0) {
            result.countError = result.countError + 1
            data.status = "Err : Duplicated NIK"
            itemError.push(data)
          } else {
            let insert = await knex("pemilih").insert(data)
            if (insert) {
              result.countSuccess = result.countSuccess + 1
              itemSuccess.push(data)
            } else {
              data.status = "Err : unknown error when write database"
              result.countError = result.countError + 1
              itemError.push(data)
            }
          }
        }
      } else {
        // jika tps tidak terdaftar
        data.status = "Err : tps is not listed"
        result.countError = result.countError + 1
        itemError.push(data)
      }
    })

    await Promise.all(promises)
    result.itemError = itemError
    result.itemSuccess = itemSuccess

    knex.destroy()
    mainWindow.webContents.send("savePemilihWebgridResult", result)
  })

  ipcMain.on("savePemilih", (event, data) => {
    let knex = con.connect()
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
          .finally(() => {
            knex.destroy()
          })
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
        .finally(() => {
          knex.destroy()
        })
    }
  })

  ipcMain.on("saveWilayah", async (event, data) => {
    let knex = con.connect()
    await knex("wilayah").truncate()

    await knex("wilayah").insert(data)
    knex.destroy()
  })

  ipcMain.on("saveTps", async (event, data) => {
    let knex = con.connect()
    await knex("tps").truncate()

    var i
    var j
    var resArray = []
    var chunk = 200
    for (i = 0, j = data.length; i < j; i += chunk) {
      resArray.push(data.slice(i, i + chunk))
    }

    var numChunk = Math.ceil(data.length / chunk)
    for (i = 0, j = numChunk; i < j; i++) {
      await knex("tps").insert(resArray[i])
    }
    knex.destroy()
    mainWindow.webContents.send("saveTpsResult", data.length + " record inserted")
  })

  ipcMain.on("currentSetting", (event, data) => {
    let knex = con.connect()
    knex
      .from("setting")
      .select("*")
      .where("id", 1)
      .then((rows) => {
        mainWindow.webContents.send("currentSettingResult", rows)
      })
      .catch((err) => {
        mainWindow.webContents.send("currentSettingResult", err)
      })
      .finally(() => {
        knex.destroy()
      })
  })
  // +++++++++++++++++++++

  mainWindow.on("closed", () => {
    mainWindow = null
    clearSetting()
    knex.destroy()
  })

  let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Sign In",
          click() {
            mainWindow.webContents.send("pageMenu", "setting")
          }
        },
        {
          label: "Home",
          click() {
            mainWindow.webContents.send("pageMenu", "home")
          }
        },
        {
          label: "Pemutakhiran Data",
          click() {
            mainWindow.webContents.send("pageMenu", "coklit")
          }
        },
        {
          label: "Import Webgrid",
          click() {
            mainWindow.webContents.send("pageMenu", "import")
          }
        },
        {
          label: "Rekapitulasi",
          click() {
            mainWindow.webContents.send("pageMenu", "rekapitulasi")
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
          label: "Lindungi Hak Pilihmu",
          click() {
            shell.openExternal("https://lindungihakpilihmu.kpu.go.id/")
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
  clearSetting()
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})
