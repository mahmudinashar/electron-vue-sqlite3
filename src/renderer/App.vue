<template>
  <div id="app">
    <app-header></app-header>
    <router-view />
    <app-footer></app-footer>
  </div>
</template>

<script>
  import AppHeader from "./components/Common/AppHeader"
  import AppFooter from "./components/Common/AppFooter"
  const electron = require("electron")
  const ipc = electron.ipcRenderer

  export default {
    name: "Electron-Vue-Sqlite3",
    components: {
      AppHeader, AppFooter
    },
    data () {
      return {
        title: "Main Application"
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
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
      })
    }
  }
</script>