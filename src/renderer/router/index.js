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
      path: "/rekapitulasi",
      name: "rekapitulasi-page",
      component: require("@/components/RekapitulasiPage").default
    },
    {
      path: "/home",
      name: "home-page",
      component: require("@/components/HomePage").default
    },
    {
      path: "/",
      name: "root-page",
      component: require("@/components/RootPage").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
})
