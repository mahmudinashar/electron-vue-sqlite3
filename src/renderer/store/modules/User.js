import { apiUrl, version } from "../../constants/config"
import axios from "axios"

export default {
  state: {
    currentUser:
      localStorage.getItem("user") != null
        ? JSON.parse(localStorage.getItem("user"))
        : null
  },
  getters: {
    currentUser: (state) => state.currentUser
  },
  mutations: {
    setUser (state, payload) {
      state.currentUser = payload
      state.processing = false
      state.loginError = null
    },
    setProcessing (state, payload) {
      state.processing = payload
      state.loginError = null
    },
    setError (state, payload) {
      state.loginError = payload
      state.currentUser = null
      state.processing = false
    },
    clearError (state) {
      state.loginError = null
    }
  },
  actions: {
    test () {
      console.log("test")
    },

    login ({ commit }, payload) {
      commit("clearError")
      commit("setProcessing", true)
      axios({
        url: apiUrl,
        method: "post",
        data: {
          query: `
              {
                authenticate(
                    username : "` + payload.username + `",
                    password : "` + payload.password + `", 
                    deviceId:"123",
                    version:"` + version + `",
                    ) {
                      id,
                      portal,
                      username,
                      role,
                      phone,
                      nik,
                      email,
                      change,
                      tps_id,
                      wilayah_id,
                      domain,
                      avatar,
                      tempatLahir,
                      tanggalLahir,
                      jwt,
                      fullname,
                      countKab,
                      countKec,
                      countKel,
                      countTps
                  }
              }
              `
        }
      }).then((result) => {
        if (result.data.data.authenticate) {
          // success
          const userData = result.data.data.authenticate

          console.log(userData)
          const item = { uid: userData.jwt, ...userData }
          localStorage.setItem("user", JSON.stringify(item))
          commit("setUser", { uid: userData.jwt, ...userData })
        } else {
          // error
          localStorage.removeItem("user")
          commit("setError", result.data.errors[0].message)
          setTimeout(() => {
            commit("clearError")
          }, 3000)
        }
      })
    }
  }
}
