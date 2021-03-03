<template>
  <div>
    <vue-topprogress ref="topProgress" color="#ed7117"></vue-topprogress>
    <div id="header">
      <b-row style="margin-left :0px !important;margin-right :0px !important;">
        <b-col cols="4">
          <b-button size="sm" @click="routeTo('coklit-page')"
            ><span
              class="simple-icon-crop"
              style="margin-right:10px;margin-left:-2px"
            ></span
            >{{ $t("actions.coklit") }}</b-button
          >
          <b-button v-b-modal.modalright class="inactive-botton" size="sm"
            ><span
              class="simple-icon-chemistry"
              style="margin-right:10px;margin-left:-2px"
            ></span
            >{{ $t("actions.filter") }}</b-button
          >
          <b-button @click="reset()" class="inactive-botton" size="sm"
            ><span
              class="simple-icon-fire"
              style="margin-right:10px;margin-left:-2px"
            ></span
            >{{ $t("actions.reset") }}</b-button
          >
        </b-col>
        <b-col cols="4">
          <center>
            <div style="margin-top: 7px;">
              <b>{{ currentWil.workingspace }}</b>
            </div>
          </center>
        </b-col>
        <b-col cols="4">
          <div style="float : right">
            <b-dropdown right class="inactive-botton" size="sm" text="Actions">
              <b-dropdown-item @click="pull()">{{
                $t("actions.pull")
              }}</b-dropdown-item>
              <b-dropdown-item @click="push()">{{
                $t("actions.push")
              }}</b-dropdown-item>
            </b-dropdown>
            <b-button
              class="inactive-botton"
              size="sm"
              @click="routeTo('wilayah-page')"
              ><span
                class="simple-icon-organization"
                style="color:#FFFFFF;"
              ></span
            ></b-button>
          </div>
        </b-col>
      </b-row>
    </div>

    <!-- ------------------ modal ---------------------- -->
    <b-modal
      v-if="selectedItems.length > 0"
      size="xl"
      id="modallookup"
      ref="modallookup"
      :title="$t('titles.modal-lookup')"
    >
      <div v-if="detailready">
        <b-container class="bv-example-row">
          <b-row>
            <b-col cols="3">
              <b-form-group label="ID" class="has-top-label">
                <b-form-input
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  disabled
                  type="text"
                  v-model="formDetail.id"
                />
              </b-form-group>
            </b-col>
            <b-col cols="3">
              <b-form-group label="DPID" class="has-top-label">
                <b-form-input
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  disabled
                  type="text"
                  v-model="formDetail.dp_id"
                />
              </b-form-group>
            </b-col>

            <b-col cols="6">
              <b-form-group
                label="Tempat Pemungutan Suara (TPS)"
                class="has-top-label"
              >
                <b-form-input
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  disabled
                  type="text"
                  v-model="$v.formDetail.tps.$model"
                  :state="!$v.formDetail.tps.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.tps.required"
                  >kolom <b>TPS</b> harus terisi</b-form-invalid-feedback
                >
                <b-form-invalid-feedback v-if="!$v.formDetail.tps.numeric"
                  >kolom <b>TPS</b> harus terisi angka
                  (Numerik)</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group label="Nama Lengkap" class="has-top-label">
                <b-form-input
                  style="font-size:14px;border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.nama.$model"
                  :state="!$v.formDetail.nama.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.nama.required"
                  >kolom <b>Nama Lengkap</b> harus
                  terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Kode Saring (0-10)" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.saringan_id.toString()"
                  :options="kode_saring"
                  v-model="formDetail.saringan_id"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group
                label="Nomor Induk Kependudukan (NIK)"
                class="has-top-label"
              >
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.nik.$model"
                  :state="!$v.formDetail.nik.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.nik.required"
                  >kolom <b>NIK</b> harus terisi</b-form-invalid-feedback
                >
                <b-form-invalid-feedback v-if="!$v.formDetail.nik.numeric"
                  >kolom <b>NIK</b> harus terisi huruf
                  (Numerik)</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Disabilitas (1-5)" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.difabel"
                  :options="kode_disabilitas"
                  v-model="formDetail.difabel"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group
                label="Nomor Kartu Keluarga (NKK)"
                class="has-top-label"
              >
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.nkk.$model"
                  :state="!$v.formDetail.nkk.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.nkk.required"
                  >kolom <b>NKK</b> harus terisi</b-form-invalid-feedback
                >
                <b-form-invalid-feedback v-if="!$v.formDetail.nkk.numeric"
                  >kolom <b>NKK</b> harus terisi angka
                  (Numerik)</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Sumber Data" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.sumberdata"
                  :options="kode_sumberdata"
                  v-model="formDetail.sumberdata"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="Jenis Kelamin (L/P)" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.jenis_kelamin"
                  :options="kode_jenis_kelamin"
                  v-model="$v.formDetail.jenis_kelamin.$model"
                  :state="!$v.formDetail.jenis_kelamin.$error"
                />
                <b-form-invalid-feedback
                  v-if="!$v.formDetail.jenis_kelamin.required"
                  >kolom <b>Kelamin</b> harus terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>

            <b-col cols="3">
              <b-form-group label="Status Kawin (B/S/P)" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.kawin"
                  :options="kode_kawin"
                  v-model="$v.formDetail.kawin.$model"
                  :state="!$v.formDetail.kawin.$error"
                />

                <b-form-invalid-feedback v-if="!$v.formDetail.kawin.required"
                  >kolom <b>Status</b> harus terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Status KTP-el" class="has-top-label">
                <v-select
                  item-value="value"
                  v-bind:placeholder="formDetail.ektp"
                  :options="kode_ektp"
                  v-model="$v.formDetail.ektp.$model"
                  :state="!$v.formDetail.ektp.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.ektp.required"
                  >kolom <b>ektp</b> harus terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="Tempat Lahir" class="has-top-label">
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.tempat_lahir.$model"
                  :state="!$v.formDetail.tempat_lahir.$error"
                />
                <b-form-invalid-feedback
                  v-if="!$v.formDetail.tempat_lahir.required"
                  >kolom <b>Tanggal</b> harus terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>

            <b-col cols="3">
              <b-form-group
                label="Tanggal Lahir (YYYY-MM-DD)"
                class="has-top-label"
              >
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.tanggal_lahir.$model"
                  :state="!$v.formDetail.tanggal_lahir.$error"
                />
                <b-form-invalid-feedback
                  v-if="!$v.formDetail.tanggal_lahir.required"
                  >kolom <b>Tanggal</b> harus terisi</b-form-invalid-feedback
                >
              </b-form-group>
            </b-col>
            <b-col cols="2">
              <b-form-group label="K1" class="has-top-label">
                <b-form-input
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  type="text"
                  v-model="formDetail.k1"
                />
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-form-group label="K2" class="has-top-label">
                <b-form-input
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  type="text"
                  v-model="formDetail.k2"
                />
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-form-group label="K3" class="has-top-label">
                <b-form-input
                  disabled
                  style="font-size:14px;border:1px solid rgb(226, 236, 191);font-weight:bold;background:rgb(250, 255, 230) none repeat scroll 0% 0%"
                  type="text"
                  v-model="formDetail.k3"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="ALAMAT" class="has-top-label">
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.alamat.$model"
                  :state="!$v.formDetail.alamat.$error"
                />
              </b-form-group>
            </b-col>
            <b-col cols="1">
              <b-form-group label="RW" class="has-top-label">
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.rw.$model"
                  :state="!$v.formDetail.rw.$error"
                />
              </b-form-group>
            </b-col>

            <b-col cols="1">
              <b-form-group label="RT" class="has-top-label">
                <b-form-input
                  style="border:1px solid #eee;font-weight:bold;"
                  type="text"
                  v-model="$v.formDetail.rt.$model"
                  :state="!$v.formDetail.rt.$error"
                />
              </b-form-group>
            </b-col>

            <b-col cols="6">
              <b-form-group label="" class="has-top-label"> </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div v-else>
        <center>
          <b-spinner
            variant="primary"
            type="grow"
            label="Loading..."
          ></b-spinner>
        </center>
      </div>
      <template slot="modal-footer">
        <b-button variant="primary" @click="updateRecord()" class="mr-1">{{
          $t("actions.edit")
        }}</b-button>
        <b-button variant="secondary" @click="hideModal('modallookup')">{{
          $t("actions.close")
        }}</b-button>
      </template>
    </b-modal>

    <!-- ----------------- end modal ------------------------ -->
    <div id="main">
      <b-modal
        id="modalright"
        ref="modalright"
        :title="$t('titles.filter')"
        modal-class="modal-right"
      >
        <b-form>
          <b-form-group :label="$t('text.kecamatan')" class="has-top-label">
            <v-select
              :options="kecamatan"
              v-model="selectedKecamatan"
              @input="getWilayah(4, selectedKecamatan.value)"
            />
          </b-form-group>

          <b-row>
            <b-col cols="7">
              <b-form-group :label="$t('text.kelurahan')" class="has-top-label">
                <v-select
                  :options="kelurahan"
                  v-model="selectedKelurahan"
                  @input="getTps(selectedKelurahan.value)"
                />
              </b-form-group>
            </b-col>

            <b-col cols="5">
              <b-form-group :label="$t('text.tps')" class="has-top-label">
                <v-select :options="tps" v-model="selectedTps" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-form-group label="Nama" class="has-top-label">
            <b-form-input v-model="filter.nama"></b-form-input>
          </b-form-group>

          <b-row>
            <b-col cols="6">
              <b-form-group label="NIK" class="has-top-label">
                <b-form-input v-model="filter.nik"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group label="NKK" class="has-top-label">
                <b-form-input v-model="filter.nkk"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-form-group
            label="Tanggal Lahir"
            style="color:rgba(58, 58, 58, 0.7);font-weight: 600;font-size: 94%;"
          >
            <datepicker
              :bootstrap-styling="true"
              label="Tanggal Lahir"
              v-model="filter.tanggalLahir"
            ></datepicker>
          </b-form-group>
          <b-form-group
            label="Umur"
            style="color:rgba(58, 58, 58, 0.7);font-weight: 600;font-size: 94%;"
          >
            <vue-slider
              ref="slider"
              v-model="filter.umur"
              tooltip-dir="['bottom']"
              :piecewise="true"
              :data="sliderUmurData"
              :direction="direction"
            ></vue-slider>
          </b-form-group>
          <b-row>
            <b-col cols="4">
              <b-form-group label="Kelamin" class="has-top-label">
                <v-select
                  :options="kode_jenis_kelamin"
                  v-model="filter.kelamin"
                />
              </b-form-group>
            </b-col>

            <b-col cols="4">
              <b-form-group label="Kawin" class="has-top-label">
                <v-select :options="kode_kawin" v-model="filter.kawin" />
              </b-form-group>
            </b-col>

            <b-col cols="4">
              <b-form-group label="Saring" class="has-top-label">
                <v-select :options="kode_saring" v-model="filter.saringan_id" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4">
              <b-form-group label="Disabilitas" class="has-top-label">
                <v-select
                  :options="kode_disabilitas"
                  v-model="filter.difabel"
                />
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-form-group label="KTP-el" class="has-top-label">
                <v-select :options="kode_ektp" v-model="filter.ektp" />
              </b-form-group>
            </b-col>

            <b-col cols="4">
              <b-form-group label="Sumber" class="has-top-label">
                <v-select
                  :options="kode_sumberdata"
                  v-model="filter.sumberdata"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-form-group label="Alamat" class="has-top-label">
            <b-form-input v-model="filter.alamat"></b-form-input>
          </b-form-group>

          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="defaultCheck1"
              v-model="filter.synced"
            />
            <label class="form-check-label" for="defaultCheck1">
              <span
                style="color:rgba(58, 58, 58, 0.7);font-weight: 600;font-size: 94%;"
                >Status data <i>Synced</i> ?</span
              >
            </label>
          </div>
        </b-form>

        <template slot="modal-footer">
          <b-button variant="primary" size="sm" @click="reset()">{{
            $t("actions.reset")
          }}</b-button>
          <b-button variant="secondary" size="sm" @click="filterFunc()">{{
            $t("actions.filter")
          }}</b-button>
        </template>
      </b-modal>

      <!-- ---------------------------------->
      <!-- ------------- main ------------ -->
      <!-- ---------------------------------->

      <vuetable
        ref="vuetable"
        pagination-path
        :query-params="makeQueryParams"
        :perPage="perPage"
        :curPage="curPage"
        :reactive-api-url="false"
        :filterQuery="filterQuery"
        :row-class="onRowClass"
        @selectAll="selectAll"
        @vuetable:pagination-data="onPaginationData"
        @vuetable:row-clicked="rowClicked"
        @vuetable:cell-rightclicked="rightClicked"
      >
        <template slot="actions" slot-scope="props">
          <b-form-checkbox
            :checked="selectedItems.includes(props.rowData.id)"
            class="itemCheck mb-0"
          ></b-form-checkbox>
        </template>
      </vuetable>
      <vuetable-pagination-bootstrap
        ref="pagination"
        @vuetable-pagination:change-page="onChangePage"
      />
      <!-- ---------------------------------->
      <!-- ----------- end main ---------- -->
      <!-- ---------------------------------->
    </div>
    <v-contextmenu ref="contextmenu">
      <v-contextmenu-item @click="onContextMenuAction('edit')">
        <i class="simple-icon-note" />
        <span>{{ $t("actions.info") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('aktif')">
        <i class="simple-icon-action-undo" />
        <span>{{ $t("actions.aktif") }}</span>
      </v-contextmenu-item>
      <v-contextmenu-item @click="onContextMenuAction('saring1')">
        <i class="simple-icon-ban" style="color:red" />
        <span>{{ $t("actions.saring1") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring2')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring2")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring3')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring3")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring4')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring4")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring5')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring5")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring6')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring6")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring7')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring7")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring8')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring8")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring9')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring9")
        }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring10')">
        <span style="margin-left : 25px !important">{{
          $t("actions.saring10")
        }}</span>
      </v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>

