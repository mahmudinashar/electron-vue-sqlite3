import "./assets/css/vendor/bootstrap.min.css"
// import "bootstrap-vue/dist/bootstrap-vue.css"

let render = () => {
  import("./assets/css/sass/piaf.light.greenlime.scss").then(() =>
    require("./load")
  )
}

render()
