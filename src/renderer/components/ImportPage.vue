<template>
  <div>
    <div id="header">
      <b-row style="margin-left: 0px !important; margin-right: 0px !important">
        <b-col cols="4">
          <b-button size="sm" @click="importPemilih()"><span class="simple-icon-rocket" style="margin-right: 10px; margin-left: -2px"></span>{{ $t("actions.import") }}</b-button>
          <b-button v-b-modal.modalright class="inactive-botton" size="sm"><span class="simple-icon-location-pin" style="margin-right: 10px; margin-left: -2px"></span>{{ $t("actions.workingspace") }}</b-button>
        </b-col>
        <b-col cols="4">
          <center>
            <div style="margin-top: 7px">
              <b>{{ currentWil.workingspace }}</b>
            </div>
          </center>
        </b-col>
        <b-col cols="4">
          <div style="float: right"></div>
        </b-col>
      </b-row>
    </div>

    <!-- ------------------ modal ---------------------- -->
    <b-modal size="md" id="modalwarningtps" ref="modalwarningtps" :title="$t('titles.modal-warning')">
      <div>Anda harus berada dalam wilayah <b>Kelurahan/Desa</b> untuk dapat menambahkan pemilih baru. Pilih Kelurahan/desa melalui menu <span @click="showFilter()" style="font-weight: bold; color: #ff6702">fungsi wilayah</span>.</div>
      <template slot="modal-footer">
        <b-button variant="primary" size="sm" @click="showFilter()" class="mr-1">{{ $t("actions.workingspace") }}</b-button>
        <b-button variant="secondary" size="sm" @click="hideModal('modalwarningtps')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <b-modal size="lg" id="modalwarningaftersync" ref="modalwarningaftersync" :title="$t('titles.modal-warning-sync')">
      <table class="vuetable table-hover ui blue selectable celled stackable attached table">
        <thead>
          <tr>
            <th>NAMA</th>
            <th>NIK</th>
            <th>NKK</th>
            <th style="text-align:center">JK</th>
            <th>TGL_LHR</th>
            <th>RW</th>
            <th>RT</th>
            <th>TPS</th>
            <th>ERR</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(field, fieldIndex) in warningAfterSync">
            <tr>
              <td>{{ field.nama }}</td>
              <td>{{ field.nik }}</td>
              <td>{{ field.nkk }}</td>
              <td style="text-align:center">{{ field.jenis_kelamin }}</td>
              <td>{{ field.tanggal_lahir }}</td>
              <td>{{ field.rw }}</td>
              <td>{{ field.rt }}</td>
              <td style="text-align:center">{{ field.tps }}</td>
              <td>{{ field.status }}</td>
            </tr>
          </template>
        </tbody>
      </table>

      <template slot="modal-footer">
        <div style="position: absolute; left: 18px; bottom: 65px;"><b>Keterangan</b> : data diatas tidak dimasukan kedalam database karena terdapat kesalahan data.</div>
        <b-button variant="secondary" size="sm" @click="hideModal('modalwarningaftersync')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <!-- ----------------- end modal ------------------------ -->
    <div id="main">
      <b-modal id="modalright" size="md" ref="modalright" :title="$t('titles.workingspace')">
        <b-form>
          <b-form-group :label="$t('text.kecamatan')" class="has-top-label">
            <v-select :options="kecamatan" v-model="selectedKecamatan" @input="getWilayah(4, selectedKecamatan.value)" />
          </b-form-group>

          <b-row>
            <b-col cols="12" v-if="kelurahanReady">
              <b-form-group :label="$t('text.kelurahan')" class="has-top-label">
                <v-select :options="kelurahan" v-model="selectedKelurahan" @input="getTps(selectedKelurahan.value)" />
              </b-form-group>
            </b-col>

            <b-col cols="12" v-if="tpsReady">
              <b-form-group :label="$t('text.tps')" class="has-top-label">
                <v-select :options="tps" v-model="selectedTps" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-form>

        <template slot="modal-footer">
          <b-button variant="primary" size="sm" @click="reset()">{{ $t("actions.reset") }}</b-button>
          <b-button variant="secondary" size="sm" @click="filterFunc()">{{ $t("actions.filter") }}</b-button>
        </template>
      </b-modal>

      <!-- ---------------------------------->
      <!-- ------------- main ------------ -->
      <!-- ---------------------------------->

      <b-row>
        <b-colxx xxs="12">
          <template>
            <hot-table :settings="settings" :data="excel" ref="handsontable"></hot-table>
          </template>
        </b-colxx>
      </b-row>

      <!-- ---------------------------------->
      <!-- ----------- end main ---------- -->
      <!-- ---------------------------------->
    </div>
  </div>
</template>