<script>
import axios from "axios"
import vSelect from "vue-select"
import "vue-select/dist/vue-select.css"
import Vuetable from "./CoklitPage/Vuetable"
import { vueTopprogress } from "vue-top-progress"
import { apiLogin, apiUrl, version, deviceId } from "../constants/config"
import VuetablePaginationBootstrap from "./CoklitPage/VuetablePaginationBootstrap"
import { validationMixin } from "vuelidate"
import Datepicker from "vuejs-datepicker"
import VueSlider from "vue-slider-component"
import "vue-slider-component/theme/antd.css"
const { required, numeric } = require("vuelidate/lib/validators")
const electron = require("electron")
const ipc = electron.ipcRenderer
export default {
  name: "coklit-page",
  components: {
    "v-select": vSelect,
    "vuetable-pagination-bootstrap": VuetablePaginationBootstrap,
    vueTopprogress,
    Vuetable,
    datepicker: Datepicker,
    "vue-slider": VueSlider
  },
  data() {
    return {
      title: "CoklitPage",
      synced: ["true", "false"],
      kode_disabilitas: ["0", "1", "2", "3", "4", "5"],
      kode_saring: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      sliderUmurData: [
        0,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        55,
        60,
        65,
        70,
        75,
        80,
        85,
        80
      ],
      direction: "rtl",
      filter: {
        nama: "",
        nik: "",
        nkk: "",
        tanggalLahir: "",
        umur: [35, 50],
        kelamin: "",
        kawin: "",
        saringan_id: "",
        difabel: "",
        ektp: "",
        sumberdata: "",
        synced: "",
        alamat: ""
      },
      kode_sumberdata: ["dpt", "coklit", "masyarakat", "import", "baru"],
      kode_ektp: ["b", "s", "k"],
      kode_jenis_kelamin: ["L", "P"],
      kode_kawin: ["B", "S", "P"],
      wilayahId: JSON.parse(localStorage.wilayah_id),
      username: JSON.parse(localStorage.username),
      password: JSON.parse(localStorage.password),
      detailready: false,
      dataReady: false,
      selectedGanda: false,
      nik: 0,
      nkk: 0,
      defaultLimit: 50,
      perPage: 22,
      curPage: 1,
      filterQuery: {},
      formDetail: {},
      kecamatan: [],
      kelurahan: [],
      isValidJwt: false,
      isInetOn: false,
      lastUsed: "",
      jwt: "",
      tps: [],
      selectedKecamatan: "",
      selectedKelurahan: "",
      selectedTps: "",
      sort: "",
      search: "",
      from: 0,
      to: 0,
      total: 0,
      lastPage: 0,
      selectedItems: [],
      items: [],
      currentWil: {
        workinglevel: "",
        workingspace: "-",
        id: ""
      }
    }
  },
  mixins: [validationMixin],
  validations: {
    formDetail: {
      id: {
        required
      },
      nama: {
        required
      },
      nik: {
        required,
        numeric
      },
      nkk: {
        required,
        numeric
      },
      dp_id: {
        required
      },
      jenis_kelamin: {
        required
      },
      tempat_lahir: {
        required
      },
      tanggal_lahir: {
        required
      },
      kawin: {
        required
      },
      alamat: {
        required
      },
      rw: {
        required
      },
      rt: {
        required
      },
      k1: {
        required
      },
      k2: {
        required
      },
      k3: {
        required
      },
      sumberdata: {
        required
      },
      tps: {
        required,
        numeric
      },
      tps_id: {
        required
      },
      saringan_id: {
        required
      },
      difabel: {
        required
      },
      ektp: {
        required
      }
    }
  },
  methods: {
    reset() {
      this.filter.nama = ""
      this.filter.nik = ""
      this.filter.nkk = ""
      this.filter.tanggalLahir = ""
      this.filter.kelamin = ""
      this.filter.kawin = ""
      this.filter.saringan_id = ""
      this.filter.difabel = ""
      this.filter.ektp = ""
      this.filter.sumberdata = ""
      this.filter.synced = ""
      this.filter.alamat = ""
      this.filter.umur = [35, 50]

      this.filterQuery = {}
      this.currentWil.workinglevel = "kabupaten"
      this.currentWil.workingspace = this.username.toUpperCase()
      this.currentWil.id = this.wilayahId

      this.onChangePage()
      this.getWilayah(3, this.wilayahId)
      this.$refs["modalright"].hide()
      this.$nextTick(() => {
        this.$refs.vuetable.reload()
      })
    },
    hideModal(refname) {
      this.$refs[refname].hide()
      if (refname === "modalnestedinline") {
        this.$refs["modalnested"].show()
      }
    },
    onChangePage(page) {
      if (page === "prev") {
        this.curPage = this.curPage - 1
      } else if (page === "next") {
        this.curPage = this.curPage + 1
      } else {
        this.curPage = page
      }

      let offset = (this.curPage - 1) * this.perPage

      this.filterQuery.limit = this.perPage
      this.filterQuery.offset = offset

      this.$nextTick(() => {
        this.$refs.vuetable.reload()
      })
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
        this.currentWil.workingspace =
          this.selectedKecamatan.label + " ⇌ " + this.selectedKelurahan.label
        this.currentWil.id = this.selectedKelurahan.value
        this.filterQuery.kel_id = this.selectedKelurahan.value
      }

      if (this.selectedTps.value) {
        this.currentWil.workinglevel = "tps"
        this.currentWil.workingspace =
          this.selectedKecamatan.label +
          " ⇌ " +
          this.selectedKelurahan.label +
          " ⇌ " +
          this.selectedTps.label
        this.currentWil.id = this.selectedTps.value
        this.filterQuery.kel_id = this.selectedKelurahan.value
        this.filterQuery.tps_id = this.selectedTps.value
      }

      if (this.filter.nama !== "") {
        this.filterQuery.nama = this.filter.nama.trim()
      }
      if (this.filter.nik !== "") {
        this.filterQuery.nik = this.filter.nik.trim()
      }
      if (this.filter.nkk !== "") {
        this.filterQuery.nik = this.filter.nkk.trim()
      }
      if (this.filter.tanggalLahir !== "") {
        this.filterQuery.tanggal_lahir = this.filter.tanggalLahir.trim()
      }
      if (this.filter.kelamin !== "") {
        this.filterQuery.kelamin = this.filter.kelamin.trim()
      }
      if (this.filter.kawin !== "") {
        this.filterQuery.kawin = this.filter.kawin.trim()
      }
      if (this.filter.difabel !== "") {
        this.filterQuery.difabel = this.filter.difabel.trim()
      }
      if (this.filter.ektp !== "") {
        this.filterQuery.ektp = this.filter.ektp.trim()
      }
      if (this.filter.sumberdata !== "") {
        this.filterQuery.sumberdata = this.filter.sumberdata.trim()
      }
      if (this.filter.alamat !== "") {
        this.filterQuery.alamat = this.filter.alamat.trim()
      }

      if (this.filter.synced === true) {
        this.filterQuery.synced = true
      } else {
        this.filterQuery.synced = false
      }

      if (this.filter.saringan_id !== "") {
        this.filterQuery.saringan_id = parseInt(this.filter.saringan_id)
      }

      this.filterQuery.limit = this.perPage
      this.filterQuery.offset = 0
      this.filterQuery.term = "filterSearch"
      delete this.filterQuery.id

      this.$nextTick(() => {
        this.$refs.vuetable.reload()
      })
    },
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
    makeQueryParams(sortOrder, currentPage, perPage) {
      this.selectedItems = []
      return sortOrder[0]
        ? {
            sort: sortOrder[0]
              ? sortOrder[0].field + "|" + sortOrder[0].direction
              : "",
            page: currentPage,
            per_page: this.perPage,
            search: this.search
          }
        : {
            page: currentPage,
            per_page: this.perPage,
            search: this.search
          }
    },
    onRowClass(dataItem, index) {
      if (this.selectedItems.includes(dataItem.id)) {
        return "selected"
      }
      return ""
    },
    onPaginationData(paginationData) {
      this.from = paginationData.from
      this.to = paginationData.to
      this.total = paginationData.total
      this.lastPage = paginationData.last_page
      this.items = paginationData.data
      this.$refs.pagination.setPaginationData(paginationData)
    },
    rowClicked(dataItem, event) {
      const itemId = dataItem.id
      if (event.shiftKey && this.selectedItems.length > 0) {
        let itemsForToggle = this.items
        var start = this.getIndex(itemId, itemsForToggle, "id")
        var end = this.getIndex(
          this.selectedItems[this.selectedItems.length - 1],
          itemsForToggle,
          "id"
        )
        itemsForToggle = itemsForToggle.slice(
          Math.min(start, end),
          Math.max(start, end) + 1
        )
        this.selectedItems.push(
          ...itemsForToggle.map((item) => {
            return item.id
          })
        )
        this.selectedItems = [...new Set(this.selectedItems)]
      } else {
        if (this.selectedItems.includes(itemId)) {
          this.selectedItems = this.selectedItems.filter((x) => x !== itemId)
        } else this.selectedItems.push(itemId)
      }
    },
    rightClicked(dataItem, field, event) {
      let top = event.pageY + 130
      let pageX = event.pageX + 10
      event.preventDefault()

      if (!this.selectedItems.includes(dataItem.id)) {
        this.selectedItems = [dataItem.id]
      }

      this.$refs["contextmenu"].show({ top: top, left: pageX })
    },
    onContextMenuAction(action) {
      if (action === "aktif") {
        this.saringSelected(0)
      }

      if (action === "saring1") {
        this.saringSelected(1)
      }

      if (action === "saring2") {
        this.saringSelected(2)
      }

      if (action === "saring3") {
        this.saringSelected(3)
      }

      if (action === "saring4") {
        this.saringSelected(4)
      }

      if (action === "saring5") {
        this.saringSelected(5)
      }

      if (action === "saring6") {
        this.saringSelected(6)
      }

      if (action === "saring7") {
        this.saringSelected(7)
      }

      if (action === "saring8") {
        this.saringSelected(8)
      }

      if (action === "saring9") {
        this.saringSelected(9)
      }

      if (action === "saring10") {
        this.saringSelected(10)
      }
      if (action === "edit") {
        let id = this.selectedItems[0]
        let filter = this.filterQuery
        filter.id = id
        ipc.send("getPemilihById", filter)
        ipc.once("getPemilihByIdResult", async (event, result) => {
          this.detailready = true
          this.formDetail = result[0]
        })
        this.$refs["modallookup"].show()
      }
    },
    saringSelected(kode) {
      let data = {}
      data.id = this.selectedItems
      data.term = { saringan_id: kode, synced: true }

      ipc.send("updatePemilihByTerm", data)
      ipc.once("updatePemilihByTermResult", async (event, result) => {
        this.hideModal("modallookup")
        this.onChangePage()
      })
    },
    async updateRecord() {
      this.$v.formDetail.$touch()
      let data = this.formDetail
      data.synced = true
      ipc.send("updatePemilihById", data)
      ipc.once("updatePemilihByIdResult", async (event, result) => {
        this.hideModal("modallookup")
        this.onChangePage()
      })
    },
    searchChange(val) {
      this.search = val
      if (val.length === 16) {
        this.$refs.vuetable.reload()
      }
      if (val.length === 0) {
        this.$refs.vuetable.reload()
      }
    },
    selectAll(isToggle) {
      if (this.selectedItems.length >= this.items.length) {
        if (isToggle) this.selectedItems = []
      } else {
        this.selectedItems = this.items.map((x) => x.id)
      }
    },
    getIndex(value, arr, prop) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][prop] === value) {
          return i
        }
      }
      return -1
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
            `            {
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
          localStorage.setItem(
            "wilayah_id",
            JSON.stringify(userData.wilayah_id)
          )
          ipc.send("saveSetting", {
            username: this.username,
            password: this.password,
            wilayah_id: userData.wilayah_id
          })
        } else {
          localStorage.removeItem("currentUser")
        }
      })
    },
    async pull() {
      this.$refs.topProgress.start()
      let param = ""
      let paramObj = {}

      if (this.currentWil.workinglevel === "kelurahan") {
        param = "kel_id:" + this.currentWil.id
        paramObj.kel_id = this.currentWil.id
      }
      if (this.currentWil.workinglevel === "kecamatan") {
        this.$refs.topProgress.done()
        this.$toast.error(
          "Silahkan pilih wilayah sampai tingkat Kelurahan/Desa atau TPS untuk unduh pemilih",
          {
            position: "bottom-right",
            duration: 3000
          }
        )
      }
      let validate = await this.validate()
      this.jwt = JSON.parse(localStorage.jwt)
      this.lastUsed = localStorage.lastUsed
      let endDate = new Date()
      let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)

      // only valid your internet connection and jwt
      if (
        validate === "VALID" &&
        this.currentWil.workinglevel !== "kecamatan"
      ) {
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
              query:
                `
                    {
                    coklits (` +
                param +
                `){
                      id,
                      arsip_id,
                      master_id,
                      kel_id,
                      kec_id,
                      nama,
                      nik,
                      nkk,
                      no_ktp,
                      jenis_kelamin,
                      tanggal_lahir,
                      tempat_lahir,
                      kawin,
                      alamat,
                      rw,
                      rt,
                      k1,
                      k2,
                      k3,
                      ektp,
                      sumberdata,
                      status,
                      tps,
                      tps_id,
                      saringan_id,
                      difabel
                    }
                  }
                `
            }
          }).then((result) => {
            if (result.data.data.coklits) {
              let hasil = result.data.data.coklits
              let dataToInsert = hasil.map((data) => {
                const container = data
                container.dp_id = parseInt(container.id)
                delete container.id
                return container
              })

              ipc.send("deletePemilih", paramObj)
              ipc.once("deletePemilihResult", async (event, result) => {
                ipc.send("savePemilih", dataToInsert)
                ipc.once("savePemilihResult", async (event, result) => {
                  this.$toast.error(result, {
                    position: "bottom-right",
                    duration: 3000
                  })
                  this.onChangePage()
                })
              })

              this.$refs.topProgress.done()
            } else {
              this.$refs.topProgress.done()
              let message = result.data.errors[0].message
              this.$toast.error(message, {
                position: "bottom-right",
                duration: 3000
              })
            }
          })
        }
      }
    },
    async push() {
      console.log("push")
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
        }
        if (tingkat === 4) {
          this.kelurahan = wilayah
          this.selectedKelurahan = ""
          this.selectedTps = ""
        }
      })
    }
  },
  created() {
    this.getWilayah(3, this.wilayahId)
    this.filterQuery.limit = this.perPage
    this.currentWil.workinglevel = "kabupaten"
    this.currentWil.workingspace = this.username.toUpperCase()
    this.currentWil.id = this.wilayahId
  }
}
</script>
