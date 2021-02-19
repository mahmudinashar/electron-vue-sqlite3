"use strict"

export class PrepareDatabase {
  async createTableUser (conn) {
    let result = await conn.schema.createTableIfNotExists("User", function (table) {
      table.increments()
      table.string("FirstName")
      table.string("LastName")
      table.timestamps()
    })

    return result
  }

  async insertTableUser (conn, FirstName, LastName) {
    let result = await conn("User").insert({
      FirstName: FirstName,
      LastName: LastName
    })
    return result
  }

  async dropTableUser (conn) {
    let result = await conn("User").dropTable({})
    return result
  }
}