<script>
import vSelect from "vue-select"
import "vue-select/dist/vue-select.css"
import { HotTable } from "@handsontable/vue"
import Handsontable from "handsontable"
import "handsontable/dist/handsontable.full.css"

const electron = require("electron")
const ipc = electron.ipcRenderer

export default {
  name: "import-page",
  components: {
    "v-select": vSelect,
    HotTable: HotTable
  },
  data() {
    return {
      title: "CoklitPage",
      kode_disabilitas: ["0", "1", "2", "3", "4", "5"],
      kode_saring: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      kode_sumberdata: ["dpt", "coklit", "masyarakat", "import", "baru"],
      kode_ektp: ["b", "s", "k"],
      kode_jenis_kelamin: ["l", "p", "lk", "pr"],
      kode_kawin: ["b", "s", "p"],
      wilayahId: JSON.parse(localStorage.wilayah_id),
      username: JSON.parse(localStorage.username),
      password: JSON.parse(localStorage.password),
      filterQuery: {},
      kecamatan: [],
      kelurahan: [],
      tps: [],
      tpsReady: false,
      kelurahanReady: false,
      currentSelectedRecord: "",
      selectedKecamatan: "",
      selectedKelurahan: "",
      selectedTps: "",
      selectedItems: [],
      warningAfterSync: [],
      warningAfterSyncStatus: false,
      currentWil: {
        workinglevel: "",
        workingspace: "-",
        id: ""
      },
      datax: [
        {
          dpid: 0,
          nkk: 0,
          nik: 0,
          nama: "NAMA",
          tempat_lahir: "TEMPAT LAHIR",
          tanggal_lahir: "HARI | BULAN | TAHUN",
          kawin: "B/S/P",
          jenis_kelamin: "L/P",
          alamat: "Jalan",
          rt: "000",
          rw: "000",
          difabel: "0",
          ektp: "B/K/S",
          saringan_id: 0,
          sumberdata: "sumberdata",
          tps: "000"
        }
      ],
      settings: {
        data: Handsontable.helper.createSpreadsheetData(1, 15),
        columns: [
          {
            data: "dpid",
            type: "numeric",
            width: 60
          },
          {
            data: "nkk",
            type: "numeric"
          },
          {
            data: "nik",
            type: "numeric"
          },
          {
            data: "nama",
            type: "text"
          },
          {
            data: "tempat_lahir",
            type: "text"
          },
          {
            data: "tanggal_lahir",
            type: "text"
          },
          {
            data: "kawin",
            type: "text"
          },
          {
            data: "jenis_kelamin",
            type: "text"
          },
          {
            data: "alamat",
            type: "text"
          },
          {
            data: "rt",
            type: "text"
          },
          {
            data: "rw",
            type: "text"
          },
          {
            data: "difabel",
            type: "text"
          },
          {
            data: "ektp",
            type: "text"
          },
          {
            data: "saringan_id",
            type: "numeric"
          },
          {
            data: "sumberdata",
            type: "text"
          },
          {
            data: "tps",
            type: "numeric"
          }
        ],
        colHeaders: ["dpid", "nokk", "nik", "nama", "tempatLahir", "tanggalLahir ", "status", "kelamin", "jalan", "rt", "rw", "disabilitas", "ektp", "keterangan", "sumber", "tps"],
        filters: true,
        stretchH: "all",
        autoWrapRow: true,
        maxRows: 1000,
        rowHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        afterChange: function(changes, source) {
          localStorage.removeItem("excelData")
          localStorage.setItem("excelData", JSON.stringify(this.getData()))
        }
      }
    }
  },

  methods: {
    showFilter() {
      this.$refs["modalwarningtps"].hide()
      this.$refs["modalright"].show()
    },
    reset() {
      this.selectedKecamatan = {}
      this.selectedKelurahan = {}
      this.selectedTps = {}

      this.kelurahanReady = false
      this.tpsReady = false
      this.filterQuery = {}

      this.currentWil.workinglevel = "kabupaten"
      this.currentWil.workingspace = this.username.toUpperCase()
      this.currentWil.id = this.wilayahId

      this.getWilayah(3, this.wilayahId)
      this.$refs["modalright"].hide()
    },
    hideModal(refname) {
      this.$refs[refname].hide()
    },
    showModal(refname) {
      this.$refs[refname].show()
    },
    importPemilih() {
      this.warningAfterSyncStatus = false

      if (this.selectedKelurahan.value) {
        let excelData = JSON.parse(localStorage.excelData)

        let dataToInsert = excelData.map((result) => {
          const container = {}
          container.kec_id = parseFloat(this.selectedKecamatan.value)
          container.kel_id = parseFloat(this.selectedKelurahan.value)
          container.tps_id = 0
          container.dp_id = parseFloat(result[0])
          container.nkk = result[1].toString()
          container.nik = result[2].toString()
          container.nama = result[3]
          container.tempat_lahir = result[4]
          container.tanggal_lahir = result[5]
          container.kawin = result[6].toUpperCase()
          container.jenis_kelamin = result[7].toUpperCase()
          container.alamat = result[8]
          container.rt = result[9]
          container.rw = result[10]
          container.difabel = result[11]
          container.ektp = result[12].toLowerCase()
          container.saringan_id = result[13]
          container.sumberdata = result[14].toLowerCase()
          container.tps = result[15]
          container.synced = true
          container.status = "baru"
          return container
        })

        ipc.send("savePemilihWebgrid", dataToInsert)
        ipc.once("savePemilihWebgridResult", async (event, result) => {
          localStorage.removeItem("excelData")

          let message = "Import : " + result.countSuccess + ", Failed : " + result.countError
          this.$toast.error(message, {
            position: "bottom-right",
            duration: 3000
          })
          if (result.countError !== 0) {
            this.warningAfterSync = result.itemError
            this.warningAfterSyncStatus = true

            console.log(this.warningAfterSync)
            this.showModal("modalwarningaftersync")
            this.loadnew(result.itemError)
          } else {
            this.loadnew(this.datax)
          }
        })
      } else {
        this.$refs["modalright"].show()
      }
    },

    filterFunc() {
      this.$refs["modalright"].hide()
      if (this.selectedKecamatan.value) {
        this.currentWil.workinglevel = "kecamatan"
        this.currentWil.workingspace = this.selectedKecamatan.label
        this.currentWil.id = this.selectedKecamatan.value
        this.filterQuery.kec_id = this.selectedKecamatan.value
      }

      if (this.selectedKelurahan.value) {
        this.currentWil.workinglevel = "kelurahan"
        this.currentWil.workingspace = this.selectedKecamatan.label + " ⇌ " + this.selectedKelurahan.label
        this.currentWil.id = this.selectedKelurahan.value
        this.filterQuery.kel_id = this.selectedKelurahan.value
      }

      if (this.selectedTps.value) {
        this.currentWil.workinglevel = "tps"
        this.currentWil.workingspace = this.selectedKecamatan.label + " ⇌ " + this.selectedKelurahan.label + " ⇌ " + this.selectedTps.label
        this.currentWil.id = this.selectedTps.value
        this.filterQuery.kel_id = this.selectedKelurahan.value
        this.filterQuery.tps_id = this.selectedTps.value
      }
    },

    async getTps(wilayahId) {
      ipc.send("getTpsChild", { kelurahan_id: wilayahId })
      ipc.once("getTpsChildResult", async (event, result) => {
        let tps = result.map((data) => {
          const container = {}
          container.label = data.tps_no
          container.value = data.tps_id
          return container
        })
        this.tps = tps
        this.tpsReady = true
        this.selectedTps = ""
      })
    },
    async getWilayah(tingkat, wilayahId) {
      ipc.send("getWilayahChild", wilayahId)
      ipc.once("getWilayahChildResult", async (event, result) => {
        let wilayah = result.map((data) => {
          const container = {}
          container.label = data.nama
          container.value = data.wilayah_id
          return container
        })

        if (tingkat === 3) {
          this.kecamatan = wilayah
          this.selectedKecamatan = ""
          this.selectedKelurahan = ""
          this.selectedTps = ""
          this.tps = {}
          this.kelurahan = {}
        }
        if (tingkat === 4) {
          this.kelurahanReady = true
          this.kelurahan = wilayah
          this.selectedKelurahan = ""
          this.selectedTps = ""
          this.tps = {}
        }
      })
    },
    setData: function(data) {
      this.excel = data
    },
    loadnew(data) {
      this.$refs.handsontable.hotInstance.loadData(data)
      this.$refs.handsontable.hotInstance.loadData(data)
    },
    showresult(data) {
      this.$notify("info filled", "Informasi Penting!", "Data diterima <b> " + data[0].countSuccess + ",</b> data Error <b>" + data[0].countError + "</b>, Silahkan mengecek kembali format dan data yang gagal diupload!", {
        duration: 1000,
        permanent: false
      })

      this.loadnew(this.datax)
    }
  },
  created() {
    this.excel = this.data
    this.getWilayah(3, this.wilayahId)
    this.currentWil.workinglevel = "kabupaten"
    this.currentWil.workingspace = this.username.toUpperCase()
    this.currentWil.id = this.wilayahId
  }
}
</script>
<style>
.vuetable tr td {
  padding-top: 2px !important;
  line-height: 28px !important;
}
</style>
