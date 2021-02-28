import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "home-page",
      component: require("@/components/HomePage").default
    },
    {
      path: "/wilayah",
      name: "wilayah-page",
      component: require("@/components/WilayahPage").default
    },
    {
      path: "/about",
      name: "about-page",
      component: require("@/components/AboutPage").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
})
