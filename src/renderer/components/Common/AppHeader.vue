<template>
  <div id="header">
     <b-button size="sm" ><span class="simple-icon-crop" style="margin-right:10px;margin-left:-2px"></span>New</b-button>
     <b-button class="inactive-botton" size="sm" >Import</b-button>
     <b-button class="inactive-botton" size="sm" ><span class="simple-icon-equalizer" style="color:#FFFFFF;"></span></b-button>

    <div style="float : right">
     <b-dropdown class="inactive-botton" size="sm" right text="Save">
        <b-dropdown-item>Save As</b-dropdown-item>
        <b-dropdown-item>Save</b-dropdown-item>
      </b-dropdown>
      </div>       
  </div>
</template>

<script>
  export default {
    data () {
      return {
        title: "header"
      }
    }
  }
</script>