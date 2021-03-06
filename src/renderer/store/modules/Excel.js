export default {
  state: {
    excelData: null,
    yes: "oke"
  },
  getters: {
    excelData: (state) => state.excelData,
    yes: (state) => state.yes
  },
  mutations: {
    setExcel(state, payload) {
      console.log("disini")
      state.excelData = payload
    }
  },
  actions: {
    test() {
      console.log("test")
    }
  }
}
