import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/coklit",
      name: "coklit-page",
      component: require("@/components/CoklitPage").default
    },
    {
      path: "/import",
      name: "import-page",
      component: require("@/components/ImportPage").default
    },
    {
      path: "/wilayah",
      name: "wilayah-page",
      component: require("@/components/WilayahPage").default
    },
    {
      path: "/",
      name: "about-page",
      component: require("@/components/AboutPage").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
})
