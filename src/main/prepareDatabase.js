"use strict"

export class PrepareDatabase {
  async createTableSetting(conn) {
    let result = await conn.schema.createTableIfNotExists("setting", function(table) {
      table.increments()
      table.string("username")
      table.string("password")
      table.string("wilayah_id")
      table.string("event")
      table.timestamp("created_at").defaultTo(conn.fn.now())
      table.index(["wilayah_id", "event"], "index_wil")
    })

    return result
  }

  async createTableTps(conn) {
    let result = await conn.schema.createTableIfNotExists("tps", function(table) {
      table.increments()
      table.integer("tps_id")
      table.string("tps_no")
      table.integer("kabupaten_id")
      table.integer("kecamatan_id")
      table.integer("kelurahan_id")
      table.string("tipe")
      table.timestamp("created_at").defaultTo(conn.fn.now())
      table.index(["kecamatan_id", "kelurahan_id", "tps_id"], "tps_id")
    })

    return result
  }

  async createTablePemilih(conn) {
    let result = await conn.schema.createTableIfNotExists("pemilih", function(table) {
      table.increments()
      table.integer("dp_id")
      table.integer("arsip_id")
      table.boolean("synced").defaultTo(false)
      table.boolean("invalid").defaultTo(false)
      table.integer("sync_id")
      table.integer("master_id")
      table.string("nik")
      table.string("nkk")
      table.string("no_ktp")
      table.integer("kec_id")
      table.integer("kel_id")
      table.string("nama")
      table.enu("jenis_kelamin", ["L", "P", "l", "p"])
      table.date("tanggal_lahir")
      table.string("tempat_lahir")
      table.enu("kawin", ["B", "S", "P", "b", "s", "p"])
      table.string("alamat")
      table.string("rw")
      table.string("rt")
      table.string("dusun")
      table.integer("k1")
      table.integer("k2")
      table.integer("k3")
      table.string("sumberdata")
      table.enu("status", ["aktif", "tms", "baru", "mdp", "pindah"])
      table.integer("tps")
      table.integer("tps_id")
      table.integer("saringan_id")
      table.enu("difabel", ["0", "1", "2", "3", "4", "5"])
      table.enu("ektp", ["ektp", "nonektp", "b", "k", "s"])
      table.string("keterangan")
      table.timestamp("updated_at").defaultTo(conn.fn.now())
      table.index(["synced"], "index_synced")
      table.index(["dp_id", "kec_id"], "index_dp_id")
      table.index(["kec_id", "kel_id", "tps_id"], "index_rekap_wilayah")
      table.index(["kec_id", "kel_id", "tps_id", "difabel"], "index_difabel")
      table.index(["kec_id", "kel_id", "tps_id", "saringan_id"], "index_saringan_id")
      table.index(["kec_id", "kel_id", "tps_id", "jenis_kelamin"], "index_jenis_kelamin")
    })

    return result
  }

  async createTableWilayah(conn) {
    let result = await conn.schema.createTableIfNotExists("wilayah", function(table) {
      table.increments()
      table.integer("wilayah_id")
      table.integer("parent")
      table.string("nama")
      table.integer("tingkat")
      table.timestamp("created_at").defaultTo(conn.fn.now())
      table.index(["wilayah_id"], "wilayah_id")
      table.index(["parent"], "parent")
    })
    return result
  }
}
