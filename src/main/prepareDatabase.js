"use strict"

export class PrepareDatabase {
  async createTableSetting (conn) {
    let result = await conn.schema.createTableIfNotExists(
      "setting",
      function (table) {
        table.increments()
        table.string("username")
        table.string("password")
        table.string("wilayah_id")
        table.string("event")
        table.timestamp("created_at").defaultTo(conn.fn.now())
        table.index(["wilayah_id", "event"], "index_wil")
      }
    )

    return result
  }

  async createTableTps (conn) {
    let result = await conn.schema.createTableIfNotExists(
      "tps",
      function (table) {
        table.increments()
        table.integer("tps_id")
        table.string("tps_no")
        table.integer("kabupaten_id")
        table.integer("kecamatan_id")
        table.integer("kelurahan_id")
        table.string("tipe")
        table.timestamp("created_at").defaultTo(conn.fn.now())
        table.index(
          ["kecamatan_id", "kelurahan_id", "tps_id"], "tps_id"
        )
      }
    )

    return result
  }

  async createTableWilayah (conn) {
    let result = await conn.schema.createTableIfNotExists(
      "wilayah",
      function (table) {
        table.increments()
        table.integer("wilayah_id")
        table.integer("parent")
        table.string("nama")
        table.integer("tingkat")
        table.timestamp("created_at").defaultTo(conn.fn.now())
        table.index(["wilayah_id"], "wilayah_id")
        table.index(["parent"], "parent")
      }
    )
    return result
  }
}
