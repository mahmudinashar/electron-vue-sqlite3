import Vue from "vue"
import axios from "axios"

import App from "./App"
import router from "./router"
import store from "./store"
import Colxx from "./components/Common/Colxx"
import BootstrapVue from "bootstrap-vue"
import VueToast from "vue-toast-notification"
import "./assets/css/vendor/toast.css"

import {
  defaultLocale,
  localeOptions
} from "./constants/config"

import id from "./locales/id.json"
import VueI18n from "vue-i18n"

Vue.use(VueI18n)
Vue.use(BootstrapVue)
Vue.use(VueToast)

const messages = { id: id }
const locale =
  localStorage.getItem("currentLanguage") &&
  localeOptions.filter((x) => x.id === localStorage.getItem("currentLanguage"))
    .length > 0
    ? localStorage.getItem("currentLanguage")
    : defaultLocale

const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: "id",
  messages
})

Vue.component("b-colxx", Colxx)

if (!process.env.IS_WEB) Vue.use(require("vue-electron"))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  i18n,
  router,
  store,
  template: "<App/>"
}).$mount("#app")
