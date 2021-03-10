<template>
  <div>
    <vue-topprogress ref="topProgress" color="#ed7117"></vue-topprogress>
    <div id="header">
      <b-row style="margin-left: 0px !important; margin-right: 0px !important">
        <b-col cols="4">
          <b-button size="sm" @click="showInsertRecord()"><span class="simple-icon-note" style="margin-right: 10px; margin-left: -2px"></span>{{ $t("actions.new") }}</b-button>
          <b-button v-b-modal.modalright class="inactive-botton" size="sm"><span class="iconsminds-filter-2" style="margin-right: 10px; margin-left: -2px"></span>{{ $t("actions.filter") }}</b-button>
        </b-col>
        <b-col cols="4">
          <center>
            <div style="margin-top: 5px">
              <b>{{ currentWil.workingspace }}</b>
            </div>
          </center>
        </b-col>
        <b-col cols="4">
          <div style="float: right">
            <b-button @click="reset()" class="inactive-botton" size="sm"><span class="simple-icon-shuffle" style="color: #ffffff"></span></b-button>
            <b-button class="inactive-botton" size="sm" @click="routeTo('rekapitulasi-page')"><span class="iconsminds-line-chart-1" style="color: #ffffff"></span></b-button>
            <b-dropdown right class="inactive-botton" size="sm" text="Tools">
              <b-dropdown-item @click="pull()"><span class="iconsminds-link" style="margin-right : 10px"></span>{{ $t("actions.pull") }}</b-dropdown-item>
              <b-dropdown-item @click="push()"><span class="iconsminds-refresh" style="margin-right : 10px"></span> {{ $t("actions.push") }}</b-dropdown-item>
              <b-dropdown-item @click="savecsv()"><span class="iconsminds-save" style="font-size:12px;margin-right : 10px"></span> {{ $t("actions.csv") }}</b-dropdown-item>
              <b-dropdown-item style="border-top:1px dashed #DDDDDD;line-height:2px;margin-bottom:-20px"></b-dropdown-item>
              <b-dropdown-item @click="analisisK1()">{{ $t("actions.k1") }}</b-dropdown-item>
              <b-dropdown-item @click="analisisK2()">{{ $t("actions.k2") }}</b-dropdown-item>
              <b-dropdown-item @click="analisisK3()">{{ $t("actions.k3") }}</b-dropdown-item>
            </b-dropdown>
          </div>
        </b-col>
      </b-row>
    </div>

    <!-- ------------------ modal ---------------------- -->
    <b-modal size="md" id="modalwarningtps" ref="modalwarningtps" :title="$t('titles.modal-warning')">
      <div>Anda harus berada dalam wilayah <b>Kelurahan/Desa</b> untuk dapat menambahkan pemilih baru. Pilih Kelurahan/desa melalui menu <span @click="showFilter()" style="font-weight: bold; color: #ff6702">filter</span>.</div>
      <template slot="modal-footer">
        <b-button variant="primary" size="sm" @click="showFilter()" class="mr-1">{{ $t("actions.filter") }}</b-button>
        <b-button variant="secondary" size="sm" @click="hideModal('modalwarningtps')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <b-modal size="lg" id="modalwarningaftersync" ref="modalwarningaftersync" :title="$t('titles.modal-warning-sync')">
      <table class="vuetable table-hover ui blue selectable celled stackable attached table">
        <thead>
          <tr>
            <th>DPID</th>
            <th>NAMA</th>
            <th>NIK</th>
            <th>NKK</th>
            <th>STATUS SYNC</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(field, fieldIndex) in warningAfterSync">
            <tr>
              <td>{{ field.dpid }}</td>
              <td>{{ field.nama }}</td>
              <td>{{ field.nik }}</td>
              <td>{{ field.nkk }}</td>
              <td>{{ field.status }}</td>
            </tr>
          </template>
        </tbody>
      </table>

      <template slot="modal-footer">
        <b-button variant="secondary" size="sm" @click="hideModal('modalwarningaftersync')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <b-modal size="xl" id="modallookup" ref="modallookup" :title="$t('titles.modal-lookup')">
      <div v-if="detailready">
        <b-container class="bv-example-row">
          <b-row>
            <b-col cols="3">
              <b-form-group label="ID" class="has-top-label">
                <b-form-input
                  style="
                    font-size: 14px;
                    border: 1px solid rgb(226, 236, 191);
                    font-weight: bold;
                    background: rgb(250, 255, 230) none repeat scroll 0% 0%;
                  "
                  disabled
                  type="text"
                  v-model="formDetail.id"
                />
              </b-form-group>
            </b-col>
            <b-col cols="3">
              <b-form-group label="DPID" class="has-top-label">
                <b-form-input
                  style="
                    font-size: 14px;
                    border: 1px solid rgb(226, 236, 191);
                    font-weight: bold;
                    background: rgb(250, 255, 230) none repeat scroll 0% 0%;
                  "
                  disabled
                  type="text"
                  v-model="formDetail.dp_id"
                />
              </b-form-group>
            </b-col>

            <b-col cols="6">
              <b-form-group v-if="tpsReady" label="Tempat Pemungutan Suara (TPS)" class="has-top-label">
                <v-select item-value="value" :options="tps" v-model="$v.formDetail.tps.$model" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group label="Nama Lengkap" class="has-top-label">
                <b-form-input
                  style="
                    font-size: 14px;
                    border: 1px solid #eee;
                    font-weight: bold;
                  "
                  type="text"
                  v-model="$v.formDetail.nama.$model"
                  :state="!$v.formDetail.nama.$error"
                />
                <b-form-invalid-feedback v-if="!$v.formDetail.nama.required">kolom <b>Nama Lengkap</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Kode Saring (0-10)" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.saringan_id.toString()" :options="kode_saring" v-model="formDetail.saringan_id" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group label="Nomor Induk Kependudukan (NIK)" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.nik.$model" :state="!$v.formDetail.nik.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.nik.required">kolom <b>NIK</b> harus terisi</b-form-invalid-feedback>
                <b-form-invalid-feedback v-if="!$v.formDetail.nik.numeric">kolom <b>NIK</b> harus terisi huruf (Numerik)</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Disabilitas (1-5)" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.difabel" :options="kode_disabilitas" v-model="formDetail.difabel" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group label="Nomor Kartu Keluarga (NKK)" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.nkk.$model" :state="!$v.formDetail.nkk.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.nkk.required">kolom <b>NKK</b> harus terisi</b-form-invalid-feedback>
                <b-form-invalid-feedback v-if="!$v.formDetail.nkk.numeric">kolom <b>NKK</b> harus terisi angka (Numerik)</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Sumber Data" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.sumberdata" :options="kode_sumberdata" v-model="formDetail.sumberdata" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="Jenis Kelamin (L/P)" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.jenis_kelamin" :options="kode_jenis_kelamin" v-model="$v.formDetail.jenis_kelamin.$model" :state="!$v.formDetail.jenis_kelamin.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.jenis_kelamin.required">kolom <b>Kelamin</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col cols="3">
              <b-form-group label="Status Kawin (B/S/P)" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.kawin" :options="kode_kawin" v-model="$v.formDetail.kawin.$model" :state="!$v.formDetail.kawin.$error" />

                <b-form-invalid-feedback v-if="!$v.formDetail.kawin.required">kolom <b>Status</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group label="Status KTP-el" class="has-top-label">
                <v-select item-value="value" v-bind:placeholder="formDetail.ektp" :options="kode_ektp" v-model="$v.formDetail.ektp.$model" :state="!$v.formDetail.ektp.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.ektp.required">kolom <b>ektp</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="Tempat Lahir" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.tempat_lahir.$model" :state="!$v.formDetail.tempat_lahir.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.tempat_lahir.required">kolom <b>Tempat</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <b-col cols="3">
              <b-form-group label="Tanggal Lahir (YYYY-MM-DD)" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.tanggal_lahir.$model" :state="!$v.formDetail.tanggal_lahir.$error" />
                <b-form-invalid-feedback v-if="!$v.formDetail.tanggal_lahir.required">kolom <b>Tanggal</b> harus terisi</b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col cols="2">
              <b-form-group label="K1" class="has-top-label">
                <b-form-input
                  style="
                    font-size: 14px;
                    border: 1px solid rgb(226, 236, 191);
                    font-weight: bold;
                    background: rgb(250, 255, 230) none repeat scroll 0% 0%;
                  "
                  type="text"
                  v-model="formDetail.k1"
                />
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-form-group label="K2" class="has-top-label">
                <b-form-input
                  style="
                    font-size: 14px;
                    border: 1px solid rgb(226, 236, 191);
                    font-weight: bold;
                    background: rgb(250, 255, 230) none repeat scroll 0% 0%;
                  "
                  type="text"
                  v-model="formDetail.k2"
                />
              </b-form-group>
            </b-col>

            <b-col cols="2">
              <b-form-group label="K3" class="has-top-label">
                <b-form-input
                  disabled
                  style="
                    font-size: 14px;
                    border: 1px solid rgb(226, 236, 191);
                    font-weight: bold;
                    background: rgb(250, 255, 230) none repeat scroll 0% 0%;
                  "
                  type="text"
                  v-model="formDetail.k3"
                />
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col cols="3">
              <b-form-group label="ALAMAT" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.alamat.$model" :state="!$v.formDetail.alamat.$error" />
              </b-form-group>
            </b-col>
            <b-col cols="1">
              <b-form-group label="RW" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.rw.$model" :state="!$v.formDetail.rw.$error" />
              </b-form-group>
            </b-col>

            <b-col cols="1">
              <b-form-group label="RT" class="has-top-label">
                <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formDetail.rt.$model" :state="!$v.formDetail.rt.$error" />
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
          <b-spinner variant="primary" type="grow" label="Loading..."></b-spinner>
        </center>
      </div>
      <template slot="modal-footer">
        <b-button variant="primary" size="sm" @click="updateRecord()" class="mr-1">{{ $t("actions.edit") }}</b-button>
        <b-button variant="secondary" size="sm" @click="hideModal('modallookup')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>

    <b-modal size="xl" id="modalbaru" ref="modalbaru" :title="$t('titles.modal-baru')">
      <b-container class="bv-example-row">
        <b-row>
          <b-col>
            <b-form-group label="Nama Lengkap" class="has-top-label">
              <b-form-input
                style="
                  font-size: 14px;
                  border: 1px solid #eee;
                  font-weight: bold;
                "
                type="text"
                v-model="$v.formBaru.nama.$model"
                :state="!$v.formBaru.nama.$error"
              />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.nama.required"
                >-</span
              >
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group v-if="tpsReady" label="Tempat Pemungutan Suara (TPS)" class="has-top-label">
              <v-select item-value="value" :options="tps" v-bind:placeholder="selectedTps.label" v-model="$v.formBaru.tps.$model" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.tps.required"
                >-</span
              >
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group label="Nomor Induk Kependudukan (NIK)" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.nik.$model" :state="!$v.formBaru.nik.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.nik.required"
                >-</span
              >
              <b-form-invalid-feedback v-if="!$v.formBaru.nik.numeric">kolom <b>NIK</b> harus terisi huruf (Numerik)</b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Disabilitas (1-5)" class="has-top-label">
              <v-select item-value="value" :options="kode_disabilitas" v-model="formBaru.difabel" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-form-group label="Nomor Kartu Keluarga (NKK)" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.nkk.$model" :state="!$v.formBaru.nkk.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.nkk.required"
                >-</span
              >
              <b-form-invalid-feedback v-if="!$v.formBaru.nkk.numeric">kolom <b>NKK</b> harus terisi angka (Numerik)</b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Sumber Data" class="has-top-label">
              <v-select item-value="value" :options="kode_sumberdata" v-model="formBaru.sumberdata" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="3">
            <b-form-group label="Jenis Kelamin (L/P)" class="has-top-label">
              <v-select item-value="value" :options="kode_jenis_kelamin" v-model="$v.formBaru.jenis_kelamin.$model" :state="!$v.formBaru.jenis_kelamin.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.jenis_kelamin.required"
                >-</span
              >
            </b-form-group>
          </b-col>

          <b-col cols="3">
            <b-form-group label="Status Kawin (B/S/P)" class="has-top-label">
              <v-select item-value="value" :options="kode_kawin" v-model="$v.formBaru.kawin.$model" :state="!$v.formBaru.kawin.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.kawin.required"
                >-</span
              >
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group label="Status KTP-el" class="has-top-label">
              <v-select item-value="value" :options="kode_ektp" v-model="$v.formBaru.ektp.$model" :state="!$v.formBaru.ektp.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.ektp.required"
                >-</span
              >
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="3">
            <b-form-group label="Tempat Lahir" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.tempat_lahir.$model" :state="!$v.formBaru.tempat_lahir.$error" />
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.tempat_lahir.required"
                >-</span
              >
            </b-form-group>
          </b-col>

          <b-col cols="3">
            <b-form-group label="Tanggal Lahir (YYYY-MM-DD)" class="has-top-label">
              <datepicker :bootstrap-styling="true" label="Tanggal Lahir" v-model="$v.formBaru.tanggal_lahir.$model" :state="!$v.formBaru.tanggal_lahir.$error"></datepicker>
              <span
                style="
                  font-size: 20px;
                  color: red;
                  margin-left: 16px;
                  font-weight: bold;
                  margin-top: -40px;
                  position: absolute;
                "
                v-if="!$v.formBaru.tanggal_lahir.required"
                >-</span
              >
            </b-form-group>
          </b-col>
          <b-col cols="4">
            <b-form-group label="ALAMAT" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.alamat.$model" :state="!$v.formBaru.alamat.$error" />
            </b-form-group>
          </b-col>
          <b-col cols="1">
            <b-form-group label="RW" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.rw.$model" :state="!$v.formBaru.rw.$error" />
            </b-form-group>
          </b-col>

          <b-col cols="1">
            <b-form-group label="RT" class="has-top-label">
              <b-form-input style="border: 1px solid #eee; font-weight: bold" type="text" v-model="$v.formBaru.rt.$model" :state="!$v.formBaru.rt.$error" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row> </b-row>
      </b-container>
      <template slot="modal-footer">
        <b-button variant="primary" size="sm" @click="insertRecord()" class="mr-1">{{ $t("actions.new") }}</b-button>
        <b-button variant="secondary" size="sm" @click="hideModal('modalbaru')">{{ $t("actions.close") }}</b-button>
      </template>
    </b-modal>
    <!-- ----------------- end modal ------------------------ -->
    <div id="main">
      <b-modal id="modalright" ref="modalright" :title="$t('titles.filter')" modal-class="modal-right">
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
            style="
              color: rgba(58, 58, 58, 0.7);
              font-weight: 600;
              font-size: 94%;
            "
          >
            <datepicker :bootstrap-styling="true" label="Tanggal Lahir" v-model="filter.tanggalLahir"></datepicker>
          </b-form-group>
          <b-form-group
            label="Umur"
            style="
              color: rgba(58, 58, 58, 0.7);
              font-weight: 600;
              font-size: 94%;
            "
          >
            <vue-slider ref="slider" v-model="filter.umur" tooltip-dir="['bottom']" :piecewise="true" :data="sliderUmurData" :direction="direction"></vue-slider>
          </b-form-group>
          <b-row>
            <b-col cols="4">
              <b-form-group label="Kelamin" class="has-top-label">
                <v-select :options="kode_jenis_kelamin" v-model="filter.kelamin" />
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
                <v-select :options="kode_disabilitas" v-model="filter.difabel" />
              </b-form-group>
            </b-col>
            <b-col cols="4">
              <b-form-group label="KTP-el" class="has-top-label">
                <v-select :options="kode_ektp" v-model="filter.ektp" />
              </b-form-group>
            </b-col>

            <b-col cols="4">
              <b-form-group label="Sumber" class="has-top-label">
                <v-select :options="kode_sumberdata" v-model="filter.sumberdata" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-form-group label="Alamat" class="has-top-label">
            <b-form-input v-model="filter.alamat"></b-form-input>
          </b-form-group>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" v-model="filter.synced" />
            <label class="form-check-label" for="defaultCheck1">
              <span
                style="
                  color: rgba(58, 58, 58, 0.7);
                  font-weight: 600;
                  font-size: 94%;
                "
                ><i>Synced</i></span
              >
            </label>

            <input style="margin-left:30px" class="form-check-input" type="checkbox" value="" id="defaultCheck2" v-model="filter.ganda" />
            <label style="margin-left:50px" class="form-check-label" for="defaultCheck2">
              <span
                style="
                  color: rgba(58, 58, 58, 0.7);
                  font-weight: 600;
                  font-size: 94%;
                "
                ><i>Duplicated</i></span
              >
            </label>
          </div>
        </b-form>

        <template slot="modal-footer">
          <b-button variant="primary" size="sm" @click="reset()">{{ $t("actions.reset") }}</b-button>
          <b-button variant="secondary" size="sm" @click="filterFunc()">{{ $t("actions.filter") }}</b-button>
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
        @vuetable:row-dblclicked="onRowDoubleClicked"
        @vuetable:cell-dblclicked="onRowDoubleClicked"
      >
        <template slot="actions" slot-scope="props">
          <b-form-checkbox :checked="selectedItems.includes(props.rowData.id)" class="itemCheck mb-0"></b-form-checkbox>
        </template>
      </vuetable>
      <vuetable-pagination-bootstrap ref="pagination" @vuetable-pagination:change-page="onChangePage" style="margin-bottom:2px" />
      <br />
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

      <v-contextmenu-item @click="onContextMenuAction('resolve')">
        <i class="simple-icon-reload" />
        <span>{{ $t("actions.resolve") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('delete')">
        <i class="simple-icon-fire" />
        <span>{{ $t("actions.delete") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring1')">
        <i class="simple-icon-ban" style="color: red" />
        <span>{{ $t("actions.saring1") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring2')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring2") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring3')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring3") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring4')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring4") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring5')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring5") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring6')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring6") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring7')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring7") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring8')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring8") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring9')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring9") }}</span>
      </v-contextmenu-item>

      <v-contextmenu-item @click="onContextMenuAction('saring10')">
        <span style="margin-left: 25px !important">{{ $t("actions.saring10") }}</span>
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
      sliderUmurData: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 80],
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
        ganda: "",
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
      defaultLimit: 200,
      perPage: 50,
      curPage: 1,
      filterQuery: {},
      formDetail: {},
      formBaru: {
        nama: "",
        nik: "",
        nkk: "",
        tps: "",
        tanggal_lahir: "",
        tempat_lahir: "",
        jenis_kelamin: "",
        kawin: "",
        difabel: "0",
        ektp: "s",
        sumberdata: "baru",
        synced: "",
        alamat: "",
        rw: "",
        rt: ""
      },
      kecamatan: [],
      kelurahan: [],
      isValidJwt: false,
      isInetOn: false,
      lastUsed: "",
      jwt: "",
      tps: [],
      tpsReady: false,
      kelurahanReady: false,
      currentSelectedRecord: "",
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
      },
      dateFormat: "yyyy-MM-dd",
      warningAfterSyncStatus: false,
      warningAfterSync: {},
      prepare_id: "0"
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
      tps_id: {
        required,
        numeric
      },
      tps: {
        numeric
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
    },
    formBaru: {
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
      tps_id: {
        required,
        numeric
      },
      tps: {
        numeric
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
    showFilter() {
      this.$refs["modalwarningtps"].hide()
      this.$refs["modalright"].show()
    },
    analisisK1() {
      ipc.send("analisisK1", "")
      this.$toast.error("Be patient, analyzing duplicated data (K1)", {
        position: "bottom-right",
        duration: 0
      })

      ipc.once("analisisK1Result", async (event, result) => {
        this.$toast.clear()
        this.$toast.error(result, {
          position: "bottom-right",
          duration: 3000
        })
      })
    },

    analisisK2() {
      ipc.send("analisisK2", "")
      this.$toast.error("Be patient, analyzing duplicated data (K2)", {
        position: "bottom-right",
        duration: 0
      })

      ipc.once("analisisK2Result", async (event, result) => {
        this.$toast.clear()
        this.$toast.error(result, {
          position: "bottom-right",
          duration: 3000
        })
      })
    },

    analisisK3() {
      ipc.send("analisisK3", "")
      this.$toast.error("Be patient, analyzing duplicated data (K3)", {
        position: "bottom-right",
        duration: 0
      })

      ipc.once("analisisK3Result", async (event, result) => {
        this.$toast.clear()
        this.$toast.error(result, {
          position: "bottom-right",
          duration: 3000
        })
      })
    },

    async savecsv() {
      this.$toast.error("Please wait, generating csv ..", {
        position: "bottom-right",
        duration: 0
      })
      const { dialog } = require("electron").remote
      var fs = require("fs")

      var options = {
        title: "Save file",
        defaultPath: "newfile.csv",
        buttonLabel: "Save",

        filters: [
          { name: "csv", extensions: ["csv"] },
          { name: "All Files", extensions: ["*"] }
        ]
      }

      let paramObj = this.filterQuery
      ipc.send("getPemilihCsv", paramObj)
      ipc.once("getPemilihCsvResult", async (event, result) => {
        var str = ""
        result.forEach((result) => {
          var line = ""
          let x = Object.values(result)
          for (var index in x) {
            if (line !== "") line += "#"

            line += x[index]
          }
          str += line + "\r\n"
        })

        dialog.showSaveDialog(null, options).then(({ filePath }) => {
          fs.writeFileSync(filePath, str, "utf-8")
        })
        this.$toast.clear()
      })
    },

    reset() {
      localStorage.removeItem("selectedKecamatan")
      localStorage.removeItem("selectedKelurahan")

      this.kelurahanReady = false
      this.tpsReady = false
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
      this.filter.ganda = ""
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
    },
    showModal(refname) {
      this.$refs[refname].show()
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
        localStorage.setItem("selectedKecamatan", JSON.stringify(this.selectedKecamatan))
        localStorage.removeItem("selectedKelurahan")
        this.currentWil.workinglevel = "kecamatan"
        this.currentWil.workingspace = this.selectedKecamatan.label
        this.currentWil.id = this.selectedKecamatan.value
        this.filterQuery.kec_id = this.selectedKecamatan.value
      }

      if (this.selectedKelurahan.value) {
        localStorage.setItem("selectedKelurahan", JSON.stringify(this.selectedKelurahan))
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
        let year = this.filter.tanggalLahir.getFullYear()
        let month = this.filter.tanggalLahir.getMonth() + 1
        let dt = this.filter.tanggalLahir.getDate()

        if (dt < 10) {
          dt = "0" + dt
        }
        if (month < 10) {
          month = "0" + month
        }
        this.filterQuery.tanggal_lahir = year + "-" + month + "-" + dt
      }
      if (this.filter.kelamin !== "") {
        this.filterQuery.jenis_kelamin = this.filter.kelamin.trim()
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
      }
      if (this.filter.ganda === true) {
        this.filterQuery.ganda = "all"
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
      if (page === "rekapitulasi-page") {
        this.$router.push({ name: "rekapitulasi-page" }).catch((err) => {
          console.log(err.length)
        })
      }
    },
    makeQueryParams(sortOrder, currentPage, perPage) {
      this.selectedItems = []
      return sortOrder[0]
        ? {
            sort: sortOrder[0] ? sortOrder[0].field + "|" + sortOrder[0].direction : "",
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
    onRowDoubleClicked(dataItem, index) {
      let id = dataItem.id
      let filter = this.filterQuery
      filter.id = id
      ipc.send("getPemilihById", filter)
      ipc.once("getPemilihByIdResult", async (event, result) => {
        this.detailready = true
        this.formDetail = result[0]
        await this.getTps(this.formDetail.kel_id)
        this.$refs["modallookup"].show()
        delete this.filterQuery.id
      })
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
        var end = this.getIndex(this.selectedItems[this.selectedItems.length - 1], itemsForToggle, "id")
        itemsForToggle = itemsForToggle.slice(Math.min(start, end), Math.max(start, end) + 1)
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
      this.currentSelectedRecord = dataItem
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
      if (action === "delete") {
        this.deleteSelected()
      }
      if (action === "edit") {
        let id = this.selectedItems[0]
        let filter = this.filterQuery
        filter.id = id
        ipc.send("getPemilihById", filter)
        ipc.once("getPemilihByIdResult", async (event, result) => {
          this.detailready = true
          this.formDetail = result[0]
          await this.getTps(this.formDetail.kel_id)
          this.$refs["modallookup"].show()
          delete this.filterQuery.id
        })
      }
      if (action === "resolve") {
        let id = this.currentSelectedRecord.dp_id
        this.resolve(id)
      }
    },
    saringSelected(kode) {
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })
      let data = {}
      data.id = this.selectedItems
      data.term = { saringan_id: kode, synced: true }

      ipc.send("updatePemilihByTerm", data)
      ipc.once("updatePemilihByTermResult", async (event, result) => {
        this.$toast.clear()
        this.hideModal("modallookup")
        this.onChangePage()
      })
    },

    deleteSelected() {
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })
      ipc.send("deletePemilihByTerm", this.selectedItems)
      ipc.once("deletePemilihByTermResult", async (event, result) => {
        this.$toast.clear()
        this.hideModal("modallookup")
        this.onChangePage()
      })
    },

    async showInsertRecord() {
      if (this.selectedKelurahan.value) {
        this.$refs["modalbaru"].show()
      } else {
        this.$refs["modalwarningtps"].show()
      }
    },
    async insertRecord() {
      this.$v.formBaru.$touch()
      let dataToInsert = this.formBaru
      dataToInsert.kec_id = this.selectedKecamatan.value
      dataToInsert.kel_id = this.selectedKelurahan.value
      dataToInsert.tps_id = this.selectedTps.value
      dataToInsert.tps = this.selectedTps.label
      dataToInsert.k1 = 0
      dataToInsert.k2 = 0
      dataToInsert.k3 = 0
      dataToInsert.saringan_id = 0
      dataToInsert.status = "aktif"

      dataToInsert.synced = true
      let year = dataToInsert.tanggal_lahir.getFullYear()
      let month = dataToInsert.tanggal_lahir.getMonth() + 1
      let dt = dataToInsert.tanggal_lahir.getDate()

      if (dt < 10) {
        dt = "0" + dt
      }
      if (month < 10) {
        month = "0" + month
      }
      dataToInsert.tanggal_lahir = year + "-" + month + "-" + dt

      ipc.send("savePemilih", dataToInsert)
      ipc.once("savePemilihResult", async (event, result) => {
        this.$toast.error(result, {
          position: "bottom-right",
          duration: 3000
        })

        this.formBaru.nama = ""
        this.formBaru.nik = ""
        this.formBaru.nkk = ""
        this.formBaru.tanggal_lahir = ""
        this.formBaru.tempat_lahir = ""
        this.formBaru.jenis_kelamin = ""
        this.formBaru.kawin = ""
        this.formBaru.difabel = ""
        this.formBaru.ektp = "s"
        this.formBaru.difabel = "0"
        this.formBaru.sumberdata = "baru"
        this.formBaru.alamat = ""
        this.formBaru.rt = ""
        this.formBaru.rw = ""

        this.$refs["modalbaru"].hide()
        this.onChangePage()
      })
    },

    async updateRecord() {
      this.$v.formDetail.$touch()
      let data = this.formDetail
      let tps = data.tps
      data.tps_id = tps.value
      data.tps = tps.label
      data.synced = true
      ipc.send("updatePemilihById", data)
      ipc.once("updatePemilihByIdResult", async (event, result) => {
        delete this.filterQuery.id
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

      console.log(this.selectedItems)
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
    async prepareSync() {
      this.jwt = JSON.parse(localStorage.jwt)
      let date = new Date()
      let keterangan = "Oleh : " + this.username + ", actiontDate : " + date
      await axios({
        url: apiUrl,
        method: "post",
        headers: {
          Authorization: "Bearer " + this.jwt
        },
        data: {
          query:
            `mutation {
              prepare(keterangan : "` +
            keterangan +
            `") {
                id,
                keterangan,
              }
            }
          `
        }
      }).then((result) => {
        if (result.data.data.prepare) {
          const userData = result.data.data.prepare
          console.log(userData)
          localStorage.setItem("prepare_id", JSON.stringify(userData.id))
        }
      })
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
          localStorage.setItem("wilayah_id", JSON.stringify(userData.wilayah_id))
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
    async resolve(id) {
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })
      this.$refs.topProgress.start()
      let param = "id:" + id
      let paramObj = { dp_id: id }

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
              query:
                `
                    {
                    coklits (` +
                param +
                `){
                      id,
                      arsip_id,
                      master_id,
                      sync_id,
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
              console.log(hasil)
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
              this.$toast.clear()
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
    async pull() {
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })
      this.$refs.topProgress.start()
      let param = ""
      let paramObj = {}

      if (this.currentWil.workinglevel === "kelurahan") {
        param = "kel_id:" + this.currentWil.id
        paramObj.kel_id = this.currentWil.id
      }
      if (this.currentWil.workinglevel === "kecamatan") {
        this.$refs.topProgress.done()
        this.$toast.error("Silahkan pilih wilayah sampai tingkat Kelurahan/Desa atau TPS untuk unduh pemilih", {
          position: "bottom-right",
          duration: 3000
        })
      }
      let validate = await this.validate()
      this.jwt = JSON.parse(localStorage.jwt)
      this.lastUsed = localStorage.lastUsed
      let endDate = new Date()
      let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)

      // only valid your internet connection and jwt
      if (validate === "VALID" && this.currentWil.workinglevel !== "kecamatan") {
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
                      sync_id,
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

              this.$toast.clear()
              this.$refs.topProgress.done()
            } else {
              this.$toast.clear()
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
      this.$toast.error("Please wait ...", {
        position: "bottom-right",
        duration: 0
      })

      this.$refs.topProgress.start()
      this.warningAfterSyncStatus = false
      let paramObj = this.filterQuery
      paramObj.limit = 1000
      paramObj.synced = true
      if (this.selectedKecamatan.value) {
        paramObj.kec_id = this.selectedKecamatan.value
      }

      if (this.selectedKelurahan.value) {
        paramObj.kel_id = this.selectedKelurahan.value
      }

      if (this.selectedTps.value) {
        paramObj.kel_id = this.selectedKelurahan.value
        paramObj.tps_id = this.selectedTps.value
      }

      let validate = await this.validate()
      this.jwt = JSON.parse(localStorage.jwt)
      this.lastUsed = localStorage.lastUsed
      if (localStorage.prepare_id) {
        this.prepare_id = JSON.parse(localStorage.prepare_id)
      } else {
        await this.prepareSync()
      }
      let endDate = new Date()
      let seconds = Math.ceil((endDate.getTime() - this.lastUsed) / 1000)
      let prepareId = parseInt(this.prepare_id)

      ipc.send("getPemilihForSync", paramObj)
      ipc.once("getPemilihForSyncResult", async (event, result) => {
        result.forEach((result) => {
          let tgl = result.tanggal_lahir.split("-")
          result.tanggal_lahir = tgl[2] + "|" + tgl[1] + "|" + tgl[0]
          result.tps = result.tps.toString()
        })
        let dataToImport = { prepare_id: prepareId, items: result }
        dataToImport = JSON.stringify(dataToImport)
        dataToImport = dataToImport.replace("{", "")
        dataToImport = dataToImport.slice(0, -1)
        dataToImport = dataToImport.replace(/"([^"]+)":/g, "$1:")

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
                query:
                  `
                mutation {import (` +
                  dataToImport +
                  `){
                      countSuccess,
                      countError,
                      itemSuccess   {
                        local_id,
                        sync_id,
                        dpid
                      },
                      itemError  {
                        local_id,
                        dpid,
                        nama,
                        nik,
                        nkk,
                        sync_id,
                        status
                      }
                    }
                  }
                `
              }
            }).then((result) => {
              if (result.data.data.import) {
                let hasil = result.data.data.import
                let message = "SYNC : " + hasil[0].countSuccess + ", Failed : " + hasil[0].countError
                this.$toast.error(message, {
                  position: "bottom-right",
                  duration: 7000
                })

                if (hasil[0].countSuccess !== 0) {
                  let success = hasil[0].itemSuccess
                  let successId = []
                  success.forEach((success) => {
                    let container = {}
                    container.id = success.local_id
                    container.dp_id = success.dpid
                    container.sync_id = success.sync_id
                    successId.push(container)
                  })

                  ipc.send("updatePemilihByTermPerItem", successId)
                }

                if (hasil[0].countError !== 0) {
                  this.warningAfterSync = hasil[0].itemError
                  this.warningAfterSyncStatus = true
                  this.showModal("modalwarningaftersync")
                }

                delete this.filterQuery.id
                delete this.filterQuery.synced

                this.filterQuery.limit = this.perPage

                this.$nextTick(() => {
                  this.$refs.vuetable.reload()
                })
                this.$toast.clear()
                this.$refs.topProgress.done()
              } else {
                this.$toast.clear()
                this.$refs.topProgress.done()
                let message = result.data.errors[0].message
                this.$toast.error(message, {
                  position: "bottom-right",
                  duration: 10000
                })
              }
            })
          }
        }
      })

      this.$refs.topProgress.done()
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
    }
  },
  created() {
    this.getWilayah(3, this.wilayahId)
    this.filterQuery.limit = this.perPage
    this.currentWil.workinglevel = "kabupaten"
    this.currentWil.workingspace = JSON.parse(localStorage.username).toUpperCase()
    this.currentWil.id = this.wilayahId

    if (localStorage.getItem("selectedKecamatan") !== null) {
      this.selectedKecamatan = JSON.parse(localStorage.selectedKecamatan)
      this.currentWil.workinglevel = "kecamatan"
      this.currentWil.workingspace = this.selectedKecamatan.label.toUpperCase()
      this.filterQuery.kec_id = this.selectedKecamatan.value
      this.currentWil.id = this.selectedKecamatan.value
    }

    if (localStorage.getItem("selectedKelurahan") !== null) {
      this.selectedKelurahan = JSON.parse(localStorage.selectedKelurahan)
      this.currentWil.workinglevel = "kelurahan"
      this.currentWil.workingspace = this.selectedKecamatan.label + " ⇌ " + this.selectedKelurahan.label
      this.filterQuery.kel_id = this.selectedKelurahan.value
      this.currentWil.id = this.selectedKelurahan.value
    }
  }
}
</script>
