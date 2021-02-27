<template>
  <div id="main">
    <b-button size="sm" @click="login()">{{$t('actions.save')}}</b-button>
    <b-button size="sm" @click="validate()">validate</b-button>
    <b-button size="sm" @click="download()">download</b-button>
  </div>
</template>

<script>
import {
  mapGetters
} from "vuex"
import { apiLogin, apiUrl, version, deviceId } from "../constants/config"
import axios from "axios"

const electron = require("electron")
const ipc = electron.ipcRenderer

export default {
  name: "wilayah-page",
  data () {
    return {
      title: "Main Application",
      isValidJwt: false,
      isInetOn: false,
      lastUsed: "",
      currentUser: "",
      jwt: ""
    }
  },
  computed: {
    ...mapGetters(["currentUser"])
  },
  methods: {
    async download () {
      let validate = await this.validate()
      if (validate === "INVALID") {
        await this.login()
      }

      console.log("xxx")
      this.jwt = JSON.parse(localStorage.jwt)
      this.lastUsed = localStorage.lastUsed
      let endDate = new Date()
      let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)

      // only if time is < 2 hour
      if (seconds < 7200) {
        // insert into wilayah
        axios({
          url: apiUrl,
          method: "post",
          headers: {
            "Authorization": "Bearer " + this.jwt
          },
          data: {
            query: `
                  {
                  getWilayahs {
                    wilayah_id,
                    parent,
                    nama,
                    tingkat
                  }
                }
              `
          }
        }).then((result) => {
          if (result.data.data.getWilayahs) {
            const hasil = result.data.data.getWilayahs
            ipc.send("saveWilayah", hasil)
            ipc.once("saveWilayahResult", async (event, result) => {
              console.log(result)
            })
          } else {
            console.log(result)
          }
        })

        // insert into tps
        axios({
          url: apiUrl,
          method: "post",
          headers: {
            "Authorization": "Bearer " + this.jwt
          },
          data: {
            query: `
                  {
                  getTpss {
                    tps_id,
                    tps_no,
                    kabupaten_id,
                    kecamatan_id,
                    kelurahan_id
                  }
                }
              `
          }
        }).then((result) => {
          if (result.data.data.getTpss) {
            const hasil = result.data.data.getTpss
            ipc.send("saveTps", hasil)
            ipc.once("saveTpsResult", async (event, result) => {
              console.log(result)
            })
          } else {
            console.log(result)
          }
        })
      } else {
        console.log("your jwt is more than 2 hour, expired!")
      }
    },
    async validate () {
      this.lastUsed = localStorage.lastUsed
      var endDate = new Date()
      var seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)
      if (seconds > 7200) {
        return "VALID"
      } else {
        return "INVALID"
      }
    },
    async login () {
      ipc.send("currentSetting")
      ipc.once("currentSettingResult", async (event, result) => {
        let username = result[0].username
        let password = result[0].password

        await axios({
          url: apiLogin,
          method: "post",
          data: {
            query: `
                {
                  authenticate(
                      username : "` + username + `",
                      password : "` + password + `", 
                      deviceId:"` + deviceId + `",
                      version:"` + version + `"
                      ) {
                        id,
                        portal,
                        username,
                        role,
                        phone,
                        nik,
                        email,
                        change,
                        tps_id,
                        wilayah_id,
                        domain,
                        avatar,
                        jwt,
                        countKec,
                        countKel,
                        countTps,
                        updateApp,
                        updateLink,
                        updateVersion
                    }
                }
                `
          }
        }).then((result) => {
          if (result.data.data.authenticate) {
            const userData = result.data.data.authenticate
            localStorage.setItem("currentUser", JSON.stringify(userData))
            localStorage.setItem("jwt", JSON.stringify(userData.jwt))
            localStorage.setItem("lastUsed", JSON.stringify(Date.now()))
            console.log("signed")
            return "SIGNED"
          } else {
            localStorage.removeItem("currentUser")
            return "UNSIGNED"
          }
        })
      })
    }
  },
  mounted () {
    console.log("mounted")
  }
}
</script>