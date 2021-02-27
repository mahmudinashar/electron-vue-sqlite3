<template>
<div>
  <app-header></app-header>
  <div id="main">
    <code>your script goes here</code>
  </div>
</div>
</template>

<script>
  import AppHeader from "./Common/AppHeader"

  export default {
    name: "home-page",
    components: {
      AppHeader
    },
    data () {
      return {
        data: "HomePage"
      }
    }
  }
</script>