<template>
  <div id="footer" class="right">
      <div style="text-align:left">
        <span class="simple-icon-refresh" style="position:relative;"></span>
        <span style="margin-left:5px;margin-right:15px;font-size:12px;bottom:2px;position:relative;color:red">Offine</span>

        <span class="simple-icon-layers" style="position:relative;"></span>
        <span style="margin-left:5px;font-size:12px;bottom:2px;position:relative;color:#444">{{sqlitePath}}</span>
      </div>
    </div>
</template>

<script>
  const electron = require("electron")
  const userDataPath = (electron.app || electron.remote.app).getPath(
    "userData"
  )

  export default {
    data () {
      return {
        title: "footer",
        sqlitePath: userDataPath
      }
    }
  }
</script>