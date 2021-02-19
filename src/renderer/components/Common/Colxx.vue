<template>
    <b-col :class="classes" v-bind="options">
        <slot></slot>
    </b-col>
</template>
<script>
export default {
  props: ["xxs", "xs", "sm", "md", "lg", "xl", "xxl", "offset-sm", "offset-md", "offset-lg", "offset-xl", "order-sm", "order-md", "order-lg", "order-xl", "tag", "col", "cols", "offset", "order", "align-self", "offset-xxs", "offset-xxl", "order-xxs", "order-xxl"
  ],
  data () {
    return {
      options: {},
      classes: {}
    }
  },
  mounted () {
    let cols = {}
    let customClass = {}

    for (var p in this.$props) {
      if (this.$props[p]) {
        if (p === "xxs" || p === "cols") {
          customClass = { ...customClass, ["col-" + this.$props[p]]: true }
        } else if (p === "xs") {
          customClass = { ...customClass, ["col-xs-" + this.$props[p]]: true }
        } else if (p === "xxl") {
          customClass = { ...customClass, ["col-xxl-" + this.$props[p]]: true }
        } else if (p === "offsetXxs") {
          customClass = { ...customClass, ["offset-" + this.$props[p]]: true }
        } else if (p === "offsetXxl") {
          customClass = { ...customClass, ["offset-xxl-" + this.$props[p]]: true }
        } else if (p === "orderXxs") {
          customClass = { ...customClass, ["order-" + this.$props[p]]: true }
        } else if (p === "orderXxl") {
          customClass = { ...customClass, ["order-xxl-" + this.$props[p]]: true }
        } else {
          cols = { ...cols, [p]: this.$props[p] }
        }
      }
    }
    this.options = { ...cols }
    this.classes = { ...customClass }
  }
}
</script>
