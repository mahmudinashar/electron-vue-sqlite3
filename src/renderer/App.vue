<template>
  <div id="app">
    <vue-topprogress ref="topProgress" color="#ed7117"></vue-topprogress>

    <b-modal size="lg" id="modalsetting" ref="modalsetting" dismiss="modal">
      <template slot="modal-header">
        <h5 class="modal-title">{{ $t("titles.signin") }}</h5>
      </template>
      <b-container class="bv-example-row">
        <b-row>
          <b-col cols="12">
            <b-form-group label="Username" class="has-top-label">
              <b-form-input style="font-size:14px;" v-model="username" type="text" />
            </b-form-group>
          </b-col>

          <b-col cols="12">
            <b-form-group label="Password" class="has-top-label">
              <b-form-input style="font-size:14px;" v-model="password" type="password" />
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>

      <template slot="modal-footer">
        <div style="position:absolute;left:35px;bottom:35px;font-size:11px">
          <b>Keterangan :</b><br />
          - Sign In hanya dilakukan sekali, seterusnya sistem telah menyimpan username dan password kamu.<br />
          - Proses ini membutuhkan <b>koneksi internet</b> untuk memindahkan database wilayah ke lokal.<br />
        </div>
        <b-button size="sm" @click="saveSetting()">{{ $t("actions.save") }}</b-button>
        <b-button size="sm" variant="secondary" @click="hideModal('modalsetting')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <app-header></app-header>
    <router-view />
    <app-footer></app-footer>
  </div>
</template>

<script>
import axios from "axios"
import AppFooter from "./components/Common/AppFooter"
import AppHeader from "./components/Common/AppHeader"
import { vueTopprogress } from "vue-top-progress"
import { apiLogin, apiUrl, version, deviceId } from "./constants/config"

const electron = require("electron")
const ipc = electron.ipcRenderer

export default {
  name: "Electron-Vue-Sqlite3",
  components: {
    AppFooter,
    vueTopprogress,
    AppHeader
  },
  data() {
    return {
      title: "Main Application",
      syncHistoryReady: false,
      username: "",
      password: "",
      isValidJwt: false,
      isInetOn: false,
      lastUsed: "",
      jwt: ""
    }
  },

  methods: {
    hideModal(refname) {
      this.$refs[refname].hide()
    },

    async saveSetting() {
      localStorage.setItem("username", JSON.stringify(this.username))
      localStorage.setItem("password", JSON.stringify(this.password))
      localStorage.removeItem("lastUsed")
      localStorage.removeItem("wilayah_id")
      localStorage.removeItem("jwt")
      this.download()
    },

    async download() {
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })

      this.$refs.topProgress.start()
      let validate = await this.validate()
      this.jwt = JSON.parse(localStorage.jwt)
      this.lastUsed = localStorage.lastUsed
      let endDate = new Date()
      let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)

      // only valid your internet connection and jwt
      if (validate === "VALID") {
        // only if time is < 2 hour
        if (seconds < 7200) {
          // insert into wilayah
          axios({
            url: apiUrl,
            method: "post",
            headers: {
              Authorization: "Bearer " + this.jwt
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
                this.$toast.error(result, {
                  position: "bottom-right",
                  duration: 3000
                })
              })
            } else {
              this.$toast.error(result, {
                position: "bottom-right",
                duration: 3000
              })
            }
          })

          // insert into tps
          axios({
            url: apiUrl,
            method: "post",
            headers: {
              Authorization: "Bearer " + this.jwt
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
                // this.$toast.error(result, {
                //   position: "bottom-right",
                //   duration: 3000
                // })
              })
            } else {
              // this.$toast.error(result, {
              //   position: "bottom-right",
              //   duration: 3000
              // })
            }
          })

          // all job done
          this.$toast.clear()
          this.$refs.topProgress.done()
          this.$refs["modalsetting"].hide()
          this.$router.push({ name: "home-page" }).catch((err) => {
            console.log(err.length)
          })
        } else {
          this.$toast.error("Ops, Session login anda telah selesai!", {
            position: "bottom-right",
            duration: 3000
          })
        }
      }
    },
    async isOnline() {
      if (navigator.onLine) {
        return "TRUE"
      } else {
        this.$toast.error("Ops, anda berada diluar jaringan (Offline)", {
          position: "bottom-right",
          duration: 3000
        })
        return "FALSE"
      }
    },
    async validate() {
      this.lastUsed = localStorage.lastUsed
      let isOnline = await this.isOnline()
      if (isOnline === "TRUE") {
        let endDate = new Date()
        let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)
        if (seconds < 7200) {
          return "VALID"
        } else {
          await this.login()
          return "VALID"
        }
      } else {
        return "INVALID"
      }
    },
    async login() {
      let username = this.username
      let password = this.password

      await axios({
        url: apiLogin,
        method: "post",
        data: {
          query:
            `
                {
                  authenticate(
                      username : "` +
            username +
            `",
                      password : "` +
            password +
            `",
                      deviceId:"` +
            deviceId +
            `",
                      version:"` +
            version +
            `"
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
          localStorage.setItem("wilayah_id", JSON.stringify(userData.wilayah_id))

          ipc.send("saveSetting", { username: this.username, password: this.password, wilayah_id: userData.wilayah_id, countKec: userData.countKec, countKel: userData.countKel, countTps: userData.countTps, role: userData.role })
        } else {
          this.$toast.error("Ops, Kamu gagal sign in pastikan internet kamu baik!", {
            position: "bottom-right",
            duration: 4000
          })

          localStorage.removeItem("currentUser")
        }
      })
    }
  },

  mounted() {
    localStorage.removeItem("selectedKecamatan")
    localStorage.removeItem("selectedKelurahan")
    ipc.on("pageMenu", (event, page) => {
      if (page === "home") {
        this.$router.push({ name: "home-page" }).catch((err) => {
          console.log(err.length)
        })
      }
      if (page === "coklit") {
        this.$router.push({ name: "coklit-page" }).catch((err) => {
          console.log(err.length)
        })
      }
      if (page === "setting") {
        this.$refs["modalsetting"].show()
      }
      if (page === "rekapitulasi") {
        this.$router.push({ name: "rekapitulasi-page" }).catch((err) => {
          console.log(err.length)
        })
      }
      if (page === "import") {
        this.$router.push({ name: "import-page" }).catch((err) => {
          console.log(err.length)
        })
      }
    })

    ipc.send("currentSetting")
    ipc.once("currentSettingResult", async (event, result) => {
      if (result.length === 0) {
        this.$refs["modalsetting"].show()
      } else {
        let username = result[0].username
        let password = result[0].password
        let wilayahId = result[0].wilayah_id
        this.username = username
        this.password = password

        localStorage.setItem("username", JSON.stringify(username))
        localStorage.setItem("password", JSON.stringify(password))
        localStorage.setItem("wilayah_id", JSON.stringify(wilayahId))
        localStorage.setItem("currentUser", JSON.stringify(result[0]))
        this.$router.push({ name: "home-page" }).catch((err) => {
          console.log(err.length)
        })
      }
    })
  }
}
</script>
