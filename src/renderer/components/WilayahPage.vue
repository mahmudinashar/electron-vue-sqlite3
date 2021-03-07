<template>
  <div>
    <div id="header">
      <b-button size="sm" @click="routeTo('coklit-page')"><span class="simple-icon-crop" style="margin-right:10px;margin-left:-2px"></span>{{ $t("actions.coklit") }}</b-button>
      <div style="float : right">
        <b-button class="inactive-botton" size="sm" @click="routeTo('wilayah-page')"><span class="simple-icon-organization" style="color:#FFFFFF;"></span></b-button>
      </div>
    </div>
    <div id="main">
      <b-row>
        <b-colxx xl="12" lg="12" md="12">
          <b-table striped :items="data" :fields="fieldsTable" responsive="xl" v-if="dataReady" thead-class="hidden_header">
            <template v-slot:cell(Wilayah)="data">
              <div v-if="data.value.nama === 'parent'" style="font-weight:bold;font-size: 25px !important;margin-top: -7px;margin-bottom: -7px;">
                <b
                  ><a style="color:#000000 !important" v-on:click="getWilayah(data.value.wilayah_id, data.value.nama)" :href="`#` + data.value.wilayah_id">{{ currentWil.nama }}</a></b
                >
              </div>
              <div v-if="data.value.nama != 'parent'">
                <div v-if="data.value.nama === 'TOTAL'">
                  <b style="margin-left:10px;color:#444 !important">TOTAL </b>
                </div>

                <div v-if="data.value.nama != 'TOTAL'">
                  <div v-if="data.item.Tingkat == 4">
                    <a style="margin-left:20px;color:#444 !important" v-on:click="getTps(data.value.wilayah_id, data.value.nama)" :href="`#` + data.value.wilayah_id">{{ data.value.nama }}</a>
                  </div>
                  <div v-else-if="data.item.Tingkat == 5">
                    <div style="margin-left:20px;color:#444 !important">
                      TPS <b>{{ data.value.nama }}</b>
                    </div>
                  </div>
                  <div v-else>
                    <a style="margin-left:20px;color:#444 !important" v-on:click="getWilayah(data.value.wilayah_id, data.value.nama)" :href="`#` + data.value.wilayah_id">{{ data.value.nama }}</a>
                  </div>
                </div>
              </div>
            </template>
          </b-table>
        </b-colxx>
      </b-row>
    </div>
  </div>
</template>

<script>
const electron = require("electron")
const ipc = electron.ipcRenderer
export default {
  components: {},
  name: "wilayah-page",
  data() {
    return {
      title: "WilayahPage",
      wilayahId: JSON.parse(localStorage.wilayah_id),
      dataReady: false,
      data: {},
      currentWil: {},
      fieldsTable: [
        {
          key: "Wilayah",
          sortable: true
        },
        {
          key: "Jumlah",
          sortable: true,
          class: "text-center d-none d-xl-block"
        }
      ]
    }
  },
  methods: {
    routeTo(page) {
      if (page === "about-page") {
        this.$router.push({ name: "about-page" })
      }
      if (page === "coklit-page") {
        this.$router.push({ name: "coklit-page" })
      }
      if (page === "wilayah-page") {
        this.$router.push({ name: "wilayah-page" })
      }
    },
    async getTps(wilayahId) {
      this.dataReady = false
      var grantParent = ""
      var tingkat = ""
      ipc.send("getWilayah", wilayahId)
      ipc.once("getWilayahResult", async (event, result) => {
        grantParent = result.parent
        tingkat = result.tingkat
        this.currentWil.tingkat = result.tingkat
        this.currentWil.wilayah_id = result.wilayah_id
        this.currentWil.parent = result.parent
        this.currentWil.nama = result.nama
      })

      ipc.send("getTpsChild", { kelurahan_id: wilayahId })
      ipc.once("getTpsChildResult", async (event, result) => {
        let totalTps = 0
        let childStat = result.map((data) => {
          const container = {}
          container["Wilayah"] = {
            nama: "" + data.tps_no,
            wilayah_id: data.tps_id
          }
          container["Nama"] = data.tps_no
          container["Jumlah"] = "-"
          container["Tingkat"] = 5
          totalTps = totalTps + 1
          return container
        })

        // tambah awal
        const awal = {}
        if (tingkat < 3) {
          awal["Wilayah"] = { nama: "parent", wilayah_id: wilayahId }
        } else {
          awal["Wilayah"] = { nama: "parent", wilayah_id: grantParent }
        }

        awal["Jumlah"] = ""
        childStat.unshift(awal)

        // tambah akhir
        const akhir = {}
        akhir["Wilayah"] = { nama: "TOTAL", wilayah_id: "" }
        akhir["Jumlah"] = totalTps
        childStat.push(akhir)

        this.data = childStat
        this.dataReady = true
      })
    },
    async getWilayah(wilayahId) {
      this.dataReady = false
      var grantParent = ""
      var tingkat = ""
      ipc.send("getWilayah", wilayahId)
      ipc.once("getWilayahResult", async (event, result) => {
        grantParent = result.parent
        tingkat = result.tingkat
        this.currentWil.tingkat = result.tingkat
        this.currentWil.wilayah_id = result.wilayah_id
        this.currentWil.parent = result.parent
        this.currentWil.nama = result.nama
      })

      ipc.send("getWilayahChild", wilayahId)
      ipc.once("getWilayahChildResult", async (event, result) => {
        let totalTps = 0
        let childStat = result.map((data) => {
          const container = {}
          container["Wilayah"] = {
            nama: "" + data.nama,
            wilayah_id: data.wilayah_id
          }
          container["Nama"] = data.nama
          container["Jumlah"] = data.countTps
          container["Tingkat"] = data.tingkat
          totalTps = totalTps + data.countTps
          return container
        })

        // tambah awal
        const awal = {}
        if (tingkat < 3) {
          awal["Wilayah"] = { nama: "parent", wilayah_id: wilayahId }
        } else {
          awal["Wilayah"] = { nama: "parent", wilayah_id: grantParent }
        }

        awal["Jumlah"] = ""
        childStat.unshift(awal)

        // tambah akhir
        const akhir = {}
        akhir["Wilayah"] = { nama: "TOTAL", wilayah_id: "" }
        akhir["Jumlah"] = totalTps
        childStat.push(akhir)

        this.data = childStat
        this.dataReady = true
      })
    }
  },
  created() {
    this.getWilayah(this.wilayahId)
  }
}
</script>
<style>
.hidden_header {
  display: none;
}
a:hover {
  text-decoration: none !important;
}
</style>
