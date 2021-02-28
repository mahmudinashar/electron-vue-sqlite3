<template>
  <div id="header">
     <b-button size="sm" @click="routeTo('home-page')"><span class="simple-icon-crop" style="margin-right:10px;margin-left:-2px"></span>{{$t('actions.new')}}</b-button>
     <b-button class="inactive-botton" size="sm" @click="routeTo('about-page')">{{$t('actions.about')}}</b-button>

    <div style="float : right">
     <b-dropdown class="inactive-botton" size="sm" right text="Save">
        <b-dropdown-item>{{$t('operation.save-as')}}</b-dropdown-item>
        <b-dropdown-item>{{$t('operation.save')}}</b-dropdown-item>
      </b-dropdown>

      <b-button class="inactive-botton" size="sm" @click="routeTo('wilayah-page')"><span class="simple-icon-organization" style="color:#FFFFFF;"></span></b-button>
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
        if (page === "wilayah-page") {
          this.$router.push({ name: "wilayah-page" })
        }
      }
    }
  }
</script>