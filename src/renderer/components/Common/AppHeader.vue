<template>
  <div id="header">
     <b-button size="sm" @click="routeTo('home-page')"><span class="simple-icon-crop" style="margin-right:10px;margin-left:-2px"></span>New</b-button>
     <b-button class="inactive-botton" size="sm" @click="routeTo('about-page')">About</b-button>

    <div style="float : right">
     <b-dropdown class="inactive-botton" size="sm" right text="Save">
        <b-dropdown-item>Save As</b-dropdown-item>
        <b-dropdown-item>Save</b-dropdown-item>
      </b-dropdown>

      <b-button class="inactive-botton" size="sm" ><span class="simple-icon-event" style="color:#FFFFFF;"></span></b-button>

      </div>   

    
  </div>
</template>

<script>
  export default {
    data () {
      return {
        title: "header"
      }
    },
    methods: {
      routeTo (page) {
        if (page === "about-page") {
          this.$router.push({ name: "about-page" })
        }
        if (page === "home-page") {
          this.$router.push({ name: "home-page" })
        }
      }
    }
  }
</script>