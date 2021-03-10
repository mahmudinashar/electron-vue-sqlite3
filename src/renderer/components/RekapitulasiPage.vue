<template>
  <div>
    <div id="header">
      <b-row style="margin-left: 0px !important; margin-right: 0px !important">
        <b-col cols="4">
          <b-button size="sm" @click="routeTo('coklit-page')"><span class="simple-icon-layers" style="margin-right:10px;margin-left:-2px"></span>{{ $t("actions.coklit") }}</b-button>
        </b-col>
        <b-col cols="4">
          <center>
            <div style="margin-top: 7px">
              <b>{{ currentWil.workingspace }}</b>
            </div>
          </center>
        </b-col>
        <b-col cols="4">
          <div style="float : right">
            <!-- script here  -->
          </div>
        </b-col>
      </b-row>
    </div>
    <div id="main">
      <b-row>
        <b-colxx xl="12" lg="12" md="12">
          <b-table striped :items="data" :fields="fieldsTable" responsive="xl" v-if="dataReady" thead-class="hidden_header">
            <template v-slot:cell(Wilayah)="data">
              <div v-if="data.value.nama === 'parent'" style="font-weight:bold;font-size: 25px !important;margin-top: -7px;margin-bottom: -7px;">
                <b>
                  <a style="color:#000000 !important" v-on:click="getWilayah(data.value.wilayah_id, data.value.nama)" :href="`#` + data.value.wilayah_id">{{ currentWil.nama }}</a></b
                >
              </div>

              <div v-if="data.value.nama != 'parent'">
                <div v-if="data.value.nama === 'TOTAL'">
                  <b style="margin-left:10px;font-size:15px;font-weight:bold;color:#444 !important">TOTAL </b>
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

            <template v-slot:cell(JumlahTps)="data">
              <div v-if="data.item.JumlahTps === 'TPS'" style="font-weight:bold;font-size: 15px !important;">
                <b>Σ TPS</b>
              </div>
              <div v-else>
                {{ data.item.JumlahTps }}
              </div>
            </template>

            <template v-slot:cell(JumlahPemilih)="data">
              <div v-if="data.item.JumlahPemilih === 'PEMILIH'" style="font-weight:bold;font-size: 15px !important;">
                <b>Σ PEMILIH</b>
              </div>
              <div v-else>
                {{ data.item.JumlahPemilih }}
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
  name: "rekapitulasi-page",
  data() {
    return {
      title: "RekapitulasiPage",
      wilayahId: 0,
      dataReady: false,
      data: {},
      currentWil: {},
      fieldsTable: [
        {
          key: "Wilayah",
          sortable: true,
          class: "tb-name"
        },
        {
          key: "JumlahTps",
          sortable: true,
          class: "text-center tb-value"
        },
        {
          key: "JumlahPemilih",
          sortable: true,
          class: "text-center tb-value"
        }
      ]
    }
  },
  methods: {
    routeTo(page) {
      if (page === "coklit-page") {
        this.$router.push({ name: "coklit-page" }).catch((err) => {
          console.log(err.length)
        })
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

        let data = { label: result.nama, value: result.wilayah_id }
        let selectedKecamatan = JSON.parse(localStorage.selectedKecamatan)
        localStorage.setItem("selectedKelurahan", JSON.stringify(data))
        this.currentWil.workingspace = selectedKecamatan.label + " ⇌ " + result.nama
      })

      ipc.send("getTpsChild", { kelurahan_id: wilayahId })
      ipc.once("getTpsChildResult", async (event, result) => {
        let totalPemilih = 0
        let childStat = result.map((data) => {
          const container = {}
          container["Wilayah"] = {
            nama: "" + data.tps_no,
            wilayah_id: data.tps_id
          }
          container["Nama"] = data.tps_no
          container["JumlahPemilih"] = data.countPemilih
          container["Tingkat"] = 5
          totalPemilih = totalPemilih + data.countPemilih
          return container
        })

        // tambah awal
        const awal = {}
        if (tingkat < 3) {
          awal["Wilayah"] = { nama: "parent", wilayah_id: wilayahId }
        } else {
          awal["Wilayah"] = { nama: "parent", wilayah_id: grantParent }
        }

        awal["JumlahPemilih"] = "PEMILIH"
        childStat.unshift(awal)

        // tambah akhir
        const akhir = {}
        akhir["Wilayah"] = { nama: "TOTAL", wilayah_id: "" }
        akhir["JumlahPemilih"] = totalPemilih
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

        if (this.currentWil.tingkat === 2) {
          localStorage.removeItem("selectedKelurahan")
          localStorage.removeItem("selectedKecamatan")
        }

        if (this.currentWil.tingkat === 3) {
          let data = { label: result.nama, value: result.wilayah_id }
          localStorage.setItem("selectedKecamatan", JSON.stringify(data))
          localStorage.removeItem("selectedKelurahan")
          this.currentWil.workinglevel = "kecamatan"
          this.currentWil.workingspace = result.nama
          this.currentWil.id = result.wilayah_id
        }
      })

      ipc.send("getWilayahChild", wilayahId)
      ipc.once("getWilayahChildResult", async (event, result) => {
        let totalTps = 0
        let totalPemilih = 0
        let childStat = result.map((data) => {
          const container = {}
          container["Wilayah"] = {
            nama: "" + data.nama,
            wilayah_id: data.wilayah_id
          }
          container["Nama"] = data.nama
          container["JumlahTps"] = data.countTps
          container["JumlahPemilih"] = data.countPemilih
          container["Tingkat"] = data.tingkat

          totalTps = totalTps + data.countTps
          totalPemilih = totalPemilih + data.countPemilih
          return container
        })

        // console.log(totalPemilih)
        // tambah awal
        const awal = {}
        if (tingkat < 3) {
          awal["Wilayah"] = { nama: "parent", wilayah_id: wilayahId }
        } else {
          awal["Wilayah"] = { nama: "parent", wilayah_id: grantParent }
        }

        awal["JumlahTps"] = "TPS"
        awal["JumlahPemilih"] = "PEMILIH"
        childStat.unshift(awal)

        // tambah akhir
        const akhir = {}
        akhir["Wilayah"] = { nama: "TOTAL", wilayah_id: "" }
        akhir["JumlahTps"] = totalTps
        akhir["JumlahPemilih"] = totalPemilih
        childStat.push(akhir)
        this.data = childStat
        this.dataReady = true
      })
    }
  },
  created() {
    if (localStorage.getItem("wilayah_id") !== null) {
      this.wilayahId = JSON.parse(localStorage.wilayah_id)
      this.currentWil.workinglevel = "kabupaten"
      this.currentWil.workingspace = JSON.parse(localStorage.username).toUpperCase()
    }

    if (localStorage.getItem("selectedKecamatan") !== null) {
      this.selectedKecamatan = JSON.parse(localStorage.selectedKecamatan)
      this.currentWil.workinglevel = "kecamatan"
      this.currentWil.workingspace = this.selectedKecamatan.label.toUpperCase()
      this.wilayahId = this.selectedKecamatan.value
    }

    if (localStorage.getItem("selectedKelurahan") !== null) {
      this.selectedKelurahan = JSON.parse(localStorage.selectedKelurahan)
      this.currentWil.workinglevel = "kelurahan"
      this.currentWil.workingspace = this.selectedKecamatan.label + " ⇌ " + this.selectedKelurahan.label
      this.wilayahId = this.selectedKelurahan.value
    }

    if (this.selectedKelurahan) {
      this.getTps(this.wilayahId)
    } else {
      this.getWilayah(this.wilayahId)
    }
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

.tb-name {
  /* font-weight: bold; */
  font-size: 13px;
  color: #666;
}

.tb-value {
  /* font-weight: bold; */
  font-size: 13px;
}
</style>
