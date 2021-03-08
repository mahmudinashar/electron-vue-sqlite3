<template>
  <div id="main">
    <center>
      <b-row class="icon-cards-row" style="margin-top:22px">
        <b-col class="icon-row-item" cols="2">
          <b-card class="text-center">
            <i class="simple-icon-check" />
            <p class="card-text font-weight-semibold mb-0">Username</p>
            <p class="lead text-center font-weight-bold" style="text-transform: uppercase">{{ currentUser.username }}</p>
          </b-card>
        </b-col>
        <b-col class="icon-row-item" cols="2">
          <b-card class="mb-4 text-center">
            <i class="iconsminds-male" />
            <p class="card-text font-weight-semibold mb-0">Laki-laki</p>
            <p class="lead text-center font-weight-bold">-</p>
          </b-card>
        </b-col>
        <b-col class="icon-row-item" cols="2">
          <b-card class="mb-4 text-center">
            <i class="iconsminds-female" />
            <p class="card-text font-weight-semibold mb-0">Perempuan</p>
            <p class="lead text-center font-weight-bold">-</p>
          </b-card>
        </b-col>
        <b-col class="icon-row-item" cols="2">
          <b-card class="mb-4 text-center">
            <i class="iconsminds-shop" />
            <p class="card-text font-weight-semibold mb-0">Kecamatan</p>
            <p class="lead text-center font-weight-bold">{{ currentUser.countKec }}</p>
          </b-card>
        </b-col>
        <b-col class="icon-row-item" cols="2">
          <b-card class="mb-4 text-center">
            <i class="iconsminds-shop-4" />
            <p class="card-text font-weight-semibold mb-0">Kelurahan</p>
            <p class="lead text-center font-weight-bold">{{ currentUser.countKel }}</p>
          </b-card>
        </b-col>
        <b-col class="icon-row-item" cols="2">
          <b-card class="mb-4 text-center">
            <i class="iconsminds-map-marker-2" />
            <p class="card-text font-weight-semibold mb-0">Tps</p>
            <p class="lead text-center font-weight-bold">{{ currentUser.countTps }}</p>
          </b-card>
        </b-col>
      </b-row>
    </center>
  </div>
</template>

<script>
import SystemInformation from "./HomePage/SystemInformation"
const electron = require("electron")
const userDataPath = (electron.app || electron.remote.app).getPath("userData")

export default {
  name: "home-page",
  data() {
    return {
      data: "HomePage",
      sqlitePath: userDataPath,
      currentUser: {
        username: "-",
        l: "-",
        p: "-",
        countKec: "-",
        countKel: "-",
        countTps: "-"
      }
    }
  },
  components: { SystemInformation },
  mounted() {
    if (localStorage.getItem("currentUser") !== null) {
      this.currentUser = JSON.parse(localStorage.currentUser)
    } else {
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}
</style>
