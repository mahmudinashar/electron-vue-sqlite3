<template>
  <div id="app">

    <b-modal size="lg"  id="modalsetting" ref="modalsetting" :title="$t('modals.setting')" dismiss="modal">
        <b-container class="bv-example-row">
          <b-row>
            <b-col cols="12">
              <b-form-group label="Username" class="has-top-label">
                  <b-form-input style="font-size:14px;" v-model="username" type="text"  />
              </b-form-group>
            </b-col>

            <b-col cols="12">
              <b-form-group label="Password" class="has-top-label">
                  <b-form-input style="font-size:14px;" v-model="password" type="text" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
        
       
       <template slot="modal-footer">
          <b-button size="sm" @click="saveSetting()">{{$t('actions.save')}}</b-button>
          <b-button size="sm" variant="secondary" @click="hideModal('modalsetting')">{{$t('actions.close')}}</b-button>
        </template>
     </b-modal>

    <router-view />
    <app-footer></app-footer>
  </div>
</template>

<script>
  import AppFooter from "./components/Common/AppFooter"
  const electron = require("electron")
  const ipc = electron.ipcRenderer

  export default {
    name: "Electron-Vue-Sqlite3",
    components: {
      AppFooter
    },
    data () {
      return {
        title: "Main Application",
        syncHistoryReady: false,
        username: "",
        password: ""
      }
    },

    methods: {
      hideModal (refname) {
        this.$refs[refname].hide()
      },

      saveSetting () {
        this.$refs["modalsetting"].hide()
        ipc.send("saveSetting", {"username": this.username, "password": this.password})
      }
    },
    mounted () {
      ipc.on("pageMenu", (event, page) => {
        if (page === "about") {
          this.$router.push({ name: "about-page" })
        }
        if (page === "home") {
          this.$router.push({ name: "home-page" })
        }
        if (page === "setting") {
          this.$refs["modalsetting"].show()
        }
        if (page === "wilayah") {
          this.$router.push({ name: "wilayah-page" })
        }
      })
    }
  }
</script>