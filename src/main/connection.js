"use strict"

import { app } from "electron"

const path = require("path")
const userData = app.getPath("userData")
const dbFile = path.resolve(userData, "database.sqlite")

export class Connection {
  connect () {
    var knex = require("knex")({
      client: "sqlite3",
      connection: {
        filename: dbFile
      },
      useNullAsDefault: true
    })
    return knex
  }
}
